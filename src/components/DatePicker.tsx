import { forwardRef } from 'react'
import { Calendar } from 'lucide-react'
import FormInput, { type FormInputProps } from './FormInput'

export interface DatePickerProps extends Omit<FormInputProps, 'type' | 'leftIcon' | 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, variant = 'default', className = '', fullWidth, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange?.(newValue)
    }

    // variant가 'filter'일 때는 fullWidth를 false로 설정 (className의 width가 적용되도록)
    const shouldFullWidth = fullWidth !== undefined ? fullWidth : variant !== 'filter'

    return (
      <FormInput
        ref={ref}
        type="date"
        value={value}
        onChange={handleChange}
        variant={variant}
        leftIcon={<Calendar className="w-4 h-4 text-muted-foreground" />}
        className={className}
        fullWidth={shouldFullWidth}
        {...props}
      />
    )
  }
)

DatePicker.displayName = 'DatePicker'

export default DatePicker
