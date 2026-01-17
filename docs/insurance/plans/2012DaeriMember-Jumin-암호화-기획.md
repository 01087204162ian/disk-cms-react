# 2012DaeriMember 테이블 주민번호(Jumin) 보안 강화 기획서

**작성일**: 2026-01-14  
**대상 테이블**: `2012DaeriMember` → 새 테이블 `2012DaeriMemberSecure`  
**대상 필드**: `Jumin` (주민번호)  
**목적**: 개인정보보호법 준수 및 민감정보 보안 강화  
**전략**: 새 테이블 도입 → 점진적 전환 → 기존 테이블 페이드 아웃

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
- 주민번호를 별도 보안 테이블로 분리하여 저장
- 주민번호는 암호화하여 저장 (AES-256)
- 검색은 해시(SHA-256)를 사용하여 빠른 검색 가능
- 점진적 마이그레이션으로 기존 시스템 영향 최소화
- 안정화 후 기존 테이블 페이드 아웃

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

### 3.1 전략: 새 테이블 + 해시 기반 검색 ✅

**핵심 개념**:
- **새 테이블 생성**: `2012DaeriMemberSecure` (주민번호 전용 보안 테이블)
- **주민번호 암호화**: AES-256으로 암호화하여 저장 (복호화 가능)
- **검색용 해시**: SHA-256 해시를 함께 저장하여 빠른 검색
- **점진적 전환**: 새 데이터는 새 테이블, 기존 데이터는 점진적 마이그레이션
- **페이드 아웃**: 안정화 후 기존 `2012DaeriMember.Jumin` 필드 제거

**장점**:
- ✅ 기존 시스템 영향 최소화 (점진적 전환)
- ✅ 롤백 용이 (기존 테이블 그대로 유지)
- ✅ 해시 기반 검색으로 빠른 성능 (인덱스 활용)
- ✅ 암호화된 주민번호로 보안 강화
- ✅ 복호화 가능하여 필요한 경우 복원 가능
- ✅ LIKE 검색 불가 문제 해결 (해시로 정확 일치 검색)

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
- **환경 변수** (권장) ✅
  ```php
  // .env 파일 (Git에 포함하지 않음)
  JUMIN_ENCRYPTION_KEY=your-256-bit-key-here
  ```

#### 3.3.2 키 생성 방법
```bash
# OpenSSL을 사용한 256비트 키 생성
openssl rand -hex 32
```

---

## 4. 새 테이블 설계

### 4.1 테이블 구조

