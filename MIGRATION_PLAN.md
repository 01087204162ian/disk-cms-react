# Disk-CMS React 마이그레이션 작업 계획

## 📊 마이그레이션 범위 분석

### 현재 상태
- ✅ 완료: 로그인 페이지, 기본 대시보드, 레이아웃 구조
- 📝 마이그레이션 필요: 약 **27개 HTML 페이지** + 관련 JavaScript 파일들

### 페이지 분류 및 복잡도

#### 1. 인증 관련 (2개 페이지) - 난이도: ⭐
- `register.html` - 회원가입
- `reset-password.html` - 비밀번호 재설정
- **예상 시간**: 각 2-3시간 (총 4-6시간)

#### 2. 대시보드 (1개 페이지) - 난이도: ⭐⭐⭐
- `dashboard.html` - 전체 기능 구현 (현재 기본만 완료)
- **예상 시간**: 6-8시간

#### 3. 직원 관리 모듈 (5개 페이지) - 난이도: ⭐⭐⭐⭐
- `staff/employees.html` - 직원 리스트 (필터, 검색, CRUD)
- `staff/employee-schedule.html` - 근무일정
- `staff/holidays.html` - 공휴일 관리
- `staff/half-day-approval.html` - 반차 승인
- `staff/organization-chart.html` - 조직도
- **예상 시간**: 각 6-8시간 (총 30-40시간)

#### 4. 약국배상책임보험 (1개 페이지) - 난이도: ⭐⭐⭐
- `pharmacy/applications.html` - 신청리스트
- **예상 시간**: 8-10시간

#### 5. 현장실습보험 (3개 페이지) - 난이도: ⭐⭐⭐
- `field-practice/applications.html` - 신청리스트
- `field-practice/claims.html` - 클레임
- `field-practice/idList.html` - ID 리스트
- **예상 시간**: 각 6-8시간 (총 18-24시간)

#### 6. KJ 대리운전 (5개 페이지) - 난이도: ⭐⭐⭐⭐
- `insurance/kj-driver-search.html` - 검색
- `insurance/kj-driver-company.html` - 회사관리
- `insurance/kj-driver-policy-search.html` - 증권 검색
- `insurance/kj-driver-endorse-list.html` - 배서 목록
- `insurance/kj-driver-code-by-policy.html` - 코드 조회
- **예상 시간**: 각 6-8시간 (총 30-40시간)

#### 7. 근로자보상보험 (2개 페이지) - 난이도: ⭐⭐⭐
- `workers-comp/contracts.html` - 계약 관리
- `workers-comp/consultation.html` - 상담 관리
- **예상 시간**: 각 8-10시간 (총 16-20시간)

#### 8. 티켓 시스템 (5개 페이지) - 난이도: ⭐⭐⭐⭐
- `tickets/list.html` - 티켓 목록
- `tickets/form.html` - 티켓 생성
- `tickets/detail.html` - 티켓 상세
- `tickets/approvals.html` - 승인 관리
- `tickets/guide.html` - 가이드
- **예상 시간**: 각 6-8시간 (총 30-40시간)

#### 9. 매뉴얼/지식공유 (3개 페이지) - 난이도: ⭐⭐⭐
- `manual/mistake-cases.html` - 실수 사례 목록
- `manual/mistake-case-form.html` - 실수 사례 작성
- `manual/mistake-case-detail.html` - 실수 사례 상세
- **예상 시간**: 각 5-7시간 (총 15-21시간)

#### 10. 기타 페이지 (2개) - 난이도: ⭐⭐
- `user-list.html` - 사용자 목록
- `attendance-status.html` - 출석 상태
- **예상 시간**: 각 3-5시간 (총 6-10시간)

#### 11. 공통 작업 (필수)
- Sidebar 메뉴 구조 업데이트 (menu-config.json 기반)
- 공통 컴포넌트 개발 (DataTable, Filter, Modal 등)
- 라우팅 설정
- **예상 시간**: 10-15시간

## ⏱️ 총 예상 시간

### 낙관적 시나리오: **약 169시간** (약 4-5주, 주 40시간 기준)
### 현실적 시나리오: **약 223시간** (약 5-6주, 주 40시간 기준)
### 보수적 시나리오: **약 277시간** (약 7주, 주 40시간 기준)

## 🎯 마이그레이션 우선순위

### Phase 1: 핵심 기능 (1-2주)
1. ✅ 로그인 (완료)
2. ✅ 기본 레이아웃 (완료)
3. 대시보드 완성
4. 인증 관련 (회원가입, 비밀번호 재설정)
5. Sidebar 메뉴 구조 업데이트

### Phase 2: 직원 관리 모듈 (1-2주)
1. 직원 리스트
2. 근무일정
3. 공휴일 관리
4. 반차 승인
5. 조직도

### Phase 3: 보험 상품 모듈 (2-3주)
1. 약국배상책임보험
2. 현장실습보험
3. KJ 대리운전
4. 근로자보상보험

### Phase 4: 기타 기능 (1주)
1. 티켓 시스템
2. 매뉴얼/지식공유
3. 기타 페이지

### Phase 5: 테스트 및 최적화 (1주)
1. 통합 테스트
2. 버그 수정
3. 성능 최적화
4. 문서화

## 📋 작업 체크리스트 (각 페이지마다)

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

## 🔧 공통 컴포넌트 필요 항목

다음 공통 컴포넌트들을 먼저 개발하면 마이그레이션 속도가 향상됩니다:

1. **DataTable** - 필터, 정렬, 페이징이 있는 테이블
2. **FilterBar** - 검색 및 필터 UI
3. **Modal** - 재사용 가능한 모달
4. **FormInput** - 공통 입력 필드
5. **LoadingSpinner** - 로딩 인디케이터
6. **Toast/Notification** - 알림 메시지
7. **Pagination** - 페이지네이션
8. **DatePicker** - 날짜 선택기
9. **Select/Dropdown** - 선택 박스

## ⚠️ 주의사항

1. **실수하지 않기 위해**:
   - 각 페이지의 JavaScript 파일을 꼼꼼히 분석
   - API 엔드포인트 정확히 매핑
   - 기존 기능 100% 재현
   - 테스트를 단계별로 진행

2. **백엔드 호환성**:
   - 기존 백엔드 API를 그대로 사용
   - API 스펙 변경 금지
   - 세션 기반 인증 유지

3. **스타일링**:
   - Tailwind CSS 사용 (기존 CSS와 유사한 디자인)
   - 반응형 디자인 필수
   - 접근성 고려

## 📝 다음 단계

1. Phase 1부터 시작하여 단계적으로 진행
2. 각 Phase 완료 후 테스트 및 검토
3. 공통 컴포넌트는 필요에 따라 병렬 개발
4. 진행 상황을 정기적으로 문서화
