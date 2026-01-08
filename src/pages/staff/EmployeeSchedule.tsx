import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { dayNamesShort, formatYmd } from '../../lib/date'
import { useAuthStore } from '../../store/authStore'
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { Modal, Select, FormInput, DatePicker, LoadingSpinner, useToastHelpers } from '../../components'

type WorkScheduleStatus = {
  has_work_days: boolean
  work_days: null | {
    base_off_day: number
    cycle_start_date: string
    initial_selection_date?: string
  }
  is_probation: boolean
  hire_date: string
}

type DailyScheduleItem = {
  date: string
  day_of_week: number // 0..6
  off_day: number // 1..5
  is_off_day: boolean
  is_holiday: boolean
  has_half_day: boolean
  half_day_type: null | 'HALF_AM' | 'HALF_PM'
}

type HolidayItem = { date: string; name: string }

type ScheduleResponse = {
  year: number
  month: number
  current_cycle: {
    cycle_number: number
    off_day: number
    off_day_name: string
    week_range: string
    cycle_start_date: string
    next_cycle_date: string
    next_off_day: number
    next_off_day_name: string
  }
  schedule: {
    work_days: Record<string, 'off' | 'full'>
    total_hours: number
    work_days_count: number
  }
  daily_schedule: DailyScheduleItem[]
  holidays: HolidayItem[]
  is_probation: boolean
  has_holiday_in_week: boolean
}

type HalfDayListItem = {
  id: number
  date: string
  leave_type: 'HALF_AM' | 'HALF_PM'
  leave_type_name: string
  compensation_date: string | null
  reason: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
}

type NextOffDay = {
  date: string
  dayName: string
  weekNumber: number
}

type ChangeRequestItem = {
  id: number
  week_start_date: string
  original_off_day: number
  temporary_off_day: number
  reason: string | null
  substitute_employee: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requested_at: string
}

function dayNameFromOffDay(offDay: number) {
  // offDay: 1=월 ... 5=금
  const map: Record<number, string> = {
    1: '월',
    2: '화',
    3: '수',
    4: '목',
    5: '금',
  }
  return map[offDay] || '-'
}

function statusBadge(status: HalfDayListItem['status']) {
  const map: Record<HalfDayListItem['status'], { label: string; className: string }> = {
    PENDING: { label: '대기', className: 'bg-yellow-100 text-yellow-800' },
    APPROVED: { label: '승인', className: 'bg-green-100 text-green-800' },
    REJECTED: { label: '거부', className: 'bg-red-100 text-red-800' },
  }
  return map[status]
}

