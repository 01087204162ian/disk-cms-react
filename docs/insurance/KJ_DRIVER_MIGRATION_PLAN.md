# KJ 대리운전 React 마이그레이션 계획

> **작성일**: 2026년 1월 11일  
> **목적**: disk-cms의 KJ 대리운전 모듈을 React로 마이그레이션하는 계획 수립  
> **규칙**: 사용자 동의 후 순차적으로 진행, 동의 없이 작업하지 않음

---

## 📊 현재 상태 분석

### 기존 시스템 (disk-cms)

#### 프론트엔드 구조
- **위치**: `disk-cms/public/pages/insurance/`
- **페이지 수**: 5개
- **기술 스택**: HTML + Vanilla JS + Bootstrap 5

#### 페이지 목록
1. **kj-driver-company.html** - 대리업체 관리
   - 업체 목록 조회, 필터링, 상세 모달
   
2. **kj-driver-search.html** - 기사 찾기
   - 이름/주민번호 검색
   
3. **kj-driver-policy-search.html** - 증권번호 찾기
   - 계약자명/차량번호 검색
   
4. **kj-driver-endorse-list.html** - 배서 리스트
   - 배서 처리 상태 관리, 보험료 계산
   
5. **kj-driver-code-by-policy.html** - 증권별 코드
   - 증권 상세 정보, 담당자별 보험료 통계

#### JavaScript 파일
- `kj-driver-company.js` - 업체 관리 로직
- `kj-driver-search.js` - 기사 검색 로직
- `kj-driver-policy-search.js` - 증권 검색 로직
- `kj-driver-endorse-list.js` - 배서 리스트 로직
- `kj-driver-code-by-policy.js` - 증권별 코드 로직
- `kj-company-modal.js` - 공통 업체 모달
- `kj-constants.js` - 공통 상수

#### 백엔드 API
- **PHP API 위치**: `pci0327/api/insurance/*`
- **프로덕션 URL**: `https://pcikorea.com/api/insurance/*`
- **Node.js 프록시**: `disk-cms/routes/insurance/*`
- **API 파일 수**: 약 35개 (업체 관리, 증권 관리, 배서 처리, 일일배서 등)

### React 마이그레이션 대상 (disk-cms-react)

#### 현재 상태
- ❌ insurance 페이지 미구현
- ✅ 공통 컴포넌트 사용 가능 (DataTable, FilterBar, Modal 등)
- ✅ UI 표준 정의 완료
- ✅ 약국배상책임보험 마이그레이션 참고 가능

#### 목표 구조
- **위치**: `disk-cms-react/src/pages/insurance/`
- **기술 스택**: React 18.3+ + TypeScript + Tailwind CSS
- **공통 컴포넌트**: 기존에 개발된 컴포넌트 재사용

---

## 🎯 마이그레이션 목표

### 목표 1: 기능 100% 재현
- 기존 HTML/JS 기능을 React로 완전히 재현
- API 호출 로직 유지 (기존 백엔드 API 그대로 사용)
- UI/UX 일관성 유지

### 목표 2: 코드 품질 개선
- TypeScript 타입 안정성 확보
- 공통 컴포넌트 재사용
- 컴포넌트 구조화 및 재사용성 향상

### 목표 3: 유지보수성 향상
- 명확한 컴포넌트 구조
- 타입 안정성
- 문서화

---

## 📋 마이그레이션 계획

### Phase 1: 준비 작업 (예상 2-4시간)

#### 1-1. 프로젝트 구조 설정
- [ ] `src/pages/insurance/` 폴더 생성
- [ ] `src/pages/insurance/components/` 폴더 생성 (공통 컴포넌트용)
- [ ] 라우팅 설정 (`App.tsx`에 라우트 추가)
- [ ] Sidebar 메뉴에 insurance 메뉴 추가

#### 1-2. 기존 코드 분석
- [ ] 각 HTML/JS 파일 분석
- [ ] API 엔드포인트 매핑
- [ ] 데이터 구조 파악
- [ ] 공통 로직 식별

