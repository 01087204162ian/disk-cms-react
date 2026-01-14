import { useEffect, useState } from 'react'
import { Modal, useToastHelpers, FormInput, DatePicker, LoadingSpinner } from '../../../components'
import api from '../../../lib/api'
import { FileEdit } from 'lucide-react'
import PremiumInputModal from './PremiumInputModal'

interface PolicyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  certi: string
  onUpdate?: () => void
}

interface PolicyDetail {
  certi: string
  company: string
  name: string
  jumin: string
  sigi: string
  nab: string
  inwon: number
  yearRate: string | number
  harinRate: string | number
  insurance?: string | number
  p_preminum?: number
}

interface PolicyDetailResponse {
  success: boolean
  data: PolicyDetail[]
  error?: string
}

interface AgeRange {
  age_range: string
  driver_count: number
  payment10_premium1: number
  company_premium: number
  converted_premium: number
  monthly_premium: number
}

interface ManagerSubtotal {
  total_drivers: number
  total_company_premium: number
  total_converted_premium: number
  total_monthly_premium: number
}

interface Manager {
  manager_name: string
  age_ranges: AgeRange[]
  subtotal: ManagerSubtotal
}

interface GrandTotal {
  total_drivers: number
  total_company_premium: number
  total_converted_premium: number
  total_monthly_premium: number
}

interface PremiumStatsResponse {
  success: boolean
  managers?: Manager[]
  age_ranges?: AgeRange[]
  grand_total?: GrandTotal
  summary?: {
    total_drivers: number
    total_payment10_premium1: number
    total_company_premium: number
    total_converted_premium: number
    total_monthly_premium: number
  }
  error?: string
}

// 숫자에 콤마 추가 함수
const addComma = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return ''
  const cleaned = String(val).replace(/,/g, '').trim()
  if (cleaned === '') return ''
  const num = Number(cleaned)
  if (!Number.isFinite(num) || num === 0) return ''
  return num.toLocaleString('ko-KR')
}

