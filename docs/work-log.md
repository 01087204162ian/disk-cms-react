# 작업일지 - Disk-CMS React 마이그레이션

> **파일명 규칙**: 날짜 없이 `work-log.md` 단일 파일로 관리  
> **업데이트 규칙**: 기능 완성 시마다 즉시 업데이트

---

## 📋 프로젝트 개요
Disk-CMS React 마이그레이션 프로젝트 Phase별 진행 상황 추적

---

## ✅ 완료된 작업

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

### 2026-01-14 (KJ 대리운전) - 갱신 페이지 UX 개선 (자동 검색 기능 및 기준일 입력상자 크기 조정)

#### 작업 내용
- **기능**: 갱신 페이지(증권번호 찾기)의 자동 검색 기능 추가 및 기준일 입력상자 크기 조정
- **파일**: 
  - `src/pages/insurance/PolicySearch.tsx` (자동 검색 기능 추가, 기준일 입력상자 크기 조정)
- **주요 구현 사항**:
  - ✅ 증권번호 선택 시 자동 검색 기능 추가
    - `handlePolicyNumChange` 함수 수정: 증권번호 선택 시 시작일이 자동 설정되면 검색 자동 실행
    - `handleSearch` 함수 수정: 선택적 파라미터(`policyNumOverride`, `startyDayOverride`) 추가하여 자동 검색 시 최신 값 사용
    - 직접 입력 모드에서는 자동 검색 실행하지 않음 (검색 버튼 클릭 또는 Enter 키 필요)
  - ✅ 기준일 입력상자 크기 조정
    - `w-[102.4px]` → `w-[204.8px]` (두 배로 확대)

#### 해결한 이슈
- 증권번호 선택 후 검색 버튼을 클릭해야 했던 불편함 해결 (자동 검색 기능 추가)
- 기준일 입력상자 크기 조정으로 사용성 개선

---

### 2026-01-14 (KJ 대리운전) - 갱신 페이지 UI 개선 (검색 결과 좌우 배치 및 기준일 입력상자 폭 축소)

#### 작업 내용
- **기능**: 갱신 페이지(증권번호 찾기)의 검색 결과 테이블을 좌우로 배치하고 기준일 입력상자 폭 축소
- **파일**: 
  - `src/pages/insurance/PolicySearch.tsx` (UI 개선)
