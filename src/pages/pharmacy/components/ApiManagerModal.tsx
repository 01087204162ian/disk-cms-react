import { useState } from 'react'
import { Modal, LoadingSpinner, useToastHelpers } from '../../../components'
import api from '../../../lib/api'

interface ApiManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ApiManagerModal({ isOpen, onClose }: ApiManagerModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)

  // TODO: API 키 관리 기능 구현

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="API 키 관리 시스템" maxWidth="6xl" maxHeight="90vh">
      <div className="space-y-4">
        <p className="text-xs text-gray-500 mb-4">API 키를 관리합니다.</p>
        {/* TODO: API 관리 구현 */}
        <div className="text-center py-4 text-sm text-gray-500">API 관리 기능 구현 예정</div>
      </div>
    </Modal>
  )
}
