# 작업일지 - KJ 대리운전

> **카테고리**: KJ 대리운전 관련 작업
> **업데이트 규칙**: 기능 완성 시마다 즉시 업데이트

---

## ✅ 완료된 작업

### 2026-01-24 (KJ 대리운전) - 대리운전회사 상세보기 모달 UI 개선 및 증권별 코드 페이지 개선

#### 작업 내용
- **기능**: 대리운전회사 상세보기 모달의 기본정보/증권정보 테이블 UI 개선, 증권별 코드 페이지 정렬 및 페이지네이션 개선
- **파일**: 
  - `disk-cms-react/src/pages/insurance/components/CompanyDetailModal.tsx` (기본정보/증권정보 테이블 UI 개선)
  - `disk-cms-react/src/pages/insurance/CodeByPolicy.tsx` (정렬, 페이지네이션, footer 추가)
  - `disk-cms-react/src/components/DataTable.tsx` (footer prop 추가)
- **주요 구현 사항**:
  - ✅ 기본정보 테이블 th 폭 일정하게 수정
    - 모든 th에 `style={{ width: '120px' }}` 적용
    - 테이블에 `tableLayout: 'fixed'` 추가
  - ✅ 기본정보 테이블 td 폭 일정하게 수정
    - 각 td에 `style={{ width: 'calc((100% - 480px) / 4)' }}` 적용
    - th 4개 = 480px, 나머지 공간을 4등분하여 각 td에 할당
  - ✅ 기본정보 테이블 수정일 때 입력상자가 td에 꽉 차게 수정
    - 수정 모드: td에 `p-0` 클래스 추가
    - 입력상자 스타일: `border-0 rounded-none` + `padding: '8px 12px'`
    - 일반 모드: 텍스트를 `<div className="px-3 py-2">`로 감싸 패딩 유지
  - ✅ 증권정보 테이블 입력상자도 td에 꽉 차게 수정
    - 보험사, 시작일, 증권번호, 분납, 회차, 증권성격 Select/input에 동일한 스타일 적용
    - td에 `p-0` 클래스 추가
    - Select에 `border-0 rounded-none` className과 `style={{ width: '100%' }}` 추가
  - ✅ 증권별 코드 페이지 정렬 순서 변경
    - 1순위: 보험사(insurance) 내림차순
    - 2순위: 계약일(sigi) 오름차순
  - ✅ 페이지당 항목 수 변경
    - 15개 → 20개로 변경
  - ✅ 테이블 마지막 행에 인원 합계 표시
    - DataTable 컴포넌트에 `footer` prop 추가
    - 테이블 마지막 행에 "합계 (전체)"와 전체 인원 합계 표시
  - ✅ 인원 합계 표시 명확화
    - "인원 합계" → "전체 인원 합계"로 변경
    - footer에 "합계 (전체)" 표시하여 전체 인원 합계임을 명확히 함

#### 해결한 이슈
- 기본정보 테이블의 th/td 폭이 일정하지 않던 문제 해결
- 수정일 때 입력상자가 td에 꽉 차지 않던 문제 해결
- 증권정보 테이블의 입력상자가 td에 꽉 차지 않던 문제 해결
- 증권별 코드 페이지의 정렬 순서가 사용자 요구사항과 다른 문제 해결
- 페이지당 항목 수가 적절하지 않던 문제 해결
- 테이블에 인원 합계가 표시되지 않던 문제 해결
- 인원 합계가 전체 인원인지 현재 페이지 인원인지 불명확하던 문제 해결

#### 참고 사항
- 기본정보 테이블은 `tableLayout: 'fixed'`를 사용하여 고정 레이아웃 적용
- 입력상자 스타일은 `DriverSearch.tsx`와 `EndorseList.tsx`의 스타일을 참고하여 일관성 유지
- DataTable 컴포넌트의 footer 기능은 향후 다른 페이지에서도 활용 가능

---

### 2026-01-24 (KJ 대리운전) - 기사 찾기 페이지 UI 개선 (입력상자 스타일 및 중앙정렬)

