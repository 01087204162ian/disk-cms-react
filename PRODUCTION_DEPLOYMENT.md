# 프로덕션 배포 가이드 - 문서 페이지

## ✅ 현재 상태

좋은 소식입니다! 필요한 패키지들이 이미 `package.json`에 포함되어 있습니다:
- ✅ `react-markdown`: ^10.1.0
- ✅ `remark-gfm`: ^4.0.1
- ✅ `rehype-raw`: ^7.0.0
- ✅ `rehype-sanitize`: ^6.0.0

## 📋 프로덕션 배포 단계

### 1. 문서 파일 확인

문서 파일이 `public/docs/pharmacy/README.md`에 있는지 확인하세요:

```bash
ls -la public/docs/pharmacy/README.md
```

파일이 없다면 복사하세요:

```bash
cp docs/pharmacy/README.md public/docs/pharmacy/README.md
```

### 2. 프로덕션 빌드

프로덕션 빌드를 실행하세요:

```bash
cd /Users/simg/development/disk-cms-react
npm run build
```

이 명령어는:
- TypeScript 컴파일 (`tsc`)
- Vite 빌드 (`vite build`)
- `public` 폴더의 모든 파일을 `dist` 폴더로 자동 복사
- React 앱을 최적화된 형태로 빌드

### 3. 빌드 결과 확인

빌드 후 다음 파일들이 생성되는지 확인하세요:

```bash
# 문서 파일이 dist에 복사되었는지 확인
ls -la dist/docs/pharmacy/README.md

# 빌드된 앱 파일 확인
ls -la dist/
```

### 4. 서버 설정 확인

`server.js`를 확인하면 프로덕션 환경에서는 `dist` 폴더를 서빙하도록 설정되어 있습니다:

```javascript
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
}
```

따라서 `dist/docs/pharmacy/README.md` 파일은 자동으로 `/docs/pharmacy/README.md` 경로로 접근 가능합니다.

### 5. 프로덕션 서버 시작

```bash
NODE_ENV=production npm start
```

또는

```bash
npm run start
```

### 6. 접근 확인

프로덕션 서버가 실행되면 다음 URL로 접근할 수 있습니다:

- **문서 페이지**: `https://react.disk-cms.simg.kr/pharmacy/documentation`
- **문서 파일 직접 접근**: `https://react.disk-cms.simg.kr/docs/pharmacy/README.md`

## 🔄 문서 업데이트 프로세스

문서를 업데이트할 때마다:

1. **문서 수정**: `docs/pharmacy/README.md` 파일 수정
2. **public 폴더로 복사**: 
   ```bash
   cp docs/pharmacy/README.md public/docs/pharmacy/README.md
   ```
3. **빌드 재실행**:
   ```bash
   npm run build
   ```
4. **서버 재시작** (필요시):
   ```bash
   npm run start
   ```

## 🚀 자동화 스크립트 (선택사항)

문서 업데이트를 자동화하려면 `package.json`에 스크립트를 추가할 수 있습니다:

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "build:docs": "cp docs/pharmacy/README.md public/docs/pharmacy/README.md && npm run build",
    "deploy": "npm run build:docs && npm run start"
  }
}
```

그러면 다음 명령어로 한 번에 빌드와 배포가 가능합니다:

```bash
npm run build:docs  # 문서 복사 + 빌드
npm run deploy      # 문서 복사 + 빌드 + 서버 시작
```

## 📝 배포 체크리스트

배포 전 확인사항:

- [ ] `public/docs/pharmacy/README.md` 파일 존재 확인
- [ ] `npm run build` 실행 성공 확인
- [ ] `dist/docs/pharmacy/README.md` 파일 생성 확인
- [ ] 프로덕션 서버에서 `/docs/pharmacy/README.md` 접근 가능 확인
- [ ] `/pharmacy/documentation` 페이지 정상 작동 확인

## 🐛 문제 해결

### 문서가 로드되지 않는 경우

1. **빌드 확인**: `dist/docs/pharmacy/README.md` 파일이 있는지 확인
   ```bash
   ls -la dist/docs/pharmacy/README.md
   ```

2. **서버 로그 확인**: 서버가 정적 파일을 올바르게 서빙하는지 확인
   ```bash
   # 서버 로그에서 404 에러 확인
   ```

3. **직접 접근 테스트**: 브라우저에서 직접 파일 접근
   ```
   https://react.disk-cms.simg.kr/docs/pharmacy/README.md
   ```

4. **캐시 문제**: 브라우저 캐시를 지우고 다시 시도

### 빌드 오류가 발생하는 경우

1. **의존성 확인**: 모든 패키지가 설치되었는지 확인
   ```bash
   npm install
   ```

2. **TypeScript 오류 확인**: 타입 오류가 있는지 확인
   ```bash
   npm run build
   ```

3. **Vite 설정 확인**: `vite.config.ts` 파일 확인

## 📌 참고사항

- Vite는 기본적으로 `public` 폴더의 모든 파일을 빌드 시 `dist` 폴더로 복사합니다
- `public` 폴더의 파일은 빌드 후에도 동일한 경로 구조를 유지합니다
- 프로덕션 환경에서는 `dist` 폴더가 루트로 서빙되므로 `/docs/pharmacy/README.md`로 접근 가능합니다

## 🔗 관련 파일

- 문서 컴포넌트: `src/pages/pharmacy/Documentation.tsx`
- 라우트 설정: `src/App.tsx`
- 서버 설정: `server.js`
- 문서 파일: `docs/pharmacy/README.md` → `public/docs/pharmacy/README.md` → `dist/docs/pharmacy/README.md`
