# 작업일지 - 프로젝트 전반

> **카테고리**: 프로젝트 전반 관련 작업
> **업데이트 규칙**: 기능 완성 시마다 즉시 업데이트

---

## ✅ 완료된 작업

### 2026-01-10 (프로젝트 전반) - 번들 크기 최적화 및 성능 개선

#### 33) 번들 분석 및 최적화 작업 완료
- **번들 분석 도구 설정**:
  - `rollup-plugin-visualizer` 패키지 추가 및 설정
  - 빌드 시 `dist/stats.html` 파일 자동 생성
  - 번들 크기, 의존성 관계, 청크 분할 상태 시각화
- **번들 분석 가이드 문서 작성**:
  - `docs/BUNDLE_ANALYSIS_GUIDE.md`: 번들 분석 파일 확인 방법 가이드
  - `docs/BUNDLE_ANALYSIS_HOW_TO_READ.md`: 번들 분석 파일 해석 방법 (초보자용)
  - `docs/BUNDLE_OPTIMIZATION_RESULTS.md`: 최적화 작업 결과 및 개선 효과 문서
- **ExcelJS 동적 Import 최적화**:
  - `DepositUsageModal.tsx`: ExcelJS를 동적 import로 변경 (엑셀 다운로드 시에만 로드)
  - `DepositListModal.tsx`: ExcelJS를 동적 import로 변경
  - 초기 번들에서 약 500KB 제거
- **Vite 청크 분할 설정 개선** (`vite.config.mjs`):
  - React core 청크 분리 (react, react-dom, scheduler 포함)
  - Router 청크 분리
  - Icons 청크 분리 (lucide-react, react-icons)
  - Dates 청크 분리 (moment, moment-timezone, date-fns)
  - ExcelJS 별도 청크 분리 (동적 import로 로드됨)
  - Markdown 관련 패키지는 vendor에 포함 (circular dependency 방지)
- **최적화 결과**:
  - **최적화 전**: vendor 1,337KB (398KB gzip)
  - **최적화 후**: vendor 394KB (127KB gzip), exceljs 938KB (별도 청크)
  - **개선 효과**: 초기 번들 크기 약 943KB 감소 (70% 감소), gzip 크기 약 271KB 감소 (68% 감소)
  - 초기 페이지 로딩 속도 대폭 개선
- **해결한 이슈**:
  - React useState 에러: React 관련 패키지 매칭 개선 (scheduler 포함)
  - Markdown circular dependency: markdown 청크 분할 제거, vendor에 포함
- **파일**:
  - `vite.config.mjs`: 청크 분할 설정 개선
  - `src/pages/pharmacy/components/DepositUsageModal.tsx`: ExcelJS 동적 import
  - `src/pages/pharmacy/components/DepositListModal.tsx`: ExcelJS 동적 import
  - `package.json`: rollup-plugin-visualizer 추가
  - `docs/BUNDLE_ANALYSIS_GUIDE.md`: 번들 분석 가이드 (신규)
  - `docs/BUNDLE_ANALYSIS_HOW_TO_READ.md`: 번들 분석 해석 가이드 (신규)
  - `docs/BUNDLE_OPTIMIZATION_RESULTS.md`: 최적화 결과 문서 (신규)
- **결과**: 프로젝트 전반의 번들 크기 최적화 완료, 초기 로딩 속도 개선, 엑셀 다운로드 기능은 필요할 때만 로드되도록 개선



---

### 2026-01-20 - 사이드바 메뉴 UX 개선

#### 작업 시간
- **시작**: 2026-01-20 00:17
- **작업 내용**: 사이드바 메뉴 동작 개선 및 스타일 수정

#### 작업 내용

**1. 2차 메뉴 레벨 단일 열림 기능 추가**
- **파일**: `src/components/Sidebar.tsx`
- **문제점**: 보험상품 아래 2차 메뉴(대리운전, 현장실습보험 등)가 동시에 여러 개 열릴 수 있어 메뉴가 복잡해짐
- **요구사항**: 2차 메뉴 레벨에서 하나만 열리도록 개선
  - 예: "대리운전"이 열려있을 때 "현장실습보험" 클릭 → "대리운전" 닫히고 "현장실습보험"만 열림
