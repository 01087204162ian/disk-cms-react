import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import {
  Search,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface Employee {
  email: string
  name: string
  phone?: string
  employee_id?: string
  department?: {
    id?: number
    name?: string
  }
  position?: string
  role: string
  work_type?: string
  work_schedule?: string
  status: string
  is_active: number
  created_at: string
  last_login_at?: string
}

interface Department {
  id: number
  name: string
}

interface Stats {
  total: number
  pending: number
  active: number
  inactive: number
}

export default function Employees() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    active: 0,
    inactive: 0,
  })
  const [loading, setLoading] = useState(true)

  // 필터 상태
  const [filters, setFilters] = useState({
    department: '',
    status: '1', // 기본값: 활성
    role: '',
    search: '',
  })
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // 관리자 권한 체크
  const isAdmin = user?.role && ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'DEPT_MANAGER'].includes(user.role)
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }
    loadInitialData()
  }, [isAdmin])

  useEffect(() => {
    loadEmployees()
  }, [currentPage, pageSize, filters])

  const loadInitialData = async () => {
    try {
      // 부서 목록 로드
      const deptResponse = await api.get('/api/staff/departments')
      if (deptResponse.data.success) {
        setDepartments(deptResponse.data.data || [])
      }
    } catch (error) {
      console.error('부서 목록 로드 오류:', error)
    }
  }

  const loadEmployees = async () => {
    setLoading(true)
    try {
      setLoadError(null)
      const params: any = {
        page: currentPage,
        limit: pageSize,
      }

      if (filters.department) params.department = filters.department
      if (filters.status) params.status = filters.status
      if (filters.role) params.role = filters.role
      if (filters.search) params.search = filters.search

      const response = await api.get('/api/staff/employees', { params })

      if (response.data.success) {
        const data = response.data.data || {}
        setEmployees(data.employees || [])
        setTotalCount(data.pagination?.total_count ?? data.total ?? 0)
        setStats((prev) => data.statistics ?? data.stats ?? prev)
        setLastRefresh(new Date())
      } else {
        setLoadError(response.data.message || '직원 목록을 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('직원 목록 로드 오류:', error)
      setLoadError(error?.response?.data?.message || error?.message || '직원 목록 로드 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // 필터 변경 시 첫 페이지로
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadEmployees()
  }

  const handleRefresh = () => {
    loadEmployees()
  }

  // === 수정/삭제/활성화 상태 ===
  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    department_id: '',
    position: '',
    role: '',
    is_active: '1',
  })

  const openEdit = (emp: Employee) => {
    setActionError(null)
    setEditTarget(emp)
    setEditForm({
      name: emp.name || '',
      phone: emp.phone || '',
      department_id: emp.department?.id ? String(emp.department.id) : '',
      position: emp.position || '',
      role: emp.role || '',
      is_active: emp.is_active !== undefined ? String(emp.is_active) : '1',
    })
    setEditOpen(true)
  }

  const submitEdit = async () => {
    if (!editTarget) return
    try {
      setActionError(null)
      await api.put(`/api/staff/employees/${editTarget.email}`, {
        name: editForm.name,
        phone: editForm.phone,
        department_id: editForm.department_id || null,
        position: editForm.position,
        role: editForm.role,
        is_active: Number(editForm.is_active),
      })
      setEditOpen(false)
      await loadEmployees()
    } catch (error: any) {
      setActionError(error?.response?.data?.message || error?.message || '직원 수정 중 오류가 발생했습니다.')
    }
  }

  const confirmDeactivate = async (emp: Employee) => {
    if (!confirm(`'${emp.name || emp.email}' 계정을 비활성화할까요?`)) return
    try {
      setActionError(null)
      await api.patch(`/api/staff/employees/${emp.email}/deactivate`)
      await loadEmployees()
    } catch (error: any) {
      setActionError(error?.response?.data?.message || error?.message || '비활성화 중 오류가 발생했습니다.')
    }
  }

  const confirmActivate = async (emp: Employee) => {
    if (!confirm(`'${emp.name || emp.email}' 계정을 활성화할까요?`)) return
    try {
      setActionError(null)
      await api.patch(`/api/staff/employees/${emp.email}/activate`)
      await loadEmployees()
    } catch (error: any) {
      setActionError(error?.response?.data?.message || error?.message || '활성화 중 오류가 발생했습니다.')
    }
  }

  const confirmDelete = async (emp: Employee) => {
    if (!isSuperAdmin) return
    if (!confirm(`'${emp.name || emp.email}' 계정을 삭제할까요? (복구 불가)`)) return
    try {
      setActionError(null)
      await api.delete(`/api/staff/employees/${emp.email}`)
      await loadEmployees()
    } catch (error: any) {
      setActionError(error?.response?.data?.message || error?.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      SUPER_ADMIN: { label: '최고관리자', className: 'bg-red-100 text-red-800' },
      SYSTEM_ADMIN: { label: '시스템관리자', className: 'bg-yellow-100 text-yellow-800' },
      DEPT_MANAGER: { label: '부서관리자', className: 'bg-blue-100 text-blue-800' },
      EMPLOYEE: { label: '일반직원', className: 'bg-green-100 text-green-800' },
    }
    const badge = badges[role] || { label: role, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

  const getStatusBadge = (status: string, isActive: number) => {
    // API에서 status와 is_active 둘 다 올 수 있으므로 둘 다 체크
    const statusValue = status || (isActive === 0 ? 'pending' : isActive === 1 ? 'active' : 'inactive')
    
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: '승인대기', className: 'bg-yellow-100 text-yellow-800' },
      active: { label: '활성', className: 'bg-green-100 text-green-800' },
      inactive: { label: '비활성', className: 'bg-gray-100 text-gray-800' },
    }
    const badge = badges[statusValue] || { label: statusValue, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

  const totalPages = Math.ceil(totalCount / pageSize)
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="space-y-6">
      {/* 필터 영역 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* 부서 필터 */}
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            <option value="">전체 부서</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* 상태 필터 */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            <option value="">전체</option>
            <option value="0">승인대기</option>
            <option value="1">활성</option>
            <option value="2">비활성</option>
          </select>

          {/* 권한 필터 */}
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            <option value="">전체 권한</option>
            <option value="SUPER_ADMIN">최고관리자</option>
            <option value="DEPT_MANAGER">부서장</option>
            <option value="SYSTEM_ADMIN">시스템관리자</option>
            <option value="EMPLOYEE">직원</option>
          </select>

          {/* 페이지 크기 */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            <option value="20">20개</option>
            <option value="50">50개</option>
            <option value="100">100개</option>
          </select>

          {/* 검색 영역 */}
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="이름, 이메일, 사번으로 검색"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
          >
            <Search className="w-4 h-4" />
            검색
          </button>
        </div>

        {loadError ? (
          <div className="mt-3 text-sm text-destructive">
            {loadError}
          </div>
        ) : null}
        {actionError ? (
          <div className="mt-3 text-sm text-destructive">
            {actionError}
          </div>
        ) : null}

        {/* 통계 정보 */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium">직원 현황:</span>
              <span className="text-foreground">
                전체 <strong>{stats.total}</strong>명
              </span>
              <span className="text-yellow-600">
                승인대기 <strong>{stats.pending}</strong>명
              </span>
              <span className="text-green-600">
                활성 <strong>{stats.active}</strong>명
              </span>
              <span className="text-muted-foreground">
                비활성 <strong>{stats.inactive}</strong>명
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              마지막 갱신: {lastRefresh.toLocaleTimeString('ko-KR')}
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate('/staff/departments')}
          className="px-4 py-2 bg-info text-info-foreground rounded-lg font-medium hover:bg-info/90 transition-colors flex items-center gap-2"
        >
          <Building className="w-4 h-4" />
          <span className="hidden md:inline">부서 관리</span>
        </button>
        <button
          onClick={() => navigate('/staff/employee-schedule')}
          className="px-4 py-2 bg-success text-success-foreground rounded-lg font-medium hover:bg-success/90 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden md:inline">근무 일정 관리</span>
        </button>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden lg:inline">엑셀 다운로드</span>
        </button>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden md:inline">새로고침</span>
        </button>
      </div>

      {/* 테이블 */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            직원 데이터가 없습니다.
          </div>
        ) : (
          <>
            {/* 데스크톱 테이블 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">이름</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">이메일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground hidden lg:table-cell">
                      연락처
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground hidden lg:table-cell">
                      사번
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">부서</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground hidden xl:table-cell">
                      직급
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">권한</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">가입일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground hidden lg:table-cell">
                      마지막로그인
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">상태</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {employees.map((employee) => (
                    <tr key={employee.email} className="hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{employee.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${employee.email}`}
                          className="text-primary hover:underline"
                        >
                          {employee.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                        {employee.phone || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                        {employee.employee_id || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">
                          {employee.department?.name || '미지정'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden xl:table-cell">
                        {employee.position || '-'}
                      </td>
                      <td className="px-4 py-3">{getRoleBadge(employee.role)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(employee.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                        {employee.last_login_at
                          ? new Date(employee.last_login_at).toLocaleDateString('ko-KR')
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(employee.status, employee.is_active)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 text-info hover:bg-info/10 rounded-lg transition-colors"
                            title="상세보기"
                            onClick={() => openEdit(employee)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-warning hover:bg-warning/10 rounded-lg transition-colors"
                            title="수정"
                            onClick={() => openEdit(employee)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {employee.is_active === 1 ? (
                            <button
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="비활성화"
                              onClick={() => confirmDeactivate(employee)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                              title="활성화"
                              onClick={() => confirmActivate(employee)}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          {isSuperAdmin && (
                            <button
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="삭제"
                              onClick={() => confirmDelete(employee)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 */}
            <div className="md:hidden divide-y divide-border">
              {employees.map((employee) => (
                <div key={employee.email} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                    {getStatusBadge(employee.status, employee.is_active)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">부서:</span>{' '}
                      <span className="text-foreground">
                        {employee.department?.name || '미지정'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">권한:</span>{' '}
                      {getRoleBadge(employee.role)}
                    </div>
                    {employee.phone && (
                      <div>
                        <span className="text-muted-foreground">연락처:</span>{' '}
                        <span className="text-foreground">{employee.phone}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">가입일:</span>{' '}
                      <span className="text-foreground">
                        {new Date(employee.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      className="flex-1 px-3 py-2 bg-info/10 text-info rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                      onClick={() => openEdit(employee)}
                    >
                      <Eye className="w-4 h-4" />
                      상세보기
                    </button>
                    <button
                      className="flex-1 px-3 py-2 bg-warning/10 text-warning rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                      onClick={() => openEdit(employee)}
                    >
                      <Edit className="w-4 h-4" />
                      수정
                    </button>
                    {employee.is_active === 1 ? (
                      <button
                        className="px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        onClick={() => confirmDeactivate(employee)}
                      >
                        <Trash2 className="w-4 h-4" />
                        비활성
                      </button>
                    ) : (
                      <button
                        className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        onClick={() => confirmActivate(employee)}
                      >
                        <RefreshCw className="w-4 h-4" />
                        활성
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button
                        className="px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        onClick={() => confirmDelete(employee)}
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 페이징 */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {startIndex} ~ {endIndex} / 전체 {totalCount}개
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 수정/상세 모달 */}
      {editOpen && editTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-background border border-border p-6">
            <div className="text-lg font-semibold mb-1">직원 정보</div>
            <div className="text-sm text-muted-foreground mb-4">{editTarget.email}</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm font-medium mb-1">이름</div>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">전화번호</div>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">부서</div>
                <select
                  value={editForm.department_id}
                  onChange={(e) => setEditForm((p) => ({ ...p, department_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="">미지정</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">직급/직책</div>
                <input
                  value={editForm.position}
                  onChange={(e) => setEditForm((p) => ({ ...p, position: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">권한</div>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="SUPER_ADMIN">최고관리자</option>
                  <option value="SYSTEM_ADMIN">시스템관리자</option>
                  <option value="DEPT_MANAGER">부서관리자</option>
                  <option value="EMPLOYEE">직원</option>
                </select>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">상태</div>
                <select
                  value={editForm.is_active}
                  onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="0">승인대기</option>
                  <option value="1">활성</option>
                  <option value="2">비활성</option>
                </select>
              </div>
            </div>

            {actionError ? <div className="mt-3 text-sm text-destructive">{actionError}</div> : null}

            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm"
              >
                닫기
              </button>
              <button
                onClick={submitEdit}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
