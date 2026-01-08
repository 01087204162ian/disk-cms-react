import { Download, File as FileIcon } from 'lucide-react'

export interface FileDownloadLinkProps {
  filename: string
  downloadUrl?: string
  onDownload?: () => void
  variant?: 'link' | 'button'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function FileDownloadLink({
  filename,
  downloadUrl,
  onDownload,
  variant = 'link',
  size = 'md',
  className = '',
}: FileDownloadLinkProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  const handleClick = () => {
    if (onDownload) {
      onDownload()
    } else if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`
          ${sizeClasses[size]}
          bg-blue-500 text-white rounded font-medium
          hover:bg-blue-600
          transition-colors
          flex items-center gap-1.5
          ${className}
        `}
        title={filename}
      >
        <Download className="w-4 h-4" />
        <span className="truncate max-w-[200px]">{filename}</span>
      </button>
    )
  }

  return (
    <a
      href={downloadUrl || '#'}
      onClick={(e) => {
        e.preventDefault()
        handleClick()
      }}
      className={`
        ${sizeClasses[size]}
        text-blue-600 hover:text-blue-800
        transition-colors
        flex items-center gap-1.5
        ${className}
      `}
      title={filename}
    >
      <FileIcon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate max-w-[200px]">{filename}</span>
      <Download className="w-3 h-3 flex-shrink-0" />
    </a>
  )
}
