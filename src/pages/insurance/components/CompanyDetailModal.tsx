import { useEffect, useState } from 'react'
import { Modal, LoadingSpinner, useToastHelpers } from '../../../components'
import api from '../../../lib/api'

interface CompanyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  companyNum: number | null
  companyName?: string
  onUpdate?: () => void
}

interface CompanyDetail {
  num: number
  company: string
  MemberNum?: number
  name?: string
  hphone?: string
  cphone?: string
  FirstStartDay?: string
  FirstStart?: string
  inWonTotal?: number
  mem_id?: string
  permit?: string
  [key: string]: any
}

interface PolicyInfo {
  num: number
  certi?: string
  InsuraneCompany?: number
  startyDay?: string
  f_date?: string
  inwon?: number
  naState?: string
  naColor?: number
  gigan?: number | string
  diviName?: string
  gitaName?: string
  content?: string
  [key: string]: any
}

interface CompanyDetailResponse {
  success: boolean
  data?: PolicyInfo[]
  memoData?: any[]
  smsData?: any[]
  content?: string[]
  Rnum?: number
  error?: string
  [key: string]: any
}

const INSURER_NAMES: Record<number, string> = {
  1: '흥국',
  2: 'DB',
  3: 'KB',
  4: '현대',
  5: '롯데',
  6: '하나',
  7: '한화',
  10: '보험료',
}

const NA_STATE_COLORS: Record<number, string> = {
  1: 'text-green-600', // 납
  2: 'text-yellow-600', // 유
  3: 'text-red-600', // 실
}

