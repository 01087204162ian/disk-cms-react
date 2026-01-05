# Disk CMS React V2

보험 운영 플랫폼 CMS의 통합 프로젝트입니다. React 프론트엔드와 Express 백엔드가 하나의 프로젝트로 통합되었습니다.

## 기술 스택

### Frontend
- **React 18** - 최신 React 기능 사용
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 개발 서버 및 빌드
- **Tailwind CSS** - 유틸리티 기반 CSS
- **React Router** - 클라이언트 사이드 라우팅
- **Zustand** - 상태 관리
- **Axios** - HTTP 클라이언트
- **Lucide React** - 아이콘 라이브러리

### Backend
- **Express.js** - Node.js 웹 프레임워크
- **MySQL2** - 데이터베이스
- **Express Session** - 세션 관리
- **Winston** - 로깅
- **Joi** - 데이터 검증

## 시작하기

### 필수 요구사항

- **Node.js**: 16.0.0 이상 (권장: 18.x 또는 20.x)
- **npm**: 7.0.0 이상
- **MySQL** - 데이터베이스 서버

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 다음 변수를 설정하세요:

```env
# 데이터베이스 설정
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database

# 서버 설정
PORT=3000
NODE_ENV=development
TZ=Asia/Seoul

# 세션 설정
SESSION_SECRET=your_session_secret_key

# 이메일 설정 (선택사항)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 개발 모드 실행

#### 옵션 1: 프론트엔드와 백엔드를 함께 실행 (권장)

```bash
npm run dev:all
```

이 명령어는 프론트엔드(Vite)와 백엔드(Express)를 동시에 실행합니다.

#### 옵션 2: 개별 실행

**프론트엔드만 실행** (Vite 개발 서버):
```bash
npm run dev
```
- 프론트엔드: `http://localhost:5173`
- API 요청은 자동으로 `http://localhost:3000`으로 프록시됩니다

**백엔드만 실행**:
```bash
npm run dev:server
```
- 백엔드: `http://localhost:3000`

### 프로덕션 빌드 및 실행

```bash
# 1. 프론트엔드 빌드
npm run build

# 2. 프로덕션 서버 실행
npm start
```

프로덕션 모드에서는 Express 서버가 빌드된 React 앱(`dist/`)을 서빙합니다.

## 프로젝트 구조

```
disk-cms-react-v2/
├── src/                    # React 프론트엔드 소스
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   ├── store/              # Zustand 상태 관리
│   ├── lib/                # 유틸리티 함수 및 API 클라이언트
│   ├── App.tsx             # 메인 앱 컴포넌트
│   └── main.tsx            # 진입점
├── config/                 # 백엔드 설정 파일
│   ├── database.js         # 데이터베이스 설정
│   ├── email.js            # 이메일 설정
│   └── session.js          # 세션 설정
├── routes/                 # Express 라우트
├── services/               # 비즈니스 로직
├── middleware/             # Express 미들웨어
├── utils/                  # 유틸리티 함수
├── server.js               # Express 서버 진입점
├── public/                 # 정적 파일 (개발용)
├── dist/                   # 빌드된 프론트엔드 (프로덕션)
└── package.json
```

## 개발 워크플로우

### 프론트엔드 개발

1. `src/` 폴더에서 React 컴포넌트 작성
2. `npm run dev`로 개발 서버 실행
3. 변경사항이 자동으로 반영됩니다 (HMR)

### 백엔드 개발

1. `routes/`, `services/`, `middleware/` 폴더에서 코드 작성
2. `npm run dev:server`로 서버 실행
3. `nodemon`이 파일 변경을 감지하여 자동 재시작합니다

### 통합 개발

1. `npm run dev:all`로 프론트엔드와 백엔드를 동시에 실행
2. 프론트엔드는 `http://localhost:5173`에서 실행
3. 백엔드는 `http://localhost:3000`에서 실행
4. Vite 프록시가 `/api` 요청을 백엔드로 전달합니다

## API 엔드포인트

모든 API는 `/api` 경로로 시작합니다:

- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보
- `GET /api/dashboard` - 대시보드 데이터
- 기타 API 엔드포인트들...

## 주요 기능

- ✅ 인증 시스템 (로그인/로그아웃)
- ✅ 반응형 레이아웃 (사이드바, 헤더)
- ✅ 대시보드 페이지
- ✅ 보호된 라우트
- ✅ API 클라이언트 설정
- ✅ Express 백엔드 통합
- ✅ 세션 기반 인증

## 테스트

```bash
# 단위 테스트
npm test

# 테스트 감시 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

## 배포

1. 프론트엔드 빌드: `npm run build`
2. 환경 변수 설정 (`.env` 파일)
3. 서버 실행: `npm start`
4. 또는 PM2 사용: `pm2 start server.js --name disk-cms`

## 문제 해결

### 포트 충돌

포트 3000이 이미 사용 중인 경우:
```bash
PORT=3001 npm run dev:server
```

### CORS 오류

개발 환경에서 CORS 오류가 발생하면 `vite.config.ts`의 프록시 설정을 확인하세요.

### 데이터베이스 연결 오류

`.env` 파일의 데이터베이스 설정을 확인하세요.

## 다음 단계

- [ ] 직원 관리 페이지
- [ ] 보험 상품 관리 페이지
- [ ] 약국배상책임보험 페이지
- [ ] 현장실습보험 페이지
- [ ] 클레임 관리 페이지
- [ ] 티켓 시스템 페이지
