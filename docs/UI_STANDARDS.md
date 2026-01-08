# UI 표준 가이드 - Disk-CMS React

> **목적**: 프로젝트 전체에서 일관된 UI/UX를 제공하기 위한 디자인 시스템 표준

---

## 📋 목차

1. [필터 영역 표준](#1-필터-영역-표준)
2. [모달 표준](#2-모달-표준)
3. [작업 열 아이콘 표준](#3-작업-열-아이콘-표준)
4. [공통 컴포넌트 사용 가이드](#4-공통-컴포넌트-사용-가이드)

---

## 1. 필터 영역 표준

### 1.1 레이아웃 구조

```tsx
<div className="bg-card rounded-xl border border-border p-6">
  {/* 필터 행 */}
  <div className="flex flex-wrap items-center gap-3">
    {/* Select 요소들 */}
    <select className="filter-select">...</select>
    <select className="filter-select">...</select>
    
    {/* Input 요소 */}
    <div className="flex-1 relative min-w-[200px]">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
      <input className="filter-input" />
    </div>
    
    {/* 검색 버튼 */}
    <button className="filter-button">검색</button>
    
    {/* 통계 정보 - 오른쪽 끝 */}
    <div className="flex flex-wrap items-center gap-4 text-xs ml-auto">
      {/* 통계 정보 */}
    </div>
  </div>
  
  {/* 액션 버튼 영역 */}
  <div className="mt-4 pt-4 border-t border-border">
    <div className="flex flex-wrap gap-2">
      {/* 액션 버튼들 */}
    </div>
  </div>
</div>
```

### 1.2 Select 요소 표준

**스타일 클래스**:
```tsx
className="h-10 px-3 py-0 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm leading-none font-normal appearance-none cursor-pointer"
```

**인라인 스타일**:
```tsx
style={{
  fontFamily: 'inherit',
  lineHeight: '1.5',
  boxSizing: 'border-box',
  minHeight: '40px',
  height: '40px'
}}
```

**요구사항**:
- 높이: `40px` (고정)
- 패딩: `px-3 py-0`
- 폰트: `text-sm leading-none font-normal`
- 브라우저 기본 스타일 제거: `appearance-none`

### 1.3 Input 요소 표준

**스타일 클래스** (검색 아이콘 포함):
```tsx
className="w-full pl-10 pr-3 py-0 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm leading-none font-normal"
```

**인라인 스타일**:
```tsx
style={{
  fontFamily: 'inherit',
  lineHeight: '1.5',
  boxSizing: 'border-box',
  minHeight: '42px',
  height: '42px'
}}
```

**요구사항**:
- 높이: `42px` (select보다 2px 더 높음)
- 왼쪽 패딩: `pl-10` (아이콘 공간)
- 오른쪽 패딩: `pr-3` (select와 동일)
- 폰트: `text-sm leading-none font-normal`

**검색 아이콘 위치**:
```tsx
<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
```

### 1.4 버튼 표준

**검색 버튼**:
```tsx
className="h-10 px-3 py-0 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm leading-none font-normal"
```

**인라인 스타일**:
```tsx
style={{
  fontFamily: 'inherit',
  lineHeight: '1.5'
}}
```

**액션 버튼** (부서 관리, 엑셀 다운로드 등):
```tsx
className="px-3 py-1.5 bg-info text-info-foreground rounded-lg text-xs font-medium hover:bg-info/90 transition-colors flex items-center gap-1.5"
```

**아이콘 크기**:
- 액션 버튼: `w-3 h-3`
- 검색 버튼: `w-4 h-4`

### 1.5 통계 정보 표준

**위치**: 필터 행의 오른쪽 끝 (`ml-auto`)

**스타일**:
```tsx
className="flex flex-wrap items-center gap-4 text-xs ml-auto"
```

**표시 형식**:
```tsx
<span className="text-foreground">전체 <strong>{total}</strong>명</span>
<span className="text-yellow-600">승인대기 <strong>{pending}</strong>명</span>
<span className="text-green-600">활성 <strong>{active}</strong>명</span>
<span className="text-muted-foreground">비활성 <strong>{inactive}</strong>명</span>
<span className="text-muted-foreground">갱신: {lastRefresh.toLocaleTimeString('ko-KR')}</span>
```

**주의사항**:
- "직원 현황:" 같은 라벨 텍스트는 사용하지 않음
- 숫자는 `<strong>` 태그로 강조

---

## 2. 모달 표준

### 2.1 모달 구조

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
  <div className="w-full max-w-{size} rounded-xl bg-background border border-border overflow-hidden">
    {/* 헤더 */}
    <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-4 flex items-center justify-between">
      <h5 className="text-lg font-semibold text-white m-0">
        모달 제목
      </h5>
      <button
        onClick={onClose}
        className="text-white hover:bg-white/10 rounded p-1 text-xl leading-none transition-colors"
        aria-label="닫기"
      >
        ×
      </button>
    </div>
    
    {/* 본문 */}
    <div className="p-6 bg-white">
      {/* 내용 */}
    </div>
    
    {/* 푸터 - 닫기 버튼 없음 */}
    {/* 헤더의 X 버튼만 사용 */}
  </div>
</div>
```

### 2.2 모달 헤더 표준

**필수 요소**:
- 보라색 그라데이션 배경: `bg-gradient-to-r from-[#667eea] to-[#764ba2]`
- 흰색 텍스트: `text-white`
- X 닫기 버튼 (오른쪽 상단)

**헤더 스타일**:
```tsx
className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-4 flex items-center justify-between"
```

**닫기 버튼**:
```tsx
<button
  onClick={onClose}
  className="text-white hover:bg-white/10 rounded p-1 text-xl leading-none transition-colors"
  aria-label="닫기"
>
  ×
</button>
```

### 2.3 모달 본문 표준

**배경**: `bg-white`

**패딩**: `p-6`

**폰트**: 모달 내부 모든 텍스트는 `text-xs` 사용

### 2.4 모달 푸터 표준

**규칙**: 모달 푸터에 "닫기" 또는 "취소" 버튼을 두지 않음

**이유**: 헤더의 X 버튼으로만 닫기 가능

**푸터가 필요한 경우**:
- 작업 버튼만 포함 (수정, 저장, 삭제 등)
- 닫기/취소 버튼은 제거

**예시** (푸터가 필요한 경우):
```tsx
<div className="mt-6 flex gap-2 justify-end border-t pt-4">
  <button onClick={onSave}>저장</button>
  {/* 닫기 버튼 없음 */}
</div>
```

### 2.5 모달 내부 입력 요소 표준

**레이블 사용 안 함**: 
- 모든 입력 필드는 플레이스홀더만 사용
- 레이블 텍스트는 플레이스홀더에 포함

**플레이스홀더 형식**:
```tsx
placeholder="필드명 * (예: 예시값)"
placeholder="필드명 (선택사항)"
```

**입력 요소 스타일**:
```tsx
className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
```

### 2.6 모달 섹션 제목 제거

**규칙**: 
- "새 부서 추가" 같은 섹션 제목 제거
- "기존 부서 목록 (5개)" 같은 목록 제목 제거
- 모달 헤더만 제목으로 사용

---

## 3. 작업 열 아이콘 표준

### 3.1 아이콘 사용 규칙

**사용 안 함**:
- ❌ Eye (눈) 아이콘 - 상세보기 버튼 제거

**사용**:
- ✅ Edit (연필) 아이콘 - 수정/상세보기
- ✅ Trash2 (휴지통) 아이콘 - 비활성화
- ✅ RefreshCw (새로고침) 아이콘 - 활성화

### 3.2 작업 버튼 스타일

**데스크톱 테이블**:
```tsx
<button
  className="p-1.5 text-warning hover:bg-warning/10 rounded-lg transition-colors"
  title="수정"
  onClick={() => handleEdit(item)}
>
  <Edit className="w-3.5 h-3.5" />
</button>
```

**모바일 카드**:
```tsx
<button
  className="flex-1 px-3 py-2 bg-warning/10 text-warning rounded-lg text-sm font-medium flex items-center justify-center gap-2"
  onClick={() => handleEdit(item)}
>
  <Edit className="w-4 h-4" />
  수정
</button>
```

### 3.3 아이콘 크기

- 데스크톱: `w-3.5 h-3.5` (14px)
- 모바일: `w-4 h-4` (16px)

---

## 4. 공통 컴포넌트 사용 가이드

### 4.1 Modal 컴포넌트

**Import**:
```tsx
import { Modal } from '../../components'
```

**기본 사용법**:
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="모달 제목"
  maxWidth="lg" // sm | md | lg | xl | 2xl | 4xl | 6xl
>
  {/* 모달 본문 */}
  <div className="grid grid-cols-1 gap-3">
    <input
      type="text"
      placeholder="입력 필드명 *"
      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  
  {/* 푸터 (선택적) */}
  <div slot="footer" className="mt-6 flex gap-2 justify-end">
    <button onClick={onSave}>저장</button>
  </div>
</Modal>
```

**Props**:
- `isOpen`: 모달 열림/닫힘 상태 (boolean)
- `onClose`: 닫기 핸들러 함수
- `title`: 모달 제목 (string)
- `maxWidth`: 최대 너비 (기본값: 'lg')
- `children`: 모달 본문 내용
- `footer`: 푸터 내용 (선택적, ReactNode)

**주의사항**:
- 헤더에 X 버튼이 자동으로 포함됨
- 푸터에는 닫기/취소 버튼을 넣지 않음
- 본문은 `text-xs` 폰트 사용

### 4.2 FilterBar 컴포넌트

**Import**:
```tsx
import { FilterBar } from '../../components'
```

**기본 사용법**:
```tsx
<FilterBar
  actionButtons={
    <>
      <button>액션 1</button>
      <button>액션 2</button>
    </>
  }
>
  {/* Select 필터 */}
  <FilterBar.Select
    value={filters.department}
    onChange={(value) => handleFilterChange('department', value)}
    options={[
      { value: '', label: '전체 부서' },
      { value: '1', label: '개발팀' },
    ]}
  />
  
  {/* Input 필터 */}
  <FilterBar.Input
    value={filters.search}
    onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
    onSearch={handleSearch}
    placeholder="검색어 입력"
  />
  
  {/* 검색 버튼 */}
  <FilterBar.SearchButton onClick={handleSearch} />
  
  {/* 통계 정보 */}
  <FilterBar.Stats
    stats={[
      { label: '전체', value: stats.total, color: 'foreground' },
      { label: '승인대기', value: stats.pending, color: 'yellow' },
      { label: '활성', value: stats.active, color: 'green' },
      { label: '비활성', value: stats.inactive, color: 'muted' },
    ]}
    lastRefresh={lastRefresh}
  />
</FilterBar>
```

**FilterBar.Select Props**:
- `value`: 선택된 값
- `onChange`: 변경 핸들러 (value: string)
- `options`: 옵션 배열 `{ value: string, label: string }[]`
- `placeholder`: 기본 옵션 라벨 (선택적)

**FilterBar.Input Props**:
- `value`: 입력값
- `onChange`: 변경 핸들러 (value: string)
- `onSearch`: 검색 핸들러 (선택적, Enter 키 또는 검색 버튼)
- `placeholder`: 플레이스홀더 (선택적)

**FilterBar.Stats Props**:
- `stats`: 통계 배열 `Array<{ label: string, value: number | string, color?: 'foreground' | 'yellow' | 'green' | 'muted' }>`
- `lastRefresh`: 마지막 갱신 시간 (Date, 선택적)

### 4.3 DataTable 컴포넌트

**Import**:
```tsx
import { DataTable, type Column } from '../../components'
```

**기본 사용법**:
```tsx
const columns: Column<Employee>[] = [
  {
    key: 'name',
    header: '이름',
    cell: (row) => <div className="font-medium text-xs">{row.name}</div>,
  },
  {
    key: 'email',
    header: '이메일',
    cell: (row) => (
      <a href={`mailto:${row.email}`} className="text-primary hover:underline text-xs">
        {row.email}
      </a>
    ),
  },
  {
    key: 'actions',
    header: '작업',
    cell: (row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleEdit(row)}>수정</button>
      </div>
    ),
  },
]

<DataTable
  data={employees}
  columns={columns}
  loading={loading}
  emptyMessage="직원 데이터가 없습니다."
  onRowClick={(row) => handleRowClick(row)}
  pagination={{
    currentPage: currentPage,
    pageSize: pageSize,
    totalCount: totalCount,
    onPageChange: setCurrentPage,
    onPageSizeChange: setPageSize,
    pageSizeOptions: [20, 50, 100],
  }}
  mobileCard={(row) => (
    <div className="p-4 space-y-3">
      <div>{row.name}</div>
      <div>{row.email}</div>
    </div>
  )}
/>
```

**Props**:
- `data`: 테이블 데이터 배열
- `columns`: 컬럼 정의 배열 `Column<T>[]`
- `loading`: 로딩 상태 (선택적)
- `emptyMessage`: 빈 데이터 메시지 (선택적, 기본값: "데이터가 없습니다.")
- `onRowClick`: 행 클릭 핸들러 (선택적)
- `pagination`: 페이지네이션 설정 (선택적)
  - `currentPage`: 현재 페이지
  - `pageSize`: 페이지 크기
  - `totalCount`: 전체 데이터 수
  - `onPageChange`: 페이지 변경 핸들러
  - `onPageSizeChange`: 페이지 크기 변경 핸들러 (선택적)
  - `pageSizeOptions`: 페이지 크기 옵션 배열 (선택적)
- `mobileCard`: 모바일 카드 렌더링 함수 (선택적)
- `className`: 추가 클래스명 (선택적)

**Column 타입**:
```tsx
interface Column<T> {
  key: string // 데이터 키
  header: string // 헤더 텍스트
  cell?: (row: T) => ReactNode // 커스텀 셀 렌더링 (선택적)
  sortable?: boolean // 정렬 가능 여부 (선택적)
  className?: string // 추가 클래스명 (선택적)
  hidden?: boolean // 반응형 숨김 (선택적, lg:hidden 등)
}
```

### 4.4 FormInput 컴포넌트

**Import**:
```tsx
import { FormInput } from '../../components'
```

**기본 사용법**:
```tsx
<FormInput
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="입력 필드명 *"
  variant="modal" // default | filter | modal
  error={errorMessage} // 선택적
  helperText="도움말 텍스트" // 선택적
  className="w-full"
/>
```

**Props**:
- `type`: 입력 타입 (기본값: 'text')
- `value`: 입력값
- `onChange`: 변경 핸들러 (React input 이벤트)
- `placeholder`: 플레이스홀더
- `variant`: 스타일 variant ('default', 'filter', 'modal')
- `label`: 레이블 (선택적, label이 있으면 표시)
- `error`: 에러 메시지 (선택적)
- `helperText`: 도움말 텍스트 (선택적)
- `leftIcon`: 왼쪽 아이콘 (선택적)
- `rightIcon`: 오른쪽 아이콘 (선택적)
- `fullWidth`: 전체 너비 여부 (기본값: true)
- `variant="filter"`일 때 자동으로 검색 아이콘 표시

### 4.5 DatePicker 컴포넌트

**Import**:
```tsx
import { DatePicker } from '../../components'
```

**기본 사용법**:
```tsx
<DatePicker
  value={dateValue}
  onChange={(value) => setDateValue(value)}
  placeholder="날짜 선택"
  variant="modal" // default | filter | modal
  min="2024-01-01" // 선택적
  max="2025-12-31" // 선택적
  className="w-full"
/>
```

**Props**:
- `value`: 날짜 값 (string, 'YYYY-MM-DD' 형식)
- `onChange`: 변경 핸들러 ((value: string) => void)
- `placeholder`: 플레이스홀더
- `variant`: 스타일 variant
- `min`: 최소 날짜 (선택적)
- `max`: 최대 날짜 (선택적)
- Calendar 아이콘 자동 포함

### 4.6 Select 컴포넌트

**Import**:
```tsx
import { Select } from '../../components'
```

**기본 사용법**:
```tsx
<Select
  value={selectedValue}
  onChange={(e) => setSelectedValue(e.target.value)}
  options={[
    { value: '1', label: '옵션 1' },
    { value: '2', label: '옵션 2' },
  ]}
  placeholder="선택하세요"
  variant="modal" // default | filter | modal
  className="w-full"
/>
```

**Props**:
- `value`: 선택된 값
- `onChange`: 변경 핸들러 (React select 이벤트)
- `options`: 옵션 배열 `Array<{ value: string | number, label: string, disabled?: boolean }>`
- `placeholder`: 기본 옵션 라벨 (선택적)
- `variant`: 스타일 variant
- `label`: 레이블 (선택적)
- `error`: 에러 메시지 (선택적)
- `helperText`: 도움말 텍스트 (선택적)
- ChevronDown 아이콘 자동 포함

### 4.7 LoadingSpinner 컴포넌트

**Import**:
```tsx
import { LoadingSpinner } from '../../components'
```

**기본 사용법**:
```tsx
{loading && <LoadingSpinner size="md" text="불러오는 중..." />}

// 전체 화면 오버레이
{loading && <LoadingSpinner fullScreen text="불러오는 중..." />}
```

**Props**:
- `size`: 크기 ('sm', 'md', 'lg', 기본값: 'md')
- `color`: 색상 ('primary', 'muted', 'white', 기본값: 'primary')
- `text`: 로딩 메시지 (선택적)
- `fullScreen`: 전체 화면 오버레이 모드 (기본값: false)

### 4.8 Toast 컴포넌트

**Import**:
```tsx
import { useToastHelpers } from '../../components'
```

**기본 사용법**:
```tsx
function MyComponent() {
  const toast = useToastHelpers()

  const handleSuccess = () => {
    toast.success('작업이 완료되었습니다.')
  }

  const handleError = () => {
    toast.error('오류가 발생했습니다.')
  }

  const handleWarning = () => {
    toast.warning('경고 메시지')
  }

  const handleInfo = () => {
    toast.info('정보 메시지')
  }

  return (
    // ...
  )
}
```

**ToastProvider 설정**:
```tsx
// App.tsx에서 ToastProvider로 감싸기
import { ToastProvider } from './components'

function App() {
  return (
    <ToastProvider>
      {/* 앱 컴포넌트 */}
    </ToastProvider>
  )
}
```

**Toast 함수들**:
- `toast.success(message, duration?)`: 성공 메시지
- `toast.error(message, duration?)`: 에러 메시지
- `toast.warning(message, duration?)`: 경고 메시지
- `toast.info(message, duration?)`: 정보 메시지

**특징**:
- 우측 상단에 자동 배치 (top-20 right-4)
- 자동 사라짐 (기본 3초, duration 설정 가능)
- 수동 닫기 버튼 포함
- 타입별 아이콘 자동 표시

---

## 5. 적용 대상 페이지

다음 페이지에 이 표준을 적용해야 합니다:

- ✅ `src/pages/staff/Employees.tsx` - 완료 (모달, 필터, 테이블, 공통 컴포넌트 적용)
- ✅ `src/pages/staff/Holidays.tsx` - 완료 (모달, 공통 컴포넌트 적용)
- ✅ `src/pages/staff/HalfDayApproval.tsx` - 완료 (모달, 공통 컴포넌트 적용)
- ✅ `src/pages/staff/EmployeeSchedule.tsx` - 완료 (모달, 공통 컴포넌트 적용)
- ✅ `src/pages/staff/OrganizationChart.tsx` - 완료 (필터 적용)
- ⏳ `src/pages/Login.tsx` - 모달 적용 필요 (있는 경우)

---

## 6. 체크리스트

### 필터 영역
- [ ] Select 요소 높이 40px, 스타일 적용
- [ ] Input 요소 높이 42px, 스타일 적용
- [ ] 버튼 스타일 통일
- [ ] 통계 정보 오른쪽 끝 배치 (라벨 없음)

### 모달
- [ ] 헤더 그라데이션 배경 적용
- [ ] 헤더 X 버튼만 사용 (푸터 닫기 버튼 제거)
- [ ] 본문 폰트 `text-xs` 사용
- [ ] 입력 요소 레이블 제거, 플레이스홀더만 사용
- [ ] 섹션 제목 제거

### 작업 열
- [ ] Eye 아이콘 제거
- [ ] Edit 아이콘만 사용 (수정/상세보기)

---

**작성일**: 2026-01-07  
**최종 수정**: 2026-01-07
