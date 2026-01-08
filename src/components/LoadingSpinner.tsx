import { HTMLAttributes } from 'react'

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'muted' | 'white'
  text?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-b-2',
  lg: 'h-12 w-12 border-b-2',
}

const colorClasses = {
  primary: 'border-primary',
  muted: 'border-muted-foreground',
  white: 'border-white',
}

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  className = '',
  ...props
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`} {...props} />
  )

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        {spinner}
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    )
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
        {text ? (
          <div className="flex flex-col items-center justify-center gap-3">
            {spinner}
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
        ) : (
          spinner
        )}
      </div>
    )
  }

  return spinner
}
