import { useEffect, useState, useMemo } from 'react'
import { BarChart3, List, MessageSquare } from 'lucide-react'
import api from '../../lib/api'
import {
  FilterBar,
  FilterSelect,
  DataTable,
  type Column,
  useToastHelpers,
  DatePicker,
} from '../../components'
import { INSURER_MAP, GITA_MAP, RATE_NAME_MAP, addPhoneHyphen } from './constants'

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
  standardDate?: string
  applicationDate?: string
  policyNum?: string
  certiType?: string
  rate?: string
  endorseProcess?: string
  insuranceCom?: number | string
  premium?: number
  cPremium?: number
  duplicate?: string
  companyNum?: number | string
  companyName?: string
  age?: number | string
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

const PUSH_OPTIONS = [
  { value: '', label: '선택' },
  { value: '1', label: '청약' },
  { value: '4', label: '해지' },
]

const PROGRESS_OPTIONS = [
  { value: '', label: '진행단계' },
  { value: '1', label: '프린트' },
  { value: '2', label: '스캔' },
  { value: '3', label: '고객등록' },
  { value: '4', label: '심사중' },
  { value: '5', label: '입금대기' },
  { value: '6', label: '카드승인' },
  { value: '7', label: '수납중' },
  { value: '8', label: '확정중' },
]

const PAGE_SIZE_OPTIONS = [
  { value: '20', label: '20개' },
  { value: '50', label: '50개' },
  { value: '100', label: '100개' },
]

// 진행단계 매핑
const PROGRESS_MAP: Record<string, string> = {
  '1': '프린트',
  '2': '스캔',
  '3': '고객등록',
  '4': '심사중',
  '5': '입금대기',
  '6': '카드승인',
  '7': '수납중',
  '8': '확정중',
}

// 상태(push) 매핑
const PUSH_MAP: Record<string, string> = {
  '1': '청약',
  '4': '해지',
}

