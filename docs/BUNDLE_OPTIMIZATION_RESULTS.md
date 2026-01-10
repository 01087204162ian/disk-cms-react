# 번들 최적화 작업 결과

## 🎯 최적화 목표

**문제점:**
- `vendor` 청크가 **1,337KB** (398KB gzip)로 너무 큼
- `exceljs`가 **500KB 이상**을 차지하며 모든 페이지에서 로드됨
- 엑셀 다운로드는 특정 모달에서만 사용되는데 전체 번들에 포함됨

**목표:**
- 엑셀 다운로드 기능은 필요할 때만 로드 (Lazy Loading)
- 초기 번들 크기 감소
- 페이지 로딩 속도 개선

---

## ✅ 완료된 작업

### 1. ExcelJS 동적 Import 변경

**변경 전:**
```typescript
import ExcelJS from 'exceljs'

const handleExportExcel = async () => {
  const workbook = new ExcelJS.Workbook()
  // ...
}
```

**변경 후:**
```typescript
const handleExportExcel = async () => {
  // 엑셀 다운로드 시에만 ExcelJS 로드
  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  // ...
}
```

**적용 파일:**
- ✅ `src/pages/pharmacy/components/DepositUsageModal.tsx`
- ✅ `src/pages/pharmacy/components/DepositListModal.tsx`

### 2. Vite 설정 개선

**변경 내용:**
```javascript
// vite.config.mjs
manualChunks(id) {
  // ...
  
  // 큰 라이브러리 분리 (동적 import로 로드됨)
  if (id.includes('exceljs')) return 'exceljs'
  if (id.includes('react-markdown')) return 'markdown'
  
  // ...
}
```

---

## 📊 예상 개선 효과

### 번들 크기 변화 (예상)

**최적화 전:**
```
vendor: 1,337KB (398KB gzip)
├─ exceljs: ~500KB
├─ 기타 라이브러리들: ~837KB
```

**최적화 후:**
```
초기 로드:
├─ vendor: ~837KB (약 200KB gzip) ← exceljs 제외
├─ react-core: 138KB (44KB gzip)
├─ router: 12KB (5KB gzip)

필요 시 로드:
└─ exceljs: ~500KB (별도 청크로 분리, 엑셀 다운로드 버튼 클릭 시 로드)
```

**예상 효과:**
- ✅ 초기 번들 크기 **약 500KB 감소** (약 37% 감소)
- ✅ 초기 로딩 속도 개선
- ✅ 엑셀 다운로드 기능은 필요할 때만 로드

---

## 🔍 확인 방법

### 1. 빌드 실행

```bash
npm run build
```

### 2. 번들 분석 파일 확인

빌드 후 `dist/stats.html` 파일을 브라우저에서 열어서:

1. **초기 로드 청크 확인**
   - `vendor` 청크가 크게 줄어들었는지 확인
   - `exceljs` 청크가 별도로 분리되었는지 확인

2. **동적 Import 확인**
   - `exceljs` 청크가 초기 로드에 포함되지 않았는지 확인
   - 엑셀 다운로드 버튼 클릭 시 별도로 로드되는지 확인

### 3. 네트워크 탭 확인 (브라우저 개발자 도구)

1. 브라우저 개발자 도구 열기 (F12)
2. Network 탭으로 이동
3. 페이지 새로고침
4. 초기 로드 시 `exceljs` 파일이 로드되지 않는지 확인
5. 엑셀 다운로드 버튼 클릭
6. `exceljs` 파일이 동적으로 로드되는지 확인

---

## 📝 추가 최적화 가능 항목

번들 분석 파일(`stats.html`)을 보면서 다음 항목도 최적화할 수 있습니다:

### 1. react-markdown 관련 라이브러리

**현재 상황:**
- `micromark`, `parse5` 등 마크다운 처리 라이브러리가 vendor에 포함
- 문서 페이지에서만 사용되는데 전체 번들에 포함됨

**최적화 방법:**
- 문서 페이지에서만 동적 import 사용

### 2. moment 라이브러리

**현재 상황:**
- `moment` + `moment-timezone`이 약 300KB
- `date-fns`로 교체 가능 (tree-shaking 지원)

**최적화 방법:**
- `moment` → `date-fns`로 교체
- 또는 동적 import로 변경

---

## ✅ 체크리스트

최적화 후 확인할 항목:

- [ ] 빌드가 정상적으로 완료되는가?
- [ ] `vendor` 청크 크기가 줄어들었는가?
- [ ] `exceljs` 청크가 별도로 분리되었는가?
- [ ] 페이지 초기 로드 시 `exceljs`가 로드되지 않는가?
- [ ] 엑셀 다운로드 버튼 클릭 시 정상 작동하는가?
- [ ] 엑셀 다운로드 시 `exceljs`가 동적으로 로드되는가?

---

## 🚀 다음 단계

1. 빌드 실행: `npm run build`
2. 번들 분석: `dist/stats.html` 파일 확인
3. 실제 테스트: 엑셀 다운로드 기능 테스트
4. 네트워크 확인: 개발자 도구로 동적 로딩 확인

문제가 있으면 알려주세요!