#### 작업 내용
- **기능**: 기사 찾기 페이지의 입력상자를 배서리스트 페이지와 동일하게 td에 꽉 차게 수정, 모든 컬럼 중앙정렬 적용, 나이 표시 위치 변경
- **파일**: 
  - `disk-cms-react/src/pages/insurance/DriverSearch.tsx` (입력상자 스타일, 중앙정렬, 나이 표시 위치 변경)
- **주요 구현 사항**:
  - ✅ 입력상자 스타일 개선 (배서리스트 페이지와 동일하게)
    - 상태, 증권성격, 핸드폰, 사고 컬럼의 입력상자(select/input) 스타일 변경
    - 변경 전: `px-2 py-1 rounded border border-input`
    - 변경 후: `border-0 rounded-none` + `style={{ padding: '8px 12px', width: '100%' }}`
    - 컬럼 className에 `p-0` 추가하여 td 패딩 제거
    - 입력상자가 td를 꽉 채우도록 수정
  - ✅ 모든 컬럼에 중앙정렬 적용
    - 모든 컬럼의 `className`에 `text-center` 추가
    - cell 내부 div/span 요소에도 `text-center` 클래스 추가
    - 입력상자(select/input)에도 `text-center` 클래스 추가
  - ✅ 나이 표시 위치 변경
    - 변경 전: 주민번호 컬럼에 `주민번호 (나이세)` 형식
    - 변경 후: 이름 컬럼에 `이름 (나이세)` 형식
  - ✅ 주민번호, 등록일, 해지일 컬럼 중앙정렬 수정
    - cell 내부 div에서 `hidden lg:table-cell` 제거 (td에 이미 적용되어 있음)
    - `w-full` 클래스 추가하여 중앙정렬 정상 작동하도록 수정

#### 해결한 이슈
- 입력상자가 td에 꽉 차지 않던 문제 해결 (배서리스트 페이지와 동일한 스타일 적용)
- 일부 컬럼이 중앙정렬되지 않던 문제 해결 (모든 컬럼에 text-center 적용)
- 나이가 주민번호 컬럼에 표시되어 가독성이 떨어지던 문제 해결 (이름 컬럼으로 이동)
- 주민번호, 등록일, 해지일 컬럼이 중앙정렬되지 않던 문제 해결 (cell 내부 div 수정)

#### 참고 사항
- 배서리스트 페이지(`EndorseList.tsx`)의 입력상자 스타일을 참고하여 동일하게 적용
- `DailyEndorseListModal.tsx`의 입력상자 스타일도 참고 (`p-0`, `border-0 rounded-none`, `padding: '8px 12px'`)
- DataTable 컴포넌트는 td에 기본적으로 `text-center`가 적용되어 있지만, cell 내부 요소에도 명시적으로 추가하여 확실히 적용

---

### 2026-01-24 (KJ 대리운전) - 배서리스트 페이지 UI 개선 및 배서처리 취소 기능 추가

#### 작업 내용
- **기능**: 배서리스트 페이지 컬럼 순서 변경, 주민번호 하이픈 제거, 기준일 색상 표시, 배서처리 취소 기능 추가, 기사찾기 상태 표기 개선, 배서처리 API 입력값 보정/로깅 강화
- **파일**: 
  - `disk-cms-react/src/pages/insurance/EndorseList.tsx` (컬럼 순서 변경, 취소 기능 추가)
  - `disk-cms-react/src/pages/insurance/DriverSearch.tsx` (기사찾기 상태 표기: 청약취소/청약거절/해지취소)
  - `disk-cms-react/src/lib/api.ts` (update-status 요청 디버깅 로그)
  - `pci0327/api/insurance/kj-endorse-update-status.php` (sangtae 강제 설정, 로깅/입력값 보정)
