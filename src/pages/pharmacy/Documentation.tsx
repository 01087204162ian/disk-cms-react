import { useState, useEffect } from 'react'
import { BookOpen, AlertCircle, Info, HelpCircle } from 'lucide-react'

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('system-overview')

  // 헤더 높이 확인 (개발용)
  useEffect(() => {
    const header = document.querySelector('header')
    if (header) {
      console.log('=== 헤더 높이 확인 ===')
      console.log('offsetHeight:', header.offsetHeight, 'px')
      console.log('getBoundingClientRect().height:', header.getBoundingClientRect().height, 'px')
      console.log('clientHeight:', header.clientHeight, 'px')
      console.log('====================')
    }
  }, [])

  // 스크롤 시 현재 섹션 감지
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'system-overview',
        'daily-workflow',
        'application-process',
        'status-guide',
        'premium-guide',
        'system-structure',
        'database-tables',
        'api-guide',
        'troubleshooting',
        'faq'
      ]

      // 전체 앱 헤더 (64px) + Documentation 헤더 (65px) + 여유 공간 (50px)
      const scrollPosition = window.scrollY + 64 + 65 + 50

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section) {
          const sectionTop = section.offsetTop
          const sectionHeight = section.offsetHeight
          // 섹션의 상단이 스크롤 위치보다 위에 있고, 하단이 스크롤 위치보다 아래에 있으면 활성화
          if (sectionTop <= scrollPosition && sectionTop + sectionHeight > scrollPosition) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      // 전체 앱 헤더 높이 (64px) + Documentation 헤더 높이 (65px) + 여유 공간 (30px)
      const appHeaderHeight = 64 // 전체 앱 헤더 (h-16)
      const docHeader = document.querySelector('header.bg-white.border-b') as HTMLElement | null
      const docHeaderHeight = docHeader ? docHeader.offsetHeight : 65
      const offset = appHeaderHeight + docHeaderHeight + 30
      
      // 요소의 절대 위치 계산
      const elementTop = element.offsetTop
      const scrollPosition = elementTop - offset

      window.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      })
    }
  }

  const navItems = [
    { id: 'system-overview', label: '1. 시스템 개요' },
    { id: 'daily-workflow', label: '2. 일상 업무 플로우' },
    { id: 'application-process', label: '3. 신청 처리 프로세스' },
    { id: 'status-guide', label: '4. 상태 변경 가이드' },
    { id: 'premium-guide', label: '5. 보험료 확인 및 수정' },
    { id: 'system-structure', label: '6. 시스템 구조 및 URL' },
    { id: 'database-tables', label: '7. 데이터베이스 테이블' },
    { id: 'api-guide', label: '8. API 및 RESTful 검증' },
    { id: 'troubleshooting', label: '9. 문제 해결 가이드' },
    { id: 'faq', label: '10. 자주 묻는 질문(FAQ)' }
  ]

    return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 - 고정 (전체 앱 헤더 아래에 위치) */}
      <header className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">약국배상책임보험 운영 가이드</h1>
          </div>
          <p className="text-gray-600 text-sm mt-1">실제 운영자가 사용할 수 있는 실용적인 운영 매뉴얼</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* 좌측 사이드바 네비게이션 - 고정 */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-[187px]">
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

          {/* 우측 메인 콘텐츠 */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              {/* 섹션 1: 시스템 개요 */}
              <section id="system-overview" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">1. 시스템 개요</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">약국배상책임보험 시스템이란?</h3>
                    <p className="text-gray-700 mb-4">
                      약국배상책임보험 시스템은 약국이 보험 가입신청을 하고, 관리자가 이를 관리하는 통합 시스템입니다.
                      약국 신청부터 승인, 증권 발급까지의 전체 프로세스를 관리할 수 있습니다.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">주요 화면</h3>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                      <li><strong>신청 목록</strong>: 약국 신청 목록 조회 및 관리</li>
                      <li><strong>상세 정보</strong>: 약국별 상세 정보 확인 및 수정</li>
                      <li><strong>예치금 관리</strong>: 예치금 현황, 충전, 사용 내역 조회</li>
                      <li><strong>일일 보고서</strong>: 일별 승인/해지 실적 조회</li>
                      <li><strong>업체 관리</strong>: 거래처(업체) 추가 및 API 키 관리</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">접속 방법</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                      <p className="text-blue-800">
                        <strong>운영 환경</strong>: <a href="https://react.disk-cms.simg.kr/pharmacy/applications" target="_blank" rel="noopener noreferrer" className="underline">https://react.disk-cms.simg.kr/pharmacy/applications</a>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">권한 설명</h3>
                    <p className="text-gray-700 mb-4">
                      모든 관리자 기능은 로그인이 필요합니다. 로그인 후 약국 신청 목록 조회, 상태 변경, 예치금 관리 등의 기능을 사용할 수 있습니다.
                    </p>
                  </div>
                </div>
              </section>

              {/* 섹션 2: 일상 업무 플로우 */}
              <section id="daily-workflow" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">2. 일상 업무 플로우</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">하루 업무 흐름</h3>
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
                      <li>신청 목록에서 새로운 신청 확인</li>
                      <li>신청 정보 검토 및 필수 정보 확인</li>
                      <li>보험료 계산 확인</li>
                      <li>승인 처리 (필요 시)</li>
                      <li>설계번호 및 증권번호 입력</li>
                      <li>예치금 현황 확인</li>
                      <li>일일 보고서 확인</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">주요 기능별 사용법</h3>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">약국 목록 조회</h4>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                        <li>상단 필터에서 <strong>거래처</strong>, <strong>상태</strong>, <strong>검색어</strong>로 필터링 가능</li>
                        <li>기본값: 상태 "승인"으로 필터링됨</li>
                        <li>페이지네이션으로 목록 이동</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">검색 및 필터링</h4>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                        <li><strong>거래처</strong>: 특정 업체의 신청만 조회</li>
                        <li><strong>상태</strong>: 메일보냄, 승인, 계약, 보류, 증권발급 등</li>
                        <li><strong>검색어</strong>: 약국명, 사업자번호, 담당자명으로 검색</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">상세 정보 확인</h4>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                        <li>목록에서 약국명 클릭 시 상세 모달 열림</li>
                        <li>기본 정보, 보험료 정보, 설계번호, 증권번호 확인 가능</li>
                        <li>상태 변경 및 메모 작성 가능</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">상태 변경</h4>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                        <li>상세 모달에서 상태 드롭다운 선택</li>
                        <li>변경 버튼 클릭 시 확인 모달 표시</li>
                        <li>승인 시 예치금 자동 차감</li>
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">메모 작성</h4>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                        <li>상세 모달 하단의 메모 입력란에 작성</li>
                        <li>저장 버튼 클릭 시 즉시 저장</li>
                        <li>메모는 약국별로 관리됨</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* 섹션 3: 신청 처리 프로세스 */}
              <section id="application-process" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">3. 신청 처리 프로세스</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">신청 접수</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">신청 정보 확인</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                        <li>약국명, 사업자번호, 담당자명 확인</li>
                        <li>연락처(일반전화, 휴대폰) 확인</li>
                        <li>전문인 수, 사업장 면적, 재고자산 확인</li>
                      </ul>

                      <h4 className="font-semibold mb-2">필수 정보 체크</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                        <li>사업자번호 유효성 확인</li>
                        <li>주민번호 유효성 확인 (있는 경우)</li>
                        <li>연락처 형식 확인</li>
                      </ul>

                      <h4 className="font-semibold mb-2">보험료 계산 확인</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>전문인 보험료 확인</li>
                        <li>화재 보험료 확인 (사업장 면적 80㎡ 이상인 경우)</li>
                        <li>총 보험료 확인</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">승인 처리</h3>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-yellow-800 font-semibold mb-1">주의사항</p>
                          <p className="text-yellow-700">
                            승인 처리 시 예치금이 자동으로 차감됩니다. 예치금 잔고를 확인한 후 승인하세요.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">승인 조건 확인</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                        <li>신청 정보가 모두 입력되었는지 확인</li>
                        <li>보험료가 정상적으로 계산되었는지 확인</li>
                        <li>예치금 잔고가 충분한지 확인</li>
                      </ul>

                      <h4 className="font-semibold mb-2">설계번호 입력</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                        <li>전문인 설계번호 입력 (전문인 수가 1명 이상인 경우)</li>
                        <li>화재 설계번호 입력 (사업장 면적이 80㎡ 이상인 경우)</li>
                        <li>설계번호 입력 후 상태가 "설계중"으로 변경됨</li>
                      </ul>

                      <h4 className="font-semibold mb-2">증권 발급</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>전문인 증권번호 입력</li>
                        <li>화재 증권번호 입력</li>
                        <li>증권번호 입력 후 상태가 "증권발급"으로 변경됨</li>
                        <li>보험시기, 보험종기 자동 설정</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">계약 완료</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">계약 정보 확인</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                        <li>증권번호 확인</li>
                        <li>보험시기, 보험종기 확인</li>
                        <li>보험료 확인</li>
                      </ul>

                      <h4 className="font-semibold mb-2">메일 발송 확인</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>신청 시 자동으로 메일 발송됨</li>
                        <li>승인 시 승인 완료 메일 발송됨</li>
                        <li>메일에는 정상적인 보험료가 표기됨</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">상태 코드</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300 mb-4">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border border-gray-300 px-4 py-2 text-left">코드</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">상태명</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">설명</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">10</td>
                            <td className="border border-gray-300 px-4 py-2">메일보냄</td>
                            <td className="border border-gray-300 px-4 py-2">메일 발송 완료, 수동 승인 대기</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">13</td>
                            <td className="border border-gray-300 px-4 py-2">승인</td>
                            <td className="border border-gray-300 px-4 py-2">승인 완료, 예치금 차감됨</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">17</td>
                            <td className="border border-gray-300 px-4 py-2">설계중</td>
                            <td className="border border-gray-300 px-4 py-2">설계번호 입력 완료</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">14</td>
                            <td className="border border-gray-300 px-4 py-2">증권발급</td>
                            <td className="border border-gray-300 px-4 py-2">증권번호 입력 완료</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">6</td>
                            <td className="border border-gray-300 px-4 py-2">계약</td>
                            <td className="border border-gray-300 px-4 py-2">계약 완료</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">7</td>
                            <td className="border border-gray-300 px-4 py-2">보류</td>
                            <td className="border border-gray-300 px-4 py-2">보류 처리, 예치금 환급</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">15</td>
                            <td className="border border-gray-300 px-4 py-2">해지요청</td>
                            <td className="border border-gray-300 px-4 py-2">해지 요청됨</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">16</td>
                            <td className="border border-gray-300 px-4 py-2">해지완료</td>
                            <td className="border border-gray-300 px-4 py-2">해지 완료, 일할 환급</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              {/* 섹션 4: 상태 변경 가이드 */}
              <section id="status-guide" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">4. 상태 변경 가이드</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">각 상태의 의미</h3>
                    <p className="text-gray-700 mb-4">
                      상태 코드는 약국의 처리 단계를 나타냅니다. 각 상태는 특정 의미와 조건을 가지고 있습니다.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">상태 변경 조건</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>메일보냄(10) → 승인(13)</strong>: 관리자 승인 필요, 예치금 차감</li>
                        <li><strong>승인(13) → 설계중(17)</strong>: 설계번호 입력 필요</li>
                        <li><strong>설계중(17) → 증권발급(14)</strong>: 증권번호 입력 필요</li>
                        <li><strong>증권발급(14) → 계약(6)</strong>: 계약 완료 처리</li>
                        <li><strong>승인(13) → 보류(7)</strong>: 보류 처리, 예치금 환급</li>
                        <li><strong>해지요청(15) → 해지완료(16)</strong>: 해지 처리, 일할 환급</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">상태 변경 시 주의사항</h3>
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-red-800 font-semibold mb-1">중요</p>
                          <ul className="list-disc list-inside space-y-1 text-red-700">
                            <li>승인 처리 시 예치금이 자동으로 차감됩니다</li>
                            <li>보류 처리 시 예치금이 환급됩니다</li>
                            <li>해지완료 처리 시 일할 계산된 보험료가 환급됩니다</li>
                            <li>상태 변경은 되돌릴 수 없으므로 신중하게 처리하세요</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">상태별 필수 입력 항목</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300 mb-4">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border border-gray-300 px-4 py-2 text-left">상태</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">필수 입력 항목</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">설계중(17)</td>
                            <td className="border border-gray-300 px-4 py-2">전문인 설계번호 또는 화재 설계번호</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">증권발급(14)</td>
                            <td className="border border-gray-300 px-4 py-2">전문인 증권번호 또는 화재 증권번호</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">계약(6)</td>
                            <td className="border border-gray-300 px-4 py-2">증권번호 입력 완료</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">예시 시나리오</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                      <p className="text-blue-800 font-semibold mb-2">일반적인 처리 흐름</p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-700">
                        <li>신청 접수 → 메일보냄(10)</li>
                        <li>메일보냄(10) → 승인(13) - 예치금 차감</li>
                        <li>승인(13) → 설계중(17) - 설계번호 입력</li>
                        <li>설계중(17) → 증권발급(14) - 증권번호 입력</li>
                        <li>증권발급(14) → 계약(6) - 계약 완료</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </section>

              {/* 섹션 5: 보험료 확인 및 수정 */}
              <section id="premium-guide" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">5. 보험료 확인 및 수정</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">보험료 구성 요소</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>전문인 보험료 (expert_premium)</strong>: 전문인 수에 따라 계산</li>
                        <li><strong>화재 보험료 (fire_premium)</strong>: 사업장 면적과 재고자산에 따라 계산</li>
                        <li><strong>총 보험료 (premium)</strong>: 전문인 보험료 + 화재 보험료</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">보험료 계산 기준</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300 mb-4">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border border-gray-300 px-4 py-2 text-left">항목</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">기준</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">전문인 수</td>
                            <td className="border border-gray-300 px-4 py-2">1명당 보험료 × 전문인 수</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">사업장 면적</td>
                            <td className="border border-gray-300 px-4 py-2">80㎡ 미만은 80㎡로 계산</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">재고자산 가치</td>
                            <td className="border border-gray-300 px-4 py-2">5천만원, 1억원, 2억원, 3억원, 5억원, 10억원</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">보험료 수정 시 주의사항</h3>
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-red-800 font-semibold mb-1">중요 원칙</p>
                          <p className="text-red-700 mb-2">
                            <strong>승인 상태에서는 보험료를 수정하면 안 됩니다.</strong>
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-red-700">
                            <li>승인 상태에서 보험료 수정은 원칙적으로 금지</li>
                            <li>접수 시 발송되는 메일에는 정상적인 보험료가 표기됨</li>
                            <li>어드민에서 보험료가 잘못 표기된 경우 DB에서 수동으로 처리</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-800 font-semibold mb-1">보험료 수정 프로세스</p>
                          <ol className="list-decimal list-inside space-y-1 text-blue-700">
                            <li>승인 상태가 아닌 경우에만 보험료 수정 가능</li>
                            <li>보험료 수정 시 자동으로 재계산됨</li>
                            <li>전문인 수, 사업장 면적, 재고자산 변경 시 보험료 재계산</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">문제 해결 예시</h3>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                      <p className="text-yellow-800 font-semibold mb-2">화재보험료가 "해당없음"으로 표시되는 경우</p>
                      <ul className="list-disc list-inside space-y-1 text-yellow-700">
                        <li>사업장 면적이 80㎡ 미만인 경우 화재보험료가 계산되지 않을 수 있음</li>
                        <li>DB에서 <code className="bg-yellow-100 px-1 rounded">areaPreminum</code> 필드 확인</li>
                        <li>메일에는 정상적인 보험료가 표기되지만 어드민에서는 "해당없음"으로 표시될 수 있음</li>
                        <li>승인 상태에서는 수정 불가하므로 DB에서 수동으로 처리 필요</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* 섹션 6: 시스템 구조 및 URL */}
              <section id="system-structure" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">6. 시스템 구조 및 URL</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">전체 시스템 구조</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 mb-4">
                        약국배상책임보험 시스템은 <strong>3개의 독립적인 시스템</strong>으로 구성됩니다:
                      </p>
                      <ol className="list-decimal list-inside space-y-3 text-gray-700">
                        <li>
                          <strong>약국 가입신청 시스템</strong> (drugstore) - 약국이 보험 가입신청
                        </li>
                        <li>
                          <strong>거래처 어드민 시스템</strong> (hi/v2) - 거래처 관리자가 약국 신청 관리
                        </li>
                        <li>
                          <strong>통합 관리자 CMS</strong> (disk-cms) - 시스템 관리자가 전체 관리
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">약국 가입신청 시스템 (drugstore)</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                      <p className="text-blue-800 font-semibold mb-2">신청 URL</p>
                      <div className="space-y-2 text-blue-700">
                        <div>
                          <strong>팜페이스마트 (운영)</strong>: 
                          <a href="https://imet.kr/drugstore/pharmacy/" target="_blank" rel="noopener noreferrer" className="underline ml-2">
                            https://imet.kr/drugstore/pharmacy/
                          </a>
                          <span className="text-sm ml-2">- 수동 승인 (ch=10)</span>
                        </div>
                        <div>
                          <strong>팜페이스마트 (테스트)</strong>: 
                          <a href="https://imet.kr/drugstore/pharmacyTest/" target="_blank" rel="noopener noreferrer" className="underline ml-2">
                            https://imet.kr/drugstore/pharmacyTest/
                          </a>
                          <span className="text-sm ml-2">- 수동 승인 (ch=10)</span>
                        </div>
                        <div>
                          <strong>유비케어 (운영)</strong>: 
                          <a href="https://imet.kr/drugstore/ubcare/" target="_blank" rel="noopener noreferrer" className="underline ml-2">
                            https://imet.kr/drugstore/ubcare/
                          </a>
                          <span className="text-sm ml-2">- 자동 승인 (ch=13)</span>
                        </div>
                        <div>
                          <strong>유비케어 (테스트)</strong>: 
                          <a href="https://imet.kr/drugstore/ubcareTest/" target="_blank" rel="noopener noreferrer" className="underline ml-2">
                            https://imet.kr/drugstore/ubcareTest/
                          </a>
                          <span className="text-sm ml-2">- 자동 승인 (ch=13)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">신청 처리 방식</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300 mb-4">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-4 py-2 text-left">업체</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">API</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">승인 방식</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">초기 상태</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">팜페이스마트</td>
                              <td className="border border-gray-300 px-4 py-2">submit.php</td>
                              <td className="border border-gray-300 px-4 py-2">수동 승인</td>
                              <td className="border border-gray-300 px-4 py-2">메일보냄 (10)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">유비케어</td>
                              <td className="border border-gray-300 px-4 py-2">ubcareSubmit.php</td>
                              <td className="border border-gray-300 px-4 py-2">자동 승인</td>
                              <td className="border border-gray-300 px-4 py-2">승인 (13)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">거래처 어드민 시스템 (hi/v2)</h3>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                      <p className="text-green-800 font-semibold mb-2">거래처 어드민 URL</p>
                      <div className="space-y-2 text-green-700">
                        <div>
                          <strong>로그인</strong>: 
                          <a href="https://imet.kr/hi/v2/login.html" target="_blank" rel="noopener noreferrer" className="underline ml-2">
                            https://imet.kr/hi/v2/login.html
                          </a>
                        </div>
                        <div>
                          <strong>대시보드</strong>: 
                          <a href="https://imet.kr/hi/v2/dashboard.html" target="_blank" rel="noopener noreferrer" className="underline ml-2">
                            https://imet.kr/hi/v2/dashboard.html
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">주요 기능</h4>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>약국 신청 목록 조회</li>
                        <li>신청 상세 정보 확인</li>
                        <li>상태 변경 (승인, 보류, 해지 등)</li>
                        <li>예치금 현황 조회</li>
                        <li>예치금 충전/리스트/사용내역</li>
                        <li>일일 보고서</li>
                        <li>월별 통계</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-800 font-semibold mb-1">인증 방식</p>
                          <p className="text-blue-700">
                            거래처 어드민은 <strong>API v2 인증 (HMAC-SHA256)</strong>을 사용합니다.
                            각 거래처는 고유한 API Key와 Secret Key를 가지고 있습니다.
          </p>
        </div>
      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">통합 관리자 CMS</h3>
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
                      <p className="text-purple-800 font-semibold mb-2">관리자 CMS URL</p>
                      <div className="space-y-2 text-purple-700">
                        <div>
                          <strong>신청 목록</strong>: 
                          <a href="https://react.disk-cms.simg.kr/pharmacy/applications" target="_blank" rel="noopener noreferrer" className="underline ml-2">
                            https://react.disk-cms.simg.kr/pharmacy/applications
                          </a>
                        </div>
                        <div>
                          <strong>운영 가이드</strong>: 
                          <a href="https://react.disk-cms.simg.kr/pharmacy/documentation" target="_blank" rel="noopener noreferrer" className="underline ml-2">
                            https://react.disk-cms.simg.kr/pharmacy/documentation
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">주요 기능</h4>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>전체 약국 신청 목록 조회 및 관리</li>
                        <li>상태 변경 (승인, 보류, 해지 등)</li>
                        <li>설계번호 및 증권번호 입력</li>
                        <li>예치금 관리 (현황, 충전, 사용 내역)</li>
                        <li>일일 보고서 및 통계</li>
                        <li>업체 추가 및 API 키 관리</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">시스템 아키텍처</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="space-y-2 text-gray-700">
                        <div className="flex items-start">
                          <span className="font-semibold w-32">프론트엔드</span>
                          <span>React (disk-cms-react) → Node.js 프록시</span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-semibold w-32">프록시</span>
                          <span>Node.js/Express (disk-cms-react/routes/pharmacy.js)</span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-semibold w-32">백엔드</span>
                          <span>PHP (imet.kr/api/pharmacy/*)</span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-semibold w-32">데이터베이스</span>
                          <span>MySQL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 섹션 7: 데이터베이스 테이블 */}
              <section id="database-tables" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">7. 데이터베이스 테이블</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">주요 테이블 개요</h3>
                    <p className="text-gray-700 mb-4">
                      약국배상책임보험 시스템은 다음 5개의 주요 테이블로 구성됩니다.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">1. pharmacyApply (약국 신청 정보)</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 mb-3">
                        약국 신청 정보를 저장하는 <strong>메인 테이블</strong>입니다.
                      </p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300 mb-4">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-4 py-2 text-left">필드명</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">타입</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">설명</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">num</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT (PK)</td>
                              <td className="border border-gray-300 px-4 py-2">신청 번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">company</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">약국명</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">school2</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">사업자번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">damdangja</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">담당자명</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">account</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT</td>
                              <td className="border border-gray-300 px-4 py-2">업체 번호 (pharmacy_idList와 연결)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">ch</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">상태 코드 (1~17)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">chemist</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT</td>
                              <td className="border border-gray-300 px-4 py-2">전문인 수</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">area</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT</td>
                              <td className="border border-gray-300 px-4 py-2">사업장 면적 (㎡)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">jaegojasan</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT</td>
                              <td className="border border-gray-300 px-4 py-2">재고자산 가치 코드 (1~6)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">proPreminum</code></td>
                              <td className="border border-gray-300 px-4 py-2">DECIMAL</td>
                              <td className="border border-gray-300 px-4 py-2">전문인 보험료</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">areaPreminum</code></td>
                              <td className="border border-gray-300 px-4 py-2">DECIMAL</td>
                              <td className="border border-gray-300 px-4 py-2">화재 보험료</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">preminum</code></td>
                              <td className="border border-gray-300 px-4 py-2">DECIMAL</td>
                              <td className="border border-gray-300 px-4 py-2">총 보험료</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">chemistDesignNumer</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">전문인 설계번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">areaDesignNumer</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">화재 설계번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">chemistCerti</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">전문인 증권번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">areaCerti</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">화재 증권번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">wdate</code></td>
                              <td className="border border-gray-300 px-4 py-2">DATETIME</td>
                              <td className="border border-gray-300 px-4 py-2">최초 입력 시간 (신청일)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">wdate_2</code></td>
                              <td className="border border-gray-300 px-4 py-2">DATETIME</td>
                              <td className="border border-gray-300 px-4 py-2">상태 변경일</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">wdate_3</code></td>
                              <td className="border border-gray-300 px-4 py-2">DATE</td>
                              <td className="border border-gray-300 px-4 py-2">증권발급일</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">memo</code></td>
                              <td className="border border-gray-300 px-4 py-2">TEXT</td>
                              <td className="border border-gray-300 px-4 py-2">메모</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">2. pharmacy_idList (업체 정보)</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 mb-3">
                        약국 업체 정보를 저장하는 테이블입니다. 거래처별로 관리됩니다.
                      </p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300 mb-4">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-4 py-2 text-left">필드명</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">타입</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">설명</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">num</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT (PK)</td>
                              <td className="border border-gray-300 px-4 py-2">업체 번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">directory</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">디렉토리 경로 (pharmacy, ubcare, pharmacyTest, ubcareTest)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">name</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">업체명</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">ch</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT</td>
                              <td className="border border-gray-300 px-4 py-2">처리 모드 (10=수동, 13=자동)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">api_key</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">API 키 (pk_로 시작)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">api_secret</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">API 시크릿 해시 (SHA256)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">api_enabled</code></td>
                              <td className="border border-gray-300 px-4 py-2">TINYINT</td>
                              <td className="border border-gray-300 px-4 py-2">API 활성화 여부 (0/1)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">3. pharmacy_deposit (예치금 거래 내역)</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 mb-3">
                        예치금 거래 내역을 저장하는 테이블입니다.
                      </p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300 mb-4">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-4 py-2 text-left">필드명</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">타입</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">설명</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">num</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT (PK)</td>
                              <td className="border border-gray-300 px-4 py-2">거래 번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">account</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT</td>
                              <td className="border border-gray-300 px-4 py-2">업체 번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">money</code></td>
                              <td className="border border-gray-300 px-4 py-2">DECIMAL</td>
                              <td className="border border-gray-300 px-4 py-2">금액 (양수: 입금, 음수: 출금)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">sort</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT</td>
                              <td className="border border-gray-300 px-4 py-2">거래 유형 (98: 현재 잔고, 99: 입금, 13: 승인 차감, 7: 보류 환급, 16: 해지 환급)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">wdate</code></td>
                              <td className="border border-gray-300 px-4 py-2">DATETIME</td>
                              <td className="border border-gray-300 px-4 py-2">거래일</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">4. pharmacy_settlementList (정산 기록)</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 mb-3">
                        정산 기록을 저장하는 테이블입니다. 승인, 보류, 해지 시 생성됩니다.
                      </p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300 mb-4">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-4 py-2 text-left">필드명</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">타입</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">설명</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">num</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT (PK)</td>
                              <td className="border border-gray-300 px-4 py-2">정산 번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">applyNum</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT</td>
                              <td className="border border-gray-300 px-4 py-2">신청 번호 (pharmacyApply.num)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">account</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT</td>
                              <td className="border border-gray-300 px-4 py-2">업체 번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">sort</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT</td>
                              <td className="border border-gray-300 px-4 py-2">정산 유형 (13: 승인, 7: 보류, 16: 해지완료)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">approvalPreminum</code></td>
                              <td className="border border-gray-300 px-4 py-2">DECIMAL</td>
                              <td className="border border-gray-300 px-4 py-2">승인 보험료</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">proPreminum</code></td>
                              <td className="border border-gray-300 px-4 py-2">DECIMAL</td>
                              <td className="border border-gray-300 px-4 py-2">전문인 보험료</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">areaPreminum</code></td>
                              <td className="border border-gray-300 px-4 py-2">DECIMAL</td>
                              <td className="border border-gray-300 px-4 py-2">화재 보험료</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">wdate</code></td>
                              <td className="border border-gray-300 px-4 py-2">DATETIME</td>
                              <td className="border border-gray-300 px-4 py-2">정산일</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">5. pharmacy_certificate_history (증권발급 이력)</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 mb-3">
                        증권발급 및 해지 이력을 저장하는 전용 테이블입니다. (2026-01-10 추가)
                      </p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300 mb-4">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-4 py-2 text-left">필드명</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">타입</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">설명</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">num</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT (PK)</td>
                              <td className="border border-gray-300 px-4 py-2">기록 번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">applyNum</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT</td>
                              <td className="border border-gray-300 px-4 py-2">약국 신청 번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">account</code></td>
                              <td className="border border-gray-300 px-4 py-2">INT</td>
                              <td className="border border-gray-300 px-4 py-2">업체 번호</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">action_type</code></td>
                              <td className="border border-gray-300 px-4 py-2">ENUM</td>
                              <td className="border border-gray-300 px-4 py-2">액션 타입 ('certificate': 증권발급, 'termination': 해지완료)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">certificate_type</code></td>
                              <td className="border border-gray-300 px-4 py-2">ENUM</td>
                              <td className="border border-gray-300 px-4 py-2">증권 유형 ('expert': 전문인, 'fire': 화재, 'both': 둘 다)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">certificate_date</code></td>
                              <td className="border border-gray-300 px-4 py-2">DATE</td>
                              <td className="border border-gray-300 px-4 py-2">증권발급일/해지일 (통계 집계 기준일)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">preminum</code></td>
                              <td className="border border-gray-300 px-4 py-2">DECIMAL</td>
                              <td className="border border-gray-300 px-4 py-2">총 보험료 (증권발급: 원래 보험료, 해지: 환급 보험료)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">registrar</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">입력자 이름</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">registrar_id</code></td>
                              <td className="border border-gray-300 px-4 py-2">VARCHAR</td>
                              <td className="border border-gray-300 px-4 py-2">입력자 ID</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">테이블 간 관계</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                      <div className="text-blue-700 space-y-2">
                        <div>
                          <strong>pharmacy_idList</strong> (1) ──&gt; (N) <strong>pharmacyApply</strong>
                        </div>
                        <div>
                          <strong>pharmacy_idList</strong> (1) ──&gt; (N) <strong>pharmacy_deposit</strong>
                        </div>
                        <div>
                          <strong>pharmacyApply</strong> (1) ──&gt; (N) <strong>pharmacy_settlementList</strong>
                        </div>
                        <div>
                          <strong>pharmacyApply</strong> (1) ──&gt; (1) <strong>pharmacy_certificate_history</strong> (증권발급 최대 1개)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 섹션 8: API 및 RESTful 검증 */}
              <section id="api-guide" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">8. API 및 RESTful 검증</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">API v2 개요</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 mb-3">
                        약국배상책임보험 API v2는 <strong>HMAC 인증 기반의 RESTful API</strong>입니다.
                        거래처(고객사)가 자신의 약국 신청 데이터를 안전하게 조회하고 관리할 수 있는 기능을 제공합니다.
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>HMAC-SHA256 인증</strong>: API 키와 서명 기반 보안 인증</li>
                        <li><strong>JSON 입출력</strong>: 표준 JSON 형식의 요청/응답</li>
                        <li><strong>트랜잭션 지원</strong>: 데이터 무결성 보장</li>
                        <li><strong>세션 분리</strong>: 기존 웹 시스템과 완전 독립</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">인증 방식 (HMAC-SHA256)</h3>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                      <p className="text-yellow-800 font-semibold mb-2">필수 헤더</p>
                      <div className="bg-gray-900 text-gray-100 rounded p-3 mb-3 overflow-x-auto">
                        <pre className="text-sm">
{`Authorization: Bearer {api_key}
X-Timestamp: {unix_timestamp}
X-Signature: {hmac_signature}
Content-Type: application/json`}
                        </pre>
        </div>
      </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">서명 생성 방법</h4>
                      <div className="bg-gray-900 text-gray-100 rounded p-3 mb-3 overflow-x-auto">
                        <pre className="text-sm">
{`// 1. 요청 본문을 JSON 문자열로 변환
const requestBody = JSON.stringify(payload);

// 2. 서명용 문자열 생성
const stringToSign = \`\${method}\\n\${path}\\n\${timestamp}\\n\${requestBody}\`;

// 3. HMAC-SHA256 서명 생성
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(stringToSign, 'utf8')
  .digest('hex');`}
                </pre>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-800 font-semibold mb-1">서명 생성 규칙</p>
                          <ol className="list-decimal list-inside space-y-1 text-blue-700">
                            <li>HTTP 메서드: 대문자 (예: POST)</li>
                            <li>요청 경로: /hi/api/list_v2.php (도메인 제외)</li>
                            <li>타임스탬프: Unix timestamp (초 단위)</li>
                            <li>요청 본문: JSON 문자열 (공백 포함)</li>
                            <li>서명: HMAC-SHA256으로 생성된 16진수 문자열</li>
                            <li>타임스탬프 검증: 현재 시간 기준 ±5분 이내</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">주요 API 엔드포인트</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 mb-3"><strong>기본 URL</strong>: <code className="bg-gray-100 px-1 rounded">https://imet.kr</code></p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300 mb-4">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-4 py-2 text-left">엔드포인트</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">메서드</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">기능</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">/hi/api/list_v2.php</code></td>
                              <td className="border border-gray-300 px-4 py-2">POST</td>
                              <td className="border border-gray-300 px-4 py-2">약국 목록 조회</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">/hi/api/detail_v2.php</code></td>
                              <td className="border border-gray-300 px-4 py-2">POST</td>
                              <td className="border border-gray-300 px-4 py-2">약국 상세 정보 조회</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">/hi/api/pharmacy-status-update_v2.php</code></td>
                              <td className="border border-gray-300 px-4 py-2">POST</td>
                              <td className="border border-gray-300 px-4 py-2">상태 변경</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">/hi/api/pharmacy-premium-calculate_v2.php</code></td>
                              <td className="border border-gray-300 px-4 py-2">POST</td>
                              <td className="border border-gray-300 px-4 py-2">보험료 계산</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">/hi/api/balance_v2.php</code></td>
                              <td className="border border-gray-300 px-4 py-2">POST</td>
                              <td className="border border-gray-300 px-4 py-2">예치금 잔고 조회</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">/hi/api/deposit_balance_v2.php</code></td>
                              <td className="border border-gray-300 px-4 py-2">POST</td>
                              <td className="border border-gray-300 px-4 py-2">예치금 내역 조회</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">/hi/api/daily_stats_v2.php</code></td>
                              <td className="border border-gray-300 px-4 py-2">POST</td>
                              <td className="border border-gray-300 px-4 py-2">일별 실적 조회</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code className="bg-gray-100 px-1 rounded">/hi/api/monthly_stats_v2.php</code></td>
                              <td className="border border-gray-300 px-4 py-2">POST</td>
                              <td className="border border-gray-300 px-4 py-2">월별 실적 조회</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">API 검증 포털</h3>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                      <p className="text-green-800 font-semibold mb-2">RESTful 검증 도구</p>
                      <div className="space-y-2 text-green-700">
                        <div>
                          <strong>검증 포털</strong>: 
                          <a href="https://imet.kr/hi/api/verification/" target="_blank" rel="noopener noreferrer" className="underline ml-2">
                            https://imet.kr/hi/api/verification/
                          </a>
                        </div>
                        <div>
                          <strong>개발자 가이드</strong>: 
                          <a href="https://imet.kr/hi/api/verification/api_guide.html" target="_blank" rel="noopener noreferrer" className="underline ml-2">
                            https://imet.kr/hi/api/verification/api_guide.html
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">검증 포털 기능</h4>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>API 인증 설정 (API Key, Secret Key)</li>
                        <li>모든 API 엔드포인트 통합 관리 및 테스트</li>
                        <li>실시간 검증 및 테스트</li>
                        <li>요청/응답 결과 확인</li>
                        <li>서명 생성 및 검증</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-800 font-semibold mb-1">사용 방법</p>
                          <ol className="list-decimal list-inside space-y-1 text-blue-700">
                            <li>검증 포털에 접속</li>
                            <li>상단의 "API 인증 설정" 섹션에서 거래처의 API Key와 Secret Key 입력</li>
                            <li>각 API 엔드포인트를 테스트</li>
                            <li>요청/응답 결과를 실시간으로 확인하여 API 동작 검증</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">API 키 관리</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">API 키 정보 위치</h4>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>테이블</strong>: <code className="bg-gray-100 px-1 rounded">pharmacy_idList</code></li>
                        <li><strong>API Key 필드</strong>: <code className="bg-gray-100 px-1 rounded">api_key</code> (pk_로 시작)</li>
                        <li><strong>Secret Key 필드</strong>: <code className="bg-gray-100 px-1 rounded">api_secret</code> (SHA256 해시)</li>
                        <li><strong>활성화 여부</strong>: <code className="bg-gray-100 px-1 rounded">api_enabled</code> (0/1)</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-yellow-800 font-semibold mb-1">주의사항</p>
                          <ul className="list-disc list-inside space-y-1 text-yellow-700">
                            <li>API Key와 Secret Key는 절대 노출되면 안 됩니다</li>
                            <li>Secret Key는 SHA256 해시로 저장되어 있어 원본을 알 수 없습니다</li>
                            <li>API 키 재생성이 필요한 경우 관리자에게 문의하세요</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 섹션 9: 문제 해결 가이드 */}
              <section id="troubleshooting" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">9. 문제 해결 가이드</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">자주 발생하는 문제</h3>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">보험료 표기 오류</h4>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-2"><strong>증상</strong>: 화재보험료가 "해당없음"으로 표시됨</p>
                        <p className="text-gray-700 mb-2"><strong>원인</strong>: DB에 화재보험료가 저장되지 않음</p>
                        <p className="text-gray-700"><strong>해결</strong>: DB에서 수동으로 확인 및 처리 필요</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">상태 변경 실패</h4>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-2"><strong>증상</strong>: 상태 변경 시 오류 메시지 표시</p>
                        <p className="text-gray-700 mb-2"><strong>원인</strong>: 예치금 부족, 필수 입력 항목 누락 등</p>
                        <p className="text-gray-700"><strong>해결</strong>: 오류 메시지 확인 후 해당 항목 수정</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">설계번호 입력 오류</h4>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-2"><strong>증상</strong>: 설계번호 입력 후 상태가 변경되지 않음</p>
                        <p className="text-gray-700 mb-2"><strong>원인</strong>: 필수 입력 항목 누락</p>
                        <p className="text-gray-700"><strong>해결</strong>: 전문인 수 또는 사업장 면적 확인</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">증권 발급 오류</h4>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-2"><strong>증상</strong>: 증권번호 입력 후 상태가 변경되지 않음</p>
                        <p className="text-gray-700 mb-2"><strong>원인</strong>: 설계번호 미입력, 필수 입력 항목 누락</p>
                        <p className="text-gray-700"><strong>해결</strong>: 설계번호 먼저 입력 후 증권번호 입력</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">문제 확인 방법</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                      <ul className="list-disc list-inside space-y-2 text-blue-700">
                        <li><strong>DB 직접 확인</strong>: MySQL에서 해당 약국의 데이터 확인</li>
                        <li><strong>API 응답 확인</strong>: 브라우저 개발자 도구에서 API 응답 확인</li>
                        <li><strong>로그 확인</strong>: 서버 로그에서 오류 메시지 확인</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">해결 방법</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">단계별 문제 해결 절차</h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>오류 메시지 확인</li>
                        <li>관련 데이터 확인 (상세 모달, DB)</li>
                        <li>필수 입력 항목 확인</li>
                        <li>상태 변경 조건 확인</li>
                        <li>필요 시 수동 처리 (DB 직접 수정)</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </section>

              {/* 섹션 10: 자주 묻는 질문(FAQ) */}
              <section id="faq" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">10. 자주 묻는 질문(FAQ)</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start mb-2">
                      <HelpCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-gray-900">Q: 승인 상태에서 보험료를 수정할 수 있나요?</h3>
                    </div>
                    <div className="ml-7">
                      <p className="text-gray-700">
                        <strong>A:</strong> 아니요. 승인 상태에서는 보험료를 수정하면 안 됩니다. 이는 원칙입니다.
                        승인 상태에서 보험료가 잘못 표기된 경우 DB에서 수동으로 처리해야 합니다.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start mb-2">
                      <HelpCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-gray-900">Q: 화재보험료가 표시되지 않는데 어떻게 해야 하나요?</h3>
                    </div>
                    <div className="ml-7">
                      <p className="text-gray-700">
                        <strong>A:</strong> 화재보험료는 사업장 면적이 80㎡ 이상인 경우에만 계산됩니다.
                        면적이 80㎡ 미만인 경우 화재보험료가 "해당없음"으로 표시될 수 있습니다.
                        메일에는 정상적인 보험료가 표기되지만, 어드민에서는 "해당없음"으로 표시될 수 있습니다.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start mb-2">
                      <HelpCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-gray-900">Q: 설계번호를 잘못 입력했는데 수정할 수 있나요?</h3>
                    </div>
                    <div className="ml-7">
                      <p className="text-gray-700">
                        <strong>A:</strong> 네, 수정할 수 있습니다. 상세 모달에서 설계번호를 다시 입력하면 됩니다.
                        설계번호는 전문인 설계번호와 화재 설계번호를 각각 입력할 수 있습니다.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start mb-2">
                      <HelpCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-gray-900">Q: 증권 발급 후 계약 상태로 변경하는 방법은?</h3>
                    </div>
                    <div className="ml-7">
                      <p className="text-gray-700">
                        <strong>A:</strong> 증권번호 입력 후 상태를 "계약(6)"으로 변경하면 됩니다.
                        상세 모달에서 상태 드롭다운을 선택하고 변경 버튼을 클릭하세요.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start mb-2">
                      <HelpCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-gray-900">Q: 예치금이 부족한데 승인할 수 있나요?</h3>
                    </div>
                    <div className="ml-7">
                      <p className="text-gray-700">
                        <strong>A:</strong> 예치금이 부족해도 승인할 수 있습니다. 다만 마이너스 잔고가 발생할 수 있으며,
                        경고 메시지가 표시됩니다. 가능하면 예치금을 충전한 후 승인하는 것을 권장합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 하단 정보 */}
              <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
                <p>약국배상책임보험 운영 가이드 v1.0</p>
                <p className="mt-2">최종 업데이트: 2026-01-14</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
