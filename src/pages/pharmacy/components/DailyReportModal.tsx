import { Modal } from '../../../components'

interface DailyReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DailyReportModal({ isOpen, onClose }: DailyReportModalProps) {

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