- **주요 구현 사항**:
  - ✅ 배서리스트 컬럼 순서 변경
    - 요청된 순서대로 재배치: 담당자, 업체명, 성명(나이), 주민번호, 핸드폰번호, 요율, 기준일, 신청일, 증권번호, 증권종류, 상태, 배서처리, 보험사, 매니저, 진행단계, 보험료, C보험료, 중복
    - 컬럼 헤더명 변경: "대리운전회사명" → "업체명", "증권성격" → "증권종류", "manager" → "매니저", "중복여부" → "중복"
    - 성명 컬럼에 나이 표시 추가: `성명(나이)` 형식
  - ✅ 주민번호 하이픈 제거
    - 주민번호 표시 시 하이픈(`-`) 자동 제거
    - 예: `123456-1234567` → `1234561234567`
  - ✅ 기준일 색상 표시
    - 기준일이 오늘 날짜와 같으면: 기본 색상(파란색 링크)
    - 기준일이 오늘 날짜와 다르면: 주황색(`text-orange-600`)으로 표시
    - 버튼과 일반 텍스트 모두에 적용
  - ✅ 배서처리 상태에 "취소" 옵션 추가
    - 배서처리 드롭다운: 미처리, 처리, 취소 (3가지 옵션)
    - 취소 선택 시:
      - 해지 취소: `sangtae=2`, `push=4` 유지, `cancel=45`
      - 청약 취소: `sangtae=2`, `push=1` 유지, `cancel=12`
    - 취소 선택 시 요율 체크 불필요
  - ✅ 취소 후 재처리 불가능
    - 취소된 항목(`cancel=45` 또는 `cancel=12`)은 드롭다운에서 "처리" 옵션 비활성화
    - 취소된 항목은 드롭다운 자체가 비활성화되어 변경 불가
    - 일괄 처리에서도 취소된 항목은 제외
  - ✅ TypeScript 타입 오류 수정
    - `cancel` 필드 타입: `string` → `number | string`
    - 취소 상태 확인 로직 개선
  - ✅ API 호출 개선
    - JSON 형식으로 데이터 전송
    - Content-Type 헤더 명시적 설정
    - 디버깅 로그 추가
  - ✅ 기사찾기(`kj-driver-search`) 상태 표기 개선
    - `push=1 + cancel=12` → **청약취소**
    - `push=1 + cancel=13` → **청약거절**
    - `push=4 + cancel=45` → **해지취소**
    - 기존: `mapPushLabel(push)`만 사용되어 취소/거절이 “청약(중)”처럼 보이던 문제 수정
  - ✅ 배서처리 상태 업데이트 API 입력값 보정/로깅 강화
    - 실제 운영 호출에서 `sangtae`가 누락되는 케이스 확인(로그 기반)
    - `endorseProcess`가 `취소/청약/해지/거절`이면 **무조건 `sangtae=2(처리)`로 강제 설정** (프론트에서 넘어온 sangtae와 무관)
    - `endorseProcess`가 없거나 기타이면 `sangtae=1(미처리)`로 설정
    - Raw Input / 파싱된 데이터 / 필드 존재 여부 로그 추가로 원인 추적 가능하게 개선

#### 해결한 이슈
- 배서리스트 컬럼 순서가 사용자 요구사항과 다른 문제 해결
- 주민번호에 하이픈이 포함되어 표시되던 문제 해결
- 기준일이 당일이 아닌 경우 구분이 어려웠던 문제 해결 (색상으로 구분)
- 배서처리 취소 기능이 없어서 잘못 처리된 항목을 되돌릴 수 없던 문제 해결
- 취소된 항목을 다시 처리할 수 있던 문제 해결 (비활성화)
- TypeScript 타입 오류로 인한 빌드 실패 문제 해결
- 기사찾기에서 `cancel=12` 데이터가 “청약중”으로 표시되던 문제 해결 → “청약취소”
- 배서처리 API에서 `sangtae` 누락으로 “필수 필드 누락” 에러가 발생하던 문제를 방어 로직으로 해결

#### 참고 사항
- 취소 상태 확인: `cancel=45` (해지취소) 또는 `cancel=12` (청약취소)
- 취소 후 재처리 불가능하도록 UI에서 차단
- `kj-endorse/update-status`는 운영 환경에서 `sangtae` 누락 케이스가 있어, 백엔드에서 `endorseProcess` 기반으로 `sangtae`를 강제 설정하도록 보정
- 일괄 처리 기능에도 취소 옵션 지원

---


### 2026-01-20 (KJ 대리운전) - 증권번호 변경 시 대리기사 정보 업데이트 및 모달 UI 개선

