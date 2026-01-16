# 약국배상책임보험 시스템 학습 요약

> **작성일**: 2026-01-14  
> **목적**: `disk-cms-react/docs/pharmacy/` 폴더의 문서들을 학습한 내용을 요약 정리

---

## 📚 학습한 문서 목록

1. **README.md** - 약국배상책임보험 시스템 통합 문서 (35KB, 980 lines)
2. **CERTIFICATE_TABLE_PLAN.md** - 증권발급 기준 통계 개선 기획서 (16KB, 398 lines)
3. **CERTIFICATE_MIGRATION_PLAN.md** - pharmacyApply 과거 데이터 마이그레이션 계획서 (18KB, 501 lines)
4. **WORK_LOG.md** - 작업일지 (3.6KB, 107 lines)

---

## 🎯 시스템 개요

### 시스템 구조
약국배상책임보험 시스템은 **3개의 독립적인 시스템**으로 구성됩니다:

1. **고객사 관리자 시스템** (`imet.kr/hi/v2/`)
   - 고객사 관리자가 약국 신청 목록 조회 및 관리
   - API v2 인증 (HMAC-SHA256)
   - 예치금 현황, 일별/월별 실적 조회

2. **약국 가입신청 시스템** (`imet.kr/drugstore/`)
   - 약국이 보험 가입신청
   - 4개의 업체별 시스템:
     - **팜페이스마트** (`pharmacy/`) - 수동 승인 (ch=10)
     - **팜페이스마트 테스트** (`pharmacyTest/`) - 수동 승인
     - **유비케어** (`ubcare/`) - 자동 승인 (ch=13)
     - **유비케어 테스트** (`ubcareTest/`) - 자동 승인

3. **통합 관리자 CMS** (`disk-cms.simg.kr/pharmacy/`)
   - React 기반 관리 시스템
   - 신청 목록 조회 및 관리
   - 상태 변경 (승인, 보류, 해지)
   - 예치금 관리
   - 통계 및 보고서

---

## 🔑 핵심 개념

### 1. 승인 방식의 차이

**팜페이스마트 (수동 승인)**:
- `submit.php` 사용
- 상태: `ch=10` (메일 보냄)
- 관리자가 disk-cms에서 수동으로 승인 필요
- 승인 시 예치금 차감, 정산 기록 생성

**유비케어 (자동 승인)**:
- `ubcareSubmit.php` 사용
- 상태: `ch=13` (승인)
- 신청 시 즉시 자동 승인 처리
- 예치금 차감, 정산 기록 생성 자동 처리

### 2. 상태 코드 (ch)

| 코드 | 상태 | 설명 |
|------|------|------|
| 1 | 접수 | 신청 접수 |
| 2 | 보험료 | 보험료 산출 |
| 3 | 청약서안내 | 청약서 안내 |
| 4 | 자필서류 | 자필 서류 확인 |
| 5 | 입금확인 | 입금 확인 |
| 6 | 계약완료 | 계약 완료 |
| 7 | 보류 | 보류 (환급 처리) |
| 10 | 메일 보냄 | 메일 발송 (수동 승인 대기) |
| 13 | 승인 | 승인 완료 |
| 14 | 증권발급 | 증권 발급 완료 |
| 15 | 해지요청 | 해지 요청 |
| 16 | 해지완료 | 해지 완료 (일할 환급) |
| 17 | 설계중 | 설계 중 |

### 3. 날짜 필드의 의미

| 필드 | 의미 | 설정 시점 | 용도 |
|------|------|-----------|------|
| `wdate` | **최초 입력 시간** (신청일) | 약국 신청 최초 입력 시 | 신청일 기준 조회, 통계 |
| `wdate_2` | **상태 변경일** | 상태(`ch`) 변경 시마다 업데이트 | 상태 변경 기준 조회, 실적 집계 |
| `wdate_3` | **증권발급일** | 증권번호 입력 시 설정 | 증권발급 기준 조회, 실적 집계 |

---

## 📊 데이터베이스 구조

### 주요 테이블

