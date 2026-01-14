import { useState, useEffect, useMemo } from 'react'
import { Modal, useToastHelpers, DatePicker } from '../../../components'
import api from '../../../lib/api'
import { Search, LineChart } from 'lucide-react'

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

interface WeekdayAverage {
  name: string
  subscription: number
  termination: number
  subscriptionReject: number
  subscriptionCancel: number
  terminationCancel: number
  total: number
  count: number
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

  // 요일별 평균 계산
  const { prevMonthAverage, currentMonthAverage, prevMonthLabel, currentMonthLabel } = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const currentYear = today.getFullYear()
    const prevYear = prevMonth === 12 ? currentYear - 1 : currentYear

    // 월별 데이터 분리
    const prevMonthData: EndorseStatusData[] = []
    const currentMonthData: EndorseStatusData[] = []

    data.forEach((item) => {
      if (!item.date) return
      const itemDate = new Date(item.date)
      const itemMonth = itemDate.getMonth() + 1
      const itemYear = itemDate.getFullYear()

      if (itemYear === prevYear && itemMonth === prevMonth) {
        prevMonthData.push(item)
      } else if (itemYear === currentYear && itemMonth === currentMonth) {
        currentMonthData.push(item)
      }
    })

    // 요일별 데이터 정리 (월~일: 1~7)
    const weekdayNames = ['월', '화', '수', '목', '금', '토', '일']
    const prevMonthByWeekday: Record<number, WeekdayAverage> = {}
    const currentMonthByWeekday: Record<number, WeekdayAverage> = {}

    // 초기화
    weekdayNames.forEach((name, index) => {
      const weekdayIndex = index + 1
      prevMonthByWeekday[weekdayIndex] = {
        name,
        subscription: 0,
        termination: 0,
        subscriptionReject: 0,
        subscriptionCancel: 0,
        terminationCancel: 0,
        total: 0,
        count: 0,
      }
      currentMonthByWeekday[weekdayIndex] = {
        name,
        subscription: 0,
        termination: 0,
        subscriptionReject: 0,
        subscriptionCancel: 0,
        terminationCancel: 0,
        total: 0,
        count: 0,
      }
    })

    // 이전 달 데이터 요일별 집계
    prevMonthData.forEach((item) => {
      const date = new Date(item.date)
      let weekday = date.getDay()
      weekday = weekday === 0 ? 7 : weekday // 일요일은 7로 변환

      prevMonthByWeekday[weekday].subscription += item.subscription || 0
      prevMonthByWeekday[weekday].termination += item.termination || 0
      prevMonthByWeekday[weekday].subscriptionReject += item.subscriptionReject || 0
      prevMonthByWeekday[weekday].subscriptionCancel += item.subscriptionCancel || 0
      prevMonthByWeekday[weekday].terminationCancel += item.terminationCancel || 0
      prevMonthByWeekday[weekday].total += item.total || 0
      prevMonthByWeekday[weekday].count++
    })

    // 현재 달 데이터 요일별 집계
    currentMonthData.forEach((item) => {
      const date = new Date(item.date)
      let weekday = date.getDay()
      weekday = weekday === 0 ? 7 : weekday

      currentMonthByWeekday[weekday].subscription += item.subscription || 0
      currentMonthByWeekday[weekday].termination += item.termination || 0
      currentMonthByWeekday[weekday].subscriptionReject += item.subscriptionReject || 0
      currentMonthByWeekday[weekday].subscriptionCancel += item.subscriptionCancel || 0
      currentMonthByWeekday[weekday].terminationCancel += item.terminationCancel || 0
      currentMonthByWeekday[weekday].total += item.total || 0
      currentMonthByWeekday[weekday].count++
    })

    // 평균 계산
    const prevMonthAverage: WeekdayAverage[] = []
    const currentMonthAverage: WeekdayAverage[] = []