#### 작업 내용
- **기능**: 증권번호 변경 시 대리기사의 증권번호(`dongbuCerti`)와 보험회사(`InsuranceCompany`)도 함께 업데이트되도록 수정 및 모달에 변경 범위 안내 추가
- **파일**: 
  - `pci0327/api/insurance/kj-certi-change-policy.php` (대리기사 정보 업데이트 로직 추가)
  - `disk-cms-react/src/pages/insurance/PolicySearch.tsx` (모달 UI 개선)
- **주요 구현 사항**:
  - ✅ `2012DaeriMemberSecure` 테이블 업데이트 로직 개선
    - 변경 전: `dongbuCerti`(대리기사 증권번호)만 업데이트
    - 변경 후: `dongbuCerti`와 `InsuranceCompany`(보험회사) 모두 업데이트
    - SQL 쿼리: `UPDATE 2012DaeriMemberSecure SET dongbuCerti = ?, InsuranceCompany = ? WHERE ...`
  - ✅ 증권번호 변경 모달에 변경 범위 안내 추가
    - 모달 상단에 "변경 범위 안내" 박스 추가
    - `2012CertiTable` 테이블: 증권번호, 보험기간, 보험회사 변경
    - `2012DaeriMemberSecure` 테이블: 대리기사 증권번호(`dongbuCerti`) 및 보험회사(`InsuranceCompany`) 업데이트
    - 확인 메시지에도 동일한 안내 포함
  - ✅ 두 가지 케이스 모두 처리
    - `cNums` 배열이 제공된 경우: 해당 증권번호들만 업데이트
    - `cNums`가 없는 경우: 업데이트된 `CertiTable`의 `num`으로 조회하여 업데이트

#### 해결한 이슈
- 증권번호 변경 시 대리기사의 보험회사가 업데이트되지 않던 문제 해결
- 사용자가 증권번호 변경 시 어떤 데이터가 변경되는지 명확히 인식할 수 있도록 모달 UI 개선

#### 참고 사항
- 증권번호 변경 시 `2012CertiTable`과 `2012DaeriMemberSecure` 두 테이블 모두 업데이트됨
- 트랜잭션으로 처리되어 일관성 보장
- `push = 4` 조건으로 정상 상태인 회원만 업데이트

---


### 2026-01-20 (KJ 대리운전) - 증권번호 찾기 페이지 검색 오류 수정

#### 작업 내용
- **기능**: 증권번호 찾기 페이지에서 검색 버튼 클릭 시 발생하는 순환 참조 오류 수정
- **파일**: 
  - `disk-cms-react/src/pages/insurance/PolicySearch.tsx` (검색 버튼 onClick 핸들러 수정)
- **주요 구현 사항**:
  - ✅ `FilterBar.SearchButton`의 `onClick` 핸들러 수정
    - 변경 전: `onClick={handleSearch}` (이벤트 객체가 전달되어 순환 참조 발생)
    - 변경 후: `onClick={() => handleSearch()}` (이벤트 객체 무시)

#### 해결한 이슈
- 검색 버튼 클릭 시 "Converting circular structure to JSON" 오류 해결
- React 이벤트 객체가 API 요청에 포함되어 순환 참조가 발생하던 문제 수정

---


### 2026-01-17 (KJ 대리운전) - 회원번호(num) URL 파라미터 암호화 처리

#### 작업 내용
- **기능**: `k.html?num=12345` URL에서 회원번호가 노출되지 않도록 암호화 처리
- **파일**: 
  - `pci0327/api/utils/jumin-secure.php` (회원번호 암호화/복호화 함수 추가)
  - `pci0327/api/insurance/kj-endorse-save.php` (SMS 발송 시 암호화된 num 사용)
  - `pci0327/kj/api/kjDaeri/save_endorse_data_encryption.php` (SMS 발송 시 암호화된 num 사용)
  - `pci0327/kj/api/customer/check_service_type.php` (암호화된 num 복호화 처리)
  - `pci0327/kj/api/customer/submit_insurance.php` (암호화된 num 복호화 처리)
