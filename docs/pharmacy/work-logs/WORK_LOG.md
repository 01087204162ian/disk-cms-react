# 약국배상책임보험 작업일지

## 2026-01-10

### 작업 내용

#### 1. 일별/월별 실적 조회 기준 변경
- **변경 사항**: 계약 기준 → 증권 기준으로 변경
- **파일**:
  - `imet/api/pharmacy/pharmacy-daily-report.php`
  - `imet/api/pharmacy/pharmacy-monthly-report.php`
  - `disk-cms-react/src/pages/pharmacy/components/DailyReportModal.tsx`

- **변경 전**:
  - 기준: 계약 기준
  - 조건: `ch = '6'` (계약완료), `wdate_2` (계약완료일)
  
- **변경 후**:
  - 기준: 증권 기준
  - 조건: `ch = '14'` (증권발급), `wdate_3` (증권발급일)

#### 2. 프론트엔드 UI 수정
- 라디오 버튼 라벨: "계약 기준" → "증권 기준"으로 변경
- 승인 금액/건수 표시를 한 줄로 통합

#### 3. 상태 필터 추가
- **파일**: `disk-cms-react/src/pages/pharmacy/components/Applications.tsx`
- 약국 신청 목록 페이지에 "계약(ch=6)" 상태 필터 추가

#### 4. 데이터베이스 필드 의미 확인
- **wdate**: 최초 입력 시간 (신청일)
- **wdate_2**: 상태 변경일 (메일 보냄, 승인 등 상태 변경 시점)
- **wdate_3**: 증권번호 입력일 (증권발급일)

#### 5. 설계번호 입력 기능 확인
- **파일**: `imet/api/pharmacy/pharmacy-design-update.php`
- 설계번호 입력 시:
  - `chemistDesignNumer` 또는 `areaDesignNumer` 필드 업데이트
  - 상태가 `ch = '17'` (설계중)으로 자동 변경
  - `wdate`, `wdate_2`는 변동 없음

#### 6. 증권번호 입력 기능 확인
- **파일**: `imet/api/pharmacy/pharmacy-certificate-update.php`
- 증권번호 입력 시:
  - `chemistCerti` 또는 `areaCerti` 필드 업데이트
  - 상태가 `ch = '14'` (증권발급)으로 자동 변경
  - `wdate_3`에 증권번호 입력일 설정

#### 7. 상태 변경 함수 확인
- **파일**: `imet/application/models/Pharmacy_model.php`
- `ch_Input()` 함수:
  - 메일 보냄(ch=10) 또는 승인(ch=13) 상태로 변경 시 호출
  - `wdate_2`에 상태 변경일 설정

### 기술적 변경 사항

#### SQL 쿼리 변경
```sql
-- 변경 전 (계약 기준)
WHERE wdate_2 IS NOT NULL
  AND DATE(wdate_2) = '$currentDate'
  AND (ch = '6' OR ch = '16')

-- 변경 후 (증권 기준)
WHERE wdate_3 IS NOT NULL
  AND DATE(wdate_3) = '$currentDate'
  AND (ch = '14' OR ch = '16')
```

#### 프론트엔드 변경
- `filters.criteria` 타입: `'approval' | 'contract'` 유지
- UI 텍스트만 "계약 기준" → "증권 기준"으로 변경
- 실제 API 파라미터는 `criteria=contract` 유지 (백엔드에서 증권 기준으로 처리)

### 디버깅 로그 추가
- 프록시 라우터(`reports.js`)에 `criteria` 파라미터 전달 확인 로그 추가
- PHP API에 `criteria` 파라미터 수신 확인 로그 추가
- 프론트엔드에 `criteria` 파라미터 전달/수신 확인 로그 추가

### 확인된 사항
1. 계약 기준 조회 시 `ch=6` 데이터가 없어서 결과가 비어있었음 (정상 동작)
2. 증권 기준 조회 시 `ch=14`, `wdate_3` 기준으로 정상 조회됨
3. `account=8` 테스트 시 승인 기준은 정상, 증권 기준도 정상 작동 확인

### 다음 작업 예정
- [ ] 디버깅 로그 정리 (운영 환경 배포 전)
- [ ] 증권 기준 조회 성능 최적화 검토
- [ ] 관련 문서 업데이트

---

## 작업 규칙

### 날짜 형식
- `YYYY-MM-DD` 형식 사용

### 작업 내용 작성 규칙
1. 날짜별로 구분
2. 작업 내용을 카테고리별로 정리
3. 변경된 파일 경로 명시
4. 변경 전/후 비교 명시
5. 기술적 변경 사항은 코드 예시 포함

### 참고
- 주요 변경 사항은 `README.md`에도 반영 필요
- API 변경 사항은 API 문서에도 업데이트 필요
