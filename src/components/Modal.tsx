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
    if (!modalRef.current) return
    
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

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      setModalPosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - (modalRef.current?.offsetWidth || 0))),
        y: Math.max(0, Math.min(newY, window.innerHeight - (modalRef.current?.offsetHeight || 0))),
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, modalPosition])

  // 모달이 열려있을 때 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      // 모달이 닫힐 때 스크롤 위치 복원
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }

    return () => {
      // cleanup 시에도 스크롤 복원
      if (!isOpen) {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

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
        className={`w-full ${maxWidthClasses[maxWidth]} ${maxHeight ? `max-h-[${maxHeight}]` : 'max-h-[90vh]'} rounded-xl bg-background border border-border overflow-hidden flex flex-col`}
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