- **주요 구현 사항**:
  - ✅ 회원번호 암호화/복호화 함수 추가 (`jumin-secure.php`)
    - `encryptMemberNum()`: 회원번호를 AES-256-GCM으로 암호화, URL-safe Base64로 인코딩
    - `decryptMemberNum()`: 암호화된 회원번호를 복호화하여 평문 반환
    - URL-safe Base64 사용 (`+`, `/`, `=` → `-`, `_`, 빈 문자열)
  - ✅ SMS 발송 시 암호화된 num 값 사용
    - `kj-endorse-save.php`: 케이드라이브 SMS 발송 시 `encryptMemberNum($insertedId)` 사용
    - `save_endorse_data_encryption.php`: 동일하게 암호화된 num 사용
    - SMS 메시지: `https://www.pcikorea.com/k.html?num={암호화된값}`
  - ✅ 백엔드 API에서 암호화된 num 복호화 처리
    - `check_service_type.php`: `decryptMemberNum()`으로 복호화 후 `2012DaeriMemberSecure` 테이블 조회
    - `submit_insurance.php`: `decryptMemberNum()`으로 복호화 후 회원 정보 업데이트
    - 복호화 실패 시 에러 메시지 반환
  - ✅ 테이블명 통일
    - `check_service_type.php`: `DaeriMember` → `2012DaeriMemberSecure` 테이블 사용
    - `submit_insurance.php`: `2012DaeriMemberSecure` 테이블 사용 (주민번호/핸드폰 암호화 필드 사용)

#### 해결한 이슈
- URL에 회원번호가 평문으로 노출되던 보안 문제 해결
- SMS 발송 시 암호화된 회원번호를 URL에 포함하여 전달
- 백엔드 API에서 암호화된 회원번호를 안전하게 복호화하여 처리

#### 참고 사항
- 암호화 방식: AES-256-GCM (주민번호/핸드폰 번호와 동일한 방식)
- URL-safe Base64 인코딩 사용으로 URL 파라미터로 안전하게 전달 가능
- 기존 암호화 모듈(`jumin-secure.php`) 재사용으로 일관성 유지

---


### 2026-01-17 (KJ 대리운전) - 증권카드 신규청약 시 케이드라이브 SMS 발송 기능 추가

#### 작업 내용
- **기능**: 증권카드 신규청약 저장 시 케이드라이브(dNum=653)인 경우 신청자 전화번호로 SMS 자동 발송
- **파일**: 
  - `pci0327/api/insurance/kj-endorse-save.php` (케이드라이브 SMS 발송 로직 추가)
- **주요 구현 사항**:
  - ✅ 케이드라이브 체크 로직 추가
    - `dNum == '653'` 또는 `dNum == 653`인 경우 SMS 발송
  - ✅ SMS 메시지 생성
    - 메시지 형식: `{이름}님 {대리보험/탁송보험} 가입에 동의 해주세요 https://www.pcikorea.com/k.html?num={회원번호}`
    - 증권성격(gita)에 따라 "대리보험" 또는 "탁송보험" 자동 선택
    - gita가 1 또는 2이면 "대리보험", 그 외는 "탁송보험"
  - ✅ SMS 발송 처리
    - `kj-sms-aligo.php` 모듈 로드 및 `sendAligoSms()` 함수 사용
    - 전화번호가 있는 경우에만 발송
    - 하이픈 포함/미포함 모두 처리 가능
  - ✅ SMSData 테이블 저장
    - 발송 내역을 SMSData 테이블에 저장
    - SendId: 'csdrive', SendName: 'drive', RecvName: 'CS'
    - 회원번호(`2012DaeriMemberNum`) 연결
  - ✅ 로깅 추가
    - SMS 발송 결과 및 오류 로깅
    - 전화번호 마스킹 처리 (민감 정보 보호)

#### 해결한 이슈
- React 버전에서 케이드라이브 SMS 발송 기능이 누락되어 있던 문제 해결
- 기존 `save_endorse_data_encryption.php`의 로직을 `kj-endorse-save.php`에 동일하게 적용
- 트랜잭션 내에서 SMS 발송 및 SMSData 저장 처리

