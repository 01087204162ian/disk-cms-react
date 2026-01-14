import { useEffect, useState, useMemo } from 'react'
import { BarChart3, List, MessageSquare } from 'lucide-react'
import api from '../../lib/api'
import {
  FilterBar,
  DataTable,
  type Column,
  useToastHelpers,
  DatePicker,
} from '../../components'
import {
  INSURER_OPTIONS,
  INSURER_MAP,
  GITA_MAP,
  RATE_OPTIONS,
  addPhoneHyphen,
  PUSH_OPTIONS,
  PUSH_MAP,
  PROGRESS_OPTIONS,
} from './constants'
import { useAuthStore } from '../../store/authStore'
import EndorseModal from './components/EndorseModal'
import EndorseStatusModal from './components/EndorseStatusModal'
import DailyEndorseListModal from './components/DailyEndorseListModal'
import SmsListModal from './components/SmsListModal'
import CompanyDetailModal from './components/CompanyDetailModal'

interface EndorseItem {
  num: number
  name: string
  jumin: string
  phone: string
  push: number | string
  progressStep: string
  cancel?: string
  manager?: string
  damdanja?: string
  standardDate?: string // endorse_day (배서기준일)
  applicationDate?: string
  policyNum?: string
  certiType?: string
  rate?: string
  endorseProcess?: string
  sangtae?: number | string // 배서처리 상태 (1=미처리, 2=처리)
  insuranceCom?: number | string
  premium?: number
  cPremium?: number
  duplicate?: string
  companyNum?: number | string // 2012DaeriCompanyNum
  companyName?: string
  age?: number | string
  cNum?: number | string // CertiTableNum (증권 테이블 번호)
  pNum?: number | string // EndorsePnum (배서 번호)
}

