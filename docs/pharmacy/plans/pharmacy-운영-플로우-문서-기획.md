# 약국배상책임보험 - 운영 플로우 문서 기획

> **작성일**: 2026-01-14  
> **목적**: `pharmacy/documentation` 페이지를 운영 플로우 문서로 전환  
> **참조**: `docs/pharmacy` 폴더의 기존 문서

---

## 📋 현재 상황

### 1. 현재 구현 상태

#### `Documentation.tsx` 컴포넌트
- **위치**: `src/pages/pharmacy/Documentation.tsx`
- **기능**: `docs/pharmacy/README.md`를 fetch하여 Markdown으로 표시
- **문제점**: 
  - `npm run build` 시 `copy-docs.js`가 `docs/pharmacy/README.md`를 `public/docs/pharmacy/README.md`로 복사
  - 빌드 과정에서 문서 파일 복사가 필요함
  - 실제 운영자가 필요한 실용적인 정보가 부족

#### 빌드 스크립트
- **파일**: `scripts/copy-docs.js`
- **기능**: `docs/pharmacy/README.md` → `public/docs/pharmacy/README.md` 복사
- **호출**: `npm run build` → `node scripts/copy-docs.js`

---

## 🎯 목표

### 1. 빌드 의존성 제거
- `npm run build` 시 문서 파일 복사 스크립트 제거
- `Documentation.tsx`가 직접 `docs/pharmacy` 폴더의 문서를 참조하도록 변경

### 2. 운영 플로우 문서 작성
- 실제 운영자가 사용할 수 있는 실용적인 가이드 작성
- `docs/pharmacy` 폴더의 기존 문서를 참조하여 운영 중심으로 재구성

---

## 📝 운영 플로우 문서 구조

### 1. 문서 개요