- **주요 구현 사항**:
  - ✅ 검색 결과 테이블 좌우 배치
    - 검색 결과를 반으로 나누어 두 개의 `DataTable`로 표시
    - `grid grid-cols-2 gap-4` 레이아웃 사용
    - 각 테이블은 동일한 컬럼 구조 유지 (#, 대리운전회사, 증권번호, 현재인원, 기준일)
    - 검색 결과가 없을 때는 안내 메시지 표시
  - ✅ 기준일 입력상자 폭 축소
    - `w-32` (128px) → `w-[102.4px]` (80% 축소)
    - 검색현황이 차지할 위치를 처음부터 확보
    - `DatePicker`에 `fullWidth={false}` 추가하여 `className`의 width가 제대로 적용되도록 수정

#### 해결한 이슈
- 페이지 로드 시 기준일 입력상자가 축소되어 있지 않던 문제 해결 (`fullWidth={false}` 추가)
- 검색 결과가 많을 때 세로로 길어지는 문제 해결 (좌우 두 개 테이블로 배치)

---

### 2026-01-14 (KJ 대리운전) - 일일배서리스트 모달 보험료 업데이트 기능 구현 및 요율 상세 모달 크기 조정

#### 작업 내용
- **기능**: 일일배서리스트 모달의 보험료/C보험료 업데이트 기능 구현 및 요율 상세 모달 크기 조정
- **파일**: 
  - `src/pages/insurance/components/DailyEndorseListModal.tsx` (보험료 업데이트 기능 추가)
  - `src/pages/insurance/components/RateDetailModal.tsx` (모달 크기 조정: lg → xl)
  - `pci0327/api/insurance/kj-daily-endorse-premium-update.php` (신규 생성)
  - `routes/insurance/kj-driver-company.js` (보험료 업데이트 API 프록시 추가)
- **주요 구현 사항**:
  - ✅ 보험료/C보험료 업데이트 기능 구현
    - 입력 필드 `readOnly` 제거하여 편집 가능하도록 변경
    - `editingPremiums` state로 편집 중인 값 관리
    - `handlePremiumChange`: 입력값 변경 시 콤마 제거 및 숫자만 허용
    - `handlePremiumUpdate`: Enter 키 또는 blur 시 API 호출하여 업데이트
    - `formatPremiumValue`: 편집 중이면 콤마 없이 표시, 편집 중이 아니면 콤마 포함 표시
    - 업데이트 성공 시 데이터 새로고침 및 편집 상태 초기화
  - ✅ 보험료 업데이트 API 구현
    - PHP API: `kj-daily-endorse-premium-update.php` 생성
    - SMSData 테이블의 `preminum`, `c_preminum` 필드 업데이트
    - 콤마 제거 및 숫자 검증 처리
    - Node.js 프록시 라우터 추가 (`/kj-daily-endorse/premium-update`)
  - ✅ 요율 상세 모달 크기 조정
    - `maxWidth="lg"` → `maxWidth="xl"` (약 10% 증가)

#### API 연동
- `/api/insurance/kj-daily-endorse/premium-update` - 보험료/C보험료 업데이트 (신규 생성)

#### 해결한 이슈
- 보험료 입력 필드가 `readOnly` 상태였던 문제 해결 (편집 가능하도록 변경)
- 보험료 업데이트 API가 없었던 문제 해결 (PHP API 및 Node.js 프록시 생성)

---

### 2026-01-14 (KJ 대리운전) - 요율 상세 모달 구현

#### 작업 내용
- **기능**: 일일배서리스트 모달의 요율 상세 모달 구현
- **파일**: 
  - `src/pages/insurance/components/RateDetailModal.tsx` (신규 생성)
  - `src/pages/insurance/components/DailyEndorseListModal.tsx` (요율 클릭 핸들러 추가)
- **주요 구현 사항**:
  - ✅ 요율 상세 모달 컴포넌트 생성
    - 요율 코드 및 값 배지 표시 (요율 코드: primary 색상, 요율: blue 색상)
    - 요율 설명 섹션 (border-left 강조, Info 아이콘)
    - 전체 요율 목록 테이블 (코드, 요율, 설명)
    - 선택된 요율 행 강조 표시 (bg-primary/10)
  - ✅ 일일배서리스트 모달에 통합
    - 요율 클릭 시 모달 열기 기능 추가
    - `rateDetailModalOpen` state 추가
    - `selectedRateCode` state로 선택된 요율 코드 관리
  - ✅ 원본 파일과 동일한 기능 구현
    - `RATE_OPTIONS`, `getRateValue`, `getRateName` 함수 활용
    - 요율 코드별 상세 정보 표시
    - 전체 요율 목록 표시

#### 해결한 이슈
- 요율 클릭 시 토스트 메시지만 표시되던 문제 해결 (상세 모달 구현)

---

### 2026-01-14 (KJ 대리운전) - 일일배서리스트 모달 UI 개선

#### 작업 내용
- **기능**: 일일배서리스트 모달의 보험료/C보험료 입력 상자 UI 개선 및 콤마 표시 추가
- **파일**: 
  - `src/pages/insurance/components/DailyEndorseListModal.tsx` (입력 상자 스타일 개선, 콤마 표시 추가)
- **주요 구현 사항**:
  - ✅ 보험료/C보험료 입력 상자 스타일 개선
    - 테이블 td의 입력 상자가 td에 꽉 차도록 수정
    - td 패딩 제거 (`px-2 py-2` → `p-0`)
    - 입력 상자에 `border-0 rounded-none` 적용하여 테이블 테두리와 자연스럽게 연결
    - 입력 상자 스타일: `padding: '8px 12px'`, `width: '100%'` 적용
  - ✅ 보험료/C보험료 콤마 표시 개선
    - `parseFloat`를 사용하여 문자열/숫자 모두 올바르게 처리
    - 보험료: `item.preminum ? parseFloat(String(item.preminum)).toLocaleString('ko-KR') : '0'`
    - C보험료: `item.c_preminum ? parseFloat(String(item.c_preminum)).toLocaleString('ko-KR') : '0'`
    - 이전 버전(`kj-driver-endorse-list.js`)과 동일한 로직 적용

#### 해결한 이슈
- 보험료/C보험료에 콤마가 표시되지 않던 문제 해결 (parseFloat 사용으로 숫자 변환 후 toLocaleString 적용)

---

### 2026-01-14 (KJ 대리운전) - 증권 상세 정보 모달 및 보험료 입력 모달 개선 및 완전 재구현

#### 작업 내용
- **기능**: 증권 상세 정보 모달 UI 개선 및 보험료 입력 모달 완전 재구현
- **파일**: 
  - `src/pages/insurance/components/PolicyDetailModal.tsx` (입력 상자 스타일 개선)
  - `src/pages/insurance/components/PremiumInputModal.tsx` (완전 재구현)
- **주요 구현 사항**:
  - ✅ 증권 상세 정보 모달 입력 상자 스타일 개선
    - 테이블 td의 입력 상자가 td에 꽉 차도록 수정
    - td 패딩 제거 (`px-3 py-2` → `p-0`)
    - 입력 상자에 `border-0 rounded-none` 적용하여 테이블 테두리와 자연스럽게 연결
    - DatePicker는 Calendar 아이콘 공간을 위해 `paddingLeft: '40px'` 추가
  - ✅ 보험료 입력 모달 완전 재구현
    - 기존 파일 삭제 후 `PremiumModal.tsx`를 참조하여 새로 작성
    - 검증된 로직 재사용으로 입력 문제 해결
    - 나이 끝 입력 시 `onBlur`에서 다음 행 시작 나이 자동 채우기 (입력 완료 후에만 실행)
    - 보험료 필드 입력 로직 `PremiumModal.tsx`와 동일하게 구현
    - 년계 계산 로직 변경: (년기본 + 년특약) × 10 → 년기본 + 년특약 (단순 합계)
    - TypeScript 오류 수정 (사용하지 않는 변수 제거, null 체크 추가)
  - ✅ 보험료 입력 모달 기능
    - 7개 행 입력 필드 (순번, 시작나이, 끝나이, 년기본, 년특약, 년계)
    - 년계 자동 계산: 년기본 + 년특약
    - 다음 행 시작나이 자동 채우기 (끝나이 입력 완료 시)
    - 숫자 콤마 포맷팅 (나이 필드는 콤마 없음, 보험료 필드는 콤마 포함)
    - 검증: 시작나이가 없는데 보험료가 있으면 에러 표시
    - API 연동: GET (조회), POST (저장)
    - 보험회사 이름을 모달 제목에 표시
    - 기존 데이터 있으면 "수정", 없으면 "저장" 버튼 표시

#### API 연동
- `/api/insurance/kj-code/policy-num-detail` - 증권 정보 조회 (보험회사 코드 가져오기)
- `/api/insurance/kj-insurance-premium-data` - 보험료 데이터 조회/저장

#### 해결한 이슈
- 보험료 입력 상자에 아무것도 입력되지 않는 문제 해결 (PremiumModal.tsx 로직 재사용)
- 나이 끝 입력 시 입력 중에도 자동 채우기가 실행되는 문제 해결 (onBlur로 변경)
- TypeScript 오류 수정 (사용하지 않는 변수, null 타입 체크)

#### 다음 단계
- 테스트 및 검증

---

### 2026-01-14 (KJ 대리운전) - 증권 상세 정보 모달 및 보험료 입력 모달 완전 구현

#### 작업 내용
- **기능**: 증권 상세 정보 모달 크기 조정 및 보험료 입력 모달 완전 구현
- **파일**: 
  - `src/pages/insurance/components/PolicyDetailModal.tsx` (모달 크기 조정: maxWidth="6xl")
  - `src/pages/insurance/components/PremiumInputModal.tsx` (완전 구현)
- **주요 구현 사항**:
  - ✅ 증권 상세 정보 모달 크기 조정
    - `maxWidth="xl"` (576px) → `maxWidth="6xl"` (1152px)
    - Bootstrap의 `modal-xl` (1140px)과 유사한 크기로 조정
  - ✅ 보험료 입력 모달 완전 구현
    - 7개 행 입력 필드 (순번, 시작나이, 끝나이, 년기본, 년특약, 년계)
    - 년계 자동 계산: (년기본 + 년특약) × 10
    - 다음 행 시작나이 자동 채우기 (끝나이 입력 시)
    - 숫자 콤마 포맷팅 (나이 필드는 콤마 없음, 보험료 필드는 콤마 포함)
    - 검증: 시작나이가 없는데 보험료가 있으면 에러 표시
    - API 연동: GET (조회), POST (저장)
    - 보험회사 이름을 모달 제목에 표시
    - 기존 데이터 있으면 "수정", 없으면 "저장" 버튼 표시
  - ✅ 보험료 입력 모달 스타일 이전 버전과 동일하게 조정
    - 모달 크기: `maxWidth="4xl"` (896px, Bootstrap `modal-lg` 800px와 유사)
    - 모달 본문 높이: `70vh` (이전 버전과 동일)
    - 테이블 스타일: Bootstrap `table-sm`과 유사 (작은 패딩, 작은 폰트)
    - 입력 필드 스타일: Bootstrap `form-control form-control-sm`과 유사 (높이 31px)
    - 헤더 색상: `#6f42c1` 배경색 유지
    - 나이 필드: 콤마 없이 숫자만 표시
    - 보험료 필드: 콤마 포함 표시

#### API 연동
- `/api/insurance/kj-code/policy-num-detail` - 증권 정보 조회 (보험회사 코드 가져오기)
- `/api/insurance/kj-insurance-premium-data` - 보험료 데이터 조회/저장

#### 다음 단계
- 테스트 및 검증

---

### 2026-01-14 (KJ 대리운전) - 배서 리스트 페이지 행 선택 및 일괄 처리 기능 구현

#### 작업 내용
- **기능**: 배서 리스트 페이지에 행 선택 기능 및 일괄 처리 기능 구현
- **파일**: 
  - `src/pages/insurance/EndorseList.tsx` (행 선택, 일괄 처리 기능 추가)
  - `src/components/DataTable.tsx` (header 타입 확장: ReactNode 지원)
- **주요 구현 사항**:
  - ✅ 테이블 행 선택 기능 구현
    - 테이블 맨 앞에 체크박스 컬럼 추가
    - 개별 행 선택/해제 가능
    - 선택된 행 ID를 state로 관리 (`selectedRowNums`)
    - 체크박스 클릭 시 행 클릭(배서 모달 열기)과 충돌하지 않도록 `stopPropagation()` 처리
    - 페이지 변경 시 선택 상태 유지 (다른 페이지의 선택은 유지)
  - ✅ 전체선택(현재 페이지) 기능 구현
    - 테이블 헤더에 전체선택 체크박스 추가
    - 현재 페이지의 모든 행이 선택되면 체크됨
    - 일부만 선택되면 **indeterminate** 상태 (반투명 체크)
    - 클릭 시 현재 페이지의 모든 행 선택/해제
    - 개별 행 선택/해제 시 전체선택 체크박스 상태 자동 업데이트
  - ✅ 선택된 항목 일괄 처리 기능 구현
    - **진행단계 일괄 변경**: 선택된 행들의 진행단계를 한 번에 변경
      - 진행단계 선택 후 "변경" 버튼 클릭
      - 각 행에 대해 `/api/insurance/kj-endorse/update-progress` API 호출
      - 성공/실패 건수 토스트 메시지 표시
    - **배서처리 일괄 변경**: 선택된 행들의 배서처리 상태를 한 번에 변경
      - 배서처리 선택 후 "변경" 버튼 클릭
      - 각 행에 대해 `/api/insurance/kj-endorse/update-status` API 호출
      - 요율 미입력 행은 스킵 처리
      - 성공/실패/스킵 건수 토스트 메시지 표시
  - ✅ 일괄 처리 UI 개선
    - 일괄 처리 영역을 필터바에서 테이블 위로 이동
    - 선택된 항목이 있을 때만 표시
    - 작고 깔끔한 스타일: 높이 `h-6`, 폰트 `0.7rem`
    - 배경색(`bg-muted/50`)과 구분선으로 영역 구분
    - 버튼 텍스트 간소화 ("일괄변경" → "변경")
    - 선택 건수 primary 색상으로 강조
  - ✅ 배서리스트 페이지 전용 상태 매핑 구현
    - 배서리스트 페이지는 기사찾기와 다른 상태 매핑 사용
    - `ENDORSE_LIST_PUSH_MAP` 생성: `{'1': '청약', '4': '해지', '2': '해지', ...}`
    - 배서리스트 페이지에서만 이 매핑 적용
    - 기사찾기/일일배서리스트 모달은 기존 `PUSH_MAP` 유지
    - **상태 표시 규칙**:
      - 배서리스트: 4=해지, 1=청약 (정상 상태에서 해지 요청 시 push=4 유지, cancel=42)
      - 처리 완료 시: push=2, sangtae=1
- **해결한 이슈**:
  - DataTable 컴포넌트의 `header` 타입을 `string | ReactNode`로 확장하여 체크박스 같은 React 요소도 허용
  - 사용하지 않는 `PUSH_MAP` import 제거

#### API 연동
- `/api/insurance/kj-endorse/update-progress` - 진행단계 변경 (일괄 처리)
- `/api/insurance/kj-endorse/update-status` - 배서처리 변경 (일괄 처리)

#### 참고 사항
- 대리운전회사명 클릭 시 업체 상세 모달 열기 기능은 이미 구현되어 있음 (확인 완료)
- 테스트는 나중에 진행 예정

---

### 2026-01-14 (KJ 대리운전) - 일일배서리스트, 배서현황, 문자리스트 모달 완전 구현

#### 작업 내용
- **기능**: 일일배서리스트 모달, 배서현황 모달, 문자리스트 모달을 이전 버전과 완전 동일하게 구현
- **파일**: 
  - `src/pages/insurance/components/DailyEndorseListModal.tsx` (완전 재구현)
  - `src/pages/insurance/components/EndorseReviewModal.tsx` (신규 생성)
  - `src/pages/insurance/components/SmsListModal.tsx` (완전 재구현)
  - `src/pages/insurance/components/EndorseStatusModal.tsx` (UI 개선)
  - `src/pages/insurance/constants.ts` (PUSH_MAP 확장)
  - `src/components/Modal.tsx` (sideBySide prop 추가)
- **주요 구현 사항**:
  - ✅ 일일배서리스트 모달 완전 구현
    - 필터 레이아웃: 날짜/회사/증권 한 줄 배치, 오른쪽에 현황 정보와 검토 버튼
    - 현황 정보 표시: 청약/해지/계 자동 계산 및 표시
    - 검토 버튼: 대리운전회사 선택 시 활성화, 클릭 시 배서현황 모달 열기
    - 자동 조회: 모달 열 때, 날짜/회사/증권 변경 시 자동 조회
    - 회사전화 컬럼: Rphone1-Rphone2-Rphone3 형식으로 표시
    - 요율: 클릭 가능한 링크로 표시 (요율 상세 모달 연동 준비)
    - 보험료/C보험료: 인라인 편집 가능한 input 필드 (업데이트 기능 준비)
    - 페이지네이션: 15개씩 표시, 커스텀 스타일 적용
    - 상태 스타일: 해지는 빨간색, 정상은 초록색으로 표시
    - 케이드라이브 우선 표시: 대리운전회사 목록에서 케이드라이브를 최상단에 표시
    - 모달 폭: `maxWidth="7xl"` (1280px)
    - 모달 위치: 왼쪽 상단 (`position="top-left"`)
  - ✅ 배서현황 모달 완전 구현 (`EndorseReviewModal.tsx`)
    - 보고서 형식으로 표시 (ul 리스트 형식)
    - 제목 및 복사 버튼: 날짜(요일) 배서현황 제목과 복사 버튼
    - 섹션 구조:
      - *대리 가입자 (ul 리스트 + 총 인원수)
      - *대리 해지자 (ul 리스트 + 총 인원수)
      - *탁송 가입자 (ul 리스트 + 총 인원수)
      - *탁송 해지자 (ul 리스트 + 총 인원수)
    - 영수보험료 섹션: 파란색 테두리, 배경색 강조, (+추징/-환급) 표시
    - 할증자 정보: "금일 가입자 중 할증자는 X 명입니다."
    - 메일 발송 문구: "보험료 파일은 정리하여 메일로 발송하겠습니다."
    - 복사 기능: 클립보드 복사 기능 구현
    - 모달 위치: 일일배서리스트 모달 옆에 나란히 표시 (`sideBySide` prop 사용)
  - ✅ 문자리스트 모달 완전 구현
    - 필터 영역: 검색 방식 선택 (날짜 범위, 전화번호, 대리운전회사)
    - 동적 필터 표시: 선택한 방식에 따라 필터 필드 표시/숨김
    - 전화번호 하이푼 자동 추가: 입력 시 자동 포맷팅 (010-1234-5678)
    - 엔터키 검색: 전화번호/회사명 입력 필드에서 엔터키로 검색
    - 테이블 구조: 순번 8%, 수신번호 15%, 메시지 50%, 발송시간 27%
    - 메시지 표시: `whitespace-pre-wrap`로 줄바꿈 유지
    - 페이지네이션: 이전/다음 버튼과 페이지 번호 표시 (이전 버전과 동일한 형식)
    - 총 건수 표시: 우측 상단에 표시
    - 자동 조회: 모달 열 때 자동으로 날짜 범위 조회 (약간의 지연 후 실행)
    - 모달 폭: `maxWidth="6xl"` (이전 버전의 modal-xl과 동일)
  - ✅ 상태 표시 수정
    - PUSH_MAP 확장: `{'1': '청약', '2': '해지', '3': '청약거절', '4': '정상', '5': '해지취소', '6': '청약취소'}`
    - 공통 모듈의 PUSH_MAP 직접 사용
  - ✅ Modal 컴포넌트 기능 확장
    - `sideBySide` prop 추가: 두 모달을 나란히 배치할 수 있는 기능
    - `offsetX`, `offsetY`로 위치 조정 가능
- **해결한 이슈**:
  - 일일배서리스트 상태 표시 오류: PUSH_MAP에 '4': '해지'로 잘못 정의되어 있던 문제 수정 ('4': '정상'으로 변경)
  - 검토 모달 오류: 검토 버튼이 잘못된 모달(일일배서현황)을 열던 문제 해결 (배서현황 모달로 변경)
  - 모달 위치 조정: 일일배서리스트 모달을 왼쪽 상단에 배치하고, 배서현황 모달을 그 옆에 나란히 표시

#### API 연동
- `/api/insurance/kj-daily-endorse/search` - 일일배서리스트 조회
- `/api/insurance/kj-daily-endorse/status` - 배서현황 조회
- `/api/insurance/kj-daily-endorse/company-list` - 대리운전회사 목록 조회
- `/api/insurance/kj-daily-endorse/certi-list` - 증권 목록 조회
- `/api/insurance/kj-sms/list` - 문자리스트 조회

#### 참고 사항
- 일일배서리스트 모달과 배서현황 모달은 나란히 표시되어 사용자가 한 번에 파악할 수 있도록 구현
- 모든 모달은 이전 버전(HTML/JavaScript)과 완전 동일한 레이아웃, 필터, 데이터 표시 방식 사용

---

### 2026-01-14 (KJ 대리운전) - 배서 리스트 페이지 UI/UX 개선 및 중복 리스트 모달 구현

#### 작업 내용
- **기능**: 배서 리스트 페이지 UI/UX 개선, 중복 리스트 모달 구현, Modal 드래그 기능 추가
- **파일**: 
  - `src/pages/insurance/EndorseList.tsx` (버튼 스타일 통일, 중복 모달 통합)
  - `src/pages/insurance/components/DuplicateListModal.tsx` (신규 생성)
  - `src/components/DataTable.tsx` (hover 효과 개선)
  - `src/components/Modal.tsx` (드래그 기능 및 위치 옵션 추가)
- **주요 구현 사항**:
  - ✅ DataTable 컴포넌트 hover 효과 개선
    - 테이블 행에 마우스 오버 시 배경색 변경 (`#dee2e6`)
    - `onMouseEnter`/`onMouseLeave` 이벤트로 구현하여 시각적 피드백 제공
  - ✅ 배서현황, 일일배서리스트, 문자리스트 버튼 스타일 통일
    - 버튼 크기를 2/3 사이즈로 축소 (h-7, px-2, py-0.5)
    - 아이콘 크기 조정 (w-3 h-3)
    - 모든 버튼을 primary 색상으로 통일 (hover 시 텍스트가 흰색으로 변경)
  - ✅ 중복 리스트 모달 구현 (`DuplicateListModal.tsx`)
    - 중복여부 컬럼에서 "중복" 텍스트 클릭 시 모달 열기
    - 해당 주민번호로 정상 상태(status='4') 가입 리스트 조회
    - 기사찾기와 동일한 API 사용 (`/api/insurance/kj-driver/list`)
    - 대리운전회사, 증권번호 표시
    - 대리운전회사 클릭 시 업체 상세 모달 열기
  - ✅ Modal 컴포넌트 기능 개선
    - `position` prop 추가 (center, top-left, top-right, bottom-left, bottom-right)
    - 모달 드래그 기능 추가 (헤더를 드래그하여 이동)
    - 드래그 시 화면 경계 체크로 모달이 화면 밖으로 나가지 않도록 제한
    - 중복 리스트 모달은 좌측 상단(`top-left`) 위치에 표시
- **해결한 이슈**:
  - DataTable hover 효과가 작동하지 않던 문제 해결 (Tailwind CSS 클래스 대신 이벤트 핸들러 사용)
  - 버튼 hover 시 글씨가 안보이던 문제 해결 (모든 버튼을 primary 색상으로 통일)
  - `success`, `info` 색상이 Tailwind config에 정의되지 않아 발생한 스타일 문제 해결

#### 참고 사항
- 중복 리스트 모달은 기사찾기(DriverSearch)와 동일한 API 및 데이터 구조 사용
- Modal 드래그 기능은 모든 모달에 적용되며, 헤더를 드래그하여 위치 변경 가능

---

### 2026-01-13 (KJ 대리운전) - 배서 리스트 페이지 마이그레이션 및 선택상자 기능 구현

#### 작업 내용
- **기능**: 배서 리스트 페이지 (`EndorseList.tsx`) 마이그레이션 및 진행단계/요율/배서처리 선택상자 기능 구현
- **파일**: 
  - `src/pages/insurance/EndorseList.tsx` (신규 생성 및 수정)
  - `src/pages/insurance/components/EndorseStatusModal.tsx` (신규 생성)
  - `src/pages/insurance/components/DailyEndorseListModal.tsx` (신규 생성)
  - `src/pages/insurance/components/SmsListModal.tsx` (신규 생성)
  - `pci0327/api/insurance/kj-endorse-list.php` (sangtae 필드 추가)
  - `routes/insurance/kj-driver-company.js` (새로운 API 엔드포인트 추가)
- **주요 구현 사항**:
  - ✅ 배서 리스트 페이지 기본 구조 구현
    - 필터: 상태(청약/해지), 진행단계, 기준일, 보험회사, 증권번호, 대리운전회사, 페이지 크기
    - 테이블: No, 담당자, 대리운전회사명, 성명, 주민번호(나이), 핸드폰, 진행단계, manager, 기준일, 신청일, 증권번호, 증권성격, 요율, 상태, 배서처리, 보험사, 보험료, C보험료, 중복여부
    - 페이지네이션 및 통계 정보 표시
  - ✅ 진행단계/요율/배서처리 컬럼을 선택상자로 구현
    - 진행단계: 선택, 프린트, 스캔, 고객등록, 심사중, 입금대기, 카드승인, 수납중, 확정중
    - 요율: 선택, 1, 0.9, 0.925, 0.898, 0.889, 1.074, 1.085, 1.242, 1.253, 1.314, 1.428, 1.435, 1.447, 1.459
    - 배서처리: 미처리, 처리
    - 각 선택상자 변경 시 확인 메시지 표시 및 API 호출
  - ✅ 배서현황 모달 구현 (`EndorseStatusModal.tsx`)
    - 날짜 범위 선택 (기본값: 지난 달 1일 ~ 오늘)
    - 일별 배서 현황 통계 표시: 청약, 해지, 청약거절, 청약취소, 해지취소, 계
    - 합계 행 표시
  - ✅ 일일배서리스트 모달 구현 (`DailyEndorseListModal.tsx`)
    - 날짜, 대리운전회사, 증권번호 필터
    - 일일 배서 내역 테이블 표시
    - 페이지네이션 지원
  - ✅ 문자리스트 모달 구현 (`SmsListModal.tsx`)
    - 정렬 방식: 날짜 범위, 전화번호, 대리운전회사
    - SMS 발송 내역 테이블 표시
    - 페이지네이션 지원
  - ✅ 테이블 행 클릭 시 배서 모달 열기 기능
  - ✅ API 응답에 `sangtae` 필드 추가 (배서처리 상태: 1=미처리, 2=처리)
  - ✅ Node.js 라우터에 새로운 API 엔드포인트 추가
    - `/api/insurance/kj-endorse/update-progress` - 진행단계 변경
    - `/api/insurance/kj-endorse/update-rate` - 요율 변경
    - `/api/insurance/kj-endorse/update-status` - 배서처리 변경 (changeEndorse.php 사용)

#### API 연동
- `/api/insurance/kj-endorse/list` - 배서 리스트 조회
- `/api/insurance/kj-endorse/policy-list` - 증권번호 목록 조회
- `/api/insurance/kj-endorse/company-list` - 대리운전회사 목록 조회
- `/api/insurance/kj-daily-endorse/current-situation` - 배서현황 조회
- `/api/insurance/kj-daily-endorse/search` - 일일배서리스트 조회
- `/api/insurance/kj-sms/list` - 문자리스트 조회
- `/api/insurance/kj-endorse/update-progress` - 진행단계 변경 (신규)
- `/api/insurance/kj-endorse/update-rate` - 요율 변경 (신규)
- `/api/insurance/kj-endorse/update-status` - 배서처리 변경 (수정)

#### 해결한 이슈
- 테이블 폰트 크기 조정: `text-xs` 및 `fontSize: '0.75rem'` 적용하여 이전 버전과 동일한 가시성 확보
- 필터 및 버튼을 한 행에 배치: `flex-nowrap` 및 `overflow-x-auto` 적용
- 기준일 필터 폭 조정: `DatePicker`의 `fullWidth={false}` 설정으로 `className`의 폭이 적용되도록 수정
- 선택상자 클릭 시 행 클릭 이벤트 방지: `onClick={(e) => e.stopPropagation()}` 추가

#### 참고 사항
- 이전 버전: `pci0327/05/js/kj_endorseList.js`, `disk-cms/public/pages/insurance/kj-driver-endorse-list.html`
- 진행단계/요율/배서처리 변경 시 확인 메시지 표시 및 성공 시 리스트 자동 새로고침

---

### 2026-01-13 (KJ 대리운전) - 신규 업체 등록 모달 구현 및 주민번호 검증 API 개발

#### 작업 내용
- **기능**: 신규 업체 등록 모달 (AddCompanyModal) 구현 및 주민번호 검증 API 개발
- **파일**: 
  - `src/pages/insurance/components/AddCompanyModal.tsx` (신규 생성)
  - `src/pages/insurance/CompanyManagement.tsx` (신규 업체 등록 모달 통합)
  - `pci0327/api/insurance/kj-company-check-jumin.php` (신규 생성 및 수정)
  - `routes/insurance/kj-driver-company.js` (라우터 순서 수정)
- **주요 구현 사항**:
  - ✅ 신규 업체 등록 모달 구현
    - 주민번호 입력 및 엔터키로 검증 기능
    - 기본 정보 입력 필드: 주민번호(필수), 대리운전회사(필수), 성명/대표자(필수), 핸드폰번호, 전화번호, 사업자번호, 법인번호
    - 입력 필드 자동 포맷팅: 주민번호(660327-1234567), 핸드폰(010-1234-5678), 전화번호(02-1234-5678), 사업자번호(123-45-67890), 법인번호(123456-1234567)
    - 주민번호 검증 시 기존 회사 존재 여부 확인
    - 기존 회사 존재 시 확인 다이얼로그 표시 및 기존 회사 정보 불러오기
    - 신규 등록 가능 시 안내 메시지 표시
    - 신규 업체 저장 API 연동 (`/api/insurance/kj-company/store`)
    - 저장 성공 시 목록 새로고침 및 상세 모달 자동 열기
  - ✅ 주민번호 검증 API 구현 (`kj-company-check-jumin.php`)
    - 주민번호로 기존 회사 조회 (LIKE 쿼리로 부분 일치 검색)
    - 있으면: `exists: true, dNum: 업체번호, company: 대리운전회사명` 반환
    - 없으면: `exists: false, dNum: null, company: null` 반환하여 신규 입력 가능 안내
    - 로그 파일 추가: `pci0327/api/insurance/logs/kj-company-check-jumin.log`
    - DB 연결 오류 시에도 HTTP 200으로 반환하여 신규 등록 가능으로 처리
  - ✅ Node.js 라우터 수정
    - 라우터 순서 문제 해결: `/kj-company/check-jumin`을 `/kj-company/:companyNum`보다 위로 이동
    - 정적 라우트를 동적 라우트보다 먼저 배치하여 올바른 라우팅 보장
    - 주민번호 검증 API 응답에 `company` 필드 포함하도록 수정

#### API 연동
- `/api/insurance/kj-company/check-jumin` - 주민번호로 기존 회사 조회 (신규 생성)
- `/api/insurance/kj-company/store` - 신규 업체 저장

#### 해결한 이슈
- 라우터 순서 문제: `/kj-company/check-jumin` 호출 시 `/kj-company/:companyNum`으로 잘못 매칭되는 문제 해결 (정적 라우트를 동적 라우트보다 위로 이동)
- 주민번호 검증 API 500 오류: PHP API에서 DB 연결 오류 시에도 HTTP 200으로 반환하여 프론트엔드에서 처리 가능하도록 수정
- 주민번호 검증 시 회사명 반환: 기존 회사 존재 시 회사명도 함께 반환하여 사용자에게 명확한 안내 제공

#### 파일
- `src/pages/insurance/components/AddCompanyModal.tsx`: 신규 업체 등록 모달 컴포넌트 (신규 생성)
- `src/pages/insurance/CompanyManagement.tsx`: 신규 업체 등록 모달 통합
- `pci0327/api/insurance/kj-company-check-jumin.php`: 주민번호 검증 API (신규 생성)
- `routes/insurance/kj-driver-company.js`: 라우터 순서 수정 및 주민번호 검증 API 라우트 추가

---

### 2026-01-12 (KJ 대리운전) - 정산 모달 엑셀 다운로드 기능 구현 및 UI 개선

#### 작업 내용
- **기능**: 정산 모달 (SettlementModal) 엑셀 다운로드 기능 구현 및 UI 개선
- **파일**: 
  - `src/pages/insurance/components/SettlementModal.tsx` (엑셀 다운로드 기능 추가 및 버튼 위치 변경)
  - `src/pages/insurance/components/SettlementListModal.tsx` (메모 저장 토스트 메시지 추가, 필터 레이블 삭제, 현황 배치 변경)
  - `pci0327/api/insurance/kj-settlement-list-save.php` (메모 저장 오류 수정)
- **주요 구현 사항**:
  - ✅ 정산 모달 엑셀 다운로드 기능 구현
    - ExcelJS 동적 import 사용
    - `/api/insurance/kj-company/settlement/excel-data` API 연동
    - 회원리스트와 배서리스트를 단일 시트에 포함
    - 원본 코드와 동일한 구조로 엑셀 파일 생성
    - 회원리스트 섹션: 헤더, 데이터 행, 합계 행
    - 배서리스트 섹션: 헤더, 데이터 행, 배서 합계 행, 최종 합계 행
    - 셀 병합, 스타일링, 컬럼 너비 설정
    - 파일명: `정산리스트_{업체명}_{날짜}.xlsx`
    - 로딩 상태 표시 및 성공/오류 메시지
  - ✅ 정산 모달 버튼 위치 변경
    - 확정보험료 입력 버튼: 상단 날짜 필터 영역의 오른쪽 끝으로 이동
    - 엑셀 다운로드 버튼: 하단 버튼 영역의 첫 번째 버튼으로 이동
  - ✅ 정산리스트 모달 UI 개선
    - 필터 레이블 삭제 ("시작일", "종료일", "담당자", "구분" 레이블 제거)
    - 현황(통계) 정보를 검색 버튼 우측에 배치
    - 메모 저장 성공 시 토스트 메시지 표시
  - ✅ 정산리스트 모달 메모 저장 오류 수정
    - 백엔드 PHP 파일에서 ID 존재 여부 확인 로직 추가
    - UPDATE 후 `rowCount()`가 0을 반환해도 ID가 존재하면 성공으로 처리
    - "해당 ID의 데이터를 찾을 수 없습니다" 오류 해결

#### API 연동
- `/api/insurance/kj-company/settlement/excel-data` - 정산 엑셀 데이터 조회
- `/api/insurance/kj-company/settlement/list-save` - 정산리스트 메모 저장 (오류 수정)

#### 해결한 이슈
- 정산리스트 모달 메모 저장 시 "해당 ID의 데이터를 찾을 수 없습니다" 오류: 백엔드에서 ID 존재 여부를 먼저 확인하고, UPDATE 후 rowCount()가 0이어도 ID가 존재하면 성공으로 처리하도록 수정
- 정산 모달 버튼 위치: 확정보험료 입력 버튼과 엑셀 다운로드 버튼 위치 교환

#### 파일
- `src/pages/insurance/components/SettlementModal.tsx`: 엑셀 다운로드 기능 추가 및 버튼 위치 변경
- `src/pages/insurance/components/SettlementListModal.tsx`: UI 개선 및 메모 저장 토스트 메시지 추가
- `pci0327/api/insurance/kj-settlement-list-save.php`: 메모 저장 오류 수정

---

### 2026-01-12 (KJ 대리운전) - 업체 상세 모달 Phase 5 구현 및 입력 필드 포맷팅 기능 추가

#### 작업 내용
- **기능**: 업체 상세 모달 (CompanyDetailModal) Phase 5 구현 및 UI/UX 개선
- **파일**: 
  - `src/pages/insurance/components/CompanyDetailModal.tsx` (Phase 5 구현 및 포맷팅 추가)
  - `src/pages/insurance/constants.ts` (사업자번호/법인번호 포맷팅 함수 추가)
- **주요 구현 사항**:
  - ✅ Phase 5: 기본 정보 수정 기능 구현
    - 수정 모드 상태 관리 (`isEditingBasicInfo`, `editingBasicInfo`, `savingBasicInfo`)
    - 기본 정보 필드 수정 가능 (주민번호, 대리운전회사, 성명, 핸드폰번호, 전화번호, 팩스, 사업자번호, 법인번호, 우편번호, 주소)
    - 수정/취소/저장 버튼 기능 구현
    - 저장 API 연동 (`/api/insurance/kj-company/store`)
  - ✅ 입력 필드 자동 포맷팅 기능 추가
    - 핸드폰번호/전화번호/팩스: `01087204162` → `010-8720-4162` 형식 자동 포맷팅
    - 사업자번호: `1234567890` → `123-45-67890` 형식 자동 포맷팅
    - 법인번호: `1234561234567` → `123456-1234567` 형식 자동 포맷팅
    - 저장 시 하이픈 포함하여 저장 (서버에서 하이픈 제거하지 않음)
  - ✅ 기본 정보 테이블 UI 개선
    - th 중앙 정렬 (`text-center`)
    - th 배경색 변경 (`bg-gray-200`)

#### API 연동
- `/api/insurance/kj-company/store` - 기본 정보 저장 (팩스 필드 포함)

#### 추가된 함수 (constants.ts)
- `addBusinessNumberHyphen`: 사업자번호 하이픈 추가 (10자리, 3-2-5 형식)
- `removeBusinessNumberHyphen`: 사업자번호 하이픈 제거
- `addCorporateNumberHyphen`: 법인번호 하이픈 추가 (13자리, 6-7 형식)
- `removeCorporateNumberHyphen`: 법인번호 하이픈 제거

#### 남은 작업
- Phase 6: 업체 I.D 관리 모달 구현

---

### 2026-01-12 (KJ 대리운전) - 배서 모달 UI 개선 및 userName 필드 추가

#### 작업 내용
- **기능**: 배서 모달 (EndorseModal) UI 개선 및 배서 저장 API 오류 수정
- **파일**: 
  - `src/pages/insurance/components/EndorseModal.tsx` (UI 개선 및 userName 필드 추가)
- **주요 구현 사항**:
  - ✅ 배서 모달 UI를 원본과 동일하게 수정
    - 모달 크기: `max-width: 40%` (원본과 동일)
    - 헤더 배경색: `#e8f5e9` (원본과 동일)
    - 헤더 레이아웃: ExcelUp 버튼, 제목, 배서기준일을 한 줄에 배치
    - 테이블 열 너비: 순번 5%, 성명 20%, 주민번호 25%, 핸드폰번호 20%, 증권성격 30% (원본과 동일)
    - 입력 필드 스타일: `padding: 0`, `border: none`, `outline: none`, `box-shadow: none` (원본과 동일)
    - 푸터 배경색: `#e8f5e9` (원본과 동일)
    - 폰트 크기: `0.9rem` (원본과 동일)
  - ✅ 배서 저장 API에 userName 필드 추가
    - `useAuthStore`에서 사용자 정보 가져오기
    - sessionStorage/localStorage fallback 추가
    - 필수 필드 누락 오류 해결

#### API 연동
- `/api/insurance/kj-endorse/save` - 배서 저장 (userName 필드 추가)

#### 해결한 이슈
- 배서 저장 시 "필수 필드가 누락되었습니다: userName" 오류: userName 필드를 API 요청에 포함하도록 수정
- 배서 모달 UI가 원본과 다른 문제: 원본과 완전 동일한 디자인으로 수정

#### 파일
- `src/pages/insurance/components/EndorseModal.tsx`: 배서 모달 UI 개선 및 userName 필드 추가

---

### 2026-01-12 (KJ 대리운전) - React 마이그레이션: 업체 상세 모달 Phase 2 고급, Phase 3, Phase 4 구현 및 검색/월보험료 모달 개선

#### 작업 내용
- **기능**: 업체 상세 모달 (CompanyDetailModal) Phase 2 고급, Phase 3, Phase 4 구현 및 버그 수정
- **파일**: 
  - `src/pages/insurance/components/CompanyDetailModal.tsx` (메모/SMS 목록 추가)
  - `src/pages/insurance/components/MemberListModal.tsx` (신규 생성)
  - `src/pages/insurance/components/EndorseModal.tsx` (신규 생성)
  - `src/pages/insurance/components/PremiumModal.tsx` (신규 생성 및 개선)
  - `src/pages/insurance/CompanyManagement.tsx` (검색 기능 개선)
  - `routes/insurance/kj-driver-company.js` (검색 시 날짜 필터 무시)
- **주요 구현 사항**:
  - ✅ Phase 2 고급: 증권 정보 테이블 추가 기능 구현
    - 인원 버튼 클릭 시 대리기사 리스트 모달 (`MemberListModal`)
    - 배서 버튼 클릭 시 배서 모달 (`EndorseModal`)
    - 월보험료 버튼 클릭 시 월보험료 모달 (`PremiumModal`)
  - ✅ Phase 3: 메모 목록 구현
    - 메모 데이터 표시 (최대 10개)
    - 증권별 메모 내용 표시 (textarea)
  - ✅ Phase 4: SMS 목록 구현
    - SMS 데이터 표시 (최대 10개)
    - 수신 상태에 따른 텍스트 색상 적용 (#0A8FC1)
  - ✅ 검색 기능 개선
    - 검색어가 있을 때 날짜 필터 무시 (프론트엔드 + 라우터)
    - 검색 시 날짜와 관계없이 전체 업체 조회 가능
  - ✅ 월보험료 모달 개선
    - thead 색상 제거 (보라색 → 회색)
    - 저장 버튼 스타일 수정 (EndorseModal과 동일)
    - 나이 자동 설정 로직 개선 (빈 행에만 자동 설정)
    - 저장 로직 개선 (나이와 보험료가 모두 있는 행만 저장)

#### API 연동
- `/api/insurance/kj-certi/member-list` - 대리기사 리스트 조회
- `/api/insurance/kj-endorse/save` - 배서 저장
- `/api/insurance/kj-premium` - 월보험료 조회
- `/api/insurance/kj-premium/save` - 월보험료 저장
- `/api/insurance/kj-company/list` - 업체 목록 조회 (검색 시 날짜 필터 무시)

#### 해결한 이슈
- 검색 시 날짜 필터가 적용되는 문제: 검색어가 있으면 날짜 필터 무시하도록 수정
- 월보험료 모달 저장 시 빈 행이 저장되는 문제: 나이와 보험료가 모두 있는 행만 저장하도록 수정
- 나이 구간 중복 생성 문제: 나이 자동 설정 로직 개선 (빈 행에만 적용)

#### 남은 작업
- Phase 5: 기본 정보 수정 기능 구현
- Phase 6: 업체 I.D 관리 모달 구현

---

### 2026-01-12 (KJ 대리운전) - React 마이그레이션: 업체 상세 모달 Phase 1, Phase 2 기본 구현 및 검색 기능 개선

#### 작업 내용
- **기능**: 업체 상세 모달 (CompanyDetailModal) 단계별 구현
- **파일**: 
  - `src/pages/insurance/components/CompanyDetailModal.tsx` (신규 생성)
  - `src/pages/insurance/CompanyManagement.tsx` (검색 기능 개선)
- **주요 구현 사항**:
  - ✅ Phase 1: 기본 정보 테이블 완전 구현 (기존 HTML과 동일한 구조)
    - 주민번호, 대리운전회사, 성명, 핸드폰번호, 전화번호, 담당자, 팩스, 사업자번호
    - 법인번호, 보험료 받는날, 업체 I.D, 주소
    - 모달 폭 6xl로 확대 (기존 modal-xl과 유사한 크기)
  - ✅ Phase 2 기본: 증권 정보 테이블 기본 구조 및 인라인 편집
    - 인라인 편집 상태 관리 (`editingPolicies`)
    - 신규 입력 행 추가 (기존 개수 + 1, 최대 10행)
    - 신규 입력 시 인라인 편집 필드 (보험사 select, 시작일 date, 증권번호 text, 분납 text)
    - 저장 버튼 및 필수 필드 검증
    - 회차 변경 기능 (Select 컴포넌트, 1-10회차)
    - 증권성격 변경 기능 (Select 컴포넌트, 일반/탁송/일반·렌트/탁송·렌트/확대탁송)
    - 결제방식 변경 기능 (버튼, 정상납 ↔ 월납)
  - ✅ 업체 관리 페이지 검색 기능 개선
    - 검색 시 날짜 필터 무시 기능 추가
    - 검색어, 담당자, 상태 필터만 적용하여 전체 업체 조회 가능

#### API 연동
- `/api/insurance/kj-company/{companyNum}` - 업체 상세 정보 조회
- `/api/insurance/kj-certi/save` - 증권 정보 저장
- `/api/insurance/kj-certi/update-nabang` - 회차 변경
- `/api/insurance/kj-certi/update-gita` - 증권성격 변경
- `/api/insurance/kj-certi/update-divi` - 결제방식 변경
- `/api/insurance/kj-company/list` - 업체 목록 조회 (검색 시 날짜 필터 무시)

#### 남은 작업 (Phase 2 고급 기능)
- 인원 버튼 (대리기사 리스트 모달)
- 신규 입력 버튼
- 운전자 추가 버튼 (배서 모달)
- 월보험료 버튼 (월보험료 모달)

#### 다음 단계
- Phase 3: 메모 목록 구현
- Phase 4: SMS 목록 구현
- Phase 5: 기본 정보 수정 기능 구현

---

### 2026-01-11 (KJ 대리운전) - React 마이그레이션 Phase 2: 대리업체 관리 페이지 구현 완료

#### 38) KJ 대리운전 "대리업체 관리" 페이지 React 마이그레이션 완료
- **페이지 구현**:
  - `src/pages/insurance/CompanyManagement.tsx` 컴포넌트 생성
  - 기존 `kj-driver-company.html` 및 `kj-driver-company.js` 분석 및 마이그레이션
  - 공통 컴포넌트 활용 (FilterBar, DataTable)
- **FilterBar 구현**:
  - 상태 필터 (정상/전체)
  - 검색 입력 (대리운전회사명)
  - 검색 버튼
  - 담당자 선택 (API에서 동적 로드)
  - 페이지 크기 선택 (20/25/50/100개)
  - 날짜 선택 (1-31일, 오늘 날짜 기본값)
  - 대리운전회사 신규 버튼 (FilterBar 내부)
- **데이터 로드 및 필터링**:
  - 업체 목록 조회 API 연동 (`/api/insurance/kj-company/list`)
  - 담당자 목록 조회 API 연동 (`/api/insurance/kj-company/managers`)
  - 날짜 필터 변경 시 자동 검색 (오늘 날짜 기본값)
  - 검색어는 검색 버튼 클릭 시 검색
  - 페이지네이션 구현
- **데이터 테이블 구현**:
  - 컬럼: #, 업체명, 담당자, 연락처, 날짜, 인원, 정산
  - 업체명 클릭 시 상세 모달 (TODO)
  - 정산 버튼 (TODO)
  - 페이지네이션 (페이지 크기 선택 포함)
- **초기 로드 개선**:
  - 오늘 날짜를 기본값으로 설정
  - 날짜 필터 변경 시 자동 검색 (useEffect 사용)
  - useRef를 사용하여 최신 필터 상태 참조
- **라우팅 및 메뉴**:
  - `src/App.tsx`에 `/insurance/kj-driver-company` 라우트 추가
  - `menu-config.json`에 이미 메뉴 항목 존재 (order: 2)
- **파일**:
  - `src/pages/insurance/CompanyManagement.tsx`: 대리업체 관리 페이지 (신규)
  - `src/App.tsx`: 라우트 추가
- **결과**: KJ 대리운전 "대리업체 관리" 페이지 React 마이그레이션 완료. 업체 목록 조회, 필터링, 페이지네이션 기능 동작. 날짜 필터 기본값(오늘 날짜) 설정 및 자동 검색 구현. 다음 단계: 업체 상세 모달, 정산 모달, 신규 업체 추가 모달 구현.

### 2026-01-11 (KJ 대리운전) - React 마이그레이션 Phase 2: 증권번호 찾기 페이지 구현 완료

#### 37) KJ 대리운전 "증권번호 찾기" 페이지 React 마이그레이션 완료
- **페이지 구현**:
  - `src/pages/insurance/PolicySearch.tsx` 컴포넌트 생성
  - 기존 `kj-driver-policy-search.html` 및 `kj-driver-policy-search.js` 분석 및 마이그레이션
  - 공통 컴포넌트 활용 (FilterBar, DataTable, DatePicker, Modal, ExportButton)
- **필터바 구현**:
  - 증권번호 선택 (select 또는 직접 입력)
  - 시작일 날짜 선택 (DatePicker)
  - 검색 버튼 (FilterBar.SearchButton)
  - 증권번호 선택 시 시작일 자동 설정 (sigi 값 사용)
- **현황 표시 영역**:
  - 전체 증권 수
  - 인원 1명 이상 증권 수
  - 전체 인원 수
  - 인원 1명 이상 합계
  - 변경 버튼
  - 엑셀 다운로드 버튼
- **데이터 테이블 구현**:
  - 컬럼: #, 대리운전회사, 증권번호, 현재 인원, 시작일
  - 페이지네이션 없음 (검색 결과만 표시)
  - 컬럼 너비 및 스타일 조정
- **증권번호 변경 모달**:
  - 변경 전 정보 표시 (증권번호, 시작일)
  - 변경 후 정보 입력 (새 증권번호, 새 시작일, 새 보험회사)
  - 변경 실행 API 연동 (`/kj-certi/change-policy-execute`)
- **엑셀 다운로드 기능**:
  - ExcelJS 동적 import 사용
  - 회원 리스트 데이터 조회 API (`/kj-certi/change-policy-excel`)
  - 엑셀 파일 생성 및 다운로드
- **API 연동**:
  - `/api/insurance/kj-certi/list` - 증권번호 목록 조회
  - `/api/insurance/kj-certi/change-policy-search` - 검색
  - `/api/insurance/kj-certi/change-policy-execute` - 변경 실행
  - `/api/insurance/kj-certi/change-policy-excel` - 엑셀 다운로드
- **라우팅 및 메뉴**:
  - `src/App.tsx`에 `/insurance/kj-driver-policy-search` 라우트 추가
  - `menu-config.json`에 이미 메뉴 항목 존재 (order: 5)
- **파일**:
  - `src/pages/insurance/PolicySearch.tsx`: 증권번호 찾기 페이지 (신규)
  - `src/App.tsx`: 라우트 추가
- **결과**: KJ 대리운전 "증권번호 찾기" 페이지 React 마이그레이션 완료. 검색, 현황 표시, 증권번호 변경, 엑셀 다운로드 기능 모두 동작. Phase 1 패턴을 따라 FilterBar, DataTable 등 공통 컴포넌트 활용.

### 2026-01-11 (KJ 대리운전) - React 마이그레이션 Phase 2: 기사 찾기 페이지 구현 완료

#### 36) KJ 대리운전 "기사 찾기" 페이지 React 마이그레이션 완료
- **페이지 구현**:
  - `src/pages/insurance/DriverSearch.tsx` 컴포넌트 생성
  - 기존 `kj-driver-search.html` 및 `kj-driver-search.js` 분석 및 마이그레이션
  - 공통 컴포넌트 활용 (FilterBar, DataTable, DatePicker)
- **메뉴 구조 개선**:
  - `menu-config.json`에서 KJ대리운전 메뉴를 다단계 구조로 변경
  - 하위 메뉴: 기사 찾기, 대리업체 관리, 배서 리스트, 증권별 코드, 증권번호 찾기
  - `Sidebar.tsx`에서 다단계 메뉴 시각적 구분 (padding, font-size, border)
- **필터바 구현**:
  - 검색 타입 선택 (이름/주민번호)
  - 검색어 입력 (Enter 키 또는 검색 버튼으로 검색)
  - 상태 필터 (전체/정상)
  - 페이지 크기 선택
  - 해지기준일 날짜 선택
  - 단일 행 레이아웃으로 통합
- **데이터 테이블 구현**:
  - 컬럼: #, 이름, 주민번호, 나이, 상태, 증권성격, 보험회사, 증권번호, 요율, 핸드폰, 등록일, 해지일, 사고
  - 인라인 편집: 상태, 증권성격, 핸드폰, 사고 (핸드폰 번호 수정 완료)
  - 페이지네이션 (페이지 크기 선택 제거)
  - 테이블 헤더 폰트 크기 통일 (`text-sm`)
  - 컬럼 너비 조정 (# 컬럼 `w-12`)
  - 셀 내용 한 줄 표시 (`whitespace-nowrap`)
- **핸드폰 번호 수정 기능**:
  - 입력 시 하이픈 자동 추가 (010-1234-5678 형식)
  - 서버에 하이픈 포함 형식으로 저장
  - Enter 키 또는 포커스 해제 시 수정
  - `pci0327/api/insurance/kj-driver-phone-update.php` PHP API 생성
  - `disk-cms/routes/insurance/kj-driver-search.js`에 `/kj-driver/phone` POST 엔드포인트 추가
- **페이지네이션 개선**:
  - 전체 개수 0일 때 "0 ~ 0 / 전체 0개"로 표시
  - API 응답 구조 확인 (`pagination.total`)
- **라우터 파일 동기화**:
  - `disk-cms`와 `disk-cms-react`의 서버 라우터 파일 동기화
  - `routes/`, `middleware/`, `services/`, `config/`, `utils/` 폴더 비교 및 복사
- **파일**:
  - `src/pages/insurance/DriverSearch.tsx`: 기사 찾기 페이지 (신규)
  - `src/pages/insurance/constants.ts`: 공통 상수 (INSURER_OPTIONS, GITA_OPTIONS, DIVI_OPTIONS, RATE_OPTIONS, addPhoneHyphen, removePhoneHyphen)
  - `src/App.tsx`: `/insurance/kj-driver-search` 라우트 추가
  - `public/config/menu-config.json`: KJ대리운전 메뉴 구조 수정
  - `src/components/Sidebar.tsx`: 다단계 메뉴 렌더링 개선
  - `src/components/DataTable.tsx`: 페이지네이션 전체 개수 0일 때 표시 개선
  - `pci0327/api/insurance/kj-driver-phone-update.php`: 핸드폰 번호 업데이트 API (신규)
  - `disk-cms/routes/insurance/kj-driver-search.js`: `/kj-driver/phone` POST 엔드포인트 추가
  - `disk-cms-react/routes/insurance/kj-driver-search.js`: 동일 엔드포인트 추가
- **결과**: KJ 대리운전 "기사 찾기" 페이지 React 마이그레이션 완료. 검색, 필터링, 페이지네이션, 핸드폰 번호 수정 기능 모두 동작. 다음 단계: 나머지 페이지 마이그레이션 (대리업체 관리, 배서 리스트, 증권별 코드, 증권번호 찾기)

### 2026-01-11 (KJ 대리운전) - React 마이그레이션 Phase 1: 준비 작업 완료

#### 35) KJ 대리운전 React 마이그레이션 계획 수립 및 Phase 1 준비 작업 완료
- **마이그레이션 계획 수립**:
  - `disk-cms-react/docs/insurance/KJ_DRIVER_MIGRATION_PLAN.md` 작성
  - 5개 페이지 마이그레이션 계획 수립 (기사 찾기, 증권번호 찾기, 대리업체 관리, 증권별 코드, 배서 리스트)
  - Phase별 작업 계획 및 예상 시간 정리
  - work-log.md 업데이트 규칙 정의
- **Phase 1: 준비 작업 완료**:
  - `src/pages/insurance/` 폴더 생성
  - `src/pages/insurance/components/` 폴더 생성 (공통 컴포넌트용)
  - 기존 코드 분석 (kj-driver-search.js, API 엔드포인트 확인)
  - 문서 확인 (kj-대리운전-시스템-개요.md, kj-대리운전-업무플로우.md)
- **확인 사항**:
  - 기존 HTML/JS 파일 구조 파악 완료
  - API 엔드포인트 매핑 확인 (`/api/insurance/kj-driver/list` 등)
  - Node.js 프록시 라우터 구조 확인 (`disk-cms/routes/insurance/kj-driver-search.js`)
  - menu-config.json에 KJ대리운전 메뉴 구조 확인
- **파일**:
  - `disk-cms-react/docs/insurance/KJ_DRIVER_MIGRATION_PLAN.md`: 마이그레이션 계획 문서 (신규)
  - `src/pages/insurance/components/`: 폴더 생성
- **결과**: KJ 대리운전 React 마이그레이션 계획 수립 완료, Phase 1 준비 작업 완료. 다음 단계: Phase 2 페이지별 마이그레이션 시작 가능

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

### 2026-01-10 (프로젝트 전반) - 번들 크기 최적화 및 성능 개선

#### 33) 번들 분석 및 최적화 작업 완료
- **번들 분석 도구 설정**:
  - `rollup-plugin-visualizer` 패키지 추가 및 설정
  - 빌드 시 `dist/stats.html` 파일 자동 생성
  - 번들 크기, 의존성 관계, 청크 분할 상태 시각화
- **번들 분석 가이드 문서 작성**:
  - `docs/BUNDLE_ANALYSIS_GUIDE.md`: 번들 분석 파일 확인 방법 가이드
  - `docs/BUNDLE_ANALYSIS_HOW_TO_READ.md`: 번들 분석 파일 해석 방법 (초보자용)
  - `docs/BUNDLE_OPTIMIZATION_RESULTS.md`: 최적화 작업 결과 및 개선 효과 문서
- **ExcelJS 동적 Import 최적화**:
  - `DepositUsageModal.tsx`: ExcelJS를 동적 import로 변경 (엑셀 다운로드 시에만 로드)
  - `DepositListModal.tsx`: ExcelJS를 동적 import로 변경
  - 초기 번들에서 약 500KB 제거
- **Vite 청크 분할 설정 개선** (`vite.config.mjs`):
  - React core 청크 분리 (react, react-dom, scheduler 포함)
  - Router 청크 분리
  - Icons 청크 분리 (lucide-react, react-icons)
  - Dates 청크 분리 (moment, moment-timezone, date-fns)
  - ExcelJS 별도 청크 분리 (동적 import로 로드됨)
  - Markdown 관련 패키지는 vendor에 포함 (circular dependency 방지)
- **최적화 결과**:
  - **최적화 전**: vendor 1,337KB (398KB gzip)
  - **최적화 후**: vendor 394KB (127KB gzip), exceljs 938KB (별도 청크)
  - **개선 효과**: 초기 번들 크기 약 943KB 감소 (70% 감소), gzip 크기 약 271KB 감소 (68% 감소)
  - 초기 페이지 로딩 속도 대폭 개선
- **해결한 이슈**:
  - React useState 에러: React 관련 패키지 매칭 개선 (scheduler 포함)
  - Markdown circular dependency: markdown 청크 분할 제거, vendor에 포함
- **파일**:
  - `vite.config.mjs`: 청크 분할 설정 개선
  - `src/pages/pharmacy/components/DepositUsageModal.tsx`: ExcelJS 동적 import
  - `src/pages/pharmacy/components/DepositListModal.tsx`: ExcelJS 동적 import
  - `package.json`: rollup-plugin-visualizer 추가
  - `docs/BUNDLE_ANALYSIS_GUIDE.md`: 번들 분석 가이드 (신규)
  - `docs/BUNDLE_ANALYSIS_HOW_TO_READ.md`: 번들 분석 해석 가이드 (신규)
  - `docs/BUNDLE_OPTIMIZATION_RESULTS.md`: 최적화 결과 문서 (신규)
- **결과**: 프로젝트 전반의 번들 크기 최적화 완료, 초기 로딩 속도 개선, 엑셀 다운로드 기능은 필요할 때만 로드되도록 개선

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

### 2026-01-07 (Phase 2 진행) - UI 표준 정의 및 필터/모달 개선

#### 14) UI 표준 문서 작성 및 필터/모달 표준화
- **UI 표준 문서 작성**: `docs/UI_STANDARDS.md` 생성
  - 필터 영역 표준 (Select 40px, Input 42px, 통일된 스타일)
  - 모달 표준 (헤더 그라데이션, X 버튼만, 푸터 닫기 버튼 제거)
  - 작업 열 아이콘 표준 (Eye 아이콘 제거, Edit만 사용)
  - 레이블 제거 및 플레이스홀더 사용 표준
- **필터 영역 개선**:
  - Select 요소: 높이 40px, `px-3 py-0`, 폰트 스타일 통일 (`text-sm leading-none font-normal`, `box-sizing: border-box`)
  - Input 요소: 높이 42px (select보다 2px 높음), `pl-10 pr-3`, 폰트 스타일 통일
  - 통계 정보: 오른쪽 끝 배치 (`ml-auto`), "직원 현황:" 라벨 제거
  - 액션 버튼: 필터 영역 내부로 이동, 크기 축소 (80%), `px-3 py-1.5 text-xs`
- **모달 개선**:
  - 모달 헤더: 보라색 그라데이션 배경 (`from-[#667eea] to-[#764ba2]`), X 닫기 버튼 추가
  - 푸터 닫기/취소 버튼 제거 (헤더 X 버튼만 사용)
  - 본문 폰트: 모든 텍스트 `text-xs` 사용
  - 부서 관리 모달: 레이블 제거, 플레이스홀더만 사용
  - 섹션 제목 제거 ("새 부서 추가", "기존 부서 목록" 제거)
- **작업 열 개선**:
  - Eye 아이콘 제거 (상세보기 버튼 제거)
  - Edit 아이콘만 사용 (수정/상세보기 통합)
  - 데스크톱: `w-3.5 h-3.5`, 모바일: `w-4 h-4`
- **적용 페이지**:
  - ✅ `src/pages/staff/Employees.tsx` - 완료
  - ✅ `src/pages/staff/Holidays.tsx` - 완료 (공휴일 추가/수정 모달)
  - ✅ `src/pages/staff/HalfDayApproval.tsx` - 완료 (승인/거부 처리 모달)
  - ✅ `src/pages/staff/EmployeeSchedule.tsx` - 완료 (기본 휴무일 설정, 반차 신청, 휴무일 변경 신청 모달)
- **파일**: 
  - `src/pages/staff/Employees.tsx`
  - `docs/UI_STANDARDS.md` (신규)
- **결과**: 일관된 UI/UX 제공을 위한 표준 정의 완료, 모든 staff 페이지 모달에 표준 적용 완료

#### 15) 다른 페이지 모달 표준 적용
- **Holidays.tsx**:
  - 공휴일 추가 모달: 헤더 그라데이션 + X 버튼 추가, 레이블 제거 및 플레이스홀더 사용, 본문 `text-xs` 적용
  - 공휴일 수정 모달: 동일한 표준 적용
- **HalfDayApproval.tsx**:
  - 승인/거부 처리 모달: 헤더 그라데이션 + X 버튼 추가, 본문 `text-xs` 적용, 거부 사유 입력란 플레이스홀더 사용
- **EmployeeSchedule.tsx**:
  - 기본 휴무일 설정 모달: 헤더 그라데이션 + X 버튼 추가, 본문 `text-xs` 적용
  - 반차 신청 모달: 헤더 그라데이션 + X 버튼 추가, 레이블 제거 및 플레이스홀더 사용, 본문 `text-xs` 적용
  - 휴무일 변경 신청 모달: 헤더 그라데이션 + X 버튼 추가, 레이블 제거 및 플레이스홀더 사용, 본문 `text-xs` 적용
- **파일**: 
  - `src/pages/staff/Holidays.tsx`
  - `src/pages/staff/HalfDayApproval.tsx`
  - `src/pages/staff/EmployeeSchedule.tsx`
- **결과**: 모든 staff 페이지의 모달이 UI 표준에 맞게 통일됨

### 2026-01-07 (Phase 2 진행) - 공통 컴포넌트 적용

#### 18) 모든 staff 페이지에 공통 컴포넌트 적용 완료
- **EmployeeSchedule.tsx**:
  - Modal 컴포넌트로 3개 모달 교체 (기본 휴무일 설정, 반차 신청, 휴무일 변경 신청)
  - 기존 커스텀 모달 구조를 Modal 컴포넌트로 통일
  - footer prop으로 액션 버튼 구성
- **Holidays.tsx**:
  - Modal 컴포넌트로 2개 모달 교체 (공휴일 추가, 공휴일 수정)
  - 기존 커스텀 모달 구조를 Modal 컴포넌트로 통일
- **HalfDayApproval.tsx**:
  - Modal 컴포넌트로 1개 모달 교체 (승인/거부 처리)
  - 기존 커스텀 모달 구조를 Modal 컴포넌트로 통일
  - footer prop으로 승인/거부 버튼 구성
- **OrganizationChart.tsx**:
  - FilterBar 컴포넌트 적용
  - FilterSelect: 부서 필터
  - FilterInput: 검색 입력
  - StatsDisplay: 조직 현황 통계 (부서 개수, 직원 수, 마지막 갱신 시간)
  - actionButtons: 새로고침 버튼
- **파일**:
  - `src/pages/staff/EmployeeSchedule.tsx`
  - `src/pages/staff/Holidays.tsx`
  - `src/pages/staff/HalfDayApproval.tsx`
  - `src/pages/staff/OrganizationChart.tsx`
- **결과**: 모든 staff 페이지의 모달과 필터가 공통 컴포넌트로 통일되어 코드 일관성 및 유지보수성 향상

#### 19) Employees.tsx에 DataTable 컴포넌트 적용 완료
- **테이블 구조 개선**:
  - 기존 커스텀 테이블을 DataTable 컴포넌트로 교체
  - columns 배열로 테이블 구조 정의 (11개 컬럼: 이름, 이메일, 연락처, 사번, 부서, 직급, 권한, 가입일, 마지막로그인, 상태, 작업)
  - 각 컬럼에 cell 함수로 커스텀 렌더링 적용
  - 반응형 숨김 처리 유지 (className 사용: `hidden lg:table-cell`, `hidden xl:table-cell`)
- **모바일 카드 통합**:
  - renderMobileCard 함수로 모바일 카드 렌더링 정의
  - DataTable의 mobileCard prop으로 전달하여 자동 적용
- **페이지네이션 통합**:
  - 기존 커스텀 페이지네이션 코드 제거
  - DataTable의 pagination prop으로 통합
  - 페이지 크기 변경 기능 포함 (20, 50, 100개 옵션)
- **코드 간소화**:
  - 약 180줄의 테이블/페이지네이션 코드를 DataTable 컴포넌트 한 줄로 교체
  - 코드 중복 제거 및 재사용성 향상
- **사용하지 않는 import 제거**:
  - ChevronLeft, ChevronRight 아이콘 제거 (DataTable 내부에서 사용)
- **파일**:
  - `src/pages/staff/Employees.tsx`: DataTable 컴포넌트 적용 완료
- **결과**: Employees.tsx 코드가 간결해지고 재사용 가능한 구조로 개선됨

### 2026-01-07 (Phase 2 진행) - 공통 컴포넌트 적용 및 문서화

#### 21) 새로 개발한 공통 컴포넌트를 실제 페이지에 적용 완료
- **Employees.tsx**:
  - DatePicker: 퇴사일 지정 모달 적용
  - FormInput: 부서 관리 모달의 부서코드, 부서명 입력 필드 적용
  - Select: 부서 관리 모달의 부서장, 상태 select 적용
  - LoadingSpinner: DataTable 내부에서 자동 사용
- **EmployeeSchedule.tsx**:
  - Select: 기본 휴무일 설정 모달 적용
  - DatePicker: 반차 신청, 휴무일 변경 신청 모달 적용
  - Select: 반차 타입, 보충 일정, 휴무일 select 적용
  - FormInput: 대체 근무자 이메일 입력 필드 적용
  - LoadingSpinner: 전체 화면 로딩 오버레이로 교체
  - Toast: alert()를 toast로 교체 (스케줄 로드 오류, 수습 기간 경고)
- **Holidays.tsx**:
  - DatePicker: 공휴일 추가 모달 적용
  - FormInput: 공휴일명 입력 필드 적용 (추가, 수정 모달)
  - LoadingSpinner: 로딩 상태 표시 적용
  - Toast: alert()를 toast로 교체 (삭제, 생성, 검증 성공/오류)
- **HalfDayApproval.tsx**:
  - LoadingSpinner: 로딩 상태 표시 적용
- **DataTable.tsx**:
  - LoadingSpinner: 로딩 인디케이터로 교체 (기존 animate-spin 제거)
- **파일**:
  - `src/pages/staff/Employees.tsx`
  - `src/pages/staff/EmployeeSchedule.tsx`
  - `src/pages/staff/Holidays.tsx`
  - `src/pages/staff/HalfDayApproval.tsx`
  - `src/components/DataTable.tsx`
- **결과**: 새로 개발한 공통 컴포넌트가 실제로 작동하며, 코드 일관성 및 재사용성이 향상됨

#### 22) UI_STANDARDS.md 업데이트 완료
- **새 컴포넌트 사용 가이드 추가**:
  - FormInput 컴포넌트 사용 가이드 (variant, label, error, helperText 등)
  - DatePicker 컴포넌트 사용 가이드 (value, onChange, min, max 등)
  - Select 컴포넌트 사용 가이드 (options, placeholder, variant 등)
  - LoadingSpinner 컴포넌트 사용 가이드 (size, color, text, fullScreen 등)
  - Toast 컴포넌트 사용 가이드 (useToastHelpers, ToastProvider 설정 등)
- **적용 대상 페이지 업데이트**:
  - 모든 staff 페이지가 완료 상태로 업데이트
  - 각 컴포넌트별 예시 코드 포함
- **파일**:
  - `docs/UI_STANDARDS.md`: 새 컴포넌트 사용 가이드 추가
- **결과**: 개발자들이 새 컴포넌트를 쉽게 사용할 수 있도록 문서화 완료

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

#### 28) 공통 컴포넌트 사용 가이드 문서화
- **새 컴포넌트 사용 가이드 추가**:
  - FormInput 컴포넌트 사용 가이드 (variant, label, error, helperText 등)
  - DatePicker 컴포넌트 사용 가이드 (value, onChange, min, max 등)
  - Select 컴포넌트 사용 가이드 (options, placeholder, variant 등)
  - LoadingSpinner 컴포넌트 사용 가이드 (size, color, text, fullScreen 등)
  - Toast 컴포넌트 사용 가이드 (useToastHelpers, ToastProvider 설정 등)
- **적용 대상 페이지 업데이트**:
  - 모든 staff 페이지가 완료 상태로 업데이트
  - 각 컴포넌트별 예시 코드 포함
- **파일**:
  - `docs/UI_STANDARDS.md`: 새 컴포넌트 사용 가이드 추가
- **결과**: 개발자들이 새 컴포넌트를 쉽게 사용할 수 있도록 문서화 완료

### 2026-01-07 (Phase 2 진행) - 공통 컴포넌트 추가 개발

#### 20) 공통 컴포넌트 추가 개발 완료
- **FormInput 컴포넌트**:
  - 입력 필드 표준화 컴포넌트
  - variant 지원: `default`, `filter`, `modal` (각각 다른 스타일 적용)
  - label, error, helperText 지원 (선택적)
  - leftIcon, rightIcon 지원
  - filter variant일 때 검색 아이콘 자동 추가
  - forwardRef 지원
  - UI 표준 준수 (높이, 패딩, 폰트 등)
- **DatePicker 컴포넌트**:
  - 날짜 선택기 컴포넌트
  - FormInput 기반으로 구현
  - Calendar 아이콘 자동 포함
  - variant 지원 (default, filter, modal)
  - min, max 속성 지원
  - value, onChange 인터페이스 일관성 유지
- **LoadingSpinner 컴포넌트**:
  - 로딩 인디케이터 컴포넌트
  - size 지원: `sm`, `md`, `lg`
  - color 지원: `primary`, `muted`, `white`
  - text 속성으로 로딩 메시지 표시 가능
  - fullScreen 모드 지원 (전체 화면 오버레이)
  - 단독 사용 또는 컨테이너 내 사용 가능
- **Toast/Notification 컴포넌트**:
  - 알림 메시지 컴포넌트 시스템
  - ToastProvider: 전역 Toast 상태 관리
  - useToast: Toast 표시/제거 훅
  - useToastHelpers: 편의 함수 훅 (success, error, warning, info)
  - type 지원: `success`, `error`, `warning`, `info`
  - 자동 사라짐 (duration 설정 가능, 기본 3초)
  - 수동 닫기 버튼 포함
  - 우측 상단 고정 배치 (top-20 right-4)
  - 아이콘 자동 표시 (타입별)
- **Select/Dropdown 컴포넌트**:
  - 선택 박스 컴포넌트
  - variant 지원: `default`, `filter`, `modal`
  - options 배열로 옵션 정의
  - placeholder 지원
  - label, error, helperText 지원 (선택적)
  - ChevronDown 아이콘 자동 포함
  - UI 표준 준수 (높이, 패딩, 폰트 등)
  - appearance-none으로 브라우저 기본 스타일 제거
- **파일**:
  - `src/components/FormInput.tsx` (신규)
  - `src/components/DatePicker.tsx` (신규)
  - `src/components/LoadingSpinner.tsx` (신규)
  - `src/components/Toast.tsx` (신규)
  - `src/components/Select.tsx` (신규)
  - `src/components/index.ts`: 모든 컴포넌트 export 추가
  - `src/App.tsx`: ToastProvider 추가
- **결과**: 재사용 가능한 공통 컴포넌트 추가 개발 완료, 마이그레이션 속도 향상 및 일관성 개선 예상

### 2026-01-07 (Phase 2 진행) - 공통 컴포넌트 개발

#### 16) 공통 컴포넌트 개발 완료
- **Modal 컴포넌트**: 
  - 헤더 그라데이션 배경 + X 버튼 자동 포함
  - maxWidth 옵션 지원 (sm, md, lg, xl, 2xl, 4xl, 6xl)
  - footer prop 지원 (선택적)
  - UI 표준 준수
- **FilterBar 컴포넌트**:
  - `FilterBar.Select`: 표준 Select 요소 (높이 40px)
  - `FilterBar.Input`: 표준 Input 요소 (높이 42px, 검색 아이콘 포함)
  - `FilterBar.SearchButton`: 표준 검색 버튼
  - `FilterBar.Stats`: 통계 정보 표시 (오른쪽 끝 배치)
  - `actionButtons` prop 지원 (액션 버튼 영역)
- **DataTable 컴포넌트**:
  - 타입 안전한 제네릭 인터페이스
  - 데스크톱 테이블 + 모바일 카드 지원
  - 페이지네이션 내장 지원
  - 정렬 가능 옵션 (향후 확장)
  - 반응형 숨김 옵션 (hidden prop)
  - 커스텀 셀 렌더링 지원
- **파일**:
  - `src/components/Modal.tsx` (신규)
  - `src/components/FilterBar.tsx` (신규)
  - `src/components/DataTable.tsx` (신규)
  - `src/components/index.ts` (신규)
- **문서**:
  - `docs/UI_STANDARDS.md`: 공통 컴포넌트 사용 가이드 추가
- **결과**: 재사용 가능한 공통 컴포넌트 개발 완료, UI 표준 준수

#### 17) Employees.tsx에 공통 컴포넌트 적용
- **FilterBar 컴포넌트 적용**:
  - 기존 필터 영역을 `FilterBar` 컴포넌트로 교체
  - `FilterSelect` 컴포넌트로 모든 select 요소 교체 (부서, 상태, 권한, 페이지 크기)
  - `FilterInput` 컴포넌트로 검색 입력란 교체
  - `FilterSearchButton` 컴포넌트로 검색 버튼 교체
  - `StatsDisplay` 컴포넌트로 통계 정보 표시 교체
  - `actionButtons` prop으로 액션 버튼 영역 구성 (부서 관리, 근무 일정 관리, 엑셀 다운로드, 새로고침)
- **Modal 컴포넌트 적용**:
  - 수정/상세 모달: `Modal` 컴포넌트로 교체, `footer` prop으로 푸터 버튼 구성 (수정, 비활성화/재활성화)
  - 퇴사일 지정 모달: `Modal` 컴포넌트로 교체, `footer` prop으로 비활성화 버튼 구성
  - 부서 관리 모달: `Modal` 컴포넌트로 교체, `title`에 ReactNode 지원 추가 (Building 아이콘 포함), `subtitle` prop 추가, `maxHeight` prop 추가 (`90vh`)
- **Modal 컴포넌트 개선**:
  - `title` prop을 `string | ReactNode`로 확장하여 아이콘 포함 가능하도록 개선
  - `subtitle` prop 추가 (헤더에 부제목 표시)
  - `maxHeight` prop 추가 (모달 최대 높이 설정)
  - flex 레이아웃으로 개선 (헤더, 본문, 푸터 분리)
- **import 정리**:
  - 사용하지 않는 `Search` 아이콘 import 제거
  - 공통 컴포넌트 import 정리 (`Modal`, `FilterBar`, `FilterSelect`, `FilterInput`, `FilterSearchButton`, `StatsDisplay`)
- **파일**:
  - `src/pages/staff/Employees.tsx`: 공통 컴포넌트 적용 완료
  - `src/components/Modal.tsx`: `title`, `subtitle`, `maxHeight` prop 추가
  - `src/components/index.ts`: 공통 컴포넌트 export 정리
- **결과**: Employees.tsx가 공통 컴포넌트를 사용하여 코드 중복 제거 및 일관성 향상, 모든 린터 오류 해결 완료

### 2026-01-07 (Phase 2 진행) - 부서 관리 페이지 제거 및 UI/UX 개선

#### 13) 부서 관리 페이지 제거
- **변경 사항**: 좌측 메뉴의 "부서 관리" 페이지 삭제 (모달로만 처리)
- **이유**: 직원 관리 페이지에서 모달로 부서 관리 기능을 제공하므로 별도 페이지 불필요
- **수정 파일**:
  - `public/config/menu-config.json`: 부서 관리 메뉴 항목 제거
  - `src/App.tsx`: 부서 관리 라우트 및 import 제거
  - `src/pages/staff/Departments.tsx`: 파일 삭제
- **결과**: 좌측 메뉴에서 부서 관리 항목 제거, 직원 관리 페이지의 모달로만 부서 관리 가능

### 2026-01-07 (Phase 2 진행) - 직원 관리 UI/UX 개선 및 부서 관리 모달 추가

#### 10) 직원 수정 모달 UI/UX 개선
- **전화번호 자동 포맷팅**: 입력 시 자동으로 `010-3514-3262` 형식으로 변환
- **모달 헤더 개선**: "직원 정보" 텍스트 제거, 이메일(`mk@simg.kr`)만 표시
- **레이아웃 변경**: 레이블과 입력박스를 인라인 레이아웃으로 변경 (원본 `disk-cms` 스타일)
- **입력박스 정렬**: 로드 시 오른쪽 정렬, 포커스 시 왼쪽 정렬로 변경
- **파일**: `src/pages/staff/Employees.tsx`
- **결과**: 원본 `disk-cms` 모달과 동일한 UI/UX 구현

#### 11) 비활성화 기능 개선
- **퇴사일 지정 모달**: 비활성화 시 퇴사일을 지정할 수 있는 모달 추가
- **날짜 포맷팅 수정**: 마지막 로그인, 최종 수정일을 원본과 동일한 형식으로 표시 (`2026. 01. 03. 오후 04:35`)
- **퇴사일 표시**: 퇴사일은 원본 데이터 그대로 표시 (포맷팅 없음)
- **파일**: `src/pages/staff/Employees.tsx`
- **결과**: 원본 `disk-cms`와 동일한 비활성화 프로세스 구현

#### 12) 부서 관리 모달 추가
- **모달 구조**: 이전 버전(`disk-cms`)과 동일한 구조로 부서 관리 모달 구현
- **부서 추가**: 부서코드, 부서명, 부서장, 상태, 설명 입력 폼
- **부서 수정**: 테이블에서 인라인 편집 지원 (코드, 부서명, 부서장, 설명, 상태)
- **부서 삭제**: 소속 직원이 없는 부서만 삭제 가능
- **부서장 선택**: 부서장 후보 직원 목록 자동 로드 (SUPER_ADMIN, DEPT_MANAGER, SYSTEM_ADMIN)
- **API**: 
  - `GET /api/staff/departments/manage` - 부서 목록 조회
  - `POST /api/staff/departments` - 부서 추가
  - `PUT /api/staff/departments/:id` - 부서 수정
  - `DELETE /api/staff/departments/:id` - 부서 삭제
- **파일**: `src/pages/staff/Employees.tsx`
- **결과**: "부서 관리" 버튼 클릭 시 모달이 열리고, 부서 추가/수정/삭제가 가능

### 2026-01-07 (Phase 2 진행) - 엑셀 다운로드 버그 수정

#### 8) 직원 엑셀 다운로드 완료
- **문제**: `/api/staff/employees/export?status=1` 요청 시 "직원을 찾을 수 없습니다." 오류 발생
- **원인**: Express 라우터 순서 문제 - `/employees/export`가 `/employees/:email` 라우터보다 뒤에 있어서 `export`가 `email` 파라미터로 해석됨
- **해결**: `/employees/export` 라우터를 `/employees/:email` 라우터보다 앞에 배치하여 라우팅 충돌 해결
- **파일**: `routes/staff/employees.js`
- **결과**: 엑셀 다운로드 기능 정상 작동 확인

### 2026-01-07 (Phase 2 진행)

#### 1) 직원 근무일정 페이지 (EmployeeSchedule.tsx)
- 기능: 상태확인 → 월별 스케줄 로드 → 캘린더 렌더링(서버 daily_schedule 기반), 반차 신청/목록, 휴무일 변경 신청/목록
- API: 
  - `/api/staff/work-schedules/my-status`
  - `/api/staff/work-schedules/my-schedule/:year/:month`
  - `/api/staff/work-schedules/apply-half-day`
  - `/api/staff/work-schedules/temporary-change`
  - `/api/staff/work-schedules/my-half-days`
  - `/api/staff/work-schedules/my-change-requests`

#### 2) 공휴일 관리 페이지 (Holidays.tsx)
- 기능: 3개년 목록, 추가/수정/비활성화, 대체 공휴일 자동 생성, 데이터 검증
- API:
  - `GET/POST/PUT/DELETE /api/staff/holidays`
  - `POST /api/staff/holidays/generate-substitute`
  - `GET /api/staff/holidays/validate?year=YYYY`

#### 3) 반차 승인 페이지 (HalfDayApproval.tsx)
- 기능: 승인 대기 반차/휴무일 변경 목록 조회, 승인/거부 처리(거부 사유 입력)
- API:
  - `GET /api/staff/work-schedules/pending-half-days`
  - `POST /api/staff/work-schedules/approve-half-day/:leaveId`
  - `GET /api/staff/work-schedules/pending-changes`
  - `POST /api/staff/work-schedules/approve-change/:changeId`

#### 4) 조직도 페이지 (OrganizationChart.tsx)
- 기능: 부서/검색 필터, 경영진 섹션, 부서별 직원 카드, 부서 미지정 섹션
- API:
  - `GET /api/staff/departments`
  - `GET /api/staff/employees/org-chart`

#### 5) 직원 리스트 개선 (Employees.tsx)
- 통계 표기 오류 수정: 서버 `data.statistics`/`data.pagination.total_count` 스키마에 맞게 매핑
- 작업 버튼 구현:
  - 상세/수정 모달(이름/전화/부서/직급/권한/상태), `PUT /api/staff/employees/:email`
  - 비활성화/재활성, `PATCH /api/staff/employees/:email/deactivate|activate`
  - 휴지통 아이콘 중복 제거

#### 6) 부서 관리 모달 (Employees.tsx 내 모달로 처리)
- 기능: 관리 목록(`manage`), 추가/수정/삭제(권한별 제한), 검색/필터
- 위치: 직원 관리 페이지 내 "부서 관리" 버튼 클릭 시 모달로 표시
- API:
  - `GET /api/staff/departments/manage`
  - `POST /api/staff/departments`
  - `PUT /api/staff/departments/:id`
  - `DELETE /api/staff/departments/:id`
- 변경: 별도 페이지에서 모달로 변경 (2026-01-07)

#### 7) 라우팅/메뉴 업데이트
- `App.tsx`: `staff/employee-schedule`, `staff/holidays`, `staff/half-day-approval`, `staff/organization-chart` 라우트 추가
- `menu-config.json`: "조직도" 등 메뉴 추가/정렬
- 부서 관리: 별도 페이지 대신 직원 관리 페이지의 모달로 처리 (2026-01-07)

#### 8) 엑셀 다운로드 ✅
- 백엔드: `GET /api/staff/employees/export` 구현(필터 반영, exceljs 사용)
- 프론트: "엑셀 다운로드" 버튼에서 xlsx 다운로드 처리(에러 응답 blob 처리 보완)
- 라우팅 순서 수정: `/employees/export`를 `/employees/:email`보다 앞에 배치하여 충돌 해결
- 상태: 완료 및 정상 작동 확인

### Phase 1: 핵심 기능 구현 (2026-01-05)

#### 1. 프로젝트 분석 및 마이그레이션 계획 수립
- **작업 내용**: disk-cms 프론트엔드 구조 전체 분석
  - 총 27개 HTML 페이지 확인
  - 66개 JavaScript 파일 확인
  - menu-config.json 메뉴 구조 분석
- **결과물**: `MIGRATION_PLAN.md` 작성
  - 마이그레이션 범위 및 예상 시간 분석
  - 5단계 Phase별 작업 계획 수립
  - 총 예상 시간: 169-277시간 (4-7주)

#### 2. 대시보드 페이지 완성 (Dashboard.tsx)
- **작업 내용**: 원본 dashboard.html/dashboard.js의 모든 기능을 React로 마이그레이션
- **구현된 기능**:
  - ✅ 출퇴근 기능 (출근/퇴근 버튼, 상태 표시)
  - ✅ 오늘의 출퇴근 정보 표시 (출근 시간, 퇴근 시간, 근무 시간)
  - ✅ 개인 통계 카드 (이번 달 처리 건수, 평균 처리시간, 주간 근무시간, 달성률)
  - ✅ 관리자 통계 카드 (전체 직원, 오늘 출근, 승인 대기) - 관리자 권한별 표시
  - ✅ 최근 활동 목록 (활동 타입별 아이콘, 상태 배지)
  - ✅ 공지사항 (우선순위별 스타일링, 타임라인 형식)
- **API 연동**:
  - `/api/dashboard` - 대시보드 데이터 조회
  - `/api/attendance/checkin` - 출근 처리
  - `/api/attendance/checkout` - 퇴근 처리
- **기술 스택**: React, TypeScript, Tailwind CSS, Lucide Icons

#### 3. 회원가입 페이지 마이그레이션 (Register.tsx)
- **작업 내용**: register.html의 모든 기능을 React로 마이그레이션
- **구현된 기능**:
  - ✅ 실시간 폼 검증 (이메일, 비밀번호, 비밀번호 확인, 성명, 휴대폰번호)
  - ✅ 휴대폰번호 자동 포맷팅 (010-1234-5678 형식)
  - ✅ 에러 메시지 표시 (필드별 에러, API 에러)
  - ✅ 성공 메시지 및 자동 리다이렉트 (로그인 페이지)
  - ✅ 로딩 상태 관리
- **API 연동**: `/api/auth/signup`
- **UI/UX**: 
  - Gradient 배경
  - 반응형 디자인
  - 실시간 유효성 검사 피드백

#### 4. 비밀번호 재설정 페이지 마이그레이션 (ResetPassword.tsx)
- **작업 내용**: reset-password.html의 모든 기능을 React로 마이그레이션
- **구현된 기능**:
  - ✅ URL 토큰 파라미터 추출
  - ✅ 토큰 검증 (로딩 상태 표시)
  - ✅ 비밀번호 재설정 폼 (비밀번호, 비밀번호 확인)
  - ✅ 실시간 폼 검증
  - ✅ 성공/실패 메시지 표시
  - ✅ 자동 리다이렉트 (성공 시 로그인 페이지)
- **API 연동**:
  - `/api/auth/verify-reset-token/:token` - 토큰 검증
  - `/api/auth/reset-password` - 비밀번호 재설정
- **상태 관리**: 토큰 검증 중, 토큰 유효, 토큰 무효, 재설정 성공 상태별 UI

#### 5. 로그인 페이지 기능 확장 (Login.tsx)
- **작업 내용**: 원본 login.html의 모든 기능을 React로 구현
- **구현된 기능**:
  - ✅ 계정 상태 확인 (이메일 입력 후 확인 버튼)
  - ✅ 비밀번호 찾기 모달 (이메일 입력 후 재설정 링크 발송)
  - ✅ 회원가입 링크 연결
  - ✅ 계정 상태 표시 (활성/승인 대기)
- **API 연동**:
  - `/api/auth/account-status/:email` - 계정 상태 확인
  - `/api/auth/request-password-reset` - 비밀번호 재설정 요청

#### 6. Sidebar 메뉴 구조 개선 (Sidebar.tsx)
- **작업 내용**: menu-config.json 기반 동적 메뉴 로딩
- **구현된 기능**:
  - ✅ menu-config.json 동적 로드
  - ✅ 권한별 메뉴 표시 (roles 체크)
  - ✅ 중첩 메뉴 지원 (최대 3단계)
  - ✅ Font Awesome 아이콘을 Lucide 아이콘으로 매핑
  - ✅ 활성 메뉴 하이라이트
  - ✅ 메뉴 확장/축소 기능
- **결과물**: `public/config/menu-config.json` 생성

#### 7. Layout/Header 정렬 개선
- **작업 내용**: Sidebar 헤더와 본문 Header 높이 일치
- **수정 사항**:
  - Sidebar 헤더 폰트 크기 조정 (text-xl → text-base)
  - 패딩 통일 (px-4 → px-6)
  - line-height 조정 (leading-none 추가)
  - Header 위치 미세 조정 (top: -1px)
- **결과**: 두 헤더가 정확히 같은 높이에 정렬됨

#### 8. 페이지 헤더 제거 및 레이아웃 통일
- **작업 내용**: 모든 페이지에서 중복 헤더 제거
- **수정 사항**:
  - Dashboard.tsx: "대시보드" 헤더 및 환영 문구 제거
  - Employees.tsx: "직원 관리" 헤더 제거
  - Layout.tsx: 본문 여백 조정 (pt-16 → pt-20)
- **결과**: 좌측 사이드바 메뉴만으로 네비게이션, 본문은 콘텐츠만 표시

#### 9. 직원 목록 페이지 마이그레이션 (Employees.tsx)
- **작업 내용**: staff/employees.html 전체 기능 마이그레이션
- **구현된 기능**:
  - ✅ 필터링 (부서, 상태, 권한, 검색)
  - ✅ 통계 정보 표시 (전체, 승인대기, 활성, 비활성)
  - ✅ 페이징 (페이지 네비게이션)
  - ✅ 반응형 테이블 (데스크톱) / 카드 (모바일)
  - ✅ 액션 버튼 (부서 관리, 근무 일정 관리, 엑셀 다운로드, 새로고침)
  - ✅ 관리자 권한 체크
- **API 연동**: `/api/staff/employees` (필터링, 페이징 지원)
- **레이아웃 개선**:
  - 필터를 2행에서 1행으로 통합
  - 필터 레이블 제거
  - 통계 정보를 필터 영역 아래로 이동

---

## 📁 생성/수정된 파일

### Phase 1에서 생성된 주요 파일
- `src/pages/Dashboard.tsx` (436줄)
- `src/pages/Login.tsx` (358줄)
- `src/pages/Register.tsx`
- `src/pages/ResetPassword.tsx`
- `src/pages/staff/Employees.tsx` (약 500줄)
- `src/pages/staff/EmployeeSchedule.tsx`
- `src/pages/staff/Holidays.tsx`
- `src/pages/staff/HalfDayApproval.tsx`
- `src/pages/staff/OrganizationChart.tsx`
- `src/components/Sidebar.tsx` (242줄)
- `src/components/Layout.tsx`
- `src/components/Header.tsx`
- `src/components/Modal.tsx` (신규, 공통 컴포넌트)
- `src/components/FilterBar.tsx` (신규, 공통 컴포넌트)
- `src/components/DataTable.tsx` (신규, 공통 컴포넌트)
- `src/components/index.ts` (신규, Export 파일)
- `public/config/menu-config.json`
- `MIGRATION_PLAN.md`
- `docs/work-log.md` (본 파일)
- `docs/UI_STANDARDS.md` (신규, UI 표준 가이드)

---

## 📊 작업 통계

### 코드 라인 수
- **총 추가 코드**: 약 2,100줄 이상

### 완료된 페이지 수
- **Phase 1**: 5개 페이지 완료 ✅
- **전체 기준**: 5/27 페이지 완료 (약 19%)

---

## 🔍 기술적 결정사항

1. **상태 관리**: Zustand 사용 (authStore)
2. **UI 라이브러리**: 
   - Tailwind CSS (스타일링)
   - Lucide React (아이콘)
3. **타입 안정성**: TypeScript strict mode 준수
4. **API 통신**: Axios 기반 api 클라이언트 사용
5. **라우팅**: React Router v6 사용

---

## 🐛 해결한 이슈

1. **TypeScript 컴파일 오류**
   - 문제: `hasCheckedIn`과 `hasCheckedOut`가 `string | undefined` 타입
   - 해결: `!!` 연산자로 명시적 boolean 변환

2. **Layout/Header 정렬 문제**
   - 문제: Sidebar 헤더와 본문 Header 높이 불일치
   - 해결: 폰트 크기, 패딩, line-height 통일 및 미세 조정

3. **아이콘 import 오류**
   - 문제: `Golf` 아이콘이 lucide-react에 없음
   - 해결: `CircleDot` 아이콘으로 교체

4. **직원 현황 통계 0 표시**
   - 문제: 서버 응답 스키마(`statistics`, `pagination.total_count`)와 프론트 매핑(`stats`, `total`) 불일치
   - 해결: 프론트 매핑 수정 및 로드 실패 시 에러 메시지 표시

5. **작업 아이콘 중복**
   - 문제: 휴지통 아이콘이 작업 열에 중복 표시
   - 해결: 삭제 아이콘(물리 삭제) 제거, 비활성/활성 전환만 유지

---

## 📝 다음 작업 계획

### KJ 대리운전 - 다음 작업
- [x] 배서 리스트 페이지 마이그레이션 (`kj-driver-endorse-list.html` → React) - **완료**
- [x] 증권별 코드 페이지 마이그레이션 (`kj-driver-code-by-policy.html` → React) - **Phase 1-3 완료, Phase 4 (테스트) 남음**

### Phase 2: 직원 관리 모듈 상태 (업데이트: 2026-01-07)
- [x] 근무일정 페이지 (staff/employee-schedule)
- [x] 공휴일 관리 페이지 (staff/holidays)
- [x] 반차 승인 페이지 (staff/half-day-approval)
- [x] 조직도 페이지 (staff/organization-chart)
- [x] 부서 관리 모달 (직원 관리 페이지에서 모달로 처리)
- [x] 직원리스트 작업 버튼(수정/활성/비활성)
- [x] 직원리스트 엑셀 다운로드 (라우팅 순서 문제 해결 완료)

### 공통 컴포넌트 개발
- [x] DataTable 컴포넌트 (정렬, 필터, 페이지네이션)
- [x] Modal 컴포넌트
- [x] FilterBar 컴포넌트
- [ ] 공통 컴포넌트를 기존 페이지에 적용 (Employees.tsx 등)

---

## 🔄 업무 루틴화

### 📖 매일 업무 시작 시 학습 파일 확인 절차
**목적**: 매일 업무 시작 전 프로젝트 컨텍스트와 진행 상황 파악

**절차**:
1. `docs/work-log.md` 파일 1개만 학습
   - 파일명: `work-log.md` (날짜 없음, 단일 파일)
   - 최신 작업 내용 포함
2. 학습 내용 확인:
   - ✅ 완료된 작업 목록
   - 📝 다음 작업 계획
   - 🔍 기술적 결정사항
   - 🐛 해결한 이슈
3. 필요한 경우 추가 파일 참조:
   - `MIGRATION_PLAN.md` - 전체 마이그레이션 계획
   - `README.md` (DEVELOPMENT 루트) - 프로젝트 아키텍처
   - `memo-figma-brief.md` - 디자인 시스템 가이드

**학습 명령어 예시**:
```
disk-cms-react/docs/work-log.md 파일 학습하자
```
또는
```
work-log.md 파일 학습하자
```

**주의사항**:
- ❌ 여러 파일을 동시에 학습하지 않음 (1개 파일만)
- ✅ `work-log.md` 파일만 학습
- ✅ 특별히 필요한 경우에만 추가 파일 참조

### ✏️ 기능 완성 시 작업일지 업데이트 규칙

**목적**: 하나의 기능이 완성될 때마다 작업 내용을 즉시 기록하여 진행 상황 추적

**규칙**:
1. **기능 완성 기준**: 
   - 단위 테스트 통과
   - UI/UX 완성
   - API 연동 완료
   - 버그 수정 완료
   - 사용자 검증 완료

2. **업데이트 절차**:
   - 사용자가 "기능완성"이라고 언급 시
   - `work-log.md` 파일에 해당 기능 추가
   - 다음 섹션에 추가:
     - 완료된 작업 항목
     - 생성/수정된 파일 목록
     - 해결한 이슈 (있을 경우)
     - 다음 단계 계획

3. **작성 형식**:
   ```markdown
   ## ✅ [날짜] 완료된 기능: [기능명]
   
   ### 작업 내용
   - **기능**: [기능 설명]
   - **파일**: [생성/수정된 파일]
   - **주요 구현 사항**:
     - ✅ 항목 1
     - ✅ 항목 2
   
   ### API 연동
   - `/api/xxx` - [설명]
   
   ### 해결한 이슈
   - [이슈 내용]: [해결 방법]
   ```

4. **업데이트 위치**:
   - "✅ 완료된 작업" 섹션 상단에 최신 항목 추가
   - 날짜별로 구분하지 않고, 최신 항목이 위로 오도록 작성

**명령어 예시**:
사용자가 "기능완성"이라고 하면, AI가 자동으로:
1. 마지막으로 작업한 기능 파악
2. `work-log.md`에 해당 내용 추가
3. 작업 통계 업데이트

---

## 💡 배운 점 및 개선사항

1. **원본 코드 분석의 중요성**: 원본 HTML/JavaScript를 꼼꼼히 분석하여 모든 기능을 놓치지 않고 마이그레이션할 수 있었음
2. **타입 안정성**: TypeScript를 사용하여 컴파일 시점에 오류를 발견할 수 있어 유지보수성 향상
3. **컴포넌트 재사용성**: 공통 컴포넌트를 미리 설계하면 마이그레이션 속도가 빨라질 것으로 예상
4. **레이아웃 통일**: 모든 페이지에서 일관된 레이아웃 구조를 사용하면 사용자 경험이 향상됨

---

## 🔄 진행 중인 작업

없음 (모든 진행 중인 작업 완료)

---

## ⏸️ 미제 작업 (보류)

### 일일배서리스트 모달 관련
- [x] **보험료/C보험료 업데이트 기능 구현** (일일배서리스트 모달) - **완료**
  - 구현 완료: 입력 필드 편집 가능, Enter 키 또는 blur 시 업데이트
  - 위치: `src/pages/insurance/components/DailyEndorseListModal.tsx`
  - API: `pci0327/api/insurance/kj-daily-endorse-premium-update.php` (신규 생성)
  - 기능: 보험료/C보험료 인라인 편집, 콤마 자동 처리, 업데이트 후 자동 새로고침
  
- [x] **요율 상세 모달 구현** (일일배서리스트 모달) - **완료**
  - 구현 완료: 요율 클릭 시 상세 모달 표시
  - 위치: `src/pages/insurance/components/RateDetailModal.tsx` (신규 생성)
  - 기능: 요율 코드 및 값 표시, 요율 설명, 전체 요율 목록 테이블 (선택된 요율 강조)
  - 모달 크기: `xl` (10% 증가)

### 증권별 코드 페이지 마이그레이션
> **상태**: Phase 1-3 완료, Phase 4 (테스트 및 최적화) 남음

**Phase 4: 테스트 및 최적화** (예상 시간: 2-3시간)
- [ ] 전체 기능 테스트
- [ ] 에러 핸들링 개선
- [ ] 로딩 상태 표시
- [ ] 성능 최적화
- [ ] UI/UX 개선

---

## 📝 다음 작업 계획

### 2026-01-14 (KJ 대리운전) - 배서 리스트 페이지 개선 작업 (완료)

#### 완료된 작업
- ✅ 일일배서리스트 모달 완전 구현 (이전 버전과 동일)
- ✅ 배서현황 모달 완전 구현 (검토 버튼 클릭 시 열림)
- ✅ 문자리스트 모달 완전 구현 (이전 버전과 동일)
- ✅ 모달 위치 조정 (일일배서리스트 왼쪽 상단, 배서현황 그 옆에 나란히)
- ✅ 상태 표시 수정 (PUSH_MAP 확장 및 사용)
- ✅ 일일배서리스트 모달 UI 개선 (입력 상자 스타일, 콤마 표시)

#### 다음 작업 계획

### 증권별 코드 페이지 마이그레이션 계획

> **작업 일자**: 2026-01-14  
> **페이지**: 증권별 코드 (`kj-driver-code-by-policy.html` → React)  
> **상태**: 계획 수립 완료, 작업 대기 중

#### 📋 페이지 개요

**목적**: 증권번호별로 코드 정보를 조회하고, 증권 상세 정보를 수정하며, 보험료 데이터를 관리하는 페이지입니다.

**주요 기능**:
1. **증권번호 검색**: 증권번호 선택 또는 직접 입력으로 검색
2. **증권 리스트 조회**: 검색된 증권들의 코드 정보 표시
3. **증권 상세 모달**: 증권번호 클릭 시 상세 정보 조회 및 수정
4. **보험료 입력 모달**: 연령별 보험료 데이터 입력 및 수정
5. **보험료 통계**: 담당자별/연령별 보험료 통계 표시

#### 📁 파일 구조

**React 컴포넌트**:
```
src/pages/insurance/
├── CodeByPolicy.tsx                    # 메인 페이지 컴포넌트
└── components/
    ├── PolicyDetailModal.tsx           # 증권 상세 모달
    └── PremiumInputModal.tsx          # 보험료 입력 모달
```

**API 엔드포인트** (Node.js 프록시):
- `GET  /kj-code/policy-search`         # 증권 리스트 검색
- `POST /kj-code/policy-num-detail`    # 증권 상세 정보 조회
- `POST /kj-certi/update`              # 증권 정보 수정
- `GET  /kj-code/policy-num-stats`      # 보험료 통계 조회
- `GET  /kj-insurance-premium-data`     # 보험료 데이터 조회
- `POST /kj-insurance-premium-data`    # 보험료 데이터 저장

#### 🔧 주요 기능 상세

**1. 증권번호 검색**
- Select 드롭다운: 증권번호 목록에서 선택
- 직접 입력: "직접 입력" 옵션 선택 시 텍스트 입력 필드 표시
- 자동 검색: Select에서 증권번호 선택 시 자동 검색
- 수동 검색: 직접 입력 후 검색 버튼 클릭 또는 Enter 키

**2. 증권 리스트 테이블**
- 컬럼 구성: # (순번, 클릭 시 상세 모달 열기), 증권번호, 회사명, 계약자, 소유자, 주민번호, 보험사, 계약일, 회차, 인원 (합계 표시), max, 코드, 비밀번호, 인증번호, 단체율, 할인율
- 기능: 페이지네이션 (15개씩), 인원 합계 행 표시, 총 증권 개수 및 현재 페이지 범위 표시

**3. 증권 상세 모달**
- 표시 정보: 증권번호 (읽기 전용), 회사명 (수정 가능), 계약자 (수정 가능), 주민번호 (수정 가능), 계약일 (수정 가능), 회차 (수정 가능), 인원 (읽기 전용), 단체율 (수정 가능), 할인율 (수정 가능)
- 기능: 수정 버튼으로 정보 저장, 보험료 입력 버튼 (모달 footer), 보험료 통계 표시 (담당자별/연령별)

**4. 보험료 통계**
- 담당자별 표시: 각 담당자별 연령대별 인원, 보험료 표시, 담당자별 소계 표시, 전체 합계 표시
- 컬럼: 연령, 인원, 1/10 보험료, 회사보험료, 환산, 월보험료

**5. 보험료 입력 모달**
- 입력 필드 (7개 행): 순번, 시작 나이, 끝 나이, 년기본, 년특약, 년계 (자동 계산, 읽기 전용)
- 기능: 끝 나이 입력 시 다음 행의 시작 나이 자동 채움 (+1), 년기본/년특약 입력 시 (년기본 + 년특약) × 10 = 년계 자동 계산, 콤마 자동 포맷팅, 시작 나이 없이 보험료 입력 시 검증 오류, 저장/수정 버튼 (기존 데이터 있으면 "수정", 없으면 "저장")

#### 🔌 API 연동 상세

**1. 증권 리스트 검색**
```
GET /api/insurance/kj-code/policy-search?sj=policy_&certi={증권번호}
```
- 파라미터: `sj` (고정값 "policy_"), `certi` (증권번호, 선택)
- 응답: 증권 리스트 배열

**2. 증권 상세 정보 조회**
```
POST /api/insurance/kj-code/policy-num-detail
Body: { num: 증권번호 }
```
- 응답: 증권 상세 정보 객체

**3. 증권 정보 수정**
```
POST /api/insurance/kj-certi/update
Body: {
  certi: 증권번호,
  company: 회사명,
  name: 계약자,
  jumin: 주민번호,
  sigi: 계약일,
  nab: 회차,
  yearRate: 단체율,
  harinRate: 할인율
}
```

**4. 보험료 통계 조회**
```
GET /api/insurance/kj-code/policy-num-stats?certi={증권번호}&by_manager=1
```
- 응답: 담당자별/연령별 보험료 통계

**5. 보험료 데이터 조회**
```
GET /api/insurance/kj-insurance-premium-data?policyNum={증권번호}
```
- 응답: 연령별 보험료 데이터 배열

**6. 보험료 데이터 저장**
```
POST /api/insurance/kj-insurance-premium-data
Body: {
  policyNum: 증권번호,
  data: [
    {
      rowNum: 1,
      start_month: 시작나이,
      end_month: 끝나이,
      payment10_premium1: 년기본,
      payment10_premium2: 년특약,
      payment10_premium_total: 년계
    },
    ...
  ]
}
```

#### 🎨 UI/UX 요구사항

**공통 컴포넌트 활용**:
- `FilterBar`: 검색 필터 영역
- `DataTable`: 증권 리스트 테이블
- `Modal`: 증권 상세 모달, 보험료 입력 모달
- `DatePicker`: 계약일 입력 (증권 상세 모달)
- `FormInput`: 텍스트 입력 필드
- `Select`: 증권번호 선택

**스타일링**:
- 테이블: `table-bordered`, `table-hover`, `table-sm`
- 모달: `modal-xl` (증권 상세), `modal-lg` (보험료 입력)
- 숫자 포맷팅: 콤마 구분 (예: 1,000,000)
- 합계 행: `kje-total-row` 클래스, 굵은 글씨

**반응형**:
- 데스크톱: 전체 테이블 표시
- 모바일: 카드 형식으로 변환 (DataTable 컴포넌트 활용)

#### 📝 작업 체크리스트

**Phase 1: 기본 구조 및 검색 기능** (예상 시간: 4-6시간)
- [ ] `CodeByPolicy.tsx` 컴포넌트 생성
- [ ] 증권번호 검색 필터 구현 (Select + 직접 입력)
- [ ] 증권 리스트 테이블 구현 (DataTable 컴포넌트)
- [ ] 페이지네이션 구현
- [ ] API 연동 (`/kj-code/policy-search`)
- [ ] 증권번호 목록 로드 (`/kj-certi/list`)

**Phase 2: 증권 상세 모달** (예상 시간: 4-6시간)
- [ ] `PolicyDetailModal.tsx` 컴포넌트 생성
- [ ] 증권 상세 정보 조회 API 연동
- [ ] 증권 정보 수정 기능 구현
- [ ] 보험료 통계 표시 (담당자별/연령별)
- [ ] 보험료 입력 버튼 연동

**Phase 3: 보험료 입력 모달** (예상 시간: 4-6시간)
- [ ] `PremiumInputModal.tsx` 컴포넌트 생성
- [ ] 보험료 데이터 조회 API 연동
- [ ] 연령별 보험료 입력 폼 구현 (7개 행)
- [ ] 자동 계산 기능 구현
  - [ ] 끝 나이 입력 시 다음 행 시작 나이 자동 채움
  - [ ] 년기본/년특약 입력 시 년계 자동 계산 ((년기본 + 년특약) × 10)
- [ ] 콤마 자동 포맷팅
- [ ] 검증 로직 (시작 나이 필수)
- [ ] 보험료 데이터 저장 API 연동

**Phase 4: 테스트 및 최적화** (예상 시간: 2-3시간)
- [ ] 전체 기능 테스트
- [ ] 에러 핸들링 개선
- [ ] 로딩 상태 표시
- [ ] 성능 최적화
- [ ] UI/UX 개선

#### 📊 예상 작업 시간

- **Phase 1**: 4-6시간
- **Phase 2**: 4-6시간
- **Phase 3**: 4-6시간
- **Phase 4**: 2-3시간
- **총 예상 시간**: 14-21시간 (약 2-3일)

#### 🔍 참고 파일

**원본 파일**:
- `disk-cms/public/pages/insurance/kj-driver-code-by-policy.html`
- `disk-cms/public/js/insurance/kj-driver-code-by-policy.js`

**유사 페이지 참고**:
- `src/pages/insurance/PolicySearch.tsx` (증권번호 찾기)
- `src/pages/insurance/CompanyManagement.tsx` (대리업체 관리)
- `src/pages/insurance/components/CompanyDetailModal.tsx` (업체 상세 모달)

**공통 컴포넌트**:
- `src/components/DataTable.tsx`
- `src/components/Modal.tsx`
- `src/components/FilterBar.tsx`
- `src/components/FormInput.tsx`
- `src/components/Select.tsx`
- `src/components/DatePicker.tsx`

#### 🚀 시작 전 확인 사항

1. ✅ API 엔드포인트가 모두 구현되어 있는지 확인
2. ✅ 공통 컴포넌트가 필요한 기능을 모두 지원하는지 확인
3. ✅ 이전 버전의 모든 기능을 파악했는지 확인
4. ✅ 데이터 구조 및 필드명 확인

---

**작성자**: AI Assistant  
**최종 업데이트**: 2026년 1월 14일 (증권 상세 정보 모달 및 보험료 입력 모달 개선 및 완전 재구현 완료)  
**프로젝트**: Disk-CMS React 마이그레이션

---

## 📊 작업 통계

### 완료된 작업 수
- **Phase 1**: 9개 작업 완료
- **Phase 2**: 13개 작업 완료 (직원 관리 모듈 + 공통 컴포넌트 개발)
- **Phase 3**: 진행 중 (보험 상품 모듈)
  - 약국배상책임보험: 10개 작업 완료 (Applications 페이지, 업체 추가 모달, 상세 모달, 인라인 편집/페이지네이션 개선, 일별/월별 실적 모달, 예치금 현황 조회 모달, 예치금 충전/리스트/사용내역 모달, 정산 데이터 정리 모달, 실적 조회 증권발급 기준 추가)
  - KJ 대리운전: 10개 작업 완료 (마이그레이션 계획 수립, 기사 찾기 페이지, 업체 상세 모달 Phase 1/2, 업체 상세 모달 Phase 2 고급/3/4, 배서 모달 UI 개선 및 userName 필드 추가, 배서 리스트 페이지 UI/UX 개선 및 중복 리스트 모달, 일일배서리스트/배서현황/문자리스트 모달 완전 구현, 증권 상세 정보 모달 완전 구현, 보험료 입력 모달 완전 구현, 증권 상세 정보 모달 및 보험료 입력 모달 개선 및 완전 재구현)
- **프로젝트 전반**: 1개 작업 완료 (번들 크기 최적화 및 성능 개선)
- **총 44개 작업 완료**

### 개발된 공통 컴포넌트
- ✅ Modal (모달)
- ✅ FilterBar (필터 바)
- ✅ DataTable (데이터 테이블)
- ✅ FormInput (입력 필드)
- ✅ DatePicker (날짜 선택기)
- ✅ Select (선택 박스)
- ✅ LoadingSpinner (로딩 인디케이터)
- ✅ Toast (알림 메시지)
- ✅ FileUpload (파일 업로드)
- ✅ ExportButton (엑셀 다운로드 버튼)
- ✅ FileDownloadLink (파일 다운로드 링크)
- ✅ ButtonGroup (버튼 그룹)
- **총 12개 공통 컴포넌트**

---

## 📋 대리운전회사용 시스템 기획 (예정)

### 시스템 개요
**목적**: 대리운전회사가 직접 사용할 시스템 개발  
**현재 시스템**: 보험대리점용 시스템 (KJ 대리운전 모듈)  
**신규 시스템**: 대리운전회사용 시스템

---

### 질의응답 (기획을 위한 요구사항 파악)

#### Q1. 시스템 사용자 및 권한
**Q**: 대리운전회사용 시스템의 주요 사용자는 누구인가요?
- [ ] 대리운전회사 관리자
- [ ] 대리운전회사 직원
- [ ] 대리운전기사 (개인)
- [ ] 기타: ___________

**Q**: 사용자별 권한은 어떻게 구분되나요?
- 관리자: ___________
- 직원: ___________
- 기사: ___________

---

#### Q2. 핵심 기능 범위
**Q**: 대리운전회사가 가장 필요로 하는 기능은 무엇인가요?
- [ ] 기사 관리 (등록, 수정, 해지)
- [ ] 증권 관리 (조회, 변경)
- [ ] 보험료 조회 및 납부
- [ ] 정산 관리
- [ ] 일일/월별 통계
- [ ] 알림/공지사항
- [ ] 기타: ___________

**Q**: 현재 보험대리점 시스템에서 대리운전회사가 사용하는 기능은?
- ___________
- ___________

---

#### Q3. 데이터 접근 범위
**Q**: 대리운전회사는 어떤 데이터에 접근할 수 있어야 하나요?
- [ ] 본인 회사 소속 기사만 조회
- [ ] 본인 회사 증권만 조회
- [ ] 본인 회사 보험료/정산 정보만 조회
- [ ] 전체 데이터 조회 (다른 회사 포함)
- [ ] 기타: ___________

**Q**: 데이터 공유 범위는?
- 회사 간 데이터 공유: [ ] 예 [ ] 아니오
- 보험대리점과 데이터 공유: [ ] 예 [ ] 아니오

---

#### Q4. 업무 프로세스
**Q**: 대리운전회사의 주요 업무 프로세스는?
1. **기사 가입 프로세스**
   - ___________
   - ___________

2. **기사 해지 프로세스**
   - ___________
   - ___________

3. **보험료 납부 프로세스**
   - ___________
   - ___________

4. **정산 프로세스**
   - ___________
   - ___________

**Q**: 보험대리점과의 협업 프로세스는?
- ___________
- ___________

---

#### Q5. 통계 및 리포트
**Q**: 대리운전회사가 필요한 통계/리포트는?
- [ ] 일일 가입/해지 현황
- [ ] 월별 가입/해지 통계
- [ ] 기사별 보험료 내역
- [ ] 회사별 보험료 합계
- [ ] 증권별 현황
- [ ] 기타: ___________

**Q**: 리포트 형식은?
- [ ] 화면 조회
- [ ] 엑셀 다운로드
- [ ] PDF 출력
- [ ] 이메일 발송
- [ ] 기타: ___________

---

#### Q6. 알림 및 공지
**Q**: 필요한 알림/공지 기능은?
- [ ] 보험료 납부 알림
- [ ] 기사 가입/해지 알림
- [ ] 증권 변경 알림
- [ ] 보험대리점 공지사항
- [ ] 기타: ___________

**Q**: 알림 방식은?
- [ ] 화면 알림
- [ ] 이메일
- [ ] SMS
- [ ] 푸시 알림
- [ ] 기타: ___________

---

#### Q7. 시스템 연동
**Q**: 연동이 필요한 외부 시스템은?
- [ ] 보험대리점 시스템 (현재 시스템)
- [ ] 보험사 시스템
- [ ] 결제 시스템
- [ ] SMS 발송 시스템
- [ ] 기타: ___________

**Q**: 데이터 동기화 방식은?
- [ ] 실시간 동기화
- [ ] 배치 동기화 (시간 지정)
- [ ] 수동 동기화
- [ ] 기타: ___________

---

#### Q8. UI/UX 요구사항
**Q**: 주요 사용 환경은?
- [ ] 데스크톱 웹
- [ ] 모바일 웹
- [ ] 모바일 앱
- [ ] 태블릿

**Q**: 사용 빈도가 높은 기능은?
- ___________
- ___________

---

#### Q9. 보안 및 인증
**Q**: 인증 방식은?
- [ ] 아이디/비밀번호
- [ ] 이메일 인증
- [ ] SMS 인증
- [ ] 2단계 인증
- [ ] 기타: ___________

**Q**: 보안 요구사항은?
- ___________
- ___________

---

#### Q10. 우선순위
**Q**: 가장 먼저 구현해야 할 기능은? (우선순위 순서)
1. ___________
2. ___________
3. ___________

**Q**: MVP(최소 기능 제품) 범위는?
- ___________
- ___________

---

### 질의응답 답변 요약

#### Q1. 시스템 사용자 및 권한
- **사용자**: 대리운전회사 관리자, 대리운전회사 직원(읽기 전용), 기사
- **권한 구분**:
  - 관리자: 청약, 해지 등 모든 권한
  - 읽기 전용 사용자: 조회만 가능
  - 기사: 청약 시 관리자가 핸드폰 번호, 성명 입력 → 기사에게 MMS 발송 → 기사가 주민번호 입력

#### Q2. 핵심 기능 범위
- 기사 관리 (등록, 수정, 해지)
- 증권 관리 (조회)
- 보험료 조회 및 납부
- 정산 관리
- 일일/월별 통계
- 알림/공지사항
- **현재 사용 기능**: 청약, 해지

#### Q3. 데이터 접근 범위
- 본인 회사 소속 기사만 조회
- 본인 회사 증권만 조회
- 본인 회사 보험료/정산 정보만 조회
- **데이터 공유**: 대리운전회사 간 공유는 보험대리점이 허용한 특수한 경우에만 가능, 다른 보험대리점과는 공유하지 않음

#### Q4. 업무 프로세스
1. **기사 가입**: 성격에 맞는 증권에 성명, 주민번호, 핸드폰 번호로 청약
2. **기사 해지**: 증권별 리스트에서 해지
3. **보험료 납부**: 월 1회 정산
4. **정산 프로세스**: 보험대리점에서 월 1회 안내
5. **협업 프로세스**: 청약/해지 신청 → 보험대리점이 본사 전산에 시행 후 확인 → 문자로 증권번호, 월보험료, 배서보험료 안내

#### Q5. 통계 및 리포트
- 일일 가입/해지 현황
- 월별 가입/해지 통계
- 기사별 보험료 내역
- 회사별 보험료 합계
- 증권별 현황
- **형식**: 화면 조회, 엑셀 다운로드

#### Q6. 알림 및 공지
- 보험료 납부 알림
- 기사 가입/해지 알림
- 보험대리점 공지사항
- **방식**: 화면 알림, 이메일, SMS, 푸시 알림

#### Q7. 시스템 연동
- 보험대리점 시스템 (현재 시스템)
- SMS 발송 시스템
- **동기화**: 실시간 동기화 (동일한 데이터베이스 사용)

#### Q8. UI/UX 요구사항
- 데스크톱 웹, 모바일 웹
- **사용 빈도 높은 기능**: 청약, 해지

#### Q9. 보안 및 인증
- 아이디/비밀번호
- 세션 관리

#### Q10. 우선순위
1. 로그인, 증권별 기사현황, 배서리스트, 청약/해지
2. (전체 요구사항 개발)
- **MVP**: 최소 기능 제품 불필요, 본 요구사항 전체 개발

---

## 📋 대리운전회사용 시스템 상세 기획서

### 1. 시스템 개요

#### 1.1 목적
대리운전회사가 직접 사용할 수 있는 웹 시스템으로, 기사 관리(청약/해지), 증권 조회, 보험료 조회, 정산 관리 등을 제공합니다.

#### 1.2 주요 특징
- 보험대리점 시스템과 동일한 데이터베이스 사용 (실시간 동기화)
- 회사별 데이터 격리 (본인 회사 데이터만 조회)
- 기사 가입 시 MMS를 통한 주민번호 입력 프로세스 (케이드라이브 만 가능능)
- 데스크톱/모바일 웹 지원

---

### 2. 사용자 및 권한

#### 2.1 사용자 유형
1. **대리운전회사 관리자**
   - 권한: 모든 기능 사용 (청약, 해지, 조회, 수정 등)
   - 주요 업무: 기사 관리, 증권 조회, 정산 확인

2. **대리운전회사 직원 (읽기 전용)**
   - 권한: 조회만 가능 (수정/삭제 불가)
   - 주요 업무: 현황 조회, 통계 확인

3. **대리운전기사**
   - 권한: 제한적 (주민번호 입력만)
   - 프로세스: 관리자가 청약 시 핸드폰 번호, 성명 입력 → MMS 발송 → 기사가 주민번호 입력

#### 2.2 권한 관리
- 회사별 사용자 관리
- 역할 기반 권한 제어 (RBAC)
- 세션 관리 및 보안

---

### 3. 핵심 기능

#### 3.1 기사 관리
**3.1.1 기사 청약 (가입)**
- 증권 선택 (성격에 맞는 증권)
- 기사 정보 입력: 성명, 핸드폰 번호
- MMS 발송: 기사에게 주민번호 입력 링크 전송
- 기사 주민번호 입력 완료 후 청약 처리
- 보험대리점 시스템으로 전송
- 처리 완료 후 문자 안내 (증권번호, 월보험료, 배서보험료)

**3.1.2 기사 해지**
- 증권별 기사 리스트에서 해지 처리
- 해지 사유 입력 (선택)
- 보험대리점 시스템으로 전송
- 처리 완료 후 문자 안내

**3.1.3 기사 조회 및 수정**
- 증권별 기사 현황 조회
- 기사 정보 수정 (관리자만)
- 기사 상세 정보 조회

#### 3.2 증권 관리
- 본인 회사 증권 목록 조회
- 증권별 기사 현황 조회
- 증권 상세 정보 조회
- 증권별 통계 (인원, 보험료 등)

#### 3.3 배서 리스트
- 청약/해지 신청 내역 조회
- 진행 상태 확인
- 처리 완료 내역 조회
- 필터링: 날짜, 증권, 상태 등

#### 3.4 보험료 조회 및 납부
- 기사별 보험료 내역 조회
- 증권별 보험료 합계 조회
- 회사별 보험료 합계 조회
- 월별 보험료 조회
- 정산 내역 조회

#### 3.5 정산 관리
- 월 1회 정산 안내 (보험대리점에서 제공)
- 정산 내역 조회
- 정산 상세 정보 확인
- 엑셀 다운로드

#### 3.6 통계 및 리포트
**3.6.1 일일 통계**
- 일일 가입 현황
- 일일 해지 현황
- 일일 가입/해지 합계

**3.6.2 월별 통계**
- 월별 가입/해지 통계
- 월별 보험료 통계
- 월별 증권별 현황

**3.6.3 리포트**
- 기사별 보험료 내역
- 회사별 보험료 합계
- 증권별 현황
- 형식: 화면 조회, 엑셀 다운로드

#### 3.7 알림 및 공지
- 보험료 납부 알림
- 기사 가입/해지 알림
- 보험대리점 공지사항
- 알림 방식: 화면 알림, 이메일, SMS, 푸시 알림

---

### 4. 데이터 접근 범위

#### 4.1 데이터 격리
- 본인 회사 소속 기사만 조회
- 본인 회사 증권만 조회
- 본인 회사 보험료/정산 정보만 조회

#### 4.2 데이터 공유 (고려하지 말것 나중에 다시 의논논)
- 대리운전회사 간 공유: 보험대리점이 허용한 특수한 경우에만 가능
- 다른 보험대리점과는 공유하지 않음

#### 4.3 데이터 동기화
- 보험대리점 시스템과 동일한 데이터베이스 사용
- 실시간 동기화 (동일 DB 사용)

---

### 5. 업무 프로세스

#### 5.1 기사 가입 프로세스
```
1. 관리자 로그인  현황(증권별 인원,배서현황 )
2. 증권 선택 (성격에 맞는 증권)
3. 기사 정보 입력 (성명, 핸드폰 번호)
4. 청약 신청
5. 시스템이 기사에게 MMS 발송 (주민번호 입력 링크) 케이드라이브 인경우만 
6. 기사가 주민번호 입력
7. 보험대리점 시스템으로 전송
8. 보험대리점이 본사 전산에 시행
9. 확인 완료 후 문자 안내 (증권번호, 월보험료, 배서보험료)
```

#### 5.2 기사 해지 프로세스
```
1. 관리자 로그인
2. 증권별 기사 리스트 조회
3. 해지할 기사 선택
4. 해지 신청 (해지 사유 입력하지 않음)
5. 보험대리점 시스템으로 전송
6. 보험대리점이 본사 전산에 시행
7. 확인 완료 후 문자 안내
```

#### 5.3 보험료 납부 프로세스
```
1. 월 1회 보험대리점에서 정산 안내
2. 대리운전회사에서 정산 내역 확인
3. 보험료 납부
4. 납부 완료 확인
```

---

### 6. 시스템 연동

#### 6.1 보험대리점 시스템 연동
- 동일한 데이터베이스 사용
- 실시간 데이터 동기화
- API를 통한 청약/해지 신청 전송

#### 6.2 SMS/MMS 발송 시스템 연동
- **발송 시점**:
  - 기사 가입 시 MMS 발송 (케이드라이브만, 주민번호 입력 링크 포함)
  - 배서 처리 완료 후 SMS 안내 (증권번호, 월보험료, 배서보험료)
  - 알림 SMS 발송
- **발송 방식**: Aligo SMS API 연동 (AWS Lambda 프록시 사용)
- **API 엔드포인트**: `https://j7rqfprgb5.execute-api.ap-northeast-2.amazonaws.com/default/aligo-5962`
- **발송 모듈 위치**: 
  - `pci0327/api/utils/kj-sms-utils.php` - 배서 SMS 발송 유틸리티 함수 (`sendEndorseSms()`)
  - `pci0327/api/utils/kj-sms-aligo.php` - Aligo SMS API 연동 함수 (`sendAligoSms()`)
- **사용 예시**: `pci0327/api/insurance/kj-endorse-update-status.php`에서 배서 처리 시 사용
- **발송 이력 저장**: `SMSData` 테이블에 발송 내역 저장
- **MMS 발송**: 주민번호 입력 링크가 포함된 MMS (케이드라이브만)
- **재사용**: 대리운전회사용 시스템에서도 동일한 모듈 사용 (`require_once`로 포함)

---

### 7. UI/UX 요구사항

#### 7.1 지원 환경
- 데스크톱 웹 (보조조 사용 환경)
- 모바일 웹 (주주 사용 환경)

#### 7.2 주요 화면 구성
1. **로그인 화면**
2. **대시보드** (현황 요약)
3. **증권별 기사 현황** (가장 빈번한 사용)
4. **배서 리스트** (청약/해지 내역)
5. **청약 화면**
6. **해지 화면**
7. **보험료 조회**
8. **통계/리포트**
9. **알림/공지사항**

#### 7.3 사용 빈도 높은 기능
- 청약 (가장 빈번)
- 해지
- 증권별 기사 현황 조회

---

### 8. 보안 및 인증

#### 8.1 인증 방식
- 아이디/비밀번호
- 세션 관리
- 자동 로그아웃 (일정 시간 미사용 시)

#### 8.2 보안 요구사항
- **HTTPS 통신**: 모든 통신은 HTTPS 필수
- **비밀번호 암호화**: MD5 해시 사용 (기존 시스템과 동일)
- **세션 관리**:
  - PHP 세션 사용 (`session_start()`)
  - 세션 고정 공격 방지: `session_regenerate_id(true)` 사용
  - 세션 타임아웃: 30분 미사용 시 자동 로그아웃
  - 세션 데이터: `$_SESSION['user_num']`, `$_SESSION['user_id']`, `$_SESSION['company_num']` 등
- **SQL Injection 방지**: PDO Prepared Statement 필수 사용
- **XSS 방지**: 
  - 출력 시 `htmlspecialchars()` 사용
  - 사용자 입력 데이터 검증 및 정제
- **CSRF 보호**: 중요 작업(청약, 해지) 시 CSRF 토큰 검증 (구현 권장)
- **입력 검증**:
  - 필수 필드 검증
  - 데이터 타입 검증
  - 길이 제한 검증
  - 특수문자 필터링

---

### 9. 개발 우선순위

#### Phase 1: 핵심 기능 (최우선)
1. 로그인/인증
2. 증권별 기사 현황 조회
3. 배서 리스트 조회
4. 기사 청약 (가입)
5. 기사 해지

#### Phase 2: 보완 기능
1. 보험료 조회
2. 정산 관리
3. 통계/리포트
4. 알림/공지사항

#### Phase 3: 고도화
1. 엑셀 다운로드
2. 모바일 웹 최적화
3. 성능 최적화
4. 사용자 경험 개선

---

### 10. 기술 스택

#### 10.1 서버 환경
- **호스팅**: 카페24 (PHP 호스팅)
- **인코딩**: UTF-8
- **백엔드**: PHP 8.2
- **데이터베이스**: MariaDB 10.x
- **문자셋**: UTF-8 (데이터베이스, 파일, 통신 모두)
- **제약사항**: Node.js/React 빌드 환경 미지원

#### 10.2 프론트엔드
**기술 스택**:
- 순수 HTML5 + CSS3 + JavaScript (ES6+)
- 모던 JavaScript (Vanilla JS 또는 jQuery)
- 반응형 CSS (Flexbox, Grid)
- 모바일 우선 디자인

**대안 고려사항**:
- **옵션 1**: 순수 HTML/CSS/JavaScript (권장)
  - 카페24 환경에 최적화
  - 별도 빌드 과정 불필요
  - 빠른 배포 가능
  
- **옵션 2**: 정적 파일 빌드 후 업로드
  - 로컬에서 React로 개발 → 빌드 → 정적 파일 업로드
  - 개발 편의성은 높지만 배포 과정 복잡
  
- **옵션 3**: PHP 템플릿 방식
  - PHP 파일에 HTML 포함
  - 서버 사이드 렌더링

**권장 방식**: 순수 HTML/CSS/JavaScript (옵션 1)
- 카페24 환경에 가장 적합
- 기존 보험대리점 시스템과 유사한 구조
- 빠른 개발 및 배포

#### 10.3 백엔드
- PHP 8.2
- RESTful API 또는 전통적인 PHP 방식 (폼 제출)
- 현재 보험대리점 시스템과 동일한 데이터베이스 사용
- 회사별 데이터 격리 (WHERE 조건으로 필터링)

**기존 API 구조 이해**:
- `pci0327/api/insurance/` - PHP 백엔드 API (보험대리점용)
- `disk-cms-react`의 Node.js 서버가 이 PHP API를 프록시로 사용
- 구조: React 프론트엔드 → Node.js Express 서버 → PHP API → DB
- 참고: `disk-cms-react/routes/insurance/kj-driver-company.js`에서 `PHP_API_BASE_URL = 'https://pcikorea.com/api/insurance'` 사용

**대리운전회사용 시스템 구조**:
- 카페24에서 직접 실행 (Node.js 프록시 없음)
- 구조: HTML/JS → PHP API → DB (직접 호출)
- `pci0327/api/insurance/`의 PHP API 구조 참고하여 `pci0327/api/daeri/` 개발

#### 10.4 데이터베이스
- MariaDB 10.x
- 현재 보험대리점 시스템과 동일한 DB 사용
- UTF-8 문자셋
- 회사별 데이터 격리 (WHERE 조건으로 필터링)

#### 10.5 개발 및 배포 방식
**로컬 개발**:
- PHP 8.2 로컬 서버 (XAMPP, WAMP 등)
- MariaDB 로컬 설치 또는 원격 DB 연결
- 브라우저 개발자 도구 활용

**배포**:
- FTP/SFTP를 통한 파일 업로드
- 카페24 호스팅에 직접 업로드
- 별도 빌드 과정 없이 즉시 배포 가능

---

### 11. 데이터베이스 스키마

#### 11.1 주요 테이블 구조

**11.1.1 사용자 테이블 (`2012Costomer`)**
- **역할**: 대리운전회사 사용자 정보
- **주요 필드**:
  - `num`: 사용자 번호 (PK)
  - `2012DaeriCompanyNum`: 대리운전회사 번호 (FK → `2012DaeriCompany.num`)
  - `mem_id`: 로그인 ID
  - `passwd`: 비밀번호 (MD5 해시)
  - `name`: 사용자 이름
  - `level`: 권한 레벨
  - `permit`: 허가 여부
  - `readIs`: 읽기 전용 여부
- **로그인**: `mem_id`와 `passwd`(MD5)로 인증

**11.1.2 대리운전회사 테이블 (`2012DaeriCompany`)**
- **역할**: 대리운전회사 기본 정보
- **주요 필드**:
  - `num`: 회사 번호 (PK)
  - `company`: 회사명
  - `Pname`: 대표자명
  - `jumin`: 주민번호
  - `hphone`: 핸드폰 번호
  - `cphone`: 전화번호
  - `damdanga`: 담당자 번호
  - `divi`: 구분
  - `fax`: 팩스
  - `cNumber`: 사업자번호
  - `lNumber`: 법인번호
  - `postNum`: 우편번호
  - `address1`, `address2`: 주소
  - `MemberNum`: 회원 번호
  - `pBankNum`: 은행 번호
  - `FirstStartDay`: 최초 시작일
  - `FirstStart`: 최초 시작
  - `union_`: 연합
  - `notJumin`: 주민번호 없음 여부

**11.1.3 증권 테이블 (`2012CertiTable`)**
- **역할**: 보험 증권 정보
- **주요 필드**:
  - `num`: 증권 번호 (PK)
  - `2012DaeriCompanyNum`: 대리운전회사 번호 (FK → `2012DaeriCompany.num`)
  - `DaeriCompany`: 대리운전회사명
  - `InsuraneCompany`: 보험회사 코드
  - `startyDay`: 시작일 (현재일로부터 1년 이내만 유효)
  - `policyNum`: 증권번호
  - `nabang`: 회차
  - `divi`: 결제방식 (1=정상납, 2=월납)
  - `gita`: 증권성격
  - `state`: 상태
  - `preminum1~10`: 보험료 (10회분납)
  - `preminumE1~10`: 보험료 (10회분납 추가)
  - `yearP1~6`: 년보험료
  - `moRate`: 월요율
  - `jagi`: 단체율
  - `control`: 관리
  - `personal`: 개인
- **유효성**: `startyDay`가 현재일로부터 1년 이내인 증권만 유효

**11.1.4 대리운전기사 테이블 (`2012DaeriMember`)**
- **역할**: 대리운전기사 정보
- **주요 필드**:
  - `num`: 기사 번호 (PK)
  - `moCertiNum`: 증권 번호
  - `2012DaeriCompanyNum`: 대리운전회사 번호 (FK → `2012DaeriCompany.num`)
  - `CertiTableNum`: 증권 테이블 번호 (FK → `2012CertiTable.num`)
  - `InsuranceCompany`: 보험회사 코드
  - `Name`: 기사 이름
  - `Jumin`: 주민번호
  - `nai`: 나이
  - `push`: 상태 (1=청약, 4=정상)
  - `etag`: 증권성격
  - `FirstStart`: 최초 시작일
  - `state`: 상태
  - `cancel`: 해지 여부
  - `sangtae`: 상태
  - `Hphone`: 핸드폰 번호
  - `InputDay`: 입력일
  - `OutPutDay`: 해지일
  - `EndorsePnum`: 배서 번호
  - `dongbuCerti`: 동부증권번호
  - `dongbuSelNumber`: 동부선택번호
  - `dongbusigi`: 동부시기
  - `dongbujeongi`: 동부정기
  - `nabang_1`: 회차
  - `ch`: 변경
  - `changeCom`: 변경 회사
  - `sPrem`: 보험료
  - `sago`: 사고
  - `p_buho`: 보호
  - `preminum1`: 보험료1
  - `wdate`: 작성일
  - `endorse_day`: 배서일
  - `rate`: 요율
  - `reasion`: 사유
  - `manager`: 담당자
  - `progress`: 진행단계
- **상태 값**: `push = 4` (정상), `push = 1` (청약)

**11.1.5 요율 테이블 (`2019rate`)**
- **역할**: 기사별 요율 정보
- **주요 필드**:
  - `num`: 번호 (PK)
  - `policy`: 증권번호 (FK → `2012DaeriMember.dongbuCerti`)
  - `jumin`: 주민번호 (FK → `2012DaeriMember.Jumin`)
  - `rate`: 요율 코드

**11.1.6 보험회사 보험료 데이터 (`kj_insurance_premium_data`)**
- **역할**: 보험회사에 내는 보험료 (C보험료 포함)
- **주요 필드**:
  - `id`: 번호 (PK)
  - `policyNum`: 증권번호 (FK → `2012DaeriMember.dongbuCerti` = `2012CertiTable.policyNum`)
  - `rowNum`: 행 번호
  - `start_month`: 시작 나이
  - `end_month`: 끝 나이
  - `payment10_premium1`: 년기본 보험료
  - `payment10_premium2`: 년특약 보험료
  - `payment10_premium_total`: 년계 보험료

**11.1.7 월납보험료 데이터 (`kj_premium_data`)**
- **역할**: 월납 보험료 정보
- **주요 필드**:
  - `id`: 번호 (PK)
  - `cNum`: 증권 번호 (FK → `2012CertiTable.num`)
  - `rowNum`: 행 번호
  - `start_month`: 시작 나이
  - `end_month`: 끝 나이
  - `monthly_premium1`: 월기본 보험료
  - `monthly_premium2`: 월특약 보험료
  - `monthly_premium_total`: 월계 보험료
  - `payment10_premium1`: 년기본 보험료
  - `payment10_premium2`: 년특약 보험료
  - `payment10_premium_total`: 년계 보험료

#### 11.2 테이블 관계도

```
2012Costomer (사용자)
  ├─ 2012DaeriCompanyNum → 2012DaeriCompany.num (대리운전회사)
  │
  └─ 2012DaeriCompanyNum → 2012CertiTable.2012DaeriCompanyNum (증권)
      │
      ├─ 2012CertiTable.num → 2012DaeriMember.CertiTableNum (기사)
      │   │
      │   ├─ 2012DaeriMember.dongbuCerti → 2019rate.policy (요율)
      │   │
      │   └─ 2012DaeriMember.dongbuCerti → kj_insurance_premium_data.policyNum (보험회사 보험료)
      │
      └─ 2012CertiTable.num → kj_premium_data.cNum (월납보험료)
```

#### 11.3 데이터 격리 전략

**회사별 데이터 조회 조건**:
```sql
-- 사용자 로그인 시 회사 번호 확인
SELECT 2012DaeriCompanyNum FROM 2012Costomer WHERE mem_id = ? AND passwd = MD5(?)

-- 회사별 증권 조회
SELECT * FROM 2012CertiTable 
WHERE 2012DaeriCompanyNum = ? 
AND startyDay >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)

-- 회사별 기사 조회
SELECT * FROM 2012DaeriMember 
WHERE 2012DaeriCompanyNum = ?

-- 회사별 증권별 기사 조회
SELECT * FROM 2012DaeriMember 
WHERE 2012DaeriCompanyNum = ? 
AND CertiTableNum = ?
```

#### 11.4 주요 비즈니스 로직

**11.4.1 증권 유효성 검증**
- `2012CertiTable.startyDay`가 현재일로부터 1년 이내인 증권만 유효
- 유효한 증권만 조회 및 선택 가능

**11.4.2 기사 상태 관리**
- `push = 1`: 청약 (가입 신청)
- `push = 4`: 정상 (가입 완료)
- `cancel`: 해지 여부

**11.4.3 결제방식 구분**
- `2012CertiTable.divi = '1'`: 정상납
- `2012CertiTable.divi = '2'`: 월납
- 월납인 경우 `kj_premium_data` 테이블 사용

**11.4.4 보험료 조회**
- 정상납: `2012CertiTable.premium1~10` 사용
- 월납: `kj_premium_data` 테이블 사용
- 보험회사 보험료: `kj_insurance_premium_data` 테이블 사용

#### 11.5 상수값 참조

**참조 파일**: `disk-cms-react/src/pages/insurance/constants.ts`

**11.5.1 보험회사 코드 (`INSURER_MAP`)**
```typescript
1: '흥국'
2: 'DB'
3: 'KB'
4: '현대'
5: '롯데'
6: '하나'
7: '한화'
8: '삼성'
9: '메리츠'
```
- 테이블 필드: `2012CertiTable.InsuraneCompany`, `2012DaeriMember.InsuranceCompany`

**11.5.2 증권성격 코드 (`GITA_MAP`)**
```typescript
1: '일반'
2: '탁송'
3: '일반/렌트'
4: '탁송/렌트'
5: '확대탁송'
```
- 테이블 필드: `2012CertiTable.gita`, `2012DaeriMember.etag`

**11.5.3 결제방식 코드 (`DIVI_OPTIONS`)**
```typescript
1: '정상납'
2: '월납'
```
- 테이블 필드: `2012CertiTable.divi`

**11.5.4 배서 상태 코드 (`PUSH_MAP`)**
```typescript
'1': '청약'
'2': '해지'
'3': '청약거절'
'4': '정상'
'5': '해지취소'
'6': '청약취소'
```
- 테이블 필드: `2012DaeriMember.push`
- 주요 상태: `push = 1` (청약), `push = 4` (정상)

**11.5.5 진행단계 코드 (`PROGRESS_MAP`)**
```typescript
'1': '프린트'
'2': '스캔'
'3': '고객등록'
'4': '심사중'
'5': '입금대기'
'6': '카드승인'
'7': '수납중'
'8': '확정중'
```
- 테이블 필드: `2012DaeriMember.progress`

**11.5.6 요율 코드 (`RATE_OPTIONS`, `RATE_MAP`, `RATE_NAME_MAP`)**
```typescript
1: 1.000 (기본)
2: 0.900 (할인)
3: 0.925 (3년간 사고건수 0건 1년간 사고건수 0건 무사고 1년 이상)
4: 0.898 (3년간 사고건수 0건 1년간 사고건수 0건 무사고 2년 이상)
5: 0.889 (3년간 사고건수 0건 1년간 사고건수 0건 무사고 3년 이상)
6: 1.074 (3년간 사고건수 1건 1년간 사고건수 0건)
7: 1.085 (3년간 사고건수 1건 1년간 사고건수 1)
8: 1.242 (3년간 사고건수 2건 1년간 사고건수 0)
9: 1.253 (3년간 사고건수 2건 1년간 사고건수 1)
10: 1.314 (3년간 사고건수 2건 1년간 사고건수 2)
11: 1.428 (3년간 사고건수 3건이상 1년간 사고건수 0)
12: 1.435 (3년간 사고건수 3건이상 1년간 사고건수 1)
13: 1.447 (3년간 사고건수 3건이상 1년간 사고건수 2)
14: 1.459 (3년간 사고건수 3건이상 1년간 사고건수 3건이상)
```
- 테이블 필드: `2012DaeriMember.rate`, `2019rate.rate`

**11.5.7 사고 코드 (`mapSagoLabel`)**
```typescript
1: '사고없음'
2: '사고있음'
```
- 테이블 필드: `2012DaeriMember.sago`

**11.5.8 유틸리티 함수**
- `getInsurerName(code)`: 보험회사 코드 → 이름
- `getGitaName(code)`: 증권성격 코드 → 이름
- `getRateValue(code)`: 요율 코드 → 요율 값
- `getRateName(code)`: 요율 코드 → 요율 설명
- `mapPushLabel(push)`: 배서 상태 코드 → 라벨
- `mapSagoLabel(sago)`: 사고 코드 → 라벨

**참고**: 모든 상수값과 매핑 함수는 `disk-cms-react/src/pages/insurance/constants.ts` 파일을 참조하여 사용

---

### 12. API 설계 (제안)

#### 12.1 인증 API
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

#### 12.2 기사 관리 API
- `GET /api/driver/list` - 기사 목록 조회 (증권별, 회사별 필터링)
- `POST /api/driver/register` - 기사 청약 (가입)
- `POST /api/driver/cancel` - 기사 해지
- `GET /api/driver/:id` - 기사 상세 정보

#### 12.3 증권 관리 API
- `GET /api/policy/list` - 증권 목록 조회 (회사별)
- `GET /api/policy/:id` - 증권 상세 정보
- `GET /api/policy/:id/drivers` - 증권별 기사 목록

#### 12.4 배서 리스트 API
- `GET /api/endorse/list` - 배서 리스트 조회 (회사별 필터링)
- `GET /api/endorse/:id` - 배서 상세 정보

#### 12.5 보험료 조회 API
- `GET /api/premium/driver/:id` - 기사별 보험료
- `GET /api/premium/policy/:id` - 증권별 보험료
- `GET /api/premium/company` - 회사별 보험료 합계

#### 12.6 통계 API
- `GET /api/statistics/daily` - 일일 통계
- `GET /api/statistics/monthly` - 월별 통계

#### 12.7 알림 API
- `GET /api/notifications` - 알림 목록
- `POST /api/notifications/:id/read` - 알림 읽음 처리

---

### 13. 개발 일정 (예상)

#### Phase 1: 핵심 기능 개발 (2-3주)
- 인증 시스템
- 증권별 기사 현황
- 배서 리스트
- 청약/해지 기능

#### Phase 2: 보완 기능 개발 (1-2주)
- 보험료 조회
- 정산 관리
- 통계/리포트
- 알림/공지사항

#### Phase 3: 테스트 및 최적화 (1주)
- 통합 테스트
- 성능 최적화
- 버그 수정
- 사용자 테스트

**총 예상 기간**: 4-6주

---

### 14. 추가 확인 사항 및 구현 가이드

#### 14.1 에러 처리 및 로깅

**에러 처리 전략**:
- **API 응답 형식 표준화**:
  ```php
  // 성공 응답
  {
    "success": true,
    "data": {...},
    "message": "처리 완료"
  }
  
  // 실패 응답
  {
    "success": false,
    "error": "에러 메시지",
    "code": "ERROR_CODE"
  }
  ```
- **HTTP 상태 코드 사용**:
  - `200`: 성공
  - `400`: 잘못된 요청 (입력 검증 실패)
  - `401`: 인증 실패 (로그인 필요)
  - `403`: 권한 없음
  - `404`: 리소스 없음
  - `500`: 서버 오류
- **로깅 전략**:
- **로그 파일 저장 위치**: `pci0327/daeri/logs/` 디렉토리
- **로그 파일 형식**: `{기능명}-{날짜}.log` (예: `login-2026-01-14.log`)
- PHP `error_log()` 함수 및 파일 직접 쓰기 사용
- 중요한 작업(청약, 해지)은 상세 로그 기록
- 데이터베이스 오류는 로그에 기록하되 사용자에게는 일반적인 메시지 표시
- **카페24 호스팅 로그**: 카페24 호스팅의 모든 로그 파일 위치도 함께 확인
- **에러 발생 시**: 관리자에게 메일로 안내 + 로그 파일에 기록
- **사용자 친화적 에러 메시지**:
  - 기술적 오류는 로그에만 기록
  - 사용자에게는 이해하기 쉬운 메시지 표시

#### 14.2 입력 검증 상세 규칙

**필수 검증 항목**:
- **기사 청약 시**:
  - 성명: 필수, 한글 2-20자
  - 주민번호: 필수, 형식 검증 (6자리-7자리 또는 13자리)
  - 핸드폰 번호: 필수, 형식 검증 (010-XXXX-XXXX)
  - 증권 선택: 필수, 유효한 증권 번호
  - 나이: 필수, 숫자, 18-100 범위
- **기사 해지 시**:
  - 기사 선택: 필수
  - 해지 사유: 입력하지 않음 (요구사항)
- **로그인 시**:
  - 아이디: 필수, 4-15자
  - 비밀번호: 필수, 4-20자

**검증 함수 예시**:
```php
function validatePhone($phone) {
    // 010-1234-5678 형식 또는 01012345678 형식
    return preg_match('/^010-?\d{4}-?\d{4}$/', $phone);
}

function validateJumin($jumin) {
    // 6자리-7자리 또는 13자리
    return preg_match('/^\d{6}-?\d{7}$/', $jumin) || 
           preg_match('/^\d{13}$/', $jumin);
}
```

#### 14.3 API 응답 형식 표준화

**공통 응답 헤더**:
```php
header('Content-Type: application/json; charset=utf-8');
```

**성공 응답 예시**:
```php
echo json_encode([
    'success' => true,
    'data' => $result,
    'message' => '처리 완료'
], JSON_UNESCAPED_UNICODE);
```

**실패 응답 예시**:
```php
http_response_code(400);
echo json_encode([
    'success' => false,
    'error' => '입력값이 올바르지 않습니다.',
    'code' => 'VALIDATION_ERROR'
], JSON_UNESCAPED_UNICODE);
```

#### 14.4 프론트엔드 UI/UX 개선 사항

**로딩 상태 표시**:
- API 호출 중 로딩 스피너 표시
- 버튼 비활성화 (중복 클릭 방지)
- 테이블 데이터 로딩 중 스켈레톤 UI 또는 로딩 메시지

**에러 메시지 표시**:
- 토스트 메시지 또는 알림창으로 표시
- 필드별 에러 메시지 (폼 검증 실패 시)
- 네트워크 오류 시 재시도 버튼 제공

**성공 메시지 표시**:
- 작업 완료 시 성공 메시지 표시
- 일정 시간 후 자동으로 사라지거나 사용자가 닫기

#### 14.5 브라우저 호환성

**지원 브라우저**:
- **모바일**:
  - iOS Safari 12+
  - Android Chrome (최신 2개 버전)
  - Samsung Internet (최신 2개 버전)
- **데스크톱**:
  - Chrome (최신 2개 버전)
  - Firefox (최신 2개 버전)
  - Safari (최신 2개 버전)
  - Edge (최신 2개 버전)

**호환성 확인 사항**:
- ES6+ JavaScript 문법 사용 시 Babel 변환 고려 (필요 시)
- CSS Grid/Flexbox 사용 (IE 미지원이지만 모바일 우선이므로 문제없음)
- Fetch API 사용 (구형 브라우저는 polyfill 필요할 수 있음)

#### 14.6 성능 최적화 전략

**프론트엔드**:
- 이미지 최적화 (WebP 형식 사용, 적절한 크기)
- CSS/JavaScript 파일 압축 (배포 시)
- 불필요한 리소스 로딩 방지
- API 호출 최소화 (필요한 데이터만 요청)

**백엔드**:
- 데이터베이스 쿼리 최적화 (인덱스 활용)
- 불필요한 데이터 조회 방지 (SELECT 필요한 컬럼만)
- 페이지네이션 구현 (대량 데이터 조회 시)
- 캐싱 전략 (자주 조회되는 데이터)

#### 14.7 세션 관리 상세

**세션 설정**:
```php
// 세션 시작
session_start();

// 세션 고정 공격 방지
session_regenerate_id(true);

// 세션 타임아웃 설정 (30분)
ini_set('session.gc_maxlifetime', 1800);

// 세션 쿠키 설정
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1); // HTTPS 환경에서만
```

**세션 타임아웃**: 30분 미사용 시 자동 로그아웃

**세션 데이터 구조**:
```php
$_SESSION['user_num'] = $user['num'];
$_SESSION['user_id'] = $user['mem_id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['company_num'] = $user['2012DaeriCompanyNum'];
$_SESSION['login_time'] = time();
$_SESSION['last_activity'] = time();
```

**세션 타임아웃 체크**:
```php
// 각 API 파일에서 세션 확인 시
if (isset($_SESSION['last_activity']) && 
    (time() - $_SESSION['last_activity'] > 1800)) {
    // 30분 초과 시 세션 만료
    session_destroy();
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => '세션이 만료되었습니다.']);
    exit;
}
$_SESSION['last_activity'] = time();
```

#### 14.8 CSRF 보호 (선택 사항)

**CSRF 보호 복잡도**:
- CSRF 보호를 구현하려면 세션 기반 토큰 생성/검증 로직이 필요
- 프론트엔드에서 모든 POST 요청에 토큰 포함 필요
- 구현 복잡도: 중간 (세션 관리 + 토큰 검증 로직)
- **결정**: 초기 개발에서는 선택 사항으로 두고, 필요 시 나중에 추가

**CSRF 보호 구현 방법** (필요 시):
```php
// 토큰 생성
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// 토큰 검증
if ($_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => '잘못된 요청입니다.']);
    exit;
}
```

**프론트엔드에서 토큰 전송**:
```javascript
// 폼 제출 시 CSRF 토큰 포함
fetch('/api/daeri/driver/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        ...formData,
        csrf_token: sessionStorage.getItem('csrf_token')
    })
});
```

**권장 사항**:
- Phase 1 (핵심 기능)에서는 CSRF 보호 생략 가능
- Phase 2 또는 보안 강화 시점에 추가 구현 고려
- 세션 기반 인증만으로도 어느 정도 보호 가능 (SameSite 쿠키 속성 활용)

#### 14.9 비밀번호 정책

**현재 정책** (기존 시스템과 동일):
- MD5 해시 사용
- 최소 길이: 4자 (데이터베이스 제약사항 확인 필요)
- 최대 길이: 제한 없음 (일반적으로 20자 이내)

**향후 개선 계획**:
- 비밀번호 변경 기능 개발 예정 (나중에 구현)
- 비밀번호 복잡도 요구사항 (대소문자, 숫자, 특수문자)
- 비밀번호 변경 주기
- 비밀번호 재설정 기능

#### 14.10 로깅 전략

**로깅 대상**:
- 로그인 시도 (성공/실패)
- 기사 청약/해지 작업
- 중요 데이터 수정
- 에러 발생 시

**로깅 형식**:
```php
// 로그 디렉토리 확인 및 생성
$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

// 로그 파일 경로 (날짜별)
$logFile = $logDir . '/' . $action . '-' . date('Y-m-d') . '.log';

// 로그 기록
error_log(sprintf(
    "[%s] [%s] %s: %s\n",
    date('Y-m-d H:i:s'),
    $_SERVER['REMOTE_ADDR'],
    $action,
    $message
), 3, $logFile);
```

**로그 파일 저장 위치**:
- **애플리케이션 로그**: `pci0327/daeri/logs/` 디렉토리
- **카페24 호스팅 로그**: 카페24 호스팅의 모든 로그 파일 위치도 함께 확인

**에러 발생 시 처리**:
- **관리자 메일 안내**: PHP `mail()` 함수 또는 SMTP를 사용하여 관리자에게 에러 메일 발송
- **로그 파일 기록**: `pci0327/daeri/logs/error-{날짜}.log`에 상세 기록
- **사용자 메시지**: 사용자에게는 일반적인 에러 메시지 표시 (기술적 세부사항 숨김)

**에러 메일 발송 예시**:
```php
function sendErrorEmail($errorMessage, $errorDetails = []) {
    $adminEmail = 'admin@example.com'; // 관리자 이메일 주소
    $subject = '[대리운전회사 시스템] 에러 발생 알림';
    $message = "에러 발생 시간: " . date('Y-m-d H:i:s') . "\n";
    $message .= "에러 메시지: " . $errorMessage . "\n";
    $message .= "IP 주소: " . ($_SERVER['REMOTE_ADDR'] ?? '알 수 없음') . "\n";
    if (!empty($errorDetails)) {
        $message .= "상세 정보:\n" . print_r($errorDetails, true);
    }
    
    $headers = "From: system@example.com\r\n";
    $headers .= "Content-Type: text/plain; charset=utf-8\r\n";
    
    mail($adminEmail, $subject, $message, $headers);
}
```

**로그 파일 관리**:
- 로그 파일 크기 제한
- 오래된 로그 파일 자동 삭제 또는 아카이브
- 민감한 정보(비밀번호, 주민번호)는 로그에 기록하지 않음

---

### 15. 다음 단계

1. ✅ 요구사항 정리 완료
2. ✅ 데이터베이스 스키마 확정 (스키마 정보 및 상수값 참조 추가 완료)
3. ✅ 추가 확인 사항 정리 완료
4. [ ] 상세 화면 설계
5. [ ] API 명세서 작성 (PHP 8.2 기반)
6. [ ] 프로젝트 구조 설계
7. [ ] 개발 시작

---

## 📋 다음 단계 상세 계획

### Phase 1: 설계 단계 (예상 1주)

#### 1. 상세 화면 설계
**우선순위 화면 (Phase 1 핵심 기능)**:
- [ ] 로그인 화면
- [ ] 대시보드 (현황 요약)
- [ ] 증권별 기사 현황 화면
- [ ] 배서 리스트 화면
- [ ] 기사 청약 화면
- [ ] 기사 해지 화면

**각 화면별 설계 항목**:
- 화면 레이아웃 (모바일 우선)
- 필터/검색 영역
- 데이터 테이블/카드 구성
- 모달/팝업 구성
- 버튼 및 액션 영역
- 반응형 디자인 (모바일/데스크톱)

#### 2. API 명세서 작성
**필수 API (Phase 1)**:
- [ ] 인증 API
  - `POST /api/auth/login` - 로그인 (mem_id, passwd MD5)
  - `POST /api/auth/logout` - 로그아웃
  - `GET /api/auth/me` - 현재 사용자 정보
- [ ] 증권 API
  - `GET /api/policy/list` - 증권 목록 (회사별, 유효한 증권만)
  - `GET /api/policy/:id` - 증권 상세 정보
  - `GET /api/policy/:id/drivers` - 증권별 기사 목록
- [ ] 기사 API
  - `GET /api/driver/list` - 기사 목록 (증권별, 회사별 필터링)
  - `POST /api/driver/register` - 기사 청약 (가입)
  - `POST /api/driver/cancel` - 기사 해지
  - `GET /api/driver/:id` - 기사 상세 정보
- [ ] 배서 API
  - `GET /api/endorse/list` - 배서 리스트 (회사별 필터링)
  - `GET /api/endorse/:id` - 배서 상세 정보

**API 명세서 형식**:
- 엔드포인트 URL
- HTTP 메서드
- 요청 파라미터 (Query, Body)
- 응답 데이터 구조
- 에러 처리
- 인증 요구사항

#### 3. 프로젝트 구조 설계

**개발 위치**: `pci0327/daeri/` (pci0327 폴더 아래)

**전체 프로젝트 구조**:
```
pci0327/
├── api/
│   ├── insurance/                 # PHP 백엔드 API (보험대리점용)
│   │   └── ...                    # disk-cms-react의 Node.js 서버가 프록시로 사용
│   │                              # React → Node.js → PHP API → DB
│   └── daeri/                     # 신규: 대리운전회사용 API
│       └── ...
└── daeri/                         # 신규: 대리운전회사용 시스템
                                    # HTML/JS → PHP API → DB (직접 호출)
```
    ├── index.html                 # 메인 페이지 (리다이렉트 또는 대시보드)
    ├── login.html                 # 로그인 페이지
    ├── dashboard.html             # 대시보드 (현황 요약)
    ├── policy-drivers.html        # 증권별 기사 현황
    ├── endorse-list.html          # 배서 리스트
    ├── driver-register.html       # 기사 청약
    ├── driver-cancel.html         # 기사 해지
    ├── css/
    │   ├── common.css             # 공통 스타일
    │   ├── login.css             # 로그인 스타일
    │   ├── dashboard.css         # 대시보드 스타일
    │   └── responsive.css        # 반응형 스타일
    ├── js/
    │   ├── common.js             # 공통 함수
    │   ├── api.js                # API 호출 함수
    │   ├── constants.js          # 상수값 (disk-cms-react/src/pages/insurance/constants.ts 참조)
    │   ├── login.js              # 로그인 로직
    │   ├── dashboard.js          # 대시보드 로직
    │   ├── policy-drivers.js     # 증권별 기사 현황 로직
    │   ├── endorse-list.js       # 배서 리스트 로직
    │   ├── driver-register.js    # 기사 청약 로직
    │   └── driver-cancel.js       # 기사 해지 로직
    ├── config/
    │   └── config.php            # 설정 파일 (DB 연결 정보 등)
    ├── includes/
    │   ├── header.php            # 공통 헤더
    │   ├── footer.php            # 공통 푸터
    │   └── functions.php         # 공통 함수
    └── components/                # 재사용 가능한 HTML 컴포넌트 (선택)
        ├── header.html
        ├── footer.html
        └── modal.html
```

**백엔드 API 구조 (PHP)**:
```
pci0327/
└── api/
    └── daeri/                     # 신규: 대리운전회사용 API
        ├── auth/
        │   ├── login.php         # 로그인 처리
        │   ├── logout.php        # 로그아웃 처리
        │   └── check-session.php # 세션 확인
        ├── policy/
        │   ├── list.php          # 증권 목록 조회
        │   ├── detail.php        # 증권 상세 정보
        │   └── drivers.php       # 증권별 기사 목록
        ├── driver/
        │   ├── list.php          # 기사 목록 조회
        │   ├── register.php      # 기사 청약 처리
        │   ├── cancel.php        # 기사 해지 처리
        │   └── detail.php        # 기사 상세 정보
        ├── endorse/
        │   ├── list.php          # 배서 리스트 조회
        │   └── detail.php        # 배서 상세 정보
        └── common/
            └── session.php        # 세션 관리
```

**기존 API 참고**:
- `pci0327/api/insurance/` - 기존 보험 API 참고 가능
- 동일한 데이터베이스 사용
- 유사한 구조 및 로직 재사용 가능

**데이터베이스 연결 설정**:
- 설정 파일: `/api/config/db_config.php` (기존 파일 사용)
- 연결 함수: `getDbConnection()` - PDO 객체 반환
- 사용 방법: 각 API 파일에서 `require_once '/api/config/db_config.php'` 후 `getDbConnection()` 호출

**데이터베이스 연결 함수 구조**:
```php
/**
 * PDO 데이터베이스 연결 객체를 반환하는 함수
 * 
 * @return PDO 데이터베이스 연결 객체
 * @throws PDOException 연결 실패 시 예외 발생
 */
function getDbConnection() {
    global $db_config;
    
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['name']};charset={$db_config['charset']}";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ];
    
    return new PDO($dsn, $db_config['user'], $db_config['pass'], $options);
}
```

**API 파일에서 사용 예시**:
```php
<?php
// 데이터베이스 연결 설정 로드
require_once __DIR__ . '/../../config/db_config.php';

try {
    $pdo = getDbConnection();
    
    // 쿼리 실행 예시
    $stmt = $pdo->prepare("SELECT * FROM 2012DaeriMember WHERE 2012DaeriCompanyNum = ?");
    $stmt->execute([$companyNum]);
    $results = $stmt->fetchAll();
    
    // JSON 응답
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'data' => $results]);
    
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Database error']);
    error_log('Database Error: ' . $e->getMessage());
}
?>
```

**주의사항**:
- 모든 API 파일은 `getDbConnection()` 함수를 사용하여 데이터베이스 연결
- PDO 예외 처리는 `PDO::ERRMODE_EXCEPTION`으로 설정되어 있으므로 try-catch 필수
- `PDO::ATTR_EMULATE_PREPARES => false`로 설정되어 있어 실제 prepared statement 사용
- `PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC`로 연관 배열 형태로 결과 반환

**폴더 구조 요약**:
- 프론트엔드: `pci0327/daeri/`
- 백엔드 API: `pci0327/api/daeri/`

### Phase 2: 개발 단계 (예상 4-6주)

#### 1. 개발 환경 설정
- [ ] PHP 8.2 로컬 개발 환경 설정 (XAMPP, WAMP, 또는 PHP 내장 서버)
- [ ] MariaDB 로컬 설치 또는 원격 DB 연결 설정
- [ ] 프로젝트 폴더 구조 생성
- [ ] 공통 CSS/JavaScript 파일 준비
- [ ] 데이터베이스 연결 설정 확인 (`/api/config/db_config.php` 사용)
- [ ] 세션 관리 설정
- [ ] FTP/SFTP 클라이언트 설정 (카페24 배포용)

#### 2. Phase 1 핵심 기능 개발
**우선순위 순서**:
1. 로그인/인증 시스템
2. 증권별 기사 현황 조회
3. 배서 리스트 조회
4. 기사 청약 (가입)
5. 기사 해지

#### 3. Phase 2 보완 기능 개발
- 보험료 조회
- 정산 관리
- 통계/리포트
- 알림/공지사항

#### 4. 테스트 및 최적화
- 통합 테스트
- 모바일 웹 최적화
- 성능 최적화
- 버그 수정

---

**작성일**: 2026년 1월 14일  
**상태**: 상세 기획서 작성 완료, 다음 단계 준비 완료  
**다음 작업**: 상세 화면 설계 또는 API 명세서 작성 시작

---

## 🎨 디자인 방향 및 가이드

### 디자인 철학

#### 1. 모바일 우선 (Mobile First)
- **주 사용 환경**: 모바일 웹 (스마트폰)
- **보조 환경**: 데스크톱 웹
- **접근 방식**: 모바일 레이아웃을 먼저 설계 후 데스크톱 확장

#### 2. 간결하고 직관적인 UI
- **원칙**: 필요한 기능만 표시, 복잡도 최소화
- **사용 빈도 높은 기능**: 청약, 해지, 증권별 기사 현황
- **빠른 접근**: 주요 기능을 1-2번 클릭으로 접근 가능

#### 3. 기존 시스템과의 일관성
- **참고**: `disk-cms-react` 보험대리점 시스템의 디자인 스타일
- **차이점**: React/Tailwind CSS → 순수 HTML/CSS/JavaScript로 변환
- **유지**: 색상, 레이아웃, 사용자 경험 패턴

---

### 디자인 시스템

#### 1. 색상 팔레트

**주요 색상**:
- **Primary (주 색상)**: `#667eea` → `#764ba2` (그라데이션)
  - 버튼, 링크, 강조 요소
  - 모달 헤더 배경
  
