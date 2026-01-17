# 2012DaeriMemberSecure 테이블 구조 변경 SQL

**작성일**: 2026-01-17  
**목적**: 
1. jumin_hash의 UNIQUE 제약 제거하여 모든 레코드에 해시 저장 가능하도록 변경
2. 핸드폰 번호 암호화 필드 추가 (hphone_encrypted, hphone_hash)

---

## 🔧 테이블 구조 변경

### 1단계: UNIQUE 제약 제거

```sql
-- 기존 UNIQUE 인덱스 제거
ALTER TABLE `2012DaeriMemberSecure` 
DROP INDEX `idx_jumin_hash`;
```

### 2단계: 일반 인덱스로 재생성

```sql
-- 일반 인덱스로 재생성 (UNIQUE 아님)
ALTER TABLE `2012DaeriMemberSecure` 
ADD INDEX `idx_jumin_hash` (`jumin_hash`);
```

### 3단계: 핸드폰 번호 암호화 필드 추가

```sql
-- 핸드폰 번호 암호화 필드 추가
ALTER TABLE `2012DaeriMemberSecure` 
ADD COLUMN `hphone_encrypted` text DEFAULT NULL COMMENT '암호화된 핸드폰 번호 (AES-256-GCM)' AFTER `jumin_hash`,
ADD COLUMN `hphone_hash` char(64) DEFAULT NULL COMMENT '검색용 해시 (SHA-256)' AFTER `hphone_encrypted`;

-- 핸드폰 번호 해시 인덱스 추가
ALTER TABLE `2012DaeriMemberSecure` 
ADD INDEX `idx_hphone_hash` (`hphone_hash`);
```

---

## ✅ 변경 후 효과

### 변경 전
- `jumin_hash` UNIQUE 제약
- 중복 주민번호는 첫 번째만 해시 저장
- 중복 레코드는 `jumin_hash = NULL`
- `Hphone` 필드 평문 저장

### 변경 후
- `jumin_hash` 일반 인덱스 (UNIQUE 아님)
- 모든 레코드에 주민번호 해시 저장
- 모든 레코드 검색 가능
- `hphone_encrypted`, `hphone_hash` 필드 추가
- 핸드폰 번호도 암호화하여 저장

---

## 📝 실행 순서

1. **테이블 구조 변경** (위 SQL 모두 실행)
   - 1단계: UNIQUE 제약 제거
   - 2단계: 일반 인덱스로 재생성
   - 3단계: 핸드폰 번호 암호화 필드 추가

2. **테이블 TRUNCATE**
   ```sql
   TRUNCATE TABLE `2012DaeriMemberSecure`;
   ```

3. **마이그레이션 스크립트 재실행**
   ```
   https://pcikorea.com/api/insurance/migrate-to-secure-table.php
   ```

---

## ⚠️ 주의사항

1. **인덱스 성능**: UNIQUE 인덱스가 일반 인덱스로 변경되지만, 검색 성능은 동일
2. **중복 방지**: UNIQUE 제약이 없어져 중복 주민번호가 모두 저장됨
3. **데이터 정합성**: 중복 주민번호가 의도된 것인지 확인 필요
4. **핸드폰 번호**: 기존 `Hphone` 필드는 유지되지만, 암호화된 값은 `hphone_encrypted`에 저장
5. **검색**: 핸드폰 번호 검색 시 `hphone_hash` 사용 가능

---

**작성일**: 2026-01-17
