import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { RefreshCw, Check, X } from 'lucide-react'
import { Modal, FormInput, LoadingSpinner } from '../../components'

type PendingHalfDay = {
  id: number
  user_id: string
  user_name: string
  date: string
  leave_type: 'HALF_AM' | 'HALF_PM'
  leave_type_name: string
  compensation_date: string | null
  reason: string | null
  status: 'PENDING'
  requested_at: string
}

type PendingChange = {
  id: number
  user_id: string
  user_name: string
  week_start_date: string
  original_off_day: number
  original_off_day_name: string
  temporary_off_day: number
  temporary_off_day_name: string
  reason: string | null
  substitute_employee: string | null
  substitute_employee_name: string | null
  status: 'PENDING'
  requested_at: string
}

type ModalType = 'half-day' | 'change' | null

export default function HalfDayApproval() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const isManager = !!user?.role && ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'DEPT_MANAGER'].includes(user.role)

  const [loading, setLoading] = useState(true)
  const [halfDays, setHalfDays] = useState<PendingHalfDay[]>([])
  const [changes, setChanges] = useState<PendingChange[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType>(null)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [halfRes, changeRes] = await Promise.all([
        api.get('/api/staff/work-schedules/pending-half-days'),
        api.get('/api/staff/work-schedules/pending-changes'),
      ])

      setHalfDays(halfRes.data?.success ? (halfRes.data.data || []) : [])
      setChanges(changeRes.data?.success ? (changeRes.data.data || []) : [])
    } catch (e) {
      console.error('승인 목록 로드 오류:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isManager) {
      navigate('/dashboard')
      return
    }
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManager])

  const openHalfDayModal = (id: number) => {
    setModalError(null)
    setRejectionReason('')
    setModalType('half-day')
    setCurrentId(id)
    setModalOpen(true)
  }

  const openChangeModal = (id: number) => {
    setModalError(null)
    setRejectionReason('')
    setModalType('change')
    setCurrentId(id)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalType(null)
    setCurrentId(null)
    setRejectionReason('')
    setModalError(null)
  }

  const approve = async () => {
    if (!currentId || !modalType) return
    try {
      setModalError(null)
      const url =
        modalType === 'half-day'
          ? `/api/staff/work-schedules/approve-half-day/${currentId}`
          : `/api/staff/work-schedules/approve-change/${currentId}`
      const res = await api.post(url, { action: 'approve' })
      if (!res.data?.success) throw new Error(res.data?.message || '승인에 실패했습니다.')
      closeModal()
      await loadAll()
    } catch (e: any) {
      setModalError(e?.message || '승인 중 오류가 발생했습니다.')
    }
  }

  const reject = async () => {
    if (!currentId || !modalType) return
    try {
      setModalError(null)
      if (!rejectionReason.trim()) {
        setModalError('거부 사유를 입력해주세요.')
        return
      }
      const url =
        modalType === 'half-day'
          ? `/api/staff/work-schedules/approve-half-day/${currentId}`
          : `/api/staff/work-schedules/approve-change/${currentId}`
      const res = await api.post(url, { action: 'reject', rejection_reason: rejectionReason.trim() })
      if (!res.data?.success) throw new Error(res.data?.message || '거부에 실패했습니다.')
      closeModal()
      await loadAll()
    } catch (e: any) {
      setModalError(e?.message || '거부 중 오류가 발생했습니다.')
    }
  }

  const selectedHalfDay = modalType === 'half-day' ? halfDays.find((h) => h.id === currentId) : null
  const selectedChange = modalType === 'change' ? changes.find((c) => c.id === currentId) : null

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            승인 대기: 반차 <strong className="text-foreground">{halfDays.length}</strong>건 · 휴무일 변경{' '}
            <strong className="text-foreground">{changes.length}</strong>건
          </div>
          <button
            onClick={loadAll}
            className="px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border font-semibold">반차 승인 대기</div>
        {loading ? (
          <div className="p-6 flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : halfDays.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">승인 대기 중인 반차 신청이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">신청자</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">날짜</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">타입</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">사유</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">신청일</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {halfDays.map((h) => (
                  <tr key={h.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-sm">{h.user_name}</td>
                    <td className="px-4 py-3 text-sm">{h.date}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={[
                          'px-2 py-1 text-xs font-medium rounded-full',
                          h.leave_type === 'HALF_AM' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800',
                        ].join(' ')}
                      >
                        {h.leave_type_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{h.reason || '(사유 없음)'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(h.requested_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openHalfDayModal(h.id)}
                        className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm"
                      >
                        처리
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border font-semibold">휴무일 변경 승인 대기</div>
        {loading ? (
          <div className="p-6 flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : changes.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">승인 대기 중인 휴무일 변경 신청이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">신청자</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">주 시작일</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">변경</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">사유</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">대체자</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {changes.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-sm">{c.user_name}</td>
                    <td className="px-4 py-3 text-sm">{c.week_start_date}</td>
                    <td className="px-4 py-3 text-sm">
                      {c.original_off_day_name} → <strong>{c.temporary_off_day_name}</strong>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.reason || '(사유 없음)'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {c.substitute_employee_name || c.substitute_employee || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openChangeModal(c.id)}
                        className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm"
                      >
                        처리
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen ? (
        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          title="승인/거부 처리"
          maxWidth="lg"
          footer={
            <div className="flex gap-2 justify-end">
              <button
                onClick={reject}
                className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-muted text-xs font-medium inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                거부
              </button>
              <button
                onClick={approve}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-xs font-medium inline-flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                승인
              </button>
            </div>
          }
        >
          <div className="mt-4 text-xs space-y-2">
            {selectedHalfDay ? (
              <>
                <div>
                  <strong>신청자:</strong> {selectedHalfDay.user_name} ({selectedHalfDay.user_id})
                </div>
                <div>
                  <strong>날짜:</strong> {selectedHalfDay.date}
                </div>
                <div>
                  <strong>타입:</strong> {selectedHalfDay.leave_type_name}
                </div>
                {selectedHalfDay.reason ? (
                  <div>
                    <strong>사유:</strong> {selectedHalfDay.reason}
                  </div>
                ) : null}
                {selectedHalfDay.compensation_date ? (
                  <div>
                    <strong>보충일:</strong> {selectedHalfDay.compensation_date}
                  </div>
                ) : null}
              </>
            ) : null}

            {selectedChange ? (
              <>
                <div>
                  <strong>신청자:</strong> {selectedChange.user_name} ({selectedChange.user_id})
                </div>
                <div>
                  <strong>주 시작일:</strong> {selectedChange.week_start_date}
                </div>
                <div>
                  <strong>변경:</strong> {selectedChange.original_off_day_name} → {selectedChange.temporary_off_day_name}
                </div>
                {selectedChange.reason ? (
                  <div>
                    <strong>사유:</strong> {selectedChange.reason}
                  </div>
                ) : null}
                <div>
                  <strong>대체자:</strong> {selectedChange.substitute_employee_name || selectedChange.substitute_employee || '-'}
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-4">
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="거부 사유 (거부 시 필수)"
              rows={3}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {modalError ? <div className="mt-2 text-xs text-destructive">{modalError}</div> : null}
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

