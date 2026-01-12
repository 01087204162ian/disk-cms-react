import { useState, useEffect } from 'react'
import { Modal, LoadingSpinner, useToastHelpers } from '../../../components'
import api from '../../../lib/api'

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  certiNum: number | null
  onSuccess?: () => void
}

interface PremiumRow {
  ageStart?: number
  ageEnd?: number
  monthlyBasic?: number | string
  monthlySpecial?: number | string
  monthlyTotal?: number | string
  yearlyBasic?: number | string
  yearlySpecial?: number | string
  yearlyTotal?: number | string
}

interface PremiumResponse {
  success: boolean
  data?: PremiumRow[]
  company?: string
  policyNum?: string
  error?: string
}

export default function PremiumModal({ isOpen, onClose, certiNum, onSuccess }: PremiumModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [rows, setRows] = useState<PremiumRow[]>(Array(7).fill({}))
  const [title, setTitle] = useState('월보험료 입력')
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    if (isOpen && certiNum) {
      loadPremium()
    } else {
      setRows(Array(7).fill({}))
      setTitle('월보험료 입력')
      setHasData(false)
    }
  }, [isOpen, certiNum])

  const loadPremium = async () => {
    if (!certiNum) return

    try {
      setLoading(true)
      const response = await api.get<PremiumResponse>(`/api/insurance/kj-premium?cNum=${certiNum}`)

      if (response.data.success) {
        const premiumData = response.data.data || []
        const companyName = response.data.company || ''
        const policyNum = response.data.policyNum || ''
        setTitle(`${companyName} 증권번호 ${policyNum}`)

        // 데이터 유무 확인
        const hasExistingData = premiumData.some(
          (row) => row.ageStart || row.ageEnd || row.monthlyBasic || row.monthlySpecial || row.yearlyBasic || row.yearlySpecial
        )
        setHasData(hasExistingData)

        // 7개 행 생성 (기존 데이터 + 빈 행)
        const newRows: PremiumRow[] = Array(7).fill(null).map((_, idx) => {
          const rowData = premiumData[idx]
          if (rowData) {
            return {
              ageStart: rowData.ageStart,
              ageEnd: rowData.ageEnd === 999 ? undefined : rowData.ageEnd,
              monthlyBasic: formatNumber(rowData.monthlyBasic),
              monthlySpecial: formatNumber(rowData.monthlySpecial),
              monthlyTotal: formatNumber(rowData.monthlyTotal),
              yearlyBasic: formatNumber(rowData.yearlyBasic),
              yearlySpecial: formatNumber(rowData.yearlySpecial),
              yearlyTotal: formatNumber(rowData.yearlyTotal),
            }
          }
          return {}
        })

        setRows(newRows)
      } else {
        toast.error(response.data.error || '보험료 정보를 불러올 수 없습니다.')
      }
    } catch (error: any) {
      console.error('보험료 정보 로드 오류:', error)
      toast.error(error.response?.data?.error || '보험료 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
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

  const handleRowChange = (index: number, field: keyof PremiumRow, value: string | number) => {
    const newRows = [...rows]
    
    // 숫자 입력 필드의 경우 천단위 컴마 자동 포맷팅
    if (field === 'monthlyBasic' || field === 'monthlySpecial' || field === 'yearlyBasic' || field === 'yearlySpecial') {
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

    // 합계 자동 계산
    if (field === 'monthlyBasic' || field === 'monthlySpecial') {
      const monthlyBasic = removeComma(newRows[index].monthlyBasic as string) || '0'
      const monthlySpecial = removeComma(newRows[index].monthlySpecial as string) || '0'
      const monthlyTotal = parseFloat(monthlyBasic) + parseFloat(monthlySpecial)
      newRows[index].monthlyTotal = monthlyTotal > 0 ? formatNumber(monthlyTotal) : ''
      setRows(newRows)
    }

    if (field === 'yearlyBasic' || field === 'yearlySpecial') {
      const yearlyBasic = removeComma(newRows[index].yearlyBasic as string) || '0'
      const yearlySpecial = removeComma(newRows[index].yearlySpecial as string) || '0'
      const yearlyTotal = parseFloat(yearlyBasic) + parseFloat(yearlySpecial)
      newRows[index].yearlyTotal = yearlyTotal > 0 ? formatNumber(yearlyTotal) : ''
      setRows(newRows)
    }

    // 나이 끝 입력 시 다음 행의 시작 자동 설정 (원본과 동일한 로직)
    if (field === 'ageEnd' && typeof value === 'number' && value && index < 6) {
      const nextRow = newRows[index + 1]
      const nextAgeStart = nextRow.ageStart
      const expectedNextStart = value + 1
      // 다음 행의 시작이 비어있거나 현재 행의 끝+1과 다르면 자동 설정
      if (!nextAgeStart || nextAgeStart !== expectedNextStart) {
        newRows[index + 1] = { ...nextRow, ageStart: expectedNextStart }
        setRows(newRows)
      }
    } else if (field === 'ageEnd' && (!value || value === 0) && index < 6) {
      // 나이 끝이 비어있거나 유효하지 않으면 다음 행의 시작도 비우기 (원본과 동일)
      const nextRow = newRows[index + 1]
      const currentStart = newRows[index].ageStart
      if (currentStart && nextRow.ageStart === currentStart + 1) {
        newRows[index + 1] = { ...nextRow, ageStart: undefined }
        setRows(newRows)
      }
    }
  }

  const handleSave = async () => {
    if (!certiNum) {
      toast.error('증권 번호가 없습니다.')
      return
    }

    if (!window.confirm(hasData ? '보험료 정보를 수정하시겠습니까?' : '보험료 정보를 저장하시겠습니까?')) {
      return
    }

    const premiumData: any[] = []
    rows.forEach((row, idx) => {
      // 원본과 동일: 나이 또는 보험료 중 하나라도 있으면 저장
      if (row.ageStart || row.ageEnd || row.monthlyBasic || row.monthlySpecial || 
          row.yearlyBasic || row.yearlySpecial) {
        premiumData.push({
          cNum: certiNum,
          rowNum: idx + 1,
          start_month: row.ageStart || null,
          end_month: row.ageEnd || null,
          monthly_premium1: removeComma(row.monthlyBasic) || null,
          monthly_premium2: removeComma(row.monthlySpecial) || null,
          monthly_premium_total: removeComma(row.monthlyTotal) || null,
          payment10_premium1: removeComma(row.yearlyBasic) || null,
          payment10_premium2: removeComma(row.yearlySpecial) || null,
          payment10_premium_total: removeComma(row.yearlyTotal) || null,
        })
      }
    })

    if (premiumData.length === 0) {
      toast.error('입력된 보험료 정보가 없습니다.')
      return
    }

    try {
      setSaving(true)
      const response = await api.post('/api/insurance/kj-premium/save', {
        data: premiumData,
      })

      if (response.data.success) {
        toast.success(response.data.message || `${premiumData.length}개 행이 저장되었습니다.`)
        onSuccess?.()
        // 데이터 재조회
        setTimeout(() => {
          loadPremium()
        }, 500)
      } else {
        toast.error(response.data.error || '보험료 저장에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('보험료 저장 오류:', error)
      toast.error(error.response?.data?.error || '보험료 저장 중 오류가 발생했습니다.')
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
        <div className="overflow-x-auto border border-border rounded">
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
                  월보험료
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
                  월기본
                </th>
                <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '10%' }}>
                  월특약
                </th>
                <th className="px-2 py-2 text-center font-medium border border-border" style={{ width: '10%' }}>
                  합계
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
                <tr key={idx} style={{ backgroundColor: '#ffffff' }}>
                  <td className="px-2 py-2 text-center border border-border">{idx + 1}</td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="number"
                      value={row.ageStart || ''}
                      onChange={(e) => handleRowChange(idx, 'ageStart', parseInt(e.target.value) || 0)}
                      placeholder="시작"
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none text-right"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  </td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="number"
                      value={row.ageEnd || ''}
                      onChange={(e) => handleRowChange(idx, 'ageEnd', parseInt(e.target.value) || 0)}
                      placeholder="끝"
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none text-right"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  </td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="text"
                      value={row.monthlyBasic || ''}
                      onChange={(e) => handleRowChange(idx, 'monthlyBasic', e.target.value)}
                      placeholder="월기본"
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none text-right"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  </td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="text"
                      value={row.monthlySpecial || ''}
                      onChange={(e) => handleRowChange(idx, 'monthlySpecial', e.target.value)}
                      placeholder="월특약"
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none text-right"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  </td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="text"
                      value={row.monthlyTotal || ''}
                      readOnly
                      placeholder="합계"
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none text-right"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  </td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="text"
                      value={row.yearlyBasic || ''}
                      onChange={(e) => handleRowChange(idx, 'yearlyBasic', e.target.value)}
                      placeholder="년기본"
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none text-right"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  </td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="text"
                      value={row.yearlySpecial || ''}
                      onChange={(e) => handleRowChange(idx, 'yearlySpecial', e.target.value)}
                      placeholder="년특약"
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent outline-none text-right"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  </td>
                  <td className="px-2 py-2 border border-border" style={{ padding: 0 }}>
                    <input
                      type="text"
                      value={row.yearlyTotal || ''}
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