1. **pharmacyApply** - 약국 신청 정보 메인 테이블
   - `num`: 신청 번호 (PK)
   - `account`: 업체 번호
   - `ch`: 상태 코드
   - `chemistCerti`: 전문인 증권번호
   - `areaCerti`: 화재 증권번호
   - `preminum`: 보험료
   - `wdate`, `wdate_2`, `wdate_3`: 날짜 필드

2. **pharmacy_idList** - 업체 정보
   - `num`: 업체 번호 (PK)
   - `directory`: 디렉토리 경로
   - `ch`: 처리 모드 (10=수동, 13=자동)
   - `api_key`, `api_secret`: API 인증 정보

3. **pharmacy_deposit** - 예치금 거래 내역
   - `num`: 거래 번호 (PK)
   - `account`: 업체 번호
   - `money`: 금액 (양수: 입금, 음수: 출금)
   - `sort`: 거래 유형 (98: 현재 잔고, 99: 입금, 13: 승인 차감, 7: 보류 환급)

4. **pharmacy_settlementList** - 정산 기록
   - `num`: 정산 번호 (PK)
   - `applyNum`: 신청 번호
   - `sort`: 정산 유형 (13: 승인, 7: 보류, 16: 해지)
   - `approvalPreminum`: 승인 보험료

5. **pharmacy_certificate_history** (2026-01-10 추가) - 증권발급 및 해지 이력
   - `num`: 기록 번호 (PK)
   - `applyNum`: 약국 신청 번호
   - `action_type`: 액션 타입 ('certificate': 증권발급, 'termination': 해지완료)
   - `certificate_type`: 증권 유형 ('expert': 전문인, 'fire': 화재, 'both': 둘 다)
   - `certificate_date`: 증권발급일/해지일 (통계 집계 기준일)
   - `registrar`, `registrar_id`: 입력자 정보

---

## 🔄 핵심 프로세스

### 1. 약국 가입신청 프로세스

**팜페이스마트 (수동 승인)**:
```
약국 신청 제출 (submit.php)
  ↓
pharmacyApply 저장 (ch=10, 메일 보냄)
  ↓
이메일 발송 (관리자에게 알림)
  ↓
관리자가 disk-cms에서 수동 승인
  ↓
상태 변경 (ch=10 → ch=13, 승인)
  ↓
예치금 차감, 정산 기록 생성
```

**유비케어 (자동 승인)**:
```
약국 신청 제출 (ubcareSubmit.php)
  ↓
pharmacyApply 저장
  ↓
자동 승인 처리 (ch=13, 승인)
  ↓
예치금 차감, 정산 기록 생성
  ↓
이메일 발송 (승인 완료 알림)
```

### 2. 증권발급 프로세스

```
[승인 완료 (ch=13)]
    ↓
[설계번호 입력]
    ├─ 전문인설계번호 입력 (chemistDesignNumer)
    ├─ 화재설계번호 입력 (areaDesignNumer)
    └─ 상태 변경: ch=17 (설계중)
    ↓
[증권번호 입력]
    ├─ 전문인증권번호 입력 (chemistCerti)
    ├─ 화재증권번호 입력 (areaCerti)
    ├─ 상태 변경: ch=14 (증권발급)
    ├─ wdate_2: NOW() 업데이트 (상태 변경일)
    └─ wdate_3: CURDATE() 설정 (증권발급일)
    ↓
[증권발급 완료]
```

### 3. 상태 변경 프로세스

**승인 (ch=13)**:
- 예치금 잔고 확인
- 보험료 차감 (pharmacy_deposit, sort=13, 음수)
- 정산 기록 생성 (pharmacy_settlementList, sort=13)
- 잔고 업데이트
- 상태 변경 (pharmacyApply.ch = 13)
- 이메일 발송

**보류 (ch=7)**:
- 정산 기록 확인 (sort=13)
- 예치금 환급 (pharmacy_deposit, sort=7)
- 정산 기록 변경 (pharmacy_settlementList, sort=7)
- 상태 변경 (pharmacyApply.ch = 7)

**해지완료 (ch=16)**:
- 일할 계산 수행: (종기-해지일)/(종기-시기) × 총보험료
- 예치금 환급 (pharmacy_deposit, sort=16)
- 정산 기록 생성 (pharmacy_settlementList, sort=16)
- 상태 변경 (pharmacyApply.ch = 16)

