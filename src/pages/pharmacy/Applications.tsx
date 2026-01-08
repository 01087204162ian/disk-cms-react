import { useEffect, useState, useMemo } from 'react'
import { Plus, Key, TrendingUp, Wallet, RefreshCw } from 'lucide-react'
import api from '../../lib/api'
import {
  FilterBar,
  DataTable,
  type Column,
  ExportButton,
  ButtonGroup,
  LoadingSpinner,
  Modal,
  FormInput,
  Select,
  useToastHelpers,
} from '../../components'
import AddCompanyModal from './components/AddCompanyModal'
import DailyReportModal from './components/DailyReportModal'
import DepositBalanceModal from './components/DepositBalanceModal'
import ApiManagerModal from './components/ApiManagerModal'
import PharmacyDetailModal from './components/PharmacyDetailModal'

interface PharmacyApplication {
  id: number
  company_name: string
  business_number: string
  manager: string
  phone?: string
  contact?: string
  design_number_professional?: string
  design_number_fire?: string
  request_date?: string
  approval_date?: string
  status: number
  status_name: string
  memo?: string
  premium?: number
  account?: string
}

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: '10', label: '메일보냄' },
  { value: '13', label: '승인' },
  { value: '7', label: '보류' },
  { value: '14', label: '증권발급' },
  { value: '15', label: '해지요청' },
  { value: '16', label: '해지완료' },
  { value: '17', label: '설계중' },
]

