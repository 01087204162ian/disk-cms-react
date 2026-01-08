import { useState } from 'react'
import { Modal, Select, DatePicker, LoadingSpinner, useToastHelpers } from '../../../components'
import api from '../../../lib/api'

interface DailyReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DailyReportModal({ isOpen, onClose }: DailyReportModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Array<{ value: string; label: string }>>([])
  const [filters, setFilters] = useState({
    account: '',
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
  })

  // TODO: 일별실적 데이터 로드 및 표시

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="일별 실적" maxWidth="6xl" maxHeight="90vh">
      <div className="space-y-4">
        <p className="text-xs text-gray-500 mb-4">일별 실적을 조회합니다.</p>
        {/* TODO: 일별실적 구현 */}
        <div className="text-center py-4 text-sm text-gray-500">일별실적 기능 구현 예정</div>
      </div>
    </Modal>
  )
}
