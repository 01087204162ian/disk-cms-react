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

export default function DepositBalanceModal({ isOpen, onClose }: DepositBalanceModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  
  // 필터 상태
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

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
    if (isOpen) {
      loadDepositSummary()
    }
  }, [isOpen, page, pageSize, search])

  // 전체 예치금 현황 로드
  const loadDepositSummary = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: search,
      })

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1f415213-8b51-4f1e-b83b-efc9ce2f84fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'DepositBalanceModal.tsx:56',
          message: 'API 요청 시작',
          data: { url: `/api/pharmacy-deposits/summary?${params}`, page, pageSize, search },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'A'
        })
      }).catch(() => {})
      // #endregion

      const response = await api.get(`/api/pharmacy-deposits/summary?${params}`)

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1f415213-8b51-4f1e-b83b-efc9ce2f84fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'DepositBalanceModal.tsx:71',
          message: 'API 응답 수신',
          data: { status: response.status, dataKeys: Object.keys(response.data || {}), success: response.data?.success, hasData: !!response.data?.data, hasPagination: !!response.data?.pagination },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'A'
        })
      }).catch(() => {})
      // #endregion
      
      if (response.data.success) {
        const data = response.data.data || []
        const paginationData = response.data.pagination || {}
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1f415213-8b51-4f1e-b83b-efc9ce2f84fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'DepositBalanceModal.tsx:77',
            message: '데이터 처리 성공',
            data: { dataLength: data.length, pagination: paginationData },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'A'
          })
        }).catch(() => {})
        // #endregion
        
        setDeposits(data)
        setPagination(paginationData)

        // 통계 계산 - API에서 받은 값들을 그대로 사용
        const totalDeposit = data.reduce((sum: number, d: DepositSummary) => sum + (parseInt(String(d.total_deposit)) || 0), 0)
        const totalUsed = data.reduce((sum: number, d: DepositSummary) => sum + (parseInt(String(d.used_amount)) || 0), 0)
        // API에서 받은 current_balance 값을 합산 (백엔드에서 계산된 값 사용)
        const totalBalance = data.reduce((sum: number, d: DepositSummary) => sum + (parseInt(String(d.current_balance)) || 0), 0)

        setSummaryStats({ totalDeposit, totalUsed, totalBalance })
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1f415213-8b51-4f1e-b83b-efc9ce2f84fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'DepositBalanceModal.tsx:91',
            message: 'API 응답 success=false',
            data: { responseData: response.data },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'B'
          })
        }).catch(() => {})
        // #endregion
        throw new Error(response.data.message || '데이터를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1f415213-8b51-4f1e-b83b-efc9ce2f84fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'DepositBalanceModal.tsx:97',
          message: 'API 오류 발생',
          data: { 
            message: error.message, 
            responseStatus: error.response?.status, 
            responseData: error.response?.data,
            errorKeys: Object.keys(error || {})
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'C'
        })
      }).catch(() => {})
      // #endregion

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
      header: '#',
      className: 'text-center w-16',
      cell: (row) => {
        const index = deposits.indexOf(row)
        return (
          <span className="text-muted-foreground">
            {(pagination ? (pagination.current_page - 1) * pagination.limit : 0) + index + 1}
          </span>
        )
      },
    },
    {
      key: 'account_name',
      header: '거래처명',
      cell: (row) => (
        <div>
          <div className="font-medium text-foreground">{row.account_name}</div>
          <small className="text-muted-foreground">{row.mem_id}</small>
        </div>
      ),
    },
    {
      key: 'total_deposit',
      header: '예치금 총액',
      className: 'text-end',
      cell: (row) => (
        <span className="font-semibold text-[#667eea]">{formatCurrency(row.total_deposit)}원</span>
      ),
    },
    {
      key: 'used_amount',
      header: '사용금액',
      className: 'text-end',
      cell: (row) => (
        <span className="font-semibold text-[#f5576c]">{formatCurrency(row.used_amount)}원</span>
      ),
    },
    {
      key: 'current_balance',
      header: '현재 잔액',
      className: 'text-end',
      cell: (row) => {
        // API에서 받은 current_balance 값을 그대로 사용 (백엔드에서 계산된 값)
        const balance = parseInt(String(row.current_balance)) || 0
        const balanceClass = balance >= 0 ? 'text-success' : 'text-destructive'
        return <span className={`font-bold ${balanceClass}`}>{formatCurrency(balance)}원</span>
      },
    },
    {
      key: 'actions',
      header: '관리',
      className: 'text-center',
      cell: (row) => (
        <div className="flex gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              // TODO: 충전 모달 열기
              console.log('충전 모달 열기:', row.account_num, row.account_name)
            }}
            className="px-2 py-1 text-xs border border-success text-success rounded hover:bg-success hover:text-white transition-colors"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            충전
          </button>
          <button
            onClick={() => {
              // TODO: 예치리스트 모달 열기
              console.log('예치리스트 모달 열기:', row.account_num, row.account_name)
            }}
            className="px-2 py-1 text-xs border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors"
          >
            <List className="w-3 h-3 inline mr-1" />
            예치리스트
          </button>
          <button
            onClick={() => {
              // TODO: 사용내역 모달 열기
              console.log('사용내역 모달 열기:', row.account_num, row.account_name)
            }}
            className="px-2 py-1 text-xs border border-blue-500 text-blue-600 rounded hover:bg-blue-500 hover:text-white transition-colors"
          >
            <History className="w-3 h-3 inline mr-1" />
            사용내역
          </button>
        </div>
      ),
    },
  ]

  // 통계 카드 렌더링
  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-sm p-3 text-white">
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-75">총 예치금액</span>
          <span className="text-lg font-bold">{formatCurrency(summaryStats.totalDeposit)}원</span>
        </div>
      </div>
      <div className="bg-gradient-to-br from-pink-400 to-red-500 rounded-lg shadow-sm p-3 text-white">
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-75">총 사용금액</span>
          <span className="text-lg font-bold">{formatCurrency(summaryStats.totalUsed)}원</span>
        </div>
      </div>
      <div className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg shadow-sm p-3 text-white">
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-75">총 잔액</span>
          <span className="text-lg font-bold">{formatCurrency(summaryStats.totalBalance)}원</span>
        </div>
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
        {renderSummaryCards()}

        {/* 필터 영역 */}
        <FilterBar>
          <FilterBar.Input
            value={search}
            onChange={(value) => setSearch(value)}
            placeholder="거래처명으로 검색"
            onSearch={handleSearch}
          />
          <FilterBar.SearchButton onClick={handleSearch} />
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            새로고침
          </button>
        </FilterBar>

        {/* 테이블 */}
        <DataTable
            columns={columns}
            data={deposits}
            loading={loading}
            pagination={
              pagination
                ? {
                    currentPage: pagination.current_page,
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

        {/* TODO: 서브 모달 구현 */}
        {/* 충전 모달, 예치리스트 모달, 사용내역 모달은 추후 구현 */}
      </div>
    </Modal>
  )
}
