# 작업일지 - 약국배상책임보험

> **카테고리**: 약국배상책임보험 관련 작업  
> **업데이트 규칙**: 기능 완성 시마다 즉시 업데이트

---

## ✅ 완료된 작업

### 2026-02-02 (약국배상책임보험) - 증권발급(14) → 계약완료(6) 자동 변경 처리

#### 작업 내용
- **기능**: 증권발급(14) 상태가 되면 자동으로 계약완료(6)로 변경되도록 수정
- **파일**: 
  - `imet/api/pharmacy/pharmacy-certificate-update.php` (증권번호 입력 시, 증권 발급 완료 시)
  - `imet/api/pharmacy/pharmacy-status-update.php` (상태 변경 요청 시, 기존 상태 확인 시)
  - `imet/api/pharmacy/update_status_14_to_6.sql` (기존 데이터 일괄 업데이트 SQL)
- **주요 구현 사항**:
  - ✅ 증권번호 입력 시 `ch = '14'` → `ch = '6'`로 변경
  - ✅ 증권 발급 완료 시 (`certiCount <= 0`) `ch = 14` → `ch = 6`로 변경
  - ✅ 상태 변경 요청 시 14로 변경하려고 하면 자동으로 6으로 변환
  - ✅ 기존 상태가 14인 경우 자동으로 6으로 변경하고 DB 업데이트
  - ✅ 기존 데이터 일괄 업데이트 SQL 파일 생성

#### 결과
- 증권발급 시 자동으로 계약완료 상태로 변경됨
- 기존 증권발급(14) 상태 데이터도 자동으로 계약완료(6)로 처리됨
- 상태 흐름: 메일보냄(10) → 승인(13) → 설계중(17) → 계약완료(6)

---

### 2026-02-02 (약국배상책임보험) - 상태 변경 시 잔고 부족 에러 처리 개선

#### 작업 내용
- **문제**: Applications 페이지에서 메일보냄(10) → 승인(13) 상태 변경 시 잔고 부족으로 500 에러 발생
- **원인**: PHP API에서 잔고 부족 시 Exception을 던져 HTTP 500으로 반환
- **파일**: 
  - `imet/api/pharmacy/pharmacy-status-update.php` (잔고 부족 체크 제거, 마이너스 잔고 허용)
- **주요 구현 사항**:
  - ✅ 잔고 부족 체크 제거 (마이너스 잔고 허용)
  - ✅ 예치금 차감 거래 내역 추가 (`pharmacy_deposit` 테이블에 `sort='13'`으로 차감 내역 기록)
  - ✅ 응답에 잔고 부족 경고 메시지 포함 (`is_negative_balance`, `warning` 필드)
  - ✅ `imet/hi/api/pharmacy-status-update_v2.php`와 동일한 로직으로 통일

#### 결과
- 잔고 부족해도 승인 처리가 정상적으로 진행됨
- 마이너스 잔고 허용 (업체와 담당자가 협의하여 처리)
- 예치금 차감 거래 내역이 별도로 기록되어 추적 가능
- 사용자에게 잔고 부족 경고 메시지 표시

---

### 2026-01-28 (약국배상책임보험) - Applications 페이지 “설계리스트 엑셀” 기능 추가(레거시 기능 매칭)

#### 작업 내용
- **기능**: 레거시 `applications.html`의 “승인건 중 설계리스트 엑셀” 기능을 React Applications 페이지에 추가
- **파일**:
  - `src/pages/pharmacy/Applications.tsx` (설계리스트 엑셀 버튼/다운로드 로직 추가)
  - `routes/pharmacy/pharmacy2.js` (중복 `module.exports` 정리)
- **주요 구현 사항**:
  - ✅ `POST /api/pharmacy2/design-list-excel` 호출로 설계리스트 데이터 조회 (`trigger=value1`)
  - ✅ ExcelJS로 엑셀 파일 생성 후 다운로드 (시트명: 설계리스트, 파일명: `설계리스트_YYYYMMDD.xlsx`)
  - ✅ 다운로드 중 중복 클릭 방지(loading state) 및 완료 후 목록 새로고침

#### 결과
- 레거시 대비 누락되었던 설계리스트 엑셀 다운로드 기능이 React UI에서 동일하게 사용 가능

