import { useState, useEffect } from 'react'
import { Modal, FilterBar, DataTable, LoadingSpinner, useToastHelpers } from '../../../components'
import { Wallet, Plus, List, History, RefreshCw } from 'lucide-react'
import api from '../../../lib/api'
import type { Column } from '../../../components/DataTable'

interface DepositBalanceModalProps {
  isOpen: boolean
  onClose: () => void
}

interface DepositSummary {
  account_num: number
  account_name: string
  mem_id: string
  total_deposit: number
  used_amount: number
  current_balance: number
}

interface Pagination {
  total_count: number
  current_page: number
  limit: number
  total_pages: number
}

type ViewMode = 'summary' | 'charge' | 'list' | 'usage'

export default function DepositBalanceModal({ isOpen, onClose }: DepositBalanceModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('summary')
  const [selectedAccount, setSelectedAccount] = useState<{ num: number; name: string } | null>(null)
  
  // 필터 상태
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 데이터 상태
  const [deposits, setDeposits] = useState<DepositSummary[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [summaryStats, setSummaryStats] = useState({
    totalDeposit: 0,
    totalUsed: 0,
    totalBalance: 0,
  })

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen && viewMode === 'summary') {
      loadDepositSummary()
    }
  }, [isOpen, viewMode, page, pageSize, search])

  // 전체 예치금 현황 로드
  const loadDepositSummary = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: search,
      })

      const response = await api.get(`/pharmacy-deposits/summary?${params}`)
      
      if (response.data.success) {
        const data = response.data.data || []
        const paginationData = response.data.pagination || {}
        
        setDeposits(data)
        setPagination(paginationData)

        // 통계 계산
        const totalDeposit = data.reduce((sum: number, d: DepositSummary) => sum + (parseInt(String(d.total_deposit)) || 0), 0)
        const totalUsed = data.reduce((sum: number, d: DepositSummary) => sum + (parseInt(String(d.used_amount)) || 0), 0)
        const totalBalance = totalDeposit - totalUsed

        setSummaryStats({ totalDeposit, totalUsed, totalBalance })
      } else {
        throw new Error(response.data.message || '데이터를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('예치금 현황 로드 오류:', error)
      toast.error(error.response?.data?.message || error.message || '예치금 현황을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 검색 처리
  const handleSearch = () => {
    setPage(1)
    loadDepositSummary()
  }

  // 새로고침
  const handleRefresh = () => {
    setSearch('')
    setPage(1)
    loadDepositSummary()
  }

  // 금액 포맷팅
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseInt(amount) || 0 : amount
    return num.toLocaleString('ko-KR')
  }

  // 테이블 컬럼 정의
  const columns: Column<DepositSummary>[] = [
    {
      key: 'account_num',
      label: '#',
      className: 'text-center w-16',
      cell: (row, index) => (
        <span className="text-muted-foreground">
          {(pagination ? (pagination.current_page - 1) * pagination.limit : 0) + (index || 0) + 1}
        </span>
      ),
    },
    {
      key: 'account_name',
      label: '거래처명',
      cell: (row) => (
        <div>
          <div className="font-medium text-foreground">{row.account_name}</div>
          <small className="text-muted-foreground">{row.mem_id}</small>
        </div>
      ),
    },
    {
      key: 'total_deposit',
      label: '예치금 총액',
      className: 'text-end',
      cell: (row) => (
        <span className="font-semibold text-[#667eea]">{formatCurrency(row.total_deposit)}원</span>
      ),
    },
    {
      key: 'used_amount',
      label: '사용금액',
      className: 'text-end',
      cell: (row) => (
        <span className="font-semibold text-[#f5576c]">{formatCurrency(row.used_amount)}원</span>
      ),
    },
    {
      key: 'current_balance',
      label: '현재 잔액',
      className: 'text-end',
      cell: (row) => {
        const balance = (parseInt(String(row.total_deposit)) || 0) - (parseInt(String(row.used_amount)) || 0)
        const balanceClass = balance >= 0 ? 'text-success' : 'text-destructive'
        return <span className={`font-bold ${balanceClass}`}>{formatCurrency(balance)}원</span>
      },
    },
    {
      key: 'actions',
      label: '관리',
      className: 'text-center',
      cell: (row) => {
        const balance = (parseInt(String(row.total_deposit)) || 0) - (parseInt(String(row.used_amount)) || 0)
        return (
          <div className="flex gap-1 justify-center">
            <button
              onClick={() => {
                setSelectedAccount({ num: row.account_num, name: row.account_name })
                setViewMode('charge')
              }}
              className="px-2 py-1 text-xs border border-success text-success rounded hover:bg-success hover:text-white transition-colors"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              충전
            </button>
            <button
              onClick={() => {
                setSelectedAccount({ num: row.account_num, name: row.account_name })
                setViewMode('list')
              }}
              className="px-2 py-1 text-xs border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors"
            >
              <List className="w-3 h-3 inline mr-1" />
              예치리스트
            </button>
            <button
              onClick={() => {
                setSelectedAccount({ num: row.account_num, name: row.account_name })
                setViewMode('usage')
              }}
              className="px-2 py-1 text-xs border border-blue-500 text-blue-600 rounded hover:bg-blue-500 hover:text-white transition-colors"
            >
              <History className="w-3 h-3 inline mr-1" />
              사용내역
            </button>
          </div>
        )
      },
    },
  ]

  // 통계 카드 렌더링
  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-sm p-3 text-white">
        <div className="text-xs opacity-75 mb-1">총 예치금액</div>
        <div className="text-lg font-bold">{formatCurrency(summaryStats.totalDeposit)}원</div>
      </div>
      <div className="bg-gradient-to-br from-pink-400 to-red-500 rounded-lg shadow-sm p-3 text-white">
        <div className="text-xs opacity-75 mb-1">총 사용금액</div>
        <div className="text-lg font-bold">{formatCurrency(summaryStats.totalUsed)}원</div>
      </div>
      <div className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg shadow-sm p-3 text-white">
        <div className="text-xs opacity-75 mb-1">총 잔액</div>
        <div className="text-lg font-bold">{formatCurrency(summaryStats.totalBalance)}원</div>
      </div>
    </div>
  )

  if (loading && deposits.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="예치금 관리" maxWidth="6xl" maxHeight="90vh">
        <LoadingSpinner size="lg" text="예치금 정보를 불러오는 중..." />
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <span>예치금 관리</span>
        </div>
      }
      maxWidth="6xl"
      maxHeight="90vh"
    >
      <div className="space-y-4">
        {/* 통계 카드 */}
        {viewMode === 'summary' && renderSummaryCards()}

        {/* 필터 영역 */}
        {viewMode === 'summary' && (
          <FilterBar
            actionButtons={
              <>
                <button
                  onClick={handleRefresh}
                  className="px-3 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  새로고침
                </button>
              </>
            }
          >
            <FilterBar.Input
              value={search}
              onChange={(value) => setSearch(value)}
              placeholder="거래처명으로 검색"
              onSearch={handleSearch}
            />
            <FilterBar.SearchButton onClick={handleSearch} />
          </FilterBar>
        )}

        {/* 테이블 */}
        {viewMode === 'summary' && (
          <DataTable
            columns={columns}
            data={deposits}
            loading={loading}
            pagination={
              pagination
                ? {
                    currentPage: pagination.current_page,
                    totalPages: pagination.total_pages,
                    totalCount: pagination.total_count,
                    pageSize: pagination.limit,
                    onPageChange: (newPage) => {
                      setPage(newPage)
                    },
                  }
                : undefined
            }
            emptyMessage="검색된 데이터가 없습니다."
          />
        )}

        {/* TODO: 서브 모달 구현 */}
        {/* {viewMode === 'charge' && <DepositChargeModal ... />} */}
        {/* {viewMode === 'list' && <DepositListModal ... />} */}
        {/* {viewMode === 'usage' && <DepositUsageModal ... />} */}
      </div>
    </Modal>
  )
}