- **Secondary (보조 색상)**: `#6f42c1` (보라색)
  - 테이블 헤더 배경
  - 특수 요소 강조

- **Success (성공)**: `#10b981` (초록색)
  - 정상 상태 표시
  - 성공 메시지

- **Danger (위험)**: `#ef4444` (빨간색)
  - 해지 상태 표시
  - 에러 메시지
  - 삭제/취소 버튼

- **Neutral (중립)**: 
  - 배경: `#ffffff` (흰색)
  - 테두리: `#e5e7eb` (회색)
  - 텍스트: `#1f2937` (진한 회색)

**참고**: 기존 보험대리점 시스템의 Tailwind CSS 색상 체계를 순수 CSS로 변환

#### 2. 타이포그래피

**폰트 크기**:
- **제목 (H1)**: `1.5rem` (24px)
- **제목 (H2)**: `1.25rem` (20px)
- **제목 (H3)**: `1.125rem` (18px)
- **본문**: `0.875rem` (14px) - 기본
- **작은 텍스트**: `0.75rem` (12px) - 테이블, 라벨
- **매우 작은 텍스트**: `0.625rem` (10px) - 보조 정보

**폰트 패밀리**:
- 시스템 기본 폰트 사용 (san-serif)
- 모바일 최적화 폰트 크기