    for (let i = 1; i <= 7; i++) {
      const prev = prevMonthByWeekday[i]
      const curr = currentMonthByWeekday[i]

      if (prev.count > 0) {
        prevMonthAverage.push({
          ...prev,
          subscription: Math.round(prev.subscription / prev.count),
          termination: Math.round(prev.termination / prev.count),
          subscriptionReject: Math.round(prev.subscriptionReject / prev.count),
          subscriptionCancel: Math.round(prev.subscriptionCancel / prev.count),
          terminationCancel: Math.round(prev.terminationCancel / prev.count),
          total: Math.round(prev.total / prev.count),
        })
      } else {
        prevMonthAverage.push(prev)
      }

      if (curr.count > 0) {
        currentMonthAverage.push({
          ...curr,
          subscription: Math.round(curr.subscription / curr.count),
          termination: Math.round(curr.termination / curr.count),
          subscriptionReject: Math.round(curr.subscriptionReject / curr.count),
          subscriptionCancel: Math.round(curr.subscriptionCancel / curr.count),
          terminationCancel: Math.round(curr.terminationCancel / curr.count),
          total: Math.round(curr.total / curr.count),
        })
      } else {
        currentMonthAverage.push(curr)
      }
    }

    // 월평균 계산
    const prevMonthTotal = prevMonthAverage.reduce(
      (acc, item) => ({
        subscription: acc.subscription + item.subscription,
        termination: acc.termination + item.termination,
        subscriptionReject: acc.subscriptionReject + item.subscriptionReject,
        subscriptionCancel: acc.subscriptionCancel + item.subscriptionCancel,
        terminationCancel: acc.terminationCancel + item.terminationCancel,
        total: acc.total + item.total,
        count: acc.count + (item.count > 0 ? 1 : 0),
      }),
      { subscription: 0, termination: 0, subscriptionReject: 0, subscriptionCancel: 0, terminationCancel: 0, total: 0, count: 0 }
    )

    const currentMonthTotal = currentMonthAverage.reduce(
      (acc, item) => ({
        subscription: acc.subscription + item.subscription,
        termination: acc.termination + item.termination,
        subscriptionReject: acc.subscriptionReject + item.subscriptionReject,
        subscriptionCancel: acc.subscriptionCancel + item.subscriptionCancel,
        terminationCancel: acc.terminationCancel + item.terminationCancel,
        total: acc.total + item.total,
        count: acc.count + (item.count > 0 ? 1 : 0),
      }),
      { subscription: 0, termination: 0, subscriptionReject: 0, subscriptionCancel: 0, terminationCancel: 0, total: 0, count: 0 }
    )

    const prevMonthAvg: WeekdayAverage = {
      name: '월평균',
      subscription: prevMonthTotal.count > 0 ? Math.round(prevMonthTotal.subscription / prevMonthTotal.count) : 0,
      termination: prevMonthTotal.count > 0 ? Math.round(prevMonthTotal.termination / prevMonthTotal.count) : 0,
      subscriptionReject: prevMonthTotal.count > 0 ? Math.round(prevMonthTotal.subscriptionReject / prevMonthTotal.count) : 0,
      subscriptionCancel: prevMonthTotal.count > 0 ? Math.round(prevMonthTotal.subscriptionCancel / prevMonthTotal.count) : 0,
      terminationCancel: prevMonthTotal.count > 0 ? Math.round(prevMonthTotal.terminationCancel / prevMonthTotal.count) : 0,
      total: prevMonthTotal.count > 0 ? Math.round(prevMonthTotal.total / prevMonthTotal.count) : 0,
      count: 0,
    }

    const currentMonthAvg: WeekdayAverage = {
      name: '월평균',
      subscription: currentMonthTotal.count > 0 ? Math.round(currentMonthTotal.subscription / currentMonthTotal.count) : 0,
      termination: currentMonthTotal.count > 0 ? Math.round(currentMonthTotal.termination / currentMonthTotal.count) : 0,
      subscriptionReject: currentMonthTotal.count > 0 ? Math.round(currentMonthTotal.subscriptionReject / currentMonthTotal.count) : 0,
      subscriptionCancel: currentMonthTotal.count > 0 ? Math.round(currentMonthTotal.subscriptionCancel / currentMonthTotal.count) : 0,
      terminationCancel: currentMonthTotal.count > 0 ? Math.round(currentMonthTotal.terminationCancel / currentMonthTotal.count) : 0,
      total: currentMonthTotal.count > 0 ? Math.round(currentMonthTotal.total / currentMonthTotal.count) : 0,
      count: 0,
    }