### 2026-01-26 (약국배상책임보험) - Applications 페이지 에러 핸들링 개선

#### 작업 내용
- **기능**: 약국배상책임보험 Applications 페이지에서 발생하는 500 에러에 대한 상세 로깅 및 에러 핸들링 개선
- **파일**: 
  - `routes/pharmacy/pharmacy2.js` (서버 측 에러 핸들링 개선)
  - `src/pages/pharmacy/Applications.tsx` (클라이언트 측 에러 핸들링 개선)
- **주요 구현 사항**:
  - ✅ 서버 측 에러 핸들링 개선 (`pharmacy2.js`)
    - `handleApiError` 함수 개선: 에러 상세 정보 로깅 추가
    - 에러 응답 구조 개선: `status`, `statusText`, `details`, `code` 포함
    - PHP API 에러 응답 처리 개선: `error` 또는 `message` 필드 우선 사용
    - 네트워크 오류와 타임아웃 오류 구분 처리
  - ✅ 클라이언트 측 에러 핸들링 개선 (`Applications.tsx`)
    - 모든 API 호출에 상세 에러 로깅 추가
      - `loadApplications`: 목록 로드 에러 상세 로깅
      - `handleStatusChange`: 상태 변경 에러 상세 로깅
      - `handleMemoSave`: 메모 저장 에러 상세 로깅
      - `handleDesignNumberSave`: 설계번호 저장 에러 상세 로깅
    - 에러 메시지 우선순위 개선: `error` → `message` → 기본 메시지
    - 요청 파라미터 및 응답 데이터 로깅 추가

#### 개선 효과
- 500 에러 발생 시 원인 파악이 용이해짐 (상세 로그 제공)
- 사용자에게 더 명확한 에러 메시지 표시
- 디버깅 시간 단축 (에러 발생 위치 및 원인 빠른 확인)

---

### 2026-01-26 (약국배상책임보험) - Applications 페이지 필터/버튼 레이아웃 개선

#### 작업 내용
- **기능**: 약국배상책임보험 Applications 페이지의 필터와 버튼 레이아웃을 2행에서 1행 구조로 개선
- **파일**: 
  - `src/pages/pharmacy/Applications.tsx` (필터/버튼 레이아웃 개선, 버튼 스타일 통일)
- **주요 구현 사항**:
  - ✅ FilterBar의 `actionButtons` prop 제거하고 버튼들을 FilterBar 내부 children으로 이동
  - ✅ 필터 Select들과 액션 버튼들을 같은 행에 배치 (대리운전 EndorseList 페이지 스타일 참조)
  - ✅ 버튼 스타일 통일
    - 높이: `h-7` (28px)
    - 패딩: `px-2 py-0.5`
    - 테두리: `border border-primary`
    - 텍스트: `text-xs`
    - 호버 효과: `hover:bg-primary hover:text-white`
    - 아이콘 크기: `w-3 h-3`
  - ✅ 버튼 목록: 일별실적, 예치잔액, 엑셀 다운로드, 새로고침, 정리, API 관리, 업체추가
  - ✅ "업체추가" 버튼은 `ml-auto`로 오른쪽 끝에 배치

#### 개선 효과
- 필터와 버튼이 한 행에 표시되어 화면 공간 효율성 향상
- 대리운전 페이지와 일관된 UI/UX 제공
- 더 컴팩트한 레이아웃으로 사용자 경험 개선

---

### 2026-01-14 (약국배상책임보험) - 운영 가이드 문서 페이지 헤더 고정 및 목차 동기화 개선

#### 작업 내용
- **기능**: 약국배상책임보험 운영 가이드 문서 페이지의 헤더 고정 및 목차와 본문 동기화 개선
- **파일**: 
  - `src/pages/pharmacy/Documentation.tsx` (헤더 고정, 목차 위치 조정, 스크롤 감지 로직 개선)