#### 3. 간격 시스템

**패딩/마진**:
- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)

**컨테이너**:
- 모바일: `padding: 1rem` (16px)
- 데스크톱: `padding: 1.5rem` (24px)
- 최대 너비: `1200px` (데스크톱)

#### 4. 버튼 스타일

**Primary 버튼**:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
padding: 0.5rem 1rem;
border-radius: 0.375rem;
font-size: 0.875rem;
```

**Secondary 버튼**:
```css
background: white;
color: #667eea;
border: 1px solid #667eea;
padding: 0.5rem 1rem;
border-radius: 0.375rem;
```

**크기**:
- **Small**: `0.5rem 0.75rem` (8px 12px)
- **Default**: `0.5rem 1rem` (8px 16px)
- **Large**: `0.75rem 1.5rem` (12px 24px)

#### 5. 입력 필드 스타일

**기본 입력 필드**:
```css
width: 100%;
padding: 0.5rem 0.75rem;
border: 1px solid #e5e7eb;
border-radius: 0.375rem;
font-size: 0.875rem;
```

**Select 박스**:
```css
height: 2.5rem; /* 40px */
padding: 0.5rem 0.75rem;
border: 1px solid #e5e7eb;
border-radius: 0.375rem;
```

#### 6. 테이블 스타일

**기본 테이블**:
```css
width: 100%;
border-collapse: collapse;
font-size: 0.75rem; /* 12px */
```

**테이블 헤더**:
```css
background-color: #6f42c1;
color: white;
padding: 0.5rem;
text-align: center;
font-weight: 600;
```

**테이블 셀**:
```css
border: 1px solid #e5e7eb;
padding: 0.5rem;
text-align: center;
```

**반응형**:
- 모바일: 카드 형식으로 변환
- 데스크톱: 테이블 형식 유지

#### 7. 모달 스타일

**모달 오버레이**:
```css
position: fixed;
inset: 0;
background: rgba(0, 0, 0, 0.5);
z-index: 50;
```

**모달 컨테이너**:
```css
background: white;
border-radius: 0.75rem;
max-width: 90%; /* 모바일 */
max-width: 600px; /* 데스크톱 */
max-height: 90vh;
overflow-y: auto;
```

**모달 헤더**:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
padding: 1rem 1.5rem;
border-radius: 0.75rem 0.75rem 0 0;
```

