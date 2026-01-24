import { useEffect, useState } from 'react'
import { BookOpen, Info, AlertCircle } from 'lucide-react'

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('system-overview')

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'system-overview',
        'screens',
        'urls',
        'customer-flow',
        'cms-howto',
        'api-summary',
        'db-summary',
        'faq',
        'references',
      ]
      const scrollPosition = window.scrollY + 64 + 65 + 50

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (!section) continue
        const top = section.offsetTop
        const height = section.offsetHeight
        if (top <= scrollPosition && top + height > scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId)
    const el = document.getElementById(sectionId)
    if (!el) return

    const appHeaderHeight = 64
    const docHeader = document.querySelector('header.bg-white.border-b') as HTMLElement | null
    const docHeaderHeight = docHeader ? docHeader.offsetHeight : 65
    const offset = appHeaderHeight + docHeaderHeight + 30

    window.scrollTo({
      top: Math.max(0, el.offsetTop - offset),
      behavior: 'smooth',
    })
  }

  const navItems = [
    { id: 'system-overview', label: '1. 시스템 개요' },
    { id: 'screens', label: '2. 주요 화면(메뉴)' },
    { id: 'urls', label: '3. URL / 경로 / 소스 매핑' },
    { id: 'customer-flow', label: '4. 고객사(기존) 화면 흐름' },
    { id: 'cms-howto', label: '5. CMS(React) 화면별 사용법' },
    { id: 'api-summary', label: '6. API 요약(화면 → API)' },
    { id: 'db-summary', label: '7. DB/테이블 요약' },
    { id: 'faq', label: '8. FAQ / 트러블슈팅' },
    { id: 'references', label: '9. 참고(기존 고객사/문서)' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">KJ 대리운전 운영 매뉴얼</h1>
          </div>
          <p className="text-gray-600 text-sm mt-1">운영자가 바로 쓰는 문서(매뉴얼) — 필요 시 섹션을 계속 확장합니다.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-[191px]">
              <nav className="bg-white rounded-lg shadow-sm border p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">📋 목차</h2>
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          activeSection === item.id
                            ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <section id="system-overview" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">1. 시스템 개요</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    KJ 대리운전 보험 CMS는 <strong>대리운전 회사/기사/증권/배서/SMS</strong>를 관리하는 운영 시스템입니다.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <p className="text-blue-800">
                      <strong>운영(React CMS)</strong>: `https://react.disk-cms.simg.kr/insurance/*`
                    </p>
                    <p className="text-blue-800">
                      <strong>고객사(기존)</strong>: `https://pcikorea.com/kj/`
                    </p>
                  </div>
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-yellow-800">
                        이 문서는 너무 길어지지 않게, <strong>섹션 단위로 나눠</strong> 계속 추가/개선합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="screens" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">2. 주요 화면(메뉴)</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    <strong>기사 찾기</strong>: 기사 조회/수정
                  </li>
                  <li>
                    <strong>대리업체 관리</strong>: 업체 목록/상세(기본정보/증권정보)
                  </li>
                  <li>
                    <strong>배서 리스트</strong>: 배서 처리/취소 등
                  </li>
                  <li>
                    <strong>증권별 코드</strong>: 증권/코드 관련 조회
                  </li>
                  <li>
                    <strong>갱신</strong>: 증권번호 변경/기간/보험사 변경 등
                  </li>
                </ul>
              </section>

              <section id="urls" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">3. URL / 경로 / 소스 매핑</h2>
                <div className="space-y-4 text-gray-700">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">React CMS (disk-cms-react)</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>`disk-cms-react/src/pages/insurance/*`</li>
                      <li>라우트: `disk-cms-react/src/App.tsx`</li>
                      <li>메뉴: `disk-cms-react/public/config/menu-config.json`</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">고객사(기존) 화면/문서 (pci0327/kj)</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>화면: `pci0327/kj/*.html`, `pci0327/kj/js/*`</li>
                      <li>문서: `pci0327/kj/docs/*`</li>
                      <li>API(PHP): `pci0327/kj/api/*` 및 `pci0327/api/insurance/*`</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="customer-flow" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">4. 고객사(기존) 화면 흐름</h2>
                <div className="space-y-4 text-gray-700">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <p className="text-blue-800">
                      <strong>고객사 페이지</strong>: `https://pcikorea.com/kj/`
                    </p>
                    <p className="text-blue-700 text-sm mt-1">
                      (로컬 소스: `pci0327/kj/*`)
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">기본 흐름</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>`index.html` 로그인</li>
                      <li>`dashboard.html` 진입</li>
                      <li>좌측 메뉴로 “증권정보 / 기사찾기 / 문자리스트” 탭 이동</li>
                    </ol>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">주요 파일(참조)</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>로그인: `pci0327/kj/index.html`, `pci0327/kj/js/login.js`, `pci0327/kj/api/customer/login.php`</li>
                      <li>대시보드/탭: `pci0327/kj/dashboard.html`, `pci0327/kj/js/tab-init.js`</li>
                      <li>증권정보: `pci0327/kj/js/home.js`, `pci0327/kj/api/customer/home_data.php`</li>
                      <li>기사찾기: `pci0327/kj/js/driverSearch.js`, `pci0327/kj/api/customer/driver_data.php`</li>
                      <li>문자리스트: `pci0327/kj/js/sms.js`, `pci0327/kj/api/customer/sms_data.php`</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="cms-howto" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">5. CMS(React) 화면별 사용법</h2>
                <div className="space-y-4 text-gray-700">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">KJ대리운전 메뉴(React CMS)</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>기사 찾기</strong> (`/insurance/kj-driver-search`): 기사 조회/간단 수정, 상태/증권성격/핸드폰/사고 등의 인라인 편집
                      </li>
                      <li>
                        <strong>대리업체 관리</strong> (`/insurance/kj-driver-company`): 업체 목록/상세 모달(기본정보/증권정보)
                      </li>
                      <li>
                        <strong>배서 리스트</strong> (`/insurance/kj-driver-endorse-list`): 배서 처리/취소 등 운영 작업
                      </li>
                      <li>
                        <strong>증권별 코드</strong> (`/insurance/kj-driver-code-by-policy`): 증권 기준 코드/인원 조회
                      </li>
                      <li>
                        <strong>갱신</strong> (`/insurance/kj-driver-policy-search`): 증권번호 변경(연결 기사 정보도 함께 업데이트)
                      </li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-yellow-800 font-semibold mb-1">운영 팁(짧게)</p>
                        <ul className="list-disc list-inside text-yellow-800 space-y-1">
                          <li>대리업체 상세 모달에서 “기본정보/증권정보”는 수정 시 입력상자가 td에 꽉 차게 표시됩니다.</li>
                          <li>“증권별 코드”는 보험사/계약일 기준으로 정렬되며, 페이지당 20개 표시 + 테이블 하단에 전체 인원 합계가 표시됩니다.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="api-summary" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">6. API 요약(화면 → API)</h2>

                <div className="space-y-6 text-gray-700">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <p className="text-blue-800">
                      <strong>React CMS</strong>는 주로 `disk-cms-react`에서 `/api/insurance/*` 프록시를 통해 PHP API(`pci0327/api/insurance/*`)를 호출합니다.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">화면 → 대표 API (요약)</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>기사 찾기</strong> (`/insurance/kj-driver-search`): 기사 조회/수정 관련 API들
                      </li>
                      <li>
                        <strong>대리업체 관리</strong> (`/insurance/kj-driver-company`): 업체 목록/상세/증권정보/ID 관리 API들
                      </li>
                      <li>
                        <strong>배서 리스트</strong> (`/insurance/kj-driver-endorse-list`): 배서 처리/취소 및 상태 업데이트 API들
                      </li>
                      <li>
                        <strong>갱신</strong> (`/insurance/kj-driver-policy-search`): 증권번호/보험기간/보험사 변경 API (연결 기사 데이터 동시 업데이트 포함)
                      </li>
                      <li>
                        <strong>증권별 코드</strong> (`/insurance/kj-driver-code-by-policy`): 증권/코드 조회 API
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">자주 쓰는 API 엔드포인트 (최근 작업 기준)</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>증권별 코드 조회</strong>: `GET /api/insurance/kj-code/policy-search`
                      </li>
                      <li>
                        <strong>증권번호 목록</strong>: `GET /api/insurance/kj-certi/list`
                      </li>
                      <li>
                        <strong>증권번호 변경(갱신/변경)</strong>: `POST /api/insurance/kj-certi-change-policy.php` (연결 기사: `2012DaeriMemberSecure`도 함께 업데이트)
                      </li>
                      <li>
                        <strong>배서 상태 업데이트</strong>: `POST /api/insurance/kj-endorse-update-status.php`
                      </li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-3">
                      상세 파라미터/응답(JSON 스키마)은 길어지므로 다음 라운드에서 “API 상세”로 분리해서 추가합니다.
                    </p>
                  </div>
                </div>
              </section>

              <section id="db-summary" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">7. DB/테이블 요약</h2>

                <div className="space-y-6 text-gray-700">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <p className="text-blue-800">
                      운영 데이터는 주로 <strong>증권(2012Certi/2012CertiTable)</strong>, <strong>기사(2012DaeriMember/2012DaeriMemberSecure)</strong>,
                      <strong>회사(2012DaeriCompany)</strong>, <strong>SMS(SMSData)</strong>를 중심으로 흐릅니다.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">핵심 테이블(요약)</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>`2012Certi`</strong>: 증권 기본(예: `certi`, `sigi`, `insurance`)
                      </li>
                      <li>
                        <strong>`2012CertiTable`</strong>: 증권 운영 테이블(예: `num`, `policyNum`, `startyDay`, `InsuraneCompany`, `2012DaeriCompanyNum`)
                      </li>
                      <li>
                        <strong>`2012DaeriCompany`</strong>: 대리운전회사(예: `num`, `company`)
                      </li>
                      <li>
                        <strong>`2012DaeriMemberSecure`</strong>: 기사(암호화/보안 버전 포함) (예: `CertiTableNum`, `dongbuCerti`, `InsuranceCompany`, `push`, `cancel`)
                      </li>
                      <li>
                        <strong>`SMSData`</strong>: 문자 발송/이력(예: `policyNum`, `endorse_day`, `2012DaeriCompanyNum`, `2012DaeriMemberNum`)
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">관계(운영 관점)</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>회사(2012DaeriCompany.num)</strong> → <strong>증권(2012CertiTable.2012DaeriCompanyNum)</strong>
                      </li>
                      <li>
                        <strong>증권(2012CertiTable.num)</strong> → <strong>기사(2012DaeriMemberSecure.CertiTableNum)</strong>
                      </li>
                      <li>
                        <strong>증권번호 변경</strong> 시: <strong>2012CertiTable</strong> 뿐 아니라, 연결 기사 테이블의 <strong>`dongbuCerti` / `InsuranceCompany`</strong>도 함께 업데이트
                      </li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <p className="text-yellow-800 font-semibold mb-1">자주 보는 필드(운영)</p>
                    <ul className="list-disc list-inside text-yellow-800 space-y-1">
                      <li><strong>기사 상태</strong>: `push`, `cancel`, `sangtae`</li>
                      <li><strong>증권 매핑</strong>: `CertiTableNum`, `policyNum`, `dongbuCerti`</li>
                      <li><strong>보험사</strong>: `InsuraneCompany`(증권), `InsuranceCompany`(기사)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="faq" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">8. FAQ / 트러블슈팅</h2>

                <div className="space-y-6 text-gray-700">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">Q1. 검색 버튼 클릭 시 “Converting circular structure to JSON” 오류</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>원인</strong>: 클릭 이벤트 객체가 그대로 검색 함수로 전달되어, axios가 요청 데이터를 stringify 하면서 순환 참조가 발생
                      </li>
                      <li>
                        <strong>해결</strong>: 예) <code className="bg-gray-100 px-1 rounded">{`onClick={() => handleSearch()}`}</code> 처럼 이벤트 객체를 넘기지 않도록 래핑
                      </li>
                      <li>
                        <strong>관련 화면</strong>: 갱신(증권검색) 페이지
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">Q2. 대리운전회사 상세 모달에서 th는 맞는데 td/입력상자 폭이 안 맞음</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>해결(기본정보)</strong>: `tableLayout: 'fixed'` + th 폭 고정 + td 폭 균등 분배
                      </li>
                      <li>
                        <strong>해결(수정 모드)</strong>: td `p-0` + input/select를 `border-0 rounded-none` + `width: 100%`로 변경하여 td 꽉 채움
                      </li>
                      <li>
                        <strong>해결(증권정보)</strong>: 입력이 있는 td도 동일하게 `p-0` 처리하고 Select/input 스타일 통일
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">Q3. “증권번호 변경(갱신)” 시 어떤 데이터까지 변경되나요?</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>증권(2012CertiTable)</strong>: 증권번호/보험기간/보험사 등 변경
                      </li>
                      <li>
                        <strong>연결 기사(2012DaeriMemberSecure)</strong>: 해당 증권에 연결된 기사들의 <strong>증권번호(dongbuCerti)</strong>와 <strong>보험사(InsuranceCompany)</strong>도 함께 업데이트
                      </li>
                      <li>
                        <strong>운영 포인트</strong>: 모달 안내문/확인 메시지로 변경 범위를 사용자에게 명확히 표시
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">Q4. 빌드 실패: TS6133 (선언만 하고 사용하지 않는 변수)</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>증상</strong>: `is declared but its value is never read`로 `npm run build` 실패
                      </li>
                      <li>
                        <strong>해결</strong>: 사용하지 않는 변수/계산을 제거하거나, 실제 UI에 표시하여 “사용” 상태로 만들기
                      </li>
                      <li>
                        <strong>예</strong>: `currentPageInwon`이 미사용이라면 삭제
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="references" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">9. 참고(기존 고객사/문서)</h2>
                <div className="space-y-4 text-gray-700">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-800 font-semibold mb-1">기존 분석 문서(로컬)</p>
                        <ul className="list-disc list-inside text-blue-700 space-y-1">
                          <li>`pci0327/kj/docs/README.md`</li>
                          <li>`pci0327/kj/docs/ARCHITECTURE.md`</li>
                          <li>`pci0327/kj/docs/FRONTEND.md`</li>
                          <li>`pci0327/kj/docs/API.md`</li>
                          <li>`pci0327/kj/docs/DATABASE.md`</li>
                        </ul>
                        <p className="text-blue-800 font-semibold mt-4 mb-1">API 상세(참조)</p>
                        <p className="text-blue-700">
                          `pci0327/kj/docs/API.md` 를 기준으로 상세 파라미터/응답을 확인하세요.
                        </p>
                        <p className="text-blue-800 font-semibold mt-4 mb-1">DB 상세(참조)</p>
                        <p className="text-blue-700">
                          `pci0327/kj/docs/DATABASE.md` 를 기준으로 실제 테이블/필드/관계를 확인하세요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
                <p>KJ 대리운전 운영 매뉴얼 v0.5</p>
                <p className="mt-2">최종 업데이트: 2026-01-24</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

