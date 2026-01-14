import { useEffect, useState } from 'react'
import { Modal, useToastHelpers, FormInput, LoadingSpinner } from '../../../components'
import api from '../../../lib/api'
import { getInsurerName } from '../constants'

interface PremiumInputModalProps {
  isOpen: boolean
  onClose: () => void
  certi: string
  onUpdate?: () => void
}

interface PremiumRow {
  rowNum: number
  start_month: string | number | null
  end_month: string | number | null
  payment10_premium1: string | number | null // 년기본
  payment10_premium2: string | number | null // 년특약
  payment10_premium_total: string | number | null // 년계
}

interface PremiumDataResponse {
  success: boolean
  data?: PremiumRow[]
  error?: string
  deleted?: number
}

interface PolicyDetailResponse {
  success: boolean
  data?: Array<{
    insurance?: string | number
    company?: string
  }>
  error?: string
}

// 숫자에 콤마 추가 함수
const addComma = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return ''
  const cleaned = String(val).replace(/,/g, '').trim()
  if (cleaned === '') return ''
  const num = Number(cleaned)
  if (!Number.isFinite(num)) return cleaned
  return num.toLocaleString('ko-KR')
}

export default function PremiumInputModal({ isOpen, onClose, certi, onUpdate }: PremiumInputModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('보험료 입력')
  const [rows, setRows] = useState<PremiumRow[]>([])
  const [hasData, setHasData] = useState(false)

  // 초기 7개 행 생성
  useEffect(() => {
    if (isOpen) {
      setRows(
        Array.from({ length: 7 }, (_, i) => ({
          rowNum: i + 1,
          start_month: null,
          end_month: null,
          payment10_premium1: null,
          payment10_premium2: null,
          payment10_premium_total: null,
        }))
      )
      setHasData(false)
      setTitle('보험료 입력')
    }
  }, [isOpen])

  // 모달 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen && certi) {
      loadPremiumData()
    }
  }, [isOpen, certi])

  // 보험료 데이터 로드
  const loadPremiumData = async () => {
    if (!certi) return

    setLoading(true)
    try {
      // 증권 정보 조회 (보험회사 코드 가져오기)
      let insurerName = ''
      try {
        const certiResponse = await api.post<PolicyDetailResponse>('/api/insurance/kj-code/policy-num-detail', {
          num: certi,
        })
        if (certiResponse.data.success && certiResponse.data.data && certiResponse.data.data[0]) {
          const insuranceCode = certiResponse.data.data[0].insurance
          insurerName = getInsurerName(Number(insuranceCode) || 0)
        }
      } catch (e) {
        console.error('증권 정보 조회 오류:', e)
      }

      // 보험료 데이터 조회
      const response = await api.get<PremiumDataResponse>(
        `/api/insurance/kj-insurance-premium-data?policyNum=${encodeURIComponent(certi)}`
      )

      if (!response.data.success) {
        toast.error(response.data.error || '데이터 조회 실패')
        return
      }

      // 모달 제목 설정
      const titleText = insurerName ? `${insurerName} ${certi}` : certi
      setTitle(titleText)

      // 기존 데이터가 있으면 표시, 없으면 빈 행 7개
      const existingData = response.data.data || []
      const hasExistingData = existingData.length > 0
      setHasData(hasExistingData)

      // 데이터 맵 생성
      const dataMap: Record<number, PremiumRow> = {}
      existingData.forEach((item) => {
        dataMap[item.rowNum] = item
      })

      // 7개 행 생성 (기존 데이터 있으면 채우기)
      const newRows: PremiumRow[] = []
      for (let i = 1; i <= 7; i++) {
        const rowData = dataMap[i] || {}
        newRows.push({
          rowNum: i,
          start_month: rowData.start_month || null,
          end_month: rowData.end_month || null,
          payment10_premium1: rowData.payment10_premium1 || null,
          payment10_premium2: rowData.payment10_premium2 || null,
          payment10_premium_total: rowData.payment10_premium_total || null,
        })
      }
      setRows(newRows)
    } catch (error: any) {
      console.error('보험료 데이터 조회 오류:', error)
      toast.error('데이터 로드 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 년계 자동 계산: (년기본 + 년특약) × 10
  const calculateYearTotal = (rowIndex: number) => {
    const row = rows[rowIndex]
    const yearBasic = Number(String(row.payment10_premium1 || '').replace(/,/g, '')) || 0
    const yearSpecial = Number(String(row.payment10_premium2 || '').replace(/,/g, '')) || 0
    const sum = yearBasic + yearSpecial
    const yearTotal = sum === 0 ? null : sum * 10

    const newRows = [...rows]
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      payment10_premium_total: yearTotal,
    }
    setRows(newRows)
  }

  // 다음 행 시작나이 자동 채우기
  const autoFillNextRow = (rowIndex: number) => {
    if (rowIndex >= 6) return // 마지막 행이면 종료

    const currentRow = rows[rowIndex]
    const endMonth = Number(String(currentRow.end_month || '').replace(/,/g, '')) || 0

    if (endMonth > 0) {
      const newRows = [...rows]
      const nextRow = newRows[rowIndex + 1]
      // 다음 행의 시작나이가 비어있을 때만 자동 채우기
      if (!nextRow.start_month || nextRow.start_month === null || nextRow.start_month === '') {
        newRows[rowIndex + 1] = {
          ...nextRow,
          start_month: endMonth + 1,
        }
        setRows(newRows)
      }
    }
  }

  // 입력 필드 값 변경 핸들러
  const handleFieldChange = (rowIndex: number, field: keyof PremiumRow, value: string) => {
    const newRows = [...rows]
    const row = newRows[rowIndex]

    // 콤마 제거 후 숫자로 변환
    let processedValue: string | number | null = value.replace(/,/g, '').trim()

    // 나이 필드 (start_month, end_month)는 숫자만
    if (field === 'start_month' || field === 'end_month') {
      if (processedValue === '') {
        processedValue = null
      } else {
        // 숫자만 허용
        const num = Number(processedValue)
        if (!Number.isFinite(num)) {
          return // 유효하지 않은 숫자는 무시
        }
        processedValue = num
      }
    } else {
      // 보험료 필드는 숫자 또는 null
      if (processedValue === '') {
        processedValue = null
      } else {
        const num = Number(processedValue)
        if (!Number.isFinite(num)) {
          return
        }
        processedValue = num
      }
    }

    newRows[rowIndex] = {
      ...row,
      [field]: processedValue,
    }
    setRows(newRows)

    // 년기본 또는 년특약 변경 시 년계 계산
    if (field === 'payment10_premium1' || field === 'payment10_premium2') {
      calculateYearTotal(rowIndex)
    }

    // 끝나이 변경 시 다음 행 시작나이 자동 채우기
    if (field === 'end_month') {
      autoFillNextRow(rowIndex)
    }
  }

  // 입력 필드 포맷팅 (콤마 추가)
  const formatInputValue = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined || val === '' || val === 0 || val === '0') return ''
    return addComma(val)
  }

  // 저장
  const handleSave = async () => {
    const premiumData: PremiumRow[] = []

    // 검증: 시작 나이가 없는데 보험료가 있는 경우 체크
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const startMonth = row.start_month
      const payment10Premium1 = row.payment10_premium1
      const payment10Premium2 = row.payment10_premium2

      // 시작 나이가 없는데 보험료가 있는 경우 검증
      if (!startMonth && (payment10Premium1 || payment10Premium2)) {
        toast.error(`${i + 1}번째 행: 시작 나이를 입력하세요.`)
        return
      }

      // 하나라도 입력되어 있으면 저장 대상에 포함
      if (startMonth || row.end_month || payment10Premium1 || payment10Premium2) {
        premiumData.push({
          rowNum: row.rowNum,
          start_month: startMonth || null,
          end_month: row.end_month || null,
          payment10_premium1: payment10Premium1 || null,
          payment10_premium2: payment10Premium2 || null,
          payment10_premium_total: row.payment10_premium_total || null,
        })
      }
    }

    if (premiumData.length === 0) {
      toast.error('저장할 데이터가 없습니다.')
      return
    }

    setSaving(true)
    try {
      const response = await api.post('/api/insurance/kj-insurance-premium-data', {
        policyNum: certi,
        data: premiumData,
      })

      if (response.data.success) {
        const actionText = response.data.deleted > 0 ? '수정' : '저장'
        toast.success(`보험료 데이터가 ${actionText}되었습니다.`)
        setHasData(true)
        // 데이터 새로고침
        await loadPremiumData()
        // 부모 컴포넌트에 업데이트 알림
        if (onUpdate) {
          onUpdate()
        }
      } else {
        toast.error(response.data.error || '저장 실패')
      }
    } catch (error: any) {
      console.error('보험료 데이터 저장 오류:', error)
      toast.error('데이터 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="lg"
      maxHeight="85vh"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                저장 중...
              </>
            ) : (
              <>
                <span>💾</span>
                {hasData ? '수정' : '저장'}
              </>
            )}
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <div className="overflow-x-auto" style={{ maxHeight: 'calc(85vh - 200px)', overflowY: 'auto' }}>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-[#6f42c1] text-white">
                <th className="border border-gray-300 px-3 py-2 text-center">순번</th>
                <th className="border border-gray-300 px-3 py-2 text-center" colSpan={2}>
                  나이
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center" colSpan={3}>
                  10회분납
                </th>
              </tr>
              <tr className="bg-[#6f42c1] text-white">
                <th className="border border-gray-300 px-3 py-2"></th>
                <th className="border border-gray-300 px-3 py-2 text-center">시작</th>
                <th className="border border-gray-300 px-3 py-2 text-center">끝</th>
                <th className="border border-gray-300 px-3 py-2 text-center">년기본</th>
                <th className="border border-gray-300 px-3 py-2 text-center">년특약</th>
                <th className="border border-gray-300 px-3 py-2 text-center">년계</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.rowNum}>
                  <td className="border border-gray-300 px-3 py-2 text-center">{row.rowNum}</td>
                  <td className="border border-gray-300 px-3 py-2">
                    <FormInput
                      value={formatInputValue(row.start_month)}
                      onChange={(e) => handleFieldChange(index, 'start_month', e.target.value)}
                      variant="modal"
                      className="text-xs text-center"
                      placeholder="시작"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <FormInput
                      value={formatInputValue(row.end_month)}
                      onChange={(e) => handleFieldChange(index, 'end_month', e.target.value)}
                      variant="modal"
                      className="text-xs text-center"
                      placeholder="끝"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <FormInput
                      value={formatInputValue(row.payment10_premium1)}
                      onChange={(e) => handleFieldChange(index, 'payment10_premium1', e.target.value)}
                      variant="modal"
                      className="text-xs text-end"
                      placeholder="년기본"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <FormInput
                      value={formatInputValue(row.payment10_premium2)}
                      onChange={(e) => handleFieldChange(index, 'payment10_premium2', e.target.value)}
                      variant="modal"
                      className="text-xs text-end"
                      placeholder="년특약"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <FormInput
                      value={formatInputValue(row.payment10_premium_total)}
                      readOnly
                      variant="modal"
                      className="text-xs text-end bg-gray-50"
                      placeholder="년계"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}
