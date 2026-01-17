# 2012DaeriMember 테이블 주민번호(Jumin) 보안 강화 기획서

**작성일**: 2026-01-14  
**대상 테이블**: `2012DaeriMember` → 새 테이블 `2012DaeriMemberSecure`  
**대상 필드**: `Jumin` (주민번호)  
**목적**: 개인정보보호법 준수 및 민감정보 보안 강화  
**전략**: 새 테이블 도입 (모든 필드 포함) → 점진적 전환 → 기존 테이블 사용 중단

---

## 📋 목차

1. [배경 및 목적](#1-배경-및-목적)
2. [현재 상황 분석](#2-현재-상황-분석)
3. [보안 강화 방안](#3-보안-강화-방안)
4. [새 테이블 설계](#4-새-테이블-설계)
5. [구현 계획](#5-구현-계획)
6. [마이그레이션 전략](#6-마이그레이션-전략)
7. [영향도 분석](#7-영향도-분석)
8. [보안 고려사항](#8-보안-고려사항)
9. [테스트 계획](#9-테스트-계획)
10. [롤백 계획](#10-롤백-계획)

---

## 1. 배경 및 목적

### 1.1 배경
- **개인정보보호법** 준수 필요
- 주민번호는 민감정보로 분류되어 보안 강화 필수
- 데이터베이스 유출 시 피해 최소화

### 1.2 목적
- **새 테이블 생성**: `2012DaeriMemberSecure` 테이블에 기존 테이블의 모든 필드 포함
- **주민번호 암호화**: 주민번호만 암호화하여 저장 (AES-256)
- **검색용 해시**: 해시(SHA-256)를 사용하여 빠른 검색 가능
- **완전 전환**: 마이그레이션 후 `2012DaeriMember` 테이블 사용 중단
- **점진적 마이그레이션**: 안정화 후 기존 테이블 완전 폐기

### 1.3 법적 근거
- 개인정보보호법 제3조 (개인정보 보호 원칙)
- 개인정보보호법 제29조 (개인정보 처리방침의 수립 및 공개)
- 개인정보 보호를 위한 기술적·관리적 보호조치 의무

---

## 2. 현재 상황 분석

### 2.1 테이블 구조
```sql
CREATE TABLE `2012DaeriMember` (
  `num` int(11) NOT NULL,
  `Jumin` varchar(15) DEFAULT NULL,  -- 평문 주민번호 저장
  ...
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3;
```

### 2.2 현재 사용 현황

#### 2.2.1 검색 기능
- **위치**: `DriverSearch.tsx`, `EndorseList.tsx`
- **용도**: 주민번호로 기사 검색
- **쿼리 예시**:
  ```sql
  SELECT * FROM 2012DaeriMember WHERE Jumin LIKE '%123456%'
  ```

#### 2.2.2 화면 표시
- 여러 컴포넌트에서 주민번호 표시
- 일부 화면에서 마스킹 처리 (`660327-*******`)

#### 2.2.3 데이터 저장/수정
- 주민번호 입력 후 저장
- 포맷팅: `660327-1234567` 형식으로 저장

### 2.3 현재 문제점
1. **평문 저장**: 데이터베이스에 주민번호가 평문으로 저장됨
2. **검색 가능**: LIKE 쿼리로 주민번호 검색 시 평문 비교
3. **로그 노출**: 에러 로그나 디버그 로그에 주민번호 노출 가능성
4. **백업 위험**: 데이터베이스 백업 파일에 평문 주민번호 포함

---

## 3. 보안 강화 방안

### 3.1 전략: 완전 대체 테이블 + 해시 기반 검색 ✅

**핵심 개념**:
- **새 테이블 생성**: `2012DaeriMemberSecure` (기존 테이블의 모든 필드 + 보안 필드 포함)
- **완전 대체**: 마이그레이션 후 `2012DaeriMember` 테이블 사용 중단
- **주민번호 암호화**: `Jumin` 필드는 암호화하여 `jumin_encrypted`에 저장 (복호화 가능)
- **검색용 해시**: `jumin_hash` 필드에 SHA-256 해시 저장하여 빠른 검색
- **점진적 전환**: 마이그레이션 단계에서만 기존 테이블 참조, 이후 완전 전환
- **페이드 아웃**: 안정화 후 `2012DaeriMember` 테이블 완전 폐기

**장점**:
- ✅ 기존 테이블의 모든 필드 포함으로 완전한 대체 가능
- ✅ 주민번호만 암호화되어 나머지 필드는 그대로 사용
- ✅ 해시 기반 검색으로 빠른 성능 (인덱스 활용)
- ✅ 암호화된 주민번호로 보안 강화
- ✅ 복호화 가능하여 필요한 경우 복원 가능
- ✅ LIKE 검색 불가 문제 해결 (해시로 정확 일치 검색)
- ✅ 기존 테이블 사용 중단으로 명확한 전환 경로

### 3.2 암호화 방식

#### 3.2.1 주민번호 저장: AES-256-GCM 양방향 암호화
- **용도**: 주민번호 저장 (복호화 가능)
- **알고리즘**: AES-256-GCM
- **이유**: 
  - 복호화 가능하여 필요 시 복원 가능
  - GCM 모드: 인증과 암호화 동시 제공, 무결성 검증

#### 3.2.2 검색용 해시: SHA-256 단방향 해시
- **용도**: 빠른 검색 (인덱스 활용)
- **알고리즘**: SHA-256
- **이유**:
  - 단방향 해시이므로 복호화 불가 (보안 강화)
  - 해시 값으로 인덱스 생성 가능 (빠른 검색)
  - 정확 일치 검색만 가능 (보안상 충분)

### 3.3 암호화 키 관리

#### 3.3.1 키 저장 위치

**서버**: PHP 백엔드 서버 (`pci0327` / 프로덕션: `pcikorea.com`)

**방법 1: 환경 변수 파일 (권장) ✅**
- **경로**: `pci0327/.env` (프로덕션 서버의 `/path/to/pci0327/.env`)
- **내용**:
  ```bash
  JUMIN_ENCRYPTION_KEY=your-256-bit-key-here
  ```
- **주의**: `.gitignore`에 포함되어 Git에 커밋되지 않음

**방법 2: PHP 설정 파일**
- **경로**: `pci0327/api/config/encryption.php` (Git 제외)
- **내용**:
  ```php
  <?php
  // 암호화 키 (절대 Git에 포함하지 않음)
  return 'your-256-bit-key-here';
  ```

**방법 3: 서버 환경 변수** (Apache/Nginx 설정)
- Apache: `SetEnv JUMIN_ENCRYPTION_KEY "your-256-bit-key-here"`
- Nginx: `fastcgi_param JUMIN_ENCRYPTION_KEY "your-256-bit-key-here";`
- `.htaccess` 또는 서버 설정 파일에 추가

#### 3.3.2 키 생성 방법

**방법 1: PHP를 사용한 키 생성 (권장) ✅**

OpenSSL이 설치되어 있지 않은 경우:

```bash
# PHP로 256비트 키 생성 (64자리 hex)
php -r "echo bin2hex(random_bytes(32));"

# 출력 예시:
# a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890
```

**방법 2: OpenSSL 사용 (설치되어 있는 경우)**

```bash
# OpenSSL을 사용한 256비트 키 생성
openssl rand -hex 32

# 출력 예시:
# a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890
```

**방법 3: PHP 스크립트로 키 생성**

```bash
# 키 생성 PHP 파일 생성
cat > generate-key.php << 'EOF'
<?php
// 256비트 (32바이트) 랜덤 키 생성
$key = bin2hex(random_bytes(32));
echo "생성된 암호화 키:\n";
echo $key . "\n";
echo "\n키 길이: " . strlen($key) . "자\n";
EOF

# 스크립트 실행
php generate-key.php
```

#### 3.3.3 키 관리 주의사항
- ✅ **운영/개발 환경 키 분리**: 각 환경별로 다른 키 사용
- ✅ **Git 제외**: `.gitignore`에 `.env`, `encryption.php` 포함
- ✅ **권한 제한**: 파일 권한 600 (소유자만 읽기/쓰기)
- ✅ **백업 보관**: 키는 안전한 별도 위치에 백업 저장
- ✅ **키 변경 시**: 재암호화 작업 필요 (별도 계획 수립)

---

## 4. 새 테이블 설계

### 4.1 테이블 구조

**전략**: 기존 `2012DaeriMember` 테이블의 모든 필드를 포함하고, 주민번호만 암호화된 형태로 저장

```sql
CREATE TABLE `2012DaeriMemberSecure` (
  -- 기존 테이블의 모든 필드 포함
  `num` int(11) NOT NULL AUTO_INCREMENT,
  `moCertiNum` int(11) DEFAULT NULL,
  `2012DaeriCompanyNum` int(11) DEFAULT NULL,
  `InsuranceCompany` char(2) NOT NULL DEFAULT '',
  `CertiTableNum` int(11) DEFAULT NULL,
  `Name` varchar(20) DEFAULT NULL,
  -- `Jumin` 필드 제거 (암호화된 형태로 대체)
  `nai` int(2) NOT NULL DEFAULT 0,
  `push` int(2) DEFAULT NULL,
  `etag` char(2) DEFAULT NULL,
  `FirstStart` date DEFAULT NULL,
  `state` int(2) DEFAULT NULL,
  `cancel` int(2) DEFAULT NULL,
  `sangtae` char(2) DEFAULT NULL,
  `Hphone` varchar(15) DEFAULT NULL,
  `InputDay` datetime DEFAULT NULL,
  `OutPutDay` date DEFAULT NULL,
  `EndorsePnum` int(11) DEFAULT NULL,
  `dongbuCerti` varchar(20) DEFAULT NULL,
  `dongbuSelNumber` varchar(10) DEFAULT NULL,
  `dongbusigi` date DEFAULT NULL,
  `dongbujeongi` date DEFAULT NULL,
  `nabang_1` char(2) DEFAULT NULL,
  `ch` char(2) DEFAULT '1',
  `changeCom` int(11) DEFAULT NULL,
  `sPrem` varchar(10) DEFAULT NULL,
  `sago` char(2) DEFAULT '1',
  `p_buho` char(2) NOT NULL DEFAULT '1',
  `a6b` int(11) NOT NULL DEFAULT 0,
  `a7b` int(11) NOT NULL DEFAULT 0,
  `a8b` text NOT NULL,
  `preminum1` varchar(10) DEFAULT NULL,
  `wdate` datetime DEFAULT NULL,
  `endorse_day` date DEFAULT NULL,
  `rate` char(2) DEFAULT NULL,
  `reasion` text NOT NULL,
  `manager` varchar(18) NOT NULL DEFAULT '',
  `progress` char(1) NOT NULL DEFAULT '',
  
  -- 추가: 보안 관련 필드
  `jumin_encrypted` text DEFAULT NULL COMMENT '암호화된 주민번호 (AES-256-GCM)',
  `jumin_hash` char(64) DEFAULT NULL COMMENT '검색용 해시 (SHA-256)',
  
  PRIMARY KEY (`num`),
  UNIQUE KEY `idx_jumin_hash` (`jumin_hash`),
  KEY `idx_2012DaeriCompanyNum` (`2012DaeriCompanyNum`),
  KEY `idx_CertiTableNum` (`CertiTableNum`),
  KEY `idx_InsuranceCompany` (`InsuranceCompany`),
  KEY `idx_dongbuCerti` (`dongbuCerti`),
  KEY `idx_wdate` (`wdate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2 필드 설명

#### 4.2.1 기존 필드 (모두 포함)
- **기존 테이블의 모든 필드**: `num`, `moCertiNum`, `2012DaeriCompanyNum`, `InsuranceCompany`, `CertiTableNum`, `Name`, `nai`, `push`, `etag`, `FirstStart`, `state`, `cancel`, `sangtae`, `Hphone`, `InputDay`, `OutPutDay`, `EndorsePnum`, `dongbuCerti`, `dongbuSelNumber`, `dongbusigi`, `dongbujeongi`, `nabang_1`, `ch`, `changeCom`, `sPrem`, `sago`, `p_buho`, `a6b`, `a7b`, `a8b`, `preminum1`, `wdate`, `endorse_day`, `rate`, `reasion`, `manager`, `progress`
- **`Jumin` 필드 제거**: 평문 주민번호 필드는 제거하고 암호화된 형태로 대체

#### 4.2.2 `jumin_encrypted` (text)
- **역할**: 암호화된 주민번호 저장 (기존 `Jumin` 필드 대체)
- **형식**: Base64 인코딩된 암호화 데이터 (IV + Tag + 암호화된 값)
- **크기**: 약 100-200 바이트 (암호화 후)
- **NULL 허용**: 주민번호가 없는 경우 NULL

#### 4.2.3 `jumin_hash` (char(64))
- **역할**: 검색용 해시 (SHA-256)
- **형식**: 64자리 16진수 문자열 (예: `a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3`)
- **특징**: UNIQUE 제약으로 중복 주민번호 방지 및 빠른 검색
- **NULL 허용**: 주민번호가 없는 경우 NULL

### 4.3 테이블 관계

**전환 전** (마이그레이션 단계):
```
2012DaeriMember (기존 테이블)
    │
    │ 데이터 복사
    ↓
2012DaeriMemberSecure (새 보안 테이블)
    ├─ 모든 필드 복사
    ├─ Jumin → jumin_encrypted (암호화)
    └─ jumin_hash (해시 생성)
```

**전환 후** (안정화 후):
```
2012DaeriMemberSecure (완전 대체 테이블)
    └─ 모든 기능을 새 테이블로 전환
    
2012DaeriMember (사용 중단)
    └─ 백업/롤백 용도로만 보관
```

### 4.4 인덱스 전략

#### 4.4.1 기존 인덱스 (유지)
- `PRIMARY KEY (num)` - 기본 키
- `idx_2012DaeriCompanyNum` - 회사별 조회
- `idx_CertiTableNum` - 증권별 조회
- `idx_InsuranceCompany` - 보험회사별 조회
- `idx_dongbuCerti` - 동부증권번호 조회
- `idx_wdate` - 날짜별 조회

#### 4.4.2 새 인덱스 (추가)
- `idx_jumin_hash` (UNIQUE) - 주민번호 해시 검색
- **용도**: 주민번호 검색 시 사용
- **특징**: UNIQUE로 중복 주민번호 방지
- **성능**: 해시 값으로 정확 일치 검색 (O(1) 복잡도)

---

## 5. 구현 계획

### 5.1 공통 보안 모듈 생성

#### PHP 모듈
**파일**: `pci0327/api/utils/jumin-secure.php`

```php
<?php
/**
 * 주민번호 보안 처리 유틸리티
 * - 암호화 (AES-256-GCM)
 * - 해시 생성 (SHA-256)
 */

// 암호화 키 로드
// 우선순위: 1) 환경 변수 2) .env 파일 3) encryption.php 파일
$encryption_key = null;

// 방법 1: 환경 변수에서 로드
if ($key = getenv('JUMIN_ENCRYPTION_KEY')) {
    $encryption_key = $key;
}
// 방법 2: .env 파일에서 로드 (pci0327/.env)
else if (file_exists(__DIR__ . '/../../../.env')) {
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
// 방법 3: encryption.php 파일에서 로드 (pci0327/api/config/encryption.php)
else if (file_exists(__DIR__ . '/../../config/encryption.php')) {
    $encryption_key = require __DIR__ . '/../../config/encryption.php';
}

// 키가 없으면 오류
if (empty($encryption_key)) {
    throw new Exception('JUMIN_ENCRYPTION_KEY가 설정되지 않았습니다. 환경 변수 또는 설정 파일을 확인하세요.');
}

// 키 길이 검증 (256비트 = 32바이트 = 64자리 hex)
if (strlen($encryption_key) !== 64 || !ctype_xdigit($encryption_key)) {
    throw new Exception('JUMIN_ENCRYPTION_KEY는 64자리 16진수 문자열이어야 합니다. (256비트)');
}

/**
 * 주민번호 암호화 (AES-256-GCM)
 * 
 * @param string $jumin 주민번호 (평문, 13자리 숫자)
 * @return string|null 암호화된 주민번호 (Base64)
 */
function encryptJumin($jumin) {
    global $encryption_key;
    
    if (empty($jumin)) return null;
    
    // 하이픈 제거 및 정규화
    $jumin = preg_replace('/[^0-9]/', '', $jumin);
    if (strlen($jumin) !== 13) {
        throw new Exception('주민번호는 13자리 숫자여야 합니다.');
    }
    
    $iv = random_bytes(16); // 128-bit IV
    $encrypted = openssl_encrypt(
        $jumin,
        'aes-256-gcm',
        $encryption_key,
        OPENSSL_RAW_DATA,
        $iv,
        $tag
    );
    
    if ($encrypted === false) {
        throw new Exception('암호화 실패: ' . openssl_error_string());
    }
    
    // IV (16 bytes) + Tag (16 bytes) + 암호화된 데이터를 Base64로 인코딩
    return base64_encode($iv . $tag . $encrypted);
}

/**
 * 주민번호 복호화 (AES-256-GCM)
 * 
 * @param string $encrypted 암호화된 주민번호 (Base64)
 * @return string|null 복호화된 주민번호 (평문, 13자리 숫자)
 */
function decryptJumin($encrypted) {
    global $encryption_key;
    
    if (empty($encrypted)) return null;
    
    try {
        $data = base64_decode($encrypted, true);
        if ($data === false || strlen($data) < 32) {
            return null;
        }
        
        $iv = substr($data, 0, 16);
        $tag = substr($data, 16, 16);
        $encrypted_data = substr($data, 32);
        
        $decrypted = openssl_decrypt(
            $encrypted_data,
            'aes-256-gcm',
            $encryption_key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
        
        return $decrypted !== false ? $decrypted : null;
    } catch (Exception $e) {
        error_log('주민번호 복호화 오류: ' . $e->getMessage());
        return null;
    }
}

/**
 * 주민번호 해시 생성 (SHA-256)
 * 
 * @param string $jumin 주민번호 (평문, 13자리 숫자)
 * @return string 해시 값 (64자리 16진수)
 */
function hashJumin($jumin) {
    if (empty($jumin)) return null;
    
    // 하이픈 제거 및 정규화
    $jumin = preg_replace('/[^0-9]/', '', $jumin);
    if (strlen($jumin) !== 13) {
        throw new Exception('주민번호는 13자리 숫자여야 합니다.');
    }
    
    // SHA-256 해시 생성
    return hash('sha256', $jumin);
}

/**
 * 주민번호 마스킹 처리 (화면 표시용)
 * 
 * @param string $jumin 주민번호 (평문 또는 암호화된 값)
 * @param bool $isEncrypted 암호화된 값인지 여부
 * @return string 마스킹된 주민번호 (예: 660327-1******)
 */
function maskJumin($jumin, $isEncrypted = false) {
    if (empty($jumin)) return '';
    
    // 암호화된 값이면 복호화
    if ($isEncrypted) {
        $jumin = decryptJumin($jumin);
        if (empty($jumin)) return '';
    }
    
    // 하이픈 제거
    $jumin = preg_replace('/[^0-9]/', '', $jumin);
    
    if (strlen($jumin) < 7) {
        return $jumin;
    }
    
    // 앞 7자리만 표시, 나머지는 마스킹
    return substr($jumin, 0, 7) . '-******';
}
```

### 5.2 API 레벨 적용

#### 5.2.1 저장 시 새 테이블 사용

**파일**: `pci0327/api/insurance/kj-driver-*.php`

**변경 전**:
```php
$jumin = $_POST['jumin'];
$stmt = $pdo->prepare("INSERT INTO 2012DaeriMember (Jumin, Name, Hphone, ...) VALUES (?, ?, ?, ...)");
$stmt->execute([$jumin, $name, $hphone, ...]);
```

**변경 후** (마이그레이션 단계):
```php
require_once __DIR__ . '/../utils/jumin-secure.php';

$jumin = $_POST['jumin'];
$juminDigits = preg_replace('/[^0-9]/', '', $jumin);

// 1. 기존 테이블에 저장 (하위 호환성 - 마이그레이션 단계에서만)
if (USE_OLD_TABLE) {
    $stmt = $pdo->prepare("INSERT INTO 2012DaeriMember (Jumin, Name, Hphone, ...) VALUES (?, ?, ?, ...)");
    $stmt->execute([$jumin, $name, $hphone, ...]);
    $memberNum = $pdo->lastInsertId();
}

// 2. 새 보안 테이블에 저장 (모든 필드 포함)
$encryptedJumin = encryptJumin($juminDigits);
$juminHash = hashJumin($juminDigits);

$secureStmt = $pdo->prepare("
    INSERT INTO 2012DaeriMemberSecure 
    (num, Name, Hphone, ..., jumin_encrypted, jumin_hash) 
    VALUES 
    (?, ?, ?, ..., ?, ?)
");
$secureStmt->execute([
    $memberNum ?? null,  // num 필드 (AUTO_INCREMENT 또는 명시적 지정)
    $name,
    $hphone,
    ...  // 기존 모든 필드
    $encryptedJumin,  // 암호화된 주민번호
    $juminHash        // 해시
]);
```

**전환 완료 후** (기존 테이블 사용 중단):
```php
require_once __DIR__ . '/../utils/jumin-secure.php';

$jumin = $_POST['jumin'];
$juminDigits = preg_replace('/[^0-9]/', '', $jumin);

// 새 보안 테이블에만 저장 (기존 테이블 사용 안 함)
$encryptedJumin = encryptJumin($juminDigits);
$juminHash = hashJumin($juminDigits);

$secureStmt = $pdo->prepare("
    INSERT INTO 2012DaeriMemberSecure 
    (Name, Hphone, ..., jumin_encrypted, jumin_hash) 
    VALUES 
    (?, ?, ..., ?, ?)
");
$secureStmt->execute([
    $name,
    $hphone,
    ...  // 기존 모든 필드
    $encryptedJumin,  // 암호화된 주민번호
    $juminHash        // 해시
]);
```

#### 5.2.2 조회 시 새 테이블 사용

**파일**: `pci0327/api/insurance/kj-driver-list.php`

**변경 전** (기존 테이블):
```php
$sql = "SELECT * FROM 2012DaeriMember WHERE 1=1";
```

**변경 후** (새 테이블):
```php
// 새 보안 테이블에서 조회
$sql = "SELECT * FROM 2012DaeriMemberSecure WHERE 1=1";
```

#### 5.2.3 검색 시 해시 사용

**파일**: `pci0327/api/insurance/kj-driver-list.php`

**변경 전** (LIKE 검색):
```php
if (!empty($jumin)) {
    $sql .= " AND Jumin LIKE :jumin";
    $params[':jumin'] = "%{$jumin}%";
}
```

**변경 후** (해시 검색):
```php
require_once __DIR__ . '/../utils/jumin-secure.php';

if (!empty($jumin)) {
    // 전체 주민번호(13자리)만 검색 가능
    $juminDigits = preg_replace('/[^0-9]/', '', $jumin);
    if (strlen($juminDigits) === 13) {
        $juminHash = hashJumin($juminDigits);
        
        // 해시로 검색
        $sql .= " AND jumin_hash = :jumin_hash";
        $params[':jumin_hash'] = $juminHash;
    } else {
        // 부분 검색은 불가능 (보안상 LIKE 검색 불가)
        // 프론트엔드에서 전체 주민번호 입력 안내
    }
}
```

#### 5.2.4 조회 시 마스킹 처리

**파일**: `pci0327/api/insurance/kj-driver-list.php`

**전환 후** (새 테이블 사용):
```php
require_once __DIR__ . '/../utils/jumin-secure.php';

$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// API 응답에는 마스킹된 주민번호만 전송
foreach ($results as &$row) {
    // jumin_encrypted 필드에서 복호화 후 마스킹
    if (!empty($row['jumin_encrypted'])) {
        $decryptedJumin = decryptJumin($row['jumin_encrypted']);
        $row['Jumin'] = maskJumin($decryptedJumin, false); // 마스킹 처리
        
        // 보안 필드는 응답에서 제거
        unset($row['jumin_encrypted']);
        unset($row['jumin_hash']);
    } else {
        $row['Jumin'] = '';  // 주민번호가 없는 경우
    }
}

echo json_encode(['success' => true, 'data' => $results]);
```

### 5.3 프론트엔드 변경

#### 5.3.1 주민번호 검색 UI 변경

**파일**: `disk-cms-react/src/pages/insurance/DriverSearch.tsx`

**변경 후**:
```typescript
// 전체 주민번호(13자리)만 검색 가능
const handleSearch = async () => {
    const juminDigits = filters.search.replace(/[^0-9]/g, '');
    
    if (filters.searchType === '주민번호' && juminDigits.length !== 13) {
        toast.warning('주민번호 검색은 전체 13자리를 입력해주세요. (예: 6603271234567)');
        return;
    }
    
    // 검색 진행...
};
```

---

## 6. 마이그레이션 전략

### 6.1 단계별 마이그레이션

#### Phase 1: 새 테이블 생성 및 준비 (1일)
- [ ] `2012DaeriMemberSecure` 테이블 생성 (기존 테이블의 모든 필드 포함)
- [ ] 보안 모듈 개발 및 테스트 (`jumin-secure.php`)
- [ ] 테스트 환경에서 검증

#### Phase 2: 신규 데이터 새 테이블 저장 시작 (1일)
- [ ] API 수정 (저장 시 새 테이블만 사용)
- [ ] 조회 API 수정 (새 테이블에서 조회)
- [ ] 신규 데이터는 새 테이블에 저장 (주민번호 암호화)

#### Phase 3: 검색 기능 전환 (1일)
- [ ] 검색 API 수정 (해시 기반 검색)
- [ ] 프론트엔드 검색 UI 변경 (전체 13자리 입력)
- [ ] 사용자 안내 문구 추가

#### Phase 4: 기존 데이터 마이그레이션 (3-5일)
- [ ] 배치 스크립트로 기존 데이터 복사
- [ ] 주민번호 암호화 및 해시 생성
- [ ] 새 테이블에 모든 필드 데이터 저장
- [ ] 마이그레이션 진행 상황 모니터링

#### Phase 5: 완전 전환 및 안정화 (2-3일)
- [ ] 모든 API를 새 테이블로 전환
- [ ] 기존 테이블 사용 코드 제거
- [ ] 모든 기능 정상 동작 확인
- [ ] 성능 테스트
- [ ] 보안 테스트

#### Phase 6: 기존 테이블 폐기 (1일)
- [ ] `2012DaeriMember` 테이블 사용 중단 확인 (모든 API 새 테이블 사용)
- [ ] 데이터베이스 백업 완료 확인
- [ ] 백업 후 테이블 제거 또는 명시적 폐기 처리 (선택)
- [ ] 관련 코드 완전 제거

### 6.2 배치 마이그레이션 스크립트

**파일**: `pci0327/scripts/migrate-to-secure-table.php`

```php
<?php
/**
 * 2012DaeriMember → 2012DaeriMemberSecure 완전 마이그레이션 스크립트
 * 
 * 사용법:
 * php migrate-to-secure-table.php [--dry-run] [--batch-size=1000]
 * 
 * 기능:
 * - 기존 테이블의 모든 레코드를 새 테이블로 복사
 * - 주민번호는 암호화하여 저장 (jumin_encrypted)
 * - 해시 생성하여 저장 (jumin_hash)
 */

require_once __DIR__ . '/../api/config/db_config.php';
require_once __DIR__ . '/../api/utils/jumin-secure.php';

$dryRun = in_array('--dry-run', $argv);
$batchSize = 1000;

echo "=== 2012DaeriMember → 2012DaeriMemberSecure 마이그레이션 시작 ===\n";
echo "Dry Run: " . ($dryRun ? 'YES' : 'NO') . "\n";
echo "Batch Size: {$batchSize}\n\n";

try {
    $pdo = getDbConnection();
    
    // 마이그레이션 대상 확인 (새 테이블에 없는 모든 레코드)
    $totalCount = $pdo->query("
        SELECT COUNT(*) 
        FROM 2012DaeriMember m
        LEFT JOIN 2012DaeriMemberSecure s ON m.num = s.num
        WHERE s.num IS NULL
    ")->fetchColumn();
    
    echo "총 마이그레이션 대상: {$totalCount}건\n\n";
    
    $processed = 0;
    $success = 0;
    $failed = 0;
    $skipped = 0;
    
    $offset = 0;
    
    while (true) {
        // 배치 단위로 조회 (새 테이블에 없는 모든 레코드)
        $stmt = $pdo->prepare("
            SELECT m.* 
            FROM 2012DaeriMember m
            LEFT JOIN 2012DaeriMemberSecure s ON m.num = s.num
            WHERE s.num IS NULL
            ORDER BY m.num
            LIMIT :limit OFFSET :offset
        ");
        $stmt->bindValue(':limit', $batchSize, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($rows)) {
            break;
        }
        
        $pdo->beginTransaction();
        
        foreach ($rows as $row) {
            $memberNum = $row['num'];
            $jumin = $row['Jumin'] ?? null;
            
            try {
                // 주민번호 암호화 및 해시 생성
                $encryptedJumin = null;
                $juminHash = null;
                
                if (!empty($jumin)) {
                    $juminDigits = preg_replace('/[^0-9]/', '', $jumin);
                    if (strlen($juminDigits) === 13) {
                        // 암호화 및 해시 생성
                        $encryptedJumin = encryptJumin($juminDigits);
                        $juminHash = hashJumin($juminDigits);
                    } else {
                        echo "SKIP [num={$memberNum}]: 유효하지 않은 주민번호 ({$jumin})\n";
                        $skipped++;
                        continue;
                    }
                }
                
                if (!$dryRun) {
                    // 기존 테이블의 모든 필드를 새 테이블에 복사
                    // 주민번호는 암호화된 형태로 저장
                    $insertStmt = $pdo->prepare("
                        INSERT INTO 2012DaeriMemberSecure 
                        (
                            num, moCertiNum, 2012DaeriCompanyNum, InsuranceCompany, CertiTableNum,
                            Name, nai, push, etag, FirstStart, state, cancel, sangtae,
                            Hphone, InputDay, OutPutDay, EndorsePnum,
                            dongbuCerti, dongbuSelNumber, dongbusigi, dongbujeongi,
                            nabang_1, ch, changeCom, sPrem, sago, p_buho,
                            a6b, a7b, a8b, preminum1, wdate, endorse_day,
                            rate, reasion, manager, progress,
                            jumin_encrypted, jumin_hash
                        ) 
                        VALUES 
                        (
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                        )
                    ");
                    
                    $insertStmt->execute([
                        $row['num'],
                        $row['moCertiNum'],
                        $row['2012DaeriCompanyNum'],
                        $row['InsuranceCompany'],
                        $row['CertiTableNum'],
                        $row['Name'],
                        $row['nai'],
                        $row['push'],
                        $row['etag'],
                        $row['FirstStart'],
                        $row['state'],
                        $row['cancel'],
                        $row['sangtae'],
                        $row['Hphone'],
                        $row['InputDay'],
                        $row['OutPutDay'],
                        $row['EndorsePnum'],
                        $row['dongbuCerti'],
                        $row['dongbuSelNumber'],
                        $row['dongbusigi'],
                        $row['dongbujeongi'],
                        $row['nabang_1'],
                        $row['ch'],
                        $row['changeCom'],
                        $row['sPrem'],
                        $row['sago'],
                        $row['p_buho'],
                        $row['a6b'],
                        $row['a7b'],
                        $row['a8b'],
                        $row['preminum1'],
                        $row['wdate'],
                        $row['endorse_day'],
                        $row['rate'],
                        $row['reasion'],
                        $row['manager'],
                        $row['progress'],
                        $encryptedJumin,  // 암호화된 주민번호
                        $juminHash        // 해시
                    ]);
                }
                
                $success++;
                $processed++;
                
                if ($processed % 100 === 0) {
                    echo "진행 중... {$processed}/{$totalCount} (성공: {$success}, 실패: {$failed}, 스킵: {$skipped})\n";
                }
                
            } catch (Exception $e) {
                $failed++;
                $processed++;
                echo "ERROR [num={$memberNum}]: {$e->getMessage()}\n";
                
                if (!$dryRun) {
                    $pdo->rollBack();
                    throw $e;
                }
            }
        }
        
        if (!$dryRun) {
            $pdo->commit();
        }
        
        $offset += $batchSize;
        usleep(100000); // 0.1초 대기
    }
    
    echo "\n=== 마이그레이션 완료 ===\n";
    echo "총 처리: {$processed}건\n";
    echo "성공: {$success}건\n";
    echo "실패: {$failed}건\n";
    echo "스킵: {$skipped}건\n";
    
} catch (Exception $e) {
    echo "마이그레이션 실패: {$e->getMessage()}\n";
    exit(1);
}
```

---

## 7. 영향도 분석

### 7.1 기능별 영향도

#### 7.1.1 검색 기능 ⚠️ 중간
- **변경 사항**: LIKE 검색 불가 → 해시 기반 정확 일치 검색
- **대응**: 전체 주민번호(13자리) 입력 강제
- **장점**: 해시 인덱스로 빠른 검색 (O(1))

#### 7.1.2 데이터 저장 ✅ 낮음
- **변경 사항**: 이중 저장 (기존 테이블 + 새 테이블)
- **대응**: API 레벨에서 자동 처리
- **영향**: 저장 시간 약간 증가 (미미)

#### 7.1.3 화면 표시 ✅ 낮음
- **변경 없음**: 마스킹 처리로 동일한 UX 유지

### 7.2 성능 영향

#### 7.2.1 검색 성능 ✅ 개선
- **변경 전**: LIKE 검색 (전체 테이블 스캔)
- **변경 후**: 해시 인덱스 검색 (O(1) 복잡도)
- **결과**: 검색 속도 크게 향상

#### 7.2.2 저장 성능 ⚠️ 약간 저하
- **추가 작업**: 암호화 + 해시 생성 + 이중 저장
- **예상**: 레코드당 2-3ms 추가
- **영향**: 미미한 수준

---

## 8. 보안 고려사항

### 8.1 암호화 키 보안

#### 8.1.1 키 저장 위치
- **서버**: PHP 백엔드 서버 (`pci0327` / 프로덕션: `pcikorea.com`)
- **파일 경로**: 
  - 방법 1: `pci0327/.env` (권장) ✅
  - 방법 2: `pci0327/api/config/encryption.php`
  - 방법 3: 서버 환경 변수 (Apache/Nginx 설정)

#### 8.1.2 보안 규칙
- ✅ 환경 변수 파일로 관리 (`.env` 파일)
- ✅ Git에 절대 커밋하지 않음 (`.gitignore` 확인)
- ✅ 파일 권한 600 설정 (소유자만 읽기/쓰기)
- ✅ 운영/개발 환경 키 분리 (다른 키 사용)
- ✅ 키는 안전한 별도 위치에 백업 저장
- ✅ 키 변경 시 재암호화 계획 수립 필요

### 8.2 로깅 보안
- 로그에 주민번호 포함 금지
- 해시 값도 로그에 포함하지 않음
- 민감정보 자동 제거 함수 사용

### 8.3 데이터베이스 백업
- 백업 파일 접근 권한 제한
- 백업 파일 암호화 고려 (선택)

---

## 9. 테스트 계획

### 9.1 단위 테스트
- 암호화/복호화 함수
- 해시 생성 함수
- 마스킹 함수

### 9.2 통합 테스트
- 데이터 저장 (이중 저장)
- 검색 기능 (해시 기반)
- 마이그레이션 스크립트

### 9.3 성능 테스트
- 검색 성능 비교 (LIKE vs 해시)
- 저장 성능 측정

### 9.4 보안 테스트
- 로그에 민감정보 노출 여부
- API 응답에 평문 주민번호 포함 여부

---

## 10. 롤백 계획

### 10.1 롤백 시나리오
- **시나리오 1**: 새 테이블 오류 발견 (마이그레이션 단계)
  - **조치**: API 롤백 (기존 테이블 사용)
  - **영향**: 새 테이블 데이터는 보존 (백업 용도)

### 10.2 롤백 절차
1. **API 롤백**: 모든 API를 기존 `2012DaeriMember` 테이블 사용으로 롤백
2. **데이터 확인**: 기존 테이블 데이터 정상 확인
3. **새 테이블 유지**: 마이그레이션 재시도를 위해 새 테이블 유지 (선택)
4. **문제 해결 후 재마이그레이션**: 문제 해결 후 다시 마이그레이션 시도

### 10.3 롤백 시 주의사항
- 새 테이블에 저장된 데이터는 그대로 유지 (백업 용도)
- 기존 테이블과 새 테이블 간 데이터 동기화 필요 (마이그레이션 재실행)

---

## 11. 구현 일정 (예상)

### Phase 1: 준비 및 개발 (3일)
- 새 테이블 생성
- 보안 모듈 개발
- 테스트 환경 구축

### Phase 2: API 적용 (2일)
- 저장 API 수정 (이중 저장)
- 검색 API 수정 (해시 검색)

### Phase 3: 프론트엔드 적용 (1일)
- 검색 UI 변경
- 유효성 검증 강화

### Phase 4: 마이그레이션 (3-5일)
- 배치 스크립트 실행
- 데이터 검증

### Phase 5: 안정화 (2일)
- 통합 테스트
- 성능 테스트
- 문제 해결

### Phase 6: 페이드 아웃 (1일)
- 기존 테이블 필드 사용 중단
- 관련 코드 정리

**총 예상 기간**: 12-14일 (약 2-3주)

---

**작성일**: 2026-01-14  
**작성자**: 개발팀  
**최종 업데이트**: 2026-01-14
