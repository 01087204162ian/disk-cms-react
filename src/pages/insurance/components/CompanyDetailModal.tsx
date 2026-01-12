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
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">업체명:</span>
                <span className="ml-2 font-medium">{detail?.company || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">담당자:</span>
                <span className="ml-2 font-medium">{detail?.name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">연락처:</span>
                <span className="ml-2 font-medium">{detail?.hphone || detail?.cphone || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">시작일:</span>
                <span className="ml-2 font-medium">{formatDate(detail?.FirstStartDay || detail?.FirstStart)}</span>
              </div>
              <div>
                <span className="text-gray-500">총 인원:</span>
                <span className="ml-2 font-medium">{detail?.inWonTotal?.toLocaleString('ko-KR') || 0}명</span>
              </div>
              <div>
                <span className="text-gray-500">회원 ID:</span>
                <span className="ml-2 font-medium">{detail?.mem_id || '-'}</span>
              </div>
            </div>
          </div>

          {/* 증권 정보 */}
          {policies.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-700">증권 정보 (최근 1년)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-3 py-2 text-left font-medium">증권번호</th>
                      <th className="px-3 py-2 text-left font-medium">보험회사</th>
                      <th className="px-3 py-2 text-left font-medium">시작일</th>
                      <th className="px-3 py-2 text-center font-medium">날짜</th>
                      <th className="px-3 py-2 text-center font-medium">인원</th>
                      <th className="px-3 py-2 text-center font-medium">납입</th>
                      <th className="px-3 py-2 text-center font-medium">결제</th>
                      <th className="px-3 py-2 text-center font-medium">성격</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map((policy) => (
                      <tr key={policy.num} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">{policy.certi || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {getInsurerName(policy.InsuraneCompany)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{formatDate(policy.startyDay)}</td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">{policy.f_date || '-'}</td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {policy.inwon?.toLocaleString('ko-KR') || 0}명
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          <span className={getNaStateColor(policy.naColor)}>
                            {policy.naState || '-'}
                            {policy.gigan && typeof policy.gigan === 'number' && policy.gigan > 0 && (
                              <span className="text-xs text-gray-500 ml-1">({policy.gigan}일)</span>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">{policy.diviName || '-'}</td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">{policy.gitaName || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {policies.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500 text-sm">증권 정보가 없습니다.</div>
          )}
        </div>
      )}
    </Modal>
  )
}