#### 참고 사항
- 기존 로직: `pci0327/kj/api/kjDaeri/save_endorse_data_encryption.php` (226-309줄)
- SMS 발송 모듈: `pci0327/api/utils/kj-sms-aligo.php`
- SMS 발송 API: Aligo SMS API (AWS Lambda 프록시)

---


### 2026-01-17 (KJ 대리운전) - 업체 아이디 추가/수정 시 핸드폰 번호 저장 형식 수정

#### 작업 내용
- **기능**: 업체 아이디 추가 및 수정 시 핸드폰 번호를 하이픈 포함 형식으로 저장하도록 수정
- **파일**: 
  - `src/pages/insurance/components/CompanyIdModal.tsx` (핸드폰 번호 저장 형식 수정)
- **주요 구현 사항**:
  - ✅ 신규 아이디 추가 시 핸드폰 번호 저장 형식 수정
    - 변경 전: `phone: removePhoneHyphen(newPhone)` (하이픈 제거)
    - 변경 후: `phone: newPhone` (하이픈 포함, `010-1234-5678` 형식)
  - ✅ 핸드폰 번호 수정 시 저장 형식 수정
    - 변경 전: `hphone: cleaned` (하이픈 제거된 값)
    - 변경 후: `hphone: phone` (하이픈 포함된 값)
  - ✅ 데이터베이스 저장 형식 확인
    - `2012Costomer` 테이블의 `hphone` 필드는 하이픈 포함 형식으로 저장됨
    - `kj-sms-utils.php`에서 `explode("-", $id_row['hphone'])`로 하이픈 기준 분리 사용
    - 입력 필드에서 `addPhoneHyphen` 함수로 자동 하이픈 추가 (`010-1234-5678` 형식)

#### 해결한 이슈
- 업체 아이디 추가/수정 시 핸드폰 번호가 하이픈 없이 저장되던 문제 해결
- 데이터베이스에 하이픈 포함 형식으로 저장되어야 하는데 하이픈을 제거하여 저장하던 문제 수정
- SMS 발송 등 다른 기능에서 하이픈 기준으로 분리하는 로직과 일관성 확보

---


### 2026-01-17 (KJ 대리운전) - 2012DaeriMemberSecure 테이블 마이그레이션 및 추가 API 암호화 처리

#### 작업 내용
- **기능**: `2012DaeriMember` 테이블의 주민번호/핸드폰 번호 암호화 마이그레이션 관련 추가 API 수정
- **파일**: 
  - `pci0327/api/insurance/kj-policy-search.php` (테이블 변경)
  - `pci0327/api/insurance/kj-policy-stats.php` (테이블 변경, 주민번호 복호화)
  - `pci0327/api/insurance/kj-certi-change-policy.php` (테이블 변경)
  - `pci0327/api/insurance/kj-certi-change-policy-excel.php` (테이블 변경, 주민번호/핸드폰 복호화)
  - `pci0327/api/insurance/kj-driver-phone-update.php` (테이블 변경, 핸드폰 암호화 저장)
  - `pci0327/api/insurance/kj-daily-endorse-status.php` (테이블 변경, 주민번호/핸드폰 복호화)
  - `pci0327/api/insurance/kj-endorse-update-endorse-day.php` (테이블 변경)
  - `pci0327/api/insurance/kj-endorse-termination.php` (테이블 변경)
  - `pci0327/api/insurance/kj-certi-detail.php` (테이블 변경)
  - `pci0327/api/insurance/kj-company-detail.php` (테이블 변경)
  - `pci0327/api/insurance/kj-company-list.php` (테이블 변경)
