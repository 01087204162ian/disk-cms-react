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

type FilterState = {
  fromDate: string
  toDate: string
  partner: string
  type: 'all' | 'application' | 'consultation'
  keywordType: 'name' | 'phone' | 'id'
  keyword: string
}

const DbPersonalDriver: React.FC = () => {
  const [rows, setRows] = useState<ApplicationRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    fromDate: '',
    toDate: '',
    partner: '',
    type: 'all',
    keywordType: 'name',
    keyword: '',
  })

  useEffect(() => {
    let cancelled = false

    const fetchApplications = async (currentFilters: FilterState) => {
      try {
        setLoading(true)
        setError(null)

        // 프록시 경유:
        // 프론트 → /api/insurance/db-personal-driver/applications → 서버(Node) → dbins.kr API
        const res = await api.get('/api/insurance/db-personal-driver/applications', {
          params: {
            from: currentFilters.fromDate || undefined,
            to: currentFilters.toDate || undefined,
            partner: currentFilters.partner || undefined,
            type: currentFilters.type !== 'all' ? currentFilters.type : undefined,
            keywordType: currentFilters.keyword ? currentFilters.keywordType : undefined,
            keyword: currentFilters.keyword || undefined,
          },
        })

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

    // 초기 로드 시 한 번 호출
    fetchApplications(filters)

    return () => {
      cancelled = true
    }
  }, [])

  const handleSearch = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get('/api/insurance/db-personal-driver/applications', {
        params: {
          from: filters.fromDate || undefined,
          to: filters.toDate || undefined,
          partner: filters.partner || undefined,
          type: filters.type !== 'all' ? filters.type : undefined,
          keywordType: filters.keyword ? filters.keywordType : undefined,
          keyword: filters.keyword || undefined,
        },
      })
      if (!res.data?.ok) {
        throw new Error(res.data?.error || 'LOAD_FAILED')
      }
      setRows(res.data.data || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'LOAD_FAILED'
      setError(`가입신청 목록을 불러오지 못했습니다. (${msg})`)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      partner: '',
      type: 'all',
      keywordType: 'name',
      keyword: '',
    })
    // 초기 상태로 재조회
    void handleSearch()
  }
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">DB 개인대리운전</h1>
        <p className="text-sm text-muted-foreground">
          dbins.kr 에서 들어온 가입신청/상담신청 데이터를 조회·관리하는 운영 페이지입니다.
        </p>
      </header>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold mb-4">가입신청 목록</h2>
        <p className="text-sm text-muted-foreground mb-4">
          daeri/www 의 <code>applications</code> 테이블(비민감 컬럼)을 조회합니다. 상단 필터를 이용해 기간/파트너/검색어
          등을 지정할 수 있습니다.
        </p>

        {/* 필터 영역 */}
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          {/* 기간 필터 */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">접수일자</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={filters.fromDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
              />
              <span className="text-xs text-muted-foreground">~</span>
              <input
                type="date"
                className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={filters.toDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
              />
            </div>
          </div>

          {/* 파트너 필터 */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">파트너</label>
            <select
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
              value={filters.partner}
              onChange={(e) => setFilters((prev) => ({ ...prev, partner: e.target.value }))}
            >
              <option value="">전체</option>
              <option value="default">default</option>
              {/* 필요 시 kakao, naver 등 파트너 코드 추가 */}
            </select>
          </div>

          {/* 유형 필터 */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">유형</label>
            <select
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value as FilterState['type'] }))
              }
            >
              <option value="all">전체</option>
              <option value="application">가입신청</option>
              <option value="consultation">상담신청</option>
            </select>
          </div>

          {/* 검색 필터 */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">검색</label>
            <div className="flex items-center gap-2">
              <select
                className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={filters.keywordType}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    keywordType: e.target.value as FilterState['keywordType'],
                  }))
                }
              >
                <option value="name">이름</option>
                <option value="phone">전화번호</option>
                <option value="id">신청ID</option>
              </select>
              <input
                type="text"
                className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs"
                placeholder="검색어 입력"
                value={filters.keyword}
                onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mb-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-border bg-background px-3 py-1 text-xs"
            onClick={handleReset}
          >
            초기화
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
            onClick={handleSearch}
          >
            검색
          </button>
        </div>

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

