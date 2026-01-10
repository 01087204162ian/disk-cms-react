# 증권발급 기준 통계 개선: 새로운 테이블 설계 기획서

> **작성일**: 2026-01-09  
> **목적**: 증권발급 기준 통계 정확도 개선을 위한 전용 테이블 설계  
> **상태**: 기획 단계 (사용자 동의 대기)

---

## 1. 현재 문제점

### 1.1 증권 기준 통계의 문제
- **현재 방식**: `pharmacyApply` 테이블의 `ch=14` (증권발급), `wdate_3` (증권발급일) 기준으로 통계 집계
- **문제점**:
  - `wdate_3`는 증권번호 입력 시 `CURDATE()`로 설정되는데, 전문인/화재 각각 입력 시점이 다를 수 있음
  - 전문인 증권번호만 입력되고 화재 증권번호가 나중에 입력되는 경우 날짜 불일치 발생 가능
  - 증권번호 수정 시 날짜가 변경되지 않아 통계에 반영 안 됨
  - 해지 시점과 증권발급 시점이 별도로 관리되지 않아 통계 정확도 저하

### 1.2 기존 테이블 구조의 한계
- `pharmacyApply`: 메인 테이블로 모든 상태 변화를 기록하지만, 증권발급 이력 추적 어려움
- `pharmacy_settlementList`: 승인 기준 정산만 기록 (sort=13, 7, 16)
- 증권발급/해지 이력이 명확하게 기록되지 않음

---

## 2. 새로운 테이블 설계

### 2.1 테이블명
```
pharmacy_certificate_history
```

**의미**: 증권발급 및 해지 이력을 명확하게 기록하는 전용 테이블

### 2.2 테이블 구조

