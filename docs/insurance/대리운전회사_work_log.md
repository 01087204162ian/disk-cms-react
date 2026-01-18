# 대리운전회사용 시스템 학습 로그

> **학습 대상**: `pci0327/kj` 폴더 (KJ 대리운전 보험 CMS 시스템)
> **목적**: 기존 시스템 구조 및 구현 방식을 학습하여 대리운전회사용 시스템 개발에 참고

---

## 📅 학습 일지

### 2026-01-17 - KJ 대리운전 보험 CMS 시스템 구조 분석

#### 학습 목표
- 기존 KJ 시스템의 전체 구조 파악
- 인증/세션 관리 방식 이해
- 데이터베이스 구조 및 API 설계 패턴 학습
- 프론트엔드 구조 및 UI/UX 패턴 학습

---

## 📁 프로젝트 구조

### 전체 폴더 구조
```
pci0327/kj/
├── index.html              # 로그인 페이지
├── dashboard.html          # 메인 대시보드
├── css/                    # 스타일시트
│   ├── basic.css          # 기본 스타일
│   ├── driver.css         # 기사 관련 스타일
│   ├── modal.css          # 모달 스타일
│   ├── sms.css            # 문자 관련 스타일
│   └── mobile-tables.css  # 모바일 테이블 스타일
├── js/                     # JavaScript 파일
│   ├── basic.js           # 기본 유틸리티 및 초기화
│   ├── login.js           # 로그인 로직
│   ├── home.js            # 홈(증권정보) 페이지 로직
│   ├── driverSearch.js    # 기사 검색 로직
│   ├── sms.js             # 문자 발송 로직
│   ├── modal.js           # 모달 관리
│   ├── loading.js         # 로딩 인디케이터
│   ├── readId.js          # ID 읽기 관련
│   ├── sago.js            # 사고 처리 관련
│   ├── tab-init.js        # 탭 초기화
│   └── responsive-tables.js # 반응형 테이블
└── api/                    # API 엔드포인트
    ├── customer/          # 고객(회사) 관련 API
    ├── kjDaeri/           # 대리운전 관련 API (68개 파일)
    └── smsApi/            # SMS 발송 API
```

---

## 🔐 인증 및 세션 관리

### 로그인 프로세스

**1. 클라이언트 측 (`index.html` + `js/login.js`)**
- Bootstrap 5 기반 간단한 로그인 폼
- `login()` 함수로 FormData 전송
- 응답 후 쿠키 설정 및 `dashboard.html`로 리다이렉트

**2. 서버 측 (`api/customer/login.php`)**
- `2012Costomer` 테이블에서 사용자 조회
- 비밀번호 MD5 해시 검증 (보안 개선 필요)
- 세션 생성 및 쿠키 설정
- JSON 응답 반환

**주요 코드 패턴:**
```php
// 세션 생성
session_start();
$_SESSION['userId'] = $row['mem_id'];
$_SESSION['cNum'] = $row['2012DaeriCompanyNum'];

// 쿠키 설정
setcookie('userId', $row['mem_id'], time() + 3600, '/');
setcookie('cNum', $row['2012DaeriCompanyNum'], time() + 3600, '/');
```

### 세션 관리

**1. 세션 타임아웃 (30분)**
- `js/basic.js`에서 `resetSessionTimer()` 함수로 관리
- 사용자 활동 감지 (클릭, 키보드, 스크롤, 마우스 이동)
- 5분마다 `check_session.php`로 서버 세션 유효성 확인

**2. 쿠키 기반 사용자 정보**
- `userId`: 사용자 ID
- `userseq`: 사용자 시퀀스 (MD5 해시)
- `cNum`: 회사 번호
- `company`: 회사명
- `nAme`: 사용자 이름
- `lastActivity`: 마지막 활동 시간

**3. 자동 로그아웃**
- 30분 비활성 시 자동 로그아웃
- `checkAlreadyLoggedIn()` 함수로 자동 로그인 상태 확인

---

## 📊 데이터베이스 구조

### 주요 테이블

**1. 사용자 관련**
- `2012Costomer`: 고객(회사) 정보
  - `mem_id`: 회원 ID
  - `passwd`: 비밀번호 (MD5)
  - `2012DaeriCompanyNum`: 대리운전 회사 번호
  - `permit`: 권한 (1: 허용)
  - `readIs`: 읽기 권한

**2. 증권 관련**
- `2012Certi`: 증권 정보
  - `certi`: 증권번호
  - `sigi`: 시작일
  - `insurance`: 보험사 코드

- `2012CertiTable`: 증권 테이블
  - `num`: 고유 번호
  - `policyNum`: 증권번호
  - `gita`: 증권의 종류
  - `startyDay`: 시작일
  - `InsuraneCompany`: 보험사
  - `2012DaeriCompanyNum`: 대리운전 회사 번호

**3. 기사 관련**
- `2012DaeriMember`: 대리운전 회원(기사) 정보
  - `dongbuCerti`: 동부 증권번호
  - `CertiTableNum`: 증권 테이블 번호
  - `push`: 상태 (1: 청약, 4: 정상)
  - `name`: 이름
  - `Jumin`: 주민번호
  - `hphone`: 핸드폰 번호

- `2012DaeriCompany`: 대리운전 회사 정보
  - `num`: 회사 번호
  - `company`: 회사명

---

## 🔄 주요 API 구조

### 1. 인증 관련 API (`api/customer/`)

**`login.php`**
- **메서드**: POST
- **파라미터**: `user_id`, `pass_word`
- **기능**: 로그인 처리, 세션 생성, 쿠키 설정
- **응답**: JSON (success, userId, cNum, company 등)

**`logout.php`**
- **메서드**: POST
- **기능**: 세션 파괴, 쿠키 삭제

