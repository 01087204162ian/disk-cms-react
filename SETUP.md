# Disk CMS React V2 설정 가이드

## 프로젝트 통합 완료

`disk-cms`의 서버 관련 파일들이 `disk-cms-react-v2`로 성공적으로 복사되었습니다. 이제 하나의 프로젝트에서 프론트엔드와 백엔드를 모두 관리할 수 있습니다.

## 복사된 파일들

- ✅ `server.js` - Express 서버 메인 파일
- ✅ `config/` - 데이터베이스, 이메일, 세션 설정
- ✅ `routes/` - API 라우트
- ✅ `services/` - 비즈니스 로직
- ✅ `middleware/` - Express 미들웨어
- ✅ `utils/` - 유틸리티 함수
- ✅ `jest.config.js` - 테스트 설정

## 다음 단계

### 1. 의존성 설치

```bash
cd disk-cms-react-v2
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 필요한 설정을 추가하세요:

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
SESSION_SECRET=your_random_secret_key_here

# 이메일 설정 (선택사항)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 3. 개발 서버 실행

#### 옵션 A: 프론트엔드와 백엔드를 함께 실행 (권장)

```bash
npm run dev:all
```

이 명령어는 다음을 실행합니다:
- 프론트엔드: `http://localhost:5173` (Vite)
- 백엔드: `http://localhost:3000` (Express)

#### 옵션 B: 개별 실행

**프론트엔드만**:
```bash
npm run dev
```

**백엔드만**:
```bash
npm run dev:server
```

### 4. 프로덕션 빌드 및 실행

```bash
# 1. 프론트엔드 빌드
npm run build

# 2. 프로덕션 서버 실행
npm start
```

## 프로젝트 구조

```
disk-cms-react-v2/
├── src/                    # React 프론트엔드
│   ├── components/         # React 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   ├── store/              # Zustand 상태 관리
│   └── lib/                # 유틸리티
├── config/                 # 백엔드 설정
├── routes/                 # Express 라우트
├── services/               # 비즈니스 로직
├── middleware/             # Express 미들웨어
├── utils/                  # 유틸리티
├── server.js               # Express 서버
├── dist/                   # 빌드된 프론트엔드 (프로덕션)
└── package.json
```

## 개발 워크플로우

### 프론트엔드 개발
- `src/` 폴더에서 React 컴포넌트 작성
- `npm run dev`로 개발 서버 실행
- Hot Module Replacement (HMR) 지원

### 백엔드 개발
- `routes/`, `services/` 폴더에서 코드 작성
- `npm run dev:server`로 서버 실행
- `nodemon`이 자동 재시작

### 통합 개발
- `npm run dev:all`로 프론트엔드와 백엔드 동시 실행
- Vite 프록시가 `/api` 요청을 백엔드로 전달

## 주요 변경사항

1. **프로덕션 모드**: Express 서버가 `dist/` 폴더의 React 빌드 결과물을 서빙
2. **SPA 라우팅**: React Router를 위한 SPA 라우팅 지원
3. **개발 프록시**: Vite가 `/api` 요청을 로컬 백엔드로 프록시

## 문제 해결

### 포트 충돌
포트 3000이 사용 중인 경우:
```bash
PORT=3001 npm run dev:server
```

### 데이터베이스 연결 오류
`.env` 파일의 데이터베이스 설정을 확인하세요.

### 모듈 오류
백엔드 파일들은 CommonJS를 사용하므로 `require()`를 사용합니다.

## 참고

- 프론트엔드는 TypeScript + ES Modules 사용
- 백엔드는 JavaScript + CommonJS 사용
- 프로덕션 빌드 후 Express가 React 앱을 서빙합니다