- **구현 사항**:
  - `findMenuItemById()`: 메뉴 아이템을 ID로 찾는 헬퍼 함수 추가
  - `findParentId()`: 특정 메뉴의 부모 ID를 찾는 헬퍼 함수 추가
  - `findSiblingIds()`: 같은 부모의 형제 메뉴 ID들을 찾는 함수 추가
  - `toggleExpand()`: 2차 메뉴 레벨(`level === 1`)에서 형제 메뉴들을 자동으로 닫고 현재 메뉴만 토글하도록 수정
- **동작 방식**:
  1. 2차 메뉴 클릭 시 부모 ID 찾기
  2. 같은 부모의 형제 메뉴 ID들 찾기
  3. 형제 메뉴들을 `expandedItems`에서 제거
  4. 현재 메뉴만 토글 (열림/닫힘)

**2. 4차 메뉴 액티브 상태 호버 시 가시성 문제 수정**
- **파일**: `src/components/Sidebar.tsx`
- **문제점**: 4차 메뉴 클릭 시 파란색 배경(`bg-primary`)에 흰색 텍스트(`text-primary-foreground`)가 표시되지만, 호버 시 어두운 텍스트(`text-foreground`)로 변경되어 파란 배경 위에서 보이지 않음
- **해결**:
  - 액티브 상태일 때 호버 스타일을 별도로 처리
  - `hover:bg-primary/90 hover:text-primary-foreground` 추가하여 호버 시에도 흰색 텍스트 유지
  - 비액티브 상태일 때만 기존 호버 스타일(`hover:bg-accent`) 적용
- **변경된 스타일**:
  ```tsx
  isActive
    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
    : 'text-foreground hover:bg-accent/30'
  ```

#### 기술적 세부사항

**메뉴 구조**:
- 1차 메뉴: 보험상품 (`insurance`)
- 2차 메뉴: 대리운전, 현장실습보험, 약국배상책임보험 등 (단일 열림 적용)
- 3차 메뉴: KJ대리운전, daS대리운전 등 (기존 동작 유지)
- 4차 메뉴: 기사 찾기, 대리업체 관리, 배서 리스트 등 (호버 가시성 개선)

**2차 메뉴 단일 열림 로직**:
```typescript
// 2차 메뉴 레벨(level === 1)인 경우
if (level === 1 && menuConfig) {
  const parentId = findParentId(menuConfig.menus, id)
  if (parentId) {
    const siblingIds = findSiblingIds(menuConfig.menus, id, parentId)
    // 형제 메뉴들을 닫고, 현재 메뉴만 토글
    const filtered = prev.filter((itemId) => !siblingIds.includes(itemId))
    // 현재 메뉴 토글
  }
}
```

#### 테스트 결과

**성공 케이스**:
- ✅ 대리운전 열려있을 때 현장실습보험 클릭 → 대리운전 닫히고 현장실습보험만 열림
- ✅ 현장실습보험 열려있을 때 약국배상책임보험 클릭 → 현장실습보험 닫히고 약국배상책임보험만 열림
- ✅ 4차 메뉴 클릭 후 호버 시 텍스트 정상 표시 (파란 배경 위에 흰색 텍스트)
- ✅ 3차, 4차 메뉴는 기존처럼 여러 개 동시에 열 수 있음

#### 향후 작업 계획

1. **추가 UX 개선**
   - 현재 활성 페이지에 해당하는 부모 메뉴 자동 열림 기능
   - 메뉴 접근성 개선 (키보드 네비게이션)

2. **성능 최적화**
   - 메뉴 구조 탐색 로직 최적화
   - 불필요한 리렌더링 방지

---

**작성자**: AI Assistant  
**최종 업데이트**: 2026년 1월 24일 00:45 (배서리스트/기사찾기 상태 표기 및 배서처리 API 보정 완료)  
**프로젝트**: Disk-CMS React 마이그레이션

---

