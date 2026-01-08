import { useEffect, useState } from 'react'
import { Modal, FormInput, Select, DatePicker, LoadingSpinner, useToastHelpers } from '../../../components'
import api from '../../../lib/api'

interface PharmacyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  pharmacyId: number | null
  onUpdate?: () => void
}

export default function PharmacyDetailModal({ isOpen, onClose, pharmacyId, onUpdate }: PharmacyDetailModalProps) {
  const toast = useToastHelpers()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<any>(null)

  useEffect(() => {
    if (isOpen && pharmacyId) {
      loadDetail()
    }
  }, [isOpen, pharmacyId])

  const loadDetail = async () => {
    if (!pharmacyId) return

    try {
      setLoading(true)
      const res = await api.get(`/api/pharmacy/id-detail/${pharmacyId}`)
      if (res.data?.success) {
        setDetail(res.data.data)
      }
    } catch (error: any) {
      console.error('상세 정보 로드 오류:', error)
      toast.error(error?.message || '상세 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // TODO: 상세 정보 표시 및 수정 기능 구현

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="약국 상세 정보" maxWidth="4xl" maxHeight="90vh">
      <div className="space-y-4">
        {loading ? (
          <LoadingSpinner size="md" />
        ) : detail ? (
          <div className="text-center py-4 text-sm text-gray-500">상세 정보 표시 구현 예정</div>
        ) : (
          <div className="text-center py-4 text-sm text-red-500">상세 정보를 불러올 수 없습니다.</div>
        )}
      </div>
    </Modal>
  )
}
