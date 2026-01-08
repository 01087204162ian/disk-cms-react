import { forwardRef, InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'

export interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filter' | 'modal'
  fullWidth?: boolean
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    // Variant별 기본 클래스
    const variantClasses = {
      default: 'px-3 py-1.5 text-sm border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-lg',
      filter: 'px-3 py-0 text-sm leading-none font-normal border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-lg',
      modal: 'px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500',
    }

    // Variant별 높이 스타일
    const variantStyles = {
      default: {},
      filter: {
        fontFamily: 'inherit',
        lineHeight: '1.5',
        boxSizing: 'border-box' as const,
        minHeight: '42px',
        height: '42px',
      },
      modal: {},
    }

    const baseClasses = variantClasses[variant]
    const baseStyles = variantStyles[variant]

    // 검색 아이콘 자동 추가 (filter variant이고 leftIcon이 없을 때)
    const shouldShowSearchIcon = variant === 'filter' && !leftIcon
    const leftPadding = shouldShowSearchIcon ? 'pl-10' : leftIcon ? 'pl-10' : 'pl-3'

    const inputClasses = `${baseClasses} ${leftPadding} ${rightIcon ? 'pr-10' : 'pr-3'} ${fullWidth ? 'w-full' : ''} ${error ? 'border-destructive focus:ring-destructive' : ''} ${className}`

    const inputElement = (
      <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
        {shouldShowSearchIcon && (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        )}
        {leftIcon && !shouldShowSearchIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={inputClasses}
          style={baseStyles}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
    )

    // Label이 있는 경우
    if (label) {
      return (
        <div className={fullWidth ? 'w-full' : ''}>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
          {inputElement}
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          {helperText && !error && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
        </div>
      )
    }

    // Label이 없는 경우 (플레이스홀더만 사용)
    return (
      <>
        {inputElement}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
      </>
    )
  }
)

FormInput.displayName = 'FormInput'

export default FormInput