#### 목차
1. [시스템 개요](#1-시스템-개요)
2. [일상 업무 플로우](#2-일상-업무-플로우)
3. [신청 처리 프로세스](#3-신청-처리-프로세스)
4. [상태 변경 가이드](#4-상태-변경-가이드)
5. [보험료 확인 및 수정](#5-보험료-확인-및-수정)
6. [문제 해결 가이드](#6-문제-해결-가이드)
7. [자주 묻는 질문(FAQ)](#7-자주-묻는-질문faq)

---

### 2. 각 섹션 상세 내용

#### 1. 시스템 개요
- 약국배상책임보험 시스템이란?
- 주요 화면 소개
- 접속 방법
- 권한 설명

**참조 문서**:
- `docs/pharmacy/README.md` - 시스템 개요 섹션
- `docs/pharmacy/pharmacy-통합-문서.md` - 1. 시스템 개요

---

#### 2. 일상 업무 플로우
- 하루 업무 흐름
- 주요 기능별 사용법
  - 약국 목록 조회
  - 검색 및 필터링
  - 상세 정보 확인
  - 상태 변경
  - 메모 작성

**참조 문서**:
- `docs/pharmacy/pharmacy-통합-문서.md` - 7. 주요 기능 상세
- `docs/pharmacy/analysis/LEARNING_SUMMARY.md` - 핵심 프로세스

---

#### 3. 신청 처리 프로세스
- 신청 접수
  - 신청 정보 확인
  - 필수 정보 체크
  - 보험료 계산 확인
- 승인 처리
  - 승인 조건 확인
  - 설계번호 입력
  - 증권 발급
- 계약 완료
  - 계약 정보 확인
  - 메일 발송 확인

**참조 문서**:
- `docs/pharmacy/pharmacy-통합-문서.md` - 10. 신청 시스템
- `docs/pharmacy/work-logs/2025-01-작업내역.md` - 증권 확인 기능

**상태 코드**:
```
10: 메일보냄
13: 승인
6: 계약
7: 보류
14: 증권발급
15: 해지요청
16: 해지완료
17: 설계중
```

---

#### 4. 상태 변경 가이드
- 각 상태의 의미
- 상태 변경 조건
- 상태 변경 시 주의사항
- 상태별 필수 입력 항목

**참조 문서**:
- `docs/pharmacy/guides/pharmacy-status-update-fix-guide.md`
- `docs/pharmacy/work-logs/2026-01-02-약국배상-상태변경-오류-해결.md`

**예시 시나리오**:
1. 신청 접수 → 메일보냄 (10)
2. 메일보냄 → 승인 (13)
3. 승인 → 설계중 (17)
4. 설계중 → 증권발급 (14)
5. 증권발급 → 계약 (6)

---

#### 5. 보험료 확인 및 수정
- 보험료 구성 요소
  - 전문인 보험료 (`expert_premium`)
  - 화재 보험료 (`fire_premium`)
  - 총 보험료 (`premium`)
- 보험료 계산 기준
  - 전문인 수
  - 사업장 면적 (80㎡ 기준)
  - 재고자산 가치
- 보험료 수정 시 주의사항
  - 승인 상태에서는 수정 불가 원칙
  - 보험료 수정 시 재계산 프로세스

**참조 문서**:
- `docs/pharmacy/guides/보험료-표기-문제-확인-가이드.md`
- `docs/pharmacy/pharmacy-통합-문서.md` - 13. 보험료 검증

**문제 해결 예시**:
- 화재보험료가 "해당없음"으로 표시되는 경우
- 보험료가 메일과 다른 경우

---

#### 6. 문제 해결 가이드
- 자주 발생하는 문제
  - 보험료 표기 오류
  - 상태 변경 실패
  - 설계번호 입력 오류
  - 증권 발급 오류
- 문제 확인 방법
  - DB 직접 확인
  - API 응답 확인
  - 로그 확인
- 해결 방법
  - 단계별 문제 해결 절차
  - 수동 처리 방법

**참조 문서**:
- `docs/pharmacy/guides/` 폴더의 모든 문서
- `docs/pharmacy/work-logs/` 폴더의 오류 해결 내역

---

#### 7. 자주 묻는 질문(FAQ)
- Q: 승인 상태에서 보험료를 수정할 수 있나요?
- Q: 화재보험료가 표시되지 않는데 어떻게 해야 하나요?
- Q: 설계번호를 잘못 입력했는데 수정할 수 있나요?
- Q: 증권 발급 후 계약 상태로 변경하는 방법은?

**참조 문서**:
- `docs/pharmacy/guides/보험료-표기-문제-확인-가이드.md`
- `docs/pharmacy/pharmacy-통합-문서.md` - 부록

---

## 🛠️ 구현 방법

### 구현 방식: HTML/JSX 직접 작성

**핵심 변경사항**:
- ❌ Markdown 파일 로드 방식 제거
- ✅ React 컴포넌트 내에서 HTML/JSX로 직접 작성
- ✅ 빌드 의존성 완전 제거 (copy-docs.js 불필요)
- ✅ Tailwind CSS로 스타일링

---

### 1. 빌드 스크립트 제거

#### `package.json` 수정
```json
{
  "scripts": {
    "build": "tsc && vite build",  // copy-docs.js 제거
  }
}
```

#### `scripts/copy-docs.js` 삭제
- 파일 삭제 또는 백업

#### `public/docs/pharmacy/` 폴더 삭제
- 더 이상 필요 없음

---

### 2. `Documentation.tsx` 완전 재작성

#### 현재 구현 (제거)
```typescript
// ❌ Markdown 파일 fetch 방식
const response = await fetch('/docs/pharmacy/README.md')
const text = await response.text()
<ReactMarkdown>{content}</ReactMarkdown>
```

#### 새로운 구현 (HTML/JSX 직접 작성)
```typescript
// ✅ HTML/JSX로 직접 작성
export default function Documentation() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">약국배상책임보험 운영 가이드</h1>
      </div>
      
      {/* 섹션 1: 시스템 개요 */}
      <section id="system-overview" className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">1. 시스템 개요</h2>
        {/* HTML 콘텐츠 직접 작성 */}
      </section>
      
      {/* 섹션 2: 일상 업무 플로우 */}
      <section id="daily-workflow" className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">2. 일상 업무 플로우</h2>
        {/* HTML 콘텐츠 직접 작성 */}
      </section>
      
      {/* ... 나머지 섹션들 ... */}
    </div>
  )
}
```

#### 장점
- ✅ 빌드 의존성 없음
- ✅ React 컴포넌트로 동적 기능 추가 가능
- ✅ Tailwind CSS로 일관된 스타일링
- ✅ 코드와 문서가 함께 관리됨

---

### 3. 운영 플로우 문서 작성

#### 파일 위치
- `src/pages/pharmacy/Documentation.tsx` - 직접 HTML/JSX로 작성

#### 문서 작성 원칙
- 운영자 중심의 실용적인 내용
- Tailwind CSS 클래스로 스타일링
- 섹션별로 명확히 구분
- 단계별 설명은 리스트나 테이블 활용
- 주의사항은 알림 박스로 강조
- 예시는 코드 블록 또는 테이블로 표시

#### 참조할 기존 문서
- `docs/pharmacy/pharmacy-통합-문서.md` - 전체 시스템 이해
- `docs/pharmacy/guides/` - 문제 해결 방법
- `docs/pharmacy/work-logs/` - 실제 작업 내역
- `docs/pharmacy/analysis/LEARNING_SUMMARY.md` - 핵심 프로세스

#### 스타일 가이드
```tsx
// 제목
<h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">섹션 제목</h2>

// 단락
<p className="text-gray-700 mb-4">내용...</p>

// 리스트
<ul className="list-disc list-inside space-y-2 mb-4">
  <li>항목 1</li>
  <li>항목 2</li>
</ul>

// 알림 박스
<div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
  <p className="text-blue-800">주의사항 또는 중요 정보</p>
</div>

// 테이블
<table className="min-w-full border-collapse border border-gray-300 mb-4">
  <thead className="bg-gray-100">
    <tr>
      <th className="border border-gray-300 px-4 py-2">항목</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="border border-gray-300 px-4 py-2">내용</td>
    </tr>
  </tbody>
</table>
```

---

## 📦 파일 구조

### 변경 전
```
disk-cms-react/
├── docs/pharmacy/
│   └── README.md
├── scripts/
│   └── copy-docs.js          # 빌드 시 실행
├── public/docs/pharmacy/
│   └── README.md             # 빌드 시 복사됨
└── src/pages/pharmacy/
    └── Documentation.tsx     # public/docs/pharmacy/README.md 로드 (Markdown)
```

### 변경 후
```
disk-cms-react/
├── docs/pharmacy/            # 참조용 문서 (코드에서 직접 사용 안 함)
│   ├── README.md
│   └── ... (기타 문서들)
├── src/pages/pharmacy/
│   └── Documentation.tsx     # HTML/JSX로 직접 작성된 운영 가이드
└── scripts/
    └── copy-docs.js          # 삭제
└── public/docs/pharmacy/     # 삭제
```

---

## ✅ 구현 체크리스트 (순서대로 진행)

### 1단계: 기획 및 구조 설계
- [x] 기획 문서 작성 (현재 문서)
- [ ] `docs/pharmacy` 폴더의 기존 문서 검토
- [ ] 운영 플로우 문서 섹션별 내용 정리
- [ ] UI/UX 구조 설계 (사이드바 네비게이션 등)

### 2단계: 빌드 의존성 제거
- [ ] `package.json` 수정
  - [ ] `build` 스크립트에서 `node scripts/copy-docs.js` 제거
- [ ] `scripts/copy-docs.js` 삭제 또는 백업
- [ ] `public/docs/pharmacy/` 폴더 삭제 (있는 경우)

### 3단계: `Documentation.tsx` 재작성
- [ ] Markdown 로드 로직 제거
- [ ] ReactMarkdown 관련 import 제거
- [ ] 기본 레이아웃 구조 작성
  - [ ] 헤더 섹션
  - [ ] 사이드바 네비게이션 (선택)
  - [ ] 메인 콘텐츠 영역
- [ ] 섹션별 HTML/JSX 콘텐츠 작성
  - [ ] 1. 시스템 개요
  - [ ] 2. 일상 업무 플로우
  - [ ] 3. 신청 처리 프로세스
  - [ ] 4. 상태 변경 가이드
  - [ ] 5. 보험료 확인 및 수정
  - [ ] 6. 문제 해결 가이드
  - [ ] 7. 자주 묻는 질문(FAQ)

### 4단계: 스타일링 및 UI 개선
- [ ] Tailwind CSS 클래스 적용
- [ ] 반응형 디자인 확인
- [ ] 섹션 간 간격 및 레이아웃 조정
- [ ] 알림 박스, 테이블, 리스트 스타일링

### 5단계: 테스트
- [ ] 로컬 개발 환경에서 페이지 로드 확인
- [ ] 빌드 후 페이지 정상 작동 확인
- [ ] 실제 운영 환경에서 접근 확인
- [ ] 모바일 반응형 확인

---

## 🎨 UI/UX 설계

### 기본 레이아웃
```
┌─────────────────────────────────────┐
│  헤더 (제목, 설명)                     │
├──────────┬──────────────────────────┤
│          │                          │
│ 사이드바  │   메인 콘텐츠 영역        │
│ (목차)    │   (섹션별 내용)            │
│          │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

### 필수 UI 요소
1. **헤더**
   - 페이지 제목: "약국배상책임보험 운영 가이드"
   - 간단한 설명

2. **사이드바 네비게이션** (선택, 1단계에서는 생략 가능)
   - 목차 고정
   - 섹션별 링크
   - 현재 섹션 하이라이트

3. **메인 콘텐츠**
   - 섹션별 제목 (h2)
   - 단락, 리스트, 테이블
   - 알림 박스 (주의사항)
   - 코드 블록 (예시)

4. **반응형 디자인**
   - 모바일: 사이드바 숨김 또는 하단으로 이동
   - 태블릿/데스크톱: 사이드바 + 메인 콘텐츠

### 스타일 가이드
- **색상**: Tailwind 기본 색상 사용
- **타이포그래피**: 시스템 폰트
- **간격**: Tailwind spacing scale
- **알림 박스 색상**:
  - 정보: `bg-blue-50 border-blue-500`
  - 경고: `bg-yellow-50 border-yellow-500`
  - 주의: `bg-red-50 border-red-500`
  - 성공: `bg-green-50 border-green-500`

---

## 📊 기대 효과

### 1. 빌드 과정 단순화
- 문서 파일 복사 과정 제거
- 빌드 시간 단축
- 빌드 실패 가능성 감소

### 2. 문서 유지보수 개선
- 소스 파일(`docs/pharmacy/OPERATIONS_GUIDE.md`) 직접 수정 가능
- 빌드 없이 문서 업데이트 반영 가능
- 버전 관리 용이

### 3. 운영 효율성 향상
- 실제 운영자가 필요한 정보 중심으로 재구성
- 문제 해결 시간 단축
- 신규 운영자 교육 자료로 활용

---

## 🔄 향후 개선 방향

### 단기 (1개월)
- 운영 플로우 문서 완성
- 빌드 스크립트 제거 및 테스트

### 중기 (3개월)
- UI/UX 개선 (사이드바 네비게이션 등)
- 사용자 피드백 반영

### 장기 (6개월)
- 다른 상품(대리운전, 현장실습 등)에도 동일한 운영 플로우 문서 적용
- 문서 자동화 도구 구축

---

## 📝 참고 자료

### 관련 문서
- `docs/pharmacy/README.md` - 현재 문서 구조
- `docs/pharmacy/pharmacy-통합-문서.md` - 전체 시스템 문서
- `docs/pharmacy/guides/` - 문제 해결 가이드
- `docs/pharmacy/work-logs/` - 작업 내역

### 관련 코드
- `src/pages/pharmacy/Documentation.tsx` - 현재 문서 페이지
- `src/pages/pharmacy/Applications.tsx` - 실제 운영 화면
- `scripts/copy-docs.js` - 문서 복사 스크립트

---

**문서 버전**: 1.0  
**작성일**: 2026-01-14  
**최종 업데이트**: 2026-01-14