#### 8. 카드 스타일 (모바일)

**기본 카드**:
```css
background: white;
border: 1px solid #e5e7eb;
border-radius: 0.5rem;
padding: 1rem;
margin-bottom: 1rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

---

### 레이아웃 구조

#### 1. 전체 레이아웃

**모바일**:
```
┌─────────────────────┐
│   헤더 (고정)        │
│   (로그인 정보)      │
├─────────────────────┤
│                     │
│   메인 콘텐츠        │
│   (스크롤 가능)      │
│                     │
└─────────────────────┘
```

**데스크톱**:
```
┌─────────────────────────────┐
│   헤더 (고정)                │
├─────────────────────────────┤
│   필터 영역                  │
├─────────────────────────────┤
│                             │
│   메인 콘텐츠                │
│   (테이블/카드)              │
│                             │
├─────────────────────────────┤
│   페이지네이션               │
└─────────────────────────────┘
```

#### 2. 주요 화면 레이아웃

**로그인 화면**:
- 중앙 정렬
- 간단한 폼 (아이디, 비밀번호)
- 로그인 버튼
- 모바일: 전체 화면
- 데스크톱: 중앙 카드 형식

**대시보드**:
- 현황 요약 카드 (3-4개)
- 최근 활동 목록
- 빠른 액션 버튼

**증권별 기사 현황**:
- 증권 선택 (Select)
- 기사 목록 (테이블/카드)
- 청약/해지 버튼

**배서 리스트**:
- 필터 영역 (상태, 증권, 회사)
- 배서 목록 (테이블/카드)
- 페이지네이션

**기사 청약/해지**:
- 증권 선택
- 기사 정보 입력
- 확인 버튼

---

### 반응형 디자인 전략

#### 1. 브레이크포인트

```css
/* 모바일 (기본) */
@media (max-width: 767px) { }