- **주요 구현 사항**:
  - ✅ 전체 앱 헤더 아래에 Documentation 헤더 위치 조정
    - 헤더 위치: `top-0` → `top-16` (64px, 전체 앱 헤더 높이)
    - z-index 조정: `z-50` → `z-40` (전체 앱 헤더는 `z-30`)
    - 헤더가 전체 앱 헤더 아래에 고정되도록 수정
  - ✅ 목차 고정 위치 조정
    - 목차 위치: `top-24` (96px) → `top-[187px]` (전체 앱 헤더 64px + Documentation 헤더 65px + 간격 58px)
    - 목차가 두 헤더 아래에 고정되어 본문만 스크롤되도록 수정
  - ✅ 스크롤 오프셋 계산 개선
    - `handleNavClick`: 전체 앱 헤더(64px) + Documentation 헤더(65px) + 여유 공간(30px) = 159px 고려
    - 목차 클릭 시 콘텐츠가 헤더 아래로 숨겨지지 않도록 수정
  - ✅ 목차와 본문 동기화 개선
    - 스크롤 감지 로직 개선: 섹션의 상단과 하단을 모두 확인하여 현재 스크롤 위치가 섹션 내부에 있을 때만 활성화
    - 여유 공간 증가: 30px → 50px로 조정하여 더 정확한 감지
    - 목차와 본문이 정확히 동기화되도록 수정

#### 해결한 이슈
- 전체 앱 헤더가 Documentation 헤더에 가려지는 문제 해결 (헤더 위치 조정)
- 목차가 스크롤 시 위로 올라가는 문제 해결 (목차 고정 위치 조정)
- 목차 클릭 시 콘텐츠가 헤더 아래로 숨겨지는 문제 해결 (스크롤 오프셋 계산 개선)
- 목차와 본문이 동기화되지 않는 문제 해결 (스크롤 감지 로직 개선)

---

### 2026-01-10 (약국배상책임보험) - UI/UX 개선 및 기능 보완

#### 34) 약국배상책임보험 UI/UX 개선 및 기능 보완
- **날짜 표시 오류 수정**:
  - `approval_date`가 "0000-00-00 00:00:00"일 때 "NaN-NaN-NaN NaN:NaN:NaN"으로 표시되는 문제 수정
  - `request_date`도 동일한 문제 수정
  - 무효한 날짜는 "-"로 표시하도록 개선
- **보험료 표시 개선**:
  - 보험료 표시에서 "원" 텍스트 제거 (예: "94,720원" → "94,720")
  - 테이블 컬럼과 모바일 카드 모두 적용
- **상태 선택상자 스타일 개선**:
  - 상태 선택상자가 일반 select처럼 보이도록 스타일 개선
  - 테두리, 배경색, 드롭다운 화살표 아이콘 추가
  - 포커스 스타일 추가
- **상세보기 모달 화재보험 가입 여부 판단 로직 개선**:
  - `business_area`(사업장면적)가 있으면 화재보험 가입 가능 상태로 표시
  - `jaegojasan` 값을 우선 사용하도록 수정 (이전 버전과 동일)
  - `business_area`가 있고 `jaegojasan`이 없으면 기본값 "1" (5천만 원) 설정
- **보험료 자동 재계산 기능 추가**:
  - 전문인수(`expert_count`) 변경 시 보험료 자동 재계산
  - 보상한도(`coverage_limit`) 변경 시 보험료 자동 재계산
  - 재고자산(`inventory_value`) 변경 시 보험료 자동 재계산
  - 사업장면적(`business_area`) 변경 시 디바운스 처리 후 보험료 자동 재계산 (500ms)
  - `/api/pharmacy2/calculate-premium` API 연동
  - 이전 버전(disk-cms)과 동일한 동작 구현
- **디버깅 코드 제거**:
  - `DepositBalanceModal.tsx`에서 디버깅용 `127.0.0.1:7242/ingest` fetch 호출 제거
  - 브라우저 콘솔 에러 해결
- **파일**:
  - `src/pages/pharmacy/Applications.tsx`: 날짜 표시, 보험료 표시, 상태 선택상자 스타일 개선
  - `src/pages/pharmacy/components/PharmacyDetailModal.tsx`: 화재보험 가입 여부 판단 로직, 보험료 자동 재계산 기능 추가
  - `src/pages/pharmacy/components/DepositBalanceModal.tsx`: 디버깅 코드 제거

---

### 2026-01-09 (Phase 3 진행) - 일별/월별 실적 조회에 증권발급 기준 추가

