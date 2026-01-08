import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl'
  footer?: ReactNode
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'lg', footer }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full ${maxWidthClasses[maxWidth]} rounded-xl bg-background border border-border overflow-hidden`}>
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-4 flex items-center justify-between">
          <h5 className="text-lg font-semibold text-white m-0">{title}</h5>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded p-1 text-xl leading-none transition-colors"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 bg-white">{children}</div>

        {/* 푸터 (선택적) */}
        {footer && <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">{footer}</div>}
      </div>
    </div>
  )
}
      </div>
    </div>
  )
}
