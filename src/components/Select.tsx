import { forwardRef, SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  variant?: 'default' | 'filter' | 'modal'
  fullWidth?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      variant = 'default',
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    // Variant별 기본 클래스
    const variantClasses = {
      default:
        'px-3 py-1.5 text-sm border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-lg appearance-none cursor-pointer',
      filter:
        'px-3 py-0 text-sm leading-none font-normal border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-lg appearance-none cursor-pointer',
      modal:
        'px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer',
    }

    // Variant별 스타일
    const variantStyles = {
      default: {},
      filter: {
        fontFamily: 'inherit',
        lineHeight: '1.5',
        boxSizing: 'border-box' as const,
        minHeight: '40px',
        height: '40px',
      },
      modal: {},
    }

    const baseClasses = variantClasses[variant]
    const baseStyles = variantStyles[variant]

    const selectClasses = `${baseClasses} ${fullWidth ? 'w-full' : ''} ${error ? 'border-destructive focus:ring-destructive' : ''} ${className}`

    const selectElement = (
      <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
        <select ref={ref} className={selectClasses} style={baseStyles} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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
          {selectElement}
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          {helperText && !error && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
        </div>
      )
    }

    // Label이 없는 경우 (플레이스홀더만 사용)
    return (
      <>
        {selectElement}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
      </>
    )
  }
)

Select.displayName = 'Select'

export default Select
