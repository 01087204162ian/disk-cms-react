# 약국배상책임보험 시스템 통합 문서

> **작성일**: 2026-01-09  
> **목적**: 약국배상책임보험 시스템의 모든 정보를 통합 관리  
> **위치**: `disk-cms-react/docs/pharmacy/`

---

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [페이지 구조 및 용도](#페이지-구조-및-용도)
3. [시스템 아키텍처](#시스템-아키텍처)
4. [API 문서](#api-문서)
5. [데이터베이스 스키마](#데이터베이스-스키마)
6. [개발 계획](#개발-계획)
7. [핵심 프로세스](#핵심-프로세스)

---

## 시스템 개요

약국배상책임보험 시스템은 약국이 보험 가입신청을 하고, 고객사 관리자와 시스템 관리자가 이를 관리하는 통합 시스템입니다.

### 전체 구조

```
약국배상책임보험 시스템
├── 1. 고객사 관리자 시스템 (imet.kr/hi/v2/)
│   ├── 로그인 페이지
│   └── 관리자 대시보드
│
├── 2. 약국 가입신청 시스템 (imet.kr/drugstore/)
│   ├── 팜페이스마트 (운영)
│   ├── 팜페이스마트 테스트
│   ├── 유비케어 (운영)
│   └── 유비케어 테스트
│
└── 3. 통합 관리자 CMS (disk-cms.simg.kr/pharmacy/)
    └── React 기반 관리 시스템
```

### 주요 기능
- 약국 보험 가입신청
- 보험료 실시간 계산
- **자동 승인 처리** (유비케어/유비케어테스트: ch=13)
- **수동 승인 처리** (팜페이스마트/팜페이스마트테스트: ch=10)
- 예치금 관리
- 정산 관리
- 상태 변경 및 워크플로우 관리

**업체별 처리 방식**:
- **팜페이스마트**: `submit.php` → 수동 승인 (관리자 승인 필요)
- **유비케어**: `ubcareSubmit.php` → 자동 승인 (즉시 승인 처리)

---

## 페이지 구조 및 용도

### 1. 고객사 관리자 시스템 (`imet.kr/hi/v2/`)

#### 로그인 페이지 (`login.html`)
- **URL**: https://imet.kr/hi/v2/login.html
- **용도**: 고객사 관리자 로그인
- **기능**: 아이디/비밀번호 로그인, 세션 관리, API v2 인증 (HMAC-SHA256)

#### 관리자 대시보드 (`dashboard.html`)
- **URL**: https://imet.kr/hi/v2/dashboard.html
- **용도**: 고객사 관리자 대시보드
- **기능**:
  - 약국 신청 목록 조회
  - 신청 상세 정보 확인
  - 상태 변경 (승인, 보류, 해지 등)
  - 예치금 현황 조회
  - 예치금 충전/리스트/사용내역
  - 일일 보고서
  - 월별 통계

### 2. 약국 가입신청 시스템 (`imet.kr/drugstore/`)

#### 지원 업체별 페이지

| 업체 | URL | API | 승인 방식 | 특징 |
|------|-----|-----|----------|------|
| 팜페이스마트 | `https://imet.kr/drugstore/pharmacy/` | `submit.php` | 수동 승인 (ch=10) | 운영 환경, 관리자 승인 필요 |
| 팜페이스마트 테스트 | `https://imet.kr/drugstore/pharmacyTest/` | `submit.php` | 수동 승인 (ch=10) | 개발/테스트, 관리자 승인 필요 |
| 유비케어 | `https://imet.kr/drugstore/ubcare/` | `ubcareSubmit.php` | 자동 승인 (ch=13) | 운영 환경, 즉시 승인 처리 |
| 유비케어 테스트 | `https://imet.kr/drugstore/ubcareTest/` | `ubcareSubmit.php` | 자동 승인 (ch=13) | 개발/테스트, 즉시 승인 처리 |

**주요 차이점**:
- **팜페이스마트**: `submit.php` 사용 → 수동 승인 모드 (ch=10) → 관리자가 disk-cms에서 승인 필요
- **유비케어**: `ubcareSubmit.php` 사용 → 자동 승인 모드 (ch=13) → 신청 시 즉시 승인 처리

#### 공통 기능
- 보험료 실시간 계산
- 가입신청 제출
- 유효성 검증 (주민번호, 사업자번호 등)
- 반응형 디자인 (모바일/태블릿/데스크탑)
- 자동 포맷팅 (전화번호, 사업자번호 등)

### 3. 통합 관리자 CMS (`disk-cms-react/src/pages/pharmacy/`)

#### 신청 목록 관리 (`Applications.tsx`)
- **URL**: https://disk-cms.simg.kr/pharmacy/applications
- **용도**: 전체 약국 신청 목록 조회 및 관리
- **기능**:
  - 신청 목록 조회 (페이지네이션, 필터링, 검색)
  - 상태별 필터링
  - 거래처별 필터링
  - 신청 상세보기/수정
  - 상태 변경 (승인, 보류, 해지 등)
  - 예치금 현황 조회
  - 일일 보고서
  - 업체 추가
  - API 키 관리

#### 컴포넌트 모달들
- `PharmacyDetailModal.tsx`: 신청 상세보기/수정
- `DepositBalanceModal.tsx`: 예치금 현황 조회
- `DepositChargeModal.tsx`: 예치금 충전
- `DepositListModal.tsx`: 예치금 리스트 조회
- `DepositUsageModal.tsx`: 예치금 사용내역 조회
- `ApiManagerModal.tsx`: API 키 관리
- `AddCompanyModal.tsx`: 업체 추가
- `DailyReportModal.tsx`: 일일 보고서

---

## 시스템 아키텍처

### 전체 아키텍처 흐름

```
사용자 (약국)
    ↓
imet.kr/drugstore/ (가입신청 시스템)
    ├── pharmacy/ (팜페이스마트) ──────────────┐
    ├── pharmacyTest/ (팜페이스마트 테스트) ─┤
    ├── ubcare/ (유비케어) ──────────────────┤
    └── ubcareTest/ (유비케어 테스트) ──────┤
    ↓                                        │
    ├─ [팜페이스마트 경로]                    │
    │  imet.kr/drugstore/api/submit.php      │
    │  → pharmacyApply 저장                  │
    │  → 메일 발송 (ch=10, 수동 승인 대기)    │
    │                                        │
    └─ [유비케어 경로]                        │
       imet.kr/drugstore/api/ubcareSubmit.php│
       → pharmacyApply 저장                  │
       → 자동 승인 처리 (ch=13)              │
       → imet.kr/hi/api/pharmacy-status-update_v2.php
       → 예치금 차감, 정산 기록 생성         │
    ↓                                        │
MySQL 데이터베이스                           │
    ├── pharmacyApply (신청 정보)            │
    ├── pharmacy_idList (업체 정보)          │
    ├── pharmacy_deposit (예치금)            │
    └── pharmacy_settlementList (정산 기록)  │
    ↓                                        │
disk-cms.simg.kr/pharmacy/applications (관리자 CMS)
    └── Applications.tsx (신청 목록 관리)    │
                                            │
[팜페이스마트 수동 승인 프로세스] ───────────┘
    관리자가 disk-cms에서 수동으로 승인 처리
    → imet.kr/hi/api/pharmacy-status-update_v2.php
    → 예치금 차감, 정산 기록 생성
```

### 기술 스택

#### 프론트엔드
- **고객사 관리자**: HTML5, CSS3, JavaScript (ES6+)
- **약국 신청**: HTML5, CSS3, JavaScript (ES6+)
- **통합 관리자**: React 18.3+, TypeScript, Ant Design

#### 백엔드
- **API**: PHP 5.5+ (호환성 고려)
- **데이터베이스**: MySQL
- **프록시 서버**: Node.js + Express.js

### 파일 구조

```
imet/
├── hi/v2/                    # 고객사 관리자 시스템
│   ├── login.html
│   ├── dashboard.html
│   ├── api/
│   │   └── login_v2.php
│   ├── css/
│   └── js/
│
├── drugstore/                # 약국 가입신청 시스템
│   ├── pharmacy/             # 팜페이스마트 (수동 승인)
│   ├── pharmacyTest/         # 팜페이스마트 테스트 (수동 승인)
│   ├── ubcare/               # 유비케어 (자동 승인)
│   ├── ubcareTest/           # 유비케어 테스트 (자동 승인)
│   ├── api/
│   │   ├── calculate.php    # 보험료 계산 (공통)
│   │   ├── submit.php       # 팜페이스마트 신청 처리 (수동 승인)
│   │   └── ubcareSubmit.php # 유비케어 신청 처리 (자동 승인)
│   └── common/
│
├── hi/api/                   # API v2 엔드포인트
│   ├── list_v2.php
│   ├── detail_v2.php
│   ├── pharmacy-status-update_v2.php
│   ├── pharmacy-premium-calculate_v2.php
│   ├── balance_v2.php
│   ├── deposit_balance_v2.php
│   ├── daily_stats_v2.php
│   └── monthly_stats_v2.php
│
└── api/pharmacy/             # 기타 API 엔드포인트
    ├── pharmacy-list.php
    ├── pharmacy-deposit-*.php
    └── ...

disk-cms-react/
├── src/pages/pharmacy/       # React 컴포넌트
│   ├── Applications.tsx
│   └── components/
│
└── routes/pharmacy/          # Node.js 프록시
    ├── pharmacy2.js
    ├── deposits.js
    ├── admin.js
    └── reports.js
```

---

## API 문서

### API v2 개요

약국안심보험 API v2는 HMAC 인증 기반의 RESTful API입니다.

#### 주요 특징
- **HMAC-SHA256 인증**: API 키와 서명 기반 보안 인증
- **JSON 입출력**: 표준 JSON 형식의 요청/응답
- **트랜잭션 지원**: 데이터 무결성 보장
- **세션 분리**: 기존 웹 시스템과 완전 독립

#### 인증 방식

모든 API 요청은 다음 헤더가 필요합니다:

```http
Authorization: Bearer {api_key}
X-Timestamp: {unix_timestamp}
X-Signature: {hmac_signature}
Content-Type: application/json
```

#### 서명 생성 방법

```javascript
const crypto = require('crypto');

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

### 주요 API 엔드포인트

#### 1. 리스트 조회
- **엔드포인트**: `POST https://imet.kr/hi/api/list_v2.php`
- **기능**: 약국 보험 신청자 목록 조회
- **파라미터**: `section`, `chchange`, `filter_type`, `filter_query`, `page`, `pageSize`

#### 2. 상세 조회
- **엔드포인트**: `POST https://imet.kr/hi/api/detail_v2.php`
- **기능**: 특정 약국의 상세 정보 조회
- **파라미터**: `section`, `item_num`

#### 3. 상태 변경
- **엔드포인트**: `POST https://imet.kr/hi/api/pharmacy-status-update_v2.php`
- **기능**: 약국의 처리 상태 변경
- **파라미터**: `item_num`, `new_status`
- **특별 처리**:
  - 승인(13): 예치금 차감, 정산 기록 생성, 이메일 발송
  - 보류(7): 예치금 환급, 정산 기록 변경
  - 해지완료(16): 일할 계산으로 환급

#### 4. 기본정보 수정
- **엔드포인트**: `POST https://imet.kr/hi/api/pharmacyApply-num-update_v2.php`
- **기능**: 약국의 기본 정보 수정
- **파라미터**: `item_num`, `company`, `email`, `mobile_phone`, `memo` 등

#### 5. 보험료 계산
- **엔드포인트**: `POST https://imet.kr/hi/api/pharmacy-premium-calculate_v2.php`
- **기능**: 약국의 보험료 계산 및 업데이트
- **파라미터**: `item_num`, `expert_count`, `inventory_value`, `business_area`

#### 6. 잔고 조회
- **엔드포인트**: `POST https://imet.kr/hi/api/balance_v2.php`
- **기능**: 계정의 현재 예치금 잔고 조회

#### 7. 예치금 내역 조회
- **엔드포인트**: `POST https://imet.kr/hi/api/deposit_balance_v2.php`
- **기능**: 예치금 입금 내역 조회 (페이지네이션 지원)

#### 8. 일별 실적 조회
- **엔드포인트**: `POST https://imet.kr/hi/api/daily_stats_v2.php`
- **기능**: 일별 승인/해지 실적 조회

#### 9. 월별 실적 조회
- **엔드포인트**: `POST https://imet.kr/hi/api/monthly_stats_v2.php`
- **기능**: 3개년 월별 승인/해지 실적 조회

### API 검증 포털

- **URL**: https://imet.kr/hi/api/verification/
- **기능**: 모든 API 엔드포인트를 통합 관리하고 테스트할 수 있는 중앙 허브

---

## 데이터베이스 스키마

### 주요 테이블

#### 1. pharmacyApply
약국 신청 정보를 저장하는 메인 테이블입니다.

**주요 필드**:
- `num`: 신청 번호 (PK)
- `company`: 회사명
- `school2`: 약국명
- `damdangja`: 담당자명
- `hphone`, `hphone2`: 연락처
- `chemist`: 약사 정보
- `chemistDesignNumer`: 약사 설계 번호
- `area`: 지역
- `areaDesignNumer`: 지역 설계 번호
- `ch`: 상태 코드 (1~17)
- `preminum`: 보험료
- `account`: 업체 번호 (pharmacy_idList와 연결)
- `wdate`: 신청일
- `wdate_2`: 승인일
- `memo`: 메모

**상태 코드 (ch)**:
- `1`: 접수
- `2`: 보험료
- `3`: 청약서안내
- `4`: 자필서류
- `5`: 입금확인
- `6`: 계약완료
- `7`: 보류
- `8`: 카드승인
- `9`: 단순산출
- `10`: 메일 보냄
- `11`: 질문서받음
- `12`: 해피콜
- `13`: 승인
- `14`: 증권발급
- `15`: 해지요청
- `16`: 해지완료
- `17`: 설계중

#### 2. pharmacy_idList
약국 업체 정보를 저장하는 테이블입니다.

**주요 필드**:
- `num`: 업체 번호 (PK)
- `directory`: 디렉토리 경로 (pharmacy, ubcare, pharmacyTest, ubcareTest)
- `mem_id`: 사용자 아이디
- `passwd`: 비밀번호 (MD5 해시)
- `name`: 업체명
- `hphone1`: 연락처
- `ch`: 처리 모드 (10=수동, 13=자동)
- `api_key`: API 키 (pk_...)
- `api_secret`: API 시크릿 해시 (SHA256)
- `api_enabled`: API 활성화 여부 (0/1)
- `api_expires`: API 만료일
- `wdate`: 등록일

**pharmacy_idList 조회 프로세스**:
1. 프론트엔드에서 URL 경로에서 `directory` 값 추출
2. `ubcareSubmit.php`에서 `pharmacy_idList` 조회
3. 업체 등록 여부 확인
4. `account` 값 설정 (`pharmacyApply.account = pharmacy_idList.num`)
5. 처리 모드 결정 (`ch` 값에 따라 자동/수동 승인)
6. API 인증 정보 획득 (자동 승인 시 사용)

#### 3. pharmacy_deposit
예치금 거래 내역을 저장하는 테이블입니다.

**주요 필드**:
- `num`: 거래 번호 (PK)
- `account`: 업체 번호
- `money`: 금액 (양수: 입금, 음수: 출금)
- `sort`: 거래 유형 코드
- `wdate`: 거래일

**거래 유형 (sort)**:
- `98`: 현재 잔고 (최신값)
- `99`: 예치금 입금
- `13`: 승인 시 예치금 차감 (음수)
- `7`: 보류 시 예치금 환급

#### 4. pharmacy_settlementList
정산 기록을 저장하는 테이블입니다.

**주요 필드**:
- `num`: 정산 번호 (PK)
- `applyNum`: 신청 번호 (pharmacyApply.num)
- `account`: 업체 번호
- `sort`: 정산 유형 코드
- `approvalPreminum`: 승인 보험료
- `proPreminum`: 전문인 보험료
- `areaPreminum`: 화재 보험료
- `wdate`: 정산일

**정산 유형 (sort)**:
- `13`: 승인
- `7`: 보류
- `16`: 해지완료

### 테이블 간 관계

```
pharmacy_idList (업체)
    │
    │ 1:N
    │
    ├─── pharmacyApply (신청) ────┐
    │         │                    │
    │         │ 1:N                │ 1:N
    │         │                    │
    │         │                    │
    └─── pharmacy_deposit (예치금) │
                                   │
                         pharmacy_settlementList (정산)
```

---

## 개발 계획

### 현재 구현 상태

#### ✅ 완료된 기능
- 약국 가입신청 폼 (`imet.kr/drugstore/`)
- 보험료 실시간 계산
- 신청 데이터 저장 (`pharmacyApply`)
- 자동 승인 처리 (유비케어/유비케어테스트)
- 이메일 발송
- 신청 목록 조회 (`disk-cms.simg.kr/pharmacy/applications`)
- 신청 상세보기/수정 (`PharmacyDetailModal.tsx`)
- 상태 변경 (승인, 보류, 해지 등)
- 예치금 현황 조회 (`DepositBalanceModal.tsx`)
- 예치금 충전 (`DepositChargeModal.tsx`)
- 예치금 리스트 조회 (`DepositListModal.tsx`)
- 예치금 사용내역 조회 (`DepositUsageModal.tsx`)
- API 키 관리 (`ApiManagerModal.tsx`)
- 업체 추가 (`AddCompanyModal.tsx`)
- 잔고 부족 시에도 정산 기록 생성 및 예치금 차감 처리 (2026-01-09 개선)

#### ⚠️ 개선 필요 사항
- 상태 변경 시 확인 모달 개선
- 해지 처리 시 일할 계산 모달 추가
- 보류 처리 시 환급 확인 모달 추가
- 월간 보고서 기능 완성
- 통계 대시보드 구현
- 알림 시스템 (예치금 부족 알림 등)

### 우선순위별 개발 계획

#### Phase 1: 핵심 기능 완성 (우선순위 높음)
1. 상태 변경 워크플로우 개선 (1주)
2. 예치금 관리 개선 (1주)
3. 보고서 기능 완성 (1주)

#### Phase 2: 사용자 경험 개선 (우선순위 중간)
1. 대시보드 구현 (1주)
2. 검색 및 필터 개선 (3일)
3. 알림 시스템 (1주)

#### Phase 3: 고급 기능 (우선순위 낮음)
1. 자동화 기능 (2주)
2. 분석 및 리포트 (2주)

---

## 핵심 프로세스

### 1. 약국 가입신청 프로세스

#### 팜페이스마트/팜페이스마트테스트 (수동 승인)

```
1. 약국이 imet.kr/drugstore/pharmacy/ 또는 pharmacyTest/ 접속
   ↓
2. 보험료 실시간 계산 (imet.kr/drugstore/api/calculate.php)
   ↓
3. 가입신청 제출 (imet.kr/drugstore/api/submit.php)
   ↓
4. pharmacy_idList 조회 (directory='pharmacy' 또는 'pharmacyTest')
   - 업체 등록 여부 확인
   - account 값 설정
   - 처리 모드 확인 (ch=10, 수동 승인 모드)
   ↓
5. pharmacyApply 테이블에 신청 데이터 저장
   - 상태: ch=10 (메일 보냄)
   ↓
6. 이메일 발송 (관리자에게 알림)
   ↓
7. 관리자가 disk-cms.simg.kr/pharmacy/applications에서 수동 승인
   - imet.kr/hi/api/pharmacy-status-update_v2.php 호출
   - 상태 변경: ch=10 → ch=13 (승인)
   - 예치금 차감 (pharmacy_deposit)
   - 정산 기록 생성 (pharmacy_settlementList)
```

#### 유비케어/유비케어테스트 (자동 승인)

```
1. 약국이 imet.kr/drugstore/ubcare/ 또는 ubcareTest/ 접속
   ↓
2. 보험료 실시간 계산 (imet.kr/drugstore/api/calculate.php)
   ↓
3. 가입신청 제출 (imet.kr/drugstore/api/ubcareSubmit.php)
   ↓
4. pharmacy_idList 조회 (directory='ubcare' 또는 'ubcareTest')
   - 업체 등록 여부 확인
   - account 값 설정
   - 처리 모드 확인 (ch=13, 자동 승인 모드)
   - API 키/시크릿 획득
   ↓
5. pharmacyApply 테이블에 신청 데이터 저장
   ↓
6. 자동 승인 처리 (ch=13인 경우)
   - imet.kr/hi/api/pharmacy-status-update_v2.php 자동 호출
   - HMAC 인증 (API 키/시크릿 사용)
   - 상태 변경: 즉시 ch=13 (승인)
   - 예치금 차감 (pharmacy_deposit, sort=13)
   - 정산 기록 생성 (pharmacy_settlementList, sort=13)
   - 이메일 발송 (승인 완료 알림)
```

**주요 차이점**:
- **팜페이스마트**: `submit.php` 사용, 수동 승인 (ch=10), 관리자 승인 필요
- **유비케어**: `ubcareSubmit.php` 사용, 자동 승인 (ch=13), 즉시 승인 처리

### 2. 상태 변경 프로세스 (승인)

```
1. 상태 변경 요청 (imet.kr/hi/api/pharmacy-status-update_v2.php)
   ↓
2. 현재 상태 확인
   ↓
3. 승인(13) 처리 시:
   - 예치금 잔고 확인 (pharmacy_deposit, sort=98)
   - 보험료 차감 (pharmacy_deposit, sort=13, 음수)
   - 정산 기록 생성 (pharmacy_settlementList, sort=13)
   - 잔고 업데이트 (pharmacy_deposit, sort=98)
   - 상태 변경 (pharmacyApply.ch = 13)
   - 이메일 발송
   ↓
4. 잔고 부족 시:
   - 마이너스 잔고 허용 (2026-01-09 개선)
   - 정산 기록은 반드시 생성
   - 경고 메시지 반환
```

### 3. 상태 변경 프로세스 (보류)

```
1. 상태 변경 요청 (imet.kr/hi/api/pharmacy-status-update_v2.php)
   ↓
2. 승인(13) → 보류(7) 변경 시:
   - 정산 기록 확인 (pharmacy_settlementList, sort=13)
   - 예치금 환급 (pharmacy_deposit, sort=7)
   - 정산 기록 변경 (pharmacy_settlementList, sort=7)
   - 상태 변경 (pharmacyApply.ch = 7)
```

### 4. 상태 변경 프로세스 (해지완료)

```
1. 상태 변경 요청 (imet.kr/hi/api/pharmacy-status-update_v2.php)
   ↓
2. 해지요청(15) → 해지완료(16) 변경 시:
   - 일할 계산 수행
   - 공식: (종기-해지일)/(종기-시기) × 총보험료
   - 예치금 환급 (pharmacy_deposit, sort=16)
   - 정산 기록 생성 (pharmacy_settlementList, sort=16)
   - 상태 변경 (pharmacyApply.ch = 16)
```

### 5. 고객사 관리자 확인 프로세스

```
1. 고객사 관리자 로그인 (imet.kr/hi/v2/login.html)
   ↓
2. 대시보드 접속 (imet.kr/hi/v2/dashboard.html)
   ↓
3. API 호출 (HMAC 인증)
   - imet.kr/hi/api/list_v2.php: 신청 목록 조회
   - imet.kr/hi/api/detail_v2.php: 신청 상세 조회
   - imet.kr/hi/api/pharmacy-status-update_v2.php: 상태 변경
   - imet.kr/hi/api/balance_v2.php: 잔고 조회
   - imet.kr/hi/api/deposit_balance_v2.php: 예치금 내역 조회
   - imet.kr/hi/api/daily_stats_v2.php: 일별 실적 조회
   - imet.kr/hi/api/monthly_stats_v2.php: 월별 실적 조회
```

---

## 참고 자료

### 관련 문서
- [약국 가입신청 시스템 Readme](../../../imet/drugstore/Readme.md)
- [API 검증 포털](https://imet.kr/hi/api/verification/)

### 연락처
- **기술 지원**: ih@simg.kr
- **전화**: 070-7813-1674 (평일 09:00-18:00)

---

**작성일**: 2026-01-09  
**작성자**: AI Assistant  
**버전**: 1.0  
**최종 업데이트**: 2026-01-09
