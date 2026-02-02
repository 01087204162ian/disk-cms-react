# 실적/갱신리스트 기준 전환 계획

**작성일**: 2026-02-02  
**목적**: 계약완료(증권) 기준 도입 전후 시기별 데이터 기준 정립

---

## 📋 배경

- **계약완료(증권) 기준**: 2026년 1월부터 `pharmacy_certificate_history` 테이블 기반 추적 시작
- **2025년 이전**: 증권 이력 없음 → 승인 기준만 사용 가능
- **전환 기간**: 2026.01 ~ 2027.01 (1년) 동안 승인 기준으로 갱신/실적 산출
- **정착 시점**: 2027년 2월부터 계약(증권) 기준으로 전환

---

## 📊 기간별 기준 정리

| 기간 | 실적 조회 기준 | 갱신리스트 기준 | 근거 |
|------|----------------|-----------------|------|
| **2025년** | 승인 기준 | 승인 - 해지 | 증권 이력 없음 |
| **2026.01 ~ 2027.01** | 승인 기준 | 승인 - 해지 | 전환 구간, 1년간 승인 기준 유지 |
| **2027.02~** | 증권 기준 가능 | 계약(증권) 기준 | 증권 기준 데이터 정착 |

---

## 🔍 기준별 데이터 소스

### 승인 기준 (approval)
- **테이블**: `pharmacy_settlementList`
- **승인**: `sort = 13`
- **해지**: `sort = 16`
- **집계 시점**: `wdate` (승인/해지 기록일)

### 계약(증권) 기준 (certificate)
- **테이블**: `pharmacy_certificate_history` 또는 `pharmacyApply` (ch='6')
- **증권발급**: `action_type='certificate'`, `status='14'`
- **해지**: `action_type='termination'`, `status='16'`
- **집계 시점**: `certificate_date` 또는 `wdate_2`

---

## 📁 적용 대상

### 1. 일별/월별 실적 모달
- **2027년 1월 이전** 조회: `criteria` 무관 **승인 기준** 강제
- **2027년 2월 이후** 조회: 요청한 `criteria` (승인/증권) 사용

### 2. 갱신리스트
- **2027년 2월 이전**: `pharmacy_settlementList`에서 승인(sort=13) - 해지(sort=16) 제외 후 `pharmacyApply` 조인
- **2027년 2월 이후**: `pharmacyApply` ch='6' (계약완료) 기준 (현재 로직)

---

## 🔧 구현 상세

### 실적 조회 (pharmacy-daily-report.php, pharmacy-monthly-report.php)
```
if (조회년월 < 2027-02) {
    criteria = 'approval'  // 강제
} else {
    criteria = 요청값      // approval | certificate
}
```

### 갱신리스트 (pharmacy-renewal-list.php)
```
if (현재일 < 2027-02-01) {
    // 승인 - 해지 방식
    SELECT pa.* FROM pharmacyApply pa
    INNER JOIN (
        SELECT applyNum FROM pharmacy_settlementList WHERE sort=13
        EXCEPT
        SELECT applyNum FROM pharmacy_settlementList WHERE sort=16
    ) s ON pa.num = s.applyNum
    WHERE DATEDIFF(pa.jeonggi, CURDATE()) BETWEEN -45 AND 45
} else {
    // 계약(증권) 기준
    SELECT * FROM pharmacyApply WHERE ch='6'
    AND DATEDIFF(jeonggi, CURDATE()) BETWEEN -45 AND 45
}
```

---

## 📅 전환 일정

| 날짜 | 변경 내용 |
|------|----------|
| 2026-02-02 | 문서 작성, 코드 반영 |
| 2027-02-01 | 갱신리스트·실적 조회 계약 기준 전환 |

---

**참고**: `pharmacy_certificate_history` 테이블 존재 여부 및 데이터 적재 현황은 배포 환경에 따라 다를 수 있음.