**`check_session.php`**
- **메서드**: POST
- **기능**: 세션 유효성 확인
- **사용**: 5분마다 자동 호출

### 2. 증권 정보 API (`api/customer/`)

**`home_data.php`**
- **메서드**: POST
- **파라미터**: `cNum` (회사 번호)
- **기능**: 회사별 증권 목록 조회
- **SQL**: `2012CertiTable`에서 증권 조회, 각 증권별 인원 수 계산
- **응답**: 증권 목록 (증권번호, 보험사, 인원 수 등)

**`home_data_endorse.php`**
- **기능**: 진행 중인 배서 데이터 조회

**`home_data_endorse_after.php`**
- **기능**: 배서 완료 후 데이터 조회

### 3. 기사 관련 API (`api/customer/`)

**`driver_data.php`**
- **메서드**: POST
- **파라미터**: `cNum`, `name` (검색어)
- **기능**: 기사 검색 및 목록 조회
- **SQL**: `2012DaeriMember`에서 이름으로 필터링
- **응답**: 기사 목록 (이름, 주민번호, 연락처 등)

### 4. 대리운전 관련 API (`api/kjDaeri/`)

**주요 API 목록:**
- `policySearch.php`: 증권 검색
- `changeEndorse.php`: 배서 상태 변경
- `gisaSearch.php`: 기사 검색
- `gisaList.php`: 기사 목록
- `smsSearch.php`: 문자 검색
- `smsSend.php`: 문자 발송
- `dailyEndorseSearch.php`: 일일 배서 검색
- `endorse.php`: 배서 처리
- `updateHaeji.php`: 해지 업데이트
- `save_premium_data.php`: 보험료 데이터 저장

---

## 🎨 프론트엔드 구조

### 1. HTML 구조

**`index.html` (로그인 페이지)**
- Bootstrap 5 기반 간단한 로그인 폼
- `js/login.js` 로드

**`dashboard.html` (메인 대시보드)**
- 사이드바 네비게이션
- 탭 기반 콘텐츠 영역
  - 증권정보 탭
  - 기사찾기 탭
  - 문자리스트 탭
- 모달 시스템
- 세션 타임아웃 표시

### 2. JavaScript 구조

**`js/basic.js` - 핵심 유틸리티**
- 페이지 초기화 (`DOMContentLoaded`)
- 로그인 상태 확인 (`checkLoginStatus()`)
- 사용자 정보 로드 (`loadUserInfo()`)
- 세션 타이머 관리 (`resetSessionTimer()`, `checkServerSession()`)
- 쿠키 관리 함수 (`getCookie()`, `setCookie()`)
- 로딩 인디케이터 (`showLoading()`, `hideLoading()`)
- 에러 메시지 표시 (`showErrorMessage()`)

**`js/login.js` - 로그인 로직**
- `login()`: 로그인 폼 제출 처리
- 쿠키 설정 및 검증
- 자동 로그인 상태 확인 (`checkAlreadyLoggedIn()`)
- 쿠키 삭제 (`clearAllCookies()`)

**`js/home.js` - 증권정보 페이지**
- `loadHomeData()`: 홈 데이터 로드
- `updateHomeUI()`: 동적 카드 생성
- `toDayEndorse()`: 오늘 배서 조회
- `toDayEndorseAfter()`: 배서 완료 후 조회
- 중복 요청 방지 플래그 (`isHomeDataLoading`, `isEndorseLoading`)

**`js/driverSearch.js` - 기사 검색**
- `driverSearch()`: 기사 검색 실행
- `updateDriverUI()`: 검색 결과 UI 업데이트
- 페이지네이션 처리 (`currentPage`, `rowsPerPage`)
- 모바일 카드 뷰 생성

### 3. CSS 구조

**`css/basic.css` - 기본 스타일**
- CSS 변수 정의 (`:root`)
- 사이드바 스타일
- 콘텐츠 영역 스타일
- 대시보드 카드 스타일
- 반응형 레이아웃

**`css/driver.css` - 기사 관련 스타일**
- 기사 검색 폼 스타일
- 기사 테이블/카드 스타일

**`css/modal.css` - 모달 스타일**
- 커스텀 모달 스타일
- 모달 오버레이

**`css/mobile-tables.css` - 모바일 테이블**
- 모바일 반응형 테이블 스타일

---

## 🔄 데이터 흐름

### 1. 증권 정보 조회 프로세스
```
dashboard.html 로드
    ↓
basic.js (DOMContentLoaded)
    ↓
home.js (loadHomeData())
    ↓ POST cNum
api/customer/home_data.php
    ↓ SQL: 2012CertiTable 조회
    ↓ 각 증권별 인원 수 계산
    ↓ JSON 응답
home.js (updateHomeUI())
    ↓
동적 카드 생성 및 표시
```

### 2. 기사 검색 프로세스
```
사용자 입력 (이름)
    ↓
driverSearch.js (driverSearch())
    ↓ POST cNum, name
api/customer/driver_data.php
    ↓ SQL: 2012DaeriMember 조회
    ↓ JSON 응답
driverSearch.js (updateDriverUI())
    ↓
테이블/카드 뷰 생성
    ↓
페이지네이션 적용
```

### 3. 배서 처리 프로세스
```
사용자 액션 (배서 상태 변경)
    ↓
changeEndorse.php 호출
    ↓ POST num, status, push
api/kjDaeri/changeEndorse.php
    ↓ SQL: 2012DaeriMember 업데이트
    ↓ SMS 발송 (필요시)
    ↓ 로그 기록
    ↓ JSON 응답
UI 업데이트
```

---

## 🎯 주요 설계 패턴

### 1. 모듈화
- 기능별로 JS 파일 분리
- CSS 파일도 기능별 분리
- API 엔드포인트를 기능별 폴더로 분리

