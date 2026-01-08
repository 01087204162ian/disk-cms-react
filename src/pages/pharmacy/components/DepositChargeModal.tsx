import { useState, useEffect } from 'react'
import { Modal, FormInput, DatePicker, LoadingSpinner, useToastHelpers } from '../../../components'
import { Plus } from 'lucide-react'
import api from '../../../lib/api'

interface DepositChargeModalProps {
  isOpen: boolean
  onClose: () => void
  accountNum: number
  accountName: string
  onSuccess?: () => void
}

export default function DepositChargeModal({
  isOpen,
  onClose,
  accountNum,
  accountName,
  onSuccess,
}: DepositChargeModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    deposit_date: new Date().toISOString().split('T')[0], // 오늘 날짜 기본값
    memo: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (isOpen && accountNum && accountNum > 0) {
      setFormData({
        amount: '',
        deposit_date: new Date().toISOString().split('T')[0],
        memo: '',
      })
      setErrors({})
    }
  }, [isOpen, accountNum])

  // accountNum이 유효하지 않으면 모달을 렌더링하지 않음
  if (!isOpen || !accountNum || accountNum <= 0) {
    return null
  }

  // 금액 포맷팅 (콤마 제거)
  const formatAmount = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, '')
    return numbers
  }

  // 금액 표시 포맷팅 (콤마 포함)
  const formatAmountDisplay = (value: string): string => {
    if (!value) return ''
    const num = parseInt(value) || 0
    return num.toLocaleString('ko-KR')
  }

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || formData.amount.trim() === '') {
      newErrors.amount = '금액을 입력해주세요.'
    } else {
      const amount = parseInt(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = '금액은 0보다 큰 숫자로 입력해주세요.'
      } else if (amount > 1000000000) {
        newErrors.amount = '금액은 10억원 이하로 입력해주세요.'
      }
    }

    if (!formData.deposit_date || formData.deposit_date.trim() === '') {
      newErrors.deposit_date = '입금일을 선택해주세요.'
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(formData.deposit_date)) {
        newErrors.deposit_date = '입금일은 YYYY-MM-DD 형식으로 입력해주세요.'
      }
    }

    if (formData.memo && formData.memo.length > 500) {
      newErrors.memo = '메모는 500자 이내로 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 예치금 충전 처리
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/pharmacy-deposits/deposit', {
        account_num: accountNum,
        amount: parseInt(formData.amount),
        deposit_date: formData.deposit_date,
        memo: formData.memo.trim(),
      })

      if (response.data.success) {
        toast.success('예치금이 충전되었습니다.')
        onSuccess?.()
        onClose()
      } else {
        throw new Error(response.data.error || '예치금 충전에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('예치금 충전 오류:', error)
      toast.error(
        error.response?.data?.error || error.message || '예치금 충전 중 오류가 발생했습니다.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>예치금 충전</span>
        </div>
      }
      maxWidth="md"
      footer={
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-xs bg-[#667eea] text-white rounded hover:bg-[#5568d3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : '충전하기'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 거래처 정보 */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm font-medium text-gray-900">
            {accountName} (거래처 번호: {accountNum})
          </div>
        </div>

        {/* 금액 입력 */}
        <div>
          <FormInput
            variant="modal"
            type="text"
            placeholder="금액을 입력하세요"
            value={formatAmountDisplay(formData.amount)}
            onChange={(e) => {
              const formatted = formatAmount(e.target.value)
              setFormData({ ...formData, amount: formatted })
              if (errors.amount) {
                setErrors({ ...errors, amount: '' })
              }
            }}
            error={errors.amount}
            fullWidth
          />
          {formData.amount && (
            <div className="mt-1 text-xs text-gray-500">
              {formatAmountDisplay(formData.amount)}원
            </div>
          )}
        </div>

        {/* 입금일 선택 */}
        <div>
          <DatePicker
            variant="modal"
            value={formData.deposit_date}
            onChange={(value) => {
              setFormData({ ...formData, deposit_date: value })
              if (errors.deposit_date) {
                setErrors({ ...errors, deposit_date: '' })
              }
            }}
            error={errors.deposit_date}
            fullWidth
          />
        </div>

        {/* 메모 입력 */}
        <div>
          <FormInput
            variant="modal"
            type="text"
            placeholder="메모 (선택사항)"
            value={formData.memo}
            onChange={(e) => {
              setFormData({ ...formData, memo: e.target.value })
              if (errors.memo) {
                setErrors({ ...errors, memo: '' })
              }
            }}
            error={errors.memo}
            helperText={`${formData.memo.length}/500자`}
            fullWidth
          />
        </div>

        {loading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="md" text="처리 중..." />
          </div>
        )}
      </div>
    </Modal>
  )
}
