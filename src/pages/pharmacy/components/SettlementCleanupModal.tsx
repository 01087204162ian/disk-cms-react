import { useState, useEffect } from 'react'
import { Modal, DataTable, useToastHelpers, LoadingSpinner } from '../../../components'
import { AlertTriangle } from 'lucide-react'
import api from '../../../lib/api'
import type { Column } from '../../../components/DataTable'

interface SettlementCleanupModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CleanupItem {
  applyNum: string
  sangtae: string
  approvalPreminum: string
  settlementAccount: string
  pharmacyAccount: string
}

export default function SettlementCleanupModal({
  isOpen,
  onClose,
}: SettlementCleanupModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [cleanupList, setCleanupList] = useState<CleanupItem[]>([])

  useEffect(() => {
    if (isOpen) {
      loadCleanupList()
    }
  }, [isOpen])

  const loadCleanupList = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/pharmacy/cleanup')

      if (response.data.success) {
        setCleanupList(response.data.data || [])
      } else {
        throw new Error(response.data.error || '정리 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('정리 데이터 로드 오류:', error)
      toast.error(
        error.response?.data?.error || error.message || '정리 데이터를 불러오는 중 오류가 발생했습니다.'
      )
    } finally {
      setLoading(false)
    }
  }

  // 금액 포맷팅
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount
    return num.toLocaleString('ko-KR')
  }

  // 상태명 변환
  const getStatusName = (sangtae: string) => {
    switch (sangtae) {
      case '1':
        return '정상'
      case '2':
        return '보류 또는 메일보냄'
      default:
        return sangtae
    }
  }

  // 테이블 컬럼 정의
  const columns: Column<CleanupItem>[] = [
    {
      key: 'applyNum',
      header: '신청번호',
      className: 'text-center',
      cell: (row) => (
        <div className="text-xs font-medium text-primary">{row.applyNum}</div>
      ),
    },
    {
      key: 'sangtae',
      header: '상태',
      className: 'text-center',
      cell: (row) => (
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
          {getStatusName(row.sangtae)}
        </span>
      ),
    },
    {
      key: 'approvalPreminum',
      header: '승인보험료',
      className: 'text-end',
      cell: (row) => (
        <span className="text-xs font-semibold">{formatCurrency(row.approvalPreminum)}원</span>
      ),
    },
    {
      key: 'settlementAccount',
      header: '정산 거래처',
      className: 'text-center',
      cell: (row) => (
        <span className="text-xs text-red-600 font-medium">{row.settlementAccount}</span>
      ),
    },
    {
      key: 'pharmacyAccount',
      header: '약국 거래처',
      className: 'text-center',
      cell: (row) => (
        <span className="text-xs text-blue-600 font-medium">{row.pharmacyAccount}</span>
      ),
    },
  ]

  if (loading && cleanupList.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="정산 데이터 정리" maxWidth="6xl" maxHeight="90vh">
        <LoadingSpinner size="lg" text="정리 데이터를 불러오는 중..." />
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span>정산 데이터 정리</span>
        </div>
      }
      maxWidth="6xl"
      maxHeight="90vh"
    >
      <div className="space-y-4">
        {/* 안내 메시지 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-yellow-800 mb-1">
                거래처 불일치 데이터
              </div>
              <div className="text-xs text-yellow-700">
                아래 목록은 <code className="bg-yellow-100 px-1 rounded">pharmacy_settlementList</code>의{' '}
                <code className="bg-yellow-100 px-1 rounded">account</code>와{' '}
                <code className="bg-yellow-100 px-1 rounded">pharmacyApply</code>의{' '}
                <code className="bg-yellow-100 px-1 rounded">account</code>가 다른 데이터입니다.
              </div>
            </div>
          </div>
        </div>

        {/* 통계 정보 */}
        {cleanupList.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-700">
              총 <strong className="text-red-600">{cleanupList.length}</strong>건의 불일치 데이터가
              발견되었습니다.
            </div>
          </div>
        )}

        {/* 테이블 */}
        <div className="border rounded-lg overflow-hidden">
          <DataTable
            columns={columns}
            data={cleanupList}
            loading={loading}
            emptyMessage="불일치 데이터가 없습니다."
          />
        </div>
      </div>
    </Modal>
  )
}

