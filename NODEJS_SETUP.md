# Node.js 업그레이드 가이드

현재 Node.js 버전이 v14.16.1로 낮아서 Vite가 실행되지 않습니다. Node.js 16.0.0 이상이 필요합니다.

## 방법 1: nvm 설치 및 사용 (권장)

### 1단계: nvm 설치

터미널에서 다음 명령어를 실행하세요:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

### 2단계: 터미널 재시작 또는 설정 파일 로드

설치 후 다음 중 하나를 실행하세요:

**옵션 A: 터미널 재시작** (가장 간단)
- 터미널을 완전히 종료하고 다시 열기

**옵션 B: 설정 파일 수동 로드**
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

### 3단계: nvm 설치 확인

```bash
nvm --version
```

버전 번호가 출력되면 설치 성공입니다.

### 4단계: Node.js 18 설치 및 사용

```bash
# Node.js 18 LTS 설치
nvm install 18

# Node.js 18 사용
nvm use 18

# 버전 확인
node --version  # v18.x.x가 나와야 합니다
```

### 5단계: 프로젝트에서 자동으로 사용

프로젝트 폴더에 `.nvmrc` 파일이 있으므로, 프로젝트 폴더에서 다음 명령어를 실행하면 자동으로 올바른 버전이 사용됩니다:

```bash
cd disk-cms-react-v2
nvm use
```

### 6단계: 기본 버전 설정 (선택사항)

항상 Node.js 18을 기본으로 사용하려면:

```bash
nvm alias default 18
```

## 방법 2: 직접 Node.js 다운로드 (nvm 사용 불가 시)

1. [Node.js 공식 사이트](https://nodejs.org/) 방문
2. LTS 버전 (18.x 또는 20.x) 다운로드
3. 설치 프로그램 실행
4. 터미널 재시작
5. 버전 확인:
   ```bash
   node --version
   ```

## 설치 후 프로젝트 실행

Node.js가 업그레이드되면:

```bash
cd disk-cms-react-v2
npm install
npm run dev
```

## 문제 해결

### nvm 명령어를 찾을 수 없는 경우

`.zshrc` 파일에 다음 내용을 추가하세요:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

파일이 없다면 생성:
```bash
touch ~/.zshrc
nano ~/.zshrc  # 또는 원하는 에디터 사용
```

위 내용을 추가한 후 저장하고 터미널을 재시작하세요.

### 권한 오류가 발생하는 경우

```bash
sudo chown -R $(whoami) ~/.nvm
```

## 참고

- nvm을 사용하면 여러 Node.js 버전을 쉽게 전환할 수 있습니다
- 프로젝트마다 다른 Node.js 버전이 필요한 경우 유용합니다
- `.nvmrc` 파일이 있으면 `nvm use`만 실행하면 됩니다