export default function PolicyDetailModal({ isOpen, onClose, certi, onUpdate }: PolicyDetailModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [policyDetail, setPolicyDetail] = useState<PolicyDetail | null>(null)
  const [premiumModalOpen, setPremiumModalOpen] = useState(false)
  const [premiumStats, setPremiumStats] = useState<PremiumStatsResponse | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // 수정 가능한 필드 상태
  const [editData, setEditData] = useState({
    company: '',
    name: '',
    jumin: '',
    sigi: '',
    nab: '',
    yearRate: '',
    harinRate: '',
  })

  // 증권 상세 정보 조회
  const loadPolicyDetail = async () => {
    if (!certi) return

    setLoading(true)
    try {
      const response = await api.post<PolicyDetailResponse>('/api/insurance/kj-code/policy-num-detail', {
        num: certi,
      })

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const data = response.data.data[0]
        setPolicyDetail(data)
        setEditData({
          company: data.company || '',
          name: data.name || '',
          jumin: data.jumin || '',
          sigi: data.sigi || '',
          nab: String(data.nab || ''),
          yearRate: String(data.yearRate || ''),
          harinRate: String(data.harinRate || ''),
        })
        
        // p_preminum이 1이면 보험료 입력 모달 자동 열기
        if (data.p_preminum === 1) {
          toast.info(`${data.certi} 연령별 보험료 입력하세요`)
          setTimeout(() => {
            setPremiumModalOpen(true)
          }, 100)
        }
      } else {
        toast.error(response.data.error || '증권 정보를 불러올 수 없습니다.')
      }
    } catch (error: any) {
      console.error('증권 상세 정보 조회 오류:', error)
      toast.error('증권 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 보험료 통계 조회
  const loadInsurancePremiumStats = async () => {
    if (!certi) return

    setLoadingStats(true)
    try {
      const response = await api.get<PremiumStatsResponse>(
        `/api/insurance/kj-code/policy-num-stats?certi=${encodeURIComponent(certi)}&by_manager=1`
      )

      if (response.data.success) {
        setPremiumStats(response.data)
      } else {
        // 통계가 없어도 에러로 처리하지 않음 (데이터가 없을 수 있음)
        setPremiumStats(null)
      }
    } catch (error: any) {
      console.error('보험료 통계 조회 오류:', error)
      setPremiumStats(null)
    } finally {
      setLoadingStats(false)
    }
  }

  // 증권 정보 수정
  const handleUpdate = async () => {
    if (!certi) {
      toast.error('증권번호가 없습니다.')
      return
    }

    setSaving(true)
    try {
      const response = await api.post('/api/insurance/kj-certi/update', {
        certi,
        company: editData.company.trim(),
        name: editData.name.trim(),
        jumin: editData.jumin.trim(),
        sigi: editData.sigi.trim(),
        nab: editData.nab.trim(),
        yearRate: editData.yearRate.trim(),
        harinRate: editData.harinRate.trim(),
      })

      if (response.data.success) {
        toast.success(response.data.message || '증권 정보가 수정되었습니다.')
        // 상세 정보 다시 로드
        await loadPolicyDetail()
        // 보험료 통계도 다시 로드
        await loadInsurancePremiumStats()
        // 부모 컴포넌트에 업데이트 알림
        if (onUpdate) {
          onUpdate()
        }
      } else {
        toast.error(response.data.error || '증권 정보 수정에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('증권 정보 수정 오류:', error)
      toast.error('증권 정보 수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // 모달 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen && certi) {
      loadPolicyDetail()
      loadInsurancePremiumStats()
    } else {
      // 모달 닫힐 때 상태 초기화
      setPolicyDetail(null)
      setPremiumStats(null)
      setEditData({
        company: '',
        name: '',
        jumin: '',
        sigi: '',
        nab: '',
        yearRate: '',
        harinRate: '',
      })
    }
  }, [isOpen, certi])

  // 보험료 입력 모달 닫힐 때 통계 새로고침
  useEffect(() => {
    if (!premiumModalOpen && certi && isOpen) {
      loadInsurancePremiumStats()
    }
  }, [premiumModalOpen])

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="증권 상세 정보"
        maxWidth="6xl"
        maxHeight="85vh"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPremiumModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
            >
              <FileEdit className="w-4 h-4" />
              보험료 입력
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : policyDetail ? (
          <div className="space-y-4" style={{ maxHeight: 'calc(85vh - 200px)', overflowY: 'auto' }}>
            {/* 증권 정보 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                      증권번호
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                      회사명
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                      계약자
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                      주민번호
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '10%' }}>
                      계약일
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '5%' }}>
                      회차
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '5%' }}>
                      인원
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '10%' }}>
                      단체율
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '10%' }}>
                      할인율
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={policyDetail.certi}
                        readOnly
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={editData.company}
                        onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={editData.jumin}
                        onChange={(e) => setEditData({ ...editData, jumin: e.target.value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <DatePicker
                        value={editData.sigi}
                        onChange={(value) => setEditData({ ...editData, sigi: value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={editData.nab}
                        onChange={(e) => setEditData({ ...editData, nab: e.target.value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {policyDetail.inwon || 0}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={editData.yearRate}
                        onChange={(e) => setEditData({ ...editData, yearRate: e.target.value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <FormInput
                        value={editData.harinRate}
                        onChange={(e) => setEditData({ ...editData, harinRate: e.target.value })}
                        variant="modal"
                        className="text-xs"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={9} className="border border-gray-300 px-3 py-2 text-end">
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="px-4 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 text-xs"
                      >
                        {saving ? '저장 중...' : '수정'}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 보험료 통계 영역 */}
            {loadingStats ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : premiumStats && (
              <div className="space-y-3">
                {/* 담당자별 데이터가 있는 경우 */}
                {premiumStats.managers && premiumStats.managers.length > 0 ? (
                  <>
                    {premiumStats.managers.map((manager, idx) => (
                      <div key={idx} className="border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                          <h6 className="mb-0 font-semibold">담당자: {manager.manager_name}</h6>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                                  연령
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                                  인원
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-end" style={{ width: '17.5%' }}>
                                  1/10 보험료
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-end" style={{ width: '17.5%' }}>
                                  회사보험료
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-end" style={{ width: '17.5%' }}>
                                  환산
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-end" style={{ width: '17.5%' }}>
                                  월보험료
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {manager.age_ranges.map((range, rangeIdx) => (
                                <tr key={rangeIdx}>
                                  <td className="border border-gray-300 px-3 py-2 text-center whitespace-nowrap">
                                    {range.age_range}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-center">
                                    {range.driver_count}명
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-end">
                                    {addComma(range.payment10_premium1)}원
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-end">
                                    {addComma(range.company_premium)}원
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-end">
                                    {addComma(range.converted_premium)}원
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-end">
                                    {addComma(range.monthly_premium)}원
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                              <tr>
                                <th className="border border-gray-300 px-3 py-2 text-center">소계</th>
                                <th className="border border-gray-300 px-3 py-2 text-center">
                                  {manager.subtotal.total_drivers}명
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-end">-</th>
                                <th className="border border-gray-300 px-3 py-2 text-end">
                                  {addComma(manager.subtotal.total_company_premium)}원
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-end">
                                  {addComma(manager.subtotal.total_converted_premium)}원
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-end">
                                  {addComma(manager.subtotal.total_monthly_premium)}원
                                </th>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    ))}

                    {/* 전체 합계 */}
                    {premiumStats.grand_total && (
                      <div className="border-2 border-primary rounded-lg overflow-hidden">
                        <div className="bg-primary text-white px-4 py-2">
                          <h6 className="mb-0 font-semibold">전체 합계</h6>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                                  항목
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                                  인원
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-end" style={{ width: '17.5%' }}>
                                  1/10 보험료
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-end" style={{ width: '17.5%' }}>
                                  회사보험료
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-end" style={{ width: '17.5%' }}>
                                  환산
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-end" style={{ width: '17.5%' }}>
                                  월보험료
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-gray-300 px-3 py-2 text-center font-semibold">합계</td>
                                <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                                  {premiumStats.grand_total.total_drivers}명
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-end font-semibold">-</td>
                                <td className="border border-gray-300 px-3 py-2 text-end font-semibold">
                                  {addComma(premiumStats.grand_total.total_company_premium)}원
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-end font-semibold">
                                  {addComma(premiumStats.grand_total.total_converted_premium)}원
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-end font-semibold">
                                  {addComma(premiumStats.grand_total.total_monthly_premium)}원
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                ) : premiumStats.age_ranges && premiumStats.age_ranges.length > 0 ? (
                  /* 담당자별 데이터가 없는 경우 전체 통계만 표시 */
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                            연령
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center" style={{ width: '15%' }}>
                            인원
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-end" style={{ width: '17.5%' }}>
                            1/10 보험료
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-end" style={{ width: '17.5%' }}>
                            회사보험료
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-end" style={{ width: '17.5%' }}>
                            환산
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-end" style={{ width: '17.5%' }}>
                            월보험료
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {premiumStats.age_ranges.map((range, idx) => (
                          <tr key={idx}>
                            <td className="border border-gray-300 px-3 py-2 text-center whitespace-nowrap">
                              {range.age_range}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center">
                              {range.driver_count}명
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-end">
                              {addComma(range.payment10_premium1)}원
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-end">
                              {addComma(range.company_premium)}원
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-end">
                              {addComma(range.converted_premium)}원
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-end">
                              {addComma(range.monthly_premium)}원
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {premiumStats.summary && (
                        <tfoot className="bg-gray-50">
                          <tr>
                            <th className="border border-gray-300 px-3 py-2 text-center">합계</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">
                              {premiumStats.summary.total_drivers}명
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-end">
                              {addComma(premiumStats.summary.total_payment10_premium1)}원
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-end">
                              {addComma(premiumStats.summary.total_company_premium)}원
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-end">
                              {addComma(premiumStats.summary.total_converted_premium)}원
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-end">
                              {addComma(premiumStats.summary.total_monthly_premium)}원
                            </th>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            데이터가 없습니다.
          </div>
        )}
      </Modal>

      {/* 보험료 입력 모달 */}
      {certi && (
        <PremiumInputModal
          isOpen={premiumModalOpen}
          onClose={() => setPremiumModalOpen(false)}
          certi={certi}
          onUpdate={() => {
            // 보험료 입력 후 통계 새로고침
            loadInsurancePremiumStats()
            loadPolicyDetail()
          }}
        />
      )}
    </>
  )
}
