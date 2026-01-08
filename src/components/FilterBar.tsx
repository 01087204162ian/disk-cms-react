import { ReactNode } from 'react'
import { Search } from 'lucide-react'

interface FilterSelectProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  className?: string
}

export function FilterSelect({ value, onChange, options, placeholder, className = '' }: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 px-3 py-0 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm leading-none font-normal appearance-none cursor-pointer ${className}`}
      style={{
        fontFamily: 'inherit',
        lineHeight: '1.5',
        boxSizing: 'border-box',
        minHeight: '40px',
        height: '40px',
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

interface FilterInputProps {
  value: string
  onChange: (value: string) => void
  onSearch?: () => void
  placeholder?: string
  className?: string
}

export function FilterInput({ value, onChange, onSearch, placeholder, className = '' }: FilterInputProps) {
  return (
    <div className={`flex-1 relative min-w-[200px] ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && onSearch) {
            onSearch()
          }
        }}
        placeholder={placeholder}
        className="w-full pl-10 pr-3 py-0 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm leading-none font-normal"
        style={{
          fontFamily: 'inherit',
          lineHeight: '1.5',
          boxSizing: 'border-box',
          minHeight: '42px',
          height: '42px',
        }}
      />
    </div>
  )
}

interface FilterSearchButtonProps {
  onClick: () => void
  className?: string
}

export function FilterSearchButton({ onClick, className = '' }: FilterSearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`h-10 px-3 py-0 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm leading-none font-normal ${className}`}
      style={{
        fontFamily: 'inherit',
        lineHeight: '1.5',
      }}
    >
      <Search className="w-4 h-4" />
      검색
    </button>
  )
}

interface StatsDisplayProps {
  stats: Array<{
    label: string
    value: number | string
    color?: 'foreground' | 'yellow' | 'green' | 'muted'
  }>
  lastRefresh?: Date
  className?: string
}

export function StatsDisplay({ stats, lastRefresh, className = '' }: StatsDisplayProps) {
  const colorClasses = {
    foreground: 'text-foreground',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    muted: 'text-muted-foreground',
  }

  return (
    <div className={`flex flex-wrap items-center gap-4 text-xs ml-auto ${className}`}>
      {stats.map((stat, index) => (
        <span key={index} className={colorClasses[stat.color || 'foreground']}>
          {typeof stat.value === 'number' ? (
            <>
              {stat.label} <strong>{stat.value}</strong>명
            </>
          ) : (
            stat.label
          )}
        </span>
      ))}
      {lastRefresh && (
        <span className="text-muted-foreground">갱신: {lastRefresh.toLocaleTimeString('ko-KR')}</span>
      )}
    </div>
  )
}

interface FilterBarProps {
  children: ReactNode
  actionButtons?: ReactNode
  className?: string
}

export default function FilterBar({ children, actionButtons, className = '' }: FilterBarProps) {
  return (
    <div className={`bg-card rounded-xl border border-border p-6 ${className}`}>
      {/* 필터 행 */}
      <div className="flex flex-wrap items-center gap-3">{children}</div>

      {/* 액션 버튼 영역 */}
      {actionButtons && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">{actionButtons}</div>
        </div>
      )}
    </div>
  )
}

// Export all components together
FilterBar.Select = FilterSelect
FilterBar.Input = FilterInput
FilterBar.SearchButton = FilterSearchButton
FilterBar.Stats = StatsDisplay
