import { useState, useEffect, useMemo } from 'react'
import { Modal, Select, LoadingSpinner, useToastHelpers } from '../../../components'
import api from '../../../lib/api'

interface DailyReportModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Account {
  num: string
  directory: string
}

type ReportMode = 'daily' | 'monthly'

interface DayData {
  date: number | null
  isCurrentMonth: boolean
  approval_count: number
  approval_amount: number
  cancel_count: number
  cancel_amount: number
}

interface CalendarWeek {
  days: DayData[]
}

export default function DailyReportModal({ isOpen, onClose }: DailyReportModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [reportMode, setReportMode] = useState<ReportMode>('daily')
  
  // 필터 상태
  const [filters, setFilters] = useState({
    account: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    criteria: 'approval' as 'approval' | 'certificate', // 기준 선택: 승인 기준 / 증권발급 기준
  })

  // 결과 데이터
  const [resultData, setResultData] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)

  // 거래처 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadAccounts()
    }
  }, [isOpen])

  const loadAccounts = async () => {
    try {
      const res = await api.get('/api/pharmacy/accounts')
      if (res.data?.success) {
        setAccounts(res.data.data || [])
      }
    } catch (error: any) {
      console.error('거래처 목록 로드 오류:', error)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params: any = {
        account: filters.account,
        year: filters.year,
        month: filters.month,
        criteria: filters.criteria,
      }

      const endpoint = reportMode === 'daily' 
        ? '/api/pharmacy-reports/daily' 
        : '/api/pharmacy-reports/monthly'

      const res = await api.get(endpoint, { params })
      if (res.data?.success) {
        setResultData(res.data.data || [])
        setSummary(res.data.summary || {})
      } else {
        throw new Error(res.data?.message || '데이터를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('실적 조회 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '실적을 조회하는 중 오류가 발생했습니다.')
      setResultData([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  // 년도 옵션 (최근 3년)
  const yearOptions = []
  const currentYear = new Date().getFullYear()
  for (let i = 0; i < 3; i++) {
    const year = currentYear - i
    yearOptions.push({ value: String(year), label: `${year}년` })
  }

  // 월 옵션
  const monthOptions = []
  for (let i = 1; i <= 12; i++) {
    monthOptions.push({ value: String(i), label: `${i}월` })
  }

  const formatCurrency = (amount: number | string) => {
    if (!amount || amount === 0) return ''
    return parseInt(String(amount)).toLocaleString('ko-KR')
  }

  // 달력 구조 생성
  const buildCalendarStructure = (dailyData: any[], year: number, month: number): CalendarWeek[] => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const firstDayOfWeek = firstDay.getDay()
    const lastDate = lastDay.getDate()

    // 데이터를 날짜별 맵으로 변환
    const dataMap: Record<number, any> = {}
    dailyData.forEach((item) => {
      const date = new Date(item.date)
      const day = date.getDate()
      dataMap[day] = item
    })

    const weeks: CalendarWeek[] = []
    let week: DayData[] = []

    // 첫 주의 빈 칸 (이전 달 날짜 표시 안 함)
    for (let i = 0; i < firstDayOfWeek; i++) {
      week.push({
        date: null,
        isCurrentMonth: false,
        approval_count: 0,
        approval_amount: 0,
        cancel_count: 0,
        cancel_amount: 0,
      })
    }

    // 현재 달의 날짜들
    for (let date = 1; date <= lastDate; date++) {
      const dayData = dataMap[date] || {}
      
      week.push({
        date: date,
        isCurrentMonth: true,
        approval_count: parseInt(dayData.approval_count) || 0,
        approval_amount: parseInt(dayData.approval_amount) || 0,
        cancel_count: parseInt(dayData.cancel_count) || 0,
        cancel_amount: parseInt(dayData.cancel_amount) || 0,
      })

      if (week.length === 7) {
        weeks.push({ days: week })
        week = []
      }
    }

    // 마지막 주의 빈 칸 (다음 달 날짜 표시 안 함)
    if (week.length > 0) {
      while (week.length < 7) {
        week.push({
          date: null,
          isCurrentMonth: false,
          approval_count: 0,
          approval_amount: 0,
          cancel_count: 0,
          cancel_amount: 0,
        })
      }
      weeks.push({ days: week })
    }

    return weeks
  }

  // 달력 데이터
  const calendarWeeks = useMemo(() => {
    if (!resultData || resultData.length === 0 || reportMode !== 'daily') {
      return []
    }
    return buildCalendarStructure(resultData, filters.year, filters.month)
  }, [resultData, filters.year, filters.month, reportMode])

  const renderStatsCards = () => {
    if (!summary) return null

    const netAmount = (summary.total_approval_amount || 0) - (summary.total_cancel_amount || 0)
    const netCount = (summary.total_approval_count || 0) - (summary.total_cancel_count || 0)

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* 승인 */}
        <div className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg shadow-sm p-3 text-white text-center">
          <div className="text-xs opacity-75 mb-1">승인</div>
          <div className="text-lg font-bold">
            {formatCurrency(summary.total_approval_amount || 0)}(
            {formatCurrency(summary.total_approval_count || 0)})
          </div>
        </div>
        {/* 해지 */}
        <div className="bg-gradient-to-br from-pink-400 to-red-400 rounded-lg shadow-sm p-3 text-white text-center">
          <div className="text-xs opacity-75 mb-1">해지</div>
          <div className="text-lg font-bold">
            {formatCurrency(summary.total_cancel_amount || 0)}(
            {formatCurrency(summary.total_cancel_count || 0)})
          </div>
        </div>
        {/* 합계 */}
        <div className="bg-gradient-to-br from-green-400 to-teal-400 rounded-lg shadow-sm p-3 text-white text-center">
          <div className="text-xs opacity-75 mb-1">합계</div>
          <div className="text-lg font-bold">
            {formatCurrency(netAmount)}({formatCurrency(netCount)})
          </div>
        </div>
      </div>
    )
  }

  const renderCalendar = () => {
    if (!resultData || resultData.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-3 opacity-30">📅</div>
          <div>조회된 데이터가 없습니다.</div>
        </div>
      )
    }

    const today = new Date()
    const isCurrentMonth = today.getFullYear() === filters.year && today.getMonth() + 1 === filters.month
    const todayDate = today.getDate()

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border text-center" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="bg-muted">
              <th className="border border-border py-2" style={{ width: '14.28%' }}>일</th>
              <th className="border border-border py-2" style={{ width: '14.28%' }}>월</th>
              <th className="border border-border py-2" style={{ width: '14.28%' }}>화</th>
              <th className="border border-border py-2" style={{ width: '14.28%' }}>수</th>
              <th className="border border-border py-2" style={{ width: '14.28%' }}>목</th>
              <th className="border border-border py-2" style={{ width: '14.28%' }}>금</th>
              <th className="border border-border py-2" style={{ width: '14.28%' }}>토</th>
            </tr>
          </thead>
          <tbody>
            {calendarWeeks.map((week, weekIdx) => (
              <tr key={weekIdx}>
                {week.days.map((day, dayIdx) => {
                  if (!day.date || !day.isCurrentMonth) {
                    return (
                      <td key={dayIdx} className="border border-border bg-muted/30" style={{ height: '120px' }} />
                    )
                  }

                  const isToday = isCurrentMonth && day.date === todayDate
                  const dayColor = dayIdx === 0 ? 'text-red-600' : dayIdx === 6 ? 'text-blue-600' : 'text-foreground'
                  const borderClass = isToday ? 'border-3 border-yellow-500' : ''

                  const hasData = day.approval_count > 0 || day.cancel_count > 0
                  const netAmount = day.approval_amount - day.cancel_amount
                  const netCount = day.approval_count - day.cancel_count

                  return (
                    <td
                      key={dayIdx}
                      className={`border border-border p-2 align-top ${borderClass}`}
                      style={{ height: '120px' }}
                    >
                      <div className={`${dayColor} font-bold mb-2`}>{day.date}</div>
                      {hasData && (
                        <div className="text-xs text-right">
                          {day.approval_count > 0 && (
                            <div className="text-blue-600">
                              승인 {formatCurrency(day.approval_amount)} ({formatCurrency(day.approval_count)})
                            </div>
                          )}
                          {day.cancel_count > 0 && (
                            <div className="text-red-600">
                              해지 {formatCurrency(day.cancel_amount)} ({formatCurrency(day.cancel_count)})
                            </div>
                          )}
                          <div className="font-bold mt-1 border-t border-border pt-1">
                            계 {formatCurrency(netAmount)} ({formatCurrency(netCount)})
                          </div>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // 월별 실적 데이터 처리
  const processMonthlyData = useMemo(() => {
    if (!resultData || resultData.length === 0 || reportMode !== 'monthly') {
      return { monthlyRows: [], totalThisYear: null, totalLastYear: null, currentYear: filters.year, lastYear: filters.year - 1 }
    }

    const currentYear = filters.year
    const lastYear = currentYear - 1

    // 올해/작년 데이터 분리
    const thisYearData = resultData.filter((item: any) => parseInt(item.year) === currentYear)
    const lastYearData = resultData.filter((item: any) => parseInt(item.year) === lastYear)

    // 월별 맵 생성
    const thisYearMap: Record<number, any> = {}
    const lastYearMap: Record<number, any> = {}

    thisYearData.forEach((item: any) => {
      const month = parseInt(item.month)
      thisYearMap[month] = item
    })

    lastYearData.forEach((item: any) => {
      const month = parseInt(item.month)
      lastYearMap[month] = item
    })

    // 12개월 데이터 및 합계
    const monthlyRows: Array<{
      month: number
      thisYear: {
        approval_count: number
        approval_amount: number
        cancel_count: number
        cancel_amount: number
        net_count: number
        net_amount: number
      }
      lastYear: {
        approval_count: number
        approval_amount: number
        cancel_count: number
        cancel_amount: number
        net_count: number
        net_amount: number
      }
    }> = []

    const totalThisYear = { approval_count: 0, approval_amount: 0, cancel_count: 0, cancel_amount: 0 }
    const totalLastYear = { approval_count: 0, approval_amount: 0, cancel_count: 0, cancel_amount: 0 }

    for (let month = 1; month <= 12; month++) {
      const thisMonth = thisYearMap[month] || {}
      const lastMonth = lastYearMap[month] || {}

      const thisYearApprovalCount = parseInt(thisMonth.approval_count) || 0
      const thisYearApprovalAmount = parseInt(thisMonth.approval_amount) || 0
      const thisYearCancelCount = parseInt(thisMonth.cancel_count) || 0
      const thisYearCancelAmount = parseInt(thisMonth.cancel_amount) || 0

      const lastYearApprovalCount = parseInt(lastMonth.approval_count) || 0
      const lastYearApprovalAmount = parseInt(lastMonth.approval_amount) || 0
      const lastYearCancelCount = parseInt(lastMonth.cancel_count) || 0
      const lastYearCancelAmount = parseInt(lastMonth.cancel_amount) || 0

      monthlyRows.push({
        month: month,
        thisYear: {
          approval_count: thisYearApprovalCount,
          approval_amount: thisYearApprovalAmount,
          cancel_count: thisYearCancelCount,
          cancel_amount: thisYearCancelAmount,
          net_count: thisYearApprovalCount - thisYearCancelCount,
          net_amount: thisYearApprovalAmount - thisYearCancelAmount,
        },
        lastYear: {
          approval_count: lastYearApprovalCount,
          approval_amount: lastYearApprovalAmount,
          cancel_count: lastYearCancelCount,
          cancel_amount: lastYearCancelAmount,
          net_count: lastYearApprovalCount - lastYearCancelCount,
          net_amount: lastYearApprovalAmount - lastYearCancelAmount,
        },
      })

      totalThisYear.approval_count += thisYearApprovalCount
      totalThisYear.approval_amount += thisYearApprovalAmount
      totalThisYear.cancel_count += thisYearCancelCount
      totalThisYear.cancel_amount += thisYearCancelAmount

      totalLastYear.approval_count += lastYearApprovalCount
      totalLastYear.approval_amount += lastYearApprovalAmount
      totalLastYear.cancel_count += lastYearCancelCount
      totalLastYear.cancel_amount += lastYearCancelAmount
    }

    return { monthlyRows, totalThisYear, totalLastYear, currentYear, lastYear }
  }, [resultData, reportMode, filters.year])

  const renderMonthlyStats = () => {
    const { totalThisYear, totalLastYear, currentYear, lastYear } = processMonthlyData

    if (!totalThisYear || !totalLastYear) return null

    const thisYearNetAmount = totalThisYear.approval_amount - totalThisYear.cancel_amount
    const thisYearNetCount = totalThisYear.approval_count - totalThisYear.cancel_count
    const lastYearNetAmount = totalLastYear.approval_amount - totalLastYear.cancel_amount
    const lastYearNetCount = totalLastYear.approval_count - totalLastYear.cancel_count

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* 올해 통계 */}
        <div className="relative">
          <div className="absolute top-0 right-0 text-muted-foreground font-bold text-xs z-10 -mt-4">
            {currentYear}년
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-sm p-2 text-white">
            <div className="flex justify-around items-center text-xs">
              <span className="whitespace-nowrap">
                승인 {formatCurrency(totalThisYear.approval_amount)}({totalThisYear.approval_count})
              </span>
              <span className="whitespace-nowrap">
                해지 {formatCurrency(totalThisYear.cancel_amount)}({totalThisYear.cancel_count})
              </span>
              <span className="whitespace-nowrap">
                합계 {formatCurrency(thisYearNetAmount)}({thisYearNetCount})
              </span>
            </div>
          </div>
        </div>

        {/* 작년 통계 */}
        <div className="relative">
          <div className="absolute top-0 right-0 text-muted-foreground font-bold text-xs z-10 -mt-4">
            {lastYear}년
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg shadow-sm p-2 text-white">
            <div className="flex justify-around items-center text-xs">
              <span className="whitespace-nowrap">
                승인 {formatCurrency(totalLastYear.approval_amount)}({totalLastYear.approval_count})
              </span>
              <span className="whitespace-nowrap">
                해지 {formatCurrency(totalLastYear.cancel_amount)}({totalLastYear.cancel_count})
              </span>
              <span className="whitespace-nowrap">
                합계 {formatCurrency(lastYearNetAmount)}({lastYearNetCount})
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMonthlyTable = () => {
    const { monthlyRows, totalThisYear, totalLastYear, currentYear, lastYear } = processMonthlyData

    if (!monthlyRows || monthlyRows.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-3 opacity-30">📊</div>
          <div>조회된 데이터가 없습니다.</div>
        </div>
      )
    }

    if (!totalThisYear || !totalLastYear) return null

    const thisYearNetAmount = totalThisYear.approval_amount - totalThisYear.cancel_amount
    const thisYearNetCount = totalThisYear.approval_count - totalThisYear.cancel_count
    const lastYearNetAmount = totalLastYear.approval_amount - totalLastYear.cancel_amount
    const lastYearNetCount = totalLastYear.approval_count - totalLastYear.cancel_count

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border text-center align-middle text-xs" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-muted">
            <tr>
              <th className="border border-border py-2 text-xs font-medium" rowSpan={2} style={{ width: '14.28%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                월
              </th>
              <th className="border border-border py-2 text-xs font-medium" colSpan={3} style={{ width: '42.86%' }}>
                {currentYear}년
              </th>
              <th className="border border-border py-2 text-xs font-medium" colSpan={3} style={{ width: '42.86%' }}>
                {lastYear}년
              </th>
            </tr>
            <tr>
              <th className="border border-border py-2 text-xs font-medium" style={{ width: '14.28%' }}>승인</th>
              <th className="border border-border py-2 text-xs font-medium" style={{ width: '14.28%' }}>해지</th>
              <th className="border border-border py-2 text-xs font-medium" style={{ width: '14.28%' }}>계</th>
              <th className="border border-border py-2 text-xs font-medium" style={{ width: '14.28%' }}>승인</th>
              <th className="border border-border py-2 text-xs font-medium" style={{ width: '14.28%' }}>해지</th>
              <th className="border border-border py-2 text-xs font-medium" style={{ width: '14.28%' }}>계</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {monthlyRows.map((row) => (
              <tr key={row.month} className="hover:bg-accent/50 transition-colors">
                <th className="border border-border py-2 bg-muted/50 text-xs" style={{ width: '14.28%' }}>{row.month}월</th>
                <td className="border border-border py-2 px-3 text-end text-blue-600 text-xs" style={{ width: '14.28%' }}>
                  {row.thisYear.approval_amount > 0
                    ? `${formatCurrency(row.thisYear.approval_amount)} (${row.thisYear.approval_count})`
                    : ''}
                </td>
                <td className="border border-border py-2 px-3 text-end text-red-600 text-xs" style={{ width: '14.28%' }}>
                  {row.thisYear.cancel_amount > 0
                    ? `${formatCurrency(row.thisYear.cancel_amount)} (${row.thisYear.cancel_count})`
                    : ''}
                </td>
                <td className="border border-border py-2 px-3 text-end font-bold text-xs" style={{ width: '14.28%' }}>
                  {row.thisYear.net_amount !== 0
                    ? `${formatCurrency(row.thisYear.net_amount)} (${row.thisYear.net_count})`
                    : ''}
                </td>
                <td className="border border-border py-2 px-3 text-end text-blue-600 text-xs" style={{ width: '14.28%' }}>
                  {row.lastYear.approval_amount > 0
                    ? `${formatCurrency(row.lastYear.approval_amount)} (${row.lastYear.approval_count})`
                    : ''}
                </td>
                <td className="border border-border py-2 px-3 text-end text-red-600 text-xs" style={{ width: '14.28%' }}>
                  {row.lastYear.cancel_amount > 0
                    ? `${formatCurrency(row.lastYear.cancel_amount)} (${row.lastYear.cancel_count})`
                    : ''}
                </td>
                <td className="border border-border py-2 px-3 text-end font-bold text-xs" style={{ width: '14.28%' }}>
                  {row.lastYear.net_amount !== 0
                    ? `${formatCurrency(row.lastYear.net_amount)} (${row.lastYear.net_count})`
                    : ''}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted">
            <tr className="font-bold text-xs">
              <th className="border border-border py-2 text-xs" style={{ width: '14.28%' }}>총합계</th>
              <td className="border border-border py-2 px-3 text-end text-blue-600 text-xs" style={{ width: '14.28%' }}>
                {formatCurrency(totalThisYear.approval_amount)} ({totalThisYear.approval_count})
              </td>
              <td className="border border-border py-2 px-3 text-end text-red-600 text-xs" style={{ width: '14.28%' }}>
                {formatCurrency(totalThisYear.cancel_amount)} ({totalThisYear.cancel_count})
              </td>
              <td className="border border-border py-2 px-3 text-end font-bold text-xs" style={{ width: '14.28%' }}>
                {formatCurrency(thisYearNetAmount)} ({thisYearNetCount})
              </td>
              <td className="border border-border py-2 px-3 text-end text-blue-600 text-xs" style={{ width: '14.28%' }}>
                {formatCurrency(totalLastYear.approval_amount)} ({totalLastYear.approval_count})
              </td>
              <td className="border border-border py-2 px-3 text-end text-red-600 text-xs" style={{ width: '14.28%' }}>
                {formatCurrency(totalLastYear.cancel_amount)} ({totalLastYear.cancel_count})
              </td>
              <td className="border border-border py-2 px-3 text-end font-bold text-xs" style={{ width: '14.28%' }}>
                {formatCurrency(lastYearNetAmount)} ({lastYearNetCount})
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-success">📊</span>
            일별 실적 {reportMode === 'monthly' ? '(월별)' : '(달력)'}
          </div>
          <div className="flex items-center gap-4 ml-4">
            <span className="text-xs font-medium text-white/90">기준:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="criteria"
                value="approval"
                checked={filters.criteria === 'approval'}
                onChange={(e) => setFilters((prev) => ({ ...prev, criteria: e.target.value as 'approval' | 'certificate' }))}
                className="w-4 h-4 text-white"
              />
              <span className="text-xs text-white">승인 기준</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="criteria"
                value="certificate"
                checked={filters.criteria === 'certificate'}
                onChange={(e) => setFilters((prev) => ({ ...prev, criteria: e.target.value as 'approval' | 'certificate' }))}
                className="w-4 h-4 text-white"
              />
              <span className="text-xs text-white">증권발급 기준</span>
            </label>
          </div>
        </div>
      }
      maxWidth="6xl"
      maxHeight="90vh"
      footer={
        <div className="flex justify-between items-center w-full">
          <button
            onClick={() => {
              setReportMode(reportMode === 'daily' ? 'monthly' : 'daily')
              setResultData([])
              setSummary(null)
            }}
            className="px-3 py-1.5 bg-info text-info-foreground rounded-lg text-xs font-medium hover:bg-info/90 transition-colors flex items-center gap-1.5"
          >
            {reportMode === 'daily' ? '📊 월별 실적' : '📅 일별 실적'}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-secondary/90 transition-colors"
          >
            닫기
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 필터 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* 거래처 선택 */}
          <div>
            <Select
              value={filters.account}
              onChange={(e) => setFilters((prev) => ({ ...prev, account: e.target.value }))}
              options={[
                { value: '', label: '전체 거래처' },
                ...accounts.map((acc) => ({ value: acc.num, label: acc.directory })),
              ]}
            />
          </div>

          {/* 년도 선택 */}
          <div>
            <Select
              value={String(filters.year)}
              onChange={(e) => setFilters((prev) => ({ ...prev, year: parseInt(e.target.value) }))}
              options={yearOptions}
            />
          </div>

          {/* 월 선택 (일별 모드일 때만) */}
          {reportMode === 'daily' && (
            <div>
              <Select
                value={String(filters.month)}
                onChange={(e) => setFilters((prev) => ({ ...prev, month: parseInt(e.target.value) }))}
                options={monthOptions}
              />
            </div>
          )}

          {/* 조회 버튼 */}
          <div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : '🔍'} 조회
            </button>
          </div>
        </div>

        {/* 로딩 중 */}
        {loading && (
          <div className="text-center py-8">
            <LoadingSpinner size="md" text="실적을 조회하는 중..." />
          </div>
        )}

        {/* 결과 영역 */}
        {!loading && resultData.length > 0 && (
          <>
            {reportMode === 'daily' ? (
              <>
                {renderStatsCards()}
                {renderCalendar()}
              </>
            ) : (
              <>
                {renderMonthlyStats()}
                {renderMonthlyTable()}
              </>
            )}
          </>
        )}

        {/* 초기 상태 */}
        {!loading && resultData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-3 opacity-30">📊</div>
            <div>조회 버튼을 클릭하여 실적을 확인하세요.</div>
          </div>
        )}
      </div>
    </Modal>
  )
}
