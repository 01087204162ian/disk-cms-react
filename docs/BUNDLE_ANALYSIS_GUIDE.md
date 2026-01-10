# 번들 분석 결과 확인 가이드

## 개요
`dist/stats.html` 파일은 Vite 빌드 시 생성되는 번들 분석 결과입니다. 
이 파일을 통해 프로젝트의 번들 크기, 의존성, 청크 분할 상태를 시각적으로 확인할 수 있습니다.

## 단계별 진행 방법

### 1단계: 패키지 설치
먼저 `rollup-plugin-visualizer` 패키지를 설치해야 합니다:

```bash
npm install
```

또는 devDependencies에 추가된 패키지만 설치:

```bash
npm install --save-dev rollup-plugin-visualizer
```

### 2단계: 프로덕션 빌드 실행
빌드를 실행하면 자동으로 `dist/stats.html` 파일이 생성됩니다:

```bash
npm run build
```

빌드가 완료되면 `dist/stats.html` 파일이 생성됩니다.

### 3단계: 브라우저에서 열기

#### 방법 1: 직접 파일 열기 (가장 간단)
터미널에서 다음 명령어를 실행:

**macOS/Linux:**
```bash
open dist/stats.html
```

**Windows:**
```bash
start dist/stats.html
```

또는 Finder/파일 탐색기에서 `dist/stats.html` 파일을 직접 더블클릭하여 브라우저에서 열 수 있습니다.

#### 방법 2: 로컬 서버로 열기 (권장)
일부 브라우저에서는 파일 경로 직접 접근 시 CORS 문제가 발생할 수 있습니다.
로컬 서버를 사용하면 더 안전하게 확인할 수 있습니다:

**Python 사용:**
```bash
cd dist
python3 -m http.server 8080
```
그 다음 브라우저에서 `http://localhost:8080/stats.html` 접속

**Node.js http-server 사용:**
```bash
npx http-server dist -p 8080
```
그 다음 브라우저에서 `http://localhost:8080/stats.html` 접속

**Vite preview 사용:**
```bash
npm run preview
```
그 다음 브라우저에서 Vite가 제공하는 URL 접속 후 `/stats.html` 경로 추가

#### 방법 3: VS Code Live Server 확장 사용
VS Code를 사용하는 경우 "Live Server" 확장을 설치한 후:
1. `dist/stats.html` 파일을 우클릭
2. "Open with Live Server" 선택

## 번들 분석 파일 해석

`stats.html` 파일을 열면 다음과 같은 정보를 확인할 수 있습니다:

1. **번들 크기**: 각 모듈과 청크의 크기
2. **트리맵**: 모듈 간 의존성 관계를 트리 형태로 표시
3. **청크 분석**: code splitting이 어떻게 적용되었는지 확인
4. **Gzip/Brotli 압축 크기**: 실제 전송 크기 예상값
5. **모듈 상세 정보**: 각 모듈의 크기와 의존성

## 유용한 팁

- 번들이 큰 모듈을 찾아 최적화 포인트 파악
- 불필요한 의존성 제거 결정
- Dynamic import 적용 위치 결정
- Code splitting 전략 검증

## 문제 해결

**파일이 생성되지 않는 경우:**
- `vite.config.mjs`에 `visualizer` 플러그인이 제대로 설정되었는지 확인
- 빌드 과정에서 에러가 발생하지 않았는지 확인
- `dist` 디렉토리 권한 확인

**브라우저에서 열리지 않는 경우:**
- 방법 2 (로컬 서버) 사용 시도
- 브라우저 개발자 도구 콘솔에서 에러 메시지 확인
