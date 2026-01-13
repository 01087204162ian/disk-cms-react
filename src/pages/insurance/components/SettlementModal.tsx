import { useEffect, useState } from 'react'
import { useToastHelpers } from '../../../components'
import api from '../../../lib/api'
import { useAuthStore } from '../../../store/authStore'
import { getInsurerName, getGitaName } from '../constants'
import ConfirmPremiumModal from './ConfirmPremiumModal'
import SettlementListModal from './SettlementListModal'

interface SettlementModalProps {
  isOpen: boolean
  onClose: () => void
  companyNum: number | null
  companyName?: string
}

interface SettlementAdjustmentItem {
  policyNum?: string
  divi?: string | number
  drivers_count?: number
  total_AdjustedInsuranceMothlyPremium?: number
  payment10_premium?: number
  eTotalMonthPremium?: number
  eTotalCompanyPremium?: number
  Conversion_AdjustedInsuranceCompanyPremium?: number
  nab?: number
}

interface SettlementAdjustmentResponse {
  success: boolean
  data?: SettlementAdjustmentItem[]
  error?: string
}

interface SettlementEndorseDayResponse {
  success: boolean
  paymentStartDate?: string
  thisMonthDueDate?: string
  jumin?: string
  error?: string
}

export default function SettlementModal({
  isOpen,
  onClose,
  companyNum,
  companyName,
}: SettlementModalProps) {
  const toast = useToastHelpers()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [adjustmentData, setAdjustmentData] = useState<SettlementAdjustmentItem[]>([])
  const [totalPremium, setTotalPremium] = useState(0)
  const [endorseListModalOpen, setEndorseListModalOpen] = useState(false)
  const [endorseListData, setEndorseListData] = useState<any[]>([])
  const [loadingEndorseList, setLoadingEndorseList] = useState(false)
  const [jumin, setJumin] = useState('')
  const [memoList, setMemoList] = useState<any[]>([])
  const [memoInput, setMemoInput] = useState('')
  const [loadingMemo, setLoadingMemo] = useState(false)
  const [savingMemo, setSavingMemo] = useState(false)
  const [confirmPremiumModalOpen, setConfirmPremiumModalOpen] = useState(false)
  const [settlementListModalOpen, setSettlementListModalOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (isOpen && companyNum) {
      loadSettlementDates()
    } else {
      setStartDate('')
      setEndDate('')
      setAdjustmentData([])
      setTotalPremium(0)
      setEndorseListModalOpen(false)
      setEndorseListData([])
      setJumin('')
      setMemoList([])
      setMemoInput('')
      setConfirmPremiumModalOpen(false)
      setSettlementListModalOpen(false)
    }
  }, [isOpen, companyNum])

  useEffect(() => {
    if (isOpen && companyNum && startDate && endDate) {
      loadSettlementData()
    }
  }, [isOpen, companyNum, startDate, endDate])

  // 정산 기간 조회
  const loadSettlementDates = async () => {
    if (!companyNum) return

    try {
      const response = await api.get<SettlementEndorseDayResponse>(
        `/api/insurance/kj-company/settlement/endorse-day?dNum=${companyNum}`
      )

      if (response.data.success) {
        if (response.data.paymentStartDate) {
          setStartDate(response.data.paymentStartDate)
        } else {
          // Fallback: 한 달 전
          const today = new Date()
          const lastMonth = new Date(today)
          lastMonth.setMonth(today.getMonth() - 1)
          setStartDate(formatDate(lastMonth))
        }
        if (response.data.thisMonthDueDate) {
          setEndDate(response.data.thisMonthDueDate)
        } else {
          // Fallback: 오늘
          setEndDate(formatDate(new Date()))
        }
        if (response.data.jumin) {
          setJumin(response.data.jumin)
          // 메모 목록 로드
          loadSettlementMemo(response.data.jumin)
        }
      } else {
        // Fallback
        const today = new Date()
        const lastMonth = new Date(today)
        lastMonth.setMonth(today.getMonth() - 1)
        setStartDate(formatDate(lastMonth))
        setEndDate(formatDate(today))
        toast.error(response.data.error || '정산 기간 조회에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('정산 기간 조회 오류:', error)
      // Fallback
      const today = new Date()
      const lastMonth = new Date(today)
      lastMonth.setMonth(today.getMonth() - 1)
      setStartDate(formatDate(lastMonth))
      setEndDate(formatDate(today))
      toast.error('정산 기간 조회 중 오류가 발생했습니다.')
    }
  }

  // 정산 데이터 로드 (증권번호별 집계)
  const loadSettlementData = async () => {
    if (!companyNum || !startDate || !endDate) return

    try {
      setLoading(true)
      const response = await api.get<SettlementAdjustmentResponse>(
        `/api/insurance/kj-company/settlement/adjustment`,
        {
          params: {
            dNum: companyNum,
            lastMonthDueDate: startDate,
            thisMonthDueDate: endDate,
          },
        }
      )

      if (response.data.success && response.data.data) {
        setAdjustmentData(response.data.data)
        calculateTotalPremium(response.data.data)
      } else {
        setAdjustmentData([])
        setTotalPremium(0)
        toast.error(response.data.error || '정산 데이터 조회에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('정산 데이터 조회 오류:', error)
      setAdjustmentData([])
      setTotalPremium(0)
      toast.error('정산 데이터 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 업체에 통보할 보험료 계산
  const calculateTotalPremium = (data: SettlementAdjustmentItem[]) => {
    if (!data || data.length === 0) {
      setTotalPremium(0)
      return
    }

    let total = 0

    data.forEach((item) => {
      const divi = String(item.divi || '')
      const nab = item.nab || 1
      const monthlyPremium = item.total_AdjustedInsuranceMothlyPremium || 0
      const payment10Premium = item.payment10_premium || 0
      const endorseMonthlyPremium = item.eTotalMonthPremium || 0
      const endorseCompanyPremium = item.eTotalCompanyPremium || 0

      // 배서보험료 계산
      let endorsePremium = 0
      if (divi === '2') {
        // 월납
        endorsePremium = endorseMonthlyPremium
      } else {
        // 10회분납
        endorsePremium = endorseCompanyPremium
      }

      // 계 계산
      let rowTotal = 0
      if (divi === '2') {
        // 월납: 계 = 월보험료 + 배서보험료
        rowTotal = monthlyPremium + endorsePremium
      } else {
        // 10회분납: nab 값에 따라 계산
        if (nab === 1) {
          rowTotal = payment10Premium * 2 + endorsePremium
        } else if (nab >= 2 && nab <= 8) {
          rowTotal = payment10Premium + endorsePremium
        } else if (nab >= 9 && nab <= 10) {
          rowTotal = payment10Premium * 0.5 + endorsePremium
        } else {
          rowTotal = payment10Premium + endorsePremium
        }
      }

      total += rowTotal
    })

    setTotalPremium(total)
  }

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ko-KR')
  }

  // 메모 조회
  const loadSettlementMemo = async (juminValue: string) => {
    if (!juminValue) return

    try {
      setLoadingMemo(true)
      // 원본과 동일하게 FormData 사용
      const formData = new URLSearchParams()
      formData.append('jumin', juminValue)

      const response = await fetch('/api/insurance/kj-company/settlement/memo-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      const result = await response.json()
      
      if (result.status === 'error') {
        throw new Error(result.message || 'API 오류')
      }

      setMemoList(result.data || [])
    } catch (error: any) {
      console.error('메모 조회 실패:', error)
      setMemoList([])
      toast.error('메모 조회 중 오류가 발생했습니다.')
    } finally {
      setLoadingMemo(false)
    }
  }

  // 메모 저장
  const handleSaveMemo = async () => {
    if (!jumin) {
      toast.error('주민번호 정보가 없습니다.')
      return
    }

    const memo = memoInput.trim()
    if (!memo) {
      toast.error('메모 내용을 입력해주세요.')
      return
    }

    try {
      setSavingMemo(true)
      const userName = user?.name || 
        (typeof window !== 'undefined' && window.sessionStorage?.getItem('userName')) ||
        (typeof window !== 'undefined' && window.localStorage?.getItem('userName')) ||
        'system'

      // 원본과 동일하게 JSON 사용
      const response = await fetch('/api/insurance/kj-company/settlement/memo-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jumin,
          memo,
          memokind: '일반',
          userid: userName,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'API 오류')
      }

      setMemoInput('')
      await loadSettlementMemo(jumin)
      toast.success('메모가 저장되었습니다.')
    } catch (error: any) {
      console.error('메모 저장 실패:', error)
      toast.error(`메모 저장 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setSavingMemo(false)
    }
  }

  // 배서리스트 조회
  const handleSearchEndorseList = async () => {
    if (!companyNum || !startDate || !endDate) {
      toast.error('시작일과 종료일을 선택해주세요.')
      return
    }

    try {
      setLoadingEndorseList(true)
      setEndorseListModalOpen(true)
      
      const response = await api.get<any>(
        `/api/insurance/kj-company/settlement/monthly`,
        {
          params: {
            dNum: companyNum,
            lastMonthDueDate: startDate,
            thisMonthDueDate: endDate,
          },
        }
      )

      if (response.data.success && response.data.smsData) {
        setEndorseListData(response.data.smsData || [])
      } else {
        setEndorseListData([])
        toast.error(response.data.error || '배서리스트 조회에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('배서리스트 조회 오류:', error)
      setEndorseListData([])
      toast.error('배서리스트 조회 중 오류가 발생했습니다.')
    } finally {
      setLoadingEndorseList(false)
    }
  }

  // 배서 상태 업데이트
  const handleUpdateEndorseStatus = async (seqNo: string, status: string) => {
    try {
      const userName = user?.name || 
        (typeof window !== 'undefined' && window.sessionStorage?.getItem('userName')) ||
        (typeof window !== 'undefined' && window.localStorage?.getItem('userName')) ||
        'system'
      
      const response = await api.post('/api/insurance/kj-company/settlement/update', {
        seqNo,
        status,
        userName,
      })

      if (response.data.success) {
        toast.success('정산 상태가 업데이트되었습니다.')
        // 배서리스트 다시 로드
        handleSearchEndorseList()
      } else {
        toast.error(response.data.error || '정산 상태 업데이트에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('정산 상태 업데이트 오류:', error)
      toast.error('정산 상태 업데이트 중 오류가 발생했습니다.')
    }
  }

  // 엑셀 다운로드
  const handleDownloadExcel = async () => {
    if (!companyNum) {
      toast.error('업체 정보가 없습니다.')
      return
    }

    if (!startDate || !endDate) {
      toast.error('시작일과 종료일을 선택해주세요.')
      return
    }

    setExporting(true)
    try {
      // ExcelJS 동적 import
      const ExcelJS = (await import('exceljs')).default

      // API 호출하여 데이터 가져오기
      const response = await api.post('/api/insurance/kj-company/settlement/excel-data', {
        dNum: companyNum,
        lastMonthDueDate: startDate,
        thisMonthDueDate: endDate,
      })

      if (!response.data.success) {
        throw new Error(response.data.error || '데이터 조회 실패')
      }

      const data = response.data.data

      // 워크북 생성
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('정산리스트')

      // 컬럼 너비 설정
      worksheet.columns = [
        { width: 6 },   // 구분
        { width: 10 },  // 성명
        { width: 15 },  // 주민번호
        { width: 6 },   // 나이
        { width: 10 },  // 보험회사
        { width: 15 },  // 증권번호
        { width: 8 },   // 탁/일
        { width: 10 },  // 기타
        { width: 12 },  // 보험료
        { width: 20 },  // 보험회사에 내는 월보험료
        { width: 10 },  // 담당자
        { width: 15 },  // 정상납 보험료
        { width: 15 },  // 단체구분
        { width: 10 },  // 사고유무
        { width: 20 },  // 사고유무명
      ]

      let currentRow = 1

      // 제목 영역
      worksheet.mergeCells(currentRow, 1, currentRow, 15)
      const titleCell = worksheet.getCell(currentRow, 1)
      titleCell.value = `${data.companyName || companyName || ''} 회원리스트`
      titleCell.font = { bold: true, size: 14 }
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
      currentRow++

      // 다운로드 일시
      worksheet.mergeCells(currentRow, 1, currentRow, 15)
      const dateCell = worksheet.getCell(currentRow, 1)
      dateCell.value = `다운로드 일시: ${new Date().toLocaleString('ko-KR')}`
      dateCell.alignment = { horizontal: 'center' }
      currentRow++

      // 빈 행
      currentRow++

      // 회원리스트 헤더
      const memberHeaderRow = worksheet.getRow(currentRow)
      memberHeaderRow.values = [
        '구분', '성명', '주민번호', '나이', '보험회사', '증권번호', '탁/일', '기타',
        '보험료', '보험회사에 내는 월보험료', '담당자', '정상납 보험료', '단체구분', '사고유무', '사고유무'
      ]
      memberHeaderRow.font = { bold: true }
      memberHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      }
      memberHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' }
      currentRow++

      // 회원 데이터 행
      let j = 1
      if (data.members && Array.isArray(data.members)) {
        data.members.forEach((row: any) => {
          const InsuranceCompany = getInsurerName(row.InsuranceCompany || 0)
          const etag = getGitaName(row.etag || 0)

          const monthlyPremium = (row.divi == 2) ? (row.AdjustedInsuranceMothlyPremium || 0) : 0
          const companyPremium = (row.divi == 2) ? (row.ConversionPremium || 0) : 0
          const adjustedPremium = (row.divi != 2) ? (row.AdjustedInsuranceCompanyPremium || 0) : 0

          const dataRow = worksheet.getRow(currentRow)
          dataRow.values = [
            j++,
            row.Name || '',
            row.Jumin || '',
            row.nai || '',
            InsuranceCompany,
            row.dongbuCerti || '',
            etag,
            row.gita || '',
            monthlyPremium || '-',
            companyPremium || '-',
            '', // 담당자
            adjustedPremium || '-',
            row.dongbuCerti || '',
            row.discountRate || '',
            row.discountRateName || ''
          ]
          currentRow++
        })
      }

      // 회원리스트 합계 행
      const memberSummaryRow = worksheet.getRow(currentRow)
      worksheet.mergeCells(currentRow, 1, currentRow, 8)
      memberSummaryRow.values = [
        '합계', '', '', '', '', '', '', '',
        data.summary?.sum_monthlyPremium || 0,
        data.summary?.sum_companyPremium || 0,
        '',
        data.summary?.sum_adjustedPremium || 0,
        '', '', ''
      ]
      memberSummaryRow.font = { bold: true }
      memberSummaryRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7F5FF' },
      }
      currentRow++

      // 배서리스트 (있는 경우)
      if (data.endorsements && Array.isArray(data.endorsements) && data.endorsements.length > 0) {
        // 빈 행
        currentRow++

        // 배서리스트 제목
        worksheet.mergeCells(currentRow, 1, currentRow, 15)
        const endorseTitleCell = worksheet.getCell(currentRow, 1)
        endorseTitleCell.value = '배서리스트'
        endorseTitleCell.font = { bold: true, size: 12 }
        endorseTitleCell.alignment = { horizontal: 'center' }
        currentRow++

        // 빈 행
        currentRow++

        // 배서리스트 헤더
        const endorseHeaderRow = worksheet.getRow(currentRow)
        endorseHeaderRow.values = [
          '구분', '배서일', '성명', '나이', '보험회사', '증권번호', '일/탁', '배서종류',
          '배서보험료', '증권성격', '', '정상납보험료', '입금할 보험료'
        ]
        endorseHeaderRow.font = { bold: true }
        endorseHeaderRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' },
        }
        endorseHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' }
        currentRow++

        // 배서 데이터 행
        let j_ = 1
        data.endorsements.forEach((erow: any) => {
          const inName = getInsurerName(erow.InsuranceCompany || 0)
          const metat = getGitaName(erow.etag || 0)

          const monthlyPremium = (erow.divi == 2) ? (erow.preminum || 0) : 0
          const adjustedPremium = (erow.divi != 2) ? (erow.c_preminum || 0) : 0

          const endorseDataRow = worksheet.getRow(currentRow)
          endorseDataRow.values = [
            j_++,
            erow.endorse_day || '',
            erow.Name || '',
            erow.nai || '',
            inName,
            erow.dongbuCerti || '',
            metat,
            erow.pushName || '',
            monthlyPremium || 0,
            erow.gita || '',
            '',
            adjustedPremium || 0,
            ''
          ]
          currentRow++
        })

        // 배서 합계 행
        const endorseSummaryRow = worksheet.getRow(currentRow)
        worksheet.mergeCells(currentRow, 1, currentRow, 8)
        endorseSummaryRow.values = [
          '배서 보험료 소계', '', '', '', '', '', '', '',
          data.summary?.sum_En_monthlyPremium || 0,
          '', '',
          data.summary?.sum_En_adjustedPremium || 0,
          ''
        ]
        endorseSummaryRow.font = { bold: true }
        endorseSummaryRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE7F5FF' },
        }
        currentRow++

        // 최종 합계 행
        const finalSummaryRow = worksheet.getRow(currentRow)
        worksheet.mergeCells(currentRow, 1, currentRow, 8)
        finalSummaryRow.values = [
          '입금 하실 보험료=월 보험료 소계+배서 보험료 소계', '', '', '', '', '', '', '',
          (data.summary?.sum_monthlyPremium || 0) + (data.summary?.sum_En_monthlyPremium || 0),
          '', '',
          (data.summary?.sum_adjustedPremium || 0) + (data.summary?.sum_En_adjustedPremium || 0),
          ''
        ]
        finalSummaryRow.font = { bold: true, size: 12 }
        finalSummaryRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE0E0' },
        }
      }

      // 파일명 생성
      const today = new Date().toISOString().substring(0, 10).replace(/-/g, '')
      const safeCompanyName = (companyName || '').replace(/[^\w가-힣]/g, '_')
      const fileName = `정산리스트_${safeCompanyName}_${today}.xlsx`

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

      const memberCount = data.members?.length || 0
      const endorseCount = data.endorsements?.length || 0
      toast.success(`엑셀 파일이 다운로드되었습니다.\n\n회원: ${memberCount}건\n배서: ${endorseCount}건`)
    } catch (error: any) {
      console.error('정산 엑셀 다운로드 오류:', error)
      toast.error(`정산 엑셀 다운로드 중 오류가 발생했습니다.\n\n${error.message || '알 수 없는 오류'}`)
    } finally {
      setExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 p-4">
      <div
        className="w-full rounded-xl bg-background border border-border overflow-hidden flex flex-col shadow-xl"
        style={{ maxWidth: '48%', height: '90vh', position: 'fixed', right: '1%', top: '50%', transform: 'translateY(-50%)' }}
      >
        {/* 헤더 */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-border">
          <h3 className="text-lg font-semibold">정산 {companyName ? `- ${companyName}` : ''}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 날짜 필터 */}
          <div className="mb-4 flex flex-wrap gap-4 items-end">
            <div>
              <input
                type="date"
                className="px-3 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <input
                type="date"
                className="px-3 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <button
                className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                onClick={() => {
                  // 배서리스트 조회 버튼 클릭
                  handleSearchEndorseList()
                }}
              >
                배서리스트 조회
              </button>
            </div>
            {/* 업체에 통보할 보험료 - 검색 버튼 우측에 배치 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">업체에 통보할 보험료:</span>
              <span className="text-sm text-muted-foreground font-semibold">{formatNumber(totalPremium)}원</span>
            </div>
            <div className="ms-auto">
              <button
                className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDownloadExcel}
                disabled={exporting || !startDate || !endDate}
              >
                {exporting ? '생성 중...' : '엑셀 다운로드'}
              </button>
            </div>
          </div>

          {/* 증권번호별 집계 테이블 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">증권번호별 집계</h4>
            <div className="overflow-x-auto border border-border rounded">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium">증권번호</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium">납부방식</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium">인원</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '12%' }}>
                      월보험료
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '12%' }}>
                      1/10 보험료
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '12%' }}>
                      배서보험료
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '12%' }}>
                      계
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '12%' }}>
                      환산보험료
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="border border-gray-300 px-3 py-4 text-center text-muted-foreground">
                        데이터를 불러오는 중...
                      </td>
                    </tr>
                  ) : adjustmentData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="border border-gray-300 px-3 py-4 text-center text-muted-foreground">
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {adjustmentData.map((item, index) => {
                        const diviText = item.divi === '1' ? '10회분납' : item.divi === '2' ? '월납' : '-'
                        const monthlyPremium = item.total_AdjustedInsuranceMothlyPremium || 0
                        const payment10Premium = item.payment10_premium || 0
                        const divi = String(item.divi || '')
                        const nab = item.nab || 1

                        // 배서보험료 계산
                        let endorsePremium = 0
                        if (divi === '2') {
                          endorsePremium = item.eTotalMonthPremium || 0
                        } else {
                          endorsePremium = item.eTotalCompanyPremium || 0
                        }

                        // 계 계산
                        let rowTotal = 0
                        if (divi === '2') {
                          rowTotal = monthlyPremium + endorsePremium
                        } else {
                          if (nab === 1) {
                            rowTotal = payment10Premium * 2 + endorsePremium
                          } else if (nab >= 2 && nab <= 8) {
                            rowTotal = payment10Premium + endorsePremium
                          } else if (nab >= 9 && nab <= 10) {
                            rowTotal = payment10Premium * 0.5 + endorsePremium
                          } else {
                            rowTotal = payment10Premium + endorsePremium
                          }
                        }

                        const conversionPremium = item.Conversion_AdjustedInsuranceCompanyPremium || 0
                        const conversionPremiumDisplay = divi === '1' ? '-' : formatNumber(conversionPremium)

                        return (
                          <tr key={index}>
                            <td className="border border-gray-300 px-3 py-2">{item.policyNum || '-'}</td>
                            <td className="border border-gray-300 px-3 py-2">{diviText}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right">
                              {formatNumber(item.drivers_count || 0)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(monthlyPremium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(payment10Premium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(endorsePremium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(rowTotal)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {conversionPremiumDisplay}
                            </td>
                          </tr>
                        )
                      })}
                      {/* 합계 행 */}
                      {adjustmentData.length > 0 && (() => {
                        const totalDrivers = adjustmentData.reduce((sum, item) => sum + (item.drivers_count || 0), 0)
                        const totalMonthlyPremium = adjustmentData.reduce(
                          (sum, item) => sum + (item.total_AdjustedInsuranceMothlyPremium || 0),
                          0
                        )
                        const totalPayment10Premium = adjustmentData.reduce(
                          (sum, item) => sum + (item.payment10_premium || 0),
                          0
                        )
                        const totalEndorsePremium = adjustmentData.reduce((sum, item) => {
                          const divi = String(item.divi || '')
                          if (divi === '2') {
                            return sum + (item.eTotalMonthPremium || 0)
                          } else {
                            return sum + (item.eTotalCompanyPremium || 0)
                          }
                        }, 0)
                        const totalConversionPremium = adjustmentData.reduce((sum, item) => {
                          if (item.divi === '1') return sum
                          return sum + (item.Conversion_AdjustedInsuranceCompanyPremium || 0)
                        }, 0)

                        return (
                          <tr className="bg-gray-100 font-bold">
                            <td colSpan={2} className="border border-gray-300 px-3 py-2 text-center">
                              합계
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right">
                              {formatNumber(totalDrivers)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(totalMonthlyPremium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(totalPayment10Premium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(totalEndorsePremium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {formatNumber(totalPremium)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right" style={{ width: '12%' }}>
                              {totalConversionPremium > 0 ? formatNumber(totalConversionPremium) : '-'}
                            </td>
                          </tr>
                        )
                      })()}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 업체에 통보할 보험료 버튼들 */}
          <div className="mb-4 flex gap-2">
            <button
              className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              onClick={() => {
                setConfirmPremiumModalOpen(true)
              }}
            >
              확정보험료 입력
            </button>
            <button
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => {
                setSettlementListModalOpen(true)
              }}
            >
              정산리스트
            </button>
          </div>

          {/* 메모 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">메모</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="메모를 입력하세요"
                value={memoInput}
                onChange={(e) => setMemoInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveMemo()
                  }
                }}
              />
              <button
                className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                onClick={handleSaveMemo}
                disabled={savingMemo}
              >
                {savingMemo ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>

          {/* 메모 목록 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">메모 목록</h4>
            <div className="overflow-x-auto border border-border rounded">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '10%' }}>
                      번호
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '15%' }}>
                      작성일
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '15%' }}>
                      유형
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '50%' }}>
                      내용
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" style={{ width: '10%' }}>
                      작성자
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingMemo ? (
                    <tr>
                      <td colSpan={5} className="border border-gray-300 px-3 py-4 text-center text-muted-foreground">
                        메모를 불러오는 중...
                      </td>
                    </tr>
                  ) : memoList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="border border-gray-300 px-3 py-4 text-center text-muted-foreground">
                        메모가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    memoList.map((memo, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 px-3 py-2">{memo.wdate || '-'}</td>
                        <td className="border border-gray-300 px-3 py-2">{memo.memokind || '일반'}</td>
                        <td className="border border-gray-300 px-3 py-2">{memo.memo || '-'}</td>
                        <td className="border border-gray-300 px-3 py-2">{memo.userid || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 flex justify-end flex-shrink-0 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>

      {/* 배서리스트 모달 (좌측에 표시) */}
      {endorseListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-start bg-black/50 p-4 pointer-events-none">
          <div
            className="w-full rounded-xl bg-background border border-border overflow-hidden flex flex-col shadow-xl pointer-events-auto"
            style={{ maxWidth: '48%', height: '90vh', position: 'fixed', left: '1%', top: '50%', transform: 'translateY(-50%)' }}
          >
            {/* 헤더 */}
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-border">
              <h3 className="text-lg font-semibold">배서리스트</h3>
              <button
                onClick={() => setEndorseListModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingEndorseList ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-sm text-muted-foreground">데이터를 불러오는 중...</p>
                </div>
              ) : endorseListData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">데이터가 없습니다.</div>
              ) : (
                <div className="overflow-x-auto border border-border rounded">
                  <table className="w-full text-xs border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-center font-medium">번호</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-medium">성명</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-medium">주민번호</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-medium">증권번호</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-medium">배서일</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-medium">월보험료</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-medium">1/10 보험료</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-medium">배서종류</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-medium">처리</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-medium">처리자</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let totalMonthlyPremium = 0
                        let totalCPremium = 0

                        const rows = endorseListData.map((item, index) => {
                          const push = parseInt(String(item.push || 0))
                          const divi = String(item.divi || '')
                          const monthlyPremium = parseFloat(String(item.preminum || 0))
                          const cPremium = parseFloat(String(item.c_preminum || 0))
                          const jumin = String(item.Jumin || '')
                          const maskedJumin = jumin.length >= 7 ? jumin.substring(0, 7) + '-******' : jumin
                          const getStatus = String(item.get || '')

                          // 배서종류 표시
                          let endorseTypeText = '-'
                          if (push === 2) {
                            endorseTypeText = '해지'
                          } else if (push === 4 || push === 1) {
                            endorseTypeText = '청약'
                          }

                          // 보험료 표시
                          let monthlyPremiumDisplay = '-'
                          let cPremiumDisplay = '-'
                          let premiumValue = 0

                          if (divi === '2') {
                            // 월납
                            if (monthlyPremium > 0) {
                              premiumValue = push === 2 ? -monthlyPremium : monthlyPremium
                              monthlyPremiumDisplay = (push === 2 ? '-' : '+') + formatNumber(monthlyPremium)
                              totalMonthlyPremium += premiumValue
                            }
                          } else {
                            // 10회분납
                            if (cPremium > 0) {
                              premiumValue = push === 2 ? -cPremium : cPremium
                              cPremiumDisplay = (push === 2 ? '-' : '+') + formatNumber(cPremium)
                              totalCPremium += premiumValue
                            }
                          }

                        return (
                          <tr key={index}>
                            <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                            <td className="border border-gray-300 px-3 py-2">{item.Name || '-'}</td>
                            <td className="border border-gray-300 px-3 py-2">{maskedJumin}</td>
                            <td className="border border-gray-300 px-3 py-2">{item.dongbuCerti || '-'}</td>
                            <td className="border border-gray-300 px-3 py-2">{item.endorse_day || '-'}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right">{monthlyPremiumDisplay}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right">{cPremiumDisplay}</td>
                            <td className="border border-gray-300 px-3 py-2">{endorseTypeText}</td>
                            <td className="border border-gray-300 px-3 py-2">
                              <select
                                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                value={getStatus}
                                onChange={(e) => handleUpdateEndorseStatus(String(item.SeqNo || ''), e.target.value)}
                              >
                                <option value="2">미정산</option>
                                <option value="1">정산완료</option>
                              </select>
                            </td>
                            <td className="border border-gray-300 px-3 py-2">{item.manager || '-'}</td>
                          </tr>
                        )
                        })

                        // 합계 행 추가
                        const totalPremium = totalMonthlyPremium + totalCPremium
                        const totalRow = (
                          <tr key="total" className="bg-gray-100 font-bold">
                            <td colSpan={5} className="border border-gray-300 px-3 py-2 text-center">
                              합계
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right">
                              {totalMonthlyPremium !== 0
                                ? (totalMonthlyPremium > 0 ? '+' : '') + formatNumber(totalMonthlyPremium)
                                : '-'}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right">
                              {totalCPremium !== 0
                                ? (totalCPremium > 0 ? '+' : '') + formatNumber(totalCPremium)
                                : '-'}
                            </td>
                            <td colSpan={2} className="border border-gray-300 px-3 py-2 text-center">
                              계
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right">
                              {totalPremium !== 0
                                ? (totalPremium > 0 ? '+' : '') + formatNumber(totalPremium)
                                : '-'}
                            </td>
                          </tr>
                        )

                        return [...rows, totalRow]
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="px-6 py-4 flex justify-end flex-shrink-0 border-t border-border">
              <button
                onClick={() => setEndorseListModalOpen(false)}
                className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 확정보험료 입력 모달 */}
      <ConfirmPremiumModal
        isOpen={confirmPremiumModalOpen}
        onClose={() => setConfirmPremiumModalOpen(false)}
        companyNum={companyNum}
        defaultDate={endDate}
        totalDrivers={
          adjustmentData.reduce((sum, item) => sum + (item.drivers_count || 0), 0)
        }
        onSuccess={() => {
          // 확정보험료 저장 후 정산 데이터 다시 로드
          if (startDate && endDate) {
            loadSettlementData()
          }
        }}
      />

      {/* 정산리스트 모달 */}
      <SettlementListModal
        isOpen={settlementListModalOpen}
        onClose={() => setSettlementListModalOpen(false)}
        defaultAttempted="1"
      />
    </div>
  )
}