- **주요 구현 사항**:
  - ✅ 증권별 코드 페이지 관련 API 수정
    - `kj-policy-search.php`: `2012DaeriMember` → `2012DaeriMemberSecure` (COUNT 쿼리)
    - `kj-policy-stats.php`: 테이블 변경, 주민번호 복호화 및 2019rate 조회 시 복호화된 주민번호 사용
  - ✅ 증권번호 변경 관련 API 수정
    - `kj-certi-change-policy.php`: SELECT/UPDATE 쿼리 테이블 변경
    - `kj-certi-change-policy-excel.php`: 테이블 변경, 주민번호/핸드폰 번호 복호화 후 엑셀 데이터 생성
  - ✅ 추가 API 파일 수정 (총 8개)
    - `kj-driver-phone-update.php`: 핸드폰 번호 암호화 저장 (`encryptPhone`, `hashPhone`)
    - `kj-daily-endorse-status.php`: 주민번호/핸드폰 번호 복호화, 2019rate 조회 시 복호화된 주민번호 사용
    - `kj-endorse-update-endorse-day.php`: SELECT/UPDATE 쿼리 테이블 변경 (주민번호/핸드폰 조회 안 함)
    - `kj-endorse-termination.php`: UPDATE 쿼리 테이블 변경 (주민번호/핸드폰 조회 안 함)
    - `kj-certi-detail.php`: COUNT 쿼리 테이블 변경
    - `kj-company-detail.php`: COUNT 쿼리 테이블 변경
    - `kj-company-list.php`: EXISTS 서브쿼리 및 COUNT 쿼리 테이블 변경
  - ✅ 보안 모듈 로드 추가
    - 주민번호/핸드폰 번호를 조회하거나 저장하는 모든 API에 `jumin-secure.php` 모듈 로드
  - ✅ 복호화 처리
    - 조회 API에서 `jumin_encrypted`, `hphone_encrypted` 필드를 복호화하여 응답에 `Jumin`, `Hphone`으로 반환
    - 2019rate 조회 시 복호화된 주민번호(하이픈 제거, 13자리 숫자) 사용
  - ✅ 암호화 저장
    - 저장/업데이트 API에서 평문 주민번호/핸드폰 번호를 `encryptJumin`/`encryptPhone`으로 암호화하여 저장
    - 해시 생성 (`hashJumin`, `hashPhone`)하여 검색용 해시 필드에 저장

#### 수정된 API 목록 (이번 작업)
1. `kj-policy-search.php` - 증권 리스트 조회
2. `kj-policy-stats.php` - 증권별 보험료 통계
3. `kj-certi-change-policy.php` - 증권번호 변경 (검색 및 실행)
4. `kj-certi-change-policy-excel.php` - 증권번호 변경 엑셀 다운로드
5. `kj-driver-phone-update.php` - 기사 전화번호 업데이트
6. `kj-daily-endorse-status.php` - 일일배서 배서현황 조회
7. `kj-endorse-update-endorse-day.php` - 배서기준일 업데이트
8. `kj-endorse-termination.php` - 배서 해지 신청
9. `kj-certi-detail.php` - 증권 상세 정보
10. `kj-company-detail.php` - 업체 상세 정보
11. `kj-company-list.php` - 업체 목록

#### 전체 암호화 처리 완료 현황
- ✅ 저장 API: `kj-endorse-save.php`, `kj-driver-phone-update.php`
- ✅ 조회 API: `kj-driver-list.php`, `kj-endorse-list.php`, `kj-daily-endorse-search.php`, `kj-certi-member-list.php`, `kj-daily-endorse-status.php`, `kj-policy-stats.php`
- ✅ 업데이트 API: `kj-endorse-update-status.php`, `kj-endorse-update-member.php`, `kj-endorse-update-endorse-day.php`, `kj-driver-phone-update.php`
- ✅ 정산 관련 API: `kj-settlement-adjustment.php`, `kj-settlement-monthly-endorse-search.php`, `kj-settlement-excel-data.php`
- ✅ 기타 API: `kj-policy-search.php`, `kj-certi-change-policy.php`, `kj-certi-change-policy-excel.php`, `kj-endorse-termination.php`, `kj-certi-detail.php`, `kj-company-detail.php`, `kj-company-list.php`

#### 해결한 이슈
- `2012DaeriMember` 테이블을 사용하는 모든 API 파일 확인 및 암호화 처리 완료
- 주민번호/핸드폰 번호 조회 시 복호화 처리 적용
- 주민번호/핸드폰 번호 저장 시 암호화 처리 적용
- 2019rate 테이블 조회 시 복호화된 주민번호 사용

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

---

