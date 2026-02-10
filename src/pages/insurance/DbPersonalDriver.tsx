import React, { useEffect, useState } from 'react'
import api from '../../lib/api'

/**
 * DB 개인대리운전 관리 페이지 (dbins.kr 연동 예정)
 *
 * - 위치: 보험상품 > 대리운전 > DB개인대리운전
 * - 역할: dbins.kr(daeri/www) 에서 들어온 가입신청/상담신청 데이터를 조회·관리하는 운영 화면
 * - 현재: 화면 뼈대만 구성, 실제 데이터 연동은 daeri 쪽 API 설계 후 진행
 */

type ApplicationRow = {
  id: string
  insurance_type: string
  name: string
  phone: string
  yearly_premium: string | null
  first_premium: string | null
  address: string | null
  address_detail: string | null
  is_same_person: 0 | 1
  contractor_name: string | null
  contractor_phone: string | null
  bank_name: string | null
  consent_privacy: 0 | 1
  ip: string | null
  user_agent: string | null
  created_at: string
}

const DbPersonalDriver: React.FC = () => {
  const [rows, setRows] = useState<ApplicationRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchApplications = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await api.get('/api/admin/applications.php')
        if (!res.data?.ok) {
          throw new Error(res.data?.error || 'LOAD_FAILED')
        }
        if (!cancelled) {
          setRows(res.data.data || [])
        }
      } catch (err) {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : 'LOAD_FAILED'
        setError(`가입신청 목록을 불러오지 못했습니다. (${msg})`)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchApplications()

    return () => {
      cancelled = true
    }
  }, [])
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">DB 개인대리운전</h1>
        <p className="text-sm text-muted-foreground">
          dbins.kr 에서 들어온 가입신청/상담신청 데이터를 조회·관리하는 페이지입니다. 현재는 화면 뼈대만
          구성된 상태이며, 이후 daeri 백엔드(API) 연동 후 실제 데이터가 표시됩니다.
        </p>
      </header>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold mb-4">가입신청 목록</h2>
        <p className="text-sm text-muted-foreground mb-4">
          daeri/www 의 <code>applications</code> 테이블(비민감 컬럼)을 그대로 보여줍니다. 현재는 필터 없이
          최신 신청 순으로 전체 목록을 확인할 수 있습니다.
        </p>

        {loading && (
          <p className="text-sm text-muted-foreground mb-2">목록을 불러오는 중입니다...</p>
        )}
        {error && (
          <p className="text-sm text-red-600 mb-2">
            {error}
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border border-dashed border-border bg-background/40">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">created_at</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">insurance_type</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">name</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">phone</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">yearly_premium</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">first_premium</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">address</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">address_detail</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">is_same_person</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">contractor_name</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">contractor_phone</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">bank_name</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">consent_privacy</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">ip</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">user_agent</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-2 text-muted-foreground" colSpan={15}>
                    {loading ? '목록을 불러오는 중입니다...' : '표시할 가입신청 데이터가 없습니다.'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-border/60">
                    <td className="px-3 py-2 whitespace-nowrap">{row.created_at}</td>
                    <td className="px-3 py-2">{row.insurance_type}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.phone}</td>
                    <td className="px-3 py-2 text-right">
                      {row.yearly_premium ? Number(row.yearly_premium).toLocaleString('ko-KR') : '-'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.first_premium ? Number(row.first_premium).toLocaleString('ko-KR') : '-'}
                    </td>
                    <td className="px-3 py-2">{row.address}</td>
                    <td className="px-3 py-2">{row.address_detail}</td>
                    <td className="px-3 py-2 text-center">{row.is_same_person ? '동일' : '상이'}</td>
                    <td className="px-3 py-2">{row.contractor_name}</td>
                    <td className="px-3 py-2">{row.contractor_phone}</td>
                    <td className="px-3 py-2">{row.bank_name}</td>
                    <td className="px-3 py-2 text-center">{row.consent_privacy ? '동의' : '미동의'}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{row.ip}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground max-w-xs truncate">
                      {row.user_agent}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DbPersonalDriver

