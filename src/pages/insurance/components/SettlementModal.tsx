import { useEffect, useState } from 'react'
import { useToastHelpers } from '../../../components'
import api from '../../../lib/api'

interface SettlementModalProps {
  isOpen: boolean
  onClose: () => void
  companyNum: number | null
  companyName?: string
}

interface SettlementAdjustmentItem {
  policyNum?: string
  divi?: string | number
  drivers_count?: number
  total_AdjustedInsuranceMothlyPremium?: number
  payment10_premium?: number
  eTotalMonthPremium?: number
  eTotalCompanyPremium?: number
  Conversion_AdjustedInsuranceCompanyPremium?: number
  nab?: number
}

interface SettlementAdjustmentResponse {
  success: boolean
  data?: SettlementAdjustmentItem[]
  error?: string
}

interface SettlementEndorseDayResponse {
  success: boolean
  paymentStartDate?: string
  thisMonthDueDate?: string
  jumin?: string
  error?: string
}

export default function SettlementModal({
  isOpen,
  onClose,
  companyNum,
  companyName,
}: SettlementModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [adjustmentData, setAdjustmentData] = useState<SettlementAdjustmentItem[]>([])
  const [totalPremium, setTotalPremium] = useState(0)

  useEffect(() => {
    if (isOpen && companyNum) {
      loadSettlementDates()
    } else {
      setStartDate('')
      setEndDate('')
      setAdjustmentData([])
      setTotalPremium(0)
    }
  }, [isOpen, companyNum])

  useEffect(() => {
    if (isOpen && companyNum && startDate && endDate) {
      loadSettlementData()
    }
  }, [isOpen, companyNum, startDate, endDate])

  // 정산 기간 조회
  const loadSettlementDates = async () => {
    if (!companyNum) return

    try {
      const response = await api.get<SettlementEndorseDayResponse>(
        `/api/insurance/kj-company/settlement/endorse-day?dNum=${companyNum}`
      )

      if (response.data.success) {
        if (response.data.paymentStartDate) {
          setStartDate(response.data.paymentStartDate)
        } else {
          // Fallback: 한 달 전
          const today = new Date()
          const lastMonth = new Date(today)
          lastMonth.setMonth(today.getMonth() - 1)
          setStartDate(formatDate(lastMonth))
        }
        if (response.data.thisMonthDueDate) {
          setEndDate(response.data.thisMonthDueDate)
        } else {
          // Fallback: 오늘
          setEndDate(formatDate(new Date()))
        }
      } else {
        // Fallback
        const today = new Date()
        const lastMonth = new Date(today)
        lastMonth.setMonth(today.getMonth() - 1)
        setStartDate(formatDate(lastMonth))
        setEndDate(formatDate(today))
        toast.error(response.data.error || '정산 기간 조회에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('정산 기간 조회 오류:', error)
      // Fallback
      const today = new Date()
      const lastMonth = new Date(today)
      lastMonth.setMonth(today.getMonth() - 1)
      setStartDate(formatDate(lastMonth))
      setEndDate(formatDate(today))
      toast.error('정산 기간 조회 중 오류가 발생했습니다.')
    }
  }

  // 정산 데이터 로드 (증권번호별 집계)
  const loadSettlementData = async () => {
    if (!companyNum || !startDate || !endDate) return

    try {
      setLoading(true)
      const response = await api.get<SettlementAdjustmentResponse>(
        `/api/insurance/kj-company/settlement/adjustment`,
        {
          params: {
            dNum: companyNum,
            lastMonthDueDate: startDate,
            thisMonthDueDate: endDate,
          },
        }
      )

      if (response.data.success && response.data.data) {
        setAdjustmentData(response.data.data)
        calculateTotalPremium(response.data.data)
      } else {
        setAdjustmentData([])
        setTotalPremium(0)
        toast.error(response.data.error || '정산 데이터 조회에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('정산 데이터 조회 오류:', error)
      setAdjustmentData([])
      setTotalPremium(0)
      toast.error('정산 데이터 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 업체에 통보할 보험료 계산
  const calculateTotalPremium = (data: SettlementAdjustmentItem[]) => {
    if (!data || data.length === 0) {
      setTotalPremium(0)
      return
    }

    let total = 0

    data.forEach((item) => {
      const divi = String(item.divi || '')
      const nab = item.nab || 1
      const monthlyPremium = item.total_AdjustedInsuranceMothlyPremium || 0
      const payment10Premium = item.payment10_premium || 0
      const endorseMonthlyPremium = item.eTotalMonthPremium || 0
      const endorseCompanyPremium = item.eTotalCompanyPremium || 0

      // 배서보험료 계산
      let endorsePremium = 0
      if (divi === '2') {
        // 월납
        endorsePremium = endorseMonthlyPremium
      } else {
        // 10회분납
        endorsePremium = endorseCompanyPremium
      }

      // 계 계산
      let rowTotal = 0
      if (divi === '2') {
        // 월납: 계 = 월보험료 + 배서보험료
        rowTotal = monthlyPremium + endorsePremium
      } else {
        // 10회분납: nab 값에 따라 계산
        if (nab === 1) {
          rowTotal = payment10Premium * 2 + endorsePremium
        } else if (nab >= 2 && nab <= 8) {
          rowTotal = payment10Premium + endorsePremium
        } else if (nab >= 9 && nab <= 10) {
          rowTotal = payment10Premium * 0.5 + endorsePremium
        } else {
          rowTotal = payment10Premium + endorsePremium
        }
      }

      total += rowTotal
    })

    setTotalPremium(total)
  }

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ko-KR')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 p-4">
      <div
        className="w-full rounded-xl bg-background border border-border overflow-hidden flex flex-col shadow-xl"
        style={{ maxWidth: '48%', height: '90vh', position: 'fixed', right: '1%', top: '50%', transform: 'translateY(-50%)' }}
      >
        {/* 헤더 */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-border">
          <h3 className="text-lg font-semibold">정산 {companyName ? `- ${companyName}` : ''}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 날짜 필터 */}
          <div className="mb-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">시작일</label>
              <input
                type="date"
                className="px-3 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">종료일</label>
              <input
                type="date"
                className="px-3 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="ms-auto">
              <button
                className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                onClick={() => {
                  // TODO: 엑셀 다운로드
                  toast.info('엑셀 다운로드 기능은 추후 구현 예정입니다.')
                }}
              >
                엑셀 다운로드
              </button>
            </div>
          </div>

          {/* 증권번호별 집계 테이블 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">증권번호별 집계</h4>
            <div className="overflow-x-auto border border-border rounded">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium">증권번호</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium">납부방식</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium">인원</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '12%' }}>
                      월보험료
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '12%' }}>
                      1/10 보험료
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '12%' }}>
                      배서보험료
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '12%' }}>
                      계
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '12%' }}>
                      환산보험료
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="border border-gray-300 px-3 py-4 text-center text-muted-foreground">
                        데이터를 불러오는 중...
                      </td>
                    </tr>
                  ) : adjustmentData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="border border-gray-300 px-3 py-4 text-center text-muted-foreground">
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {adjustmentData.map((item, index) => {
                        const diviText = item.divi === '1' ? '10회분납' : item.divi === '2' ? '월납' : '-'
                        const monthlyPremium = item.total_AdjustedInsuranceMothlyPremium || 0
                        const payment10Premium = item.payment10_premium || 0
                        const divi = String(item.divi || '')
                        const nab = item.nab || 1

                        // 배서보험료 계산
                        let endorsePremium = 0
                        if (divi === '2') {
                          endorsePremium = item.eTotalMonthPremium || 0
                        } else {
                          endorsePremium = item.eTotalCompanyPremium || 0
                        }

                        // 계 계산
                        let rowTotal = 0
                        if (divi === '2') {
                          rowTotal = monthlyPremium + endorsePremium
                        } else {
                          if (nab === 1) {
                            rowTotal = payment10Premium * 2 + endorsePremium
                          } else if (nab >= 2 && nab <= 8) {
                            rowTotal = payment10Premium + endorsePremium
                          } else if (nab >= 9 && nab <= 10) {
                            rowTotal = payment10Premium * 0.5 + endorsePremium
                          } else {
                            rowTotal = payment10Premium + endorsePremium
                          }
                        }

                        const conversionPremium = item.Conversion_AdjustedInsuranceCompanyPremium || 0
                        const conversionPremiumDisplay = divi === '1' ? '-' : formatNumber(conversionPremium)

                        return (
                          <tr key={index}>
                            <td className="border border-gray-300 px-3 py-2">{item.policyNum || '-'}</td>
                            <td className="border border-gray-300 px-3 py-2">{diviText}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right">
                              {formatNumber(item.drivers_count || 0)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(monthlyPremium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(payment10Premium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(endorsePremium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(rowTotal)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {conversionPremiumDisplay}
                            </td>
                          </tr>
                        )
                      })}
                      {/* 합계 행 */}
                      {adjustmentData.length > 0 && (() => {
                        const totalDrivers = adjustmentData.reduce((sum, item) => sum + (item.drivers_count || 0), 0)
                        const totalMonthlyPremium = adjustmentData.reduce(
                          (sum, item) => sum + (item.total_AdjustedInsuranceMothlyPremium || 0),
                          0
                        )
                        const totalPayment10Premium = adjustmentData.reduce(
                          (sum, item) => sum + (item.payment10_premium || 0),
                          0
                        )
                        const totalEndorsePremium = adjustmentData.reduce((sum, item) => {
                          const divi = String(item.divi || '')
                          if (divi === '2') {
                            return sum + (item.eTotalMonthPremium || 0)
                          } else {
                            return sum + (item.eTotalCompanyPremium || 0)
                          }
                        }, 0)
                        const totalConversionPremium = adjustmentData.reduce((sum, item) => {
                          if (item.divi === '1') return sum
                          return sum + (item.Conversion_AdjustedInsuranceCompanyPremium || 0)
                        }, 0)

                        return (
                          <tr className="bg-gray-100 font-bold">
                            <td colSpan={2} className="border border-gray-300 px-3 py-2 text-center">
                              합계
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right">
                              {formatNumber(totalDrivers)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(totalMonthlyPremium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(totalPayment10Premium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(totalEndorsePremium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(totalPremium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {totalConversionPremium > 0 ? formatNumber(totalConversionPremium) : '-'}
                            </td>
                          </tr>
                        )
                      })()}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 업체에 통보할 보험료 */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">업체에 통보할 보험료</h4>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  onClick={() => {
                    // TODO: 확정보험료 입력 모달
                    toast.info('확정보험료 입력 기능은 추후 구현 예정입니다.')
                  }}
                >
                  확정보험료 입력
                </button>
                <button
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // TODO: 정산리스트 모달
                    toast.info('정산리스트 기능은 추후 구현 예정입니다.')
                  }}
                >
                  정산리스트
                </button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{formatNumber(totalPremium)}원</div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 flex justify-end flex-shrink-0 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