#### 1-3. 문서 확인
- [ ] `disk-cms/docs/kj/kj-대리운전-시스템-개요.md` 학습
- [ ] `disk-cms/docs/kj/kj-대리운전-업무플로우.md` 학습
- [ ] 약국배상책임보험 마이그레이션 참고

### Phase 2: 페이지별 마이그레이션 (예상 30-40시간)

#### 우선순위 1: 기사 찾기 (kj-driver-search)
- **예상 시간**: 6-8시간
- **난이도**: ⭐⭐⭐
- **주요 기능**:
  - 이름/주민번호 검색
  - 검색 결과 목록
  - 상세 정보 표시
- **의존성**: 낮음 (독립적인 기능)

#### 우선순위 2: 증권번호 찾기 (kj-driver-policy-search)
- **예상 시간**: 6-8시간
- **난이도**: ⭐⭐⭐
- **주요 기능**:
  - 계약자명/차량번호 검색
  - 검색 결과 목록
  - 증권 상세 정보
- **의존성**: 낮음

#### 우선순위 3: 대리업체 관리 (kj-driver-company)
- **예상 시간**: 8-10시간
- **난이도**: ⭐⭐⭐⭐
- **주요 기능**:
  - 업체 목록 조회
  - 필터링 (이름, 지역 등)
  - 업체 상세 모달
  - 업체 정보 수정
- **의존성**: 중간 (공통 모달 컴포넌트 필요)

#### 우선순위 4: 증권별 코드 (kj-driver-code-by-policy)
- **예상 시간**: 6-8시간
- **난이도**: ⭐⭐⭐
- **주요 기능**:
  - 증권 상세 정보
  - 담당자별 보험료 통계
  - 코드별 정보 표시
- **의존성**: 중간

#### 우선순위 5: 배서 리스트 (kj-driver-endorse-list)
- **예상 시간**: 8-10시간
- **난이도**: ⭐⭐⭐⭐
- **주요 기능**:
  - 배서 리스트 조회
  - 배서 상태 업데이트
  - 보험료 계산
  - 필터링 및 검색
- **의존성**: 높음 (복잡한 비즈니스 로직)

### Phase 3: 공통 컴포넌트 및 리팩토링 (예상 4-6시간)

#### 3-1. 공통 컴포넌트 개발
- [ ] 업체 모달 컴포넌트 (kj-company-modal.js → React)
- [ ] 상수 정의 파일 (kj-constants.js → TypeScript)
- [ ] 공통 유틸리티 함수

#### 3-2. 코드 리팩토링
- [ ] 중복 코드 제거
- [ ] 컴포넌트 재사용성 향상
- [ ] 타입 정의 정리

### Phase 4: 테스트 및 최적화 (예상 4-6시간)

#### 4-1. 기능 테스트
- [ ] 각 페이지 기능 테스트
- [ ] API 연동 테스트
- [ ] 에러 처리 테스트

#### 4-2. UI/UX 검증
- [ ] 반응형 디자인 확인
- [ ] 브라우저 호환성 확인
- [ ] 접근성 확인

#### 4-3. 성능 최적화
- [ ] 코드 스플리팅 확인
- [ ] 불필요한 리렌더링 방지
- [ ] 번들 크기 확인

---

## 📁 예상 파일 구조

```
disk-cms-react/src/pages/insurance/
├── DriverSearch.tsx          # kj-driver-search
├── PolicySearch.tsx          # kj-driver-policy-search
├── CompanyManagement.tsx     # kj-driver-company
├── CodeByPolicy.tsx          # kj-driver-code-by-policy
├── EndorseList.tsx           # kj-driver-endorse-list
└── components/
    ├── CompanyModal.tsx      # kj-company-modal
    ├── EndorseStatusModal.tsx
    └── PolicyDetailModal.tsx
```

---

## 🔄 마이그레이션 전략

