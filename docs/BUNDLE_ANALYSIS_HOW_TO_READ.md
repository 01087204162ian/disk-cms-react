# 번들 분석 파일 읽는 방법 (초보자용)

## 📊 번들 분석 파일에서 무엇을 봐야 하나요?

### 1️⃣ 가장 큰 청크 찾기

브라우저에서 `stats.html` 파일을 열면 트리맵이 보입니다.

**확인 포인트:**
- 가장 큰 박스가 무엇인지 찾기
- 보통 `vendor` 청크가 가장 큽니다
- 큰 청크 = 다운로드 시간이 오래 걸림

**현재 문제:**
- `vendor` 청크가 **1,337KB** (398KB 압축)
- 이것은 너무 큽니다!

---

### 2️⃣ vendor 청크 안에 무엇이 들어있는지 확인

**확인 방법:**
1. `vendor` 박스를 클릭하면 확대됩니다
2. 안에 들어있는 패키지들이 보입니다
3. 각 패키지의 크기를 확인합니다

**주요 확인 대상:**
- `exceljs` - 엑셀 처리 라이브러리 (아마 큼)
- `moment` / `moment-timezone` - 날짜 처리 (큼)
- `react-markdown` - 마크다운 처리 (중간)
- `axios` - HTTP 요청 (작음)
- `zod` - 검증 라이브러리 (중간)

---

### 3️⃣ 문제가 있는 패키지 찾기

**문제가 되는 패키지:**
- 📦 **exceljs** (~500KB): 엑셀 파일 처리 (사용 빈도 낮으면 분리)
- 📦 **moment** + **moment-timezone** (~300KB): 날짜 처리 (date-fns로 교체 가능)
- 📦 **react-markdown** + 관련 패키지 (~100KB): 마크다운 (사용 페이지 적으면 분리)

**해결 방법:**
- 자주 사용하지 않는 큰 라이브러리는 **동적 import**로 분리
- 예: Excel 다운로드 기능은 클릭할 때만 로드

---

### 4️⃣ 현재 설정 확인

현재 `vite.config.mjs`에서 이미 분리하고 있는 것들:
- ✅ `react-core` (React 자체)
- ✅ `router` (라우팅)
- ✅ `icons` (아이콘)
- ✅ `dates` (날짜 라이브러리)
- ❌ 나머지는 모두 `vendor`에 몰려있음 → **문제!**

---

## 🔍 실제 확인 절차

### Step 1: 트리맵에서 vendor 클릭

1. 브라우저에서 `stats.html` 열기
2. 가장 큰 박스(`vendor`) 찾기
3. 클릭해서 확대

### Step 2: 큰 패키지 찾기

확대된 화면에서:
- 큰 박스가 뭔지 확인
- 패키지 이름 읽기 (예: `exceljs`, `moment`, `react-markdown` 등)
- 크기 확인 (오른쪽 또는 호버 시 표시)

### Step 3: 문제 패키지 목록 작성

큰 패키지들을 메모:
```
1. exceljs - 500KB (엑셀 다운로드에만 사용)
2. moment - 300KB (모든 페이지에서 사용 중)
3. react-markdown - 100KB (문서 페이지에만 사용)
...
```

---

## 💡 개선 방법

### 방법 1: 동적 Import (Lazy Loading)

큰 라이브러리를 필요한 페이지에서만 로드:

**변경 전:**
```typescript
import ExcelJS from 'exceljs';
```

**변경 후:**
```typescript
const handleExcelDownload = async () => {
  const ExcelJS = await import('exceljs');
  // Excel 다운로드 로직
};
```

### 방법 2: 날짜 라이브러리 교체

`moment` → `date-fns`로 교체:
- `moment`: ~300KB
- `date-fns`: ~100KB (tree-shaking 가능)

### 방법 3: 청크 분할 세분화

`vite.config.mjs`에서 더 세분화:

```javascript
manualChunks(id) {
  if (!id.includes('node_modules')) return

  // 큰 라이브러리별로 분리
  if (id.includes('exceljs')) return 'exceljs'
  if (id.includes('react-markdown')) return 'markdown'
  if (id.includes('moment')) return 'moment'
  // ...
}
```

---

## 📋 체크리스트

번들 분석 파일을 볼 때 확인할 항목:

- [ ] 가장 큰 청크가 무엇인가? (보통 vendor)
- [ ] vendor 안에 가장 큰 패키지가 무엇인가?
- [ ] 그 패키지는 모든 페이지에서 필요한가?
- [ ] 자주 사용하지 않는 큰 라이브러리가 있나?
- [ ] moment 같은 큰 날짜 라이브러리를 더 작은 것으로 교체할 수 있나?

---

## 🎯 목표

**현재:**
- vendor: 1,337KB (398KB gzip)

**목표:**
- vendor: 800KB 이하 (200KB gzip)
- 큰 라이브러리는 필요할 때만 로드

---

## 💬 다음 단계

1. `stats.html`에서 `vendor` 청크를 클릭
2. 가장 큰 3개 패키지 이름을 확인
3. 그 패키지들이 어디서 사용되는지 코드에서 찾기
4. 자주 사용하지 않으면 동적 import로 변경

어떤 패키지가 가장 큰지 확인되면 알려주세요! 최적화 방법을 안내해드리겠습니다.
