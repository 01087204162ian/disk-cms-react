import { FileSpreadsheet, Download } from 'lucide-react'

export interface ExportButtonProps {
  onClick: () => void | Promise<void>
  label?: string
  variant?: 'default' | 'sm' | 'lg'
  className?: string
  disabled?: boolean
  loading?: boolean
  icon?: 'excel' | 'download'
  showLabel?: boolean // 반응형 레이블 표시 여부
}

export default function ExportButton({
  onClick,
  label = '엑셀 다운로드',
  variant = 'default',
  className = '',
  disabled = false,
  loading = false,
  icon = 'excel',
  showLabel = true,
}: ExportButtonProps) {
  const variantClasses = {
    sm: 'px-3 py-1.5 text-xs',
    default: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const Icon = icon === 'excel' ? FileSpreadsheet : Download

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantClasses[variant]}
        bg-blue-500 text-white rounded font-medium
        hover:bg-blue-600
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        flex items-center gap-1.5
        ${className}
      `}
      title={label}
    >
      <Icon className="w-4 h-4" />
      {showLabel && <span className="hidden md:inline">{label}</span>}
      {loading && <span className="ml-1">...</span>}
    </button>
  )
}