export default function EndorseList() {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [endorseList, setEndorseList] = useState<EndorseItem[]>([])
  const [policyOptions, setPolicyOptions] = useState<PolicyOption[]>([])
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([])
  const [stats, setStats] = useState({
    subscription: 0,
    cancellation: 0,
    total: 0,
  })

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

  // 초기 로드: 증권번호 목록 로드
  useEffect(() => {
    loadPolicyOptions()
    loadCompanyOptions()
  }, [])

  // 필터 변경 시 자동 검색 (필터가 하나라도 선택된 경우)
  useEffect(() => {
    const hasFilter = filters.push || filters.progress || filters.endorseDay || 
                     filters.insuranceCom || filters.policyNum || filters.companyNum
    if (hasFilter) {
      const pageSize = parseInt(filters.pageSize)
      setPagination((prev) => ({ ...prev, currentPage: 1, pageSize }))
      loadEndorseList(1, pageSize)
    }
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

  // 보험회사 옵션
  const insurerOptions = useMemo(() => {
    return [
      { value: '', label: '-- 보험회사 선택 --' },
      { value: '1', label: '흥국' },
      { value: '2', label: 'DB' },
      { value: '3', label: 'KB' },
      { value: '4', label: '현대' },
      { value: '5', label: '롯데' },
      { value: '6', label: '하나' },
      { value: '7', label: '한화' },
      { value: '8', label: '삼성' },
      { value: '9', label: '메리츠' },
    ]
  }, [])

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
        cell: (row) => row.companyName || '-',
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
        className: 'w-36',
      },
      {
        key: 'phone',
        header: '핸드폰',
        cell: (row) => (row.phone ? addPhoneHyphen(row.phone) : '-'),
        className: 'w-28',
      },
      {
        key: 'progressStep',
        header: '진행단계',
        cell: (row) => PROGRESS_MAP[row.progressStep || ''] || row.progressStep || '-',
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
          const rate = row.rate
          if (!rate) return '-'
          const rateName = RATE_NAME_MAP[Number(rate)] || rate
          return (
            <span title={rateName} className="cursor-help">
              {rate}
            </span>
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
        cell: (row) => row.endorseProcess || '-',
        className: 'w-24',
      },
      {
        key: 'insuranceCom',
        header: '보험사',
        cell: (row) => INSURER_MAP[Number(row.insuranceCom)] || row.insuranceCom || '-',
        className: 'w-20',
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
        className: 'w-24',
      },
    ],
    [endorseList, pagination]
  )

  // 배서현황 버튼 클릭
  const handleEndorseStatus = () => {
    toast.info('배서현황 기능은 준비 중입니다.')
  }

  // 일일배서리스트 버튼 클릭
  const handleDailyEndorseList = () => {
    toast.info('일일배서리스트 기능은 준비 중입니다.')
  }

  // 문자리스트 버튼 클릭
  const handleSmsList = () => {
    toast.info('문자리스트 기능은 준비 중입니다.')
  }

  return (
    <div className="p-6">
      <FilterBar
        actionButtons={
          <>
            <button
              onClick={handleEndorseStatus}
              className="h-[31px] px-3 py-1 text-xs border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors flex items-center gap-1"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              배서현황
            </button>
            <button
              onClick={handleDailyEndorseList}
              className="h-[31px] px-3 py-1 text-xs border border-success text-success rounded hover:bg-success hover:text-white transition-colors flex items-center gap-1"
            >
              <List className="w-3.5 h-3.5" />
              일일배서리스트
            </button>
            <button
              onClick={handleSmsList}
              className="h-[31px] px-3 py-1 text-xs border border-info text-info rounded hover:bg-info hover:text-white transition-colors flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              문자리스트
            </button>
          </>
        }
      >
        <FilterSelect
          value={filters.push}
          onChange={(value) => {
            setFilters({ ...filters, push: value })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={PUSH_OPTIONS}
          className="w-[90px]"
        />
        <FilterSelect
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
          className="w-[140px]"
        />
        <FilterSelect
          value={filters.insuranceCom}
          onChange={(value) => {
            setFilters({ ...filters, insuranceCom: value })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={insurerOptions}
          className="w-[156px]"
        />
        <FilterSelect
          value={filters.policyNum}
          onChange={(value) => {
            setFilters({ ...filters, policyNum: value, companyNum: '' })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={policySelectOptions}
          className="w-[180px]"
        />
        <select
          value={filters.companyNum}
          onChange={(e) => {
            setFilters({ ...filters, companyNum: e.target.value })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          disabled={!filters.policyNum}
          className="h-10 px-3 py-0 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm leading-none font-normal appearance-none cursor-pointer w-[182px] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'inherit',
            lineHeight: '1.5',
            boxSizing: 'border-box',
            minHeight: '40px',
            height: '40px',
          }}
        >
          {companySelectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <FilterSelect
          value={filters.pageSize}
          onChange={(value) => {
            setFilters({ ...filters, pageSize: value })
            const newPageSize = parseInt(value)
            setPagination({ ...pagination, pageSize: newPageSize, currentPage: 1 })
            loadEndorseList(1, newPageSize)
          }}
          options={PAGE_SIZE_OPTIONS}
          className="w-[75px]"
        />
        <div className="flex items-center gap-1 text-xs bg-info/10 border border-info text-dark px-2 py-1 rounded h-[31px] ml-auto">
          <strong>청약:</strong>
          <span>{stats.subscription.toLocaleString('ko-KR')}</span>,
          <strong>해지:</strong>
          <span>{stats.cancellation.toLocaleString('ko-KR')}</span>,
          <strong>계:</strong>
          <span>{stats.total.toLocaleString('ko-KR')}</span>
        </div>
      </FilterBar>

      <DataTable
        data={endorseList}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalCount: pagination.totalCount,
          onPageChange: (page) => {
            setPagination({ ...pagination, currentPage: page })
            loadEndorseList(page, pagination.pageSize)
          },
        }}
        emptyMessage="필터를 선택하세요."
      />
    </div>
  )
}