---

## 📈 통계 기준 비교

### 승인 기준 vs 증권 기준

| 구분 | 승인 기준 | 증권 기준 (2026-01-10 개선) |
|------|----------|----------------------------|
| **테이블** | `pharmacy_settlementList` | `pharmacy_certificate_history` |
| **조건** | `sort = 13` (승인) | `action_type='certificate'` (증권발급, status='14') |
| **날짜 필드** | `wdate` (정산일) | `certificate_date` (증권발급일/해지일) |
| **의미** | 승인 처리 시점 | 증권 발급 완료 시점 |
| **포함 범위** | 승인 처리된 모든 건 | 증권번호 입력 완료된 건만 |
| **시점 차이** | 승인 즉시 | 승인 → 설계번호 → 증권번호 입력 후 |
| **특징** | 예치금 차감 시점 반영 | 환급 보험료 반영 (해지 시 일할 계산) |

---

## 🆕 주요 개선 사항

### 1. 증권발급 기준 통계 개선 (2026-01-10)

**문제점**:
- `pharmacyApply` 테이블의 `wdate_3` 기준으로 통계 집계 시 문제 발생
- 전문인/화재 증권번호 입력 시점 불일치
- 증권번호 수정 시 날짜 변경 안 됨
- 해지 시점과 증권발급 시점이 별도로 관리되지 않음

**해결책**:
- `pharmacy_certificate_history` 전용 테이블 생성
- 증권번호 입력 시 자동 기록 (INSERT/UPDATE 방식)
- 해지완료 시 환급 보험료 기록
- 한 약국당 최대 1개 레코드 유지 (중복 방지)

**특징**:
- `action_type`: 'certificate' (증권발급), 'termination' (해지완료)
- `certificate_type`: 'expert' (전문인), 'fire' (화재), 'both' (둘 다)
- `certificate_date`: 통계 집계 기준일
- `registrar`, `registrar_id`: 입력자 정보 (감사 추적)

### 2. 마이그레이션 계획 (2026-01-10)

**목적**: 과거 `pharmacyApply` 데이터를 `pharmacy_certificate_history`로 마이그레이션

**대상 데이터**:
1. **증권발급 데이터 (ch='14')**:
   - 조건: `ch='14'`, `wdate_3 IS NOT NULL AND wdate_3 != '0000-00-00'`
   - 증권번호가 하나라도 있는 경우
   - `certificate_type`: 전문인/화재 증권번호 기준으로 결정

2. **해지완료 데이터 (ch='16')**:
   - 조건: `pharmacy_settlementList.sort='16'`에서 조회
   - 증권발급 이력이 있는 경우
   - `certificate_date`: `pharmacy_settlementList.wdate` (해지일)

**주의사항**:
- `account` 필드 타입 변환: `VARCHAR(10)` → `INT` (`CAST(account AS UNSIGNED)`)
- 보험료 필드 정리: 빈 문자열('') 또는 '해당없음' → '0'
- 중복 방지: `NOT EXISTS` 조건으로 이미 마이그레이션된 데이터 제외

---

## 🔐 API v2 인증

### HMAC-SHA256 인증

**인증 방식**:
```javascript
// 1. 요청 본문을 JSON 문자열로 변환
const requestBody = JSON.stringify(payload);

// 2. 서명용 문자열 생성
const stringToSign = `${method}\n${path}\n${timestamp}\n${requestBody}`;

// 3. HMAC-SHA256 서명 생성
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(stringToSign, 'utf8')
  .digest('hex');
```

**헤더**:
```http
Authorization: Bearer {api_key}
X-Timestamp: {unix_timestamp}
X-Signature: {hmac_signature}
Content-Type: application/json
```

### 주요 API 엔드포인트

- `list_v2.php`: 약국 리스트 조회
- `detail_v2.php`: 약국 상세 조회
- `pharmacy-status-update_v2.php`: 상태 변경 (승인, 보류, 해지)
- `pharmacy-premium-calculate_v2.php`: 보험료 계산
- `balance_v2.php`: 잔고 조회
- `deposit_balance_v2.php`: 예치금 내역 조회
- `daily_stats_v2.php`: 일별 실적 조회
- `monthly_stats_v2.php`: 월별 실적 조회

