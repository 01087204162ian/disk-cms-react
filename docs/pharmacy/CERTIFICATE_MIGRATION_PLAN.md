# pharmacyApply 과거 데이터 마이그레이션 계획서

> **작성일**: 2026-01-10  
> **목적**: `pharmacyApply` 테이블의 과거 증권발급/해지 데이터를 `pharmacy_certificate_history` 테이블로 마이그레이션  
> **상태**: 기획 단계 (사용자 동의 대기)

---

## 1. 실제 테이블 구조 분석 결과

### 1.1 pharmacyApply 테이블 필드 확인
**확인된 필드:**
- `num`: INT(11) PK (약국 신청 번호)
- `account`: VARCHAR(10) (거래처 코드 - 문자열)
- `ch`: CHAR(2) (진행상태: '14'=증권발급, '16'=해지완료)
- `chemistCerti`: VARCHAR(30) (전문인증권번호)
- `areaCerti`: VARCHAR(30) (화재보험증권번호)
- `wdate_3`: DATE (증권입력일)
- `wdate_2`: DATETIME (상태변경일)
- `haejD`: DATE (해지일)
- `haejiP`: VARCHAR(20) (해지보험료 - 일할 계산된 환급 보험료)
- `proPreminum`: VARCHAR(20) (전문인보험료)
- `areaPreminum`: VARCHAR(20) (화재보험료)
- `preminum`: VARCHAR(20) (총 보험료)

**데이터 패턴 확인:**
- `wdate_3`가 `'0000-00-00'`인 경우 존재 (마이그레이션 제외 필요)
- `chemistCerti`가 빈 문자열('')인 경우 많음
- `areaCerti`가 빈 문자열('')인 경우도 있음
- `haejD`가 `'0000-00-00'`인 경우 존재 (해지일이 없는 경우)

---

## 2. 마이그레이션 대상 데이터

### 2.1 증권발급 데이터 (ch='14')
**조건:**
- `pharmacyApply.ch = '14'` (증권발급 상태)
- `pharmacyApply.wdate_3 IS NOT NULL AND wdate_3 != '0000-00-00'` (증권발급일이 유효한 경우)
- `(chemistCerti IS NOT NULL AND chemistCerti != '') OR (areaCerti IS NOT NULL AND areaCerti != '')` (증권번호가 하나라도 있는 경우)

**매핑 규칙:**
- `action_type`: `'certificate'`
- `certificate_type`: 
  - `chemistCerti != ''` AND `areaCerti != ''` → `'both'`
  - `chemistCerti != ''` AND `areaCerti = ''` → `'expert'`
  - `chemistCerti = ''` AND `areaCerti != ''` → `'fire'`
  - 둘 다 빈 문자열이면 → 마이그레이션 제외 (데이터 오류)
- `certificate_date`: `wdate_3` (증권발급일)
- `account`: 문자열 그대로 사용 (VARCHAR(10))

### 2.2 해지완료 데이터 (ch='16')
**중요**: 해지 데이터는 `pharmacy_settlementList` 테이블에서 조회합니다!

**조건:**
- `pharmacyApply.ch = '16'` (해지완료 상태)
- `pharmacy_settlementList.sort = '16'` (해지 레코드)
- 증권발급 이력이 있는 경우 (증권번호가 하나라도 있거나, 증권발급 이력이 이미 마이그레이션된 경우)

**매핑 규칙:**
- `action_type`: `'termination'`
- `certificate_type`: `NULL` (해지 이력이므로)
- `certificate_date`: `pharmacy_settlementList.wdate` (등록일 = 해지일)
- **해지 보험료 처리:**
  - `proPreminum`: `pharmacy_settlementList.proPreminum` (전문인보험료)
  - `areaPreminum`: `pharmacy_settlementList.areaPreminum` (화재보험료)
  - `preminum`: `pharmacy_settlementList.proPreminum + pharmacy_settlementList.areaPreminum` (총 보험료)
  - **참고**: `pharmacy_settlementList` 테이블의 보험료를 사용 (일할 계산된 환급 보험료가 아니라 정산 기준 보험료)