#### 32) 실적 조회 기능 개선 및 증권발급 기준 추가
- **일별/월별 실적 조회에 증권발급 기준 추가**:
  - 기준 선택 기능: 승인 기준 / 증권발급 기준 선택 가능
  - 승인 기준: `pharmacy_settlementList` 테이블 사용 (`sort=13` 승인, `sort=16` 해지)
  - 증권발급 기준: `pharmacyApply` 테이블 사용 (`ch='14'` 증권발급, `ch='16'` 해지완료)
- **백엔드 쿼리 로직 개선**:
  - `SUBSTRING(wdate_2, 1, 10)` → `DATE(wdate_2)` 변경 (DATETIME 타입 처리)
  - `wdate_2 IS NOT NULL` 조건 추가
  - `ch` 필드 비교 로직 개선 (VARCHAR 타입 처리, `trim()` 사용)
  - 디버깅 로그 추가 (`?debug=1` 파라미터 지원)
- **프론트엔드 UI 개선** (`DailyReportModal.tsx`):
  - 기준 선택 라디오 버튼을 모달 헤더로 이동
  - 필터 레이블 제거 (거래처, 년도, 월)
  - 통계 카드 한 줄 표시 (`whitespace-nowrap` 적용)
  - 필터 변경 시 자동 조회 기능 추가
  - 모달 열릴 때 현재 월 데이터 자동 로드
  - 중복 호출 방지 로직 개선 (`useCallback`, `useEffect` 최적화)
- **확인된 사항**:
  - ✅ 증권번호 입력 시 `wdate_2` 필드가 `NOW()`로 업데이트됨 (`pharmacy-certificate-update.php` 확인)
  - ✅ 2025년 12월 데이터 정상 조회 확인 (3건, 449,300원)
  - ⚠️ 2026년 1월 데이터가 0인 이유: 해당 기간에 증권번호가 입력된 레코드가 실제로 없음
- **파일**:
  - `imet/api/pharmacy/pharmacy-daily-report.php`: 증권발급 기준 쿼리 로직 추가 및 개선
  - `imet/api/pharmacy/pharmacy-monthly-report.php`: 증권발급 기준 쿼리 로직 추가 및 개선
  - `disk-cms-react/routes/pharmacy/reports.js`: `criteria` 파라미터 전달 로직 추가
  - `disk-cms-react/src/pages/pharmacy/components/DailyReportModal.tsx`: UI 개선 및 자동 조회 기능 추가
- **결과**: 일별/월별 실적 조회에서 승인 기준과 증권발급 기준을 선택하여 조회할 수 있는 기능 완료, 프론트엔드 UX 개선 완료

---

### 2026-01-08 (Phase 3 진행) - 약국배상책임보험 정산 데이터 정리 기능 구현

#### 31) 정산 데이터 정리 모달 구현 완료
- **정산 데이터 정리 모달** (`SettlementCleanupModal.tsx`):
  - 거래처 불일치 데이터 조회 기능
  - `pharmacy_settlementList`와 `pharmacyApply` 테이블의 `account` 불일치 데이터만 필터링
  - 테이블: 신청번호, 상태, 승인보험료, 정산 거래처, 약국 거래처 표시
  - 상태명 변환 (1=정상, 2=보류 또는 메일보냄)
  - 금액 포맷팅 (콤마 구분)
  - 통계 정보 표시 (불일치 데이터 건수)
  - 안내 메시지 표시 (거래처 불일치 설명)
- **Applications.tsx 수정**:
  - 새로고침 버튼 우측에 "정리" 버튼 추가
  - `AlertTriangle` 아이콘 사용
  - 정리 모달 상태 관리 추가
  - 정리 모달 컴포넌트 import 및 렌더링
- **PHP API 구현** (`imet/api/pharmacy/pharmacy-settlement-cleanup.php`):
  - `pharmacy_settlementList` 전체 데이터 조회
  - `pharmacyApply` 테이블과 INNER JOIN
  - `pharmacy_settlementList.account != pharmacyApply.account` 조건으로 필터링
  - 반환 데이터: `applyNum`, `sangtae`, `approvalPreminum`, `settlementAccount`, `pharmacyAccount`
  - JSON 응답 형식
