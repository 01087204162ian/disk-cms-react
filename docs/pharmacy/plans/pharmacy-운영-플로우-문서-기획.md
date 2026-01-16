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

### 1. 빌드 스크립트 제거

#### `package.json` 수정
```json
{
  "scripts": {
    "build": "tsc && vite build",  // copy-docs.js 제거
    // "build:docs": "npm run build" 제거 (선택)
  }
}
```

#### `scripts/copy-docs.js` 삭제
- 파일 삭제 또는 백업

---

### 2. `Documentation.tsx` 개선

#### 현재 구현
```typescript
// README.md만 로드
const response = await fetch('/docs/pharmacy/README.md')
```

#### 개선 방안

**옵션 1: 운영 플로우 문서로 완전 교체**
- `docs/pharmacy/OPERATIONS_GUIDE.md` 생성
- `Documentation.tsx`에서 이 파일만 로드

**옵션 2: 문서 선택 기능 추가**
- 사이드바에 문서 목록 표시
- 사용자가 문서를 선택하여 볼 수 있도록 구현
- 기본값: 운영 플로우 문서

**옵션 3: 단일 운영 플로우 문서 + 하위 문서 링크**
- 메인 운영 플로우 문서 하나만 로드
- 필요시 다른 문서로 링크 (새 탭 열기)

**추천**: **옵션 1** - 가장 간단하고 명확함

---

### 3. 운영 플로우 문서 작성

#### 파일 위치
- `docs/pharmacy/OPERATIONS_GUIDE.md`

#### 문서 작성 원칙
- 운영자 중심의 실용적인 내용
- 단계별 스크린샷 또는 설명 포함
- 문제 해결 방법 구체적으로 설명
- 예시 시나리오 포함
- 주의사항 명확히 표시

#### 참조할 기존 문서
- `docs/pharmacy/pharmacy-통합-문서.md` - 전체 시스템 이해
- `docs/pharmacy/guides/` - 문제 해결 방법
- `docs/pharmacy/work-logs/` - 실제 작업 내역
- `docs/pharmacy/analysis/LEARNING_SUMMARY.md` - 핵심 프로세스

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
    └── Documentation.tsx     # public/docs/pharmacy/README.md 로드
```

### 변경 후
```
disk-cms-react/
├── docs/pharmacy/
│   ├── README.md
│   └── OPERATIONS_GUIDE.md   # 새로 작성
├── src/pages/pharmacy/
│   └── Documentation.tsx     # OPERATIONS_GUIDE.md 로드 (직접 참조)
└── public/docs/pharmacy/     # 삭제 (더 이상 필요 없음)
```

---

## ✅ 구현 체크리스트

### 1단계: 문서 작성
- [ ] `docs/pharmacy/OPERATIONS_GUIDE.md` 작성
  - [ ] 1. 시스템 개요
  - [ ] 2. 일상 업무 플로우
  - [ ] 3. 신청 처리 프로세스
  - [ ] 4. 상태 변경 가이드
  - [ ] 5. 보험료 확인 및 수정
  - [ ] 6. 문제 해결 가이드
  - [ ] 7. 자주 묻는 질문(FAQ)

### 2단계: 코드 수정
- [ ] `Documentation.tsx` 수정
  - [ ] 파일 경로 변경: `OPERATIONS_GUIDE.md`
  - [ ] 제목 및 설명 업데이트
- [ ] `package.json` 수정
  - [ ] `build` 스크립트에서 `copy-docs.js` 제거
- [ ] `scripts/copy-docs.js` 삭제 또는 백업
- [ ] `public/docs/pharmacy/` 폴더 삭제 (선택)

### 3단계: 테스트
- [ ] 로컬 개발 환경에서 문서 로드 확인
- [ ] 빌드 후 문서 로드 확인
- [ ] 실제 운영 환경에서 문서 접근 확인

---

## 🎨 UI/UX 개선 사항 (선택)

### 현재 UI
- Markdown 기본 렌더링
- 스크롤 가능한 긴 문서

### 개선 제안
1. **사이드바 네비게이션**
   - 목차를 사이드바에 고정
   - 섹션별 빠른 이동

2. **검색 기능**
   - 문서 내 키워드 검색
   - 하이라이트 표시

3. **인쇄 친화적 스타일**
   - 인쇄 시 레이아웃 최적화

4. **반응형 디자인**
   - 모바일에서도 읽기 편하게

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
