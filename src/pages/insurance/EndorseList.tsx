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
  PROGRESS_OPTIONS,
} from './constants'

// 배서리스트 페이지 전용 상태 매핑 (4=해지, 1=청약)
const ENDORSE_LIST_PUSH_MAP: Record<string, string> = {
  '1': '청약',
  '4': '해지',
  '2': '해지', // 처리 완료 시 push=2
  '3': '청약거절',
  '5': '해지취소',
  '6': '청약취소',
}
import { useAuthStore } from '../../store/authStore'
import EndorseModal from './components/EndorseModal'
import EndorseStatusModal from './components/EndorseStatusModal'
import DailyEndorseListModal from './components/DailyEndorseListModal'
import SmsListModal from './components/SmsListModal'
import CompanyDetailModal from './components/CompanyDetailModal'
import EndorseDayChangeModal from './components/EndorseDayChangeModal'
import DuplicateListModal from './components/DuplicateListModal'

interface EndorseItem {
  num: number
  name: string
  jumin: string
  phone: string
  push: number | string
  progressStep: string
  cancel?: number | string
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
  { value: '3', label: '취소' },
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

  // 배서기준일 변경 모달 상태
  const [endorseDayChangeModalOpen, setEndorseDayChangeModalOpen] = useState(false)
  const [selectedEndorseDayData, setSelectedEndorseDayData] = useState<{
    currentEndorseDay: string
    num: number | string
    companyNum?: number | string
    policyNum?: string
    companyName?: string
  } | null>(null)

  // 중복 리스트 모달 상태
  const [duplicateListModalOpen, setDuplicateListModalOpen] = useState(false)
  const [selectedJumin, setSelectedJumin] = useState<string>('')

  // 테이블 행 선택(체크 표시) 상태
  const [selectedRowNums, setSelectedRowNums] = useState<Set<number>>(new Set())
  const [bulkProgress, setBulkProgress] = useState<string>('-1')
  const [bulkEndorseProcess, setBulkEndorseProcess] = useState<string>('')

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

