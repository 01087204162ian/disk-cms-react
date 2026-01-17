# JUMIN_ENCRYPTION_KEY 환경 변수 설정 가이드

**대상 서버**: PHP 백엔드 서버 (`pci0327` / `pcikorea.com`)  
**방법**: 환경 변수 파일 (`.env`) 사용 ✅  
**작성일**: 2026-01-14

---

## 📋 목차

1. [서버 정보](#1-서버-정보)
2. [설정 단계](#2-설정-단계)
3. [파일 구조](#3-파일-구조)
4. [설정 확인](#4-설정-확인)
5. [문제 해결](#5-문제-해결)

---

## 1. 서버 정보

### 1.1 서버 접속 정보
- **서버**: `uws8-wpm-079`
- **사용자**: `pci0327`
- **루트 폴더**: `/path/to/www` (pci0327 루트 디렉토리)
- **프로덕션 URL**: `https://pcikorea.com`

### 1.2 폴더 구조
```
/path/to/www/              # pci0327 루트 폴더
├── .env                   # 👈 여기에 생성
├── api/
│   ├── insurance/
│   │   └── kj-driver-*.php
│   └── utils/
│       └── jumin-secure.php
├── config/
├── DatabaseConnection.php
└── ...
```

---

## 2. 설정 단계

### 2.1 서버 접속 및 준비
```bash
ssh pci0327@uws8-wpm-079
cd /path/to/www  # pci0327 루트 폴더로 이동

# PHP 버전 확인 (PHP가 설치되어 있는지 확인)
php -v
```

**참고**: PHP가 설치되어 있지 않은 경우, 시스템 관리자에게 문의하거나 다른 방법을 사용하세요.

### 2.2 암호화 키 생성

**방법 1: PHP를 사용한 키 생성 (권장) ✅**

OpenSSL이 설치되어 있지 않은 경우 PHP로 키를 생성할 수 있습니다:

```bash
# PHP로 키 생성
php -r "echo bin2hex(random_bytes(32));"

# 출력 예시:
# a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890
```

**방법 2: OpenSSL 사용 (설치되어 있는 경우)**

```bash
# OpenSSL을 사용한 256비트 키 생성 (64자리 hex)
openssl rand -hex 32

# 출력 예시:
# a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890
```

**방법 3: PHP 스크립트로 키 생성**

```bash
# 키 생성 PHP 파일 생성
cat > /tmp/generate-key.php << 'EOF'
<?php
// 256비트 (32바이트) 랜덤 키 생성
$key = bin2hex(random_bytes(32));
echo "생성된 암호화 키:\n";
echo $key . "\n";
echo "\n키 길이: " . strlen($key) . "자\n";
EOF

# 스크립트 실행
php /tmp/generate-key.php

# 임시 파일 삭제
rm /tmp/generate-key.php
```

**중요**: 생성된 키를 복사해 두세요. 이 키는 안전한 곳에 백업하세요.

### 2.3 `.env` 파일 생성

#### 방법 1: vi 편집기 사용
```bash
vi .env
```

파일 내용 입력:
```bash
# 주민번호 암호화 키 (256비트 = 64자리 hex)
# 절대 Git에 커밋하지 않음
JUMIN_ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890
```

저장 및 종료:
- `ESC` 키 누르기
- `:wq` 입력 후 `Enter` (저장하고 종료)

#### 방법 2: echo 명령어 사용
```bash
# 키를 직접 입력
echo "JUMIN_ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890" > .env

# 또는 여러 줄로 작성
cat > .env << 'EOF'
# 주민번호 암호화 키 (256비트 = 64자리 hex)
# 절대 Git에 커밋하지 않음
JUMIN_ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890
EOF
```

### 2.4 파일 권한 설정
```bash
# 소유자만 읽기/쓰기 가능하도록 설정 (600)
chmod 600 .env

# 파일 소유자 확인 및 설정 (필요한 경우)
chown pci0327:pci0327 .env
```

### 2.5 `.gitignore` 확인 (Git 저장소가 있는 경우)
```bash
# .gitignore 파일 확인
cat .gitignore | grep -i "\.env"

# .gitignore에 .env가 없으면 추가
if ! grep -q "^\.env$" .gitignore; then
    echo ".env" >> .gitignore
    echo ".env 파일이 .gitignore에 추가되었습니다."
fi
```

---

## 3. 파일 구조

### 3.1 `.env` 파일 위치
```
/path/to/www/.env
```

### 3.2 `.env` 파일 내용
```bash
# 주민번호 암호화 키 (256비트 = 64자리 hex)
# 절대 Git에 커밋하지 않음
JUMIN_ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890
```

**형식**:
- 주석은 `#`으로 시작
- 키=값 형식 (공백 없음)
- 따옴표 불필요 (자동 trim 처리)

### 3.3 PHP 코드에서 읽기
`pci0327/api/utils/jumin-secure.php` 파일에서 자동으로 읽습니다:

```php
// .env 파일에서 로드 (pci0327/.env)
if (file_exists(__DIR__ . '/../../../.env')) {
    $env_file = __DIR__ . '/../../../.env';
    $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // 주석 무시
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        // JUMIN_ENCRYPTION_KEY=값 형식 파싱
        if (strpos($line, 'JUMIN_ENCRYPTION_KEY=') === 0) {
            $encryption_key = trim(substr($line, strlen('JUMIN_ENCRYPTION_KEY=')));
            // 따옴표 제거 (있는 경우)
            $encryption_key = trim($encryption_key, '"\'');
            break;
        }
    }
}
```

**경로 설명**:
- `jumin-secure.php` 위치: `/path/to/www/api/utils/jumin-secure.php`
- `.env` 파일 위치: `/path/to/www/.env`
- 상대 경로: `__DIR__ . '/../../../.env'` (utils → api → www → .env)

---

## 4. 설정 확인

### 4.1 파일 존재 확인
```bash
# .env 파일이 존재하는지 확인
ls -la /path/to/www/.env

# 출력 예시:
# -rw------- 1 pci0327 pci0327 123 Jan 14 12:00 .env
```

### 4.2 파일 권한 확인
```bash
# 파일 권한 확인 (600이어야 함)
stat -c "%a %n" .env
# 출력: 600 .env

# 또는
ls -l .env
# 출력: -rw------- 1 pci0327 pci0327 123 Jan 14 12:00 .env
```

### 4.3 파일 내용 확인 (키는 가리기)
```bash
# 키 값 확인 (보안상 주의)
grep JUMIN_ENCRYPTION_KEY .env

# 출력 예시:
# JUMIN_ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890
```

### 4.4 PHP에서 키 로드 테스트
```bash
# 테스트 PHP 파일 생성
cat > /path/to/www/test-env-key.php << 'EOF'
<?php
$encryption_key = null;

// .env 파일에서 로드
if (file_exists(__DIR__ . '/.env')) {
    $env_file = __DIR__ . '/.env';
    $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        if (strpos($line, 'JUMIN_ENCRYPTION_KEY=') === 0) {
            $encryption_key = trim(substr($line, strlen('JUMIN_ENCRYPTION_KEY=')));
            $encryption_key = trim($encryption_key, '"\'');
            break;
        }
    }
}

if (empty($encryption_key)) {
    echo "❌ 오류: JUMIN_ENCRYPTION_KEY를 찾을 수 없습니다.\n";
    exit(1);
}

if (strlen($encryption_key) !== 64 || !ctype_xdigit($encryption_key)) {
    echo "❌ 오류: 키 형식이 올바르지 않습니다. (64자리 hex 필요)\n";
    echo "현재 키 길이: " . strlen($encryption_key) . "\n";
    exit(1);
}

echo "✅ 성공: JUMIN_ENCRYPTION_KEY가 정상적으로 로드되었습니다.\n";
echo "키 길이: " . strlen($encryption_key) . "자\n";
echo "키 형식: " . (ctype_xdigit($encryption_key) ? '올바름' : '잘못됨') . "\n";
EOF

# 테스트 실행
php /path/to/www/test-env-key.php

# 테스트 파일 삭제 (보안)
rm /path/to/www/test-env-key.php
```

---

## 5. 문제 해결

### 5.1 키를 찾을 수 없는 경우

**오류 메시지**:
```
JUMIN_ENCRYPTION_KEY가 설정되지 않았습니다. 환경 변수 또는 설정 파일을 확인하세요.
```

**해결 방법**:
1. `.env` 파일이 존재하는지 확인:
   ```bash
   ls -la /path/to/www/.env
   ```

2. 파일 경로 확인:
   - `.env` 파일 위치: `/path/to/www/.env`
   - `jumin-secure.php` 위치: `/path/to/www/api/utils/jumin-secure.php`

3. 파일 내용 확인:
   ```bash
   cat /path/to/www/.env
   ```

4. 파일 권한 확인:
   ```bash
   ls -l /path/to/www/.env
   # 권한이 600이 아닌 경우:
   chmod 600 /path/to/www/.env
   ```

### 5.2 키 형식 오류

**오류 메시지**:
```
JUMIN_ENCRYPTION_KEY는 64자리 16진수 문자열이어야 합니다. (256비트)
```

**해결 방법**:
1. 키 길이 확인:
   ```bash
   grep JUMIN_ENCRYPTION_KEY .env | cut -d'=' -f2 | wc -c
   # 출력: 65 (64자 + 줄바꿈)
   ```

2. 키 형식 확인 (16진수만 포함):
   ```bash
   grep JUMIN_ENCRYPTION_KEY .env | cut -d'=' -f2 | grep -E '^[0-9a-fA-F]{64}$'
   ```

3. 새 키 생성 및 재설정:
   ```bash
   # PHP로 새 키 생성
   php -r "echo bin2hex(random_bytes(32));" > /tmp/new_key.txt
   cat /tmp/new_key.txt
   # 새 키를 .env 파일에 적용
   
   # 또는 OpenSSL이 있는 경우:
   # openssl rand -hex 32 > /tmp/new_key.txt
   ```

### 5.3 파일 권한 문제

**오류**: PHP가 `.env` 파일을 읽을 수 없음

**해결 방법**:
```bash
# 파일 권한 확인
ls -l .env

# 소유자만 읽기/쓰기 가능하도록 설정
chmod 600 .env

# 파일 소유자 확인 및 변경 (필요한 경우)
chown pci0327:pci0327 .env
```

### 5.4 경로 문제

**문제**: `jumin-secure.php`에서 `.env` 파일을 찾지 못함

**해결 방법**:
1. 상대 경로 확인:
   - `jumin-secure.php`: `/path/to/www/api/utils/jumin-secure.php`
   - `.env`: `/path/to/www/.env`
   - 상대 경로: `__DIR__ . '/../../../.env'` (utils → api → www → .env)

2. 절대 경로로 변경 (선택):
   ```php
   // 절대 경로 사용
   if (file_exists('/path/to/www/.env')) {
       // ...
   }
   ```

---

## 6. 보안 체크리스트

✅ `.env` 파일이 루트 폴더(`/path/to/www/.env`)에 생성되었는가?  
✅ 파일 권한이 600 (소유자만 읽기/쓰기)로 설정되었는가?  
✅ `.gitignore`에 `.env`가 포함되어 있는가?  
✅ 키가 64자리 16진수 문자열인가?  
✅ 키가 안전한 별도 위치에 백업되었는가?  
✅ 운영/개발 환경별로 다른 키를 사용하는가?

---

**작성일**: 2026-01-14  
**작성자**: 개발팀  
**최종 업데이트**: 2026-01-14
