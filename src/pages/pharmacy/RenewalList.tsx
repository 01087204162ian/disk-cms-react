import { useEffect, useState, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import api from '../../lib/api'
import {
  FilterBar,
  DataTable,
  type Column,
  useToastHelpers,
} from '../../components'

interface RenewalItem {
  id: number
  num: number
  company_name: string
  business_number: string
  chemist_name?: string
  phone?: string
  contact?: string
  insurance_start_date?: string
  insurance_end_date?: string
  renewal_start_date?: string
  renewal_end_date?: string
  renewal_intent?: 'Y' | 'N' | '갱신전해지'
  previous_premium?: number
  renewal_premium?: number
  has_changes?: 'Y' | 'N'
  change_details?: string
  work_status?: string
  renewal_certificate_number?: string
  memo?: string
  days_until_expiry?: number | null
}

const EXPIRY_FILTER_OPTIONS = [
  { value: '', label: '전체' },
  { value: '30', label: '만기 30일 전' },
  { value: '15', label: '만기 15일 전' },
  { value: '7', label: '만기 7일 전' },
]

export default function RenewalList() {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(true)
  const [renewals, setRenewals] = useState<RenewalItem[]>([])
  const [accounts, setAccounts] = useState<Array<{ value: string; label: string }>>([])

  // 필터 상태
  const [filters, setFilters] = useState({
    account: '',
    expiry_filter: '', // 만기 필터
    pageSize: '20',
    search: '',
  })

  // 페이지네이션
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
  })

  // 거래처 목록 로드
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await api.get('/api/pharmacy/accounts')
        if (res.data?.success && res.data?.data) {
          const accountOptions = res.data.data.map((acc: any) => ({
            value: String(acc.num),
            label: acc.directory || acc.name || `거래처 ${acc.num}`,
          }))
          setAccounts(accountOptions)
        }
      } catch (error) {
        console.error('거래처 목록 로드 오류:', error)
      }
    }
    loadAccounts()
  }, [])

  // 데이터 로드
  const loadRenewals = async (page?: number, pageSize?: number) => {
    try {
      setLoading(true)
      const currentPage = page !== undefined ? page : pagination.currentPage
      const currentPageSize = pageSize !== undefined ? pageSize : pagination.pageSize
      const params: any = {
        page: currentPage,
        limit: currentPageSize,
      }
      if (filters.account) params.account = filters.account
      if (filters.expiry_filter) params.expiry_filter = filters.expiry_filter
      if (filters.search) params.search = filters.search

      console.log('갱신리스트 API 요청 파라미터:', params)
      const res = await api.get('/api/pharmacy2/renewal-list', { params })
      console.log('갱신리스트 API 응답:', res.data)

      if (res.data?.success) {
        const data = res.data.data || []
        setRenewals(data)

        const totalCount = res.data.pagination?.totalCount || res.data.pagination?.total_count || 0
        setPagination((prev) => ({
          ...prev,
          totalCount: totalCount,
        }))
      }
    } catch (error: any) {
      console.error('갱신리스트 로드 오류:', error)
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          '갱신리스트를 불러오는데 실패했습니다.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 초기 로드
  useEffect(() => {
    loadRenewals()
  }, [])

  // 필터 변경 시 자동 검색
  useEffect(() => {
    if (!loading) {
      loadRenewals(1, pagination.pageSize)
    }
  }, [filters.account, filters.expiry_filter, filters.search])

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
    loadRenewals(page, pagination.pageSize)
  }

  // 페이지 크기 변경
  const handlePageSizeChange = (newPageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize: String(newPageSize) }))
    setPagination((prev) => ({ ...prev, currentPage: 1, pageSize: newPageSize }))
    loadRenewals(1, newPageSize)
  }

  // 날짜 포맷팅 (YYYY-MM-DD → YYYY.MM.DD)
  const formatDate = (dateStr?: string): string => {
    if (!dateStr || dateStr === '-') return '-'
    return dateStr.replace(/-/g, '.')
  }

  // 보험기간 포맷팅 (시작일 ~ 종료일)
  const formatInsurancePeriod = (start?: string, end?: string): string => {
    const startFormatted = formatDate(start)
    const endFormatted = formatDate(end)
    if (startFormatted === '-' && endFormatted === '-') return '-'
    return `${startFormatted} ~ ${endFormatted}`
  }

  // 금액 포맷팅
  const formatPremium = (premium?: number): string => {
    if (!premium) return '0'
    return premium.toLocaleString('ko-KR')
  }

  // 만기 임박 색상 처리
  const getExpiryColor = (days?: number | null): string => {
    if (!days || days < 0) return ''
    if (days <= 7) return 'text-red-600 font-semibold'
    if (days <= 15) return 'text-orange-600'
    if (days <= 30) return 'text-yellow-600'
    return ''
  }

  // 갱신 의사 색상 처리
  const getRenewalIntentColor = (intent?: string): string => {
    if (intent === 'Y') return 'bg-green-100 text-green-800'
    if (intent === 'N') return 'bg-orange-100 text-orange-800'
    if (intent === '갱신전해지') return 'bg-gray-100 text-gray-500'
    return ''
  }

  // 테이블 컬럼 정의
  const columns: Column<RenewalItem>[] = useMemo(
    () => [
      {
        key: 'company_name',
        header: '약국명',
        cell: (row) => (
          <div className="font-medium">{row.company_name || '-'}</div>
        ),
      },
      {
        key: 'business_number',
        header: '사업자번호',
        cell: (row) => (
          <div className="text-xs">{row.business_number || '-'}</div>
        ),
      },
      {
        key: 'chemist_name',
        header: '약사명',
        cell: (row) => (
          <div className="text-xs">{row.chemist_name || '-'}</div>
        ),
      },
      {
        key: 'contact',
        header: '연락처',
        cell: (row) => (
          <div className="text-xs">{row.phone || row.contact || '-'}</div>
        ),
      },
      {
        key: 'insurance_period',
        header: '기존 보험기간',
        cell: (row) => (
          <div className={`text-xs ${getExpiryColor(row.days_until_expiry)}`}>
            {formatInsurancePeriod(row.insurance_start_date, row.insurance_end_date)}
          </div>
        ),
      },
      {
        key: 'renewal_period',
        header: '갱신 후 보험기간',
        cell: (row) => (
          <div className="text-xs">
            {formatInsurancePeriod(row.renewal_start_date, row.renewal_end_date)}
          </div>
        ),
      },
      {
        key: 'renewal_intent',
        header: '갱신 의사',
        cell: (row) => {
          const intent = row.renewal_intent || ''
          const colorClass = getRenewalIntentColor(intent)
          return (
            <div className={`text-xs px-2 py-1 rounded ${colorClass}`}>
              {intent || '-'}
            </div>
          )
        },
      },
      {
        key: 'previous_premium',
        header: '기존 보험료',
        cell: (row) => (
          <div className="text-xs text-right">{formatPremium(row.previous_premium)}</div>
        ),
        className: 'text-end',
      },
      {
        key: 'renewal_premium',
        header: '갱신 보험료',
        cell: (row) => (
          <div className="text-xs text-right">{formatPremium(row.renewal_premium)}</div>
        ),
        className: 'text-end',
      },
      {
        key: 'has_changes',
        header: '변경사항 유무',
        cell: (row) => (
          <div className="text-xs">{row.has_changes === 'Y' ? '있음' : row.has_changes === 'N' ? '없음' : '-'}</div>
        ),
      },
      {
        key: 'change_details',
        header: '변경 내용',
        cell: (row) => (
          <div className="text-xs max-w-xs truncate" title={row.change_details}>
            {row.change_details || '-'}
          </div>
        ),
      },
      {
        key: 'work_status',
        header: '업무상태',
        cell: (row) => (
          <div className="text-xs">{row.work_status || '-'}</div>
        ),
      },
      {
        key: 'renewal_certificate_number',
        header: '갱신 증권번호',
        cell: (row) => (
          <div className="text-xs">{row.renewal_certificate_number || '-'}</div>
        ),
      },
      {
        key: 'memo',
        header: '담당자 메모',
        cell: (row) => (
          <div className="text-xs max-w-xs truncate" title={row.memo}>
            {row.memo || '-'}
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-4">
      {/* 필터 영역 */}
      <FilterBar>
        <FilterBar.Select
          value={filters.account}
          onChange={(e) => setFilters((prev) => ({ ...prev, account: e.target.value }))}
          options={[{ value: '', label: '전체 거래처' }, ...accounts]}
        />
        <FilterBar.Select
          value={filters.expiry_filter}
          onChange={(e) => setFilters((prev) => ({ ...prev, expiry_filter: e.target.value }))}
          options={EXPIRY_FILTER_OPTIONS}
        />
        <FilterBar.Input
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          placeholder="약국명, 사업자번호, 약사명 검색"
        />
        <FilterBar.Select
          value={filters.pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          options={[
            { value: '20', label: '20개' },
            { value: '50', label: '50개' },
            { value: '100', label: '100개' },
          ]}
        />
        <FilterBar.SearchButton onClick={() => loadRenewals(1, pagination.pageSize)} />
        <FilterBar.Stats>
          총 {pagination.totalCount.toLocaleString('ko-KR')}건
        </FilterBar.Stats>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => loadRenewals()}
            className="px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            새로고침
          </button>
        </div>
      </FilterBar>

      {/* 테이블 영역 */}
      <DataTable
        columns={columns}
        data={renewals}
        loading={loading}
        pagination={{
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalCount: pagination.totalCount,
          onPageChange: handlePageChange,
        }}
      />
    </div>
  )
}
