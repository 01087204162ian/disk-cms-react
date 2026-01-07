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
  updated_at?: string
  last_login_at?: string
  hire_date?: string
  resign_date?: string
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

  const handleExcelDownload = async () => {
    try {
      setActionError(null)
      const params: any = {}
      if (filters.department) params.department = filters.department
      if (filters.status) params.status = filters.status
      if (filters.role) params.role = filters.role
      if (filters.search) params.search = filters.search
      
      const res = await api.get('/api/staff/employees/export', {
        params,
        responseType: 'blob',
      })
      
      // Content-Type 확인: 에러 응답(JSON)인지 체크
      const contentType = res.headers['content-type'] || ''
      if (contentType.includes('application/json')) {
        // 에러 응답인 경우 JSON으로 파싱
        const text = await res.data.text()
        const errorData = JSON.parse(text)
        throw new Error(errorData.message || '엑셀 다운로드 중 오류가 발생했습니다.')
      }
      
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `employees_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('엑셀 다운로드 오류:', error)
      setActionError(error?.response?.data?.message || error?.message || '엑셀 다운로드 중 오류가 발생했습니다.')
    }
  }

  // === 수정/삭제/활성화 상태 ===
  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    employee_id: '',
    department_id: '',
    position: '',
    role: '',
    work_type: '',
    work_schedule: '',
    hire_date: '',
    is_active: '1',
  })

  // 전화번호 포맷팅 함수 (원본과 동일)
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, '')
    if (numbers.length >= 3 && numbers.length <= 7) {
      return numbers.substring(0, 3) + '-' + numbers.substring(3)
    } else if (numbers.length > 7) {
      return numbers.substring(0, 3) + '-' + numbers.substring(3, 7) + '-' + numbers.substring(7, 11)
    }
    return numbers
  }

  // 날짜 포맷팅 (YYYY-MM-DD)
  const formatDateForInput = (dateValue?: string): string => {
    if (!dateValue) return ''
    try {
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return ''
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch (error) {
      return ''
    }
  }

  // 날짜시간 포맷팅 (원본과 동일한 형식: 2026. 01. 03. 오후 04:35)
  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = date.getHours()
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      // 오전/오후 구분
      const period = hours >= 12 ? '오후' : '오전'
      const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
      const displayHoursStr = String(displayHours).padStart(2, '0')
      
      return `${year}. ${month}. ${day}. ${period} ${displayHoursStr}:${minutes}`
    } catch {
      return '-'
    }
  }

  const openEdit = (emp: Employee) => {
    setActionError(null)
    setEditTarget(emp)
    // 전화번호 포맷팅
    const phoneValue = emp.phone || ''
    const formattedPhone = phoneValue.includes('-') ? phoneValue : formatPhoneNumber(phoneValue)
    
    setEditForm({
      name: emp.name || '',
      phone: formattedPhone,
      employee_id: emp.employee_id || '',
      department_id: emp.department?.id ? String(emp.department.id) : '',
      position: emp.position || '',
      role: emp.role || '',
      work_type: emp.work_type || '',
      work_schedule: emp.work_schedule || '',
      hire_date: formatDateForInput(emp.hire_date),
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
        employee_id: editForm.employee_id || null,
        department_id: editForm.department_id || null,
        position: editForm.position,
        role: editForm.role,
        work_type: editForm.work_type || null,
        work_schedule: editForm.work_schedule || null,
        hire_date: editForm.hire_date || null,
        is_active: Number(editForm.is_active),
      })
      setEditOpen(false)
      await loadEmployees()
    } catch (error: any) {
      setActionError(error?.response?.data?.message || error?.message || '직원 수정 중 오류가 발생했습니다.')
    }
  }

  // 퇴사일 입력 모달 상태
  const [resignDateModalOpen, setResignDateModalOpen] = useState(false)
  const [resignDateTarget, setResignDateTarget] = useState<Employee | null>(null)
  const [resignDate, setResignDate] = useState('')

  // 부서 관리 모달 상태
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false)
  const [departmentList, setDepartmentList] = useState<any[]>([])
  const [departmentLoading, setDepartmentLoading] = useState(false)
  const [departmentEmployees, setDepartmentEmployees] = useState<Employee[]>([])
  
  // 부서 추가 폼 상태
  const [newDeptCode, setNewDeptCode] = useState('')
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptManager, setNewDeptManager] = useState('')
  const [newDeptDescription, setNewDeptDescription] = useState('')
  const [newDeptStatus, setNewDeptStatus] = useState('1')
  const [departmentError, setDepartmentError] = useState<string | null>(null)

  const openResignDateModal = (emp: Employee) => {
    const today = new Date().toISOString().split('T')[0]
    setResignDate(today)
    setResignDateTarget(emp)
    setResignDateModalOpen(true)
  }

  const confirmDeactivate = async () => {
    if (!resignDateTarget || !resignDate) {
      setActionError('퇴사일을 선택해주세요.')
      return
    }
    try {
      setActionError(null)
      await api.patch(`/api/staff/employees/${resignDateTarget.email}/deactivate`, {
        notes: '모달에서 관리자에 의한 계정 비활성화',
        resign_date: resignDate
      })
      setResignDateModalOpen(false)
      setResignDateTarget(null)
      setResignDate('')
      if (editOpen) {
        setEditOpen(false)
      }
      await loadEmployees()
    } catch (error: any) {
      setActionError(error?.response?.data?.message || error?.message || '비활성화 중 오류가 발생했습니다.')
    }
  }

  // 부서 관리 모달 열기
  const openDepartmentModal = async () => {
    setDepartmentModalOpen(true)
    setDepartmentError(null)
    await loadDepartmentData()
  }

  // 부서 데이터 로드
  const loadDepartmentData = async () => {
    setDepartmentLoading(true)
    try {
      // 부서 목록 로드 (manage API)
      const deptRes = await api.get('/api/staff/departments/manage')
      if (deptRes.data.success) {
        setDepartmentList(deptRes.data.data || [])
      }

      // 부서장 후보 직원 목록 로드
      const empRes = await api.get('/api/staff/employees?status=1&limit=1000')
      if (empRes.data.success) {
        const candidates = (empRes.data.data?.employees || []).filter((emp: Employee) =>
          ['SUPER_ADMIN', 'DEPT_MANAGER', 'SYSTEM_ADMIN'].includes(emp.role)
        )
        setDepartmentEmployees(candidates)
      }
    } catch (error: any) {
      console.error('부서 데이터 로드 오류:', error)
      setDepartmentError(error?.response?.data?.message || '부서 데이터를 불러오는데 실패했습니다.')
    } finally {
      setDepartmentLoading(false)
    }
  }

  // 부서 추가
  const addDepartment = async () => {
    if (!newDeptCode.trim() || !newDeptName.trim()) {
      setDepartmentError('부서코드와 부서명은 필수입니다.')
      return
    }
    try {
      setDepartmentError(null)
      const res = await api.post('/api/staff/departments', {
        code: newDeptCode.trim().toUpperCase(),
        name: newDeptName.trim(),
        manager_id: newDeptManager.trim() || null,
        description: newDeptDescription.trim() || null,
        is_active: parseInt(newDeptStatus),
      })
      if (res.data.success) {
        // 폼 초기화
        setNewDeptCode('')
        setNewDeptName('')
        setNewDeptManager('')
        setNewDeptDescription('')
        setNewDeptStatus('1')
        // 데이터 새로고침
        await loadDepartmentData()
        await loadInitialData() // 메인 페이지 부서 필터도 새로고침
      } else {
        setDepartmentError(res.data.message || '부서 추가에 실패했습니다.')
      }
    } catch (error: any) {
      setDepartmentError(error?.response?.data?.message || error?.message || '부서 추가 중 오류가 발생했습니다.')
    }
  }

  // 부서 수정
  const updateDepartment = async (deptId: number, field: string, value: any) => {
    const dept = departmentList.find((d) => d.id === deptId)
    if (!dept) return

    const body: any = {
      code: dept.code,
      name: dept.name,
      manager_id: dept.manager_id,
      description: dept.description,
      is_active: dept.is_active,
      [field]: value,
    }

    try {
      const res = await api.put(`/api/staff/departments/${deptId}`, body)
      if (res.data.success) {
        await loadDepartmentData()
        await loadInitialData()
      } else {
        setDepartmentError(res.data.message || '부서 수정에 실패했습니다.')
      }
    } catch (error: any) {
      setDepartmentError(error?.response?.data?.message || error?.message || '부서 수정 중 오류가 발생했습니다.')
    }
  }

  // 부서 삭제
  const deleteDepartment = async (deptId: number) => {
    const dept = departmentList.find((d) => d.id === deptId)
    if (!dept) return

    if ((dept.employee_count || 0) > 0) {
      setDepartmentError('소속 직원이 있는 부서는 삭제할 수 없습니다.')
      return
    }

    if (!confirm(`'${dept.name}' 부서를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return

    try {
      const res = await api.delete(`/api/staff/departments/${deptId}`)
      if (res.data.success) {
        await loadDepartmentData()
        await loadInitialData()
      } else {
        setDepartmentError(res.data.message || '부서 삭제에 실패했습니다.')
      }
    } catch (error: any) {
      setDepartmentError(error?.response?.data?.message || error?.message || '부서 삭제 중 오류가 발생했습니다.')
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

  // 추후 물리 삭제 버튼이 필요하면 복원; 현재는 비활성/재활성만 사용
  // const confirmDelete = async (emp: Employee) => { ... }

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
          onClick={openDepartmentModal}
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
        <button
          onClick={handleExcelDownload}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
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
                              onClick={() => openResignDateModal(employee)}
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
                        onClick={() => openResignDateModal(employee)}
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
          <div className="w-full max-w-4xl rounded-xl bg-background border border-border overflow-hidden">
            {/* 헤더 - 보라색 그라데이션 */}
            <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h5 className="text-lg font-semibold text-white m-0">
                  <small className="block mt-1 text-sm font-normal text-white/85">
                    {editTarget.name} ({editTarget.email})
                  </small>
                </h5>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="text-white hover:bg-white/10 rounded p-1 text-xl leading-none transition-colors"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {/* 본문 */}
            <div className="p-6 bg-white">
              <div className="grid grid-cols-[100px_1fr_100px_1fr] gap-y-1 gap-x-4 items-center">
                {/* 이름 */}
                <label className="text-xs font-medium text-gray-700 py-1">이름:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  onFocus={(e) => {
                    e.target.classList.remove('text-right')
                    e.target.classList.add('text-left')
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.classList.remove('text-left')
                      e.target.classList.add('text-right')
                    }
                  }}
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
                />
                
                {/* 이메일 */}
                <label className="text-xs font-medium text-gray-700 py-1">이메일:</label>
                <input
                  type="email"
                  value={editTarget.email}
                  readOnly
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-gray-50 focus:outline-none text-right"
                />
                
                {/* 연락처 */}
                <label className="text-xs font-medium text-gray-700 py-1">연락처:</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    if (formatted.length <= 13) {
                      setEditForm((p) => ({ ...p, phone: formatted }))
                    }
                  }}
                  onFocus={(e) => {
                    e.target.classList.remove('text-right')
                    e.target.classList.add('text-left')
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.classList.remove('text-left')
                      e.target.classList.add('text-right')
                    }
                  }}
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
                />
                
                {/* 사번 */}
                <label className="text-xs font-medium text-gray-700 py-1">사번:</label>
                <input
                  type="text"
                  value={editForm.employee_id}
                  onChange={(e) => setEditForm((p) => ({ ...p, employee_id: e.target.value }))}
                  onFocus={(e) => {
                    e.target.classList.remove('text-right')
                    e.target.classList.add('text-left')
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.classList.remove('text-left')
                      e.target.classList.add('text-right')
                    }
                  }}
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
                />
                
                {/* 부서 */}
                <label className="text-xs font-medium text-gray-700 py-1">부서:</label>
                <select
                  value={editForm.department_id}
                  onChange={(e) => setEditForm((p) => ({ ...p, department_id: e.target.value }))}
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
                >
                  <option value="">부서 선택</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                
                {/* 직급 */}
                <label className="text-xs font-medium text-gray-700 py-1">직급:</label>
                <input
                  type="text"
                  value={editForm.position}
                  onChange={(e) => setEditForm((p) => ({ ...p, position: e.target.value }))}
                  onFocus={(e) => {
                    e.target.classList.remove('text-right')
                    e.target.classList.add('text-left')
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.classList.remove('text-left')
                      e.target.classList.add('text-right')
                    }
                  }}
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
                />
                
                {/* 입사일 */}
                <label className="text-xs font-medium text-gray-700 py-1">입사일:</label>
                <input
                  type="date"
                  value={editForm.hire_date}
                  onChange={(e) => setEditForm((p) => ({ ...p, hire_date: e.target.value }))}
                  onFocus={(e) => {
                    e.target.classList.remove('text-right')
                    e.target.classList.add('text-left')
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.classList.remove('text-left')
                      e.target.classList.add('text-right')
                    }
                  }}
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
                />
                
                {/* 권한 */}
                <label className="text-xs font-medium text-gray-700 py-1">권한:</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
                >
                  <option value="SUPER_ADMIN">최고관리자</option>
                  <option value="DEPT_MANAGER">부서장</option>
                  <option value="SYSTEM_ADMIN">시스템관리자</option>
                  <option value="EMPLOYEE">직원</option>
                </select>
                
                {/* 근무형태 */}
                <label className="text-xs font-medium text-gray-700 py-1">근무형태:</label>
                <select
                  value={editForm.work_type}
                  onChange={(e) => setEditForm((p) => ({ ...p, work_type: e.target.value }))}
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
                >
                  <option value="">선택</option>
                  <option value="FULL_TIME">정규직</option>
                  <option value="PART_TIME">파트타임</option>
                  <option value="CONTRACT">계약직</option>
                </select>
                
                {/* 근무일정 */}
                <label className="text-xs font-medium text-gray-700 py-1">근무일정:</label>
                <select
                  value={editForm.work_schedule}
                  onChange={(e) => setEditForm((p) => ({ ...p, work_schedule: e.target.value }))}
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
                >
                  <option value="">선택</option>
                  <option value="STANDARD">표준근무</option>
                  <option value="4_DAY">4일제</option>
                  <option value="FLEXIBLE">탄력근무</option>
                </select>
                
                {/* 계정상태 */}
                <label className="text-xs font-medium text-gray-700 py-1">계정상태:</label>
                <select
                  value={editForm.is_active}
                  onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.value }))}
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 text-right focus:text-left"
                >
                  <option value="1">활성</option>
                  <option value="0">대기중</option>
                  <option value="2">비활성</option>
                </select>
                
                {/* 가입일 */}
                <label className="text-xs font-medium text-gray-700 py-1">가입일:</label>
                <input
                  type="text"
                  value={formatDateTime(editTarget.created_at)}
                  readOnly
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-gray-50 focus:outline-none text-right"
                />
                
                {/* 퇴사일 */}
                <label className="text-xs font-medium text-gray-700 py-1">퇴사일:</label>
                <input
                  type="text"
                  value={editTarget.resign_date ? editTarget.resign_date : '퇴사하지 않음'}
                  readOnly
                  className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-gray-50 focus:outline-none text-right"
                />
                
                {/* 마지막 로그인 - 전체 폭 (퇴사일 다음 행) */}
                <div className="col-span-4 grid grid-cols-[100px_1fr] gap-y-1 gap-x-4 items-center mt-2">
                  <label className="text-xs font-medium text-gray-700 py-1">마지막 로그인:</label>
                  <input
                    type="text"
                    value={editTarget.last_login_at ? formatDateTime(editTarget.last_login_at) : '로그인 기록 없음'}
                    readOnly
                    className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-gray-50 focus:outline-none text-right"
                  />
                </div>
                
                {/* 최종 수정일 - 전체 폭 (마지막 로그인 다음 행) */}
                <div className="col-span-4 grid grid-cols-[100px_1fr] gap-y-1 gap-x-4 items-center">
                  <label className="text-xs font-medium text-gray-700 py-1">최종 수정일:</label>
                  <input
                    type="text"
                    value={formatDateTime(editTarget.updated_at || editTarget.created_at)}
                    readOnly
                    className="px-3 py-1.5 text-xs border-0 border-b border-gray-300 bg-gray-50 focus:outline-none text-right"
                  />
                </div>
              </div>

              {actionError ? <div className="mt-4 text-sm text-red-600">{actionError}</div> : null}

              {/* 푸터 */}
              <div className="mt-6 flex gap-2 justify-end border-t pt-4">
                <button
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm"
                >
                  닫기
                </button>
                <button
                  onClick={submitEdit}
                  className="px-4 py-2 rounded-lg bg-[#667eea] text-white hover:bg-[#5568d3] text-sm font-medium"
                >
                  수정
                </button>
                {editTarget.is_active === 1 ? (
                  <button
                    onClick={() => openResignDateModal(editTarget)}
                    className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 text-sm font-medium"
                  >
                    비활성화
                  </button>
                ) : editTarget.is_active === 2 ? (
                  <button
                    onClick={() => confirmActivate(editTarget)}
                    className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 text-sm font-medium"
                  >
                    재활성화
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 퇴사일 입력 모달 */}
      {resignDateModalOpen && resignDateTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background border border-border overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-4 flex items-center justify-between">
              <h5 className="text-lg font-semibold text-white m-0">퇴사일 지정</h5>
              <button
                onClick={() => {
                  setResignDateModalOpen(false)
                  setResignDateTarget(null)
                  setResignDate('')
                }}
                className="text-white hover:bg-white/10 rounded p-1 text-xl leading-none transition-colors"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {/* 본문 */}
            <div className="p-6 bg-white">
              <div className="mb-4">
                <label htmlFor="resignDateInput" className="block text-sm font-medium text-gray-700 mb-2">
                  퇴사일을 선택하세요:
                </label>
                <input
                  type="date"
                  id="resignDateInput"
                  value={resignDate}
                  onChange={(e) => setResignDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="mt-2 text-xs text-gray-500">
                  해당 직원의 퇴사일을 지정합니다.
                </div>
              </div>

              {actionError ? <div className="mb-4 text-sm text-red-600">{actionError}</div> : null}

              {/* 푸터 */}
              <div className="flex gap-2 justify-end border-t pt-4">
                <button
                  onClick={() => {
                    setResignDateModalOpen(false)
                    setResignDateTarget(null)
                    setResignDate('')
                    setActionError(null)
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm"
                >
                  취소
                </button>
                <button
                  onClick={confirmDeactivate}
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 text-sm font-medium"
                >
                  비활성화
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 부서 관리 모달 */}
      {departmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-6xl max-h-[90vh] rounded-xl bg-background border border-border overflow-hidden flex flex-col">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h5 className="text-lg font-semibold text-white m-0">
                  <Building className="inline-block w-5 h-5 mr-2" />
                  부서 관리
                </h5>
                <small className="block mt-1 text-sm font-normal text-white/85">
                  부서 추가, 수정, 삭제 관리
                </small>
              </div>
              <button
                onClick={() => {
                  setDepartmentModalOpen(false)
                  setDepartmentError(null)
                }}
                className="text-white hover:bg-white/10 rounded p-1 text-xl leading-none transition-colors"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {departmentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {departmentError}
                </div>
              )}

              {/* 새 부서 추가 영역 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h6 className="text-sm font-semibold mb-3 text-gray-700">
                  새 부서 추가
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">부서코드 *</label>
                    <input
                      type="text"
                      value={newDeptCode}
                      onChange={(e) => setNewDeptCode(e.target.value.toUpperCase())}
                      placeholder="예: DEV"
                      maxLength={20}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">부서명 *</label>
                    <input
                      type="text"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="예: 개발팀"
                      maxLength={50}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">부서장</label>
                    <select
                      value={newDeptManager}
                      onChange={(e) => setNewDeptManager(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">부서장 선택 (선택사항)</option>
                      {departmentEmployees.map((emp) => (
                        <option key={emp.email} value={emp.email}>
                          {emp.name} ({emp.department?.name || '미지정'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">상태</label>
                    <select
                      value={newDeptStatus}
                      onChange={(e) => setNewDeptStatus(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">활성</option>
                      <option value="0">비활성</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <button
                      onClick={addDepartment}
                      className="w-full px-3 py-1.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                    >
                      추가
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">부서 설명</label>
                  <textarea
                    value={newDeptDescription}
                    onChange={(e) => setNewDeptDescription(e.target.value)}
                    placeholder="부서 설명을 입력하세요 (선택사항)"
                    rows={2}
                    maxLength={500}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 기존 부서 목록 */}
              <div>
                <h6 className="text-sm font-semibold mb-3 text-gray-700">
                  기존 부서 목록 ({departmentList.length}개)
                </h6>
                {departmentLoading ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    부서 목록을 불러오는 중...
                  </div>
                ) : departmentList.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    등록된 부서가 없습니다.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left border border-gray-300 font-medium text-gray-700">코드</th>
                          <th className="px-3 py-2 text-left border border-gray-300 font-medium text-gray-700">부서명</th>
                          <th className="px-3 py-2 text-left border border-gray-300 font-medium text-gray-700">부서장</th>
                          <th className="px-3 py-2 text-left border border-gray-300 font-medium text-gray-700">설명</th>
                          <th className="px-3 py-2 text-center border border-gray-300 font-medium text-gray-700">인원</th>
                          <th className="px-3 py-2 text-center border border-gray-300 font-medium text-gray-700">상태</th>
                          <th className="px-3 py-2 text-center border border-gray-300 font-medium text-gray-700">관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentList.map((dept) => {
                          const manager = departmentEmployees.find((emp) => emp.email === dept.manager_id)
                          return (
                            <tr key={dept.id} className={dept.is_active ? '' : 'bg-yellow-50'}>
                              <td className="px-3 py-2 border border-gray-300">
                                <input
                                  type="text"
                                  defaultValue={dept.code}
                                  onBlur={(e) => {
                                    if (e.target.value !== dept.code) {
                                      updateDepartment(dept.id, 'code', e.target.value.toUpperCase())
                                    }
                                  }}
                                  className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  maxLength={20}
                                />
                              </td>
                              <td className="px-3 py-2 border border-gray-300">
                                <input
                                  type="text"
                                  defaultValue={dept.name}
                                  onBlur={(e) => {
                                    if (e.target.value !== dept.name) {
                                      updateDepartment(dept.id, 'name', e.target.value)
                                    }
                                  }}
                                  className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  maxLength={50}
                                />
                              </td>
                              <td className="px-3 py-2 border border-gray-300">
                                <select
                                  defaultValue={dept.manager_id || ''}
                                  onChange={(e) => updateDepartment(dept.id, 'manager_id', e.target.value || null)}
                                  className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="">선택 안함</option>
                                  {departmentEmployees.map((emp) => (
                                    <option key={emp.email} value={emp.email}>
                                      {emp.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2 border border-gray-300">
                                <textarea
                                  defaultValue={dept.description || ''}
                                  onBlur={(e) => {
                                    if (e.target.value !== (dept.description || '')) {
                                      updateDepartment(dept.id, 'description', e.target.value || null)
                                    }
                                  }}
                                  rows={1}
                                  maxLength={500}
                                  className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                />
                              </td>
                              <td className="px-3 py-2 border border-gray-300 text-center">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {dept.employee_count || 0}명
                                </span>
                              </td>
                              <td className="px-3 py-2 border border-gray-300">
                                <select
                                  defaultValue={dept.is_active ? '1' : '0'}
                                  onChange={(e) => updateDepartment(dept.id, 'is_active', parseInt(e.target.value))}
                                  className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="1">활성</option>
                                  <option value="0">비활성</option>
                                </select>
                              </td>
                              <td className="px-3 py-2 border border-gray-300 text-center">
                                <button
                                  onClick={() => deleteDepartment(dept.id)}
                                  disabled={(dept.employee_count || 0) > 0}
                                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                  title={(dept.employee_count || 0) > 0 ? '소속 직원이 있어 삭제할 수 없습니다' : '삭제'}
                                >
                                  삭제
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* 푸터 */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setDepartmentModalOpen(false)
                  setDepartmentError(null)
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
