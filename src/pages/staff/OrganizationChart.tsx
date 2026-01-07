import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { RefreshCw, Search } from 'lucide-react'

type Department = {
  id: number
  name: string
  code?: string
}

type Employee = {
  email: string
  name: string
  phone?: string
  employee_id?: string
  department?: { id?: number | null; name?: string | null; code?: string | null }
  position?: string | null
  role: string
  is_active: number
}

function roleLabel(role: string) {
  const map: Record<string, { label: string; className: string }> = {
    SUPER_ADMIN: { label: '최고관리자', className: 'bg-red-100 text-red-800' },
    SYSTEM_ADMIN: { label: '시스템관리자', className: 'bg-yellow-100 text-yellow-800' },
    DEPT_MANAGER: { label: '부서장', className: 'bg-blue-100 text-blue-800' },
    EMPLOYEE: { label: '직원', className: 'bg-green-100 text-green-800' },
  }
  return map[role] || { label: role, className: 'bg-gray-100 text-gray-800' }
}

export default function OrganizationChart() {
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [search, setSearch] = useState('')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadData = async () => {
    setLoading(true)
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/api/staff/departments'),
        api.get('/api/staff/employees/org-chart'),
      ])
      if (deptRes.data?.success) setDepartments(deptRes.data.data || [])
      if (empRes.data?.success) setEmployees(empRes.data.data || [])
      setLastRefresh(new Date())
    } catch (e) {
      console.error('조직도 로드 오류:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return employees.filter((emp) => {
      if (departmentFilter) {
        const deptId = emp.department?.id
        if (!deptId || String(deptId) !== departmentFilter) return false
      }
      if (keyword) {
        const name = (emp.name || '').toLowerCase()
        const email = (emp.email || '').toLowerCase()
        if (!name.includes(keyword) && !email.includes(keyword)) return false
      }
      return true
    })
  }, [employees, departmentFilter, search])

  const executives = useMemo(() => {
    return filteredEmployees
      .filter((emp) => emp.role === 'SUPER_ADMIN' && (emp.position === 'CEO' || emp.position === 'CFO'))
      .sort((a, b) => {
        if (a.position === 'CEO') return -1
        if (b.position === 'CEO') return 1
        if (a.position === 'CFO') return -1
        if (b.position === 'CFO') return 1
        return 0
      })
  }, [filteredEmployees])

  const employeesByDepartment = useMemo(() => {
    const map = new Map<number, Employee[]>()
    for (const emp of filteredEmployees) {
      // 경영진은 별도 섹션
      if (emp.role === 'SUPER_ADMIN' && (emp.position === 'CEO' || emp.position === 'CFO')) continue
      const deptId = emp.department?.id
      if (!deptId) continue
      if (!map.has(deptId)) map.set(deptId, [])
      map.get(deptId)!.push(emp)
    }
    // role 우선순위 정렬 + 이름
    for (const [k, list] of map.entries()) {
      map.set(
        k,
        [...list].sort((a, b) => {
          const order = (r: string) =>
            r === 'SYSTEM_ADMIN' ? 1 : r === 'DEPT_MANAGER' ? 2 : r === 'SUPER_ADMIN' ? 0 : 3
          const diff = order(a.role) - order(b.role)
          if (diff !== 0) return diff
          return (a.name || '').localeCompare(b.name || '', 'ko-KR')
        })
      )
    }
    return map
  }, [filteredEmployees])

  const noDepartmentEmployees = useMemo(() => {
    return filteredEmployees.filter((emp) => {
      if (emp.role === 'SUPER_ADMIN' && (emp.position === 'CEO' || emp.position === 'CFO')) return false
      return !emp.department?.id
    })
  }, [filteredEmployees])

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            조직 현황: 부서 <strong className="text-foreground">{departments.length}</strong>개 · 직원{' '}
            <strong className="text-foreground">{employees.length}</strong>명 · 마지막 갱신{' '}
            <strong className="text-foreground">{lastRefresh.toLocaleString('ko-KR')}</strong>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            <option value="">전체 부서</option>
            {departments.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-background">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름/이메일 검색"
              className="outline-none bg-transparent text-sm w-56 max-w-[60vw]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground">
          불러오는 중...
        </div>
      ) : (
        <div className="space-y-6">
          {executives.length > 0 && (!departmentFilter || search.trim()) ? (
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="font-semibold mb-4">경영진</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {executives.map((emp) => {
                  const badge = roleLabel(emp.role)
                  return (
                    <div key={emp.email} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{emp.name}</div>
                          <div className="text-xs text-muted-foreground mt-1 truncate">{emp.email}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
                          {emp.position || badge.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="space-y-6">
            {departments.map((dept) => {
              if (departmentFilter && String(dept.id) !== departmentFilter) return null
              const list = employeesByDepartment.get(dept.id) || []
              if (!departmentFilter && list.length === 0) return null

              return (
                <div key={dept.id} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="font-semibold">
                      {dept.name} {dept.code ? <span className="text-sm text-muted-foreground">({dept.code})</span> : null}
                    </div>
                    <div className="text-sm text-muted-foreground">인원 {list.length}명</div>
                  </div>
                  {list.length === 0 ? (
                    <div className="text-sm text-muted-foreground">표시할 직원이 없습니다.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {list.map((emp) => {
                        const badge = roleLabel(emp.role)
                        return (
                          <div key={emp.email} className="rounded-xl border border-border p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold truncate">{emp.name}</div>
                                <div className="text-xs text-muted-foreground mt-1 truncate">{emp.email}</div>
                                {emp.position ? (
                                  <div className="text-xs text-muted-foreground mt-1 truncate">{emp.position}</div>
                                ) : null}
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
                                {badge.label}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {noDepartmentEmployees.length > 0 && !departmentFilter ? (
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="font-semibold mb-4">부서 미지정</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {noDepartmentEmployees.map((emp) => {
                  const badge = roleLabel(emp.role)
                  return (
                    <div key={emp.email} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{emp.name}</div>
                          <div className="text-xs text-muted-foreground mt-1 truncate">{emp.email}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

