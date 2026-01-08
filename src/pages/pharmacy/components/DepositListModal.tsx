import { useState, useEffect } from 'react'
import { Modal, DataTable, useToastHelpers, ExportButton } from '../../../components'
import { List } from 'lucide-react'
import api from '../../../lib/api'
import type { Column } from '../../../components/DataTable'
import ExcelJS from 'exceljs'

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
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (isOpen && accountNum && accountNum > 0) {
      loadDepositList()
    }
  }, [isOpen, accountNum, page, pageSize])

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

  // 엑셀 다운로드
  const handleExportExcel = async () => {
    if (!confirm(`${accountName}의 예치 리스트를 엑셀로 다운로드하시겠습니까?`)) {
      return
    }

    setExporting(true)
    try {
      // 전체 데이터 조회 (최대 10,000건)
      const response = await api.get(`/api/pharmacy-deposits/list/${accountNum}?page=1&limit=10000`)

      if (!response.data.success || !response.data.data || response.data.data.length === 0) {
        toast.error('다운로드할 데이터가 없습니다.')
        return
      }

      const data = response.data.data

      // 워크북 생성
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('예치리스트')

      // 헤더 설정
      worksheet.columns = [
        { header: '번호', key: 'num', width: 10 },
        { header: '예치일', key: 'date', width: 15 },
        { header: '예치금액', key: 'amount', width: 15 },
      ]

      // 스타일 설정
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      }

      // 데이터 추가
      data.forEach((item: DepositItem, index: number) => {
        worksheet.addRow({
          num: index + 1,
          date: item.wdate_formatted || item.wdate?.substring(0, 10) || '',
          amount: item.money || 0,
        })
      })

      // 합계 및 잔액 행 추가
      if (summary) {
        worksheet.addRow({
          num: '',
          date: '합계',
          amount: summary.total_deposit || 0,
        })
        worksheet.addRow({
          num: '',
          date: '잔액',
          amount: summary.current_balance || 0,
        })

        // 합계/잔액 행 스타일
        const lastRow = worksheet.rowCount
        worksheet.getRow(lastRow - 1).font = { bold: true }
        worksheet.getRow(lastRow).font = { bold: true }
        worksheet.getRow(lastRow).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE7F5FF' },
        }
      }

      // 파일명 생성
      const today = new Date().toISOString().substring(0, 10).replace(/-/g, '')
      const safeAccountName = accountName.replace(/[^\w가-힣]/g, '_')
      const fileName = `예치리스트_${safeAccountName}_${today}.xlsx`

      // 다운로드
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('엑셀 파일이 다운로드되었습니다.')
    } catch (error: any) {
      console.error('엑셀 다운로드 오류:', error)
      toast.error(error.message || '엑셀 다운로드 중 오류가 발생했습니다.')
    } finally {
      setExporting(false)
    }
  }

  // 금액 포맷팅
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount
    return num.toLocaleString('ko-KR')
  }

  // 날짜 포맷팅 (YYYY-MM-DD만)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      return dateStr.substring(0, 10)
    } catch {
      return dateStr
    }
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
      header: '예치일',
      className: 'text-center',
      cell: (row) => <span className="text-xs">{formatDate(row.wdate)}</span>,
    },
    {
      key: 'money',
      header: '예치금액',
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
        {/* 거래처 정보 및 액션 버튼 */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <span>{accountName}</span>
            </div>
            <div className="text-xs text-gray-500">거래처번호: {accountNum}</div>
          </div>
          <ExportButton
            onClick={handleExportExcel}
            loading={exporting}
            variant="sm"
            icon="excel"
            showLabel={true}
          />
        </div>

        {/* 테이블 */}
        <div className="border rounded-lg overflow-hidden">
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
            emptyMessage="예치 내역이 없습니다."
          />

          {/* 합계 및 잔액 표시 (테이블 하단) */}
          {summary && deposits.length > 0 && (
            <div className="border-t bg-gray-50">
              <div className="grid grid-cols-3 gap-4 p-3">
                <div className="col-span-2 text-center text-xs font-medium text-gray-700">
                  예치금 합계
                </div>
                <div className="text-end text-sm font-bold text-[#667eea]">
                  {formatCurrency(summary.total_deposit)}원
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-3 bg-blue-50">
                <div className="col-span-2 text-center text-xs font-medium text-gray-700">
                  예치금 잔액
                </div>
                <div className="text-end text-sm font-bold text-green-600">
                  {formatCurrency(summary.current_balance)}원
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