  // 대리운전회사 목록 로드 (독립적으로 작동)
  const loadCompanyOptions = async () => {
    try {
      const res = await api.get<{ success: boolean; data: CompanyOption[] }>(
        '/api/insurance/kj-endorse/company-list'
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

  // 대리운전회사 목록은 독립적으로 로드 (필터 변경과 무관)

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

  // 리스트가 바뀌면(검색/페이징) 현재 페이지에 존재하는 행만 선택 유지
  useEffect(() => {
    setSelectedRowNums((prev) => {
      if (prev.size === 0) return prev
      const currentNums = new Set(endorseList.map((r) => r.num))
      const next = new Set<number>()
      prev.forEach((num) => {
        if (currentNums.has(num)) next.add(num)
      })
      return next
    })
  }, [endorseList])

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

  // 배서기준일 변경 모달 열기
  const handleOpenEndorseDayChangeModal = (
    currentEndorseDay: string,
    num: number | string,
    companyNum?: number | string,
    policyNum?: string,
    companyName?: string
  ) => {
    setSelectedEndorseDayData({
      currentEndorseDay,
      num,
      companyNum,
      policyNum,
      companyName,
    })
    setEndorseDayChangeModalOpen(true)
  }

  const toggleRowSelected = (num: number) => {
    setSelectedRowNums((prev) => {
      const next = new Set(prev)
      if (next.has(num)) next.delete(num)
      else next.add(num)
      return next
    })
  }

  // 현재 페이지의 모든 행이 선택되어 있는지 확인
  const isAllSelected = useMemo(() => {
    if (endorseList.length === 0) return false
    return endorseList.every((row) => selectedRowNums.has(row.num))
  }, [endorseList, selectedRowNums])

  // 현재 페이지의 일부만 선택되어 있는지 확인 (indeterminate 상태용)
  const isIndeterminate = useMemo(() => {
    if (endorseList.length === 0) return false
    const selectedCount = endorseList.filter((row) => selectedRowNums.has(row.num)).length
    return selectedCount > 0 && selectedCount < endorseList.length
  }, [endorseList, selectedRowNums])

  // 전체선택/해제 핸들러
  const toggleSelectAll = () => {
    if (isAllSelected) {
      // 현재 페이지의 모든 행 해제
      setSelectedRowNums((prev) => {
        const next = new Set(prev)
        endorseList.forEach((row) => next.delete(row.num))
        return next
      })
    } else {
      // 현재 페이지의 모든 행 선택
      setSelectedRowNums((prev) => {
        const next = new Set(prev)
        endorseList.forEach((row) => next.add(row.num))
        return next
      })
    }
  }

  const selectedRows = useMemo(() => {
    if (selectedRowNums.size === 0) return []
    const numSet = selectedRowNums
    return endorseList.filter((r) => numSet.has(r.num))
  }, [endorseList, selectedRowNums])

  const bulkUpdateProgress = async () => {
    const newProgress = bulkProgress
    if (!newProgress || newProgress === '-1') {
      toast.error('진행단계를 선택해주세요.')
      return
    }
    if (selectedRows.length === 0) {
      toast.error('선택된 항목이 없습니다.')
      return
    }
    if (!confirm(`선택 ${selectedRows.length}건의 진행단계를 변경하시겠습니까?`)) {
      return
    }

    let successCount = 0
    let failCount = 0
    for (const row of selectedRows) {
      try {
        const formData = new URLSearchParams()
        formData.append('num', String(row.num))
        formData.append('progress', newProgress)
        formData.append('userName', user?.name || '')

        const res = await api.post<{ success: boolean }>(
          '/api/insurance/kj-endorse/update-progress',
          formData.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )

        if (res.data.success) successCount++
        else failCount++
      } catch (e) {
        failCount++
      }
    }

    toast.success(`진행단계 변경 완료: 성공 ${successCount}건, 실패 ${failCount}건`)
    setSelectedRowNums(new Set())
    setBulkProgress('-1')
    loadEndorseList(pagination.currentPage, pagination.pageSize)
  }

  const bulkUpdateEndorseProcess = async () => {
    const newStatus = bulkEndorseProcess
    if (!newStatus) {
      toast.error('배서처리를 선택해주세요.')
      return
    }
    if (selectedRows.length === 0) {
      toast.error('선택된 항목이 없습니다.')
      return
    }

    const statusText = newStatus === '1' ? '미처리' : newStatus === '2' ? '처리' : '취소'
    if (!confirm(`선택 ${selectedRows.length}건을 "${statusText}"로 일괄 변경하시겠습니까?`)) {
      return
    }

    let successCount = 0
    let failCount = 0
    let skippedCount = 0

    for (const row of selectedRows) {
      // 취소 상태 확인 (cancel=45: 해지취소, cancel=12: 청약취소)
      const cancelValue = row.cancel
      const isCancelled = cancelValue === 45 || cancelValue === '45' || cancelValue === 12 || cancelValue === '12'
      
      // 취소된 항목은 변경 불가
      if (isCancelled && newStatus !== '3') {
        skippedCount++
        continue
      }

      // 취소 선택 시 요율 체크 불필요
      if (newStatus !== '3' && (!row.rate || row.rate === '-1' || Number(row.rate) < 0)) {
        skippedCount++
        continue
      }

      try {
        // push 값에 따라 endorseProcess 결정
        const push = Number(row.push)
        let endorseProcess = ''
        
        if (newStatus === '1') {
          // 미처리: sangtae=1, endorseProcess 전달 안 함
          endorseProcess = ''
        } else if (newStatus === '2') {
          // 처리: push 값에 따라 '청약' 또는 '해지'
          if (push === 1) {
            endorseProcess = '청약'
          } else if (push === 4) {
            endorseProcess = '해지'
          }
        } else if (newStatus === '3') {
          // 취소
          endorseProcess = '취소'
        }

        const requestData: any = {
          num: row.num,
          sangtae: newStatus === '1' ? 1 : 2, // 미처리=1, 처리/취소=2
          push: Number(row.push),
        }
        
        if (endorseProcess) {
          requestData.endorseProcess = endorseProcess
        }
        if (newStatus !== '3') {
          requestData.rate = String(row.rate)
        }
        if (user?.name) {
          requestData.userName = user.name
        }

        const res = await api.post<{ success: boolean }>(
          '/api/insurance/kj-endorse/update-status',
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (res.data.success) successCount++
        else failCount++
      } catch (e) {
        failCount++
      }
    }

    const skipReason = newStatus === '3' ? '취소된 항목 또는 요율 미입력' : '요율 미입력'
    toast.success(
      `배서처리 일괄 변경 완료: 성공 ${successCount}건, 실패 ${failCount}건, 스킵(${skipReason}) ${skippedCount}건`
    )
    setSelectedRowNums(new Set())
    setBulkEndorseProcess('')
    loadEndorseList(pagination.currentPage, pagination.pageSize)
  }

  // 테이블 컬럼 정의
  const columns: Column<EndorseItem>[] = useMemo(
    () => [
      {
        key: '__select__',
        header: (
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(input) => {
              if (input) input.indeterminate = isIndeterminate
            }}
            onChange={toggleSelectAll}
            className="h-4 w-4 cursor-pointer"
            title={isAllSelected ? '전체 해제' : '전체 선택'}
          />
        ),
        cell: (row) => (
          <input
            type="checkbox"
            checked={selectedRowNums.has(row.num)}
            onChange={() => toggleRowSelected(row.num)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 cursor-pointer"
          />
        ),
        className: 'w-10 text-center',
      },
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
        header: '업체명',
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
        header: '성명(나이)',
        cell: (row) => {
          const name = row.name || '-'
          const age = row.age ? `(${row.age})` : ''
          return name !== '-' ? `${name} ${age}` : '-'
        },
        className: 'w-24',
      },
      {
        key: 'jumin',
        header: '주민번호',
        cell: (row) => {
          const jumin = row.jumin || ''
          return jumin ? jumin.replace(/-/g, '') : '-'
        },
        className: 'w-40',
      },
      {
        key: 'phone',
        header: '핸드폰번호',
        cell: (row) => (row.phone ? addPhoneHyphen(row.phone) : '-'),
        className: 'w-36',
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
              className="w-full text-xs px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none"
              style={{
                fontSize: '0.75rem',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
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
        className: 'w-24',
      },
      {
        key: 'standardDate',
        header: '기준일',
        cell: (row) => {
          const standardDate = row.standardDate || '-'
          // 오늘 날짜와 비교
          const today = new Date()
          const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD 형식
          const isToday = standardDate === todayStr
          
          if (standardDate !== '-' && row.num && row.standardDate) {
            return (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenEndorseDayChangeModal(
                    row.standardDate || '',
                    row.num,
                    row.companyNum,
                    row.policyNum,
                    row.companyName
                  )
                }}
                className={`hover:underline ${
                  isToday ? 'text-primary' : 'text-orange-600'
                }`}
              >
                {standardDate}
              </button>
            )
          }
          return (
            <div className={isToday ? '' : 'text-orange-600'}>
              {standardDate}
            </div>
          )
        },
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
        header: '증권종류',
        cell: (row) => GITA_MAP[Number(row.certiType)] || row.certiType || '-',
        className: 'w-24',
      },
      {
        key: 'push',
        header: '상태',
        cell: (row) => ENDORSE_LIST_PUSH_MAP[String(row.push)] || row.push || '-',
        className: 'w-20',
      },
      {
        key: 'endorseProcess',
        header: '배서처리',
        cell: (row) => {
          // 취소 상태 확인 (cancel=45: 해지취소, cancel=12: 청약취소)
          const isCancelled = row.cancel === 45 || row.cancel === '45' || row.cancel === 12 || row.cancel === '12'
          // sangtae=2이고 취소 상태면 '3' (취소), sangtae=2이고 취소가 아니면 '2' (처리), 그 외는 '1' (미처리)
          const currentStatus = isCancelled && row.sangtae === 2 
            ? '3' 
            : String(row.sangtae || '1')
          
          return (
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(row, e.target.value)}
              className="w-full text-xs px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none"
              style={{
                fontSize: '0.75rem',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
              onClick={(e) => e.stopPropagation()}
              disabled={isCancelled && currentStatus === '3'}
            >
              {ENDORSE_PROCESS_OPTIONS.map((opt) => {
                // 취소된 항목은 "처리" 옵션 비활성화
                const isDisabled = isCancelled && opt.value === '2'
                return (
                  <option key={opt.value} value={opt.value} disabled={isDisabled}>
                    {opt.label}
                  </option>
                )
              })}
            </select>
          )
        },
        className: 'w-32',
      },
      {
        key: 'insuranceCom',
        header: '보험사',
        cell: (row) => INSURER_MAP[Number(row.insuranceCom)] || row.insuranceCom || '-',
        className: 'w-10',
      },
      {
        key: 'manager',
        header: '매니저',
        cell: (row) => row.manager || '-',
        className: 'w-20',
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
              className="w-full text-xs px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none"
              style={{
                fontSize: '0.75rem',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
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
        className: 'w-28',
      },
      {
        key: 'premium',
        header: '보험료',
        cell: (row) => {
          const formatAmount = (value: number | undefined): string => {
            if (!value) return ''
            return value.toLocaleString('ko-KR')
          }

          const handlePremiumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            e.stopPropagation()
            // TODO: 보험료 업데이트 API 구현
          }

          const handlePremiumKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.currentTarget.blur()
              // TODO: 보험료 업데이트 API 구현
            }
          }

          return (
            <input
              type="text"
              className="w-full text-xs px-1 py-0.5 text-right border border-transparent bg-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={formatAmount(row.premium)}
              onChange={handlePremiumChange}
              onKeyPress={handlePremiumKeyPress}
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: '13px' }}
            />
          )
        },
        className: 'w-24 text-end',
      },
      {
        key: 'cPremium',
        header: 'C보험료',
        cell: (row) => {
          const formatAmount = (value: number | undefined): string => {
            if (!value) return ''
            return value.toLocaleString('ko-KR')
          }

          const handleCPremiumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            e.stopPropagation()
            // TODO: c보험료 업데이트 API 구현
          }

          const handleCPremiumKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.currentTarget.blur()
              // TODO: c보험료 업데이트 API 구현
            }
          }

          return (
            <input
              type="text"
              className="w-full text-xs px-1 py-0.5 text-right border border-transparent bg-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={formatAmount(row.cPremium)}
              onChange={handleCPremiumChange}
              onKeyPress={handleCPremiumKeyPress}
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: '13px' }}
            />
          )
        },
        className: 'w-24 text-end',
      },
      {
        key: 'duplicate',
        header: '중복',
        cell: (row) => {
          const duplicateText = row.duplicate || '-'
          if (duplicateText === '중복' && row.jumin) {
            return (
              <button
                type="button"
                className="text-primary hover:underline cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedJumin(row.jumin)
                  setDuplicateListModalOpen(true)
                }}
              >
                {duplicateText}
              </button>
            )
          }
          return <span>{duplicateText}</span>
        },
        className: 'w-12',
      },
    ],
    [endorseList, pagination, selectedRowNums, isAllSelected, isIndeterminate, toggleSelectAll]
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
    // 취소 상태 확인
    const isCancelled = row.cancel === 45 || row.cancel === '45' || row.cancel === 12 || row.cancel === '12'
    
    // 취소된 항목은 변경 불가
    if (isCancelled && newStatus !== '3') {
      toast.error('취소된 항목은 변경할 수 없습니다.')
      return
    }

    // 취소 선택 시 요율 체크 불필요
    if (newStatus !== '3' && (!row.rate || row.rate === '-1' || Number(row.rate) < 0)) {
      toast.error('개인 요율부터 입력하세요.')
      return
    }

    // 상태 텍스트 결정
    let statusText = ''
    if (newStatus === '1') statusText = '미처리'
    else if (newStatus === '2') statusText = '처리'
    else if (newStatus === '3') statusText = '취소'

    if (!confirm(`정말로 상태를 ${statusText}로 변경하시겠습니까?`)) {
      return
    }

    try {
      // push 값에 따라 endorseProcess 결정
      const push = Number(row.push)
      let endorseProcess = ''
      
      if (newStatus === '1') {
        // 미처리: sangtae=1, endorseProcess 전달 안 함
        endorseProcess = ''
      } else if (newStatus === '2') {
        // 처리: push 값에 따라 '청약' 또는 '해지'
        if (push === 1) {
          endorseProcess = '청약'
        } else if (push === 4) {
          endorseProcess = '해지'
        }
      } else if (newStatus === '3') {
        // 취소
        endorseProcess = '취소'
      }

      // sangtae 값 계산 (미처리=1, 처리/취소=2)
      const sangtaeValue = newStatus === '1' ? 1 : 2
      
      const requestData: any = {
        num: row.num,
        sangtae: sangtaeValue, // 필수 필드
        push: Number(row.push),
      }
      
      if (endorseProcess) {
        requestData.endorseProcess = endorseProcess
      }
      if (newStatus !== '3') {
        requestData.rate = String(row.rate)
      }
      if (user?.name) {
        requestData.userName = user.name
      }

      // sangtae가 확실히 포함되도록 검증
      if (!requestData.hasOwnProperty('sangtae') || requestData.sangtae === undefined || requestData.sangtae === null) {
        console.error('sangtae가 누락되었습니다!', requestData)
        toast.error('요청 데이터 오류: sangtae 필드가 누락되었습니다.')
        return
      }

      console.log('배서처리 요청 데이터:', requestData)
      console.log('sangtae 값:', requestData.sangtae, '타입:', typeof requestData.sangtae)
      console.log('JSON 직렬화:', JSON.stringify(requestData))
      console.log('sangtae 포함 여부:', 'sangtae' in requestData)

      const res = await api.post<{ success: boolean; message?: string; error?: string }>(
        '/api/insurance/kj-endorse/update-status',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
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
            setFilters({
              push: value,
              progress: '',
              endorseDay: '',
              insuranceCom: '',
              policyNum: '',
              companyNum: '',
              pageSize: filters.pageSize,
            })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={PUSH_OPTIONS}
          className="w-[90px]"
        />
        <FilterBar.Select
          value={filters.progress}
          onChange={(value) => {
            setFilters({
              push: '',
              progress: value,
              endorseDay: '',
              insuranceCom: '',
              policyNum: '',
              companyNum: '',
              pageSize: filters.pageSize,
            })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={PROGRESS_OPTIONS}
          className="w-[110px]"
        />
        <DatePicker
          value={filters.endorseDay}
          onChange={(value) => {
            setFilters({
              push: '',
              progress: '',
              endorseDay: value || '',
              insuranceCom: '',
              policyNum: '',
              companyNum: '',
              pageSize: filters.pageSize,
            })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          variant="filter"
          className="w-[144px]"
        />
        <FilterBar.Select
          value={filters.insuranceCom}
          onChange={(value) => {
            setFilters({
              push: '',
              progress: '',
              endorseDay: '',
              insuranceCom: value,
              policyNum: '',
              companyNum: '',
              pageSize: filters.pageSize,
            })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={insurerOptions}
          className="w-[156px]"
        />
        <FilterBar.Select
          value={filters.policyNum}
          onChange={(value) => {
            setFilters({
              push: '',
              progress: '',
              endorseDay: '',
              insuranceCom: '',
              policyNum: value,
              companyNum: '',
              pageSize: filters.pageSize,
            })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={policySelectOptions}
          className="w-[180px]"
        />
        <FilterBar.Select
          value={filters.companyNum}
          onChange={(value) => {
            setFilters({
              push: '',
              progress: '',
              endorseDay: '',
              insuranceCom: '',
              policyNum: '',
              companyNum: value,
              pageSize: filters.pageSize,
            })
            setPagination({ ...pagination, currentPage: 1 })
          }}
          options={companySelectOptions}
          className="w-[182px]"
        />
        <FilterBar.Select
          value={filters.pageSize}
          onChange={(value) => handlePageSizeChange(Number(value))}
          options={PAGE_SIZE_OPTIONS}
          className="w-[75px]"
        />
        {/* 통계 현황 */}
        <div className="flex items-center gap-4 text-xs px-4 py-2 bg-card rounded-xl border border-border">
          <span className="text-foreground">
            청약: <strong>{stats.subscription.toLocaleString('ko-KR')}</strong>
          </span>
          <span className="text-foreground">
            해지: <strong>{stats.cancellation.toLocaleString('ko-KR')}</strong>
          </span>
          <span className="text-foreground">
            계: <strong>{stats.total.toLocaleString('ko-KR')}</strong>
          </span>
        </div>


        <button
          onClick={handleEndorseStatus}
          className="h-7 px-2 py-0.5 text-xs border border-primary text-primary bg-background rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <BarChart3 className="w-3 h-3" />
          배서현황
        </button>
        <button
          onClick={handleDailyEndorseList}
          className="h-7 px-2 py-0.5 text-xs border border-primary text-primary bg-background rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <List className="w-3 h-3" />
          일일배서리스트
        </button>
        <button
          onClick={handleSmsList}
          className="h-7 px-2 py-0.5 text-xs border border-primary text-primary bg-background rounded-md hover:bg-primary hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <MessageSquare className="w-3 h-3" />
          문자리스트
        </button>
      </FilterBar>

      {/* 일괄 처리 영역 (테이블 위) */}
      {selectedRowNums.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border">
          <span className="text-xs font-medium text-foreground whitespace-nowrap">
            선택 <strong className="text-primary">{selectedRowNums.size}</strong>건
          </span>
          <div className="h-4 w-px bg-border" />
          <select
            value={bulkProgress}
            onChange={(e) => setBulkProgress(e.target.value)}
            className="h-6 text-xs px-2 py-0 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none"
            style={{
              fontSize: '0.7rem',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.4rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.2em 1.2em',
              paddingRight: '2rem',
              width: '110px',
            }}
            title="진행단계 일괄 변경"
          >
            <option value="-1">진행단계</option>
            {PROGRESS_OPTIONS.filter((opt) => opt.value !== '').map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={bulkUpdateProgress}
            className="h-6 px-2 text-xs border border-primary text-primary bg-background rounded hover:bg-primary hover:text-white transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: '0.7rem' }}
          >
            변경
          </button>
          <div className="h-4 w-px bg-border" />
          <select
            value={bulkEndorseProcess}
            onChange={(e) => setBulkEndorseProcess(e.target.value)}
            className="h-6 text-xs px-2 py-0 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none"
            style={{
              fontSize: '0.7rem',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.4rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.2em 1.2em',
              paddingRight: '2rem',
              width: '100px',
            }}
            title="배서처리 일괄 변경"
          >
            <option value="">배서처리</option>
            {ENDORSE_PROCESS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={bulkUpdateEndorseProcess}
            className="h-6 px-2 text-xs border border-primary text-primary bg-background rounded hover:bg-primary hover:text-white transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: '0.7rem' }}
          >
            변경
          </button>
        </div>
      )}

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

      {/* 배서기준일 변경 모달 */}
      {selectedEndorseDayData && (
        <EndorseDayChangeModal
          isOpen={endorseDayChangeModalOpen}
          onClose={() => {
            setEndorseDayChangeModalOpen(false)
            setSelectedEndorseDayData(null)
          }}
          currentEndorseDay={selectedEndorseDayData.currentEndorseDay}
          num={selectedEndorseDayData.num}
          companyNum={selectedEndorseDayData.companyNum}
          policyNum={selectedEndorseDayData.policyNum}
          companyName={selectedEndorseDayData.companyName}
          onSuccess={() => {
            // 배서기준일 변경 성공 시 리스트 새로고침
            loadEndorseList(pagination.currentPage, pagination.pageSize)
          }}
        />
      )}

      {/* 중복 리스트 모달 */}
      <DuplicateListModal
        isOpen={duplicateListModalOpen}
        onClose={() => {
          setDuplicateListModalOpen(false)
          setSelectedJumin('')
        }}
        jumin={selectedJumin}
      />
    </div>
  )
}