### 2. 이벤트 기반 프로그래밍
- DOM 이벤트 리스너 사용
- 비동기 처리 (fetch API)

### 3. RESTful API 설계
- HTTP 메서드 활용 (GET, POST)
- JSON 응답 형식

### 4. 반응형 디자인
- 모바일/데스크톱 대응
- 조건부 렌더링 (테이블/카드 뷰)

### 5. 상태 관리
- 전역 변수: `currentPage`, `currentData`, `totalPages`
- 플래그 변수: `isHomeDataLoading`, `isEndorseLoading`
- 쿠키: 사용자 정보, 세션 정보

---

## 🔒 보안 고려사항

### 현재 구현
- PDO Prepared Statement 사용 (SQL Injection 방지)
- 세션 기반 인증
- 쿠키 기반 사용자 정보 저장

### 개선 필요 사항
- **비밀번호 해싱**: MD5 → `password_hash()` / `password_verify()` 전환
- **CSRF 보호**: 토큰 기반 CSRF 방지 추가
- **XSS 방지**: 출력 데이터 이스케이프 강화
- **HTTPS**: 프로덕션 환경에서 HTTPS 필수

---

## 💡 대리운전회사용 시스템에 적용할 수 있는 패턴

### 1. 세션 관리
- ✅ 30분 타임아웃 적용
- ✅ 5분마다 서버 세션 확인
- ✅ 사용자 활동 감지로 타이머 리셋

### 2. 증권 정보 표시
- ✅ 동적 카드 생성 방식
- ✅ 증권별 인원 수 계산
- ✅ 배서 현황 표시

### 3. 기사 검색
- ✅ 이름 기반 검색
- ✅ 페이지네이션 처리
- ✅ 모바일 카드 뷰

### 4. 반응형 디자인
- ✅ 모바일 우선 설계
- ✅ 테이블/카드 뷰 전환
- ✅ 사이드바 토글 기능

### 5. API 구조
- ✅ 기능별 폴더 분리
- ✅ JSON 응답 형식
- ✅ PDO Prepared Statement 사용

---

## 📝 학습 요약

### 핵심 학습 내용
1. **인증 시스템**: 세션 + 쿠키 기반 인증, 30분 타임아웃
2. **데이터베이스**: `2012CertiTable`, `2012DaeriMember`, `2012DaeriCompany` 등
3. **API 구조**: 기능별 폴더 분리, RESTful 설계
4. **프론트엔드**: 모듈화된 JS/CSS, 반응형 디자인
5. **상태 관리**: 전역 변수, 플래그 변수, 쿠키 활용

### 차이점 및 개선점
1. **비밀번호 보안**: MD5 → bcrypt/argon2 전환 필요
2. **세션 관리**: 더 안전한 세션 관리 방식 고려
3. **에러 처리**: 더 체계적인 에러 처리 및 로깅
4. **코드 구조**: 더 명확한 네이밍 및 구조화

---

## 🔗 참고 문서

- `pci0327/kj/docs/README.md`: 프로젝트 개요
- `pci0327/kj/docs/ARCHITECTURE.md`: 아키텍처 상세 분석
- `pci0327/kj/docs/API.md`: API 문서
- `pci0327/kj/docs/FRONTEND.md`: 프론트엔드 구조

---

---

## 🔐 대리운전 기사 테이블 및 암호화 구조

### 테이블 구조

#### 1. 기존 테이블: `2012DaeriMember`
- **용도**: 기존 시스템에서 사용하던 테이블
- **주민번호**: 평문 저장 (`Jumin` varchar(15))
- **핸드폰 번호**: 평문 저장 (`Hphone` varchar(15))
- **상태**: 점진적으로 `2012DaeriMemberSecure`로 전환 중

#### 2. 새 테이블: `2012DaeriMemberSecure` ⭐ (현재 사용 중)
- **용도**: 보안 강화된 대리운전 기사 정보 테이블
- **주민번호**: 암호화 저장
  - `jumin_encrypted` (text): AES-256-GCM으로 암호화된 주민번호
  - `jumin_hash` (char(64)): 검색용 SHA-256 해시 (일반 인덱스)
- **핸드폰 번호**: 암호화 저장
  - `hphone_encrypted` (text): AES-256-GCM으로 암호화된 핸드폰 번호
  - `hphone_hash` (char(64)): 검색용 SHA-256 해시
- **기타 필드**: 기존 테이블의 모든 필드 포함
  - `num`, `Name`, `nai`, `push`, `etag`, `CertiTableNum`, `2012DaeriCompanyNum` 등

### 암호화 방식

#### 1. 암호화 알고리즘
- **방식**: AES-256-GCM (Galois/Counter Mode)
- **키**: 256비트 (64자리 16진수)
- **IV**: 128비트 (16바이트) - 랜덤 생성
- **Tag**: 128비트 (16바이트) - 인증 태그
- **저장 형식**: Base64 인코딩 (IV + Tag + 암호화된 데이터)

#### 2. 해시 방식
- **알고리즘**: SHA-256
- **용도**: 검색용 (부분 검색 불가, 정확 일치만 가능)
- **형식**: 64자리 16진수 문자열
- **특징**: 단방향 해시 (복호화 불가)

### 복호화 함수

#### 1. 함수 위치
- **예상 경로**: `pci0327/api/utils/jumin-secure.php`
- **현재 상태**: 파일이 없을 수 있음 (기존 시스템 참고 필요)

#### 2. 함수 목록
```php
// 주민번호 복호화
decryptJumin($encrypted) → string|null

// 핸드폰 번호 복호화
decryptPhone($encrypted) → string|null

// 주민번호 해시 생성 (검색용)
hashJumin($jumin) → string

// 핸드폰 번호 해시 생성 (검색용)
hashPhone($hphone) → string
```

