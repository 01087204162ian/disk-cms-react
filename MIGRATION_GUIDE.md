# Disk CMS React 마이그레이션 가이드

## 개요

이 프로젝트는 `disk-cms`의 프론트엔드를 React로 마이그레이션한 버전입니다. 백엔드는 기존 `disk-cms` 서버를 그대로 사용하며, 프론트엔드만 React로 재구현되었습니다.

## 프로젝트 구조

```
disk-cms-react-v2/
├── src/
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── Header.tsx      # 상단 헤더
│   │   ├── Sidebar.tsx     # 사이드바 네비게이션
│   │   ├── Layout.tsx      # 메인 레이아웃
│   │   └── ProtectedRoute.tsx  # 인증 보호 라우트
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Login.tsx       # 로그인 페이지
│   │   └── Dashboard.tsx   # 대시보드 페이지
│   ├── store/              # Zustand 상태 관리
│   │   └── authStore.ts    # 인증 상태 관리
│   ├── lib/                # 유틸리티 및 설정
│   │   ├── api.ts          # Axios API 클라이언트
│   │   └── utils.ts        # 유틸리티 함수
│   ├── App.tsx             # 메인 앱 컴포넌트
│   ├── main.tsx            # 진입점
│   └── index.css           # 전역 스타일
├── public/                 # 정적 파일
└── package.json
```

## 시작하기

### 1. 의존성 설치

```bash
cd disk-cms-react-v2
npm install
```

### 2. 환경 변수 설정 (선택사항)

기본적으로 실서버(`https://disk-cms.simg.kr`)와 통신합니다.

로컬 백엔드 서버를 사용하려면 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_API_URL=http://localhost:3000
```

### 3. 백엔드 서버 실행 (로컬 개발 시)

로컬 백엔드를 사용하는 경우, 별도 터미널에서 기존 `disk-cms` 백엔드 서버를 실행하세요:

```bash
cd ../disk-cms
npm run dev
```

백엔드 서버는 `http://localhost:3000`에서 실행되어야 합니다.

**참고**: 실서버를 사용하는 경우 이 단계는 건너뛰어도 됩니다.

### 4. React 개발 서버 실행

```bash
cd disk-cms-react-v2
npm run dev
```

React 앱은 `http://localhost:5173`에서 실행됩니다.

## 주요 기능

### ✅ 완료된 기능

1. **인증 시스템**
   - 로그인/로그아웃
   - 세션 기반 인증
   - 보호된 라우트

2. **레이아웃**
   - 반응형 사이드바
   - 상단 헤더
   - 모바일 지원

3. **대시보드**
   - 기본 대시보드 페이지
   - 통계 카드
   - 최근 활동 표시

### 🚧 진행 중 / 예정

다음 페이지들을 순차적으로 마이그레이션할 예정입니다:

1. **직원 관리**
   - `/staff/employees` - 직원 리스트
   - `/staff/schedule` - 근무일정
   - `/staff/holidays` - 공휴일 관리

2. **보험 상품 관리**
   - `/insurance/pharmacy/*` - 약국배상책임보험
   - `/insurance/field-practice/*` - 현장실습보험
   - `/insurance/kj-driver/*` - KJ대리운전

3. **기타**
   - 티켓 시스템
   - 클레임 관리
   - 보고서

## API 통신

### API 클라이언트 설정

`src/lib/api.ts`에서 Axios 인스턴스를 설정합니다. 모든 API 요청은 이 인스턴스를 통해 이루어집니다.

### 인증

인증은 세션 기반으로 작동합니다:
- 로그인 시 세션 쿠키가 설정됩니다
- 모든 API 요청에 `withCredentials: true`가 설정되어 쿠키가 자동으로 전송됩니다
- 401 응답 시 자동으로 로그인 페이지로 리다이렉트됩니다

### API 엔드포인트

기존 백엔드 API 엔드포인트를 그대로 사용합니다:

- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보
- `GET /api/dashboard` - 대시보드 데이터
- 기타 기존 API 엔드포인트들...

**기본 API 서버**: `https://disk-cms.simg.kr`

로컬 개발 시 `.env` 파일에서 `VITE_API_URL=http://localhost:3000`으로 설정하면 로컬 백엔드를 사용할 수 있습니다.

## 스타일링

### Tailwind CSS

프로젝트는 Tailwind CSS를 사용합니다. 커스텀 색상과 테마는 `src/index.css`에서 정의됩니다.

### 다크 모드

다크 모드 지원이 준비되어 있지만, 현재는 라이트 모드만 활성화되어 있습니다. 필요시 다크 모드 토글을 추가할 수 있습니다.

## 개발 팁

### 새 페이지 추가하기

1. `src/pages/`에 새 페이지 컴포넌트 생성
2. `src/App.tsx`에 라우트 추가
3. `src/components/Sidebar.tsx`에 메뉴 항목 추가 (필요시)

### API 호출 예제

```typescript
import api from '@/lib/api'

// GET 요청
const response = await api.get('/api/endpoint')
const data = response.data

// POST 요청
const response = await api.post('/api/endpoint', {
  key: 'value'
})
```

### 상태 관리

Zustand를 사용하여 전역 상태를 관리합니다. 새 스토어가 필요하면 `src/store/`에 추가하세요.

## 빌드 및 배포

### 개발 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 프로덕션 미리보기

```bash
npm run preview
```

### 배포

빌드된 `dist/` 폴더를 정적 파일 서버에 배포하거나, 백엔드 서버에서 정적 파일로 서빙할 수 있습니다.

## 문제 해결

### CORS 오류

백엔드 서버의 CORS 설정이 올바른지 확인하세요. `disk-cms/server.js`에서 CORS 설정을 확인할 수 있습니다.

### 세션 쿠키 문제

개발 환경에서 쿠키가 제대로 전송되지 않는 경우:
- 브라우저 개발자 도구에서 쿠키 확인
- `withCredentials: true` 설정 확인
- 백엔드 CORS 설정에서 `credentials: true` 확인

## 다음 단계

1. 각 페이지를 순차적으로 마이그레이션
2. 기존 HTML 페이지의 기능을 React 컴포넌트로 변환
3. 폼 검증 및 에러 처리 개선
4. 로딩 상태 및 에러 상태 UI 개선
5. 테스트 코드 작성
