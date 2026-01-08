import { useState, useEffect } from 'react'
import { Modal, FilterBar, DataTable, DatePicker, useToastHelpers } from '../../../components'
import { List, RefreshCw } from 'lucide-react'
import api from '../../../lib/api'
import type { Column } from '../../../components/DataTable'

interface DepositListModalProps {
  isOpen: boolean
  onClose: () => void
  accountNum: number
  accountName: string
}

interface DepositItem {
  num: number
  money: number
  money_formatted: string
  wdate: string
  wdate_formatted: string
}

interface Pagination {
  total_count: number
  current_page: number
  limit: number
  total_pages: number
}

interface Summary {
  total_deposit: number
  total_deposit_formatted: string
  current_balance: number
  current_balance_formatted: string
  used_amount: number
  used_amount_formatted: string
}

export default function DepositListModal({
  isOpen,
  onClose,
  accountNum,
  accountName,
}: DepositListModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [deposits, setDeposits] = useState<DepositItem[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (isOpen && accountNum && accountNum > 0) {
      loadDepositList()
    }
  }, [isOpen, accountNum, page, pageSize, startDate, endDate])

  // accountNum이 유효하지 않으면 모달을 렌더링하지 않음
  if (!isOpen || !accountNum || accountNum <= 0) {
    return null
  }

  const loadDepositList = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      })

      if (startDate) {
        params.append('start_date', startDate)
      }
      if (endDate) {
        params.append('end_date', endDate)
      }

      const response = await api.get(`/api/pharmacy-deposits/list/${accountNum}?${params}`)

      if (response.data.success) {
        setDeposits(response.data.data || [])
        setPagination(response.data.pagination || null)
        setSummary(response.data.summary || null)
      } else {
        throw new Error(response.data.error || '예치금 리스트를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('예치금 리스트 로드 오류:', error)
      toast.error(
        error.response?.data?.error || error.message || '예치금 리스트를 불러오는 중 오류가 발생했습니다.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadDepositList()
  }

  const handleRefresh = () => {
    setStartDate('')
    setEndDate('')
    setPage(1)
    loadDepositList()
  }

  // 금액 포맷팅
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount
    return num.toLocaleString('ko-KR')
  }

  // 테이블 컬럼 정의
  const columns: Column<DepositItem>[] = [
    {
      key: 'num',
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
      key: 'wdate',
      header: '입금일',
      cell: (row) => (
        <div className="text-xs">
          <div>{row.wdate_formatted}</div>
          <div className="text-muted-foreground text-[10px]">{row.wdate}</div>
        </div>
      ),
    },
    {
      key: 'money',
      header: '입금액',
      className: 'text-end',
      cell: (row) => (
        <span className="font-semibold text-[#667eea]">{formatCurrency(row.money)}원</span>
      ),
    },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <List className="w-5 h-5" />
          <span>예치금 리스트</span>
        </div>
      }
      maxWidth="4xl"
      maxHeight="90vh"
    >
      <div className="space-y-4">
        {/* 거래처 정보 및 통계 */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-600 mb-2">거래처: {accountName} (번호: {accountNum})</div>
          {summary && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-gray-600">총 예치금액</div>
                <div className="font-semibold text-[#667eea]">{summary.total_deposit_formatted}</div>
              </div>
              <div>
                <div className="text-gray-600">사용금액</div>
                <div className="font-semibold text-[#f5576c]">{summary.used_amount_formatted}</div>
              </div>
              <div>
                <div className="text-gray-600">현재 잔액</div>
                <div className="font-semibold text-green-600">{summary.current_balance_formatted}</div>
              </div>
            </div>
          )}
        </div>

        {/* 필터 영역 */}
        <FilterBar>
          <DatePicker
            variant="filter"
            value={startDate}
            onChange={(value) => setStartDate(value)}
            placeholder="시작일"
            className="w-40"
          />
          <DatePicker
            variant="filter"
            value={endDate}
            onChange={(value) => setEndDate(value)}
            placeholder="종료일"
            className="w-40"
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
          emptyMessage="입금 내역이 없습니다."
        />
      </div>
    </Modal>
  )
}
