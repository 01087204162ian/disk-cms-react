import { useEffect, useState, useMemo } from 'react'
import api from '../../lib/api'
import {
  FilterBar,
  DataTable,
  type Column,
  useToastHelpers,
  DatePicker,
} from '../../components'
import { GITA_OPTIONS, mapPushLabel, removePhoneHyphen, addPhoneHyphen } from './constants'
import CompanyDetailModal from './components/CompanyDetailModal'

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
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
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
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedCompanyNum, setSelectedCompanyNum] = useState<number | null>(null)
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('')

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
        const paginationData = res.data.pagination
        setPagination({
          currentPage: paginationData?.page || res.data.page || currentPage,
          pageSize: paginationData?.limit || res.data.limit || currentPageSize,
          totalCount: paginationData?.total || res.data.total || res.data.total_count || 0,
          totalPages: paginationData?.totalPages || res.data.totalPages || Math.ceil((paginationData?.total || res.data.total || res.data.total_count || 0) / (paginationData?.limit || res.data.limit || currentPageSize)),
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

  // 검색 실행 (검색어 입력 후 Enter 키 또는 검색 버튼으로 호출)
  const handleSearch = () => {
    if (!filters.search || filters.search.trim() === '') {
      toast.error('검색어를 입력해주세요.')
      return
    }
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
    loadDrivers(1, pagination.pageSize)
  }

  // 페이지 변경
  const handlePageChange = (page: number) => {
    if (!filters.search || filters.search.trim() === '') {
      return
    }
    loadDrivers(page, pagination.pageSize)
  }

  // 페이지 크기 변경
  const handlePageSizeChange = (newPageSize: number) => {
    if (!filters.search || filters.search.trim() === '') {
      return
    }
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
    try {
      const response = await api.post('/api/insurance/kj-driver/phone', {
        num,
        phone,
      })
      if (response.data.success) {
        // 성공 시 데이터 다시 로드
        await loadDrivers()
        toast.success('핸드폰 번호가 수정되었습니다.')
      } else {
        toast.error(response.data.message || '핸드폰 번호 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('핸드폰 번호 수정 오류:', error)
      toast.error('핸드폰 번호 수정 중 오류가 발생했습니다.')
    }
  }

  // 사고 변경 (인라인 편집)
  const handleSagoChange = async (num: number, sago: number) => {
    // TODO: 사고 변경 로직 구현
    console.log('사고 변경:', { num, sago })
  }

  // 테이블 컬럼 정의
  const columns: Column<Driver>[] = useMemo(
    () => [
      // 짧은 헤더는 작은 폰트 사용 (#, 이름, 상태, 사고 등)
      {
        key: 'index',
        header: '#',
        cell: (row) => {
          const index = drivers.indexOf(row)
          const startIndex = (pagination.currentPage - 1) * pagination.pageSize
          return <div className="text-center whitespace-nowrap">{startIndex + index + 1}</div>
        },
        className: 'w-12 text-center',
      },
      {
        key: 'Name',
        header: '이름',
        cell: (row) => (
          <div className="whitespace-nowrap text-center">
            {row.Name || ''}
            {row.age ? ` (${row.age}세)` : ''}
          </div>
        ),
        className: 'text-center',
      },
      {
        key: 'Jumin',
        header: '주민번호',
        cell: (row) => (
          <div className="whitespace-nowrap text-center w-full">
            {row.Jumin || ''}
          </div>
        ),
        className: 'hidden lg:table-cell text-center',
      },
      {
        key: 'status',
        header: '상태',
        className: 'whitespace-nowrap p-0 text-center',
        cell: (row) => {
          const push = Number(row.push)
          const cancel = row.cancel != null ? String(row.cancel) : ''
          const sangtae = row.sangtae != null ? String(row.sangtae) : ''

          // push=4이고 cancel=42이고 sangtae=1이면 "해지중" 표시
          const cancelNum = typeof cancel === 'string' ? Number(cancel) : cancel
          const sangtaeNum = typeof sangtae === 'string' ? Number(sangtae) : sangtae
          if (push === 4 && cancelNum === 42 && sangtaeNum === 1) {
            return <span className="text-center">해지중</span>
          }

          // 청약 취소/거절 표시 (push=1 유지 + cancel 코드)
          if (push === 1) {
            if (cancelNum === 12) return <span className="text-center">청약취소</span>
            if (cancelNum === 13) return <span className="text-center">청약거절</span>
          }

          // 해지취소 표시 (정상 push=4 유지 + cancel=45)
          if (push === 4 && cancelNum === 45) {
            return <span className="text-center">해지취소</span>
          }

          // 정상일 때만 select 제공
          if (push === 4) {
            return (
              <select
                className="w-full text-xs border-0 rounded-none bg-background text-foreground focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                style={{ fontSize: '0.75rem', padding: '8px 12px', width: '100%' }}
                defaultValue={push}
                onChange={(e) => handleStatusChange(row.num, push, Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="4">정상</option>
                <option value="2">해지</option>
              </select>
            )
          }

          return <span className="whitespace-nowrap text-center">{mapPushLabel(push)}</span>
        },
      },
      {
        key: 'etag',
        header: '증권성격',
        cell: (row) => {
          const etag = Number(row.etag || 0)
          return (
            <select
              className="w-full text-xs border-0 rounded-none bg-background text-foreground focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring hidden lg:table-cell"
              style={{ fontSize: '0.75rem', padding: '8px 12px', width: '100%' }}
              defaultValue={etag}
              onChange={(e) => handleEtagChange(row.num, Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
            >
              {GITA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )
        },
        className: 'hidden lg:table-cell p-0 text-center',
      },
      {
        key: 'company',
        header: '대리운전회사',
        cell: (row) => {
          const companyText = (row.companyName || '') + (row.companyNum ? ` (${row.companyNum})` : '')
          const companyNum = row.companyNum ? Number(row.companyNum) : null
          return (
            <button
              type="button"
              className="text-primary hover:underline whitespace-nowrap text-center"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (companyNum) {
                  setSelectedCompanyNum(companyNum)
                  setSelectedCompanyName(row.companyName || '')
                  setDetailModalOpen(true)
                }
              }}
            >
              {companyText}
            </button>
          )
        },
        className: 'text-center',
      },
      {
        key: 'InsuranceCompany',
        header: '보험회사',
        cell: (row) => <div className="whitespace-nowrap text-center">{row.insuranceCompanyName || row.InsuranceCompany || ''}</div>,
        className: 'text-center',
      },
      {
        key: 'policyNum',
        header: '증권번호',
        cell: (row) => <div className="whitespace-nowrap text-center">{row.policyNum || ''}</div>,
        className: 'text-center',
      },
      {
        key: 'discount',
        header: '할인할증',
        cell: (row) => {
          const rateText = row.personRateFactor != null ? String(row.personRateFactor) : ''
          const nameText = row.personRateName ? ` (${row.personRateName})` : ''
          return <div className="whitespace-nowrap text-center">{rateText + nameText}</div>
        },
        className: 'text-center',
      },
      {
        key: 'Hphone',
        header: '핸드폰',
        cell: (row) => {
          const phone = row.Hphone || ''
          return (
            <input
              type="text"
              className="w-full text-xs border-0 rounded-none bg-background text-foreground focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring hidden lg:table-cell text-center"
              style={{ fontSize: '0.75rem', padding: '8px 12px', width: '100%' }}
              defaultValue={phone}
              onInput={(e) => {
                const target = e.target as HTMLInputElement
                const cursorPos = target.selectionStart || 0
                const value = target.value
                const cleaned = removePhoneHyphen(value)
                const formatted = addPhoneHyphen(cleaned)
                if (formatted !== value) {
                  target.value = formatted
                  // 커서 위치 조정
                  const diff = formatted.length - value.length
                  const newCursorPos = Math.min(cursorPos + diff, formatted.length)
                  target.setSelectionRange(newCursorPos, newCursorPos)
                }
              }}
              onBlur={(e) => {
                const value = e.target.value.trim()
                const formatted = addPhoneHyphen(value)
                if (formatted !== phone) {
                  handlePhoneChange(row.num, formatted)
                } else {
                  e.target.value = phone
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  e.currentTarget.blur() // blur 이벤트를 발생시켜 수정 처리
                }
              }}
              onFocus={(e) => {
                e.target.value = removePhoneHyphen(e.target.value)
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )
        },
        className: 'hidden lg:table-cell p-0 text-center',
      },
      {
        key: 'InputDay',
        header: '등록일',
        cell: (row) => <div className="whitespace-nowrap text-center w-full">{row.InputDay || ''}</div>,
        className: 'hidden lg:table-cell text-center',
      },
      {
        key: 'OutPutDay',
        header: '해지일',
        cell: (row) => <div className="whitespace-nowrap text-center w-full">{row.OutPutDay || '-'}</div>,
        className: 'hidden lg:table-cell text-center',
      },
      {
        key: 'sago',
        header: '사고',
        className: 'whitespace-nowrap p-0 text-center',
        cell: (row) => {
          const sago = Number(row.sago || 0)
          return (
            <select
              className="w-full text-xs border-0 rounded-none bg-background text-foreground focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              style={{ fontSize: '0.75rem', padding: '8px 12px', width: '100%' }}
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

  return (
    <div className="space-y-6">
      <FilterBar>
        <FilterBar.Select
          value={filters.searchType}
          onChange={(value) => setFilters((prev) => ({ ...prev, searchType: value }))}
          options={SEARCH_TYPE_OPTIONS}
        />
        <FilterBar.Input
          value={filters.search}
          onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
          placeholder="예: 홍길동 / 010-1234-5678"
          onSearch={handleSearch}
          className="w-48"
        />
        <FilterBar.Select
          value={filters.status}
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          options={STATUS_OPTIONS}
        />
        <div className="flex items-center gap-2">
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
        </div>
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

      {/* 업체 상세 모달 */}
      <CompanyDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        companyNum={selectedCompanyNum}
        companyName={selectedCompanyName}
      />
    </div>
  )
}