### API 검증 포털

- **URL**: https://imet.kr/hi/api/verification/
- **기능**: 모든 API 엔드포인트를 통합 관리하고 테스트할 수 있는 중앙 허브
- **개발자 가이드**: https://imet.kr/hi/api/verification/api_guide.html

---

## 📝 작업 일지 요약

### 2026-01-10 작업 내용

1. **일별/월별 실적 조회 기준 변경**
   - 계약 기준 → 증권 기준으로 변경
   - `ch=6` (계약완료), `wdate_2` → `ch=14` (증권발급), `wdate_3`

2. **프론트엔드 UI 수정**
   - 라디오 버튼 라벨: "계약 기준" → "증권 기준"

3. **상태 필터 추가**
   - "계약(ch=6)" 상태 필터 추가

4. **데이터베이스 필드 의미 확인**
   - `wdate`, `wdate_2`, `wdate_3` 의미 정리

---

## 🔍 주요 인사이트

### 1. 데이터 흐름의 복잡성
- 3개의 독립 시스템 간 데이터 교환
- API v2 인증으로 보안 강화
- 상태 코드 기반 워크플로우 관리

### 2. 통계 기준의 중요성
- 승인 기준 vs 증권 기준의 차이 이해
- 증권발급 기준 통계의 정확도 향상 필요
- 전용 테이블(`pharmacy_certificate_history`) 생성으로 문제 해결

### 3. 날짜 필드의 명확한 역할
- `wdate`: 신청일 (변경 불가)
- `wdate_2`: 상태 변경일 (상태 변경 시마다 업데이트)
- `wdate_3`: 증권발급일 (증권번호 입력 시 설정)

### 4. 승인 방식의 차이
- 팜페이스마트: 수동 승인 (관리자 개입 필요)
- 유비케어: 자동 승인 (즉시 처리)

### 5. 예치금 관리의 중요성
- 승인 시 예치금 차감
- 보류/해지 시 예치금 환급
- 잔고 부족 시에도 정산 기록 생성 (2026-01-09 개선)

---

## 🎓 학습한 기술 및 개념

### 1. 시스템 아키텍처
- 마이크로서비스 아키텍처 (3개 독립 시스템)
- API 기반 통신 (RESTful API)
- 프록시 서버 (Node.js + Express.js)

### 2. 데이터베이스 설계
- 정규화 및 테이블 분리
- 인덱스 설계 및 최적화
- UNIQUE 제약조건 활용
- 데이터 마이그레이션 전략

### 3. 보안
- HMAC-SHA256 인증
- API 키/시크릿 관리
- 세션 관리

### 4. 프론트엔드
- React 18.3+ + TypeScript
- Ant Design 컴포넌트
- 모달 시스템
- 상태 관리

### 5. 백엔드
- PHP 5.5+ (호환성 고려)
- PDO Prepared Statement
- 트랜잭션 처리
- 에러 핸들링

---

## 📚 참고 문서

- [README.md](./README.md) - 시스템 통합 문서
- [CERTIFICATE_TABLE_PLAN.md](./CERTIFICATE_TABLE_PLAN.md) - 증권발급 기준 통계 개선 기획서
- [CERTIFICATE_MIGRATION_PLAN.md](./CERTIFICATE_MIGRATION_PLAN.md) - 마이그레이션 계획서
- [WORK_LOG.md](./WORK_LOG.md) - 작업일지

---

## 📅 작성일
2026-01-14

---

## 💡 다음 학습 권장 사항

1. 실제 코드 리뷰
   - `Applications.tsx`: React 컴포넌트 구조 이해
   - `pharmacy-status-update_v2.php`: 상태 변경 로직 이해
   - `pharmacy-certificate-update.php`: 증권번호 입력 로직 이해

2. API 테스트
   - API 검증 포털을 통한 API 테스트
   - HMAC 인증 구현 연습

3. 데이터베이스 쿼리 분석
   - 실제 통계 조회 쿼리 분석
   - 인덱스 사용 패턴 이해

4. 워크플로우 이해
   - 실제 약국 신청부터 증권발급까지 전체 프로세스 추적
   - 각 상태 변경 시점의 데이터 변화 확인
