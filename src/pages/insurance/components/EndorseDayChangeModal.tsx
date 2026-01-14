import { useState, useEffect } from 'react'
import { Modal, useToastHelpers } from '../../../components'

interface EndorseDayChangeModalProps {
  isOpen: boolean
  onClose: () => void
  currentEndorseDay: string
  num: number | string // 배서 번호 (EndorsePnum)
  companyNum?: number | string // 대리운전회사 번호 (dNum)
  policyNum?: string
  companyName?: string
  onSuccess?: () => void
}

export default function EndorseDayChangeModal({
  isOpen,
  onClose,
  currentEndorseDay,
  num,
  companyNum,
  policyNum,
  companyName,
  onSuccess,
}: EndorseDayChangeModalProps) {
  const toast = useToastHelpers()
  const [saving, setSaving] = useState(false)
  const [newEndorseDay, setNewEndorseDay] = useState('')
  const [updateAll, setUpdateAll] = useState(true)

  useEffect(() => {
    if (isOpen) {
      // 현재 기준일을 기본값으로 설정
      setNewEndorseDay(currentEndorseDay || '')
      setUpdateAll(true)
    }
  }, [isOpen, currentEndorseDay])

  const handleSave = async () => {
    if (!num) {
      toast.error('배서 정보가 없습니다.')
      return
    }

    if (!newEndorseDay) {
      toast.error('변경 후 기준일을 선택해주세요.')
      return
    }

    if (newEndorseDay === currentEndorseDay) {
      toast.error('변경 후 기준일이 현재 기준일과 동일합니다.')
      return
    }

    try {
      setSaving(true)

      const response = await fetch('/api/insurance/kj-endorse/update-endorse-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          num: String(num),
          endorseDay: newEndorseDay,
          updateAll,
          policyNum: policyNum || null,
          companyNum: companyNum ? String(companyNum) : null,
          currentEndorseDay: currentEndorseDay || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message || '배서기준일이 성공적으로 변경되었습니다.')
        onClose()
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(result.error || '배서기준일 변경 중 오류가 발생했습니다.')
      }
    } catch (error: any) {
      console.error('배서기준일 변경 오류:', error)
      toast.error('배서기준일 변경 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const headerSubtitle = companyName && policyNum 
    ? `${companyName}[${policyNum}]`
    : policyNum || ''

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="배서기준일 변경"
      subtitle={headerSubtitle}
      maxWidth="2xl"
      footer={
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-base font-semibold bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
          >
            {saving ? '변경 중...' : '배서기준일 변경'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 날짜 변경 영역 */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* 변경전 기준일 */}
            <div className="col-span-5">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                변경전 기준일
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white cursor-not-allowed"
                  value={currentEndorseDay || '-'}
                  readOnly
                />
              </div>
            </div>

            {/* 화살표 아이콘 */}
            <div className="col-span-2 flex justify-center">
              <svg
                className="w-8 h-8 text-primary opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>

            {/* 변경후 기준일 */}
            <div className="col-span-5">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                변경후 기준일
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                value={newEndorseDay}
                onChange={(e) => setNewEndorseDay(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 동일 증권 전체 변경 옵션 */}
        <div className="bg-gray-50 border-l-4 border-primary p-4 rounded">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 mr-3 cursor-pointer"
              checked={updateAll}
              onChange={(e) => setUpdateAll(e.target.checked)}
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-800">
                동일 증권의 미처리 모든 배서건의 배서기준일 변경
              </div>
              <div className="text-sm text-gray-600 mt-1">
                (체크 해제 시 현재 선택한 건만 변경됩니다)
              </div>
            </div>
          </label>
        </div>
      </div>
    </Modal>
  )
}
