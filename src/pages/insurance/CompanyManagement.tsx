import { useEffect, useState, useMemo, useRef } from 'react'
import { Plus } from 'lucide-react'
import api from '../../lib/api'
import {
  FilterBar,
  DataTable,
  type Column,
  useToastHelpers,
} from '../../components'

interface Manager {
  num: number
  name: string
}

interface Company {
  num: number
  company: string
  companyName?: string
  managerName?: string
  damdanga?: string
  hphone?: string
  cphone?: string
  FirstStartDay?: string
  date?: string
  memberCount?: number
  mRnum?: number
}

interface CompanyListResponse {
  success: boolean
  data: Company[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

interface ManagerListResponse {
  success: boolean
  data: Manager[]
  error?: string
}

const STATUS_OPTIONS = [
  { value: '1', label: '정상' },
  { value: '2', label: '전체' },
]

const PAGE_SIZE_OPTIONS = [
  { value: '20', label: '20개' },
  { value: '25', label: '25개' },
  { value: '50', label: '50개' },
  { value: '100', label: '100개' },
]

export default function CompanyManagement() {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [managers, setManagers] = useState<Manager[]>([])

  // 필터 상태
  const [filters, setFilters] = useState({
    status: '1', // 정상
    search: '', // 대리운전회사명
    manager: '', // 담당자
    date: '', // 날짜 (1-31일)
    pageSize: '25',
  })

  // 최신 filters 상태를 참조하기 위한 ref
  const filtersRef = useRef(filters)
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // 페이지네이션
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 25,
    totalCount: 0,
    totalPages: 1,
  })

  // 날짜 옵션 생성 (1-31일)
  const dateOptions = useMemo(() => {
    const options = []
    for (let i = 1; i <= 31; i++) {
      const day = String(i).padStart(2, '0')
      options.push({
        value: day,
        label: `${i}일`,
      })
    }
    return options
  }, [])

  // 담당자 옵션 생성
  const managerOptions = useMemo(() => {
    return [
      { value: '', label: '전체' },
      ...managers.map((m) => ({
        value: String(m.num),
        label: m.name || `담당자 ${m.num}`,
      })),
    ]
  }, [managers])

  // 담당자 목록 로드
  const loadManagers = async () => {
    try {
      const response = await api.get<ManagerListResponse>('/api/insurance/kj-company/managers')
      if (response.data.success) {
        setManagers(response.data.data || [])
      }
    } catch (error: any) {
      console.error('담당자 목록 로드 오류:', error)
      // 실패해도 계속 진행
    }
  }