```sql
CREATE TABLE `pharmacy_certificate_history` (
  `num` int(11) NOT NULL AUTO_INCREMENT COMMENT '기록 번호',
  `applyNum` int(11) NOT NULL COMMENT '약국 신청 번호 (pharmacyApply.num)',
  `account` int(11) NOT NULL COMMENT '업체 번호 (pharmacy_idList.num)',
  `action_type` enum('certificate','termination') NOT NULL COMMENT '액션 타입: certificate(증권발급), termination(해지완료)',
  `certificate_type` enum('expert','fire','both') DEFAULT NULL COMMENT '증권 유형: expert(전문인), fire(화재), both(둘 다)',
  `status` varchar(10) NOT NULL COMMENT '상태 코드 (ch 값: 14=증권발급, 16=해지완료)',
  `proPreminum` varchar(20) NOT NULL DEFAULT '0' COMMENT '전문인보험료',
  `areaPreminum` varchar(20) NOT NULL DEFAULT '0' COMMENT '화재보험료',
  `preminum` varchar(20) NOT NULL DEFAULT '0' COMMENT '총 보험료 (전문인+화재)',
  `certificate_date` date NOT NULL COMMENT '증권발급일 또는 해지일 (통계 집계 기준일)',
  `registrar` varchar(100) DEFAULT NULL COMMENT '입력자 이름 (관리자 이름)',
  `registrar_id` varchar(50) DEFAULT NULL COMMENT '입력자 ID (세션 사용자 ID)',
  `wdate` datetime NOT NULL COMMENT '기록 생성 시간',
  `memo` text DEFAULT NULL COMMENT '메모',
  PRIMARY KEY (`num`),
  KEY `idx_applyNum` (`applyNum`),
  KEY `idx_account` (`account`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_certificate_date` (`certificate_date`),
  KEY `idx_status` (`status`),
  KEY `idx_account_date` (`account`, `certificate_date`),
  KEY `idx_applyNum_action` (`applyNum`, `action_type`),
  UNIQUE KEY `idx_applyNum_action_unique` (`applyNum`, `action_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='증권발급 및 해지 이력 테이블';
```

### 2.3 필드 상세 설명

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `num` | INT(11) | PK, 자동증가 | 1, 2, 3... |
| `applyNum` | INT(11) | 약국 신청 번호 (FK) | 12345 |
| `account` | INT(11) | 업체 번호 (FK) | 1, 8 |
| `action_type` | ENUM | 액션 타입 | 'certificate', 'termination' |
| `certificate_type` | ENUM | 증권 유형 (발급 시에만) | 'expert', 'fire', 'both' |
| `status` | VARCHAR(10) | 상태 코드 | '14', '16' |
| `proPreminum` | VARCHAR(20) | 전문인보험료 | '100000', '0' |
| `areaPreminum` | VARCHAR(20) | 화재보험료 | '50000', '0' |
| `preminum` | VARCHAR(20) | 총 보험료 | '150000', '0' |
| `certificate_date` | DATE | 증권발급일/해지일 (통계 기준일) | '2026-01-09' |
| `registrar` | VARCHAR(100) | 입력자 이름 | '홍길동' |
| `registrar_id` | VARCHAR(50) | 입력자 ID | 'sj@simg.kr' |
| `wdate` | DATETIME | 기록 생성 시간 | '2026-01-09 10:30:00' |
| `memo` | TEXT | 메모 | '첫 증권 발급', '일할 환급 처리' |

### 2.4 인덱스 설계
- **주요 인덱스**: 
  - `idx_account_date`: 업체별, 날짜별 통계 조회 최적화
  - `idx_applyNum_action`: 특정 약국의 발급/해지 이력 조회
  - `idx_certificate_date`: 날짜별 통계 집계 최적화

---

## 3. 데이터 기록 시나리오

### 3.1 증권번호 입력 시 (증권발급)

**트리거 위치**: `imet/api/pharmacy/pharmacy-certificate-update.php`의 `updateCertificateNumber()` 함수

**핵심 로직 (옵션 1 개선안)**:
- **한 약국당 최대 1개 레코드만 유지** (중복 방지)
- 기존 레코드가 있으면 UPDATE, 없으면 INSERT
- 전문인과 화재가 모두 입력되면 `certificate_type='both'`로 업데이트

**시나리오 1: 전문인 증권번호만 입력 (화재 없음)**
```sql
-- 기존 레코드 확인: applyNum=12345 AND action_type='certificate' 존재 여부 확인
-- 없으면 INSERT:
INSERT INTO pharmacy_certificate_history 
  (applyNum, account, action_type, certificate_type, status, 
   proPreminum, areaPreminum, preminum, certificate_date, registrar, registrar_id, wdate)
VALUES 
  (12345, 1, 'certificate', 'expert', '14', 
   '100000', '0', '100000', CURDATE(), '홍길동', 'sj@simg.kr', NOW());
```

**시나리오 2: 화재 증권번호만 입력 (전문인 없음)**
```sql
-- 기존 레코드 확인: applyNum=12345 AND action_type='certificate' 존재 여부 확인
-- 없으면 INSERT:
INSERT INTO pharmacy_certificate_history 
  (applyNum, account, action_type, certificate_type, status, 
   proPreminum, areaPreminum, preminum, certificate_date, registrar, registrar_id, wdate)
VALUES 
  (12345, 1, 'certificate', 'fire', '14', 
   '0', '50000', '50000', CURDATE(), '홍길동', 'sj@simg.kr', NOW());
```

**시나리오 3: 전문인 입력 후 화재 입력 (둘 다 입력 완료)**
```sql
-- 1단계: 전문인 증권번호 입력 시 (시나리오 1과 동일)
INSERT INTO pharmacy_certificate_history ... (expert, proPreminum=100000, areaPreminum=0)

-- 2단계: 화재 증권번호 입력 시
-- 기존 레코드 확인: applyNum=12345 AND action_type='certificate' 존재함
-- UPDATE 실행:
UPDATE pharmacy_certificate_history SET
  certificate_type = 'both',
  areaPreminum = '50000',
  preminum = '150000',  -- proPreminum + areaPreminum
  certificate_date = CURDATE(),  -- 최종 입력일로 업데이트
  registrar = '홍길동',
  registrar_id = 'sj@simg.kr',
  wdate = NOW()
WHERE applyNum = 12345 
  AND action_type = 'certificate';
```

**시나리오 4: 화재 입력 후 전문인 입력 (둘 다 입력 완료)**
```sql
-- 1단계: 화재 증권번호 입력 시 (시나리오 2와 동일)
INSERT INTO pharmacy_certificate_history ... (fire, proPreminum=0, areaPreminum=50000)

-- 2단계: 전문인 증권번호 입력 시
-- 기존 레코드 확인: applyNum=12345 AND action_type='certificate' 존재함
-- UPDATE 실행:
UPDATE pharmacy_certificate_history SET
  certificate_type = 'both',
  proPreminum = '100000',
  preminum = '150000',  -- proPreminum + areaPreminum
  certificate_date = CURDATE(),  -- 최종 입력일로 업데이트
  registrar = '홍길동',
  registrar_id = 'sj@simg.kr',
  wdate = NOW()
WHERE applyNum = 12345 
  AND action_type = 'certificate';
```

**주의사항**:
- ✅ **한 약국당 최대 1개 레코드 유지**: `applyNum` + `action_type='certificate'` 기준으로 UNIQUE 유지
- ✅ 전문인 증권번호 입력 시: 화재가 이미 있으면 UPDATE (`both`), 없으면 INSERT (`expert`)
- ✅ 화재 증권번호 입력 시: 전문인이 이미 있으면 UPDATE (`both`), 없으면 INSERT (`fire`)
- ✅ `certificate_date`: 마지막 증권번호 입력일로 설정 (통계 집계 기준일)
- ✅ 통계 집계 시 중복 제거 불필요 (한 약국당 1개 레코드만 존재)

### 3.2 해지완료 시 (해지)

**트리거 위치**: `imet/api/pharmacy/pharmacy-status-update_v2.php`의 해지완료(ch=16) 처리 부분

**시나리오: 해지완료 처리**
```sql
INSERT INTO pharmacy_certificate_history 
  (applyNum, account, action_type, certificate_type, status, 
   proPreminum, areaPreminum, preminum, certificate_date, registrar, registrar_id, wdate, memo)
VALUES 
  (12345, 1, 'termination', NULL, '16', 
   '100000', '50000', '150000', CURDATE(), '홍길동', 'sj@simg.kr', NOW(), '일할 환급 처리: 300일 남음');
```

**주의사항**:
- 해지 시에는 `certificate_type`을 NULL로 설정 (발급 이력이므로)
- 해지일(`certificate_date`)을 기준으로 통계 집계
- 일할 계산된 환급 보험료는 `preminum`에 음수로 기록하지 않고, 별도 필드 사용 고려 가능 (현재는 양수 유지)

---

## 4. 통계 조회 변경안

### 4.1 현재 방식 (문제 있음)

```php
// pharmacy-daily-report.php (증권 기준)
$query = "SELECT 
    ch,
    CAST(preminum AS DECIMAL(15,2)) as preminum,
    wdate_3,
    account
FROM pharmacyApply
WHERE wdate_3 >= '$dateStart'
  AND wdate_3 <= '$dateEnd'
  AND ch IN ('14', '16')
  AND account = '$accountNum'";
```

### 4.2 개선된 방식 (새 테이블 사용)

```php
// pharmacy-daily-report.php (증권 기준) - 개선안
$query = "SELECT 
    action_type,
    status,
    CAST(preminum AS DECIMAL(15,2)) as preminum,
    CAST(proPreminum AS DECIMAL(15,2)) as proPreminum,
    CAST(areaPreminum AS DECIMAL(15,2)) as areaPreminum,
    certificate_date,
    account
FROM pharmacy_certificate_history
WHERE certificate_date >= '$dateStart'
  AND certificate_date <= '$dateEnd'
  AND account = '$accountNum'
  AND action_type IN ('certificate', 'termination')";
```

**개선 효과**:
- 증권발급일(`certificate_date`)이 명확하게 기록되어 통계 정확도 향상
- 한 약국당 1개 레코드만 존재하여 통계 집계 단순화 (중복 제거 불필요)
- 전문인/화재 보험료를 각각 집계 가능
- 입력자 정보 기록으로 감사 추적 가능
- 날짜별 인덱스로 조회 성능 향상
- UNIQUE 제약조건으로 데이터 무결성 보장

---

## 5. 구현 계획

### Phase 1: 테이블 생성 및 마이그레이션 (1일)
1. ✅ 테이블 생성 SQL 작성
2. ✅ 기존 데이터 마이그레이션 스크립트 작성 (선택사항)
   - 기존 `pharmacyApply`에서 `ch=14`, `wdate_3` 있는 데이터를 새 테이블로 마이그레이션
   - 단, 입력자 정보는 NULL로 설정

### Phase 2: 증권번호 입력 로직 수정 (1.5일)
1. ✅ `pharmacy-certificate-update.php` 수정
   - `updateCertificateNumber()` 함수에서 새 테이블에 INSERT/UPDATE 로직 추가
   - 기존 레코드 확인 로직 추가 (`applyNum` + `action_type='certificate'`)
   - 전문인/화재 증권번호 입력 시 조건부 처리:
     - 기존 레코드 없으면: INSERT
     - 기존 레코드 있으면: UPDATE (`certificate_type='both'`, 보험료 합산)
   - 입력자 정보 (registrar, registrar_id) 전달 방법 확인 필요
     - 세션에서 사용자 정보 조회
     - API 요청 시 파라미터로 전달

### Phase 3: 해지 처리 로직 수정 (0.5일)
1. ✅ `pharmacy-status-update_v2.php` 수정
   - 해지완료(ch=16) 처리 시 새 테이블에 INSERT 추가
   - 입력자 정보 전달

### Phase 4: 통계 조회 로직 수정 (1일)
1. ✅ `pharmacy-daily-report.php` 수정
   - 증권 기준 조회 시 새 테이블 사용
2. ✅ `pharmacy-monthly-report.php` 수정
   - 증권 기준 조회 시 새 테이블 사용

### Phase 5: 테스트 및 검증 (1일)
1. ✅ 증권번호 입력 테스트 (전문인, 화재 각각)
2. ✅ 해지 처리 테스트
3. ✅ 일별/월별 통계 조회 테스트
4. ✅ 기존 데이터와 비교 검증

**총 예상 작업일**: 약 5일 (Phase 2가 1.5일로 증가)

---

## 6. 고려사항 및 주의점

### 6.1 입력자 정보 전달 방법
**옵션 1: 세션에서 조회**
- 현재 로그인한 사용자 세션 정보 활용
- PHP 세션에서 사용자 이름, ID 조회
- 장점: 별도 파라미터 불필요
- 단점: API 호출 시 세션 정보 필요

**옵션 2: API 파라미터로 전달**
- 프론트엔드에서 입력자 정보를 파라미터로 전달
- 장점: 명확한 데이터 전달
- 단점: 프론트엔드 수정 필요

**권장**: 옵션 1 (세션 활용) - 기존 시스템과 일관성 유지

### 6.2 전문인/화재 증권번호 각각 입력 시 처리 (옵션 1 개선안)
- **핵심 원칙**: 한 약국당 최대 1개 레코드만 유지
- 전문인 증권번호 입력 시:
  - 기존 레코드 확인 (`applyNum` + `action_type='certificate'`)
  - 없으면: INSERT (`certificate_type='expert'`)
  - 있으면: UPDATE (`certificate_type='both'`, `areaPreminum` 추가, `preminum` 합산)
- 화재 증권번호 입력 시:
  - 기존 레코드 확인 (`applyNum` + `action_type='certificate'`)
  - 없으면: INSERT (`certificate_type='fire'`)
  - 있으면: UPDATE (`certificate_type='both'`, `proPreminum` 추가, `preminum` 합산)

**권장 방식**: INSERT or UPDATE 방식으로 한 약국당 1개 레코드 유지 (통계 집계 단순화)

### 6.3 기존 데이터 마이그레이션
- 기존 `pharmacyApply`에서 `ch=14`, `wdate_3` 있는 데이터를 새 테이블로 마이그레이션
- 입력자 정보는 NULL로 설정 (과거 데이터이므로)
- 마이그레이션 스크립트 작성 필요

### 6.4 해지 시 일할 계산 정보 저장
- 현재 해지 처리 시 일할 계산된 환급 보험료가 `preminum`에 저장됨
- 추가 필드 고려: `refund_premium` (환급 보험료), `remaining_days` (남은 일수)
- 또는 `memo` 필드에 JSON 형태로 저장

**권장**: `memo` 필드에 추가 정보 저장 (추가 필드 생성은 선택사항)

---

## 7. 예상 효과

### 7.1 통계 정확도 향상
- 증권발급일(`certificate_date`)이 명확하게 기록되어 날짜 기준 통계 정확도 향상
- 전문인/화재 보험료를 각각 집계 가능

### 7.2 감사 추적 가능
- 입력자 정보(registrar, registrar_id) 기록으로 누가 언제 증권을 발급/해지했는지 추적 가능

### 7.3 성능 향상
- 전용 테이블로 인덱스 최적화
- 날짜별 통계 조회 성능 향상

### 7.4 데이터 무결성
- 증권발급/해지 이력이 별도 테이블에 명확하게 기록
- `pharmacyApply` 테이블과 분리되어 데이터 관리 용이

---

## 8. 향후 확장 가능성

### 8.1 추가 필드 고려
- `refund_premium`: 해지 시 환급 보험료 (현재는 `preminum`에 저장)
- `remaining_days`: 해지 시 남은 보험기간 (일수)
- `insurance_start_date`: 보험시기 (`sigi`)
- `insurance_end_date`: 보험종기 (`jeonggi`)

### 8.2 추가 기능 고려
- 증권번호 수정 이력 기록
- 증권번호 삭제 이력 기록
- 증권 발급 취소 이력 기록

---

## 9. 승인 체크리스트

### 사용자 검토 항목
- [x] 테이블 구조 및 필드 정의 동의
- [x] 증권번호 입력 시 기록 방식 동의 (옵션 1 개선안: INSERT/UPDATE 방식)
- [ ] 해지 시 기록 방식 동의
- [ ] 입력자 정보 전달 방법 결정 (세션 vs 파라미터)
- [ ] 기존 데이터 마이그레이션 필요 여부 확인
- [ ] 구현 계획 및 예상 작업일 검토

### 기술 검토 항목
- [ ] 인덱스 설계 검토
- [ ] 데이터 타입 검토 (VARCHAR vs DECIMAL)
- [ ] NULL 허용 여부 검토
- [ ] 트랜잭션 처리 확인
- [ ] 에러 핸들링 방안

---

## 10. 다음 단계

1. **사용자 동의 후**:
   - Phase 1부터 순차적으로 구현
   - 각 Phase 완료 후 테스트 및 검증

2. **구현 완료 후**:
   - 기존 통계 조회 로직과 비교 검증
   - 성능 테스트
   - 문서 업데이트 (README.md, WORK_LOG.md)

---

**작성일**: 2026-01-09  
**최종 수정일**: 2026-01-09 (옵션 1 개선안 반영)  
**작성자**: AI Assistant  
**상태**: 기획 완료, 옵션 1 개선안 적용 완료, 구현 준비 완료