- **Node.js 프록시 라우터** (`routes/pharmacy.js`):
  - `GET /api/pharmacy/cleanup` 엔드포인트 추가
  - PHP API 프록시 역할 (`https://imet.kr/api/pharmacy/pharmacy-settlement-cleanup.php`)
  - 타임아웃 설정 (30초)
  - 에러 핸들링 및 로깅
- **파일**:
  - `src/pages/pharmacy/components/SettlementCleanupModal.tsx`: 정리 모달 컴포넌트 (신규)
  - `src/pages/pharmacy/components/Applications.tsx`: 정리 버튼 및 모달 통합
  - `imet/api/pharmacy/pharmacy-settlement-cleanup.php`: PHP API 구현 (신규)
  - `routes/pharmacy.js`: cleanup 엔드포인트 추가
- **결과**: Applications 페이지의 "정리" 버튼 클릭 시 거래처 불일치 데이터를 확인할 수 있는 모달 제공, 데이터 정합성 검증 기능 완료

---

### 2026-01-08 (Phase 3 진행) - 약국배상책임보험 예치금 관리 시스템 구현

#### 30) 예치금 충전/리스트/사용내역 모달 구현 완료
- **예치금 충전 모달** (`DepositChargeModal.tsx`):
  - 거래처별 예치금 충전 기능
  - 금액 입력 (콤마 자동 포맷팅, 최대 10억원)
  - 입금일 선택 (DatePicker, 오늘 날짜 기본값)
  - 메모 입력 (최대 500자)
  - 폼 검증 및 에러 메시지 표시
  - 충전 완료 후 예치금 현황 자동 갱신
- **예치금 리스트 모달** (`DepositListModal.tsx`):
  - 거래처별 예치금 입금 내역 조회 (sort='99')
  - 테이블: 번호, 예치일, 예치금액
  - 페이지네이션 지원 (20개씩)
  - 합계 및 잔액 표시 (테이블 하단)
  - 엑셀 다운로드 기능 (ExcelJS 사용)
  - 파일명: `예치리스트_{거래처명}_{날짜}.xlsx`
- **예치금 사용내역 모달** (`DepositUsageModal.tsx`):
  - 거래처별 예치금 사용 내역 조회
  - 테이블: 번호, 신청번호, 사용일, 승인보험료, 전문인보험료, 화재보험료, 구분
  - 구분별 배지 표시 (승인=사용, 취소/해지완료=환급)
  - 순 변동액 계산 및 표시 (사용-환급)
  - 페이지네이션 지원 (20개씩)
  - 엑셀 다운로드 기능
  - 파일명: `사용내역_{거래처명}_{날짜}.xlsx`
- **PHP API 구현**:
  - `imet/api/pharmacy/pharmacy-deposit-add.php`: 예치금 충전 API (POST)
  - `imet/api/pharmacy/pharmacy-deposit-list.php`: 예치금 리스트 조회 API (GET, 페이징 지원)
  - `imet/api/pharmacy/pharmacy-deposit-usage.php`: 사용 내역 조회 API (GET, 페이징 지원)
- **Node.js 프록시 라우터** (`routes/pharmacy/deposits.js`):
  - `POST /api/pharmacy-deposits/deposit`: 예치금 충전 프록시
  - `GET /api/pharmacy-deposits/list/:accountNum`: 예치금 리스트 조회 프록시
  - `GET /api/pharmacy-deposits/usage/:accountNum`: 사용 내역 조회 프록시
  - 파라미터 검증 및 에러 핸들링
  - 타임아웃 설정 (30초)
- **DepositBalanceModal 통합**:
  - "충전", "예치리스트", "사용내역" 버튼 클릭 시 각 모달 열기
  - 서브 모달 상태 관리 (chargeModal, listModal, usageModal)
  - 충전 완료 시 예치금 현황 자동 갱신
- **파일**:
  - `src/pages/pharmacy/components/DepositChargeModal.tsx`: 예치금 충전 모달 (231줄)
  - `src/pages/pharmacy/components/DepositListModal.tsx`: 예치금 리스트 모달 (312줄)
  - `src/pages/pharmacy/components/DepositUsageModal.tsx`: 사용내역 모달 (378줄)
  - `src/pages/pharmacy/components/DepositBalanceModal.tsx`: 서브 모달 통합
  - `imet/api/pharmacy/pharmacy-deposit-add.php`: PHP API 구현
  - `imet/api/pharmacy/pharmacy-deposit-list.php`: PHP API 구현
  - `imet/api/pharmacy/pharmacy-deposit-usage.php`: PHP API 구현
  - `routes/pharmacy/deposits.js`: 프록시 라우터 업데이트
