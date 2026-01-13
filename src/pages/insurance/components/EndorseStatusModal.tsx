import { useState, useEffect } from 'react'
import { Modal, useToastHelpers, DatePicker } from '../../../components'
import api from '../../../lib/api'

interface EndorseStatusModalProps {
  isOpen: boolean
  onClose: () => void
}

interface EndorseStatusData {
  date: string
  subscription: number
  termination: number
  subscriptionReject: number
  subscriptionCancel: number
  terminationCancel: number
  total: number
}

export default function EndorseStatusModal({ isOpen, onClose }: EndorseStatusModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [data, setData] = useState<EndorseStatusData[]>([])

  // 초기 날짜 설정 (1개월 전 첫날 ~ 오늘)
  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      setToDate(todayStr)

      const prevMonth = new Date(today)
      prevMonth.setMonth(today.getMonth() - 1)
      prevMonth.setDate(1)
      const prevMonthStr = prevMonth.toISOString().split('T')[0]
      setFromDate(prevMonthStr)

      // 초기 데이터 로드
      if (prevMonthStr && todayStr) {
        loadData(prevMonthStr, todayStr)
      }
    }
  }, [isOpen])

  const loadData = async (from: string, to: string) => {
    try {
      setLoading(true)
      const res = await api.post<{ success: boolean; data: EndorseStatusData[]; error?: string }>(
        '/api/insurance/kj-daily-endorse/current-situation',
        {
          fromDate: from,
          toDate: to,
        }
      )

      if (res.data.success) {
        setData(res.data.data || [])
      } else {
        toast.error(res.data.error || '데이터를 불러오는 중 오류가 발생했습니다.')
        setData([])
      }
    } catch (error: any) {
      console.error('배서현황 조회 오류:', error)
      toast.error(error.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다.')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!fromDate || !toDate) {
      toast.error('시작일과 종료일을 선택해주세요.')
      return
    }
    loadData(fromDate, toDate)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="배서현황"
      size="xl"
    >
      <div className="space-y-4">
        {/* 필터 영역 */}
        <div className="flex items-end gap-3">
          <DatePicker
            value={fromDate}
            onChange={(value) => setFromDate(value || '')}
            label="시작일"
            className="w-40"
          />
          <DatePicker
            value={toDate}
            onChange={(value) => setToDate(value || '')}
            label="종료일"
            className="w-40"
          />
          <button
            onClick={handleSearch}
            className="h-10 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            조회
          </button>
        </div>

        {/* 데이터 표시 영역 */}
        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">조회 조건에 맞는 데이터가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-accent">
                  <th className="border px-4 py-2 text-left text-xs" style={{ fontSize: '0.75rem' }}>날짜</th>
                  <th className="border px-4 py-2 text-right text-xs" style={{ fontSize: '0.75rem' }}>청약</th>
                  <th className="border px-4 py-2 text-right text-xs" style={{ fontSize: '0.75rem' }}>해지</th>
                  <th className="border px-4 py-2 text-right text-xs" style={{ fontSize: '0.75rem' }}>청약거절</th>
                  <th className="border px-4 py-2 text-right text-xs" style={{ fontSize: '0.75rem' }}>청약취소</th>
                  <th className="border px-4 py-2 text-right text-xs" style={{ fontSize: '0.75rem' }}>해지취소</th>
                  <th className="border px-4 py-2 text-right text-xs" style={{ fontSize: '0.75rem' }}>계</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-accent/50">
                    <td className="border px-2 py-2 text-xs" style={{ fontSize: '0.75rem' }}>{item.date}</td>
                    <td className="border px-2 py-2 text-right text-xs" style={{ fontSize: '0.75rem' }}>{item.subscription.toLocaleString('ko-KR')}</td>
                    <td className="border px-2 py-2 text-right text-xs" style={{ fontSize: '0.75rem' }}>{item.termination.toLocaleString('ko-KR')}</td>
                    <td className="border px-2 py-2 text-right text-xs" style={{ fontSize: '0.75rem' }}>{item.subscriptionReject.toLocaleString('ko-KR')}</td>
                    <td className="border px-2 py-2 text-right text-xs" style={{ fontSize: '0.75rem' }}>{item.subscriptionCancel.toLocaleString('ko-KR')}</td>
                    <td className="border px-2 py-2 text-right text-xs" style={{ fontSize: '0.75rem' }}>{item.terminationCancel.toLocaleString('ko-KR')}</td>
                    <td className="border px-2 py-2 text-right text-xs font-semibold" style={{ fontSize: '0.75rem' }}>{item.total.toLocaleString('ko-KR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  )
}