export default function Applications() {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<PharmacyApplication[]>([])
  const [accounts, setAccounts] = useState<Array<{ value: string; label: string }>>([])

  // 필터 상태
  const [filters, setFilters] = useState({
    account: '',
    status: '13', // 기본값: 승인
    pageSize: '20',
    search: '',
  })

  // 페이지네이션
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
  })

  // 모달 상태
  const [addCompanyModalOpen, setAddCompanyModalOpen] = useState(false)
  const [dailyReportModalOpen, setDailyReportModalOpen] = useState(false)
  const [depositBalanceModalOpen, setDepositBalanceModalOpen] = useState(false)
  const [apiManagerModalOpen, setApiManagerModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<number | null>(null)

  // 데이터 로드
  const loadApplications = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
      }
      if (filters.account) params.account = filters.account
      if (filters.status) params.status = filters.status
      if (filters.search) params.search = filters.search

      const res = await api.get('/api/pharmacy/list', { params })
      if (res.data?.success) {
        // API 응답 구조에 맞게 데이터 변환
        const data = res.data.data || []
        const transformedData = data.map((item: any) => ({
          id: item.num,
          company_name: item.company || '',
          business_number: item.business_number || '',
          manager: item.chemist || item.manager || '',
          phone: item.phone || item.mobile || '',
          contact: item.contact || item.tel || '',
          design_number_professional: item.design_number_professional || item.professional_design || '',
          design_number_fire: item.design_number_fire || item.fire_design || '',
          request_date: item.request_date || item.created_at || '',
          approval_date: item.approval_date || item.approved_at || '',
          status: item.status || item.status_id || 0,
          status_name: item.status_name || getStatusName(item.status || item.status_id || 0),
          memo: item.memo || item.remark || '',
          premium: item.premium || item.insurance_premium || 0,
          account: item.account_company || item.account || '',
        }))
        setApplications(transformedData)
        setPagination((prev) => ({
          ...prev,
          totalCount: res.data.total_count || res.data.total || data.length,
        }))
      }
    } catch (error: any) {
      console.error('약국배상책임보험 목록 로드 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 상태명 변환 함수
  const getStatusName = (status: number): string => {
    const statusMap: Record<number, string> = {
      7: '보류',
      10: '메일보냄',
      13: '승인',
      14: '증권발급',
      15: '해지요청',
      16: '해지완료',
      17: '설계중',
    }
    return statusMap[status] || '알 수 없음'
  }

  // 거래처 목록 로드
  const loadAccounts = async () => {
    try {
      const res = await api.get('/api/pharmacy/accounts')
      if (res.data?.success) {
        const accountOptions = [
          { value: '', label: '전체 거래처' },
          ...(res.data.data || []).map((acc: any) => ({
            value: acc.num || acc.id || acc.code,
            label: acc.directory || acc.name || acc.code,
          })),
        ]
        setAccounts(accountOptions)
      }
    } catch (error) {
      console.error('거래처 목록 로드 오류:', error)
    }
  }

  useEffect(() => {
    loadAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, pagination.pageSize, filters])

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
    loadApplications()
  }

  const handleRefresh = () => {
    loadApplications()
  }

  const handleExportExcel = async () => {
    try {
      toast.info('엑셀 다운로드 중...')
      const params: any = {}
      if (filters.account) params.account = filters.account
      if (filters.status) params.status = filters.status
      if (filters.search) params.search = filters.search

      const res = await api.get('/api/pharmacy/list', {
        params,
        responseType: 'blob',
      })

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pharmacy_applications_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('엑셀 다운로드가 완료되었습니다.')
    } catch (error: any) {
      console.error('엑셀 다운로드 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '엑셀 다운로드 중 오류가 발생했습니다.')
    }
  }

  // 테이블 컬럼 정의
  const columns: Column<PharmacyApplication>[] = useMemo(
    () => [
      {
        key: 'id',
        header: '#',
        className: 'w-12 text-center',
        cell: (row) => {
          const index = applications.findIndex((item) => item.id === row.id)
          return (pagination.currentPage - 1) * pagination.pageSize + index + 1
        },
      },
      {
        key: 'company_name',
        header: '업체명',
        cell: (row) => (
          <button
            onClick={() => {
              setSelectedPharmacyId(row.id)
              setDetailModalOpen(true)
            }}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {row.company_name}
          </button>
        ),
      },
      {
        key: 'business_number',
        header: '사업자번호',
      },
      {
        key: 'manager',
        header: '담당자',
      },
      {
        key: 'phone',
        header: '휴대전화',
        className: 'hidden lg:table-cell',
        hidden: true,
      },
      {
        key: 'contact',
        header: '연락처',
        className: 'hidden xl:table-cell',
        hidden: true,
      },
      {
        key: 'design_number_professional',
        header: '전문설계번호',
        className: 'hidden lg:table-cell',
        hidden: true,
      },
      {
        key: 'design_number_fire',
        header: '화재설계번호',
        className: 'hidden lg:table-cell',
        hidden: true,
      },
      {
        key: 'request_date',
        header: '가입요청일',
        className: 'hidden xl:table-cell',
        hidden: true,
        cell: (row) => (row.request_date ? new Date(row.request_date).toLocaleDateString('ko-KR') : '-'),
      },
      {
        key: 'approval_date',
        header: '승인일',
        cell: (row) => (row.approval_date ? new Date(row.approval_date).toLocaleDateString('ko-KR') : '-'),
      },
      {
        key: 'status',
        header: '상태',
        cell: (row) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              row.status === 13
                ? 'bg-green-100 text-green-800'
                : row.status === 7
                  ? 'bg-yellow-100 text-yellow-800'
                  : row.status === 14
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
            }`}
          >
            {row.status_name}
          </span>
        ),
      },
      {
        key: 'memo',
        header: '메모',
        className: 'hidden xl:table-cell',
        hidden: true,
        cell: (row) => <span className="text-gray-600">{row.memo || '-'}</span>,
      },
      {
        key: 'premium',
        header: '보험료',
        className: 'text-right',
        cell: (row) => (row.premium ? row.premium.toLocaleString('ko-KR') + '원' : '-'),
      },
      {
        key: 'account',
        header: '거래처',
        cell: (row) => row.account || '-',
      },
    ],
    [pagination.currentPage, pagination.pageSize, applications]
  )

  // 모바일 카드 렌더링
  const mobileCard = (application: PharmacyApplication) => (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">{application.company_name}</div>
          <div className="text-xs text-gray-500 mt-1">
            사업자번호: {application.business_number} | 담당자: {application.manager}
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            application.status === 13
              ? 'bg-green-100 text-green-800'
              : application.status === 7
                ? 'bg-yellow-100 text-yellow-800'
                : application.status === 14
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
          }`}
        >
          {application.status_name}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
        <div>승인일: {application.approval_date ? new Date(application.approval_date).toLocaleDateString('ko-KR') : '-'}</div>
        <div className="text-right">보험료: {application.premium ? application.premium.toLocaleString('ko-KR') + '원' : '-'}</div>
        {application.account && <div className="col-span-2">거래처: {application.account}</div>}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 필터 영역 */}
      <FilterBar
        actionButtons={
          <FilterBar.Stats>
            전체 {pagination.totalCount}건
          </FilterBar.Stats>
        }
      >
        <FilterBar.Select
          value={filters.account}
          onChange={(e) => setFilters((prev) => ({ ...prev, account: e.target.value }))}
          options={accounts}
        />
        <FilterBar.Select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          options={STATUS_OPTIONS}
        />
        <FilterBar.Select
          value={filters.pageSize}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, pageSize: e.target.value }))
            setPagination((prev) => ({ ...prev, pageSize: parseInt(e.target.value, 10), currentPage: 1 }))
          }}
          options={[
            { value: '20', label: '20개' },
            { value: '50', label: '50개' },
            { value: '100', label: '100개' },
          ]}
        />
        <FilterBar.Input
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          placeholder="업체명, 사업자번호, 담당자로 검색"
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSearch()
          }}
        />
        <FilterBar.SearchButton onClick={handleSearch} />
      </FilterBar>

      {/* 액션 버튼 영역 */}
      <ButtonGroup justify="between" wrap>
        <ButtonGroup gap="sm">
          <button
            onClick={() => setDailyReportModalOpen(true)}
            className="px-3 py-1.5 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition-colors flex items-center gap-1"
          >
            <TrendingUp className="w-3 h-3" />
            <span className="hidden md:inline">일별실적</span>
          </button>
          <button
            onClick={() => setDepositBalanceModalOpen(true)}
            className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            <Wallet className="w-3 h-3" />
            <span className="hidden md:inline">예치잔액</span>
          </button>
          <ExportButton
            onClick={handleExportExcel}
            variant="sm"
            label="승인건중 설계리스트 엑셀"
            showLabel={false}
            className="bg-red-500 hover:bg-red-600"
          />
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-gray-500 text-white rounded text-xs font-medium hover:bg-gray-600 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">새로고침</span>
          </button>
        </ButtonGroup>
        <ButtonGroup gap="sm">
          <button
            onClick={() => setAddCompanyModalOpen(true)}
            className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden md:inline">업체추가</span>
          </button>
          <button
            onClick={() => setApiManagerModalOpen(true)}
            className="px-3 py-1.5 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors flex items-center gap-1"
          >
            <Key className="w-3 h-3" />
            <span className="hidden md:inline">API 관리</span>
          </button>
        </ButtonGroup>
      </ButtonGroup>

      {/* 테이블 */}
      <DataTable
        data={applications}
        columns={columns}
        loading={loading}
        emptyMessage="등록된 약국배상책임보험이 없습니다."
        pagination={{
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalCount: pagination.totalCount,
          onPageChange: (page) => setPagination((prev) => ({ ...prev, currentPage: page })),
          onPageSizeChange: (size) => {
            setPagination((prev) => ({ ...prev, pageSize: size, currentPage: 1 }))
            setFilters((prev) => ({ ...prev, pageSize: String(size) }))
          },
          pageSizeOptions: [20, 50, 100],
        }}
        mobileCard={mobileCard}
      />

      {/* 업체 추가 모달 */}
      <AddCompanyModal
        isOpen={addCompanyModalOpen}
        onClose={() => setAddCompanyModalOpen(false)}
        onSuccess={() => {
          loadApplications()
          loadAccounts()
        }}
      />

      {/* 일별실적 모달 */}
      <DailyReportModal isOpen={dailyReportModalOpen} onClose={() => setDailyReportModalOpen(false)} />

      {/* 예치잔액 모달 */}
      <DepositBalanceModal isOpen={depositBalanceModalOpen} onClose={() => setDepositBalanceModalOpen(false)} />

      {/* API 관리 모달 */}
      <ApiManagerModal isOpen={apiManagerModalOpen} onClose={() => setApiManagerModalOpen(false)} />

      {/* 상세 모달 */}
      <PharmacyDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedPharmacyId(null)
        }}
        pharmacyId={selectedPharmacyId}
        onUpdate={() => {
          loadApplications()
        }}
      />
    </div>
  )
}
