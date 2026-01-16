import { BookOpen, AlertCircle, Info, HelpCircle } from 'lucide-react'

export default function Documentation() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 헤더 */}
      <div className="mb-8 border-b pb-4">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">약국배상책임보험 운영 가이드</h1>
        </div>
        <p className="text-gray-600">실제 운영자가 사용할 수 있는 실용적인 운영 매뉴얼</p>
      </div>

      {/* 목차 */}
      <div className="mb-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">목차</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><a href="#system-overview" className="text-blue-600 hover:underline">1. 시스템 개요</a></li>
          <li><a href="#daily-workflow" className="text-blue-600 hover:underline">2. 일상 업무 플로우</a></li>
          <li><a href="#application-process" className="text-blue-600 hover:underline">3. 신청 처리 프로세스</a></li>
          <li><a href="#status-guide" className="text-blue-600 hover:underline">4. 상태 변경 가이드</a></li>
          <li><a href="#premium-guide" className="text-blue-600 hover:underline">5. 보험료 확인 및 수정</a></li>
          <li><a href="#troubleshooting" className="text-blue-600 hover:underline">6. 문제 해결 가이드</a></li>
          <li><a href="#faq" className="text-blue-600 hover:underline">7. 자주 묻는 질문(FAQ)</a></li>
        </ul>
      </div>

      {/* 섹션 1: 시스템 개요 */}
      <section id="system-overview" className="mb-12">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">1. 시스템 개요</h2>
        
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
      <section id="daily-workflow" className="mb-12">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">2. 일상 업무 플로우</h2>
        
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
      <section id="application-process" className="mb-12">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">3. 신청 처리 프로세스</h2>
        
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
      <section id="status-guide" className="mb-12">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">4. 상태 변경 가이드</h2>
        
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
      <section id="premium-guide" className="mb-12">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">5. 보험료 확인 및 수정</h2>
        
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

      {/* 섹션 6: 문제 해결 가이드 */}
      <section id="troubleshooting" className="mb-12">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">6. 문제 해결 가이드</h2>
        
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

      {/* 섹션 7: 자주 묻는 질문(FAQ) */}
      <section id="faq" className="mb-12">
        <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b">7. 자주 묻는 질문(FAQ)</h2>
        
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
  )
}
