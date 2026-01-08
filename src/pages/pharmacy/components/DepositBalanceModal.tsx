import { useState } from 'react'
import { Modal, LoadingSpinner, useToastHelpers } from '../../../components'
import api from '../../../lib/api'

interface DepositBalanceModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DepositBalanceModal({ isOpen, onClose }: DepositBalanceModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)

  // TODO: 예치잔액 데이터 로드 및 표시

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="예치금 관리" maxWidth="6xl" maxHeight="90vh">
      <div className="space-y-4">
        <p className="text-xs text-gray-500 mb-4">예치금 현황을 조회합니다.</p>
        {/* TODO: 예치잔액 구현 */}
        <div className="text-center py-4 text-sm text-gray-500">예치잔액 기능 구현 예정</div>
      </div>
    </Modal>
  )
}
