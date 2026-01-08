import React, { ReactNode } from 'react'

export interface ButtonGroupProps {
  children: ReactNode
  className?: string
  gap?: 'sm' | 'md' | 'lg'
  justify?: 'start' | 'end' | 'between' | 'center'
  wrap?: boolean
}

export default function ButtonGroup({
  children,
  className = '',
  gap = 'md',
  justify = 'start',
  wrap = true,
}: ButtonGroupProps) {
  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3',
  }

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    between: 'justify-between',
    center: 'justify-center',
  }

  return (
    <div
      className={`
        flex items-center
        ${gapClasses[gap]}
        ${justifyClasses[justify]}
        ${wrap ? 'flex-wrap' : 'flex-nowrap'}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