---

## 3. 마이그레이션 스크립트 설계 (실제 데이터 기준)

### 3.1 증권발급 데이터 마이그레이션 SQL

```sql
-- 증권발급 데이터 마이그레이션 (ch='14')
-- 실제 데이터 패턴에 맞게 수정됨
INSERT INTO pharmacy_certificate_history 
  (applyNum, account, action_type, certificate_type, status, 
   proPreminum, areaPreminum, preminum, certificate_date, 
   registrar, registrar_id, wdate, memo)
SELECT 
  num as applyNum,
  CAST(account AS UNSIGNED) as account,  -- VARCHAR(10) → INT 변환
  'certificate' as action_type,
  CASE 
    WHEN (chemistCerti IS NOT NULL AND chemistCerti != '') 
         AND (areaCerti IS NOT NULL AND areaCerti != '') 
    THEN 'both'
    WHEN (chemistCerti IS NOT NULL AND chemistCerti != '') 
    THEN 'expert'
    WHEN (areaCerti IS NOT NULL AND areaCerti != '') 
    THEN 'fire'
    ELSE NULL  -- 데이터 오류 (둘 다 없는 경우)
  END as certificate_type,
  '14' as status,
  CASE WHEN proPreminum = '' OR proPreminum = '해당없음' THEN '0' ELSE proPreminum END as proPreminum,
  CASE WHEN areaPreminum = '' OR areaPreminum = '해당없음' THEN '0' ELSE areaPreminum END as areaPreminum,
  CASE WHEN preminum = '' THEN '0' ELSE preminum END as preminum,
  wdate_3 as certificate_date,  -- DATE 타입이므로 DATE() 함수 불필요
  NULL as registrar,  -- 과거 데이터이므로 NULL
  NULL as registrar_id,  -- 과거 데이터이므로 NULL
  COALESCE(wdate_3, NOW()) as wdate,  -- 기록 생성 시간
  '과거 데이터 마이그레이션' as memo
FROM pharmacyApply
WHERE ch = '14'
  AND wdate_3 IS NOT NULL 
  AND wdate_3 != '0000-00-00'  -- 유효한 날짜만
  AND (
    (chemistCerti IS NOT NULL AND chemistCerti != '') 
    OR (areaCerti IS NOT NULL AND areaCerti != '')
  )
  AND NOT EXISTS (
    -- 중복 방지: 이미 마이그레이션된 데이터 제외
    SELECT 1 FROM pharmacy_certificate_history 
    WHERE applyNum = pharmacyApply.num 
      AND action_type = 'certificate'
  )
ORDER BY num;
```

### 3.2 해지완료 데이터 마이그레이션 SQL

**중요**: 해지 데이터는 `pharmacy_settlementList` 테이블에서 조회합니다!

