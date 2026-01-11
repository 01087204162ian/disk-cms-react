import { useEffect, useState, useMemo } from 'react'
import api from '../../lib/api'
import {
  FilterBar,
  DataTable,
  type Column,
  useToastHelpers,
  DatePicker,
} from '../../components'
import { GITA_OPTIONS, mapPushLabel, removePhoneHyphen } from './constants'

interface Driver {
  num: number
  Name: string
  Jumin: string
  age?: number
  push: number
  cancel?: string | number
  sangtae?: string | number
  etag: number
  companyName?: string
  companyNum?: string
  InsuranceCompany?: string
  insuranceCompanyName?: string
  policyNum?: string
  personRateFactor?: number | string
  personRateName?: string
  Hphone?: string
  InputDay?: string
  OutPutDay?: string
  sago: number
  CertiTableNum?: string
}

interface DriverSearchResponse {
  success: boolean
  data: Driver[]
  total?: number
  total_count?: number
  page?: number
  limit?: number
  totalPages?: number
}

const SEARCH_TYPE_OPTIONS = [
  { value: '이름', label: '이름' },
  { value: '주민번호', label: '주민번호' },
]

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: '정상', label: '정상' },
]

const PAGE_SIZE_OPTIONS = [
  { value: '20', label: '20개' },
  { value: '50', label: '50개' },
  { value: '100', label: '100개' },
]

