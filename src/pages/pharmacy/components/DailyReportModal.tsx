import { useState, useEffect } from 'react'
import { Modal, Select, LoadingSpinner, useToastHelpers } from '../../../components'
import api from '../../../lib/api'

interface DailyReportModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Account {
  num: string
  directory: string
}

type ReportMode = 'daily' | 'monthly'

export default function DailyReportModal({ isOpen, onClose }: DailyReportModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [reportMode, setReportMode] = useState<ReportMode>('daily')
  
  // 필터 상태
  const [filters, setFilters] = useState({
    account: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  })

  // 결과 데이터
  const [resultData, setResultData] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)

  // 거래처 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadAccounts()
    }
  }, [isOpen])

  const loadAccounts = async () => {
    try {
      const res = await api.get('/api/pharmacy/accounts')
      if (res.data?.success) {
        setAccounts(res.data.data || [])
      }
    } catch (error: any) {
      console.error('거래처 목록 로드 오류:', error)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params: any = {
        account: filters.account,
        year: filters.year,
        month: filters.month,
      }

      const endpoint = reportMode === 'daily' 
        ? '/api/pharmacy-reports/daily' 
        : '/api/pharmacy-reports/monthly'

      const res = await api.get(endpoint, { params })
      if (res.data?.success) {
        setResultData(res.data.data || [])
        setSummary(res.data.summary || {})
      } else {
        throw new Error(res.data?.message || '데이터를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('실적 조회 오류:', error)
      toast.error(error?.response?.data?.message || error?.message || '실적을 조회하는 중 오류가 발생했습니다.')
      setResultData(null)
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  // 년도 옵션 (최근 3년)
  const yearOptions = []
  const currentYear = new Date().getFullYear()
  for (let i = 0; i < 3; i++) {
    const year = currentYear - i
    yearOptions.push({ value: String(year), label: `${year}년` })
  }

  // 월 옵션
  const monthOptions = []
  for (let i = 1; i <= 12; i++) {
    monthOptions.push({ value: String(i), label: `${i}월` })
  }

  const formatCurrency = (amount: number | string) => {
    if (!amount || amount === 0) return ''
    return parseInt(String(amount)).toLocaleString('ko-KR')
  }

  const renderStatsCards = () => {
    if (!summary) return null

    const netAmount = (summary.total_approval_amount || 0) - (summary.total_cancel_amount || 0)
    const netCount = (summary.total_approval_count || 0) - (summary.total_cancel_count || 0)

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* 승인 */}
        <div className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg shadow-sm p-3 text-white text-center">
          <div className="text-xs opacity-75 mb-1">승인</div>
          <div className="text-lg font-bold">
            {formatCurrency(summary.total_approval_amount || 0)}(
            {formatCurrency(summary.total_approval_count || 0)})
          </div>
        </div>
        {/* 해지 */}
        <div className="bg-gradient-to-br from-pink-400 to-red-400 rounded-lg shadow-sm p-3 text-white text-center">
          <div className="text-xs opacity-75 mb-1">해지</div>
          <div className="text-lg font-bold">
            {formatCurrency(summary.total_cancel_amount || 0)}(
            {formatCurrency(summary.total_cancel_count || 0)})
          </div>
        </div>
        {/* 합계 */}
        <div className="bg-gradient-to-br from-green-400 to-teal-400 rounded-lg shadow-sm p-3 text-white text-center">
          <div className="text-xs opacity-75 mb-1">합계</div>
          <div className="text-lg font-bold">
            {formatCurrency(netAmount)}({formatCurrency(netCount)})
          </div>
        </div>
      </div>
    )
  }

  const renderCalendar = () => {
    if (!resultData || resultData.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-3 opacity-30">📅</div>
          <div>조회된 데이터가 없습니다.</div>
        </div>
      )
    }

    // 달력 구조 생성 (간단한 버전 - 필요시 개선)
    return (
      <div className="space-y-4">
        {resultData.map((item: any, index: number) => (
          <div key={index} className="border rounded-lg p-3">
            <div className="font-medium">{item.date || item.day}</div>
            <div className="text-sm text-muted-foreground">
              승인: {formatCurrency(item.approval_amount || 0)} ({formatCurrency(item.approval_count || 0)})
              {item.cancel_amount > 0 && (
                <> / 해지: {formatCurrency(item.cancel_amount || 0)} ({formatCurrency(item.cancel_count || 0)})</>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="text-success">📊</span>
          일별 실적 {reportMode === 'monthly' ? '(월별)' : '(달력)'}
        </div>
      }
      maxWidth="6xl"
      maxHeight="90vh"
      footer={
        <div className="flex justify-between items-center w-full">
          <button
            onClick={() => {
              setReportMode(reportMode === 'daily' ? 'monthly' : 'daily')
              setResultData(null)
              setSummary(null)
            }}
            className="px-3 py-1.5 bg-info text-info-foreground rounded-lg text-xs font-medium hover:bg-info/90 transition-colors flex items-center gap-1.5"
          >
            {reportMode === 'daily' ? '📊 월별 실적' : '📅 일별 실적'}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-secondary/90 transition-colors"
          >
            닫기
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 필터 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* 거래처 선택 */}
          <div>
            <label className="block text-xs font-medium mb-1">
              <span className="text-primary">🏢</span> 거래처
            </label>
            <Select
              value={filters.account}
              onChange={(e) => setFilters((prev) => ({ ...prev, account: e.target.value }))}
              options={[
                { value: '', label: '전체 거래처' },
                ...accounts.map((acc) => ({ value: acc.num, label: acc.directory })),
              ]}
            />
          </div>

          {/* 년도 선택 */}
          <div>
            <label className="block text-xs font-medium mb-1">
              <span className="text-primary">📅</span> 년도
            </label>
            <Select
              value={String(filters.year)}
              onChange={(e) => setFilters((prev) => ({ ...prev, year: parseInt(e.target.value) }))}
              options={yearOptions}
            />
          </div>

          {/* 월 선택 (일별 모드일 때만) */}
          {reportMode === 'daily' && (
            <div>
              <label className="block text-xs font-medium mb-1">
                <span className="text-primary">📆</span> 월
              </label>
              <Select
                value={String(filters.month)}
                onChange={(e) => setFilters((prev) => ({ ...prev, month: parseInt(e.target.value) }))}
                options={monthOptions}
              />
            </div>
          )}

          {/* 조회 버튼 */}
          <div>
            <label className="block text-xs font-medium mb-1 opacity-0">조회</label>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : '🔍'} 조회
            </button>
          </div>
        </div>

        {/* 로딩 중 */}
        {loading && (
          <div className="text-center py-8">
            <LoadingSpinner size="md" text="실적을 조회하는 중..." />
          </div>
        )}

        {/* 결과 영역 */}
        {!loading && resultData !== null && (
          <>
            {renderStatsCards()}
            {reportMode === 'daily' ? renderCalendar() : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                월별 실적 기능 구현 예정
              </div>
            )}
          </>
        )}

        {/* 초기 상태 */}
        {!loading && resultData === null && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-3 opacity-30">📊</div>
            <div>조회 버튼을 클릭하여 실적을 확인하세요.</div>
          </div>
        )}
      </div>
    </Modal>
  )
}
