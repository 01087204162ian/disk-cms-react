import { useState, useEffect } from 'react'
import { Modal, LoadingSpinner, useToastHelpers } from '../../../components'
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

const formatNumber = (value: any): string => {
  if (!value && value !== 0) return ''
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value
  return isNaN(num) ? '' : num.toLocaleString()
}

const removeComma = (value: string | number | undefined): string => {
  if (!value && value !== 0) return ''
  return String(value).replace(/,/g, '')
}

export default function PremiumInputModal({ isOpen, onClose, certi, onUpdate }: PremiumInputModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [rows, setRows] = useState<PremiumRow[]>(Array(7).fill(null).map((_, i) => ({
    rowNum: i + 1,
    start_month: null,
    end_month: null,
    payment10_premium1: null,
    payment10_premium2: null,
    payment10_premium_total: null,
  })))
  const [title, setTitle] = useState('보험료 입력')
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    if (isOpen && certi) {
      loadPremiumData()
    } else {
      setRows(Array(7).fill(null).map((_, i) => ({
        rowNum: i + 1,
        start_month: null,
        end_month: null,
        payment10_premium1: null,
        payment10_premium2: null,
        payment10_premium_total: null,
      })))
      setTitle('보험료 입력')
      setHasData(false)
    }
  }, [isOpen, certi])

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
      const newRows: PremiumRow[] = Array(7).fill(null).map((_, idx) => {
        const rowData = dataMap[idx + 1]
        if (rowData) {
          return {
            rowNum: idx + 1,
            start_month: rowData.start_month || null,
            end_month: rowData.end_month || null,
            payment10_premium1: formatNumber(rowData.payment10_premium1),
            payment10_premium2: formatNumber(rowData.payment10_premium2),
            payment10_premium_total: formatNumber(rowData.payment10_premium_total),
          }
        }
        return {
          rowNum: idx + 1,
          start_month: null,
          end_month: null,
          payment10_premium1: null,
          payment10_premium2: null,
          payment10_premium_total: null,
        }
      })
      setRows(newRows)
    } catch (error: any) {
      console.error('보험료 데이터 조회 오류:', error)
      toast.error('데이터 로드 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRowChange = (index: number, field: keyof PremiumRow, value: string | number) => {
    const newRows = [...rows]
    
    // 숫자 입력 필드의 경우 천단위 컴마 자동 포맷팅 (PremiumModal과 동일한 로직)
    if (field === 'payment10_premium1' || field === 'payment10_premium2') {
      if (typeof value === 'string') {
        const numValue = removeComma(value)
        if (numValue) {
          const num = parseFloat(numValue)
          if (!isNaN(num)) {
            value = formatNumber(num)
          }
        }
      }
    }
    
    newRows[index] = { ...newRows[index], [field]: value }
    setRows(newRows)

    // 년계 자동 계산: (년기본 + 년특약) × 10
    if (field === 'payment10_premium1' || field === 'payment10_premium2') {
      const yearBasic = removeComma(newRows[index].payment10_premium1 as string) || '0'
      const yearSpecial = removeComma(newRows[index].payment10_premium2 as string) || '0'
      const sum = parseFloat(yearBasic) + parseFloat(yearSpecial)
      const yearTotal = sum === 0 ? null : sum * 10
      newRows[index].payment10_premium_total = yearTotal ? formatNumber(yearTotal) : null
      setRows(newRows)
    }

    // 나이 끝 입력 시 다음 행의 시작 자동 설정 (PremiumModal과 동일한 로직)
    if (field === 'end_month' && typeof value === 'number' && value && index < 6) {
      const nextRow = newRows[index + 1]
      const nextAgeStart = nextRow.start_month
      const expectedNextStart = value + 1
      // 다음 행의 시작이 비어있거나 현재 행의 끝+1과 다르면 자동 설정
      if (!nextAgeStart || nextAgeStart !== expectedNextStart) {
        newRows[index + 1] = { ...nextRow, start_month: expectedNextStart }
        setRows(newRows)
      }
    } else if (field === 'end_month' && (!value || value === 0) && index < 6) {
      // 나이 끝이 비어있거나 유효하지 않으면 다음 행의 시작도 비우기
      const nextRow = newRows[index + 1]
      const currentStart = newRows[index].start_month
      if (currentStart && nextRow.start_month === Number(currentStart) + 1) {
        newRows[index + 1] = { ...nextRow, start_month: null }
        setRows(newRows)
      }
    }
  }

  // 끝나이 입력 완료 시 다음 행 시작나이 자동 채우기
  const handleEndMonthBlur = (index: number) => {
    const row = rows[index]
    const endMonthValue = typeof row.end_month === 'number' ? row.end_month : null
    if (endMonthValue && endMonthValue > 0 && index < 6) {
      const newRows = [...rows]
      const nextRow = newRows[index + 1]
      const expectedNextStart = endMonthValue + 1
      if (!nextRow.start_month || nextRow.start_month !== expectedNextStart) {
        newRows[index + 1] = { ...nextRow, start_month: expectedNextStart }
        setRows(newRows)
      }
    }
  }

  const handleSave = async () => {
    if (!certi) {
      toast.error('증권번호가 없습니다.')
      return
    }

    if (!window.confirm(hasData ? '보험료 정보를 수정하시겠습니까?' : '보험료 정보를 저장하시겠습니까?')) {
      return
    }

    const premiumData: PremiumRow[] = []
    rows.forEach((row) => {
      // 나이 또는 보험료 중 하나라도 있으면 저장
      if (row.start_month || row.end_month || row.payment10_premium1 || row.payment10_premium2) {
        premiumData.push({
          rowNum: row.rowNum,
          start_month: row.start_month || null,
          end_month: row.end_month || null,
          payment10_premium1: row.payment10_premium1 ? removeComma(row.payment10_premium1) || null : null,
          payment10_premium2: row.payment10_premium2 ? removeComma(row.payment10_premium2) || null : null,
          payment10_premium_total: row.payment10_premium_total ? removeComma(row.payment10_premium_total) || null : null,
        })
      }
    })

    if (premiumData.length === 0) {
      toast.error('입력된 보험료 정보가 없습니다.')
      return
    }

    try {
      setSaving(true)
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
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '저장 중...' : hasData ? '수정' : '저장'}
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <table className="w-full text-xs border-collapse" style={{ fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                <th rowSpan={2} className="px-2 py-2 text-center font-medium border border-border" style={{ width: '5%', verticalAlign: 'middle' }}>
                  순번
                </th>
                <th colSpan={2} className="px-2 py-2 text-center font-medium border border-border">
                  나이
                </th>
                <th colSpan={3} className="px-2 py-2 text-center font-medium border border-border">
                  10회분납
                </th>
              </tr>
              <tr style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '8%' }}>
                  시작
                </th>
                <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '8%' }}>
                  끝
                </th>
                <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '10%' }}>
                  년기본
                </th>
                <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '10%' }}>
                  년특약
                </th>
                <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '10%' }}>
                  년계
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.rowNum} style={{ backgroundColor: '#ffffff' }}>
                  <td className="px-2 py-2 text-center border border-border">{row.rowNum}</td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="number"
                      value={row.start_month || ''}
                      onChange={(e) => handleRowChange(idx, 'start_month', parseInt(e.target.value) || 0)}
                      placeholder="시작"
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none text-right"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  </td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="number"
                      value={row.end_month || ''}
                      onChange={(e) => handleRowChange(idx, 'end_month', parseInt(e.target.value) || 0)}
                      onBlur={() => handleEndMonthBlur(idx)}
                      placeholder="끝"
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none text-right"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  </td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="text"
                      value={row.payment10_premium1 || ''}
                      onChange={(e) => handleRowChange(idx, 'payment10_premium1', e.target.value)}
                      placeholder="년기본"
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none text-right"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  </td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="text"
                      value={row.payment10_premium2 || ''}
                      onChange={(e) => handleRowChange(idx, 'payment10_premium2', e.target.value)}
                      placeholder="년특약"
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none text-right"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  </td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="text"
                      value={row.payment10_premium_total || ''}
                      readOnly
                      placeholder="년계"
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none text-right"
                      style={{ backgroundColor: '#ffffff' }}
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