- **결과**: 예치금 현황 조회 모달의 모든 기능 완전 구현 완료, 충전/리스트/사용내역 조회 및 엑셀 다운로드 기능 제공

#### 29) 예치금 현황 조회 모달 완전 구현 완료
- **예치금 현황 조회 모달** (`DepositBalanceModal.tsx`):
  - 전체 거래처 예치금 현황 조회 기능
  - 상단 통계 카드: 총 예치금액, 총 사용금액, 총 잔액 (그라데이션 배경)
  - 필터: 거래처명 검색 기능
  - 테이블: 거래처별 예치금 총액, 사용금액, 현재 잔액 표시
  - 페이지네이션 지원 (20개씩)
  - 관리 버튼: 충전, 예치리스트, 사용내역 (TODO 상태)
- **PHP API 구현** (`imet/api/pharmacy/pharmacy-deposit-summary.php`):
  - 전체 거래처 예치금 현황 조회 API
  - 예치금 총액 계산: `sort='99'`의 합계
  - 현재 잔액 계산: `sort='98'`의 최신값
  - 사용금액 계산: 예치금 총액 - 현재 잔액
  - 검색 기능: 거래처명(directory) 또는 이름(name)으로 검색
  - 페이지네이션 지원
- **Node.js 프록시 라우터** (`routes/pharmacy/deposits.js`):
  - `/api/pharmacy-deposits/summary` 엔드포인트 구현
  - PHP API 프록시 역할
  - 파라미터 검증 및 에러 핸들링
  - 타임아웃 설정 (30초)
- **서버 라우팅 설정**:
  - `server.js`에 `/api/pharmacy-deposits` 라우트 추가
- **파일**:
  - `src/pages/pharmacy/components/DepositBalanceModal.tsx`: 완전 구현 (379줄)
  - `imet/api/pharmacy/pharmacy-deposit-summary.php`: PHP API 구현 (187줄)
  - `routes/pharmacy/deposits.js`: 프록시 라우터 구현 (460줄)
  - `server.js`: 라우트 등록
- **결과**: 약국배상책임보험 예치금 현황 조회 기능 완전 구현 완료, Applications 페이지의 "예치잔액" 버튼 클릭 시 전체 거래처 예치금 현황 확인 가능

---

### 2026-01-07 (Phase 3 진행) - 보험 상품 모듈 개발 시작

#### 23) 보험 상품 모듈용 공통 컴포넌트 개발 완료
- **FileUpload 컴포넌트** (`src/components/FileUpload.tsx`):
  - 파일 업로드 기능
  - 파일 종류 선택 옵션
  - 파일 크기 제한 (기본 10MB)
  - 업로드된 파일 목록 표시
  - 다운로드/삭제 기능
  - Props: `accept`, `multiple`, `maxSize`, `fileTypeOptions`, `uploadedFiles`, `onUpload`, `onDelete`, `onDownload`
- **ExportButton 컴포넌트** (`src/components/ExportButton.tsx`):
  - 엑셀 다운로드 버튼
  - 반응형 레이블 표시 (모바일에서 숨김)
  - 아이콘 옵션 (excel/download)
  - 로딩 상태 지원
  - Variant 지원 (sm, default, lg)
- **FileDownloadLink 컴포넌트** (`src/components/FileDownloadLink.tsx`):
  - 파일 다운로드 링크
  - 링크/버튼 variant 지원
  - 파일 아이콘 표시
- **ButtonGroup 컴포넌트** (`src/components/ButtonGroup.tsx`):
  - 버튼 그룹 레이아웃
  - 간격, 정렬, 래핑 옵션
- **파일**:
  - `src/components/FileUpload.tsx`
  - `src/components/ExportButton.tsx`
  - `src/components/FileDownloadLink.tsx`
  - `src/components/ButtonGroup.tsx`
  - `src/components/index.ts`: 새 컴포넌트 export 추가
