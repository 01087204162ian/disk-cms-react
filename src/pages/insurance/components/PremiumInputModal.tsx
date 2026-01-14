import { Modal } from '../../../components'

interface PremiumInputModalProps {
  isOpen: boolean
  onClose: () => void
  certi: string
  onUpdate?: () => void
}

export default function PremiumInputModal({ isOpen, onClose }: PremiumInputModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="보험료 입력"
      maxWidth="lg"
    >
      <div className="text-center py-8 text-muted-foreground">
        보험료 입력 기능은 Phase 3에서 구현 예정입니다.
      </div>
    </Modal>
  )
}
