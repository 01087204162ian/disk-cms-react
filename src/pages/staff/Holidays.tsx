import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { RefreshCw, Plus, Wand2, BadgeCheck, Pencil, Trash2 } from 'lucide-react'

type Holiday = {
  id: number
  date: string
  name: string
  year: number
  isActive: boolean
}

function toYmd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Holidays() {
  const { user } = useAuthStore()
  const isAdmin = !!user?.role && ['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(user.role)

  const baseYear = useMemo(() => new Date().getFullYear(), [])
  const years = useMemo(() => [baseYear - 1, baseYear, baseYear + 1], [baseYear])

  const [loading, setLoading] = useState(true)
  const [holidaysByYear, setHolidaysByYear] = useState<Record<number, Holiday[]>>({})
  const [message, setMessage] = useState<string | null>(null)

  // add modal
  const [addOpen, setAddOpen] = useState(false)
  const [addDate, setAddDate] = useState('')
  const [addName, setAddName] = useState('')
  const [addError, setAddError] = useState<string | null>(null)

  // edit modal
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [editError, setEditError] = useState<string | null>(null)

  const loadYear = async (year: number) => {
    const res = await api.get('/api/staff/holidays', { params: { year } })
    if (!res.data?.success) throw new Error(res.data?.message || '공휴일 조회 실패')
    return (res.data.data || []) as Holiday[]
  }

  const loadAll = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const results = await Promise.all(years.map((y) => loadYear(y)))
      const next: Record<number, Holiday[]> = {}
      years.forEach((y, idx) => {
        next[y] = results[idx]
      })
      setHolidaysByYear(next)
    } catch (e: any) {
      console.error(e)
      setMessage(e?.message || '공휴일을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openAdd = () => {
    setAddError(null)
    setAddDate('')
    setAddName('')
    setAddOpen(true)
  }

  const submitAdd = async () => {
    try {
      setAddError(null)
      if (!addDate || !addName.trim()) {
        setAddError('날짜와 공휴일명을 입력해주세요.')
        return
      }
      const y = new Date(addDate).getFullYear()
      const res = await api.post('/api/staff/holidays', { date: addDate, name: addName.trim(), year: y })
      if (!res.data?.success) throw new Error(res.data?.message || '추가에 실패했습니다.')
      setAddOpen(false)
      await loadAll()
    } catch (e: any) {
      setAddError(e?.message || '추가 중 오류가 발생했습니다.')
    }
  }

  const openEdit = (h: Holiday) => {
    setEditError(null)
    setEditId(h.id)
    setEditName(h.name)
    setEditIsActive(!!h.isActive)
    setEditOpen(true)
  }

  const submitEdit = async () => {
    try {
      setEditError(null)
      if (!editId) return
      if (!editName.trim()) {
        setEditError('공휴일명을 입력해주세요.')
        return
      }
      const res = await api.put(`/api/staff/holidays/${editId}`, { name: editName.trim(), isActive: editIsActive })
      if (!res.data?.success) throw new Error(res.data?.message || '수정에 실패했습니다.')
      setEditOpen(false)
      await loadAll()
    } catch (e: any) {
      setEditError(e?.message || '수정 중 오류가 발생했습니다.')
    }
  }

  const deactivate = async (id: number) => {
    if (!confirm('공휴일을 비활성화(삭제)할까요?')) return
    try {
      const res = await api.delete(`/api/staff/holidays/${id}`)
      if (!res.data?.success) throw new Error(res.data?.message || '삭제에 실패했습니다.')
      await loadAll()
    } catch (e: any) {
      alert(e?.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  const generateSubstitute = async (year: number) => {
    try {
      const res = await api.post('/api/staff/holidays/generate-substitute', { year })
      if (!res.data?.success) throw new Error(res.data?.message || '생성에 실패했습니다.')
      setMessage(res.data?.message || '대체 공휴일 생성 완료')
      await loadAll()
    } catch (e: any) {
      alert(e?.message || '대체 공휴일 생성 중 오류가 발생했습니다.')
    }
  }

  const validateYear = async (year: number) => {
    try {
      const res = await api.get('/api/staff/holidays/validate', { params: { year } })
      if (!res.data?.success) throw new Error(res.data?.message || '검증에 실패했습니다.')
      const summary = res.data?.data?.summary
      setMessage(
        summary
          ? `검증 완료: 오류 ${summary.errors} / 경고 ${summary.warnings}`
          : (res.data?.message || '검증 완료')
      )
    } catch (e: any) {
      alert(e?.message || '검증 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            최근 3개년 공휴일을 조회합니다. {isAdmin ? '관리자 권한으로 추가/수정/비활성화가 가능합니다.' : null}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin ? (
              <>
                <button
                  onClick={openAdd}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  공휴일 추가
                </button>
                <button
                  onClick={() => generateSubstitute(baseYear)}
                  className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm inline-flex items-center gap-2"
                  title="올해 기준 생성"
                >
                  <Wand2 className="w-4 h-4" />
                  대체공휴일 생성
                </button>
                <button
                  onClick={() => validateYear(baseYear)}
                  className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm inline-flex items-center gap-2"
                  title="올해 기준 검증"
                >
                  <BadgeCheck className="w-4 h-4" />
                  데이터 검증
                </button>
              </>
            ) : null}
            <button
              onClick={loadAll}
              className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
          </div>
        </div>
        {message ? <div className="mt-3 text-sm text-muted-foreground">{message}</div> : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {years.map((y) => (
          <div key={y} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="font-semibold">{y}년</div>
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateSubstitute(y)}
                    className="px-2 py-2 rounded-lg border border-input bg-background hover:bg-muted"
                    title="대체공휴일 생성"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => validateYear(y)}
                    className="px-2 py-2 rounded-lg border border-input bg-background hover:bg-muted"
                    title="데이터 검증"
                  >
                    <BadgeCheck className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
            </div>

            <div className="max-h-[620px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-sm text-muted-foreground">불러오는 중...</div>
              ) : (holidaysByYear[y] || []).length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">데이터가 없습니다.</div>
              ) : (
                <div className="divide-y divide-border">
                  {(holidaysByYear[y] || []).map((h) => (
                    <div key={h.id} className="p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">
                          <span className={h.isActive ? '' : 'line-through text-muted-foreground'}>{h.date}</span>
                        </div>
                        <div className="text-sm mt-1">
                          <span className={h.isActive ? '' : 'line-through text-muted-foreground'}>{h.name}</span>
                        </div>
                        {!h.isActive ? (
                          <div className="mt-1 text-xs text-muted-foreground">비활성</div>
                        ) : null}
                      </div>
                      {isAdmin ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => openEdit(h)}
                            className="px-2 py-2 rounded-lg border border-input bg-background hover:bg-muted"
                            title="수정"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deactivate(h.id)}
                            className="px-2 py-2 rounded-lg border border-input bg-background hover:bg-muted"
                            title="비활성화"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add modal */}
      {addOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background border border-border overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-4 flex items-center justify-between">
              <h5 className="text-lg font-semibold text-white m-0">공휴일 추가</h5>
              <button
                onClick={() => setAddOpen(false)}
                className="text-white hover:bg-white/10 rounded p-1 text-xl leading-none transition-colors"
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            {/* 본문 */}
            <div className="p-6 bg-white">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <input
                    type="date"
                    value={addDate}
                    onChange={(e) => setAddDate(e.target.value)}
                    max={toYmd(new Date(baseYear + 1, 11, 31))}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="공휴일명 * (예: 신정)"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {addError ? <div className="text-xs text-destructive">{addError}</div> : null}
              </div>
              <div className="mt-6 flex gap-2 justify-end">
                <button
                  onClick={submitAdd}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-xs"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit modal */}
      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background border border-border overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-4 flex items-center justify-between">
              <h5 className="text-lg font-semibold text-white m-0">공휴일 수정</h5>
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
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="공휴일명 *"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                  />
                  활성
                </label>
                {editError ? <div className="text-xs text-destructive">{editError}</div> : null}
              </div>
              <div className="mt-6 flex gap-2 justify-end">
                <button
                  onClick={submitEdit}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-xs"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

