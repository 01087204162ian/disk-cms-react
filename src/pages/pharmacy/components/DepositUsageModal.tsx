import { useState, useEffect } from 'react'
import { Modal, DataTable, useToastHelpers, ExportButton } from '../../../components'
import { History } from 'lucide-react'
import api from '../../../lib/api'
import type { Column } from '../../../components/DataTable'
import ExcelJS from 'exceljs'

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
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (isOpen && accountNum && accountNum > 0) {
      loadUsageList()
    }
  }, [isOpen, accountNum, page, pageSize])

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

  // 순 변동액 계산 (사용 내역에서 직접 계산)
  const calculateNetChanges = () => {
    let netChange = 0
    let netProChange = 0
    let netAreaChange = 0

    usageList.forEach((usage) => {
      const isRefund = usage.sortName === '취소' || usage.sortName === '해지완료'
      const multiplier = usage.sortName === '승인' ? -1 : isRefund ? 1 : 0

      netChange += (usage.approvalPreminum || 0) * multiplier
      netProChange += (usage.proPreminum || 0) * multiplier
      netAreaChange += (usage.areaPreminum || 0) * multiplier
    })

    return { netChange, netProChange, netAreaChange }
  }

  // 엑셀 다운로드
  const handleExportExcel = async () => {
    if (!confirm(`${accountName}의 사용 내역을 엑셀로 다운로드하시겠습니까?`)) {
      return
    }

    setExporting(true)
    try {
      // 전체 데이터 조회 (최대 10,000건)
      const response = await api.get(`/api/pharmacy-deposits/usage/${accountNum}?page=1&limit=10000`)

      if (!response.data.success || !response.data.data || response.data.data.length === 0) {
        toast.error('다운로드할 데이터가 없습니다.')
        return
      }

      const data = response.data.data

      // 워크북 생성
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('사용내역')

      // 헤더 설정
      worksheet.columns = [
        { header: '번호', key: 'num', width: 8 },
        { header: '신청번호', key: 'applyNum', width: 15 },
        { header: '사용일', key: 'date', width: 12 },
        { header: '승인보험료', key: 'approval', width: 15 },
        { header: '전문인보험료', key: 'pro', width: 15 },
        { header: '화재보험료', key: 'area', width: 15 },
        { header: '구분', key: 'sort', width: 10 },
      ]

      // 스타일 설정
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      }

      // 데이터 추가
      data.forEach((item: UsageItem, index: number) => {
        worksheet.addRow({
          num: index + 1,
          applyNum: item.applyNum || '',
          date: item.wdate?.substring(0, 10) || '',
          approval: item.approvalPreminum || 0,
          pro: item.proPreminum || 0,
          area: item.areaPreminum || 0,
          sort: item.sortName || '',
        })
      })

      // 파일명 생성
      const today = new Date().toISOString().substring(0, 10).replace(/-/g, '')
      const safeAccountName = accountName.replace(/[^\w가-힣]/g, '_')
      const fileName = `사용내역_${safeAccountName}_${today}.xlsx`

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

  // 순 변동액 계산
  const { netChange, netProChange, netAreaChange } = calculateNetChanges()

  // 테이블 컬럼 정의
  const columns: Column<UsageItem>[] = [
    {
      key: 'num',
      header: '#',
      className: 'text-center w-12',
      cell: (row) => {
        const index = usageList.indexOf(row)
        return (
          <span className="text-muted-foreground text-xs">
            {(pagination ? (pagination.current_page - 1) * pagination.limit : 0) + index + 1}
          </span>
        )
      },
    },
    {
      key: 'applyNum',
      header: '신청번호',
      className: 'text-center',
      cell: (row) => (
        <div className="text-xs text-primary">
          {row.company || '-'}({row.applyNum || '-'})
        </div>
      ),
    },
    {
      key: 'wdate',
      header: '사용일',
      className: 'text-center',
      cell: (row) => <span className="text-xs">{formatDate(row.wdate)}</span>,
    },
    {
      key: 'approvalPreminum',
      header: '승인보험료',
      className: 'text-end',
      cell: (row) => (
        <span className="text-xs font-semibold text-[#f5576c]">
          {formatCurrency(row.approvalPreminum)}원
        </span>
      ),
    },
    {
      key: 'proPreminum',
      header: '전문인보험료',
      className: 'text-end',
      cell: (row) => (
        <span className="text-xs text-[#667eea]">{formatCurrency(row.proPreminum)}원</span>
      ),
    },
    {
      key: 'areaPreminum',
      header: '화재보험료',
      className: 'text-end',
      cell: (row) => (
        <span className="text-xs text-[#f093fb]">{formatCurrency(row.areaPreminum)}원</span>
      ),
    },
    {
      key: 'sortName',
      header: '구분',
      className: 'text-center',
      cell: (row) => {
        const isRefund = row.sortName === '취소' || row.sortName === '해지완료'
        const badgeClass =
          row.sortName === '승인'
            ? 'bg-red-500 text-white'
            : isRefund
            ? 'bg-green-500 text-white'
            : 'bg-gray-500 text-white'
        const badgeText = row.sortName === '승인' ? '사용' : isRefund ? '환급' : '기타'
        return (
          <span className={`text-xs px-2 py-0.5 rounded ${badgeClass}`}>{badgeText}</span>
        )
      },
    },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <History className="w-5 h-5" />
          <span>사용 내역 - {accountName}</span>
        </div>
      }
      maxWidth="6xl"
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

          {/* 순 변동액 표시 (테이블 하단) */}
          {usageList.length > 0 && (
            <div className="border-t bg-blue-50">
              <div className="grid grid-cols-7 gap-2 p-3 text-xs">
                <div className="col-span-3 text-center font-medium text-gray-700">
                  순 변동액 (사용-환급)
                </div>
                <div
                  className={`text-end font-bold ${
                    netChange >= 0 ? 'text-green-600' : 'text-[#f5576c]'
                  }`}
                >
                  {formatCurrency(Math.abs(netChange))}원
                  {netChange < 0 && (
                    <div className="text-[10px] text-gray-500 font-normal">(사용)</div>
                  )}
                  {netChange > 0 && (
                    <div className="text-[10px] text-gray-500 font-normal">(환급)</div>
                  )}
                </div>
                <div
                  className={`text-end font-semibold ${
                    netProChange >= 0 ? 'text-green-600' : 'text-[#f5576c]'
                  }`}
                >
                  {formatCurrency(Math.abs(netProChange))}원
                </div>
                <div
                  className={`text-end font-semibold ${
                    netAreaChange >= 0 ? 'text-green-600' : 'text-[#f5576c]'
                  }`}
                >
                  {formatCurrency(Math.abs(netAreaChange))}원
                </div>
                <div></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