#### 3. 사용 예시
```php
// API에서 사용하는 패턴
require_once __DIR__ . '/../../utils/jumin-secure.php';

// 주민번호 복호화
if (!empty($row['jumin_encrypted'])) {
    $decryptedJumin = decryptJumin($row['jumin_encrypted']);
    if ($decryptedJumin) {
        // 하이픈 추가 (6-7 형식)
        $jumin = substr($decryptedJumin, 0, 6) . '-' . substr($decryptedJumin, 6);
    }
}

// 핸드폰 번호 복호화
if (!empty($row['hphone_encrypted'])) {
    $decryptedHphone = decryptPhone($row['hphone_encrypted']);
    if ($decryptedHphone) {
        // 하이픈 추가 (11자리: 010-1234-5678, 10자리: 010-123-4567)
        if (strlen($decryptedHphone) === 11) {
            $hphone = substr($decryptedHphone, 0, 3) . '-' . 
                      substr($decryptedHphone, 3, 4) . '-' . 
                      substr($decryptedHphone, 7);
        }
    }
}
```

### 검색 방식

#### 1. 주민번호 검색
- **기존 방식** (평문): `LIKE '%123456%'` (부분 검색 가능)
- **새 방식** (해시): `jumin_hash = '해시값'` (정확 일치만 가능)
- **제약사항**: 13자리 전체 입력 필수 (보안상 부분 검색 불가)

#### 2. 핸드폰 번호 검색
- **방식**: `hphone_hash = '해시값'` (정확 일치만 가능)
- **제약사항**: 전체 번호 입력 필수

### 현재 사용 현황

#### 대리운전회사용 시스템에서 사용
- **파일**: `pci0327/api/daeri/dashboard/member-list.php`
- **테이블**: `2012DaeriMemberSecure`
- **복호화**: `decryptJumin()`, `decryptPhone()` 함수 사용
- **문제점**: `jumin-secure.php` 파일이 없을 수 있음

#### 기존 KJ 시스템에서 사용
- **파일**: `pci0327/kj/api/kjDaeri/php/decrptJuminHphone.php`
- **함수**: `decryptData()` (mcrypt 사용, 구식 방식)
- **테이블**: `2012DaeriMember` (평문 저장, 복호화 필요)

### 보안 모듈 구현 필요사항

#### 1. 암호화 키 관리
- **위치**: 환경 변수 또는 설정 파일
- **형식**: 64자리 16진수 문자열 (256비트)
- **예시**: `.env` 파일 또는 `config/encryption.php`

#### 2. 함수 구현
- **AES-256-GCM 암호화/복호화**
- **SHA-256 해시 생성**
- **에러 처리 및 로깅**

#### 3. 마이그레이션
- **기존 데이터**: `2012DaeriMember` → `2012DaeriMemberSecure`
- **암호화 처리**: 평문 → 암호화된 형태로 변환
- **해시 생성**: 검색용 해시 값 생성

---

## 🔧 작업 진행 내역

### 2026-01-17 - 2012DaeriMemberSecure 테이블 전환 및 암호화 모듈 마이그레이션

#### 작업 개요
- **목적**: `DaeriMember` / `2012DaeriMember` 테이블을 `2012DaeriMemberSecure`로 전환
- **암호화 모듈**: `encryption.php` (mcrypt/AES-256-CBC) → `jumin-secure.php` (OpenSSL/AES-256-GCM)
- **작업 범위**: `pci0327/kj/api/` 하위 28개 파일 수정

#### 완료된 작업

##### 1. API 파일 수정 (총 28개)

**`customer` 폴더 (4개)**
- ✅ `home_data.php` - 테이블 전환 (`2012DaeriMember` → `2012DaeriMemberSecure`)
- ✅ `driver_data.php` - 테이블 전환, 암호화 모듈 적용, 복호화 로직 추가
- ✅ `home_data_endorse.php` - 테이블 전환, 암호화 모듈 적용
- ✅ `home_data_endorse_after.php` - 테이블 전환, 암호화 모듈 적용

**`kjDaeri` 폴더 (24개)**
- ✅ `gisaList.php` - 테이블 전환, 암호화 모듈 적용, 주민번호 검색 해시 기반으로 변경
- ✅ `gisaSearch.php` - 테이블 전환, 암호화 모듈 적용, 정렬 기준 변경
- ✅ `endorse.php` - 테이블 전환, 암호화 모듈 적용, 주민번호 해시 로직 변경
- ✅ `endorseBack.php` - 테이블 전환, 암호화 모듈 적용
- ✅ `endorse2.php` - 테이블 전환, 암호화 모듈 적용, 복호화 로직 추가
- ✅ `changeEndorse.php` - 테이블 전환
- ✅ `changeEndorseBack.php` - 테이블 전환, 암호화 모듈 적용
- ✅ `get_endorse_details.php` - 테이블 전환, 암호화 모듈 적용
- ✅ `gisaListExcel.php` - 테이블 전환, 암호화 모듈 적용 (SMSData 조인 포함)
- ✅ `gisaListExcelBack.php` - 테이블 전환, 암호화 모듈 적용
- ✅ `gisaListAdjustment.php` - 테이블 전환, 암호화 모듈 적용
- ✅ `policySearch.php` - 테이블 전환
- ✅ `policyNumDetail.php` - 테이블 전환
- ✅ `dNumList.php` - 테이블 전환
- ✅ `get_DaeriCompany_details.php` - 테이블 전환
- ✅ `endorseCompanySerarch.php` - 테이블 전환
- ✅ `endorseCertiSerarch.php` - 테이블 전환
- ✅ `PolicyNumInsurancePremiumStatistics.php` - 테이블 전환, 암호화 모듈 적용
- ✅ `endoreDateChange.php` - 테이블 전환 (단일 테이블 사용)
- ✅ `updateHaeji.php` - 테이블 전환
- ✅ `updateGisaName.php` - 테이블 전환
- ✅ `updateGisaPhone.php` - 테이블 전환, 암호화 모듈 적용 (`encryptPhone` 사용)
- ✅ `changeProgress.php` - 테이블 전환 (단일 테이블 사용)

