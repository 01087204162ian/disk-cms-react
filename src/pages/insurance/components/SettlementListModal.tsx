import { useState, useEffect } from 'react'
import { Modal, useToastHelpers } from '../../../components'
import api from '../../../lib/api'
import { useAuthStore } from '../../../store/authStore'

interface SettlementListModalProps {
  isOpen: boolean
  onClose: () => void
  defaultAttempted?: string
}

interface SettlementListItem {
  id: number
  thisMonthDueDate: string
  company: string
  managerName: string
  adjustmentAmount: number | string
  totalDrivers: number
  receivedAmount: number | string | null
  receiveDate: string | null
  receiveUser: string | null
  memo: string | null
}

interface SettlementListResponse {
  success: boolean
  count?: number
  data?: SettlementListItem[]
  statistics?: {
    totalCount: number
    totalAdjustmentAmount: number
    receivedCount: number
    totalReceivedAmount: number
    unpaidCount: number
    totalUnpaidAmount: number
  }
  error?: string
}

interface Manager {
  num: number
  name: string
}

export default function SettlementListModal({
  isOpen,
  onClose,
  defaultAttempted = '1',
}: SettlementListModalProps) {
  const toast = useToastHelpers()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [lastDate, setLastDate] = useState('')
  const [thisDate, setThisDate] = useState('')
  const [damdanga, setDamdanga] = useState('')
  const [attempted, setAttempted] = useState(defaultAttempted)
  const [managers, setManagers] = useState<Manager[]>([])
  const [settlementList, setSettlementList] = useState<SettlementListItem[]>([])
  const [statistics, setStatistics] = useState<SettlementListResponse['statistics']>(undefined)
  const [editingReceivedAmount, setEditingReceivedAmount] = useState<Record<number, string>>({})
  const [editingMemo, setEditingMemo] = useState<Record<number, string>>({})

  useEffect(() => {
    if (isOpen) {
      // 기본 날짜 설정 (한 달 전 ~ 오늘)
      const today = new Date()
      const lastMonth = new Date(today)
      lastMonth.setMonth(today.getMonth() - 1)
      
      setLastDate(formatDate(lastMonth))
      setThisDate(formatDate(today))
      setAttempted(defaultAttempted)
      setDamdanga('')
      setSettlementList([])
      setStatistics(undefined)
      setEditingReceivedAmount({})
      setEditingMemo({})
      
      // 담당자 목록 로드
      loadManagers()
    }
  }, [isOpen, defaultAttempted])

  useEffect(() => {
    if (isOpen && lastDate && thisDate) {
      // 자동 검색
      handleSearch()
    }
  }, [isOpen, lastDate, thisDate, attempted, damdanga])

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatAmount = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined || amount === '') return '0'
    const numAmount = parseFloat(String(amount).replace(/,/g, ''))
    return isNaN(numAmount) ? '0' : numAmount.toLocaleString('ko-KR')
  }

  const formatDateTime = (dateTimeStr: string | null | undefined): string => {
    if (!dateTimeStr || dateTimeStr === '0000-00-00 00:00:00' || dateTimeStr === '0000-00-00') return ''
    try {
      const date = new Date(dateTimeStr)
      if (isNaN(date.getTime())) return dateTimeStr
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    } catch (e) {
      return dateTimeStr
    }
  }

  const loadManagers = async () => {
    try {
      const response = await api.get<{ success: boolean; data?: Manager[] }>('/api/insurance/kj-company/managers')
      if (response.data.success && response.data.data) {
        setManagers(response.data.data)
      }
    } catch (error: any) {
      console.error('담당자 목록 로드 실패:', error)
    }
  }

  const handleSearch = async () => {
    if (!lastDate || !thisDate) {
      toast.error('시작일과 종료일을 선택해주세요.')
      return
    }

    try {
      setLoading(true)
      const requestData: any = {
        lastDate,
        thisDate,
        attempted,
      }
      if (damdanga && damdanga.trim() !== '') {
        requestData.damdanga = damdanga.trim()
      }

      const response = await api.post<SettlementListResponse>(
        '/api/insurance/kj-company/settlement/list',
        requestData
      )

      if (response.data.success) {
        setSettlementList(response.data.data || [])
        setStatistics(response.data.statistics || undefined)
        
        // 편집 상태 초기화
        const receivedAmounts: Record<number, string> = {}
        const memos: Record<number, string> = {}
        response.data.data?.forEach((item) => {
          if (item.receivedAmount !== null && item.receivedAmount !== undefined) {
            receivedAmounts[item.id] = formatAmount(item.receivedAmount)
          }
          if (item.memo) {
            memos[item.id] = item.memo
          }
        })
        setEditingReceivedAmount(receivedAmounts)
        setEditingMemo(memos)
      } else {
        toast.error(response.data.error || '정산리스트 조회에 실패했습니다.')
        setSettlementList([])
        setStatistics(undefined)
      }
    } catch (error: any) {
      console.error('정산리스트 조회 오류:', error)
      toast.error('정산리스트 조회 중 오류가 발생했습니다.')
      setSettlementList([])
      setStatistics(undefined)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveReceivedAmount = async (id: number) => {
    const receivedAmount = editingReceivedAmount[id]?.replace(/,/g, '') || ''
    const userName = user?.name || 
      (typeof window !== 'undefined' && window.sessionStorage?.getItem('userName')) ||
      (typeof window !== 'undefined' && window.localStorage?.getItem('userName')) ||
      'system'

    try {
      const response = await api.post('/api/insurance/kj-company/settlement/list-save', {
        id,
        receivedAmount: receivedAmount || null,
        receiveUser: userName,
      })

      if (response.data.success) {
        toast.success('받을 보험료가 저장되었습니다.')
        // 리스트 다시 로드
        handleSearch()
      } else {
        toast.error(response.data.error || '저장에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('받을 보험료 저장 오류:', error)
      toast.error('저장 중 오류가 발생했습니다.')
    }
  }

  const handleSaveMemo = async (id: number) => {
    const memo = editingMemo[id] || ''
    const userName = user?.name || 
      (typeof window !== 'undefined' && window.sessionStorage?.getItem('userName')) ||
      (typeof window !== 'undefined' && window.localStorage?.getItem('userName')) ||
      'system'

    try {
      const response = await api.post('/api/insurance/kj-company/settlement/list-save', {
        id,
        memo: memo || null,
        receiveUser: userName,
      })

      if (response.data.success) {
        // 성공 (조용히 저장)
      } else {
        toast.error(response.data.error || '저장에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('메모 저장 오류:', error)
      toast.error('저장 중 오류가 발생했습니다.')
    }
  }

  const handleReceivedAmountChange = (id: number, value: string) => {
    const formatted = formatAmount(value)
    setEditingReceivedAmount((prev) => ({
      ...prev,
      [id]: formatted,
    }))
  }

  const calculateDifference = (item: SettlementListItem): string => {
    const adjustmentAmount = parseFloat(String(item.adjustmentAmount || 0).replace(/,/g, ''))
    const receivedAmount = parseFloat(String(editingReceivedAmount[item.id] || 0).replace(/,/g, ''))
    const difference = adjustmentAmount - receivedAmount
    return formatAmount(difference)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4" style={{ display: isOpen ? 'block' : 'none' }}>
      <div
        className="w-full rounded-xl bg-background border border-border overflow-hidden flex flex-col shadow-xl"
        style={{
          position: 'fixed',
          left: '1%',
          top: '1%',
          width: '78%',
          maxWidth: '78%',
          maxHeight: '95vh',
          zIndex: 1057,
        }}
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h5 className="text-lg font-semibold text-white m-0">정산리스트</h5>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded p-1 text-xl leading-none transition-colors"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {/* 검색 영역 */}
        <div className="mb-4 flex flex-wrap gap-2 items-end justify-between">
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs font-medium mb-1">시작일</label>
              <input
                type="date"
                className="px-2 py-1 text-sm border border-border rounded"
                value={lastDate}
                onChange={(e) => setLastDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">종료일</label>
              <input
                type="date"
                className="px-2 py-1 text-sm border border-border rounded"
                value={thisDate}
                onChange={(e) => setThisDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">담당자</label>
              <select
                className="px-2 py-1 text-sm border border-border rounded"
                value={damdanga}
                onChange={(e) => setDamdanga(e.target.value)}
              >
                <option value="">전체</option>
                {managers.map((manager) => (
                  <option key={manager.num} value={manager.name}>
                    {manager.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">구분</label>
              <select
                className="px-2 py-1 text-sm border border-border rounded"
                value={attempted}
                onChange={(e) => setAttempted(e.target.value)}
              >
                <option value="1">전체</option>
                <option value="2">미수</option>
              </select>
            </div>
            <div>
              <button
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? '조회 중...' : '검색'}
              </button>
            </div>
          </div>
        </div>

        {/* 통계 영역 */}
        {statistics && (
          <div className="mb-4 p-3 bg-gray-50 rounded flex gap-4 items-center">
            <div className="text-center">
              <div className="text-xs font-medium text-primary">전체건</div>
              <div className="font-bold">{statistics.totalCount || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-primary">전체금액</div>
              <div className="font-bold text-primary">{formatAmount(statistics.totalAdjustmentAmount || 0)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-green-600">받은건</div>
              <div className="font-bold">{statistics.receivedCount || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-green-600">받은금액</div>
              <div className="font-bold text-green-600">{formatAmount(statistics.totalReceivedAmount || 0)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-red-600">미수건</div>
              <div className="font-bold">{statistics.unpaidCount || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-red-600">미수금액</div>
              <div className="font-bold text-red-600">{formatAmount(statistics.totalUnpaidAmount || 0)}</div>
            </div>
          </div>
        )}

        {/* 리스트 테이블 */}
        <div className="overflow-x-auto border border-border rounded">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" style={{ width: '3%' }}>
                  No
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" style={{ width: '7%' }}>
                  정산일
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" style={{ width: '10%' }}>
                  대리운전회사
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" style={{ width: '7%' }}>
                  담당자
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" style={{ width: '6%' }}>
                  보험료
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" style={{ width: '4%' }}>
                  인원
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" style={{ width: '6%' }}>
                  받을보험료
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" style={{ width: '10%' }}>
                  받은날
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" style={{ width: '7%' }}>
                  받은입력자
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" style={{ width: '5%' }}>
                  차액
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" style={{ width: '37%' }}>
                  메모
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="border border-gray-300 px-2 py-4 text-center text-muted-foreground">
                    조회 중...
                  </td>
                </tr>
              ) : settlementList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="border border-gray-300 px-2 py-4 text-center text-muted-foreground">
                    조회된 정산 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                settlementList.map((item, index) => {
                  const difference = calculateDifference(item)
                  const differenceNum = parseFloat(difference.replace(/,/g, ''))
                  
                  return (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>
                      <td className="border border-gray-300 px-2 py-1">{item.thisMonthDueDate || ''}</td>
                      <td className="border border-gray-300 px-2 py-1">{item.company || ''}</td>
                      <td className="border border-gray-300 px-2 py-1">{item.managerName || ''}</td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {formatAmount(item.adjustmentAmount)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {item.totalDrivers || 0}
                      </td>
                      <td className="border border-gray-300 px-2 py-1" style={{ padding: '0.25rem' }}>
                        <input
                          type="text"
                          className="w-full px-1 py-0.5 text-xs text-right border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="받을 보험료"
                          value={editingReceivedAmount[item.id] || ''}
                          onChange={(e) => handleReceivedAmountChange(item.id, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleSaveReceivedAmount(item.id)
                            }
                          }}
                          onBlur={() => handleSaveReceivedAmount(item.id)}
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {formatDateTime(item.receiveDate)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">{item.receiveUser || ''}</td>
                      <td className={`border border-gray-300 px-2 py-1 text-right ${differenceNum < 0 ? 'text-red-600' : ''}`}>
                        {difference}
                      </td>
                      <td className="border border-gray-300 px-2 py-1" style={{ padding: '0.25rem' }}>
                        <input
                          type="text"
                          className="w-full px-1 py-0.5 text-xs border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="메모 입력"
                          value={editingMemo[item.id] || ''}
                          onChange={(e) => setEditingMemo((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleSaveMemo(item.id)
                            }
                          }}
                          onBlur={() => handleSaveMemo(item.id)}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  )
}