interface EndorseListResponse {
  success: boolean
  data: EndorseItem[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats?: {
    subscription: number
    cancellation: number
    total: number
  }
  error?: string
}

interface PolicyOption {
  policyNum: string
  policy_num?: string
  gita?: string
  insuranceCom?: number | string
  insurance_com?: number | string
}

interface CompanyOption {
  num: number
  companyName?: string
  company?: string
}

const PAGE_SIZE_OPTIONS = [
  { value: '20', label: '20개' },
  { value: '50', label: '50개' },
  { value: '100', label: '100개' },
]

// 배서처리 옵션
const ENDORSE_PROCESS_OPTIONS = [
  { value: '1', label: '미처리' },
  { value: '2', label: '처리' },
]

export default function EndorseList() {
  const toast = useToastHelpers()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [endorseList, setEndorseList] = useState<EndorseItem[]>([])
  const [policyOptions, setPolicyOptions] = useState<PolicyOption[]>([])
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([])
  const [stats, setStats] = useState({
    subscription: 0,
    cancellation: 0,
    total: 0,
  })

  // 배서 모달 상태
  const [endorseModalOpen, setEndorseModalOpen] = useState(false)
  const [selectedEndorseData, setSelectedEndorseData] = useState<{
    endorseDay: string
    companyNum: number | string
    certiTableNum: number | string
    endorsePnum: number | string
    insurerCode?: number | string
    policyNum?: string
    gita?: number | string
  } | null>(null)

  // 배서현황 모달 상태
  const [endorseStatusModalOpen, setEndorseStatusModalOpen] = useState(false)

  // 일일배서리스트 모달 상태
  const [dailyEndorseListModalOpen, setDailyEndorseListModalOpen] = useState(false)

  // 문자리스트 모달 상태
  const [smsListModalOpen, setSmsListModalOpen] = useState(false)
  const [smsListInitialData, setSmsListInitialData] = useState<{
    phone?: string
    companyNum?: string | number
    sort?: string
  }>({})

  // 업체 상세 모달 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedCompanyNum, setSelectedCompanyNum] = useState<number | null>(null)
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('')

  // 필터 상태
  const [filters, setFilters] = useState({
    push: '', // 상태 (청약/해지)
    progress: '', // 진행단계
    endorseDay: '', // 배서기준일
    insuranceCom: '', // 보험회사
    policyNum: '', // 증권번호
    companyNum: '', // 대리운전회사
    pageSize: '20',
  })

  // 페이지네이션
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
  })

  // 증권번호 목록 로드
  const loadPolicyOptions = async () => {
    try {
      const res = await api.get<{ success: boolean; data: PolicyOption[] }>(
        '/api/insurance/kj-endorse/policy-list'
      )
      if (res.data.success && res.data.data) {
        setPolicyOptions(res.data.data)
      }
    } catch (error) {
      console.error('증권번호 목록 로드 오류:', error)
    }
  }

  // 대리운전회사 목록 로드
  const loadCompanyOptions = async (policyNum?: string) => {
    try {
      const params: any = {}
      if (policyNum) {
        params.policyNum = policyNum
      }
      const res = await api.get<{ success: boolean; data: CompanyOption[] }>(
        '/api/insurance/kj-endorse/company-list',
        { params }
      )
      if (res.data.success && res.data.data) {
        setCompanyOptions(res.data.data)
      }
    } catch (error) {
      console.error('대리운전회사 목록 로드 오류:', error)
    }
  }

  // 배서 리스트 로드
  const loadEndorseList = async (page?: number, pageSize?: number) => {
    try {
      setLoading(true)
      const currentPage = page !== undefined ? page : pagination.currentPage
      const currentPageSize = pageSize !== undefined ? pageSize : pagination.pageSize

      const params: any = {
        page: currentPage,
        limit: currentPageSize,
      }

      if (filters.push) {
        params.push = filters.push
      }
      if (filters.progress) {
        params.progress = filters.progress
      }
      if (filters.endorseDay) {
        params.endorseDay = filters.endorseDay
      }
      if (filters.insuranceCom) {
        params.insuranceCom = filters.insuranceCom
      }
      if (filters.policyNum) {
        params.policyNum = filters.policyNum
      }
      if (filters.companyNum) {
        params.companyNum = filters.companyNum
      }

      const res = await api.get<EndorseListResponse>('/api/insurance/kj-endorse/list', { params })

      if (res.data.success) {
        setEndorseList(res.data.data || [])
        const paginationData = res.data.pagination
        setPagination({
          currentPage: paginationData?.page || currentPage,
          pageSize: paginationData?.limit || currentPageSize,
          totalCount: paginationData?.total || 0,
          totalPages: paginationData?.totalPages || 1,
        })
        if (res.data.stats) {
          setStats(res.data.stats)
        }
      } else {
        toast.error(res.data.error || '데이터를 불러오는 중 오류가 발생했습니다.')
        setEndorseList([])
      }
    } catch (error: any) {
      console.error('배서 리스트 로드 오류:', error)
      toast.error(error.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다.')
      setEndorseList([])
    } finally {
      setLoading(false)
    }
  }

  // 증권번호 선택 시 대리운전회사 목록 로드
  useEffect(() => {
    if (filters.policyNum) {
      loadCompanyOptions(filters.policyNum)
    } else {
      loadCompanyOptions()
    }
  }, [filters.policyNum])

  // 초기 로드: 증권번호 목록 로드 및 배서 리스트 로드
  useEffect(() => {
    loadPolicyOptions()
    loadCompanyOptions()
    // 초기 로드 시 배서 리스트도 함께 로드
    const pageSize = parseInt(filters.pageSize)
    loadEndorseList(1, pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 필터 변경 시 자동 검색
  useEffect(() => {
    const pageSize = parseInt(filters.pageSize)
    setPagination((prev) => ({ ...prev, currentPage: 1, pageSize }))
    loadEndorseList(1, pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.push, filters.progress, filters.endorseDay, filters.insuranceCom, filters.policyNum, filters.companyNum, filters.pageSize])

  // 증권번호 옵션 생성
  const policySelectOptions = useMemo(() => {
    const options = [
      { value: '', label: '-- 증권 선택 --' },
      { value: '1', label: '-- 모든 증권 --' },
    ]
    policyOptions.forEach((item) => {
      const policyNum = item.policyNum || item.policy_num || ''
      const gita = item.gita || ''
      const insuranceCom = item.insuranceCom || item.insurance_com || 0
      const insurerName = INSURER_MAP[Number(insuranceCom)] || '알 수 없음'
      const certiType = GITA_MAP[Number(gita)] || ''
      options.push({
        value: policyNum,
        label: `${insurerName}[${policyNum}]${certiType}`,
      })
    })
    return options
  }, [policyOptions])

  // 대리운전회사 옵션 생성
  const companySelectOptions = useMemo(() => {
    const options = [{ value: '', label: '-- 대리운전회사 선택 --' }]
    companyOptions.forEach((item) => {
      const companyName = item.companyName || item.company || ''
      options.push({
        value: String(item.num),
        label: companyName,
      })
    })
    return options
  }, [companyOptions])

  // 보험회사 옵션 (공통 상수 사용)
  const insurerOptions = useMemo(() => {
    return [
      { value: '', label: '-- 보험회사 선택 --' },
      ...INSURER_OPTIONS.filter(opt => opt.value !== 0).map(opt => ({
        value: String(opt.value),
        label: opt.label,
      })),
    ]
  }, [])

  // 업체 상세 모달 열기
  const handleOpenCompanyModal = (companyNum: number | string, companyName: string) => {
    setSelectedCompanyNum(typeof companyNum === 'string' ? Number(companyNum) : companyNum)
    setSelectedCompanyName(companyName)
    setDetailModalOpen(true)
  }

  // 테이블 컬럼 정의
  const columns: Column<EndorseItem>[] = useMemo(
    () => [
      {
        key: 'num',
        header: 'No',
        cell: (row) => {
          const index = endorseList.indexOf(row)
          const page = pagination.currentPage
          const pageSize = pagination.pageSize
          return (page - 1) * pageSize + index + 1
        },
        className: 'w-12 text-center',
      },
      {
        key: 'damdanja',
        header: '담당자',
        cell: (row) => row.damdanja || '-',
        className: 'w-24',
      },
      {
        key: 'companyName',
        header: '대리운전회사명',
        cell: (row) => {
          const companyName = row.companyName || '-'
          const companyNum = row.companyNum
          if (companyNum && companyName !== '-') {
            return (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenCompanyModal(companyNum, companyName)
                }}
                className="text-primary hover:underline"
              >
                {companyName}
              </button>
            )
          }
          return <div>{companyName}</div>
        },
        className: 'w-36',
      },
      {
        key: 'name',
        header: '성명',
        cell: (row) => row.name || '-',
        className: 'w-24',
      },
      {
        key: 'jumin',
        header: '주민번호(나이)',
        cell: (row) => {
          const jumin = row.jumin || ''
          const age = row.age ? `(${row.age})` : ''
          return jumin ? `${jumin} ${age}` : '-'
        },
        className: 'w-44',
      },
      {
        key: 'phone',
        header: '핸드폰',
        cell: (row) => (row.phone ? addPhoneHyphen(row.phone) : '-'),
        className: 'w-36',
      },
      {
        key: 'progressStep',
        header: '진행단계',
        cell: (row) => {
          const currentProgress = row.progressStep || '-1'
          return (
            <select
              value={currentProgress}
              onChange={(e) => handleProgressChange(row, e.target.value)}
              className="h-8 px-2 py-0 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs leading-none font-normal appearance-none cursor-pointer w-full"
              style={{ fontSize: '0.75rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="-1">선택</option>
              {PROGRESS_OPTIONS.filter((opt) => opt.value !== '').map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )
        },
        className: 'w-24',
      },
      {
        key: 'manager',
        header: 'manager',
        cell: (row) => row.manager || '-',
        className: 'w-24',
      },
      {
        key: 'standardDate',
        header: '기준일',
        cell: (row) => row.standardDate || '-',
        className: 'w-28',
      },
      {
        key: 'applicationDate',
        header: '신청일',
        cell: (row) => row.applicationDate || '-',
        className: 'w-28',
      },
      {
        key: 'policyNum',
        header: '증권번호',
        cell: (row) => row.policyNum || '-',
        className: 'w-36',
      },
      {
        key: 'certiType',
        header: '증권성격',
        cell: (row) => GITA_MAP[Number(row.certiType)] || row.certiType || '-',
        className: 'w-24',
      },
      {
        key: 'rate',
        header: '요율',
        cell: (row) => {
          const currentRate = row.rate || '-1'
          return (
            <select
              value={currentRate}
              onChange={(e) => handleRateChange(row, e.target.value)}
              className="h-8 px-2 py-0 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs leading-none font-normal appearance-none cursor-pointer w-full"
              style={{ fontSize: '0.75rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              {RATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )
        },
        className: 'w-20',
      },
      {
        key: 'push',
        header: '상태',
        cell: (row) => PUSH_MAP[String(row.push)] || row.push || '-',
        className: 'w-20',
      },
      {
        key: 'endorseProcess',
        header: '배서처리',
        cell: (row) => {
          // API 응답에서 sangtae 값이 1이면 미처리, 2면 처리
          const currentStatus = String(row.sangtae || '1')
          return (
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(row, e.target.value)}
              className="h-8 px-2 py-0 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs leading-none font-normal appearance-none cursor-pointer w-full"
              style={{ fontSize: '0.75rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              {ENDORSE_PROCESS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )
        },
        className: 'w-24',
      },
      {
        key: 'insuranceCom',
        header: '보험사',
        cell: (row) => INSURER_MAP[Number(row.insuranceCom)] || row.insuranceCom || '-',
        className: 'w-10',
      },
      {
        key: 'premium',
        header: '보험료',
        cell: (row) =>
          row.premium ? row.premium.toLocaleString('ko-KR') : '-',
        className: 'w-28 text-end',
      },
      {
        key: 'cPremium',
        header: 'C보험료',
        cell: (row) =>
          row.cPremium ? row.cPremium.toLocaleString('ko-KR') : '-',
        className: 'w-28 text-end',
      },
      {
        key: 'duplicate',
        header: '중복여부',
        cell: (row) => row.duplicate || '-',
        className: 'w-12',
      },
    ],
    [endorseList, pagination]
  )

  // 배서현황 버튼 클릭
  const handleEndorseStatus = () => {
    setEndorseStatusModalOpen(true)
  }

  // 일일배서리스트 버튼 클릭
  const handleDailyEndorseList = () => {
    setDailyEndorseListModalOpen(true)
  }

  // 문자리스트 버튼 클릭
  const handleSmsList = () => {
    setSmsListInitialData({ sort: '2' })
    setSmsListModalOpen(true)
  }

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newPageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize: String(newPageSize) }))
    setPagination((prev) => ({ ...prev, currentPage: 1, pageSize: newPageSize }))
    loadEndorseList(1, newPageSize)
  }

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
    loadEndorseList(page, pagination.pageSize)
  }

  // 진행단계 변경 핸들러
  const handleProgressChange = async (row: EndorseItem, newProgress: string) => {
    if (!confirm('진행단계가 맞습니까?')) {
      return
    }

    try {
      const formData = new URLSearchParams()
      formData.append('num', String(row.num))
      formData.append('progress', newProgress)
      formData.append('userName', user?.name || '')

      const res = await api.post<{ success: boolean; message?: string; error?: string; manager?: string }>(
        '/api/insurance/kj-endorse/update-progress',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      if (res.data.success) {
        toast.success(res.data.message || '진행단계가 변경되었습니다.')
        // 리스트 새로고침
        loadEndorseList(pagination.currentPage, pagination.pageSize)
      } else {
        toast.error(res.data.error || '진행단계 변경 중 오류가 발생했습니다.')
      }
    } catch (error: any) {
      console.error('진행단계 변경 오류:', error)
      toast.error(error.response?.data?.error || '진행단계 변경 중 오류가 발생했습니다.')
    }
  }

  // 요율 변경 핸들러
  const handleRateChange = async (row: EndorseItem, newRate: string) => {
    if (newRate === '-1') {
      toast.error('요율을 선택해주세요.')
      return
    }

    if (!confirm('요율 변경값이 맞습니까?')) {
      return
    }

    try {
      const formData = new URLSearchParams()
      formData.append('num', String(row.num))
      formData.append('Jumin', row.jumin || '')
      formData.append('rate', newRate)
      formData.append('policyNum', row.policyNum || '')
      formData.append('userName', user?.name || '')

      const res = await api.post<{ success: boolean; message?: string; error?: string }>(
        '/api/insurance/kj-endorse/update-rate',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      if (res.data.success) {
        toast.success(res.data.message || '요율이 변경되었습니다.')
        // 리스트 새로고침
        loadEndorseList(pagination.currentPage, pagination.pageSize)
      } else {
        toast.error(res.data.error || '요율 변경 중 오류가 발생했습니다.')
      }
    } catch (error: any) {
      console.error('요율 변경 오류:', error)
      toast.error(error.response?.data?.error || '요율 변경 중 오류가 발생했습니다.')
    }
  }

  // 배서처리 변경 핸들러
  const handleStatusChange = async (row: EndorseItem, newStatus: string) => {
    if (!row.rate || row.rate === '-1' || Number(row.rate) < 0) {
      toast.error('개인 요율부터 입력하세요.')
      return
    }

    const statusText = newStatus === '2' ? '처리됨' : '미처리'
    if (!confirm(`정말로 상태를 ${statusText}로 변경하시겠습니까?`)) {
      return
    }

    try {
      const formData = new URLSearchParams()
      formData.append('num', String(row.num))
      formData.append('status', newStatus)
      formData.append('push', String(row.push))
      formData.append('rate', String(row.rate))
      formData.append('userName', user?.name || '')

      const res = await api.post<{ success: boolean; message?: string; error?: string }>(
        '/api/insurance/kj-endorse/update-status',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      if (res.data.success) {
        toast.success(res.data.message || '상태가 변경되었습니다.')
        // 리스트 새로고침
        loadEndorseList(pagination.currentPage, pagination.pageSize)
      } else {
        toast.error(res.data.error || '상태 변경 중 오류가 발생했습니다.')
      }
    } catch (error: any) {
      console.error('상태 변경 오류:', error)
      toast.error(error.response?.data?.error || '상태 변경 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <FilterBar>
        <FilterBar.Select
          value={filters.push}
          onChange={(value) => {
            setFilters({ ...filters, push: value })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={PUSH_OPTIONS}
          className="w-[90px]"
        />
        <FilterBar.Select
          value={filters.progress}
          onChange={(value) => {
            setFilters({ ...filters, progress: value })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={PROGRESS_OPTIONS}
          className="w-[110px]"
        />
        <DatePicker
          value={filters.endorseDay}
          onChange={(value) => {
            setFilters({ ...filters, endorseDay: value || '' })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          variant="filter"
          className="w-[120px]"
        />
        <FilterBar.Select
          value={filters.insuranceCom}
          onChange={(value) => {
            setFilters({ ...filters, insuranceCom: value })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={insurerOptions}
          className="w-[156px]"
        />
        <FilterBar.Select
          value={filters.policyNum}
          onChange={(value) => {
            setFilters({ ...filters, policyNum: value, companyNum: '' })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={policySelectOptions}
          className="w-[180px]"
        />
        <FilterBar.Select
          value={filters.companyNum}
          onChange={(value) => {
            setFilters({ ...filters, companyNum: value })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={companySelectOptions}
          disabled={!filters.policyNum}
          className="w-[182px]"
        />
        <FilterBar.Select
          value={filters.pageSize}
          onChange={(value) => handlePageSizeChange(Number(value))}
          options={PAGE_SIZE_OPTIONS}
          className="w-[75px]"
        />
        <button
          onClick={handleEndorseStatus}
          className="h-10 px-3 py-1 text-xs border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          배서현황
        </button>
        <button
          onClick={handleDailyEndorseList}
          className="h-10 px-3 py-1 text-xs border border-success text-success rounded hover:bg-success hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <List className="w-3.5 h-3.5" />
          일일배서리스트
        </button>
        <button
          onClick={handleSmsList}
          className="h-10 px-3 py-1 text-xs border border-info text-info rounded hover:bg-info hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          문자리스트
        </button>
        <FilterBar.Stats
          stats={[
            { label: '청약:', value: stats.subscription },
            { label: '해지:', value: stats.cancellation },
            { label: '계:', value: stats.total },
          ]}
        />
      </FilterBar>

      <DataTable
        data={endorseList}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalCount: pagination.totalCount,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
          pageSizeOptions: [20, 50, 100],
        }}
        emptyMessage="필터를 선택하세요."
        onRowClick={(row) => {
          // 배서 모달 열기
          if (row.standardDate && row.companyNum && row.cNum && row.pNum) {
            setSelectedEndorseData({
              endorseDay: row.standardDate,
              companyNum: row.companyNum,
              certiTableNum: row.cNum,
              endorsePnum: row.pNum,
              insurerCode: row.insuranceCom,
              policyNum: row.policyNum,
              gita: row.certiType,
            })
            setEndorseModalOpen(true)
          }
        }}
      />

      {/* 배서 모달 */}
      {selectedEndorseData && (
        <EndorseModal
          isOpen={endorseModalOpen}
          onClose={() => {
            setEndorseModalOpen(false)
            setSelectedEndorseData(null)
          }}
          certiTableNum={Number(selectedEndorseData.certiTableNum)}
          insurerCode={selectedEndorseData.insurerCode ? Number(selectedEndorseData.insurerCode) : undefined}
          policyNum={selectedEndorseData.policyNum}
          gita={selectedEndorseData.gita ? Number(selectedEndorseData.gita) : undefined}
          companyNum={selectedEndorseData.companyNum ? Number(selectedEndorseData.companyNum) : undefined}
          onSuccess={() => {
            // 배서 저장 성공 시 리스트 새로고침
            loadEndorseList(pagination.currentPage, pagination.pageSize)
          }}
        />
      )}

      {/* 배서현황 모달 */}
      <EndorseStatusModal
        isOpen={endorseStatusModalOpen}
        onClose={() => setEndorseStatusModalOpen(false)}
      />

      {/* 일일배서리스트 모달 */}
      <DailyEndorseListModal
        isOpen={dailyEndorseListModalOpen}
        onClose={() => setDailyEndorseListModalOpen(false)}
      />

      {/* 문자리스트 모달 */}
      <SmsListModal
        isOpen={smsListModalOpen}
        onClose={() => {
          setSmsListModalOpen(false)
          setSmsListInitialData({})
        }}
        initialPhone={smsListInitialData.phone}
        initialCompanyNum={smsListInitialData.companyNum}
        initialSort={smsListInitialData.sort}
      />

      {/* 업체 상세 모달 */}
      <CompanyDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedCompanyNum(null)
          setSelectedCompanyName('')
        }}
        companyNum={selectedCompanyNum}
        companyName={selectedCompanyName}
      />
    </div>
  )
}