##### 2. 주요 변경사항

**테이블 전환**
```php
// 변경 전
FROM `DaeriMember`
FROM `2012DaeriMember`

// 변경 후
FROM `2012DaeriMemberSecure`
```

**암호화 모듈 전환**
```php
// 변경 전
include "./php/encryption.php";
$decrypted = decryptData($row['Jumin']);  // mcrypt 사용

// 변경 후
require_once '../../../api/utils/jumin-secure.php';  // OpenSSL AES-256-GCM
$decryptedJumin = decryptJumin($row['jumin_encrypted']);
```

**필드명 변경**
```php
// 변경 전
SELECT Jumin, Hphone FROM ...

// 변경 후
SELECT jumin_encrypted, hphone_encrypted FROM ...
```

**복호화 및 포맷팅**
```php
// 주민번호 복호화
$jumin = '';
if (!empty($row['jumin_encrypted'])) {
    $decryptedJumin = decryptJumin($row['jumin_encrypted']);
    if ($decryptedJumin) {
        $jumin = $decryptedJumin;  // 하이픈 없는 13자리
        $row['Jumin'] = substr($decryptedJumin, 0, 6) . '-' . substr($decryptedJumin, 6);
    }
}

// 핸드폰 번호 복호화
if (!empty($row['hphone_encrypted'])) {
    $decryptedHphone = decryptPhone($row['hphone_encrypted']);
    if ($decryptedHphone) {
        if (strlen($decryptedHphone) === 11) {
            $row['Hphone'] = substr($decryptedHphone, 0, 3) . '-' . 
                           substr($decryptedHphone, 3, 4) . '-' . 
                           substr($decryptedHphone, 7);
        } elseif (strlen($decryptedHphone) === 10) {
            $row['Hphone'] = substr($decryptedHphone, 0, 3) . '-' . 
                           substr($decryptedHphone, 3, 3) . '-' . 
                           substr($decryptedHphone, 6);
        }
    }
}

// 암호화 필드 제거 (응답에 포함하지 않음)
unset($row['jumin_encrypted'], $row['hphone_encrypted']);
```

**주민번호 검색 로직 변경**
```php
// 변경 전 (SHA-1 해시)
$juminHash = sha1($dNum);

// 변경 후 (SHA-256 해시)
$juminDigits = preg_replace('/[^0-9]/', '', $jumin);
$juminHash = hashJumin($juminDigits);  // SHA-256
```

**정렬 기준 변경**
```php
// 변경 전 (암호화된 데이터로 정렬 불가)
ORDER BY Jumin ASC

// 변경 후
ORDER BY num ASC
```

##### 3. 프론트엔드 호환성 대응

**`driver_data.php` 필드 추가**
```php
// 프론트엔드 호환성을 위해 필드 추가
$row['Jumin'] = substr($decryptedJumin, 0, 6) . '-' . substr($decryptedJumin, 6);
$row['JuminDecrypted'] = $row['Jumin'];  // driverSearch.js에서 사용
$row['Hphone'] = $formattedHphone;
$row['HphoneDecrypted'] = $row['Hphone'];  // driverSearch.js에서 사용
```

**참고**: `pci0327/kj/js/driverSearch.js`에서 `item.JuminDecrypted`, `item.HphoneDecrypted` 필드를 사용하므로 API에서 이 필드를 제공해야 함.

##### 4. 마이그레이션 스크립트

**위치**: `pci0327/api/insurance/migrate-to-secure-table.php`

**주요 기능**
- 웹 브라우저에서 실행 가능
- DRY-RUN 모드 지원 (`dry-run=1`)
- 배치 처리 (기본 1000건, `batch-size` 파라미터 조정 가능)
- 실시간 진행 상황 표시 (프로그레스 바, 통계)
- 자동 암호화 및 해시 생성
- 에러 처리 및 로깅
- 트랜잭션 지원 (배치 단위)
- 마이그레이션 검증 (완료 후 남은 데이터 확인)

**사용법**
```
https://pcikorea.com/api/insurance/migrate-to-secure-table.php
https://pcikorea.com/api/insurance/migrate-to-secure-table.php?dry-run=1
https://pcikorea.com/api/insurance/migrate-to-secure-table.php?batch-size=500
```

##### 5. 암호화 모듈 정보

**위치**: `pci0327/api/utils/jumin-secure.php`

**제공 함수**
- `encryptJumin($jumin)`: 주민번호 암호화 (AES-256-GCM)
- `decryptJumin($encrypted)`: 주민번호 복호화
- `hashJumin($jumin)`: 주민번호 해시 생성 (SHA-256)
- `encryptPhone($phone)`: 핸드폰 번호 암호화 (AES-256-GCM)
- `decryptPhone($encrypted)`: 핸드폰 번호 복호화
- `hashPhone($phone)`: 핸드폰 번호 해시 생성 (SHA-256)

**암호화 알고리즘**
- **방식**: AES-256-GCM (Galois/Counter Mode)
- **키**: 환경 변수 또는 설정 파일에서 로드 (256비트)
- **IV**: 128비트 랜덤 생성
- **Tag**: 128비트 인증 태그
- **저장 형식**: Base64 (IV + Tag + 암호화된 데이터)

**해시 알고리즘**
- **방식**: SHA-256
- **용도**: 검색용 (정확 일치만 가능)
- **형식**: 64자리 16진수 문자열

