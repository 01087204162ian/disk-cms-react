import { ReactNode, useState, useRef, useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string | ReactNode
  children: ReactNode
  subtitle?: string | ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl'
  maxHeight?: string
  footer?: ReactNode
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
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

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  subtitle,
  maxWidth = 'lg',
  maxHeight,
  footer,
  position = 'center',
}: ModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setModalPosition(null)
      setIsDragging(false)
    }
  }, [isOpen])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // 입력 필드, 버튼, 링크 등은 드래그 대상에서 제외
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'SELECT' ||
      target.closest('input') ||
      target.closest('button') ||
      target.closest('select') ||
      target.closest('[role="button"]')
    ) {
      return
    }

    if (!modalRef.current) return
    
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(true)
    const rect = modalRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    
    if (modalPosition === null) {
      setModalPosition({
        x: rect.left,
        y: rect.top,
      })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || modalPosition === null) return

      e.preventDefault()
      e.stopPropagation()

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      setModalPosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - (modalRef.current?.offsetWidth || 0))),
        y: Math.max(0, Math.min(newY, window.innerHeight - (modalRef.current?.offsetHeight || 0))),
      })
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp, { passive: false })
      // 드래그 중 텍스트 선택 방지
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'move'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDragging, dragOffset, modalPosition])

  if (!isOpen) return null

  const positionClasses = {
    center: 'items-center justify-center',
    'top-left': 'items-start justify-start',
    'top-right': 'items-start justify-end',
    'bottom-left': 'items-end justify-start',
    'bottom-right': 'items-end justify-end',
  }

  const modalStyle: React.CSSProperties = {
    ...(maxHeight ? { maxHeight } : {}),
    ...(modalPosition ? {
      position: 'fixed',
      left: `${modalPosition.x}px`,
      top: `${modalPosition.y}px`,
      margin: 0,
    } : {}),
  }

  return (
    <div className={`fixed inset-0 z-50 flex ${modalPosition ? 'items-start justify-start' : positionClasses[position]} bg-black/50 p-4`}>
      <div
        ref={modalRef}
        className={`w-full ${maxWidthClasses[maxWidth]} ${maxHeight ? `max-h-[${maxHeight}]` : ''} rounded-xl bg-background border border-border overflow-hidden flex flex-col`}
        style={modalStyle}
      >
        {/* 헤더 */}
        <div
          ref={headerRef}
          className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-4 flex items-center justify-between flex-shrink-0 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div>
            <h5 className="text-lg font-semibold text-white m-0">{title}</h5>
            {subtitle && <small className="block mt-1 text-sm font-normal text-white/85">{subtitle}</small>}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded p-1 text-xl leading-none transition-colors"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 본문 */}
        <div className={`flex-1 overflow-y-auto p-6 bg-white ${maxHeight ? '' : ''}`}>{children}</div>

        {/* 푸터 (선택적) */}
        {footer && <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">{footer}</div>}
      </div>
    </div>
  )
}
