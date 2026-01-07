import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { Plus, RefreshCw, Search, Pencil, Trash2 } from 'lucide-react'

type Department = {
  id: number
  code: string
  name: string
  description: string | null
  manager_id: string | null
  manager_name: string | null
  employee_count: number
  is_active: number
  created_at?: string
  updated_at?: string
}

export default function Departments() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const isManager = !!user?.role && ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'DEPT_MANAGER'].includes(user.role)
  const canWrite = !!user?.role && ['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(user.role)
  const canDelete = user?.role === 'SUPER_ADMIN'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Department[]>([])
  const [search, setSearch] = useState('')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // create modal
  const [createOpen, setCreateOpen] = useState(false)
  const [createCode, setCreateCode] = useState('')
  const [createName, setCreateName] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [createManager, setCreateManager] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  // edit modal
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editCode, setEditCode] = useState('')
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editManager, setEditManager] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [editError, setEditError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/staff/departments/manage')
      if (!res.data?.success) throw new Error(res.data?.message || '부서 목록을 불러오는데 실패했습니다.')
      setItems(res.data.data || [])
      setLastRefresh(new Date())
    } catch (e: any) {
      console.error(e)
      setError(e?.response?.data?.message || e?.message || '부서 목록 로드 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isManager) {
      navigate('/dashboard')
      return
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManager])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((d) => {
      const hay = `${d.code} ${d.name} ${d.description || ''} ${d.manager_name || ''} ${d.manager_id || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, search])

  const openCreate = () => {
    setCreateError(null)
    setCreateCode('')
    setCreateName('')
    setCreateDesc('')
    setCreateManager('')
    setCreateOpen(true)
  }

  const submitCreate = async () => {
    try {
      setCreateError(null)
      if (!createCode.trim() || !createName.trim()) {
        setCreateError('부서코드와 부서명은 필수입니다.')
        return
      }
      const body: any = {
        code: createCode.trim(),
        name: createName.trim(),
        description: createDesc.trim() ? createDesc.trim() : null,
        manager_id: createManager.trim() ? createManager.trim() : null,
        is_active: 1,
      }
      const res = await api.post('/api/staff/departments', body)
      if (!res.data?.success) throw new Error(res.data?.message || '부서 생성에 실패했습니다.')
      setCreateOpen(false)
      await load()
    } catch (e: any) {
      setCreateError(e?.response?.data?.message || e?.message || '부서 생성 중 오류가 발생했습니다.')
    }
  }

  const openEdit = (d: Department) => {
    setEditError(null)
    setEditId(d.id)
    setEditCode(d.code || '')
    setEditName(d.name || '')
    setEditDesc(d.description || '')
    setEditManager(d.manager_id || '')
    setEditActive(d.is_active === 1)
    setEditOpen(true)
  }

  const submitEdit = async () => {
    if (!editId) return
    try {
      setEditError(null)
      if (!editCode.trim() || !editName.trim()) {
        setEditError('부서코드와 부서명은 필수입니다.')
        return
      }
      const body: any = {
        code: editCode.trim(),
        name: editName.trim(),
        description: editDesc.trim() ? editDesc.trim() : null,
        manager_id: editManager.trim() ? editManager.trim() : null,
        is_active: editActive ? 1 : 0,
      }
      const res = await api.put(`/api/staff/departments/${editId}`, body)
      if (!res.data?.success) throw new Error(res.data?.message || '부서 수정에 실패했습니다.')
      setEditOpen(false)
      await load()
    } catch (e: any) {
      setEditError(e?.response?.data?.message || e?.message || '부서 수정 중 오류가 발생했습니다.')
    }
  }

  const remove = async (d: Department) => {
    if (!canDelete) return
    if (!confirm(`'${d.name}' 부서를 삭제할까요? (소속 직원이 있으면 실패합니다)`)) return
    try {
      const res = await api.delete(`/api/staff/departments/${d.id}`)
      if (!res.data?.success) throw new Error(res.data?.message || '삭제에 실패했습니다.')
      await load()
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            마지막 갱신: <strong className="text-foreground">{lastRefresh.toLocaleString('ko-KR')}</strong>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {canWrite ? (
              <button
                onClick={openCreate}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                부서 추가
              </button>
            ) : null}
            <button
              onClick={load}
              className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-background">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="코드/부서명/부서장 검색"
              className="outline-none bg-transparent text-sm w-72 max-w-[70vw]"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            총 <strong className="text-foreground">{filtered.length}</strong>개
          </div>
        </div>

        {error ? <div className="mt-3 text-sm text-destructive">{error}</div> : null}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border font-semibold">부서 목록</div>
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">데이터가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">코드</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">부서명</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">부서장</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">인원</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">상태</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-sm font-medium">{d.code}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{d.name}</div>
                      {d.description ? <div className="text-xs text-muted-foreground mt-1">{d.description}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {d.manager_name ? `${d.manager_name} (${d.manager_id})` : d.manager_id || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{d.employee_count}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={[
                          'px-2 py-1 text-xs font-medium rounded-full',
                          d.is_active === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                        ].join(' ')}
                      >
                        {d.is_active === 1 ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {canWrite ? (
                          <button
                            onClick={() => openEdit(d)}
                            className="px-2 py-2 rounded-lg border border-input bg-background hover:bg-muted"
                            title="수정"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            onClick={() => remove(d)}
                            className="px-2 py-2 rounded-lg border border-input bg-background hover:bg-muted"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background border border-border p-6">
            <div className="text-lg font-semibold">부서 추가</div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <div>
                <div className="text-sm font-medium mb-1">부서코드 *</div>
                <input
                  value={createCode}
                  onChange={(e) => setCreateCode(e.target.value)}
                  placeholder="예: SALES"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">부서명 *</div>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="예: 영업팀"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">설명</div>
                <input
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">부서장 이메일(선택)</div>
                <input
                  value={createManager}
                  onChange={(e) => setCreateManager(e.target.value)}
                  placeholder="manager@company.com"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              {createError ? <div className="text-sm text-destructive">{createError}</div> : null}
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setCreateOpen(false)}
                className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm"
              >
                취소
              </button>
              <button
                onClick={submitCreate}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit modal */}
      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background border border-border p-6">
            <div className="text-lg font-semibold">부서 수정</div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <div>
                <div className="text-sm font-medium mb-1">부서코드 *</div>
                <input
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">부서명 *</div>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">설명</div>
                <input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">부서장 이메일(선택)</div>
                <input
                  value={editManager}
                  onChange={(e) => setEditManager(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />
                활성
              </label>
              {editError ? <div className="text-sm text-destructive">{editError}</div> : null}
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm"
              >
                취소
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