#### 작업 통계

**수정된 파일**
- 총 28개 파일
- `customer` 폴더: 4개
- `kjDaeri` 폴더: 24개

**주요 변경 패턴**
1. 테이블 참조 변경: `DaeriMember` / `2012DaeriMember` → `2012DaeriMemberSecure`
2. 암호화 모듈 변경: `encryption.php` → `jumin-secure.php`
3. 필드명 변경: `Jumin`, `Hphone` → `jumin_encrypted`, `hphone_encrypted`
4. 복호화 로직 추가: 모든 조회 API에 복호화 및 포맷팅 로직 추가
5. 검색 로직 변경: SHA-1 → SHA-256 해시 기반 검색
6. 정렬 기준 변경: `ORDER BY Jumin` → `ORDER BY num`

#### 해결된 문제

1. **프론트엔드 필드 불일치**
   - **문제**: `driverSearch.js`에서 `JuminDecrypted`, `HphoneDecrypted` 필드 요구
   - **해결**: `driver_data.php`에 해당 필드 추가

2. **주민번호 검색 로직 오류**
   - **문제**: `gisaList.php`에서 SHA-1 해시 사용
   - **해결**: SHA-256 해시 (`hashJumin`)로 변경

3. **정렬 오류**
   - **문제**: 암호화된 데이터로 정렬 시도
   - **해결**: `ORDER BY num ASC`로 변경

4. **주민번호 분리 로직 오류**
   - **문제**: 복호화 후 하이픈이 없는데 `explode('-', $jumin)` 사용
   - **해결**: `substr($jumin, 0, 6)`, `substr($jumin, 6)` 사용

#### 향후 작업 계획

1. **마이그레이션 실행**
   - DRY-RUN 모드로 테스트
   - 실제 마이그레이션 실행
   - 데이터 검증

2. **테스트**
   - 각 API 엔드포인트 기능 테스트
   - 프론트엔드 연동 테스트
   - 데이터 무결성 검증

3. **추가 개선사항**
   - 에러 처리 강화
   - 로깅 개선
   - 성능 최적화

---

### 2026-01-18 - 해지 상태 업데이트 API 개선 및 프론트엔드 연동

#### 작업 시간
- **시작**: 2026-01-18 22:04
- **작업 내용**: 해지 상태 업데이트 엔드포인트 재작성 및 프론트엔드 연동 수정

#### 작업 내용

**1. updateHaeji.php API 재작성**
- **파일**: `pci0327/kj/api/kjDaeri/updateHaeji.php`
- **목적**: 기존 엔드포인트를 새롭게 작성하여 로깅 및 에러 처리 개선
- **주요 개선사항**:
  - 로그 기능 추가 (`logs/updateHaeji-YYYY-MM-DD.log`)
  - 필수 파라미터 검증 강화
  - 기존 데이터 존재 확인 로직 추가
  - 상세한 에러 로깅 및 스택 트레이스 기록
  - 해지 상태 업데이트 로직 개선

**2. 해지 처리 로직 개선**
- **문제점**: 해지 처리 후 다시 조회 시 "정상"으로 표시되는 문제
- **원인**: `push` 값을 업데이트하지 않고 `cancel`만 설정
- **해결**:
  - `push = '2'` (해지) 전송 시: `push = '4'` 유지, `cancel = '42'` 설정 → "해지중" 상태
  - `push = '4'` (정상) 전송 시: `push = '4'` 유지, `cancel = NULL` 설정 → "정상" 상태
  - 프론트엔드 표시 로직: `push = 4` && `cancel = 42` → "해지중" 표시

**3. 프론트엔드 엔드포인트 수정**
- **파일**: `pci0327/kj/js/driverSearch.js`
- **변경사항**:
  - 하드코딩된 URL 제거: `https://kjstation.kr/api/kjDaeri/updateHaeji.php`
  - 상대 경로로 변경: `./api/kjDaeri/updateHaeji.php`
  - 다른 API 호출과 일관성 유지

**4. JavaScript 비교 로직 수정**
- **파일**: `pci0327/kj/js/driverSearch.js`
- **문제점**: 데이터베이스에서 `cancel` 필드가 `int(2)` 타입인데, JavaScript에서 문자열만 비교
- **해결**:
  ```javascript
  // 변경 전
  if (item.cancel === '42')
  
  // 변경 후
  if (item.cancel == 42 || item.cancel === '42')
  ```
- **적용 범위**:
  - 해지중 표시: `cancel == 42 || cancel === '42'`
  - 청약 해지: `cancel == 12 || cancel === '12'`
  - 청약거절: `cancel == 13 || cancel === '13'`

**5. 신규청약 저장 API 수정**
- **파일**: `pci0327/kj/api/kjDaeri/save_endorse_data_encryption.php`
- **문제점**: `SQLSTATE[HY000]: General error: 1364 Field '...' doesn't have a default value` 에러 발생
- **원인**: 
  - `a8b` 필드: 기본값 없이 NOT NULL 제약조건
  - `reasion` 필드: 기본값 없이 NOT NULL 제약조건
  - `InputDay` 필드: 잘못된 날짜 형식 전달 ("배서기준일: YYYY-MM-DD" 형식)
- **해결**:
  1. `a8b` 필드 추가:
     ```php
     INSERT INTO 2012DaeriMemberSecure (
         ...
         etag, a8b, reasion
     ) VALUES (
         ...
         :etag, :a8b, :reasion
     )
     $stmt->bindValue(':a8b', '', PDO::PARAM_STR);
     ```
  2. `reasion` 필드 추가:
     ```php
     $stmt->bindValue(':reasion', '', PDO::PARAM_STR);
     ```
  3. `InputDay` 날짜 형식 수정:
     - 프론트엔드(`home.js`): `saveEndorse` 함수에서 `formattedDate` 변수(YYYY-MM-DD 형식) 직접 전달
     - 변경 전: `document.getElementById('endorseDay').textContent` 사용 → "배서기준일: YYYY-MM-DD" 포함
     - 변경 후: `formattedDate` 변수 직접 사용 → "YYYY-MM-DD" 형식만 전달

