import { useState, useEffect } from 'react'
import { Modal, FilterBar, DataTable, DatePicker, useToastHelpers } from '../../../components'
import { History, RefreshCw } from 'lucide-react'
import api from '../../../lib/api'
import type { Column } from '../../../components/DataTable'

interface DepositUsageModalProps {
  isOpen: boolean
  onClose: () => void
  accountNum: number
  accountName: string
}

interface UsageItem {
  num: number
  applyNum: number
  sort: string
  sortName: string
  approvalPreminum: number
  proPreminum: number
  areaPreminum: number
  wdate: string
  sangtae: string
  account: number
  company: string
  damdangja: string
  hphone: string
  delta_approval: number
}

interface Pagination {
  total_count: number
  current_page: number
  limit: number
  total_pages: number
}

interface Summary {
  total_used: number
  total_used_formatted: string
  total_pro_preminum: number
  total_pro_preminum_formatted: string
  total_area_preminum: number
  total_area_preminum_formatted: string
  net_change: number
  net_change_formatted: string
  net_pro_change: number
  net_pro_change_formatted: string
  net_area_change: number
  net_area_change_formatted: string
}

export default function DepositUsageModal({
  isOpen,
  onClose,
  accountNum,
  accountName,
}: DepositUsageModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [usageList, setUsageList] = useState<UsageItem[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (isOpen && accountNum && accountNum > 0) {
      loadUsageList()
    }
  }, [isOpen, accountNum, page, pageSize, startDate, endDate])

  // accountNum이 유효하지 않으면 모달을 렌더링하지 않음
  if (!isOpen || !accountNum || accountNum <= 0) {
    return null
  }

  const loadUsageList = async () => {
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

      const response = await api.get(`/api/pharmacy-deposits/usage/${accountNum}?${params}`)

      if (response.data.success) {
        setUsageList(response.data.data || [])
        setPagination(response.data.pagination || null)
        setSummary(response.data.summary || null)
      } else {
        throw new Error(response.data.error || '사용 내역을 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('사용 내역 로드 오류:', error)
      toast.error(
        error.response?.data?.error || error.message || '사용 내역을 불러오는 중 오류가 발생했습니다.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadUsageList()
  }

  const handleRefresh = () => {
    setStartDate('')
    setEndDate('')
    setPage(1)
    loadUsageList()
  }

  // 금액 포맷팅
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount
    return num.toLocaleString('ko-KR')
  }

  // 상태별 색상
  const getSortColor = (sort: string) => {
    switch (sort) {
      case '13': // 승인
        return 'text-[#f5576c]'
      case '7': // 취소
      case '16': // 해지완료
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  // 테이블 컬럼 정의
  const columns: Column<UsageItem>[] = [
    {
      key: 'num',
      header: '#',
      className: 'text-center w-16',
      cell: (row) => {
        const index = usageList.indexOf(row)
        return (
          <span className="text-muted-foreground">
            {(pagination ? (pagination.current_page - 1) * pagination.limit : 0) + index + 1}
          </span>
        )
      },
    },
    {
      key: 'wdate',
      header: '일자',
      cell: (row) => (
        <div className="text-xs">
          <div>{new Date(row.wdate).toLocaleDateString('ko-KR')}</div>
          <div className="text-muted-foreground text-[10px]">
            {new Date(row.wdate).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'sortName',
      header: '구분',
      cell: (row) => (
        <span className={`text-xs font-medium ${getSortColor(row.sort)}`}>{row.sortName}</span>
      ),
    },
    {
      key: 'applyNum',
      header: '신청번호',
      className: 'text-center',
      cell: (row) => <span className="text-xs">{row.applyNum || '-'}</span>,
    },
    {
      key: 'company',
      header: '업체명',
      cell: (row) => (
        <div className="text-xs">
          <div>{row.company || '-'}</div>
          {row.damdangja && (
            <div className="text-muted-foreground text-[10px]">{row.damdangja}</div>
          )}
        </div>
      ),
    },
    {
      key: 'delta_approval',
      header: '예치금 변동',
      className: 'text-end',
      cell: (row) => {
        const delta = row.delta_approval
        const isPositive = delta > 0
        return (
          <span
            className={`text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-[#f5576c]'}`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(delta)}원
          </span>
        )
      },
    },
    {
      key: 'approvalPreminum',
      header: '보험료',
      className: 'text-end',
      cell: (row) => (
        <span className="text-xs font-medium">{formatCurrency(row.approvalPreminum)}원</span>
      ),
    },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <History className="w-5 h-5" />
          <span>사용 내역</span>
        </div>
      }
      maxWidth="6xl"
      maxHeight="90vh"
    >
      <div className="space-y-4">
        {/* 거래처 정보 및 통계 */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-600 mb-2">거래처: {accountName} (번호: {accountNum})</div>
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <div className="text-gray-600">총 사용금액</div>
                <div className="font-semibold text-[#f5576c]">{summary.total_used_formatted}</div>
              </div>
              <div>
                <div className="text-gray-600">순 변동액</div>
                <div
                  className={`font-semibold ${
                    summary.net_change >= 0 ? 'text-green-600' : 'text-[#f5576c]'
                  }`}
                >
                  {summary.net_change >= 0 ? '+' : ''}
                  {summary.net_change_formatted}
                </div>
              </div>
              <div>
                <div className="text-gray-600">전문인 보험료</div>
                <div className="font-semibold">{summary.total_pro_preminum_formatted}</div>
              </div>
              <div>
                <div className="text-gray-600">지역 보험료</div>
                <div className="font-semibold">{summary.total_area_preminum_formatted}</div>
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
          data={usageList}
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
          emptyMessage="사용 내역이 없습니다."
        />
      </div>
    </Modal>
  )
}
