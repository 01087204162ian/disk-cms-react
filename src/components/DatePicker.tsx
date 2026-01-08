import { forwardRef, InputHTMLAttributes, useState } from 'react'
import { Calendar } from 'lucide-react'
import FormInput, { type FormInputProps } from './FormInput'

export interface DatePickerProps extends Omit<FormInputProps, 'type' | 'leftIcon'> {
  value?: string
  onChange?: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, variant = 'default', className = '', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange?.(newValue)
      // props.onChange도 호출 (기존 React input 이벤트 호환)
      if (props.onChange && typeof props.onChange !== 'function') {
        ;(props.onChange as any)?.(e)
      }
    }

    return (
      <FormInput
        ref={ref}
        type="date"
        value={value}
        onChange={handleChange}
        variant={variant}
        leftIcon={<Calendar className="w-4 h-4 text-muted-foreground" />}
        className={className}
        {...props}
      />
    )
  }
)

DatePicker.displayName = 'DatePicker'

export default DatePicker
