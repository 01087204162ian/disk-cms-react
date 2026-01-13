import { useState, useEffect } from 'react'
import { Modal, useToastHelpers } from '../../../components'
import api from '../../../lib/api'
import { useAuthStore } from '../../../store/authStore'

interface ConfirmPremiumModalProps {
  isOpen: boolean
  onClose: () => void
  companyNum: number | null
  defaultDate?: string
  startDate?: string
  endDate?: string
  totalDrivers?: number
  onSuccess?: () => void
}

interface ConfirmPremiumSaveResponse {
  success: boolean
  message?: string
  error?: string
}

export default function ConfirmPremiumModal({
  isOpen,
  onClose,
  companyNum,
  defaultDate,
  startDate,
  endDate,
  totalDrivers = 0,
  onSuccess,
}: ConfirmPremiumModalProps) {
  const toast = useToastHelpers()
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [settleDate, setSettleDate] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (isOpen) {
      // 기본 날짜 설정 (종료일 또는 오늘)
      if (defaultDate) {
        setSettleDate(defaultDate)
      } else {
        const today = new Date().toISOString().split('T')[0]
        setSettleDate(today)
      }
      setAmount('')
    } else {
      setSettleDate('')
      setAmount('')
    }
  }, [isOpen, defaultDate])

  const formatAmount = (value: string): string => {
    // 콤마 제거 후 숫자만 추출
    const cleaned = value.replace(/,/g, '')
    if (!cleaned || isNaN(Number(cleaned))) return ''
    
    // 숫자 포맷팅
    return Number(cleaned).toLocaleString('ko-KR')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value)
    setAmount(formatted)
  }

  const handleSave = async () => {
    if (!companyNum) {
      toast.error('정산 정보가 없습니다.')
      return
    }

    if (!settleDate) {
      toast.error('정산일을 선택해주세요.')
      return
    }

    const cleanedAmount = amount.replace(/,/g, '')
    if (!cleanedAmount || isNaN(Number(cleanedAmount))) {
      toast.error('유효한 보험료 금액을 입력해주세요.')
      return
    }

    try {
      setSaving(true)
      const userName = user?.name || 
        (typeof window !== 'undefined' && window.sessionStorage?.getItem('userName')) ||
        (typeof window !== 'undefined' && window.localStorage?.getItem('userName')) ||
        'system'

      // 정산 인원은 props로 받아온 값 사용
      const driversCount = totalDrivers || 0

      // 원본과 동일하게 FormData 사용
      const formData = new URLSearchParams()
      formData.append('dNum', String(companyNum))
      formData.append('thisMonthDueDate', settleDate)
      formData.append('adjustmentAmount', cleanedAmount)
      formData.append('userName', userName)
      formData.append('totalDrivers', String(driversCount))

      const response = await fetch('/api/insurance/kj-company/settlement/premium-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      const result: ConfirmPremiumSaveResponse = await response.json()

      if (result.success) {
        toast.success(result.message || '확정보험료가 성공적으로 저장되었습니다.')
        setAmount('')
        onClose()
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(result.message || result.error || '저장에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('확정보험료 저장 오류:', error)
      toast.error('확정보험료 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="확정보험료 입력"
    >
      <div className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">정산일</label>
            <input
              type="date"
              className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              value={settleDate}
              onChange={(e) => setSettleDate(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">확정보험료 금액</label>
            <input
              type="text"
              className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="금액을 입력하세요"
              value={amount}
              onChange={handleAmountChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSave()
                }
              }}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              숫자만 입력하세요 (콤마는 자동으로 추가됩니다)
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