  // 업체 목록 로드
  const loadCompanies = async (page?: number, pageSize?: number) => {
    try {
      setLoading(true)
      const currentPage = page !== undefined ? page : pagination.currentPage
      const currentPageSize = pageSize !== undefined ? pageSize : pagination.pageSize

      const params: any = {
        page: currentPage,
        limit: currentPageSize,
        currentInwon: filters.status,
      }

      if (filters.date) {
        params.getDay = filters.date
      }
      if (filters.manager) {
        params.damdanja = filters.manager
      }
      if (filters.search) {
        params.s_contents = filters.search
      }

      const response = await api.get<CompanyListResponse>('/api/insurance/kj-company/list', { params })

      if (response.data.success) {
        setCompanies(response.data.data || [])
        const paginationData = response.data.pagination
        setPagination({
          currentPage: paginationData?.page || currentPage,
          pageSize: paginationData?.limit || currentPageSize,
          totalCount: paginationData?.total || 0,
          totalPages: paginationData?.totalPages || 1,
        })
      } else {
        toast.error(response.data.error || '데이터를 불러오는 중 오류가 발생했습니다.')
        setCompanies([])
      }
    } catch (error: any) {
      console.error('업체 목록 로드 오류:', error)
      toast.error(error.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다.')
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  // 검색 실행
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
    loadCompanies(1, pagination.pageSize)
  }

  // 페이지 변경
  const handlePageChange = (page: number) => {
    loadCompanies(page, pagination.pageSize)
  }

  // 페이지 크기 변경
  const handlePageSizeChange = (newPageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize: String(newPageSize) }))
    setPagination((prev) => ({ ...prev, currentPage: 1, pageSize: newPageSize }))
    loadCompanies(1, newPageSize)
  }

  // 업체 상세 모달 열기 (나중에 구현)
  const handleOpenCompanyModal = (companyNum: number, companyName: string) => {
    console.log('업체 상세 모달 열기:', { companyNum, companyName })
    // TODO: 모달 구현
  }

  // 컬럼 정의
  const columns: Column<Company>[] = useMemo(
    () => [
      {
        key: 'index',
        header: '#',
        cell: (row) => {
          const index = companies.indexOf(row)
          const startIndex = (pagination.currentPage - 1) * pagination.pageSize
          return <div className="text-center whitespace-nowrap">{startIndex + index + 1}</div>
        },
        className: 'w-12 text-center whitespace-nowrap',
      },
      {
        key: 'company',
        header: '업체명',
        cell: (row) => {
          const companyName = row.company || row.companyName || ''
          return (
            <div className="whitespace-nowrap">
              <button
                onClick={() => handleOpenCompanyModal(row.num, companyName)}
                className="text-primary hover:underline"
              >
                {companyName}
              </button>
            </div>
          )
        },
        className: 'whitespace-nowrap',
      },
      {
        key: 'managerName',
        header: '담당자',
        cell: (row) => (
          <div className="hidden lg:table-cell whitespace-nowrap">
            {row.managerName || row.damdanga || ''}
          </div>
        ),
        className: 'hidden lg:table-cell whitespace-nowrap',
      },
      {
        key: 'phone',
        header: '연락처',
        cell: (row) => <div className="whitespace-nowrap">{row.hphone || row.cphone || ''}</div>,
        className: 'whitespace-nowrap',
      },
      {
        key: 'date',
        header: '날짜',
        cell: (row) => (
          <div className="whitespace-nowrap">{row.FirstStartDay || row.date || ''}</div>
        ),
        className: 'whitespace-nowrap',
      },
      {
        key: 'memberCount',
        header: '인원',
        cell: (row) => (
          <div className="text-center whitespace-nowrap">
            {(row.memberCount || row.mRnum || 0).toLocaleString('ko-KR')}명
          </div>
        ),
        className: 'text-center whitespace-nowrap',
      },
      {
        key: 'settlement',
        header: '정산',
        cell: (row) => {
          const companyName = row.company || row.companyName || ''
          return (
            <div className="text-center whitespace-nowrap">
              <button
                onClick={() => {
                  console.log('정산 모달 열기:', { companyNum: row.num, companyName })
                  // TODO: 정산 모달 구현
                }}
                className="px-3 py-1 text-xs border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors"
              >
                정산
              </button>
            </div>
          )
        },
        className: 'text-center whitespace-nowrap',
      },
    ],
    [companies, pagination]
  )

  // 초기화: 담당자 목록 로드 및 오늘 날짜 설정
  useEffect(() => {
    loadManagers()
    const today = new Date()
    const todayDay = String(today.getDate()).padStart(2, '0')
    setFilters((prev) => ({ ...prev, date: todayDay }))
  }, [])

  // 날짜 필터가 설정되면 자동으로 로드 (날짜만 변경 시)
  useEffect(() => {
    if (!filters.date) return

    const loadWithDate = async () => {
      try {
        setLoading(true)
        const currentFilters = filtersRef.current
        const params: any = {
          page: 1,
          limit: Number(currentFilters.pageSize),
          currentInwon: currentFilters.status,
          getDay: currentFilters.date,
        }

        if (currentFilters.manager) {
          params.damdanja = currentFilters.manager
        }
        if (currentFilters.search) {
          params.s_contents = currentFilters.search
        }

        const response = await api.get<CompanyListResponse>('/api/insurance/kj-company/list', { params })

        if (response.data.success) {
          setCompanies(response.data.data || [])
          const paginationData = response.data.pagination
          setPagination({
            currentPage: paginationData?.page || 1,
            pageSize: paginationData?.limit || Number(currentFilters.pageSize),
            totalCount: paginationData?.total || 0,
            totalPages: paginationData?.totalPages || 1,
          })
        } else {
          toast.error(response.data.error || '데이터를 불러오는 중 오류가 발생했습니다.')
          setCompanies([])
        }
      } catch (error: any) {
        console.error('업체 목록 로드 오류:', error)
        toast.error(error.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다.')
        setCompanies([])
      } finally {
        setLoading(false)
      }
    }

    loadWithDate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.date])

  // 대리운전회사 신규 버튼 클릭
  const handleAddCompany = () => {
    console.log('대리운전회사 신규 추가')
    // TODO: 신규 업체 추가 모달 구현
  }

  return (
    <div className="space-y-6">
      <FilterBar
        actionButtons={
          <button
            onClick={handleAddCompany}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">대리운전회사 신규</span>
            <span className="md:hidden">신규</span>
          </button>
        }
      >
        <FilterBar.Select
          value={filters.status}
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          options={STATUS_OPTIONS}
          className="w-24"
        />
        <FilterBar.Input
          value={filters.search}
          onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
          placeholder="대리운전회사명"
          onSearch={handleSearch}
          className="w-48"
        />
        <FilterBar.SearchButton onClick={handleSearch} />
        <FilterBar.Select
          value={filters.manager}
          onChange={(value) => setFilters((prev) => ({ ...prev, manager: value }))}
          options={managerOptions}
          className="w-40"
        />
        <FilterBar.Select
          value={filters.pageSize}
          onChange={(value) => {
            const newPageSize = Number(value)
            handlePageSizeChange(newPageSize)
          }}
          options={PAGE_SIZE_OPTIONS}
          className="w-24"
        />
        <FilterBar.Select
          value={filters.date}
          onChange={(value) => setFilters((prev) => ({ ...prev, date: value }))}
          options={dateOptions}
          className="w-24"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={companies}
        loading={loading}
        pagination={{
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalCount: pagination.totalCount,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
          pageSizeOptions: [20, 25, 50, 100],
        }}
        emptyMessage="날짜를 선택하면 업체 목록이 표시됩니다."
      />
    </div>
  )
}