### 전략 1: 점진적 마이그레이션
- 페이지별로 하나씩 마이그레이션
- 각 페이지 완성 후 테스트
- 기존 disk-cms와 병행 운영 가능

### 전략 2: 공통 컴포넌트 우선
- 공통 모달, 상수 등 먼저 개발
- 페이지 마이그레이션 시 재사용

### 전략 3: API 호환성 유지
- 기존 PHP API 그대로 사용
- Node.js 프록시 라우터 유지
- API 스펙 변경 없음

---

## ⚠️ 주의사항

### 1. API 호출
- 기존 API 엔드포인트 그대로 사용
- `/api/insurance/*` 프록시 라우터 사용
- 에러 처리 및 로딩 상태 관리

### 2. 데이터 구조
- 기존 API 응답 구조 유지
- TypeScript 인터페이스 정의 필요
- 날짜 형식 처리 주의

### 3. UI/UX
- 기존 UI와 일관성 유지
- Tailwind CSS 사용
- 공통 컴포넌트 활용

### 4. 비즈니스 로직
- 기존 로직 그대로 구현
- 보험료 계산 로직 정확히 재현
- 배서 처리 로직 주의

---

## 📊 예상 작업 시간

### 낙관적 시나리오: 약 40시간
- 준비 작업: 2시간
- 페이지 마이그레이션: 30시간 (각 6시간)
- 공통 컴포넌트: 4시간
- 테스트: 4시간

### 현실적 시나리오: 약 50시간
- 준비 작업: 3시간
- 페이지 마이그레이션: 38시간 (각 6-10시간)
- 공통 컴포넌트: 5시간
- 테스트: 4시간

### 보수적 시나리오: 약 60시간
- 준비 작업: 4시간
- 페이지 마이그레이션: 46시간 (각 8-10시간)
- 공통 컴포넌트: 6시간
- 테스트: 6시간

---

## ✅ 작업 체크리스트 (각 페이지마다)

각 페이지 마이그레이션 시 다음 항목을 확인:

- [ ] HTML 구조를 React 컴포넌트로 변환
- [ ] JavaScript 로직을 React hooks/상태 관리로 변환
- [ ] API 호출을 axios를 통한 api 클라이언트 사용
- [ ] 폼 검증 로직 구현
- [ ] 에러 처리 및 로딩 상태 구현
- [ ] 반응형 디자인 확인 (모바일 지원)
- [ ] 접근성 확인
- [ ] 라우팅 설정
- [ ] Sidebar 메뉴에 추가
- [ ] 권한 체크 (필요시)
- [ ] 테스트 및 버그 수정
- [ ] work-log.md 업데이트

---

## 📚 참고 문서

### 필수 학습 문서
1. `development/docs/README.md` - 전체 프로젝트 구조
2. `disk-cms/docs/kj/kj-대리운전-시스템-개요.md` - 시스템 개요
3. `disk-cms/docs/kj/kj-대리운전-업무플로우.md` - 업무 플로우
4. `disk-cms-react/docs/UI_STANDARDS.md` - UI 표준
5. `disk-cms-react/docs/pharmacy/README.md` - 약국배상 참고 (유사 모듈)

### 참고 코드
- `disk-cms/public/pages/insurance/*` - 기존 HTML/JS 코드
- `disk-cms-react/src/pages/pharmacy/Applications.tsx` - 약국배상 React 코드 (참고)

---

## 🚀 다음 단계

**현재 상태**: 계획 수립 완료, 사용자 동의 대기

**필요한 결정 사항**:
1. ⏸️ 마이그레이션 시작 여부
2. ⏸️ 우선 작업할 첫 번째 페이지 지정 (우선순위 1: 기사 찾기 권장)
3. ⏸️ 작업 순서 확인 (위의 우선순위 순서 권장)

**사용자 지시 대기 중...**

---

**작성일**: 2026년 1월 11일  
**최종 업데이트**: 2026년 1월 11일  
**상태**: 계획 수립 완료, 사용자 동의 대기 중