**6. 프론트엔드 저장 로직 수정**
- **파일**: `pci0327/kj/js/home.js`
- **수정 내용**: `saveEndorse` 함수에서 날짜 형식 문제 해결
- **변경 사항**: `endorseDay` 엘리먼트의 `textContent` 대신 저장된 `formattedDate` 변수 사용

#### 기술적 세부사항

**해지 상태 처리 흐름**:
1. **정상 → 해지 클릭**:
   - 프론트엔드: `push = '2'` 전송
   - 백엔드: `push = '4'`, `cancel = '42'`, `sangtae = '1'` 저장
   - 결과: "해지중" 상태로 표시

2. **해지중 → 정상 클릭**:
   - 프론트엔드: `push = '4'` 전송
   - 백엔드: `push = '4'`, `cancel = NULL`, `sangtae = '1'` 저장
   - 결과: "정상" 상태로 표시

3. **최종 해지 처리**:
   - `changeEndorse.php`에서 `push = '2'`, `cancel = '42'`, `sangtae = '2'` 설정
   - 결과: "해지" 상태로 표시

**로그 파일 위치**:
- `pci0327/kj/api/kjDaeri/logs/updateHaeji-YYYY-MM-DD.log`
- 요청 시작/종료, POST 데이터, 기존 데이터 확인, 업데이트 결과, 에러 스택 트레이스 기록

#### 테스트 결과

**성공 케이스**:
- ✅ 정상 → 해지 클릭 시 "해지중" 상태로 표시
- ✅ 해지중 → 정상 클릭 시 "정상" 상태로 표시
- ✅ 데이터베이스에 올바른 값 저장 확인
- ✅ 로그 파일에 상세 기록 확인

#### 향후 작업 계획

1. **추가 테스트**
   - 다양한 상태 전환 시나리오 테스트
   - 에러 케이스 처리 확인

2. **다른 API 개선**
   - 유사한 패턴의 API들도 로깅 및 에러 처리 개선
   - 일관된 API 응답 형식 유지

---

## 📋 업무 흐름 (Business Flow)

### 전체 시스템 흐름도

```
로그인 (index.html)
    ↓
대시보드 (dashboard.html)
    ├─ 증권정보 탭 (home.js)
    │   ├─ 증권 목록 조회
    │   ├─ 신규청약 모달 → 배서 등록
    │   ├─ 진행중인 배서 목록
    │   └─ 진행 완료 배서 목록
    │
    ├─ 기사찾기 탭 (driverSearch.js)
    │   ├─ 기사 검색 (이름으로 검색)
    │   ├─ 기사 목록 조회
    │   ├─ 상태 변경 (정상 ↔ 해지)
    │   └─ 해지중 상태 표시
    │
    ├─ 문자리스트 탭 (sms.js)
    │   ├─ 문자 발송 내역 조회
    │   └─ 문자 발송 기능
    │
    └─ 사고 처리 (sago.js)
        └─ 사고 정보 등록 및 관리
```

### 1. 로그인 및 인증 흐름

**파일**: `index.html`, `js/login.js`, `api/customer/login.php`

1. **로그인 페이지 접속**
   - 사용자 ID, 비밀번호 입력
   - `login()` 함수 호출

2. **서버 인증**
   - `2012Costomer` 테이블에서 사용자 조회
   - MD5 해시로 비밀번호 검증
   - 세션 생성 (`$_SESSION['userId']`, `$_SESSION['cNum']`)
   - 쿠키 설정 (`userId`, `cNum`, `company`, `nAme`)

3. **대시보드 이동**
   - `dashboard.html`로 리다이렉트
   - 세션 타임아웃 타이머 시작 (30분)

### 2. 증권정보 탭 업무 흐름

**파일**: `js/home.js`, `api/customer/home_data.php`

#### 2.1 증권 목록 조회
1. **페이지 로드 시**
   - `loadHomeData()` 함수 호출
   - `api/customer/home_data.php` 호출
   - `2012CertiTable` 테이블에서 증권 목록 조회
   - 동적 카드 생성 및 표시

2. **증권 카드 클릭**
   - `viewPolicyDetail()` 함수 호출
   - 증권 상세 정보 모달 표시
   - 해당 증권의 기사 목록 조회

#### 2.2 신규청약 (배서 등록)
1. **신규청약 모달 열기**
   - 증권 카드에서 "신규청약" 버튼 클릭
   - `endorseT()` 함수 호출
   - 모달에 입력 폼 생성

2. **배서 정보 입력**
   - 성명, 주민번호, 핸드폰번호 입력
   - 증권성격 선택 (대리/탁송/대리렌트/탁송렌트)
   - 배서기준일 자동 설정

3. **저장 처리**
   - `saveEndorse()` 함수 호출
   - `api/kjDaeri/save_endorse_data_encryption.php` 호출
   - 주민번호/핸드폰번호 암호화 (AES-256-GCM)
   - 해시 생성 (SHA-256)
   - `2012DaeriMemberSecure` 테이블에 저장
   - `loadHomeData()` 호출하여 목록 갱신

4. **진행중인 배서 목록 갱신**
   - `toDayEndorse()` 함수 호출
   - `api/customer/home_data_endorse.php` 호출
   - `sangtae = '1'` 조건으로 조회
   - 테이블에 표시