```sql
CREATE TABLE `2012DaeriMemberSecure` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_num` int(11) NOT NULL COMMENT '2012DaeriMember.num과 연결',
  `jumin_encrypted` text NOT NULL COMMENT '암호화된 주민번호 (AES-256-GCM)',
  `jumin_hash` char(64) NOT NULL COMMENT '검색용 해시 (SHA-256)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_member_num` (`member_num`),
  UNIQUE KEY `idx_jumin_hash` (`jumin_hash`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2 필드 설명

#### 4.2.1 `member_num` (int)
- **역할**: `2012DaeriMember.num`과 연결
- **특징**: UNIQUE 제약으로 1:1 관계 보장
- **용도**: 기존 테이블과 조인

#### 4.2.2 `jumin_encrypted` (text)
- **역할**: 암호화된 주민번호 저장
- **형식**: Base64 인코딩된 암호화 데이터 (IV + Tag + 암호화된 값)
- **크기**: 약 100-200 바이트 (암호화 후)

#### 4.2.3 `jumin_hash` (char(64))
- **역할**: 검색용 해시 (SHA-256)
- **형식**: 64자리 16진수 문자열 (예: `a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3`)
- **특징**: UNIQUE 제약으로 중복 검사 및 빠른 검색
- **용도**: 주민번호 검색 시 해시 비교

### 4.3 테이블 관계

```
2012DaeriMember (기존 테이블)
    │
    │ 1:1 관계
    ↓
2012DaeriMemberSecure (새 보안 테이블)
    ├─ member_num (FK → 2012DaeriMember.num)
    ├─ jumin_encrypted (암호화된 주민번호)
    └─ jumin_hash (검색용 해시)
```

### 4.4 인덱스 전략

#### 4.4.1 `idx_member_num` (UNIQUE)
- **용도**: `2012DaeriMember`와 조인 시 사용
- **특징**: UNIQUE로 중복 방지

#### 4.4.2 `idx_jumin_hash` (UNIQUE)
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
$encryption_key = getenv('JUMIN_ENCRYPTION_KEY') ?: require __DIR__ . '/../../config/encryption.php';

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
$stmt = $pdo->prepare("INSERT INTO 2012DaeriMember (Jumin, ...) VALUES (?, ...)");
$stmt->execute([$jumin, ...]);
```

**변경 후**:
```php
require_once __DIR__ . '/../utils/jumin-secure.php';

$jumin = $_POST['jumin'];
$juminDigits = preg_replace('/[^0-9]/', '', $jumin);

// 1. 기존 테이블에 저장 (하위 호환성)
$stmt = $pdo->prepare("INSERT INTO 2012DaeriMember (Jumin, ...) VALUES (?, ...)");
$stmt->execute([$jumin, ...]);
$memberNum = $pdo->lastInsertId();

// 2. 새 보안 테이블에 저장
$encryptedJumin = encryptJumin($juminDigits);
$juminHash = hashJumin($juminDigits);

$secureStmt = $pdo->prepare("
    INSERT INTO 2012DaeriMemberSecure (member_num, jumin_encrypted, jumin_hash) 
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE 
        jumin_encrypted = VALUES(jumin_encrypted),
        jumin_hash = VALUES(jumin_hash),
        updated_at = CURRENT_TIMESTAMP
");
$secureStmt->execute([$memberNum, $encryptedJumin, $juminHash]);
```

#### 5.2.2 검색 시 해시 사용

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
        
        // 새 보안 테이블과 조인하여 검색
        $sql .= " 
            INNER JOIN 2012DaeriMemberSecure sec 
            ON 2012DaeriMember.num = sec.member_num 
            AND sec.jumin_hash = :jumin_hash
        ";
        $params[':jumin_hash'] = $juminHash;
    } else {
        // 부분 검색은 불가능 (보안상 LIKE 검색 불가)
        // 프론트엔드에서 전체 주민번호 입력 안내
    }
}
```

#### 5.2.3 조회 시 마스킹 처리

**파일**: `pci0327/api/insurance/kj-driver-list.php`

```php
require_once __DIR__ . '/../utils/jumin-secure.php';

$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// API 응답에는 마스킹된 주민번호만 전송
foreach ($results as &$row) {
    if (!empty($row['Jumin'])) {
        // 서버에서 마스킹 처리 (암호화된 값에서 복호화 후 마스킹)
        // 또는 클라이언트에서 마스킹 (해시만 전송)
        $row['Jumin'] = maskJumin($row['Jumin'], false); // 평문이면 false
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
- [ ] `2012DaeriMemberSecure` 테이블 생성
- [ ] 보안 모듈 개발 및 테스트
- [ ] 테스트 환경에서 검증

#### Phase 2: 신규 데이터 이중 저장 (1일)
- [ ] API 수정 (저장 시 기존 테이블 + 새 테이블 모두 저장)
- [ ] 신규 데이터만 새 테이블에 저장 시작
- [ ] 기존 데이터는 평문 유지 (하위 호환성)

#### Phase 3: 검색 기능 전환 (1일)
- [ ] 검색 API 수정 (해시 기반 검색)
- [ ] 프론트엔드 검색 UI 변경 (전체 13자리 입력)
- [ ] 사용자 안내 문구 추가

#### Phase 4: 기존 데이터 마이그레이션 (2-3일)
- [ ] 배치 스크립트로 기존 데이터 암호화 및 해시 생성
- [ ] 새 테이블에 데이터 저장
- [ ] 마이그레이션 진행 상황 모니터링

#### Phase 5: 안정화 및 검증 (2-3일)
- [ ] 모든 기능 정상 동작 확인
- [ ] 성능 테스트
- [ ] 보안 테스트

#### Phase 6: 기존 테이블 페이드 아웃 (1일)
- [ ] `2012DaeriMember.Jumin` 필드 사용 중단
- [ ] 관련 코드 제거
- [ ] 필요 시 `Jumin` 필드 NULL 처리 또는 제거 (선택)

### 6.2 배치 마이그레이션 스크립트

**파일**: `pci0327/scripts/migrate-jumin-to-secure-table.php`

```php
<?php
/**
 * 주민번호 보안 테이블 마이그레이션 스크립트
 * 
 * 사용법:
 * php migrate-jumin-to-secure-table.php [--dry-run] [--batch-size=1000]
 */

require_once __DIR__ . '/../api/config/db_config.php';
require_once __DIR__ . '/../api/utils/jumin-secure.php';

$dryRun = in_array('--dry-run', $argv);
$batchSize = 1000;

echo "=== 주민번호 보안 테이블 마이그레이션 시작 ===\n";
echo "Dry Run: " . ($dryRun ? 'YES' : 'NO') . "\n";
echo "Batch Size: {$batchSize}\n\n";

try {
    $pdo = getDbConnection();
    
    // 마이그레이션 대상 확인
    $totalCount = $pdo->query("
        SELECT COUNT(*) 
        FROM 2012DaeriMember m
        LEFT JOIN 2012DaeriMemberSecure s ON m.num = s.member_num
        WHERE m.Jumin IS NOT NULL 
        AND m.Jumin != ''
        AND s.member_num IS NULL
    ")->fetchColumn();
    
    echo "총 마이그레이션 대상: {$totalCount}건\n\n";
    
    $processed = 0;
    $success = 0;
    $failed = 0;
    $skipped = 0;
    
    $offset = 0;
    
    while (true) {
        // 배치 단위로 조회 (새 테이블에 없는 데이터만)
        $stmt = $pdo->prepare("
            SELECT m.num, m.Jumin 
            FROM 2012DaeriMember m
            LEFT JOIN 2012DaeriMemberSecure s ON m.num = s.member_num
            WHERE m.Jumin IS NOT NULL 
            AND m.Jumin != ''
            AND s.member_num IS NULL
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
            $jumin = $row['Jumin'];
            
            try {
                // 주민번호 정규화
                $juminDigits = preg_replace('/[^0-9]/', '', $jumin);
                if (strlen($juminDigits) !== 13) {
                    echo "SKIP [num={$memberNum}]: 유효하지 않은 주민번호 ({$jumin})\n";
                    $skipped++;
                    continue;
                }
                
                // 암호화 및 해시 생성
                $encryptedJumin = encryptJumin($juminDigits);
                $juminHash = hashJumin($juminDigits);
                
                if (!$dryRun) {
                    // 새 보안 테이블에 저장
                    $insertStmt = $pdo->prepare("
                        INSERT INTO 2012DaeriMemberSecure 
                        (member_num, jumin_encrypted, jumin_hash) 
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE 
                            jumin_encrypted = VALUES(jumin_encrypted),
                            jumin_hash = VALUES(jumin_hash)
                    ");
                    $insertStmt->execute([$memberNum, $encryptedJumin, $juminHash]);
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
- 환경 변수로 관리 (Git 제외)
- 운영/개발 환경 키 분리
- 키 변경 시 재암호화 계획 수립

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
- **시나리오 1**: 새 테이블 오류 발견
  - **조치**: 검색 API 롤백 (기존 테이블 사용)
  - **영향**: 새 데이터만 영향 (기존 데이터 안전)

### 10.2 롤백 절차
1. 검색 API 롤백 (기존 테이블 `Jumin` 필드 사용)
2. 저장 API 롤백 (기존 테이블만 저장)
3. 새 테이블은 유지 (데이터 보존)

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