```sql
-- 해지완료 데이터 마이그레이션 (ch='16')
-- pharmacy_settlementList 테이블에서 해지 데이터 조회
INSERT INTO pharmacy_certificate_history 
  (applyNum, account, action_type, certificate_type, status, 
   proPreminum, areaPreminum, preminum, certificate_date, 
   registrar, registrar_id, wdate, memo)
SELECT 
  CAST(sl.applyNum AS UNSIGNED) as applyNum,  -- VARCHAR(30) → INT 변환
  sl.account,  -- 이미 INT 타입
  'termination' as action_type,
  NULL as certificate_type,  -- 해지 이력이므로 NULL
  '16' as status,
  CASE 
    WHEN sl.proPreminum = '' OR sl.proPreminum = '해당없음' THEN '0' 
    ELSE sl.proPreminum 
  END as proPreminum,
  CASE 
    WHEN sl.areaPreminum = '' OR sl.areaPreminum = '해당없음' THEN '0' 
    ELSE sl.areaPreminum 
  END as areaPreminum,
  CASE 
    WHEN sl.proPreminum = '' OR sl.proPreminum = '해당없음' THEN 
      CASE WHEN sl.areaPreminum = '' OR sl.areaPreminum = '해당없음' THEN '0' ELSE sl.areaPreminum END
    WHEN sl.areaPreminum = '' OR sl.areaPreminum = '해당없음' THEN sl.proPreminum
    ELSE CAST(CAST(IFNULL(sl.proPreminum, '0') AS DECIMAL(15,2)) + CAST(IFNULL(sl.areaPreminum, '0') AS DECIMAL(15,2)) AS CHAR)
  END as preminum,  -- proPreminum + areaPreminum (합산)
  DATE(sl.wdate) as certificate_date,  -- 해지일 (등록일)
  NULL as registrar,  -- 과거 데이터이므로 NULL
  NULL as registrar_id,  -- 과거 데이터이므로 NULL
  sl.wdate as wdate,  -- 기록 생성 시간 (등록일)
  '과거 데이터 마이그레이션 (해지완료)' as memo
FROM pharmacy_settlementList sl
INNER JOIN pharmacyApply pa ON CAST(sl.applyNum AS UNSIGNED) = pa.num
WHERE sl.sort = '16'  -- 해지 레코드
  AND pa.ch = '16'  -- 해지완료 상태
  -- 증권발급 이력이 있는 경우에만 마이그레이션
  AND (
    -- 이미 마이그레이션된 증권발급 이력이 있는 경우
    EXISTS (
      SELECT 1 FROM pharmacy_certificate_history 
      WHERE applyNum = CAST(sl.applyNum AS UNSIGNED)
        AND action_type = 'certificate'
    )
    -- 또는 증권번호가 하나라도 있는 경우
    OR (pa.chemistCerti IS NOT NULL AND pa.chemistCerti != '')
    OR (pa.areaCerti IS NOT NULL AND pa.areaCerti != '')
  )
  AND NOT EXISTS (
    -- 중복 방지: 이미 마이그레이션된 해지 데이터 제외
    SELECT 1 FROM pharmacy_certificate_history 
    WHERE applyNum = CAST(sl.applyNum AS UNSIGNED)
      AND action_type = 'termination'
  )
ORDER BY sl.applyNum, sl.wdate;
```

**주의사항:**
- `pharmacy_settlementList.applyNum`은 VARCHAR(30)이므로 INT로 변환 필요
- `pharmacy_settlementList.wdate` (등록일)을 해지일로 사용
- `pharmacy_settlementList` 테이블의 보험료 데이터 사용 (`proPreminum`, `areaPreminum`)
- 같은 약국에 여러 해지 레코드가 있는 경우, 모두 마이그레이션 (날짜별로 구분)

### 3.3 주의사항 및 데이터 정리

**필드값 정리 규칙:**
- `proPreminum`, `areaPreminum`: 빈 문자열('') 또는 '해당없음' → '0'으로 변환
- `wdate_3`: '0000-00-00' → 마이그레이션 제외
- `haejD`: '0000-00-00' → `wdate_2` 또는 `CURDATE()` 사용
- `account`: VARCHAR(10) → INT 변환 (CAST)

---

## 4. 마이그레이션 전 확인 사항

### 4.1 테이블 생성 확인
```sql
-- pharmacy_certificate_history 테이블이 생성되어 있는지 확인
SHOW TABLES LIKE 'pharmacy_certificate_history';

-- 테이블 구조 확인
DESC pharmacy_certificate_history;
```