/* 태블릿 */
@media (min-width: 768px) and (max-width: 1023px) { }

/* 데스크톱 */
@media (min-width: 1024px) { }
```

#### 2. 모바일 최적화

**테이블 → 카드 변환**:
- 모바일에서는 테이블을 카드 형식으로 표시
- 각 행을 개별 카드로 렌더링
- 중요한 정보만 표시

**터치 친화적**:
- 버튼 최소 크기: `44px × 44px`
- 충분한 간격: `8px` 이상
- 스와이프 제스처 지원 (선택)

#### 3. 데스크톱 최적화

**넓은 화면 활용**:
- 테이블 전체 표시
- 필터와 콘텐츠 나란히 배치
- 모달 크기 확대

---

### UI 컴포넌트

#### 1. 공통 컴포넌트 (순수 HTML/CSS/JS)

**버튼**:
- Primary, Secondary, Danger 버튼
- 로딩 상태 표시
- 비활성화 상태

**입력 필드**:
- 텍스트 입력
- Select 박스
- 날짜 선택 (HTML5 date input)

**모달**:
- 기본 모달 구조
- 헤더, 본문, 푸터
- 닫기 버튼

**테이블**:
- 기본 테이블
- 정렬 가능 (선택)
- 페이지네이션

**카드** (모바일):
- 정보 카드
- 액션 카드

**알림**:
- Toast 메시지 (간단한 알림)
- Alert 다이얼로그 (확인 필요)

#### 2. 재사용 가능한 CSS 클래스

```css
/* 버튼 */
.btn-primary { }
.btn-secondary { }
.btn-danger { }

