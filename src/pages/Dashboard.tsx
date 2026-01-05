import { useEffect, useState } from 'react'
import api from '../lib/api'
import { LayoutDashboard, Users, Shield, TrendingUp } from 'lucide-react'

interface DashboardStats {
  totalUsers?: number
  totalApplications?: number
  totalClaims?: number
  recentActivity?: any[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/dashboard')
        if (response.data.success) {
          setStats(response.data.data || {})
        }
      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    {
      title: '전체 사용자',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '신청 건수',
      value: stats.totalApplications || 0,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '클레임 건수',
      value: stats.totalClaims || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8" />
          대시보드
        </h1>
        <p className="text-muted-foreground mt-2">
          보험 CMS 시스템에 오신 것을 환영합니다
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-4 rounded-xl`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 최근 활동 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">최근 활동</h2>
        <div className="space-y-4">
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              최근 활동이 없습니다
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