export default function CompanyDetailModal({
  isOpen,
  onClose,
  companyNum,
  companyName,
}: CompanyDetailModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<CompanyDetail | null>(null)
  const [policies, setPolicies] = useState<PolicyInfo[]>([])

  useEffect(() => {
    if (isOpen && companyNum) {
      loadDetail()
    } else {
      setDetail(null)
      setPolicies([])
    }
  }, [isOpen, companyNum])

  const loadDetail = async () => {
    if (!companyNum) return

    try {
      setLoading(true)
      const response = await api.get<CompanyDetailResponse>(`/api/insurance/kj-company/${companyNum}`)

      if (response.data.success) {
        // main_info는 최상위 레벨에 있음
        const mainInfo: Partial<CompanyDetail> = {}
        const policyData: PolicyInfo[] = []

        // response.data의 모든 키를 순회
        Object.keys(response.data).forEach((key) => {
          if (key === 'data') {
            // 증권 정보 배열
            if (Array.isArray(response.data.data)) {
              policyData.push(...response.data.data)
            }
          } else if (!['success', 'memoData', 'smsData', 'content', 'Rnum', 'sNum', 'gaesu', 'error'].includes(key)) {
            // main_info 필드
            mainInfo[key] = (response.data as any)[key]
          }
        })

        setDetail(mainInfo as CompanyDetail)
        setPolicies(policyData)
      } else {
        toast.error(response.data.error || '업체 정보를 불러오는 중 오류가 발생했습니다.')
        setDetail(null)
        setPolicies([])
      }
    } catch (error: any) {
      console.error('업체 상세 정보 로드 오류:', error)
      toast.error(error.response?.data?.error || '업체 정보를 불러오는 중 오류가 발생했습니다.')
      setDetail(null)
      setPolicies([])
    } finally {
      setLoading(false)
    }
  }

  const getInsurerName = (code?: number): string => {
    if (!code) return '-'
    return INSURER_NAMES[code] || String(code)
  }

  const getNaStateColor = (color?: number): string => {
    if (!color) return 'text-gray-600'
    return NA_STATE_COLORS[color] || 'text-gray-600'
  }

  const formatDate = (date?: string): string => {
    if (!date) return '-'
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return date
      return d.toLocaleDateString('ko-KR')
    } catch {
      return date
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={companyName || detail?.company || '업체 상세 정보'}
      maxWidth="4xl"
      maxHeight="90vh"
    >
      {loading ? (
        <LoadingSpinner fullScreen={false} text="업체 정보를 불러오는 중..." />
      ) : (
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-sm font-semibold mb-0">기본 정보</h6>
              <button
                type="button"
                className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center gap-1"
                onClick={() => {
                  // Phase 5: 수정 기능 구현 예정
                  console.log('수정 버튼 클릭')
                }}
              >
                <span>수정</span>
              </button>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">주민번호</th>
                    <td className="px-3 py-2 border border-border">{detail?.jumin || '-'}</td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">대리운전회사</th>
                    <td className="px-3 py-2 border border-border">{detail?.company || companyName || '-'}</td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">성명</th>
                    <td className="px-3 py-2 border border-border">{detail?.Pname || '-'}</td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">핸드폰번호</th>
                    <td className="px-3 py-2 border border-border">{detail?.hphone || '-'}</td>
                  </tr>
                  <tr>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">전화번호</th>
                    <td className="px-3 py-2 border border-border">{detail?.cphone || '-'}</td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">담당자</th>
                    <td className="px-3 py-2 border border-border">{detail?.name || detail?.damdanga || '-'}</td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">팩스</th>
                    <td className="px-3 py-2 border border-border">{detail?.fax || '-'}</td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">사업자번호</th>
                    <td className="px-3 py-2 border border-border">{detail?.cNumber || '-'}</td>
                  </tr>
                  <tr>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">법인번호</th>
                    <td className="px-3 py-2 border border-border">{detail?.lNumber || '-'}</td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">보험료 받는날</th>
                    <td className="px-3 py-2 border border-border">
                      <input
                        type="date"
                        className="w-full px-2 py-1 text-xs border-0 bg-transparent"
                        value={detail?.FirstStart ? detail.FirstStart.substring(0, 10) : ''}
                        readOnly
                      />
                    </td>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">업체 I.D</th>
                    <td colSpan={3} className="px-3 py-2 border border-border">
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => {
                          // Phase 6: 업체 I.D 관리 모달 구현 예정
                          console.log('업체 I.D 관리 모달 열기')
                        }}
                      >
                        {detail?.mem_id || '클릭하여 관리'}
                      </button>
                      {String(detail?.permit) === '1' ? ' (허용)' : String(detail?.permit) === '2' ? ' (차단)' : ''}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-gray-100 px-3 py-2 text-left font-medium border border-border">주소</th>
                    <td colSpan={7} className="px-3 py-2 border border-border">
                      {[detail?.postNum, detail?.address1, detail?.address2].filter(Boolean).join(' ') || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr className="my-4" />

          {/* 증권 정보 */}
          <div className="mb-4">
            <h6 className="text-sm font-semibold mb-2">증권 정보</h6>
            <div className="overflow-x-auto border border-border rounded">
              <table className="w-full text-xs border-collapse" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '4%' }}>
                      순번
                    </th>
                    <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '8%' }}>
                      보험사
                    </th>
                    <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '6%' }}>
                      시작일
                    </th>
                    <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '10%' }}>
                      증권번호
                    </th>
                    <th className="px-2 py-2 text-left font-medium border border-border" style={{ width: '5%' }}>
                      분납
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '7%' }}>
                      저장
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '9%' }}>
                      회차
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '6%' }}>
                      상태
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '6%' }}>
                      인원
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '6%' }}>
                      신규<br />
                      입력
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '6%' }}>
                      운전자<br />
                      추가
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '7%' }}>
                      결제<br />
                      방식
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '7%' }}>
                      월보험료
                    </th>
                    <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '11%' }}>
                      성격
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {policies.length > 0 ? (
                    policies.map((policy, idx) => (
                      <tr key={policy.num || idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="px-2 py-2 text-center border border-border">{idx + 1}</td>
                        <td className="px-2 py-2 border border-border">{getInsurerName(policy.InsuraneCompany)}</td>
                        <td className="px-2 py-2 border border-border">{formatDate(policy.startyDay)}</td>
                        <td className="px-2 py-2 border border-border">{policy.certi || policy.policyNum || '-'}</td>
                        <td className="px-2 py-2 border border-border">{policy.nabang || '-'}</td>
                        <td className="px-2 py-2 text-center border border-border">
                          {/* Phase 2: 저장 버튼 구현 예정 */}
                        </td>
                        <td className="px-2 py-2 text-center border border-border">{policy.nabang_1 || '-'}</td>
                        <td className="px-2 py-2 text-center border border-border">
                          <span className={getNaStateColor(policy.naColor)}>
                            {policy.naState || '-'}
                            {policy.gigan && typeof policy.gigan === 'number' && policy.gigan > 0 && (
                              <span className="text-xs text-gray-500 ml-1">({Math.floor(policy.gigan)}일)</span>
                            )}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center border border-border">
                          {policy.inwon?.toLocaleString('ko-KR') || 0}명
                        </td>
                        <td className="px-2 py-2 text-center border border-border">
                          {/* Phase 2: 신규 입력 버튼 구현 예정 */}
                        </td>
                        <td className="px-2 py-2 text-center border border-border">
                          {/* Phase 2: 운전자 추가 버튼 구현 예정 */}
                        </td>
                        <td className="px-2 py-2 text-center border border-border">{policy.diviName || '-'}</td>
                        <td className="px-2 py-2 text-center border border-border">
                          {/* Phase 2: 월보험료 버튼 구현 예정 */}
                        </td>
                        <td className="px-2 py-2 text-center border border-border">{policy.gitaName || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={14} className="px-3 py-4 text-center text-gray-500 border border-border">
                        증권 정보가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
                {policies.length > 0 && detail?.inWonTotal !== undefined && (
                  <tfoot>
                    <tr>
                      <td colSpan={8} className="px-2 py-2 text-right font-semibold border border-border">
                        계
                      </td>
                      <td className="px-2 py-2 text-center font-semibold border border-border">
                        {detail.inWonTotal.toLocaleString('ko-KR')}
                      </td>
                      <td colSpan={5} className="border border-border"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
