import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import {
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  Bell,
  FileText,
  BarChart3,
  Timer,
  Target,
} from 'lucide-react'

interface TodayAttendance {
  check_in_time?: string
  check_out_time?: string
  work_hours?: number
  formatted_check_in?: string
  formatted_check_out?: string
}

interface PersonalStats {
  monthlyStats: number
  avgProcessingTime: number
  weeklyHours: number
  achievementRate: number
}

interface AdminStats {
  totalEmployees: number
  todayAttendance: number
  pendingApprovals: number
}

interface Activity {
  title: string
  description: string
  type: string
  status: string
  date: string
  processing_time?: number
}

interface Announcement {
  title: string
  content: string
  type: string
  priority: string
  date_label: string
  time_ago: string
}

interface DashboardData {
  todayAttendance: TodayAttendance | null
  personalStats: PersonalStats
  adminStats?: AdminStats
  recentActivities: Activity[]
  announcements: Announcement[]
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const isAdmin = user?.role && ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'DEPT_MANAGER'].includes(user.role)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/dashboard')
      if (response.data.success) {
        setData(response.data.data)
      }
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const response = await api.post('/api/attendance/checkin')
      if (response.data.success) {
        // 출근 후 데이터 새로고침
        await fetchDashboardData()
      }
    } catch (error: any) {
      console.error('출근 처리 오류:', error)
      alert(error.response?.data?.message || '출근 처리 중 오류가 발생했습니다.')
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    setCheckingOut(true)
    try {
      const response = await api.post('/api/attendance/checkout')
      if (response.data.success) {
        // 퇴근 후 데이터 새로고침
        await fetchDashboardData()
      }
    } catch (error: any) {
      console.error('퇴근 처리 오류:', error)
      alert(error.response?.data?.message || '퇴근 처리 중 오류가 발생했습니다.')
    } finally {
      setCheckingOut(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      COMPLETED: '완료',
      IN_PROGRESS: '진행중',
      PENDING: '대기',
      CANCELLED: '취소',
    }
    return texts[status] || status
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      endorsement: FileText,
      new_policy: FileText,
      claim: Bell,
      renewal: TrendingUp,
    }
    return icons[type] || FileText
  }

  const getAnnouncementIcon = (type: string) => {
    const icons: Record<string, any> = {
      product: Bell,
      system: BarChart3,
      policy: FileText,
      general: Bell,
    }
    return icons[type] || Bell
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">대시보드 데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const attendance = data.todayAttendance
  const personalStats = data.personalStats
  const adminStats = data.adminStats
  const hasCheckedIn = !!attendance?.formatted_check_in
  const hasCheckedOut = !!attendance?.formatted_check_out

  return (
    <div className="space-y-6">

      {/* 출퇴근 카드 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          오늘의 출퇴근
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">출근 시간</label>
            <div className="text-2xl font-bold text-foreground">
              {attendance?.formatted_check_in || '--:--'}
            </div>
            <button
              onClick={handleCheckIn}
              disabled={hasCheckedIn || checkingIn}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {checkingIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  처리중...
                </>
              ) : hasCheckedIn ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  출근완료
                </>
              ) : (
                '출근하기'
              )}
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">퇴근 시간</label>
            <div className="text-2xl font-bold text-foreground">
              {attendance?.formatted_check_out || '--:--'}
            </div>
            <button
              onClick={handleCheckOut}
              disabled={!hasCheckedIn || hasCheckedOut || checkingOut}
              className="w-full py-2 px-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {checkingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  처리중...
                </>
              ) : hasCheckedOut ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  퇴근완료
                </>
              ) : (
                '퇴근하기'
              )}
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">근무 시간</label>
            <div className="text-2xl font-bold text-foreground">
              {attendance?.work_hours ? `${attendance.work_hours.toFixed(1)}h` : '0.0h'}
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 개인 통계 */}
        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">이번 달 처리</p>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{personalStats.monthlyStats || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">건</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">평균 처리시간</p>
            <Timer className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {personalStats.avgProcessingTime || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">분</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">이번 주 근무시간</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {personalStats.weeklyHours?.toFixed(1) || '0.0'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">시간</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">달성률</p>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {personalStats.achievementRate || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">%</p>
        </div>
      </div>

      {/* 관리자 통계 (관리자만 표시) */}
      {isAdmin && adminStats && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            관리자 통계
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">전체 직원</p>
              <p className="text-3xl font-bold text-blue-600">{adminStats.totalEmployees || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">명</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">오늘 출근</p>
              <p className="text-3xl font-bold text-green-600">
                {adminStats.todayAttendance || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">명</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">승인 대기</p>
              <p className="text-3xl font-bold text-yellow-600">
                {adminStats.pendingApprovals || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">건</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 활동 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            최근 활동
          </h2>
          <div className="space-y-4">
            {data.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type)
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent transition-colors border border-border"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ActivityIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-medium text-foreground truncate">{activity.title}</p>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                            activity.status
                          )}`}
                        >
                          {getStatusText(activity.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.date).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                최근 활동이 없습니다
              </div>
            )}
          </div>
        </div>

        {/* 공지사항 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            공지사항
          </h2>
          <div className="space-y-4">
            {data.announcements && data.announcements.length > 0 ? (
              data.announcements.map((announcement, index) => {
                const AnnouncementIcon = getAnnouncementIcon(announcement.type)
                const isHighPriority = announcement.priority === 'HIGH'
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isHighPriority ? 'border-red-200 bg-red-50' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isHighPriority ? 'bg-red-100' : 'bg-primary/10'
                        }`}
                      >
                        <AnnouncementIcon
                          className={`w-5 h-5 ${isHighPriority ? 'text-red-600' : 'text-primary'}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-foreground">{announcement.title}</h3>
                          <span className="text-xs text-muted-foreground">
                            {announcement.time_ago}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{announcement.content}</p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                            isHighPriority
                              ? 'bg-red-100 text-red-800'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {announcement.date_label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                새로운 공지사항이 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