    return {
      prevMonthAverage: [...prevMonthAverage, prevMonthAvg],
      currentMonthAverage: [...currentMonthAverage, currentMonthAvg],
      prevMonthLabel: `${prevYear}년 ${prevMonth}월 요일별 평균`,
      currentMonthLabel: `${currentYear}년 ${currentMonth}월 요일별 평균`,
    }
  }, [data])

  // 날짜 포맷팅 함수 (YYYY-MM-DD → YYYY-MM-DD(요일))
  const formatDateWithWeekday = (dateStr: string) => {
    const date = new Date(dateStr)
    const weekdayNames = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdayNames[date.getDay()]
    return `${dateStr}(${weekday})`
  }

  // 일별 상세 데이터를 두 개로 분할 (좌우 배치)
  const halfIndex = Math.ceil(data.length / 2)
  const leftData = data.slice(0, halfIndex)
  const rightData = data.slice(halfIndex)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="inline-flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          일일배서현황
        </span>
      }
      maxWidth="6xl"
      position="center"
    >
      <div className="space-y-4">
        {/* 필터 영역 - 한 행으로 표시 */}
        <div className="flex items-end gap-3 flex-nowrap">
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
            className="h-10 px-4 min-w-[120px] whitespace-nowrap bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            조회
          </button>
        </div>

        {/* 데이터 표시 영역 */}
        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">조회 조건에 맞는 데이터가 없습니다.</div>
        ) : (
          <div className="space-y-6">
            {/* 요일별 평균 테이블 - 좌우 배치 */}
            <div>
              <h6 className="text-sm font-semibold mb-2">요일별 평균</h6>
              <div className="grid grid-cols-2 gap-4">
                {/* 이전달 요일별 평균 */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr className="bg-gray-100">
                        <th colSpan={7} className="border border-gray-300 px-2 py-2 text-center font-medium">
                          {prevMonthLabel}
                        </th>
                      </tr>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-2 text-center font-medium">요일</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">정상</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">해지</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">청약거절</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">청약취소</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">해지취소</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">소계</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prevMonthAverage.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-2 py-2 text-center">{item.name}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.subscription.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.termination.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.subscriptionReject.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.subscriptionCancel.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.terminationCancel.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right font-semibold">{item.total.toLocaleString('ko-KR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 현재달 요일별 평균 */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr className="bg-gray-100">
                        <th colSpan={7} className="border border-gray-300 px-2 py-2 text-center font-medium">
                          {currentMonthLabel}
                        </th>
                      </tr>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-2 text-center font-medium">요일</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">정상</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">해지</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">청약거절</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">청약취소</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">해지취소</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">소계</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentMonthAverage.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-2 py-2 text-center">{item.name}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.subscription.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.termination.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.subscriptionReject.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.subscriptionCancel.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.terminationCancel.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right font-semibold">{item.total.toLocaleString('ko-KR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 일별 상세 데이터 - 좌우 배치 */}
            <div>
              <h6 className="text-sm font-semibold mb-2">일별 상세 데이터</h6>
              <div className="grid grid-cols-2 gap-4">
                {/* 왼쪽 테이블 */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-2 text-left font-medium">날짜</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">정상</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">해지</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">청약거절</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">청약취소</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">해지취소</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">소계</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leftData.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-2 py-2">{formatDateWithWeekday(item.date)}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.subscription.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.termination.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.subscriptionReject.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.subscriptionCancel.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.terminationCancel.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right font-semibold">{item.total.toLocaleString('ko-KR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 오른쪽 테이블 */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-2 text-left font-medium">날짜</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">정상</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">해지</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">청약거절</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">청약취소</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">해지취소</th>
                        <th className="border border-gray-300 px-2 py-2 text-right font-medium">소계</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rightData.map((item, index) => (
                        <tr key={halfIndex + index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-2 py-2">{formatDateWithWeekday(item.date)}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.subscription.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.termination.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.subscriptionReject.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.subscriptionCancel.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right">{item.terminationCancel.toLocaleString('ko-KR')}</td>
                          <td className="border border-gray-300 px-2 py-2 text-right font-semibold">{item.total.toLocaleString('ko-KR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