export default function EmployeeSchedule() {
  const { user } = useAuthStore()
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<WorkScheduleStatus | null>(null)

  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState<number>(today.getFullYear())
  const [month, setMonth] = useState<number>(today.getMonth() + 1)

  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null)
  const [halfDays, setHalfDays] = useState<HalfDayListItem[]>([])
  const [changeRequests, setChangeRequests] = useState<ChangeRequestItem[]>([])

  // 기본 휴무일 설정 모달
  const [setWorkDaysOpen, setSetWorkDaysOpen] = useState(false)
  const [baseOffDay, setBaseOffDay] = useState<number>(3)
  const [setWorkDaysError, setSetWorkDaysError] = useState<string | null>(null)

  // 반차 신청 모달
  const [halfDayOpen, setHalfDayOpen] = useState(false)
  const [halfDayDate, setHalfDayDate] = useState('')
  const [halfDayType, setHalfDayType] = useState<'' | 'HALF_AM' | 'HALF_PM'>('')
  const [halfDayReason, setHalfDayReason] = useState('')
  const [nextOffDays, setNextOffDays] = useState<NextOffDay[]>([])
  const [compensationDate, setCompensationDate] = useState('')
  const [halfDayError, setHalfDayError] = useState<string | null>(null)

  // 휴무일 변경 신청 모달
  const [tempChangeOpen, setTempChangeOpen] = useState(false)
  const [tempWeekStart, setTempWeekStart] = useState('')
  const [tempOffDay, setTempOffDay] = useState<number>(3)
  const [tempReason, setTempReason] = useState('')
  const [tempSubstituteEmployee, setTempSubstituteEmployee] = useState('')
  const [tempChangeError, setTempChangeError] = useState<string | null>(null)

  const canUseHalfDay = !schedule?.is_probation

  const calendar = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate()
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

    const scheduleMap = new Map((schedule?.daily_schedule || []).map((d) => [d.date, d]))
    const holidaysMap = new Map((schedule?.holidays || []).map((h) => [h.date, h.name]))

    return { daysInMonth, firstDayOfWeek, scheduleMap, holidaysMap }
  }, [schedule, year, month])

  const monthLabel = `${year}년 ${month}월`

  const monthStats = useMemo(() => {
    const list = schedule?.daily_schedule || []
    if (list.length === 0) {
      return { workDays: 0, offDays: 0, totalHours: 0 }
    }
    let totalHours = 0
    let offDays = 0
    let workDays = 0

    for (const d of list) {
      const isOff = d.is_off_day || d.is_holiday
      if (isOff) {
        offDays += 1
        continue
      }

      // 반차는 4시간 근무로 표시(정책상 다를 수 있으니 필요하면 조정)
      const hours = d.has_half_day ? 4 : 8
      totalHours += hours
      if (hours > 0) workDays += 1
    }
    return { workDays, offDays, totalHours }
  }, [schedule])

  const loadStatusAndSchedule = async () => {
    setLoading(true)
    try {
      const statusRes = await api.get('/api/staff/work-schedules/my-status')
      if (!statusRes.data?.success) {
        throw new Error(statusRes.data?.message || '상태 조회에 실패했습니다.')
      }

      const nextStatus: WorkScheduleStatus = statusRes.data.data
      setStatus(nextStatus)

      if (!nextStatus.has_work_days) {
        setSetWorkDaysOpen(true)
        setSchedule(null)
        setLoading(false)
        return
      }

      const scheduleRes = await api.get(`/api/staff/work-schedules/my-schedule/${year}/${month}`)
      if (!scheduleRes.data?.success) {
        if (scheduleRes.data?.code === 'WORK_DAYS_NOT_SET') {
          setSetWorkDaysOpen(true)
          setSchedule(null)
          setLoading(false)
          return
        }
        throw new Error(scheduleRes.data?.message || '스케줄 조회에 실패했습니다.')
      }
      setSchedule(scheduleRes.data.data as ScheduleResponse)
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || '스케줄을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadHalfDayList = async () => {
    try {
      const res = await api.get('/api/staff/work-schedules/my-half-days', {
        params: { year, month },
      })
      if (res.data?.success) {
        setHalfDays(res.data.data || [])
      }
    } catch (e) {
      console.error('반차 목록 로드 오류:', e)
    }
  }

  const loadChangeRequests = async () => {
    try {
      const res = await api.get('/api/staff/work-schedules/my-change-requests', {
        params: { year, month },
      })
      if (res.data?.success) {
        setChangeRequests(res.data.data || [])
      }
    } catch (e) {
      console.error('변경 신청 목록 로드 오류:', e)
    }
  }

  useEffect(() => {
    loadStatusAndSchedule()
    loadHalfDayList()
    loadChangeRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month])

  const changeMonth = (delta: number) => {
    let nextMonth = month + delta
    let nextYear = year
    if (nextMonth < 1) {
      nextMonth = 12
      nextYear -= 1
    } else if (nextMonth > 12) {
      nextMonth = 1
      nextYear += 1
    }
    setYear(nextYear)
    setMonth(nextMonth)
  }

  const goToday = () => {
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
  }

  const submitSetWorkDays = async () => {
    try {
      setSetWorkDaysError(null)
      const res = await api.post('/api/staff/work-schedules/set-work-days', {
        base_off_day: baseOffDay,
      })
      if (!res.data?.success) throw new Error(res.data?.message || '설정에 실패했습니다.')
      setSetWorkDaysOpen(false)
      await loadStatusAndSchedule()
    } catch (e: any) {
      setSetWorkDaysError(e?.message || '설정 중 오류가 발생했습니다.')
    }
  }

  const openHalfDay = () => {
    if (!canUseHalfDay) {
      toast.warning('수습 기간 중에는 반차를 사용할 수 없습니다.')
      return
    }
    setHalfDayError(null)
    setHalfDayDate('')
    setHalfDayType('')
    setHalfDayReason('')
    setCompensationDate('')
    setNextOffDays([])
    setHalfDayOpen(true)
  }

  const loadNextOffDays = async (date: string) => {
    if (!date) {
      setNextOffDays([])
      setCompensationDate('')
      return
    }
    try {
      const res = await api.get('/api/staff/work-schedules/next-off-days', {
        params: { date, weeks: 4 },
      })
      if (res.data?.success) {
        setNextOffDays(res.data.data || [])
      }
    } catch (e) {
      console.error('다음 휴무일 로드 오류:', e)
      setNextOffDays([])
      setCompensationDate('')
    }
  }

  const submitHalfDay = async () => {
    try {
      setHalfDayError(null)
      if (!halfDayDate || !halfDayType || !halfDayReason.trim()) {
        setHalfDayError('모든 필드를 입력해주세요.')
        return
      }

      const body: any = {
        date: halfDayDate,
        leave_type: halfDayType,
        reason: halfDayReason.trim(),
      }
      if (compensationDate) body.compensation_date = compensationDate

      const res = await api.post('/api/staff/work-schedules/apply-half-day', body)
      if (!res.data?.success) throw new Error(res.data?.message || '반차 신청에 실패했습니다.')

      setHalfDayOpen(false)
      await loadStatusAndSchedule()
      await loadHalfDayList()
    } catch (e: any) {
      setHalfDayError(e?.message || '반차 신청 중 오류가 발생했습니다.')
    }
  }

  const openTempChange = () => {
    setTempChangeError(null)
    setTempWeekStart('')
    setTempOffDay(3)
    setTempReason('')
    setTempSubstituteEmployee('')
    setTempChangeOpen(true)
  }

  const submitTempChange = async () => {
    try {
      setTempChangeError(null)
      if (!tempWeekStart || !tempReason.trim()) {
        setTempChangeError('필수 항목(주 시작일, 사유)을 입력해주세요.')
        return
      }
      const body: any = {
        week_start_date: tempWeekStart,
        temporary_off_day: tempOffDay,
        reason: tempReason.trim(),
      }
      if (tempSubstituteEmployee.trim()) body.substitute_employee = tempSubstituteEmployee.trim()

      const res = await api.post('/api/staff/work-schedules/temporary-change', body)
      if (!res.data?.success) throw new Error(res.data?.message || '휴무일 변경 신청에 실패했습니다.')

      setTempChangeOpen(false)
      await loadStatusAndSchedule()
      await loadChangeRequests()
    } catch (e: any) {
      setTempChangeError(e?.message || '휴무일 변경 신청 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      {/* 상단 컨트롤 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4" />
            <span className="font-medium text-foreground">{monthLabel}</span>
            {user?.name ? <span className="text-muted-foreground">· {user.name}</span> : null}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => changeMonth(-1)}
              className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>
            <button
              onClick={goToday}
              className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm"
            >
              오늘
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm inline-flex items-center gap-1"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1 hidden md:block" />

            <button
              onClick={openHalfDay}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm"
            >
              반차 신청
            </button>
            <button
              onClick={openTempChange}
              className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm"
            >
              휴무일 변경 신청
            </button>
            <button
              onClick={async () => {
                await loadStatusAndSchedule()
                await loadHalfDayList()
                await loadChangeRequests()
              }}
              className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm inline-flex items-center gap-2"
              title="새로고침"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
          </div>
        </div>
      </div>

      {/* 알림 */}
      {schedule?.is_probation ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <div className="font-semibold">수습 기간 중입니다.</div>
          <div className="text-blue-700 mt-1">주 4일 근무제/반차 정책이 제한될 수 있습니다.</div>
        </div>
      ) : null}
      {schedule?.has_holiday_in_week ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          <div className="font-semibold">공휴일 포함 주가 있습니다.</div>
          <div className="text-yellow-700 mt-1">해당 주는 공휴일로 주 4일 근무가 자동 달성되어 별도 휴무일이 적용되지 않을 수 있습니다.</div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측 정보 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="text-sm font-semibold mb-4">근무 패턴</div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">기본 휴무일</div>
                <div className="font-medium">
                  {status?.work_days?.base_off_day ? `${dayNameFromOffDay(status.work_days.base_off_day)}요일` : '-'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">사이클</div>
                <div className="font-medium">
                  {schedule?.current_cycle ? `${schedule.current_cycle.cycle_number}주차` : '-'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">이번 주 휴무일</div>
                <div className="font-medium">{schedule?.current_cycle?.off_day_name || '-'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">다음 사이클</div>
                <div className="font-medium">
                  {schedule?.current_cycle?.next_cycle_date
                    ? `${schedule.current_cycle.next_cycle_date} (${schedule.current_cycle.next_off_day_name})`
                    : '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="text-sm font-semibold mb-4">이번 달 통계</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border p-3 text-center">
                <div className="text-xs text-muted-foreground">근무일</div>
                <div className="text-lg font-semibold">{monthStats.workDays}</div>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <div className="text-xs text-muted-foreground">휴무일</div>
                <div className="text-lg font-semibold">{monthStats.offDays}</div>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <div className="text-xs text-muted-foreground">총 시간</div>
                <div className="text-lg font-semibold">{monthStats.totalHours}</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">반차 신청 내역</div>
              <button
                onClick={loadHalfDayList}
                className="px-2 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm inline-flex items-center"
                title="새로고침"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto divide-y divide-border">
              {halfDays.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center">반차 신청 내역이 없습니다.</div>
              ) : (
                halfDays.map((h) => {
                  const badge = statusBadge(h.status)
                  const d = new Date(h.date)
                  const dow = dayNamesShort[d.getDay()] || ''
                  return (
                    <div key={h.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{h.date} ({dow})</div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {h.leave_type_name} · {h.reason || '(사유 없음)'}
                        </div>
                      </div>
                      <span className={`shrink-0 px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">휴무일 변경 신청 내역</div>
              <button
                onClick={loadChangeRequests}
                className="px-2 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm inline-flex items-center"
                title="새로고침"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto divide-y divide-border">
              {changeRequests.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center">변경 신청 내역이 없습니다.</div>
              ) : (
                changeRequests.map((c) => {
                  const badgeMap: Record<ChangeRequestItem['status'], { label: string; className: string }> = {
                    PENDING: { label: '대기', className: 'bg-yellow-100 text-yellow-800' },
                    APPROVED: { label: '승인', className: 'bg-green-100 text-green-800' },
                    REJECTED: { label: '거부', className: 'bg-red-100 text-red-800' },
                  }
                  const badge = badgeMap[c.status]
                  return (
                    <div key={c.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">
                          {c.week_start_date} 주 · {dayNameFromOffDay(c.original_off_day)} → {dayNameFromOffDay(c.temporary_off_day)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {c.reason || '(사유 없음)'} {c.substitute_employee ? `· 대체자: ${c.substitute_employee}` : ''}
                        </div>
                      </div>
                      <span className={`shrink-0 px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* 우측 캘린더 */}
        <div className="lg:col-span-8">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2">
              {dayNamesShort.map((d) => (
                <div key={d} className="py-2 text-center font-medium">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: calendar.firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 rounded-lg border border-transparent" />
              ))}

              {Array.from({ length: calendar.daysInMonth }).map((_, idx) => {
                const day = idx + 1
                const dateStr = formatYmd(year, month, day)
                const item = calendar.scheduleMap.get(dateStr)
                const holidayName = calendar.holidaysMap.get(dateStr)

                const isToday = (() => {
                  const d = new Date()
                  return d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === day
                })()

                const isWeekend = (() => {
                  const d = new Date(year, month - 1, day)
                  const dow = d.getDay()
                  return dow === 0 || dow === 6
                })()

                let statusText: string | null = null
                let statusClass = 'bg-muted text-muted-foreground'

                if (item?.is_holiday) {
                  statusText = '공휴일'
                  statusClass = 'bg-red-100 text-red-800'
                } else if (item?.has_half_day) {
                  statusText = item.half_day_type === 'HALF_AM' ? '오전반차' : '오후반차'
                  statusClass = 'bg-blue-100 text-blue-800'
                } else if (item?.is_off_day) {
                  statusText = '휴무일'
                  statusClass = 'bg-gray-100 text-gray-800'
                }

                return (
                  <div
                    key={dateStr}
                    className={[
                      'h-24 rounded-lg border border-border p-2 flex flex-col justify-between',
                      isToday ? 'ring-2 ring-ring' : '',
                      isWeekend && !item ? 'opacity-60' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-sm font-semibold">{day}</div>
                    </div>

                    <div className="space-y-1">
                      {statusText ? (
                        <div className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${statusClass}`}>
                          {statusText}
                        </div>
                      ) : (
                        <div className="h-6" />
                      )}
                      {holidayName ? (
                        <div className="text-[11px] text-muted-foreground truncate">{holidayName}</div>
                      ) : (
                        <div className="h-4" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 기본 휴무일 설정 모달 */}
      {setWorkDaysOpen ? (
        <Modal
          isOpen={setWorkDaysOpen}
          onClose={() => setSetWorkDaysOpen(false)}
          title="기본 휴무일 설정"
          maxWidth="md"
          footer={
            <div className="flex gap-2 justify-end">
              <button
                onClick={submitSetWorkDays}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-xs font-medium"
              >
                설정하기
              </button>
            </div>
          }
        >
          <div className="text-xs text-muted-foreground mb-4">
            주 4일 근무제를 사용하려면 먼저 기본 휴무일(월~금)을 1개 선택해야 합니다.
          </div>

          <div className="mt-4">
            <Select
              value={String(baseOffDay)}
              onChange={(e) => setBaseOffDay(parseInt(e.target.value, 10))}
              options={[
                { value: '1', label: '월요일' },
                { value: '2', label: '화요일' },
                { value: '3', label: '수요일' },
                { value: '4', label: '목요일' },
                { value: '5', label: '금요일' },
              ]}
              variant="modal"
              className="w-full"
            />
          </div>

          {setWorkDaysError ? <div className="mt-3 text-xs text-destructive">{setWorkDaysError}</div> : null}
        </Modal>
      ) : null}

      {/* 반차 신청 모달 */}
      {halfDayOpen ? (
        <Modal
          isOpen={halfDayOpen}
          onClose={() => setHalfDayOpen(false)}
          title="반차 신청"
          maxWidth="lg"
          footer={
            <div className="flex gap-2 justify-end">
              <button
                onClick={submitHalfDay}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-xs font-medium"
              >
                신청
              </button>
            </div>
          }
        >
          <div className="text-xs text-muted-foreground mb-4">반차(오전/오후)를 신청합니다.</div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <DatePicker
                value={halfDayDate}
                onChange={(value) => {
                  setHalfDayDate(value)
                  loadNextOffDays(value)
                }}
                placeholder="날짜 선택"
                variant="modal"
                className="w-full"
              />
            </div>
            <div>
              <Select
                value={halfDayType}
                onChange={(e) => setHalfDayType(e.target.value as any)}
                options={[
                  { value: '', label: '반차 타입 선택' },
                  { value: 'HALF_AM', label: '오전 반차' },
                  { value: 'HALF_PM', label: '오후 반차' },
                ]}
                variant="modal"
                className="w-full"
              />
            </div>
            <div>
              <textarea
                value={halfDayReason}
                onChange={(e) => setHalfDayReason(e.target.value)}
                placeholder="사유"
                rows={3}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {nextOffDays.length > 0 ? (
              <div>
                <Select
                  value={compensationDate}
                  onChange={(e) => setCompensationDate(e.target.value)}
                  options={[
                    { value: '', label: '보충 일정 선택 (선택사항)' },
                    ...nextOffDays.map((o) => ({
                      value: o.date,
                      label: `${o.date} (${o.dayName}) - ${o.weekNumber}주 후`,
                    })),
                  ]}
                  variant="modal"
                  className="w-full"
                />
              </div>
            ) : null}

            {halfDayError ? <div className="text-xs text-destructive">{halfDayError}</div> : null}
          </div>
        </Modal>
      ) : null}

      {/* 휴무일 변경 신청 모달 */}
      {tempChangeOpen ? (
        <Modal
          isOpen={tempChangeOpen}
          onClose={() => setTempChangeOpen(false)}
          title="휴무일 변경 신청"
          maxWidth="lg"
          footer={
            <div className="flex gap-2 justify-end">
              <button
                onClick={submitTempChange}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-xs font-medium"
              >
                신청
              </button>
            </div>
          }
        >
          <div className="text-xs text-muted-foreground mb-4">
            변경할 주의 <strong>주 시작일(월요일)</strong>과 변경할 휴무일을 선택하세요.
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <DatePicker
                value={tempWeekStart}
                onChange={(value) => setTempWeekStart(value)}
                placeholder="주 시작일 (월요일) 선택"
                variant="modal"
                className="w-full"
              />
            </div>
            <div>
              <Select
                value={String(tempOffDay)}
                onChange={(e) => setTempOffDay(parseInt(e.target.value, 10))}
                options={[
                  { value: '1', label: '월요일' },
                  { value: '2', label: '화요일' },
                  { value: '3', label: '수요일' },
                  { value: '4', label: '목요일' },
                  { value: '5', label: '금요일' },
                ]}
                variant="modal"
                className="w-full"
              />
            </div>
            <div>
              <FormInput
                type="email"
                value={tempSubstituteEmployee}
                onChange={(e) => setTempSubstituteEmployee(e.target.value)}
                placeholder="대체 근무자 이메일 (선택사항)"
                variant="modal"
                className="w-full"
              />
            </div>
            <div>
              <textarea
                value={tempReason}
                onChange={(e) => setTempReason(e.target.value)}
                placeholder="사유"
                rows={3}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {tempChangeError ? <div className="text-xs text-destructive">{tempChangeError}</div> : null}
          </div>
        </Modal>
      ) : null}

      {/* 로딩 오버레이 */}
      {loading && <LoadingSpinner fullScreen text="불러오는 중..." />}
    </div>
  )
}

