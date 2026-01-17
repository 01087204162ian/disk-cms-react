# 2012DaeriMember 테이블 주민번호(Jumin) 암호화 기획서

**작성일**: 2026-01-14  
**대상 테이블**: `2012DaeriMember`  
**대상 필드**: `Jumin` (주민번호)  
**목적**: 개인정보보호법 준수 및 민감정보 보안 강화//

---

## 📋 목차

1. [배경 및 목적](#1-배경-및-목적)
2. [현재 상황 분석](#2-현재-상황-분석)
3. [암호화 방안](#3-암호화-방안)
4. [구현 계획](#4-구현-계획)
5. [마이그레이션 전략](#5-마이그레이션-전략)
6. [영향도 분석](#6-영향도-분석)
7. [보안 고려사항](#7-보안-고려사항)
8. [테스트 계획](#8-테스트-계획)
9. [롤백 계획](#9-롤백-계획)

---

## 1. 배경 및 목적

### 1.1 배경
- **개인정보보호법** 준수 필요
- 주민번호는 민감정보로 분류되어 보안 강화 필수
- 데이터베이스 유출 시 피해 최소화

### 1.2 목적
- 주민번호를 암호화하여 저장
- 필요 시 복호화하여 사용 가능 (검색, 조회 등)
- 기존 기능 유지하면서 보안 강화

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
  `Jumin` varchar(15) DEFAULT NULL,  -- 암호화 대상 필드
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
- **위치**: 여러 컴포넌트에서 주민번호 표시
- **처리**: 일부 화면에서 마스킹 처리 (`660327-*******`)
- **파일**:
  - `DriverSearch.tsx` - 기사 찾기
  - `EndorseList.tsx` - 배서 리스트
  - `PolicyDetailModal.tsx` - 증권 상세
  - `CompanyDetailModal.tsx` - 업체 상세
  - `MemberListModal.tsx` - 기사 리스트
  - `SettlementModal.tsx` - 정산 모달 (마스킹 처리됨)

#### 2.2.3 데이터 저장/수정
- **위치**: `AddCompanyModal.tsx`, `EndorseModal.tsx`
- **처리**: 주민번호 입력 후 저장
- **포맷팅**: `660327-1234567` 형식으로 저장

#### 2.2.4 엑셀 다운로드
- **위치**: `PolicySearch.tsx`, `SettlementModal.tsx`
- **처리**: 엑셀 파일에 주민번호 포함 (마스킹 필요)

#### 2.2.5 주민번호 검증
- **위치**: `AddCompanyModal.tsx`
- **처리**: 주민번호로 기존 회사 중복 확인
- **API**: `/api/insurance/kj-company/check-jumin`

### 2.3 현재 문제점
1. **평문 저장**: 데이터베이스에 주민번호가 평문으로 저장됨
2. **검색 가능**: LIKE 쿼리로 주민번호 검색 시 평문 비교
3. **로그 노출**: 에러 로그나 디버그 로그에 주민번호 노출 가능성
4. **백업 위험**: 데이터베이스 백업 파일에 평문 주민번호 포함

---

## 3. 암호화 방안

### 3.1 암호화 방식 선택

#### 옵션 1: AES-256 양방향 암호화 (권장) ✅
- **장점**:
  - 복호화 가능하여 검색 기능 유지 가능
  - 기존 기능 영향 최소화
  - 표준 암호화 알고리즘 (AES-256-CBC 또는 AES-256-GCM)
- **단점**:
  - LIKE 검색 불가능 (전체 일치 검색만 가능)
  - 암호화 키 관리 필요
- **결정**: ✅ **옵션 1 선택** (검색 기능 유지 필요)

#### 옵션 2: 단방향 해시 (SHA-256)
- **장점**: 복호화 불가능, 보안 강화
- **단점**: 검색 기능 불가능, 기존 기능 대폭 수정 필요
- **결정**: ❌ 검색 기능 때문에 사용 불가

#### 옵션 3: MySQL 암호화 함수 (AES_ENCRYPT)
- **장점**: 데이터베이스 레벨에서 암호화, 간단한 구현
- **단점**: 
  - 암호화 키가 SQL 쿼리에 노출 가능
  - 애플리케이션 레벨 암호화보다 보안 약함
- **결정**: ❌ 보안 문제로 사용 불가

### 3.2 암호화 알고리즘

**선택**: AES-256-GCM (Galois/Counter Mode)
- **이유**:
  - AES-256: 강력한 암호화 강도
  - GCM 모드: 인증과 암호화 동시 제공, 무결성 검증
  - 안전한 Nonce 사용

**대안**: AES-256-CBC
- CBC 모드도 사용 가능하지만 GCM이 더 안전함

### 3.3 암호화 키 관리

#### 3.3.1 키 저장 위치
- **옵션 1**: 환경 변수 (권장) ✅
  ```php
  // .env 파일 (Git에 포함하지 않음)
  ENCRYPTION_KEY=your-256-bit-key-here
  ```
- **옵션 2**: 별도 설정 파일 (외부 파일)
  ```php
  // config/encryption.php (Git에 포함하지 않음)
  $encryption_key = 'your-256-bit-key-here';
  ```
- **옵션 3**: 키 관리 시스템 (KMS) - 장기적으로 고려

#### 3.3.2 키 생성 방법
```bash
# OpenSSL을 사용한 256비트 키 생성
openssl rand -hex 32
```

#### 3.3.3 키 로테이션 정책
- **초기**: 암호화 키 1개 사용
- **향후**: 키 로테이션 기능 추가 고려
  - 새 키로 암호화, 기존 키로 복호화 (양방향 지원)
  - 마이그레이션 완료 후 기존 키 제거

### 3.4 데이터베이스 스키마 변경

#### 변경 전
```sql
Jumin varchar(15) DEFAULT NULL
```

#### 변경 후
```sql
Jumin text DEFAULT NULL  -- 암호화된 값은 더 길 수 있음 (Base64 인코딩)
-- 또는
Jumin varchar(255) DEFAULT NULL  -- 충분한 길이 확보
```

**권장**: `text` 타입으로 변경 (암호화된 값 + IV + Tag 포함)

---

## 4. 구현 계획

### 4.1 암호화 라이브러리/함수

#### PHP (백엔드)
```php
// 암호화 함수 예시 (AES-256-GCM)
function encryptJumin($jumin, $key) {
    if (empty($jumin)) return null;
    
    $iv = random_bytes(16); // 128-bit IV
    $encrypted = openssl_encrypt(
        $jumin,
        'aes-256-gcm',
        $key,
        OPENSSL_RAW_DATA,
        $iv,
        $tag
    );
    
    // IV + Tag + 암호화된 데이터를 Base64로 인코딩
    return base64_encode($iv . $tag . $encrypted);
}

// 복호화 함수 예시
function decryptJumin($encrypted, $key) {
    if (empty($encrypted)) return null;
    
    $data = base64_decode($encrypted);
    $iv = substr($data, 0, 16);
    $tag = substr($data, 16, 16);
    $encrypted_data = substr($data, 32);
    
    $decrypted = openssl_decrypt(
        $encrypted_data,
        'aes-256-gcm',
        $key,
        OPENSSL_RAW_DATA,
        $iv,
        $tag
    );
    
    return $decrypted;
}
```

#### Node.js (프록시 레이어 - 필요 시)
```javascript
const crypto = require('crypto');

function encryptJumin(jumin, key) {
    if (!jumin) return null;
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
    
    let encrypted = cipher.update(jumin, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();
    
    // IV + Tag + 암호화된 데이터
    return Buffer.concat([iv, tag, Buffer.from(encrypted, 'base64')]).toString('base64');
}

function decryptJumin(encrypted, key) {
    if (!encrypted) return null;
    
    const data = Buffer.from(encrypted, 'base64');
    const iv = data.slice(0, 16);
    const tag = data.slice(16, 32);
    const encrypted_data = data.slice(32);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted_data, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}
```

### 4.2 공통 암호화 모듈 생성

#### PHP 모듈
**파일**: `pci0327/api/utils/jumin-encryption.php`
```php
<?php
/**
 * 주민번호 암호화/복호화 유틸리티
 */

// 암호화 키 로드 (환경 변수 또는 설정 파일에서)
$encryption_key = getenv('JUMIN_ENCRYPTION_KEY') ?: require __DIR__ . '/../../config/encryption.php';

/**
 * 주민번호 암호화
 * 
 * @param string $jumin 주민번호 (평문)
 * @return string|null 암호화된 주민번호 (Base64)
 */
function encryptJumin($jumin) {
    global $encryption_key;
    
    if (empty($jumin)) return null;
    
    // 하이픈 제거 (암호화 전 정규화)
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
 * 주민번호 복호화
 * 
 * @param string $encrypted 암호화된 주민번호 (Base64)
 * @return string|null 복호화된 주민번호 (평문)
 */
function decryptJumin($encrypted) {
    global $encryption_key;
    
    if (empty($encrypted)) return null;
    
    try {
        $data = base64_decode($encrypted, true);
        if ($data === false) {
            return null; // 유효하지 않은 Base64
        }
        
        if (strlen($data) < 32) {
            return null; // IV (16) + Tag (16) 최소 길이
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
        
        if ($decrypted === false) {
            // 복호화 실패 (기존 평문 데이터일 수 있음)
            return null;
        }
        
        return $decrypted;
    } catch (Exception $e) {
        error_log('주민번호 복호화 오류: ' . $e->getMessage());
        return null;
    }
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
        return $jumin; // 유효하지 않은 주민번호
    }
    
    // 앞 7자리만 표시, 나머지는 마스킹
    return substr($jumin, 0, 7) . '-******';
}

/**
 * 주민번호 검색을 위한 암호화
 * 
 * @param string $searchKeyword 검색 키워드 (주민번호 일부)
 * @return array 암호화된 검색 조건 배열
 */
function encryptJuminForSearch($searchKeyword) {
    // 전체 주민번호 검색만 지원 (LIKE 검색 불가능)
    // 검색 키워드를 정규화
    $searchKeyword = preg_replace('/[^0-9]/', '', $searchKeyword);
    
    if (strlen($searchKeyword) !== 13) {
        // 전체 주민번호가 아니면 검색 불가
        return null;
    }
    
    // 전체 주민번호를 암호화하여 정확 일치 검색
    $encrypted = encryptJumin($searchKeyword);
    return $encrypted;
}
```

### 4.3 API 레벨 적용

#### 4.3.1 저장 시 암호화
**파일**: `pci0327/api/insurance/kj-driver-*.php`

**변경 전**:
```php
$jumin = $_POST['jumin'];
$stmt = $pdo->prepare("INSERT INTO 2012DaeriMember (Jumin, ...) VALUES (?, ...)");
$stmt->execute([$jumin, ...]);
```

**변경 후**:
```php
require_once __DIR__ . '/../utils/jumin-encryption.php';

$jumin = $_POST['jumin'];
$encryptedJumin = encryptJumin($jumin); // 암호화
$stmt = $pdo->prepare("INSERT INTO 2012DaeriMember (Jumin, ...) VALUES (?, ...)");
$stmt->execute([$encryptedJumin, ...]);
```

#### 4.3.2 조회 시 복호화 (필요한 경우만)
**파일**: `pci0327/api/insurance/kj-driver-list.php`

**변경 전**:
```php
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['success' => true, 'data' => $results]);
```

**변경 후**:
```php
require_once __DIR__ . '/../utils/jumin-encryption.php';

$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 복호화 필요 시에만 복호화 (검색 기능 등)
// 화면 표시용이면 마스킹 처리만
foreach ($results as &$row) {
    if (!empty($row['Jumin'])) {
        // API 응답에는 마스킹된 주민번호만 전송 (보안)
        $row['Jumin'] = maskJumin($row['Jumin'], true); // 암호화된 값에서 마스킹
        // 또는 복호화 후 마스킹
        // $row['Jumin'] = maskJumin(decryptJumin($row['Jumin']), false);
    }
}

echo json_encode(['success' => true, 'data' => $results]);
```

#### 4.3.3 검색 기능 변경
**파일**: `pci0327/api/insurance/kj-driver-list.php`

**변경 전** (LIKE 검색):
```php
if (!empty($jumin)) {
    $sql .= " AND Jumin LIKE :jumin";
    $params[':jumin'] = "%{$jumin}%";
}
```

**변경 후** (정확 일치 검색만):
```php
require_once __DIR__ . '/../utils/jumin-encryption.php';

if (!empty($jumin)) {
    // 전체 주민번호(13자리)만 검색 가능
    $juminDigits = preg_replace('/[^0-9]/', '', $jumin);
    if (strlen($juminDigits) === 13) {
        $encryptedJumin = encryptJuminForSearch($juminDigits);
        if ($encryptedJumin) {
            $sql .= " AND Jumin = :jumin";
            $params[':jumin'] = $encryptedJumin;
        }
    } else {
        // 부분 검색은 불가능 (보안상 LIKE 검색 불가)
        // 프론트엔드에서 전체 주민번호 입력 안내
    }
}
```

### 4.4 프론트엔드 변경

#### 4.4.1 주민번호 표시 (마스킹)
**파일**: `disk-cms-react/src/pages/insurance/DriverSearch.tsx`

**변경 전**:
```typescript
cell: (row: Driver) => row.Jumin || ''
```

**변경 후**:
```typescript
cell: (row: Driver) => {
    const jumin = row.Jumin || '';
    // 서버에서 이미 마스킹된 값이 옴 (API 응답에서 마스킹 처리)
    // 또는 클라이언트에서 마스킹
    return maskJumin(jumin); // 660327-1******
}

// 마스킹 함수
function maskJumin(jumin: string): string {
    if (!jumin) return '';
    const digits = jumin.replace(/[^0-9]/g, '');
    if (digits.length < 7) return jumin;
    return `${digits.substring(0, 7)}-******`;
}
```

#### 4.4.2 주민번호 검색 기능 변경
**파일**: `disk-cms-react/src/pages/insurance/DriverSearch.tsx`

**변경 전**:
```typescript
// 부분 검색 가능
params.jumin = filters.search; // "660327" 검색 가능
```

**변경 후**:
```typescript
// 전체 주민번호(13자리)만 검색 가능
const juminDigits = filters.search.replace(/[^0-9]/g, '');
if (juminDigits.length === 13) {
    params.jumin = juminDigits; // 전체 주민번호만 검색
} else {
    // 부분 검색 불가 안내
    toast.warning('주민번호 검색은 전체 13자리를 입력해주세요.');
    return;
}
```

#### 4.4.3 주민번호 입력 유효성 검증 강화
**파일**: `disk-cms-react/src/pages/insurance/components/AddCompanyModal.tsx`

**변경 후**:
```typescript
// 주민번호 검증 강화
const handleJuminKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    
    const juminValue = jumin.trim();
    const juminDigits = juminValue.replace(/[^0-9]/g, '');
    
    // 13자리 검증
    if (juminDigits.length !== 13) {
        toast.error('주민번호는 13자리 숫자여야 합니다. 예: 660327-1069017');
        return;
    }
    
    // 서버 검증 진행...
}
```

### 4.5 로깅 보안

#### 4.5.1 로그에서 주민번호 제거
**파일**: `pci0327/api/utils/logging.php`

```php
/**
 * 로그에서 민감정보 제거
 */
function sanitizeLogData($data) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            if (strtolower($key) === 'jumin' || strtolower($key) === 'juminno') {
                $data[$key] = '***REDACTED***';
            } else {
                $data[$key] = sanitizeLogData($value);
            }
        }
    }
    return $data;
}

// 로그 기록 시
error_log(json_encode(sanitizeLogData($logData)));
```

---

## 5. 마이그레이션 전략

### 5.1 단계별 마이그레이션

#### Phase 1: 준비 단계 (1일)
- [ ] 암호화 키 생성 및 환경 변수 설정
- [ ] 암호화 모듈 개발 및 테스트
- [ ] 테스트 환경에서 검증

#### Phase 2: 신규 데이터 암호화 (1일)
- [ ] API 수정 (저장 시 암호화)
- [ ] 신규 데이터만 암호화하여 저장
- [ ] 기존 데이터는 평문 유지 (하이브리드)

#### Phase 3: 기존 데이터 암호화 (2-3일)
- [ ] 배치 스크립트로 기존 데이터 암호화
- [ ] 암호화 진행 상황 모니터링
- [ ] 검증 (암호화 → 복호화 → 원본 비교)

#### Phase 4: 검색 기능 변경 (1일)
- [ ] 검색 API 수정 (정확 일치만)
- [ ] 프론트엔드 검색 UI 변경
- [ ] 사용자 안내 문구 추가

#### Phase 5: 화면 표시 변경 (1일)
- [ ] API 응답에 마스킹된 주민번호 포함
- [ ] 프론트엔드 마스킹 로직 제거 (서버에서 처리)
- [ ] 테스트 및 검증

### 5.2 배치 마이그레이션 스크립트

**파일**: `pci0327/scripts/migrate-jumin-encryption.php`

```php
<?php
/**
 * 주민번호 암호화 마이그레이션 스크립트
 * 
 * 사용법:
 * php migrate-jumin-encryption.php [--dry-run] [--batch-size=1000]
 */

require_once __DIR__ . '/../api/config/db_config.php';
require_once __DIR__ . '/../api/utils/jumin-encryption.php';

$dryRun = in_array('--dry-run', $argv);
$batchSize = 1000;

// 배치 크기 파라미터 파싱
foreach ($argv as $arg) {
    if (strpos($arg, '--batch-size=') === 0) {
        $batchSize = (int)substr($arg, strlen('--batch-size='));
    }
}

echo "=== 주민번호 암호화 마이그레이션 시작 ===\n";
echo "Dry Run: " . ($dryRun ? 'YES' : 'NO') . "\n";
echo "Batch Size: {$batchSize}\n\n";

try {
    $pdo = getDbConnection();
    
    // 암호화되지 않은 데이터 개수 확인
    $totalCount = $pdo->query("SELECT COUNT(*) FROM 2012DaeriMember WHERE Jumin IS NOT NULL AND Jumin != ''")->fetchColumn();
    echo "총 암호화 대상: {$totalCount}건\n\n";
    
    $processed = 0;
    $success = 0;
    $failed = 0;
    $skipped = 0;
    
    $offset = 0;
    
    while (true) {
        // 배치 단위로 조회
        $stmt = $pdo->prepare("
            SELECT num, Jumin 
            FROM 2012DaeriMember 
            WHERE Jumin IS NOT NULL 
            AND Jumin != ''
            AND LENGTH(Jumin) <= 15  -- 암호화되지 않은 데이터 (평문은 15자 이하)
            ORDER BY num
            LIMIT :limit OFFSET :offset
        ");
        $stmt->bindValue(':limit', $batchSize, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($rows)) {
            break; // 더 이상 처리할 데이터 없음
        }
        
        $pdo->beginTransaction();
        
        foreach ($rows as $row) {
            $num = $row['num'];
            $jumin = $row['Jumin'];
            
            try {
                // 이미 암호화된 데이터인지 확인 (Base64 형식인지 체크)
                if (base64_decode($jumin, true) !== false && strlen($jumin) > 20) {
                    // 이미 암호화된 것으로 판단 (스킵)
                    $skipped++;
                    continue;
                }
                
                // 평문 주민번호 정규화
                $juminDigits = preg_replace('/[^0-9]/', '', $jumin);
                if (strlen($juminDigits) !== 13) {
                    // 유효하지 않은 주민번호 (스킵)
                    echo "SKIP [num={$num}]: 유효하지 않은 주민번호 ({$jumin})\n";
                    $skipped++;
                    continue;
                }
                
                // 암호화
                $encryptedJumin = encryptJumin($juminDigits);
                
                if (!$dryRun) {
                    // 데이터베이스 업데이트
                    $updateStmt = $pdo->prepare("UPDATE 2012DaeriMember SET Jumin = ? WHERE num = ?");
                    $updateStmt->execute([$encryptedJumin, $num]);
                }
                
                $success++;
                $processed++;
                
                if ($processed % 100 === 0) {
                    echo "진행 중... {$processed}/{$totalCount} (성공: {$success}, 실패: {$failed}, 스킵: {$skipped})\n";
                }
                
            } catch (Exception $e) {
                $failed++;
                $processed++;
                echo "ERROR [num={$num}]: {$e->getMessage()}\n";
                
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
        
        // 배치 처리 완료 후 잠시 대기 (서버 부하 방지)
        usleep(100000); // 0.1초
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

### 5.3 검증 스크립트

**파일**: `pci0327/scripts/verify-jumin-encryption.php`

```php
<?php
/**
 * 주민번호 암호화 검증 스크립트
 */

require_once __DIR__ . '/../api/config/db_config.php';
require_once __DIR__ . '/../api/utils/jumin-encryption.php';

echo "=== 주민번호 암호화 검증 시작 ===\n\n";

try {
    $pdo = getDbConnection();
    
    // 암호화된 데이터 샘플 조회
    $stmt = $pdo->query("
        SELECT num, Jumin 
        FROM 2012DaeriMember 
        WHERE Jumin IS NOT NULL 
        AND Jumin != ''
        AND LENGTH(Jumin) > 20  -- 암호화된 데이터 (Base64)
        LIMIT 10
    ");
    
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "검증 대상: " . count($rows) . "건\n\n";
    
    $success = 0;
    $failed = 0;
    
    foreach ($rows as $row) {
        $encrypted = $row['Jumin'];
        $decrypted = decryptJumin($encrypted);
        
        if ($decrypted && strlen($decrypted) === 13) {
            echo "✓ [num={$row['num']}]: 복호화 성공 ({$decrypted})\n";
            $success++;
        } else {
            echo "✗ [num={$row['num']}]: 복호화 실패\n";
            $failed++;
        }
    }
    
    echo "\n=== 검증 완료 ===\n";
    echo "성공: {$success}건\n";
    echo "실패: {$failed}건\n";
    
} catch (Exception $e) {
    echo "검증 실패: {$e->getMessage()}\n";
    exit(1);
}
```

---

## 6. 영향도 분석

### 6.1 기능별 영향도

#### 6.1.1 검색 기능 ⚠️ 높음
- **변경 사항**: LIKE 검색 불가 → 정확 일치 검색만 가능
- **대응**: 
  - 프론트엔드에서 전체 주민번호(13자리) 입력 강제
  - 부분 검색 불가 안내 문구 추가
- **영향 범위**:
  - `DriverSearch.tsx` - 기사 찾기
  - `EndorseList.tsx` - 배서 리스트 (중복 검색)

#### 6.1.2 화면 표시 ✅ 낮음
- **변경 사항**: 서버에서 마스킹된 값 전송
- **대응**: 프론트엔드 마스킹 로직 제거 (서버에서 처리)
- **영향 범위**: 모든 주민번호 표시 화면

#### 6.1.3 데이터 저장 ✅ 낮음
- **변경 사항**: 저장 시 자동 암호화
- **대응**: API 레벨에서 암호화 처리
- **영향 범위**: 
  - `AddCompanyModal.tsx` - 신규 업체 등록
  - `EndorseModal.tsx` - 배서 처리

#### 6.1.4 엑셀 다운로드 ✅ 낮음
- **변경 사항**: 마스킹된 주민번호 포함
- **대응**: 서버에서 마스킹 처리 후 엑셀 생성
- **영향 범위**: 
  - `PolicySearch.tsx` - 증권번호 찾기
  - `SettlementModal.tsx` - 정산 모달

#### 6.1.5 주민번호 검증 ✅ 낮음
- **변경 사항**: 검증 시 암호화된 값으로 비교
- **대응**: 검증 API에서 암호화 처리
- **영향 범위**: 
  - `AddCompanyModal.tsx` - 주민번호 중복 확인

### 6.2 성능 영향

#### 6.2.1 암호화/복호화 오버헤드
- **예상**: 레코드당 1-2ms 추가 (미미한 수준)
- **대응**: 
  - 화면 표시는 마스킹만 처리 (복호화 불필요)
  - 검색 시에만 복호화 필요

#### 6.2.2 데이터베이스 인덱스
- **변경**: 주민번호 인덱스 사용 불가 (암호화된 값은 인덱스 효과 없음)
- **대응**: 
  - 전체 주민번호 검색은 드물므로 인덱스 불필요
  - 검색 성능 저하 미미 (전체 테이블 스캔)

### 6.3 사용자 경험 영향

#### 6.3.1 검색 기능 제약
- **문제**: 부분 검색 불가능
- **대응**: 
  - 검색 입력 필드에 "전체 주민번호 13자리 입력" 안내
  - 유효성 검증 메시지 추가

#### 6.3.2 화면 표시
- **변경 없음**: 마스킹 처리로 동일한 UX 유지

---

## 7. 보안 고려사항

### 7.1 암호화 키 보안

#### 7.1.1 키 저장
- ❌ **금지**: 소스 코드에 하드코딩
- ❌ **금지**: Git 저장소에 포함
- ✅ **권장**: 환경 변수 또는 별도 설정 파일
- ✅ **권장**: 파일 권한 600 (소유자만 읽기)

#### 7.1.2 키 접근 제어
- 운영 환경과 개발 환경 키 분리
- 키 백업은 별도 안전한 위치에 보관
- 키 변경 시 재암호화 계획 수립

### 7.2 로깅 보안

#### 7.2.1 에러 로그
- 로그에 주민번호 포함 금지
- 민감정보 자동 제거 함수 사용

#### 7.2.2 디버그 로그
- 개발 환경에서만 디버그 로그 활성화
- 프로덕션 환경에서 민감정보 로깅 금지

### 7.3 데이터베이스 백업

#### 7.3.1 백업 파일 보안
- 백업 파일 암호화 (선택 사항)
- 백업 파일 접근 권한 제한
- 백업 파일 저장 위치 보안 강화

### 7.4 API 응답 보안

#### 7.4.1 응답 데이터
- API 응답에는 마스킹된 주민번호만 포함
- 필요 시에만 복호화 (검색 등)
- 불필요한 주민번호 노출 방지

---

## 8. 테스트 계획

### 8.1 단위 테스트

#### 8.1.1 암호화/복호화 함수
- [ ] 정상 주민번호 암호화/복호화
- [ ] 빈 값 처리
- [ ] 잘못된 형식 처리
- [ ] 복호화 실패 시 처리

#### 8.1.2 마스킹 함수
- [ ] 정상 주민번호 마스킹
- [ ] 암호화된 값에서 마스킹
- [ ] 빈 값 처리

### 8.2 통합 테스트

#### 8.2.1 데이터 저장
- [ ] 신규 데이터 저장 시 암호화 확인
- [ ] 암호화된 값이 DB에 저장되는지 확인

#### 8.2.2 데이터 조회
- [ ] 조회 시 마스킹된 값 반환 확인
- [ ] 검색 기능 정상 동작 확인

#### 8.2.3 검색 기능
- [ ] 전체 주민번호 검색 정상 동작
- [ ] 부분 검색 불가 확인
- [ ] 검색 결과 정확성 확인

### 8.3 성능 테스트

#### 8.3.1 암호화 성능
- [ ] 1,000건 암호화 시간 측정
- [ ] 1,000건 복호화 시간 측정
- [ ] API 응답 시간 영향 측정

### 8.4 보안 테스트

#### 8.4.1 로그 검토
- [ ] 에러 로그에 주민번호 노출 여부 확인
- [ ] 디버그 로그에 민감정보 포함 여부 확인

#### 8.4.2 API 응답 검토
- [ ] API 응답에 평문 주민번호 포함 여부 확인
- [ ] 마스킹 처리 정상 동작 확인

---

## 9. 롤백 계획

### 9.1 롤백 시나리오

#### 시나리오 1: 암호화 오류 발견
- **조치**: 
  1. 신규 데이터 저장 중지 (API 수정 배포)
  2. 암호화 모듈 비활성화
  3. 기존 평문 데이터로 복원

#### 시나리오 2: 검색 기능 문제
- **조치**: 
  1. 검색 API 롤백
  2. 기존 LIKE 검색으로 복원 (평문 데이터 대상)
  3. 프론트엔드 검증 로직 제거

### 9.2 롤백 절차

1. **백업 확인**: 암호화 전 데이터 백업 존재 확인
2. **API 롤백**: 암호화 로직 제거한 버전으로 배포
3. **데이터 복원**: 필요 시 백업에서 복원
4. **검증**: 정상 동작 확인

---

## 10. 구현 일정 (예상)

### Phase 1: 준비 및 개발 (3일)
- 암호화 모듈 개발
- 테스트 환경 구축
- 단위 테스트

### Phase 2: API 적용 (2일)
- 저장 API 수정
- 조회 API 수정
- 검색 API 수정

### Phase 3: 프론트엔드 적용 (2일)
- 화면 표시 변경
- 검색 UI 변경
- 유효성 검증 강화

### Phase 4: 마이그레이션 (3-5일)
- 배치 스크립트 실행
- 데이터 검증
- 문제 해결

### Phase 5: 테스트 및 배포 (2일)
- 통합 테스트
- 성능 테스트
- 프로덕션 배포

**총 예상 기간**: 12-14일 (약 2-3주)

---

## 11. 참고 사항

### 11.1 개인정보보호법 관련
- 주민번호는 민감정보로 분류
- 암호화는 기술적 보호조치 중 하나
- 추가 보안 조치도 필요 (접근 제어, 로깅 등)

### 11.2 향후 개선 사항
- 키 로테이션 기능 추가
- 키 관리 시스템(KMS) 도입 고려
- 추가 민감정보 암호화 (전화번호 등)

### 11.3 관련 문서
- `disk-cms/docs/pharmacy/pharmacy-통합-문서.md`
- 개인정보보호법
- 암호화 가이드라인

---

**작성일**: 2026-01-14  
**작성자**: 개발팀  
**승인자**: ______  
**최종 업데이트**: 2026-01-14
