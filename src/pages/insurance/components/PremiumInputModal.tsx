import { useEffect, useState } from 'react'
import { Modal, useToastHelpers, LoadingSpinner } from '../../../components'
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

  // 년계 자동 계산: (년기본 + 년특약) × 10 (PremiumModal과 동일한 로직)
  const calculateYearTotal = (rowIndex: number) => {
    const newRows = [...rows]
    const row = newRows[rowIndex]
    
    // 콤마 제거 후 숫자로 변환
    const yearBasic = parseFloat(String(row.payment10_premium1 || '').replace(/,/g, '')) || 0
    const yearSpecial = parseFloat(String(row.payment10_premium2 || '').replace(/,/g, '')) || 0
    const sum = yearBasic + yearSpecial
    const yearTotal = sum === 0 ? null : sum * 10

    newRows[rowIndex] = {
      ...row,
      payment10_premium_total: yearTotal ? addComma(yearTotal) : null,
    }
    setRows(newRows)
  }

  // 다음 행 시작나이 자동 채우기 (PremiumModal과 동일한 로직)
  const autoFillNextRow = (rowIndex: number, endMonthValue: number | null) => {
    if (rowIndex >= 6) return // 마지막 행이면 종료

    const newRows = [...rows]
    const nextRow = newRows[rowIndex + 1]
    const currentStart = newRows[rowIndex].start_month

    // 나이 끝 입력 시 다음 행의 시작 자동 설정 (PremiumModal과 동일한 로직)
    if (endMonthValue && typeof endMonthValue === 'number' && endMonthValue > 0) {
      const expectedNextStart = endMonthValue + 1
      const nextAgeStart = nextRow.start_month
      // 다음 행의 시작이 비어있거나 현재 행의 끝+1과 다르면 자동 설정
      if (!nextAgeStart || nextAgeStart !== expectedNextStart) {
        newRows[rowIndex + 1] = {
          ...nextRow,
          start_month: expectedNextStart,
        }
        setRows(newRows)
      }
    } else if (!endMonthValue || endMonthValue === 0) {
      // 나이 끝이 비어있거나 유효하지 않으면 다음 행의 시작도 비우기 (PremiumModal과 동일)
      if (currentStart && nextRow.start_month === Number(currentStart) + 1) {
        newRows[rowIndex + 1] = {
          ...nextRow,
          start_month: null,
        }
        setRows(newRows)
      }
    }
  }

  // 입력 필드 값 변경 핸들러
  const handleFieldChange = (rowIndex: number, field: keyof PremiumRow, value: string) => {
    const newRows = [...rows]
    const row = newRows[rowIndex]

    // 나이 필드 (start_month, end_month)는 숫자만 (콤마 없음)
    if (field === 'start_month' || field === 'end_month') {
      const processedValue = value.replace(/,/g, '').trim()
      if (processedValue === '') {
        newRows[rowIndex] = {
          ...row,
          [field]: null,
        }
        setRows(newRows)
        return
      } else {
        // 숫자만 허용 (정수만)
        const num = Number(processedValue)
        if (!Number.isFinite(num) || !Number.isInteger(num)) {
          return // 유효하지 않은 숫자는 무시
        }
        newRows[rowIndex] = {
          ...row,
          [field]: num,
        }
        setRows(newRows)
        return
      }
    }

    // 보험료 필드는 문자열로 저장 (콤마 포함, PremiumModal과 동일한 로직)
    if (field === 'payment10_premium1' || field === 'payment10_premium2') {
      // 콤마 제거
      const numValue = value.replace(/,/g, '').trim()
      
      // 빈 값이면 null로 저장
      if (numValue === '') {
        newRows[rowIndex] = {
          ...row,
          [field]: null,
        }
        setRows(newRows)
        calculateYearTotal(rowIndex)
        return
      }
      
      // 숫자로 변환 시도 (PremiumModal과 동일한 로직)
      const num = parseFloat(numValue)
      if (!isNaN(num)) {
        // 콤마가 포함된 문자열로 저장
        const formattedValue = addComma(num)
        newRows[rowIndex] = {
          ...row,
          [field]: formattedValue,
        }
        setRows(newRows)
        calculateYearTotal(rowIndex)
      }
      // 숫자가 아니면 무시
      return
    }

    // 기타 필드는 그대로 저장
    newRows[rowIndex] = {
      ...row,
      [field]: value,
    }
    setRows(newRows)
  }

  // 끝나이 입력 완료 시 다음 행 시작나이 자동 채우기
  const handleEndMonthBlur = (rowIndex: number) => {
    const row = rows[rowIndex]
    const endMonthValue = typeof row.end_month === 'number' ? row.end_month : null
    autoFillNextRow(rowIndex, endMonthValue)
  }

  // 입력 필드 포맷팅 (나이는 콤마 없이, 보험료는 이미 콤마 포함된 문자열)
  const formatInputValue = (val: number | string | null | undefined, isAge: boolean = false): string => {
    if (val === null || val === undefined || val === '' || val === 0 || val === '0') return ''
    // 나이 필드는 콤마 없이 숫자만 표시
    if (isAge) {
      return String(val)
    }
    // 보험료 필드는 이미 콤마가 포함된 문자열이거나 숫자일 수 있음
    if (typeof val === 'string') {
      return val // 이미 콤마가 포함된 문자열
    }
    // 숫자인 경우 콤마 추가
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
      maxWidth="4xl"
      maxHeight="70vh"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                저장 중...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
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
        <div className="overflow-x-auto" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <table className="w-full border-collapse border border-gray-300 text-sm" style={{ fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                <th className="border border-gray-300 px-2 py-1 text-center" style={{ fontSize: '0.875rem' }}>순번</th>
                <th className="border border-gray-300 px-2 py-1 text-center" colSpan={2} style={{ fontSize: '0.875rem' }}>
                  나이
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center" colSpan={3} style={{ fontSize: '0.875rem' }}>
                  10회분납
                </th>
              </tr>
              <tr style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                <th className="border border-gray-300 px-2 py-1" style={{ fontSize: '0.875rem' }}></th>
                <th className="border border-gray-300 px-2 py-1 text-center" style={{ fontSize: '0.875rem' }}>시작</th>
                <th className="border border-gray-300 px-2 py-1 text-center" style={{ fontSize: '0.875rem' }}>끝</th>
                <th className="border border-gray-300 px-2 py-1 text-center" style={{ fontSize: '0.875rem' }}>년기본</th>
                <th className="border border-gray-300 px-2 py-1 text-center" style={{ fontSize: '0.875rem' }}>년특약</th>
                <th className="border border-gray-300 px-2 py-1 text-center" style={{ fontSize: '0.875rem' }}>년계</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.rowNum}>
                  <td className="border border-gray-300 px-2 py-1 text-center" style={{ fontSize: '0.875rem' }}>{row.rowNum}</td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={formatInputValue(row.start_month, true)}
                      onChange={(e) => handleFieldChange(index, 'start_month', e.target.value)}
                      className="w-full px-2 py-1 text-xs border-0 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                      style={{ height: '31px', fontSize: '0.875rem' }}
                      autoComplete="off"
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={formatInputValue(row.end_month, true)}
                      onChange={(e) => handleFieldChange(index, 'end_month', e.target.value)}
                      onBlur={() => handleEndMonthBlur(index)}
                      className="w-full px-2 py-1 text-xs border-0 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                      style={{ height: '31px', fontSize: '0.875rem' }}
                      autoComplete="off"
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={formatInputValue(row.payment10_premium1)}
                      onChange={(e) => handleFieldChange(index, 'payment10_premium1', e.target.value)}
                      className="w-full px-2 py-1 text-xs border-0 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-end"
                      style={{ height: '31px', fontSize: '0.875rem' }}
                      autoComplete="off"
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={formatInputValue(row.payment10_premium2)}
                      onChange={(e) => handleFieldChange(index, 'payment10_premium2', e.target.value)}
                      className="w-full px-2 py-1 text-xs border-0 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-end"
                      style={{ height: '31px', fontSize: '0.875rem' }}
                      autoComplete="off"
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={formatInputValue(row.payment10_premium_total)}
                      readOnly
                      className="w-full px-2 py-1 text-xs border-0 bg-gray-50 focus:outline-none text-end"
                      style={{ height: '31px', fontSize: '0.875rem' }}
                      autoComplete="off"
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