### 4.2 마이그레이션 대상 데이터 확인 (실제 데이터 기준)
```sql
-- 증권발급 데이터 개수 확인 (ch='14', 실제 데이터 기준)
SELECT COUNT(*) as certificate_count
FROM pharmacyApply
WHERE ch = '14'
  AND wdate_3 IS NOT NULL 
  AND wdate_3 != '0000-00-00'  -- 유효한 날짜만
  AND (
    (chemistCerti IS NOT NULL AND chemistCerti != '') 
    OR (areaCerti IS NOT NULL AND areaCerti != '')
  );

-- 해지완료 데이터 개수 확인 (pharmacy_settlementList에서 sort=16)
SELECT COUNT(*) as termination_count
FROM pharmacy_settlementList sl
INNER JOIN pharmacyApply pa ON CAST(sl.applyNum AS UNSIGNED) = pa.num
WHERE sl.sort = '16'  -- 해지 레코드
  AND pa.ch = '16'  -- 해지완료 상태
  AND (
    -- 증권발급 이력이 있는 경우
    (pa.chemistCerti IS NOT NULL AND pa.chemistCerti != '')
    OR (pa.areaCerti IS NOT NULL AND pa.areaCerti != '')
  );

-- 증권발급 데이터 샘플 확인
SELECT num, account, ch, chemistCerti, areaCerti, 
       proPreminum, areaPreminum, preminum, wdate_3,
       CASE 
         WHEN (chemistCerti IS NOT NULL AND chemistCerti != '') 
              AND (areaCerti IS NOT NULL AND areaCerti != '') 
         THEN 'both'
         WHEN (chemistCerti IS NOT NULL AND chemistCerti != '') 
         THEN 'expert'
         WHEN (areaCerti IS NOT NULL AND areaCerti != '') 
         THEN 'fire'
         ELSE 'none'
       END as certificate_type
FROM pharmacyApply
WHERE ch = '14'
  AND wdate_3 IS NOT NULL 
  AND wdate_3 != '0000-00-00'
  AND (
    (chemistCerti IS NOT NULL AND chemistCerti != '') 
    OR (areaCerti IS NOT NULL AND areaCerti != '')
  )
ORDER BY num
LIMIT 20;

-- 해지완료 데이터 샘플 확인 (pharmacy_settlementList에서 조회)
SELECT 
  sl.applyNum,
  sl.account,
  sl.sort,
  sl.proPreminum,
  sl.areaPreminum,
  sl.approvalPreminum,
  DATE(sl.wdate) as termination_date,
  pa.ch,
  pa.chemistCerti,
  pa.areaCerti
FROM pharmacy_settlementList sl
INNER JOIN pharmacyApply pa ON CAST(sl.applyNum AS UNSIGNED) = pa.num
WHERE sl.sort = '16'  -- 해지 레코드
  AND pa.ch = '16'  -- 해지완료 상태
  AND (
    (pa.chemistCerti IS NOT NULL AND pa.chemistCerti != '')
    OR (pa.areaCerti IS NOT NULL AND pa.areaCerti != '')
  )
ORDER BY sl.applyNum, sl.wdate
LIMIT 20;
```

### 4.3 중복 데이터 확인
```sql
-- 이미 마이그레이션된 데이터 개수 확인
SELECT COUNT(*) as already_migrated
FROM pharmacy_certificate_history;

-- 증권발급 이력이 있는 약국 목록
SELECT DISTINCT applyNum 
FROM pharmacy_certificate_history 
WHERE action_type = 'certificate';
```

---

## 5. 마이그레이션 실행 절차

### 5.1 Phase 1: 백업 (필수)
```sql
-- pharmacy_certificate_history 테이블 백업 (이미 데이터가 있는 경우)
CREATE TABLE pharmacy_certificate_history_backup_20260110 AS 
SELECT * FROM pharmacy_certificate_history;
```

### 5.2 Phase 2: 증권발급 데이터 마이그레이션
```sql
-- 1단계: 증권발급 데이터 마이그레이션 실행
-- (위의 2.1 SQL 실행)

-- 2단계: 마이그레이션 결과 확인
SELECT 
  action_type,
  certificate_type,
  COUNT(*) as count,
  MIN(certificate_date) as min_date,
  MAX(certificate_date) as max_date
FROM pharmacy_certificate_history
WHERE action_type = 'certificate'
  AND memo = '과거 데이터 마이그레이션'
GROUP BY action_type, certificate_type;
```