/* 입력 */
.input-field { }
.select-field { }

/* 카드 */
.card { }
.card-header { }
.card-body { }

/* 모달 */
.modal-overlay { }
.modal-container { }
.modal-header { }
.modal-body { }
.modal-footer { }

/* 테이블 */
.table { }
.table-header { }
.table-row { }
.table-cell { }

/* 유틸리티 */
.text-center { }
.text-right { }
.mt-1 { margin-top: 0.25rem; }
.mb-1 { margin-bottom: 0.25rem; }
```

---

### 디자인 참고 자료

#### 1. 기존 시스템 참고
- `disk-cms-react/src/pages/insurance/` - React 컴포넌트 스타일
- `pci0327/05/js/kj_endorseList.js` - 기존 JavaScript 구조
- Tailwind CSS 클래스를 순수 CSS로 변환

#### 2. 디자인 원칙
- **일관성**: 모든 페이지에서 동일한 스타일 유지
- **접근성**: 명확한 색상 대비, 충분한 터치 영역
- **성능**: 최소한의 CSS, 빠른 로딩
- **유지보수성**: 재사용 가능한 CSS 클래스

---

### 디자인 작업 순서

1. **공통 CSS 파일 작성** (`css/common.css`)
   - 색상 변수
   - 타이포그래피
   - 버튼, 입력 필드 스타일
   - 유틸리티 클래스

2. **레이아웃 컴포넌트**
   - 헤더/푸터
   - 모달 구조
   - 카드 구조

3. **페이지별 CSS**
   - 각 페이지의 고유 스타일
   - 반응형 미디어 쿼리

4. **JavaScript UI 로직**
   - 모달 열기/닫기
   - 테이블/카드 전환
   - 폼 검증

---

**디자인 방향 요약**:
- 모바일 우선, 간결하고 직관적인 UI
- 기존 보험대리점 시스템 스타일 참고
- 순수 HTML/CSS/JavaScript로 구현
- 반응형 디자인 (모바일/데스크톱)
- 재사용 가능한 CSS 클래스 구조

---

## 📱 PWA (Progressive Web App) 기능 - 바탕화면 바로가기

### 목적
핸드폰 바탕화면에 앱처럼 바로가기를 추가하여 빠른 접근 가능

### 구현 방법

#### 1. Web App Manifest 파일 (`manifest.json`)

**파일 위치**: `pci0327/daeri/manifest.json`

**기본 구조**:
```json
{
  "name": "대리운전회사 관리 시스템",
  "short_name": "대리운전관리",
  "description": "대리운전회사용 기사 관리 시스템",
  "start_url": "/daeri/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/daeri/images/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/daeri/images/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/daeri/images/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/daeri/images/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/daeri/images/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/daeri/images/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/daeri/images/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/daeri/images/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**주요 속성 설명**:
- `name`: 앱 전체 이름 (바로가기 설치 시 표시)
- `short_name`: 짧은 이름 (바로가기 아이콘 아래 표시)
- `start_url`: 앱 시작 URL
- `display`: `standalone` (브라우저 UI 없이 앱처럼 표시)
- `theme_color`: 상태바 색상
- `icons`: 다양한 크기의 아이콘 이미지

#### 2. HTML에 Manifest 링크 추가

**모든 HTML 파일의 `<head>` 섹션에 추가**:
```html
<link rel="manifest" href="/daeri/manifest.json">
<meta name="theme-color" content="#667eea">
```

#### 3. iOS용 Meta 태그 추가

**iPhone/iPad 지원을 위한 추가 태그**:
```html
<!-- iOS Safari -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="대리운전관리">
<link rel="apple-touch-icon" href="/daeri/images/icon-180x180.png">
<link rel="apple-touch-icon" sizes="180x180" href="/daeri/images/icon-180x180.png">
```

#### 4. 아이콘 이미지 준비

**필요한 아이콘 크기**:
- `icon-72x72.png` (72×72px)
- `icon-96x96.png` (96×96px)
- `icon-128x128.png` (128×128px)
- `icon-144x144.png` (144×144px)
- `icon-152x152.png` (152×152px) - Android
- `icon-180x180.png` (180×180px) - iOS
- `icon-192x192.png` (192×192px) - Android
- `icon-384x384.png` (384×384px) - Android
- `icon-512x512.png` (512×512px) - Android

**아이콘 디자인 요구사항**:
- 배경색: 투명 또는 단색
- 로고/아이콘: 중앙 배치
- 모서리: 둥근 모서리 (maskable)
- 파일 형식: PNG (투명 배경 가능)

**아이콘 생성 방법**:
- 온라인 도구: PWA Asset Generator
- 디자인 도구: Figma, Photoshop 등
- 기본 아이콘: 간단한 로고 또는 텍스트

#### 5. Service Worker (선택적)

**오프라인 기능을 원할 경우**:
- `pci0327/daeri/sw.js` 파일 생성
- 기본 캐싱 전략 구현
- 오프라인 페이지 제공 (선택)

**기본 Service Worker 구조**:
```javascript
// sw.js
const CACHE_NAME = 'daeri-app-v1';
const urlsToCache = [
  '/daeri/',
  '/daeri/css/common.css',
  '/daeri/js/common.js',
  '/daeri/images/icon-192x192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

**HTML에 Service Worker 등록**:
```javascript
// common.js 또는 각 페이지의 <script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/daeri/sw.js')
      .then((registration) => {
        console.log('Service Worker 등록 성공:', registration);
      })
      .catch((error) => {
        console.log('Service Worker 등록 실패:', error);
      });
  });
}
```

#### 6. 사용자 안내

**바로가기 추가 방법 안내**:
- **Android Chrome**: 
  1. 메뉴 (⋮) → "홈 화면에 추가"
  2. 또는 주소창의 "설치" 배너 클릭
  
- **iOS Safari**:
  1. 공유 버튼 (□↑) → "홈 화면에 추가"
  2. 또는 자동으로 표시되는 배너

**안내 메시지 표시 (선택)**:
- 첫 방문 시 "홈 화면에 추가하시면 더 편리하게 사용할 수 있습니다" 안내
- JavaScript로 설치 가능 여부 확인 후 안내 표시

---

### 구현 체크리스트

#### 필수 항목
- [ ] `manifest.json` 파일 생성
- [ ] 아이콘 이미지 파일 준비 (최소 192×192, 512×512)
- [ ] HTML에 manifest 링크 추가
- [ ] iOS용 meta 태그 추가
- [ ] 테스트 (Android Chrome, iOS Safari)

#### 선택 항목
- [ ] Service Worker 구현 (오프라인 기능)
- [ ] 설치 안내 메시지
- [ ] 다양한 아이콘 크기 준비
- [ ] 스플래시 스크린 이미지

---

### 파일 구조

```
pci0327/daeri/
├── manifest.json              # Web App Manifest
├── sw.js                      # Service Worker (선택)
├── index.html                 # manifest 링크 포함
├── login.html                 # manifest 링크 포함
├── ...
└── images/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-180x180.png       # iOS용
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