- **결과**: 보험 상품 모듈에서 필요한 공통 UI 컴포넌트 개발 완료

#### 24) 약국배상책임보험 Applications 페이지 개발 완료
- **기본 구조**:
  - 필터 영역: 거래처, 상태, 페이지 크기, 검색
  - 액션 버튼 영역: 일별실적, 예치잔액, 엑셀 다운로드, 새로고침, 업체추가, API 관리
  - 테이블: DataTable 컴포넌트로 데스크톱/모바일 지원
  - 페이징 기능
- **API 연동**:
  - `/api/pharmacy/list`: 약국 목록 조회
  - `/api/pharmacy/accounts`: 거래처 목록 조회
  - `/api/pharmacy/list` (export): 엑셀 다운로드
  - 데이터 구조 변환 및 상태명 매핑
- **모달 컴포넌트**:
  - `AddCompanyModal`: 업체 추가/수정/삭제
  - `PharmacyDetailModal`: 약국 상세 정보 조회/수정
  - `DailyReportModal`: 일별실적 (기본 구조)
  - `DepositBalanceModal`: 예치잔액 (기본 구조)
  - `ApiManagerModal`: API 관리 (기본 구조)
- **파일**:
  - `src/pages/pharmacy/Applications.tsx`: 메인 페이지
  - `src/pages/pharmacy/components/AddCompanyModal.tsx`: 업체 추가 모달
  - `src/pages/pharmacy/components/PharmacyDetailModal.tsx`: 상세 모달
  - `src/pages/pharmacy/components/DailyReportModal.tsx`: 일별실적 모달 (기본 구조)
  - `src/pages/pharmacy/components/DepositBalanceModal.tsx`: 예치잔액 모달 (기본 구조)
  - `src/pages/pharmacy/components/ApiManagerModal.tsx`: API 관리 모달 (기본 구조)
  - `src/App.tsx`: 라우트 추가 (`/pharmacy/applications`)
- **결과**: 약국배상책임보험 Applications 페이지의 핵심 기능 구현 완료

#### 25) 약국배상책임보험 상세 모달 구현 완료
- **기능**:
  - 약국 상세 정보 조회 (`/api/pharmacy/id-detail/:id`)
  - 약국 정보 수정 (`/api/pharmacy/id-update/:id`)
  - 전문증권 발행 (`/api/pharmacy/issue-certificate`)
- **폼 필드**:
  - 기본 정보: 업체명, 사업자번호, 신청일, 일반전화
  - 신청자 정보: 성명, 주민번호, 이메일, 휴대전화
  - 사업장 정보: 주소, 전문인 수, 사업장 면적, 재고자산
  - 보험 정보: 보험료(콤마 포맷팅), 전문인증권번호, 보험시작일, 보험종료일, 메모
- **UI**:
  - FormInput, DatePicker 컴포넌트 사용
  - 보험료 콤마 포맷팅 자동 처리
  - 저장 및 전문증권 발행 버튼 (footer)
  - 이전 버전과 완전 동일한 구조 및 스타일 (`staff/employees` 모달과 동일한 CSS)
  - 전문인수, 보상한도, 재고자산 변경불가 표시 (폰트 크기: `text-[10px]`, 사업장면적: `text-[9px]`)
  - 전문인설계번호, 전문인증권번호, 화재설계번호, 화재증권번호 2행 2열 그리드 레이아웃
- **파일**:
  - `src/pages/pharmacy/components/PharmacyDetailModal.tsx`: 완전 구현
- **결과**: 약국 상세 정보 조회 및 수정 기능 완료, 이전 버전과 완전 동일한 UI/UX 구현

#### 26) 약국배상책임보험 Applications 페이지 개선 (인라인 편집, 페이지네이션, 날짜 포맷)
- **인라인 편집 기능**:
  - 상태(Select): 테이블 내에서 직접 변경 가능, 상태별 옵션 제한 (예: '승인' 상태는 '접수', '메일 보냄', '보류', '승인'만 허용)
  - 메모(FormInput): 테이블 내에서 직접 수정 가능, Enter 키 또는 onBlur로 저장
  - 전문설계번호, 화재설계번호(FormInput): 테이블 내에서 직접 수정 가능, onBlur로 저장
  - 입력/선택 상자: 테두리 제거(`border-0`), 배경 흰색(`bg-white`), `td` 패딩 0 (`p-0`)