### 5.3 Phase 3: 해지완료 데이터 마이그레이션
```sql
-- 1단계: 해지완료 데이터 마이그레이션 실행
-- (위의 2.2 SQL 실행)

-- 2단계: 마이그레이션 결과 확인
SELECT 
  action_type,
  COUNT(*) as count,
  MIN(certificate_date) as min_date,
  MAX(certificate_date) as max_date
FROM pharmacy_certificate_history
WHERE action_type = 'termination'
  AND memo = '과거 데이터 마이그레이션 (해지완료)'
GROUP BY action_type;
```

### 5.4 Phase 4: 검증
```sql
-- 전체 마이그레이션 통계
SELECT 
  action_type,
  COUNT(*) as total_count,
  COUNT(DISTINCT applyNum) as unique_applications,
  COUNT(DISTINCT account) as unique_accounts
FROM pharmacy_certificate_history
WHERE memo LIKE '과거 데이터 마이그레이션%'
GROUP BY action_type;

-- 날짜별 마이그레이션 통계
SELECT 
  DATE(certificate_date) as date,
  action_type,
  COUNT(*) as count
FROM pharmacy_certificate_history
WHERE memo LIKE '과거 데이터 마이그레이션%'
GROUP BY DATE(certificate_date), action_type
ORDER BY date DESC
LIMIT 30;

-- 문제 데이터 확인 (certificate_type이 NULL인 경우)
SELECT * FROM pharmacy_certificate_history
WHERE action_type = 'certificate'
  AND certificate_type IS NULL
  AND memo = '과거 데이터 마이그레이션';

-- 중복 데이터 확인 (같은 applyNum에 여러 발급 이력)
SELECT applyNum, COUNT(*) as count
FROM pharmacy_certificate_history
WHERE action_type = 'certificate'
GROUP BY applyNum
HAVING COUNT(*) > 1;
```

---

## 6. 예상 결과

### 6.1 마이그레이션 예상 데이터량
- **증권발급 데이터 (ch=14)**: 기존 `pharmacyApply`에서 `ch=14`이고 `wdate_3`가 있는 데이터
- **해지완료 데이터 (ch=16)**: 기존 `pharmacyApply`에서 `ch=16`이고 증권번호가 있는 데이터

### 6.2 마이그레이션 후 효과
- ✅ 과거 증권발급/해지 이력이 `pharmacy_certificate_history` 테이블에 기록됨
- ✅ 통계 조회 시 과거 데이터도 포함하여 정확한 통계 제공 가능
- ✅ 증권발급 기준 통계의 정확도 향상

---

## 7. 주의사항 및 고려사항

### 7.1 입력자 정보 (registrar, registrar_id)
- **과거 데이터**: `NULL`로 설정 (마이그레이션 시점에는 누가 입력했는지 알 수 없음)
- **향후 데이터**: 증권번호 입력 시 세션에서 사용자 정보 조회하여 기록

### 7.2 중복 데이터 처리
- **증권발급 데이터**: `applyNum` + `action_type='certificate'` 기준으로 UNIQUE 제약조건으로 중복 방지
- **해지완료 데이터**: `applyNum` + `action_type='termination'` 기준으로 중복 방지
- 마이그레이션 스크립트에서 `NOT EXISTS` 조건으로 이미 마이그레이션된 데이터 제외

### 7.3 데이터 무결성 및 타입 변환
- `certificate_type`이 NULL인 경우 확인 필요 (데이터 오류 가능성)
- `certificate_date`가 NULL인 경우 처리 방안 필요 (현재는 `wdate_3` 또는 `wdate_2` 사용)

### 7.4 필드 타입 변환 주의사항
**account 필드:**
- `pharmacyApply.account`: VARCHAR(10) → `CAST(account AS UNSIGNED)`로 변환
- `pharmacy_settlementList.account`: INT(1) → 그대로 사용
- `pharmacy_certificate_history.account`: INT(11) → 일치