#### 2.3 진행 완료 배서 목록
- `toDayEndorseAfter()` 함수 호출
- `api/customer/home_data_endorse_after.php` 호출
- `sangtae = '2'` 조건으로 조회
- 완료된 배서 목록 표시

### 3. 기사찾기 탭 업무 흐름

**파일**: `js/driverSearch.js`, `api/customer/driver_data.php`

#### 3.1 기사 검색
1. **검색 조건 입력**
   - 기사 이름 입력 (선택사항)
   - 검색 버튼 클릭

2. **기사 목록 조회**
   - `driverSearch()` 함수 호출
   - `api/customer/driver_data.php` 호출
   - `2012DaeriMemberSecure` 테이블에서 조회
   - 조건: `push = '4'` (정상) 또는 `push = '1' AND sangtae = '1'` (청약중)
   - 주민번호/핸드폰번호 복호화하여 표시

3. **페이지네이션**
   - 한 페이지에 20개씩 표시
   - 데스크탑/모바일 각각 페이지네이션 제공

#### 3.2 상태 변경 (정상 ↔ 해지)
1. **해지 처리**
   - 상태 드롭다운에서 "해지" 선택
   - `updateHaeji()` 함수 호출
   - 사용자 확인 메시지
   - `api/kjDaeri/updateHaeji.php` 호출
   - `push = '4'`, `cancel = '42'`, `sangtae = '1'` 저장
   - 결과: "해지중" 상태로 표시

2. **정상 처리**
   - 해지중 상태에서 "정상" 선택
   - `push = '4'`, `cancel = NULL`, `sangtae = '1'` 저장
   - 결과: "정상" 상태로 표시

3. **목록 갱신**
   - 저장 성공 시 `driverSearch()` 재호출
   - 최신 상태로 목록 갱신

#### 3.3 상태 표시 로직
- **정상**: `push = 4` && `cancel != 42` → 드롭다운 표시
- **해지중**: `push = 4` && `cancel = 42` → "해지중" 텍스트 표시
- **해지**: `push = 2` → "해지" 텍스트 표시
- **청약**: `push = 1` && `cancel != 12, 13` → "청약" 텍스트 표시

### 4. 문자리스트 탭 업무 흐름

**파일**: `js/sms.js`, `api/customer/sms_data.php`

1. **문자 발송 내역 조회**
   - 페이지 로드 시 `loadSmsData()` 호출
   - `api/customer/sms_data.php` 호출
   - `SMSData` 테이블에서 조회
   - 발송 내역 목록 표시

2. **문자 발송**
   - 발송 대상 선택
   - 문자 내용 입력
   - 발송 API 호출
   - 발송 결과 표시

### 5. 데이터 흐름

#### 5.1 암호화/복호화 흐름
```
입력 (프론트엔드)
    ↓
암호화 (백엔드)
    ├─ 주민번호: encryptJumin() → jumin_encrypted
    ├─ 해시: hashJumin() → jumin_hash
    ├─ 핸드폰: encryptPhone() → hphone_encrypted
    └─ 해시: hashPhone() → hphone_hash
    ↓
저장 (2012DaeriMemberSecure 테이블)
    ↓
조회 시 복호화
    ├─ decryptJumin() → JuminDecrypted
    └─ decryptPhone() → HphoneDecrypted
    ↓
표시 (프론트엔드)
```

#### 5.2 상태 관리 흐름
```
신규청약 등록
    ↓
push = 1, sangtae = 1 (청약중)
    ↓
배서 처리 완료
    ↓
push = 4, sangtae = 2 (정상)
    ↓
해지 신청
    ↓
push = 4, cancel = 42, sangtae = 1 (해지중)
    ↓
해지 처리 완료
    ↓
push = 2, cancel = 42, sangtae = 2 (해지)
```

### 6. 주요 API 엔드포인트

#### 6.1 인증 관련
- `api/customer/login.php` - 로그인
- `api/customer/check_session.php` - 세션 확인

#### 6.2 증권정보 관련
- `api/customer/home_data.php` - 증권 목록 조회
- `api/customer/home_data_endorse.php` - 진행중인 배서 목록
- `api/customer/home_data_endorse_after.php` - 진행 완료 배서 목록
- `api/kjDaeri/save_endorse_data_encryption.php` - 신규청약 저장

#### 6.3 기사찾기 관련
- `api/customer/driver_data.php` - 기사 목록 조회
- `api/kjDaeri/updateHaeji.php` - 해지 상태 업데이트

#### 6.4 문자 관련
- `api/customer/sms_data.php` - 문자 발송 내역 조회

### 7. 주요 테이블 구조

#### 7.1 2012DaeriMemberSecure
- **역할**: 기사 정보 저장 (암호화된 주민번호/핸드폰번호)
- **주요 필드**:
  - `num`: 기사 번호 (PK)
  - `2012DaeriCompanyNum`: 대리운전회사 번호
  - `CertiTableNum`: 증권 테이블 번호
  - `jumin_encrypted`: 암호화된 주민번호
  - `jumin_hash`: 주민번호 해시
  - `hphone_encrypted`: 암호화된 핸드폰번호
  - `hphone_hash`: 핸드폰번호 해시
  - `push`: 상태 (1=청약, 4=정상, 2=해지)
  - `sangtae`: 처리 상태 (1=진행중, 2=완료)
  - `cancel`: 해지 코드 (42=해지중)

#### 7.2 2012CertiTable
- **역할**: 증권 정보 저장
- **주요 필드**: 증권번호, 보험사, 증권명 등

#### 7.3 SMSData
- **역할**: 문자 발송 내역 저장

---

**작성일**: 2026-01-17
**학습자**: AI Assistant
**마지막 업데이트**: 2026-01-18 22:04 (업무 흐름 문서 추가 완료)
**다음 학습 계획**: 추가 테스트 및 다른 API 개선