export default function DriverSearch() {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [drivers, setDrivers] = useState<Driver[]>([])

  // 필터 상태
  const [filters, setFilters] = useState({
    searchType: '이름',
    status: '',
    pageSize: '20',
    terminationDate: '',
    search: '',
  })

  // 페이지네이션
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
  })

  // 데이터 로드
  const loadDrivers = async (page?: number, pageSize?: number) => {
    try {
      setLoading(true)
      const currentPage = page !== undefined ? page : pagination.currentPage
      const currentPageSize = pageSize !== undefined ? pageSize : pagination.pageSize
      
      const params: any = {
        page: currentPage,
        limit: currentPageSize,
      }

      // 검색 기준에 따라 name 또는 jumin 파라미터 설정
      if (filters.search) {
        if (filters.searchType === '이름') {
          params.name = filters.search
        } else {
          params.jumin = filters.search
        }
      }

      if (filters.status) {
        params.status = filters.status === '정상' ? '4' : filters.status
      }

      const res = await api.get<DriverSearchResponse>('/api/insurance/kj-driver/list', { params })

      if (res.data.success) {
        setDrivers(res.data.data || [])
        setPagination({
          currentPage: res.data.page || currentPage,
          pageSize: res.data.limit || currentPageSize,
          totalCount: res.data.total || res.data.total_count || 0,
          totalPages: res.data.totalPages || Math.ceil((res.data.total || res.data.total_count || 0) / (res.data.limit || currentPageSize)),
        })
      } else {
        toast.error('데이터를 불러오는 중 오류가 발생했습니다.')
        setDrivers([])
      }
    } catch (error: any) {
      console.error('기사 목록 로드 오류:', error)
      toast.error(error.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다.')
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }

  // 초기 로드는 자동으로 하지 않음 (검색어 입력 필요)
  // useEffect(() => {
  //   loadDrivers()
  // }, [])

  // 검색 실행 (입력 시 자동 검색)
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
    loadDrivers(1, pagination.pageSize)
  }
  
  // 검색어 변경 시 자동 검색
  useEffect(() => {
    if (filters.search) {
      const timer = setTimeout(() => {
        handleSearch()
      }, 500) // 500ms 디바운스
      return () => clearTimeout(timer)
    }
  }, [filters.search, filters.searchType])
  
  // 상태 필터 변경 시 자동 검색
  useEffect(() => {
    if (filters.status !== undefined) {
      handleSearch()
    }
  }, [filters.status])

  // 페이지 변경
  const handlePageChange = (page: number) => {
    loadDrivers(page, pagination.pageSize)
  }

  // 페이지 크기 변경
  const handlePageSizeChange = (newPageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize: String(newPageSize) }))
    setPagination((prev) => ({ ...prev, currentPage: 1, pageSize: newPageSize }))
    loadDrivers(1, newPageSize)
  }

  // 상태 변경 (인라인 편집)
  const handleStatusChange = async (num: number, before: number, after: number) => {
    // TODO: 상태 변경 로직 구현 (정상 → 해지 등)
    console.log('상태 변경:', { num, before, after })
  }

  // 증권성격 변경 (인라인 편집)
  const handleEtagChange = async (num: number, etag: number) => {
    // TODO: 증권성격 변경 로직 구현
    console.log('증권성격 변경:', { num, etag })
  }

  // 핸드폰 변경 (인라인 편집)
  const handlePhoneChange = async (num: number, phone: string) => {
    // TODO: 핸드폰 변경 로직 구현
    console.log('핸드폰 변경:', { num, phone })
  }

  // 사고 변경 (인라인 편집)
  const handleSagoChange = async (num: number, sago: number) => {
    // TODO: 사고 변경 로직 구현
    console.log('사고 변경:', { num, sago })
  }

  // 테이블 컬럼 정의
  const columns: Column<Driver>[] = useMemo(
    () => [
      {
        key: 'index',
        header: '#',
        cell: (row) => {
          const index = drivers.indexOf(row)
          const startIndex = (pagination.currentPage - 1) * pagination.pageSize
          return <div className="text-center">{startIndex + index + 1}</div>
        },
        className: 'w-16 text-center',
      },
      {
        key: 'Name',
        header: '이름',
        cell: (row) => <div>{row.Name || ''}</div>,
      },
      {
        key: 'Jumin',
        header: '주민번호',
        cell: (row) => (
          <div className="hidden lg:table-cell">
            {row.Jumin || ''}
            {row.age ? ` (${row.age}세)` : ''}
          </div>
        ),
        className: 'hidden lg:table-cell',
      },
      {
        key: 'status',
        header: '상태',
        cell: (row) => {
          const push = Number(row.push)
          const cancel = row.cancel != null ? String(row.cancel) : ''
          const sangtae = row.sangtae != null ? String(row.sangtae) : ''

          // push=4이고 cancel=42이고 sangtae=1이면 "해지중" 표시
          const cancelNum = typeof cancel === 'string' ? Number(cancel) : cancel
          const sangtaeNum = typeof sangtae === 'string' ? Number(sangtae) : sangtae
          if (push === 4 && cancelNum === 42 && sangtaeNum === 1) {
            return <span>해지중</span>
          }

          // 정상일 때만 select 제공
          if (push === 4) {
            return (
              <select
                className="w-full text-xs px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                defaultValue={push}
                onChange={(e) => handleStatusChange(row.num, push, Number(e.target.value))}
              >
                <option value="4">정상</option>
                <option value="2">해지</option>
              </select>
            )
          }

          return <span>{mapPushLabel(push)}</span>
        },
      },
      {
        key: 'etag',
        header: '증권성격',
        cell: (row) => {
          const etag = Number(row.etag || 0)
          return (
            <select
              className="w-full text-xs px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring hidden lg:table-cell"
              defaultValue={etag}
              onChange={(e) => handleEtagChange(row.num, Number(e.target.value))}
            >
              {GITA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )
        },
        className: 'hidden lg:table-cell',
      },
      {
        key: 'company',
        header: '대리운전회사',
        cell: (row) => {
          const companyText = (row.companyName || '') + (row.companyNum ? ` (${row.companyNum})` : '')
          return (
            <a
              href="#"
              className="text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // TODO: 회사 정보 모달 열기
                console.log('회사 정보 모달:', row.companyNum)
              }}
            >
              {companyText}
            </a>
          )
        },
      },
      {
        key: 'InsuranceCompany',
        header: '보험회사',
        cell: (row) => <div>{row.insuranceCompanyName || row.InsuranceCompany || ''}</div>,
      },
      {
        key: 'policyNum',
        header: '증권번호',
        cell: (row) => <div>{row.policyNum || ''}</div>,
      },
      {
        key: 'discount',
        header: '할인할증',
        cell: (row) => {
          const rateText = row.personRateFactor != null ? String(row.personRateFactor) : ''
          const nameText = row.personRateName ? ` (${row.personRateName})` : ''
          return <div>{rateText + nameText}</div>
        },
      },
      {
        key: 'Hphone',
        header: '핸드폰',
        cell: (row) => {
          const phone = row.Hphone || ''
          return (
            <input
              type="text"
              className="w-full text-xs px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring hidden lg:table-cell"
              defaultValue={phone}
              onBlur={(e) => {
                const cleaned = removePhoneHyphen(e.target.value.trim())
                if (cleaned !== removePhoneHyphen(phone)) {
                  handlePhoneChange(row.num, cleaned)
                } else {
                  e.target.value = phone
                }
              }}
              onFocus={(e) => {
                e.target.value = removePhoneHyphen(e.target.value)
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )
        },
        className: 'hidden lg:table-cell',
      },
      {
        key: 'InputDay',
        header: '등록일',
        cell: (row) => <div className="hidden lg:table-cell">{row.InputDay || ''}</div>,
        className: 'hidden lg:table-cell',
      },
      {
        key: 'OutPutDay',
        header: '해지일',
        cell: (row) => <div className="hidden lg:table-cell">{row.OutPutDay || '-'}</div>,
        className: 'hidden lg:table-cell',
      },
      {
        key: 'sago',
        header: '사고',
        cell: (row) => {
          const sago = Number(row.sago || 0)
          return (
            <select
              className="w-full text-xs px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              defaultValue={sago}
              onChange={(e) => handleSagoChange(row.num, Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="1">사고없음</option>
              <option value="2">사고있음</option>
            </select>
          )
        },
      },
    ],
    [drivers, pagination.currentPage, pagination.pageSize]
  )

  // 해지기준일 기본값 설정 (오늘 날짜)
  useEffect(() => {
    if (!filters.terminationDate) {
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      setFilters((prev) => ({ ...prev, terminationDate: todayStr }))
    }
  }, [])

  // 검색 실행
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
    loadDrivers(1, pagination.pageSize)
  }

  return (
    <div className="space-y-6">
      <FilterBar>
        <FilterBar.Select
          value={filters.searchType}
          onChange={(value) => setFilters((prev) => ({ ...prev, searchType: value }))}
          options={SEARCH_TYPE_OPTIONS}
        />
        <FilterBar.Select
          value={filters.status}
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          options={STATUS_OPTIONS}
        />
        <FilterBar.Select
          value={filters.pageSize}
          onChange={(value) => {
            setFilters((prev) => ({ ...prev, pageSize: value }))
            handlePageSizeChange(Number(value))
          }}
          options={PAGE_SIZE_OPTIONS}
        />
        <DatePicker
          value={filters.terminationDate}
          onChange={(value) => setFilters((prev) => ({ ...prev, terminationDate: value }))}
          className="w-40"
        />
        <FilterBar.Input
          value={filters.search}
          onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
          placeholder="예: 홍길동 / 010-1234-5678"
          onSearch={handleSearch}
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={drivers}
        loading={loading}
        pagination={{
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalCount: pagination.totalCount,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
          pageSizeOptions: [20, 50, 100],
        }}
      />
    </div>
  )
}