- **페이지네이션 개선**:
  - 페이지네이션 상단 경계선 추가 (`border-t`)
  - 총 개수 `toLocaleString('ko-KR')`로 포맷팅
  - 페이지 변경 시 `loadApplications` 직접 호출로 수정
  - API 응답 `total` 필드 추출 로직 개선
- **날짜 포맷 변경**:
  - 가입요청일, 승인요청일: `YYYY-MM-DD HH:mm:ss` 형식으로 표시
  - `toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })` 사용
- **버튼 스타일 통일**:
  - 액션 버튼(일별실적, 예치잔액, 엑셀 다운로드, 새로고침, 업체추가, API 관리): `staff/employees` 페이지와 동일한 스타일
  - `FilterBar`의 `actionButtons` prop 사용, "업체추가" 버튼 오른쪽 끝 배치 (`ml-auto`)
- **테이블 개선**:
  - 번호 버튼 클릭 시 상세 모달 열기
  - 번호 버튼: `py-0.5`, `leading-tight`, `h-fit`로 행 높이 영향 최소화
  - `e.stopPropagation()` 추가하여 행 클릭 이벤트와 분리
- **필터 개선**:
  - 페이지 크기 선택: 필터 바에 유지, 하단 페이지네이션에서는 제거
  - 전체 개수 표시: 하단 페이지네이션에만 표시, 필터 바에서는 제거
- **파일**:
  - `src/pages/pharmacy/Applications.tsx`: 인라인 편집, 페이지네이션, 날짜 포맷, 버튼 스타일 통일
- **결과**: 테이블 내 직접 편집 가능, 페이지네이션 정상 작동, 날짜 포맷 통일, 버튼 스타일 일관성 확보

#### 27) 약국배상책임보험 일별실적/월별실적 모달 구현 완료
- **일별실적 모달** (달력 형태):
  - 필터: 거래처, 연도, 월 선택
  - 상단 요약 카드: 승인, 해지, 합계 (금액 및 건수, 그라데이션 배경)
  - 달력 그리드: 일별 승인/해지 금액 및 건수 표시
  - 오늘 날짜 강조 표시
  - 하단 버튼: "월별 실적" 전환 버튼
- **월별실적 모달** (년간 비교 테이블):
  - 필터: 거래처, 연도 선택 (월 필터 숨김)
  - 상단 요약 카드: 올해/작년 비교 (총 승인/해지/합계 금액 및 건수)
    - 올해 통계 카드: 1줄 통합 형식 (`승인 2,656,700(22) 해지 0(0) 합계 2,656,700(22)`)
    - 작년 통계 카드: 1줄 통합 형식
  - 월별 비교 테이블: 12개월 데이터, 올해/작년 비교
  - 테이블 스타일: `text-xs`, `px-3 py-2`, `bg-muted` (th), `table-layout: fixed`, 열 너비 `14.28%`
  - 하단 버튼: "일별 실적" 전환 버튼
- **API 연동**:
  - 일별실적: `/api/pharmacy/daily-report`
  - 월별실적: `/api/pharmacy/monthly-report`
- **데이터 구조**:
  - 일별실적: 날짜별 승인/해지 금액 및 건수
  - 월별실적: 월별 승인/해지 금액 및 건수, 올해/작년 비교
- **UI 개선**:
  - 통계 카드: 그라데이션 배경 (`from-purple-500 to-purple-700`, `from-blue-400 to-cyan-400`)
  - 테이블 헤더: `bg-muted` 배경, `font-medium` 텍스트
  - 테이블 본문: `text-xs` 폰트, 균형잡힌 패딩 (`px-3 py-2`)
  - 테이블 레이아웃: `table-layout: fixed`로 열 너비 균형 조정
- **파일**:
  - `src/pages/pharmacy/components/DailyReportModal.tsx`: 일별/월별 실적 모달 완전 구현
- **결과**: 이전 버전과 완전 동일한 달력 형태 일별실적 및 년간 비교 월별실적 구현 완료

---

**최종 업데이트**: 2026년 1월 24일  
**프로젝트**: Disk-CMS React 마이그레이션 - 약국배상책임보험