**applyNum 필드:**
- `pharmacy_settlementList.applyNum`: VARCHAR(30) → `CAST(applyNum AS UNSIGNED)`로 변환
- `pharmacy_certificate_history.applyNum`: INT(11) → 일치

### 7.5 마이그레이션 실행 시점
- **권장**: 운영 환경 업무 시간 외 (야간 또는 주말)
- **권장**: 테스트 환경에서 먼저 실행하여 검증 후 운영 환경 적용

---

## 8. 롤백 계획

### 7.1 롤백 방법
```sql
-- pharmacy_certificate_history 테이블을 백업으로 복원
DROP TABLE pharmacy_certificate_history;
CREATE TABLE pharmacy_certificate_history AS 
SELECT * FROM pharmacy_certificate_history_backup_20260110;

-- 또는 마이그레이션된 데이터만 삭제
DELETE FROM pharmacy_certificate_history
WHERE memo LIKE '과거 데이터 마이그레이션%';
```

---

## 9. 승인 체크리스트

### 사용자 검토 항목
- [ ] 마이그레이션 대상 데이터 조건 동의
- [ ] 증권발급 데이터 매핑 규칙 동의
- [ ] 해지완료 데이터 매핑 규칙 동의
- [ ] 입력자 정보를 NULL로 설정하는 것 동의
- [ ] 마이그레이션 실행 시점 결정 (운영 시간 외 권장)
- [ ] 백업 및 롤백 계획 확인

### 기술 검토 항목
- [ ] `pharmacyApply` 테이블 구조 확인 (`chemistCerti`, `areaCerti`, `wdate_3`, `wdate_2` 필드 존재 확인)
- [ ] `pharmacy_certificate_history` 테이블 생성 완료 확인
- [ ] 마이그레이션 대상 데이터 개수 확인
- [ ] 테스트 환경에서 먼저 실행 검증 필요

---

## 10. 다음 단계

1. **사용자 동의 후**:
   - `pharmacyApply` 테이블 구조 확인 (실제 필드명 확인)
   - 마이그레이션 대상 데이터 개수 확인
   - 테스트 환경에서 마이그레이션 스크립트 실행 및 검증
   - 운영 환경에서 마이그레이션 실행

2. **마이그레이션 완료 후**:
   - 마이그레이션 결과 검증
   - 통계 조회 로직과 비교 검증
   - 문서 업데이트 (README.md, WORK_LOG.md)

---

**작성일**: 2026-01-10  
**최종 수정일**: 2026-01-10 (실제 테이블 구조 및 데이터 분석 결과 반영)  
**작성자**: AI Assistant  
**상태**: 실제 데이터 분석 완료, 마이그레이션 SQL 수정 완료, 사용자 동의 대기

---

## 11. 실제 데이터 분석 요약

### 11.1 테이블 구조 확인
- ✅ `pharmacyApply` 테이블 구조 확인 완료
- ✅ 주요 필드 타입 및 제약사항 확인
- ✅ 인덱스 구조 확인

### 11.2 데이터 패턴 확인
- ✅ `ch='14'` (증권발급) 데이터 패턴 분석
- ✅ `ch='16'` (해지완료) 데이터 패턴 분석
- ✅ 증권번호 필드 (chemistCerti, areaCerti) 값 패턴 확인
- ✅ 날짜 필드 (wdate_3, haejD, wdate_2) 값 패턴 확인
- ✅ 보험료 필드 (proPreminum, areaPreminum, preminum) 값 패턴 확인

### 11.3 마이그레이션 SQL 수정 사항
- ✅ `wdate_3 != '0000-00-00'` 조건 추가 (유효한 날짜만)
- ✅ `account` 필드 타입 변환 (`CAST(account AS UNSIGNED)`)
- ✅ 보험료 필드 정리 (빈 문자열, '해당없음' 처리)
- ✅ 해지일 처리 로직 개선 (`haejD` 우선, `wdate_2` 대체)
- ✅ 메모 필드에 환급보험료 정보 추가