---

### 브라우저 지원

**지원 브라우저**:
- ✅ Android Chrome (완전 지원)
- ✅ iOS Safari 11.3+ (부분 지원)
- ✅ Samsung Internet
- ✅ Firefox Mobile
- ⚠️ iOS Safari는 일부 제한 (Service Worker 제한적)

**테스트 방법**:
1. Android: Chrome에서 "홈 화면에 추가" 메뉴 확인
2. iOS: Safari에서 공유 → "홈 화면에 추가" 확인
3. 개발자 도구: Application 탭 → Manifest 확인

---

### 추가 고려사항

#### 1. HTTPS 필수
- PWA 기능은 HTTPS 환경에서만 작동
- 카페24 호스팅은 HTTPS 지원 확인 필요

#### 2. 아이콘 디자인
- 간단하고 명확한 디자인
- 작은 크기에서도 인식 가능
- 브랜드 일관성 유지

#### 3. 사용자 경험
- 앱처럼 보이도록 `display: standalone` 사용
- 시작 URL을 로그인 페이지로 설정 (인증 필요 시)
- 빠른 로딩 시간

---

**PWA 기능 요약**:
- Web App Manifest 파일로 바탕화면 바로가기 지원
- Android/iOS 모두 지원
- 앱처럼 독립 실행 가능
- Service Worker로 오프라인 기능 추가 가능 (선택)
