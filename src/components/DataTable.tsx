import { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

export interface Column<T> {
  key: string
  header: string | ReactNode
  cell?: (row: T) => ReactNode
  sortable?: boolean
  className?: string
  hidden?: boolean // 반응형 숨김 (lg:hidden 등)
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  pagination?: {
    currentPage: number
    pageSize: number
    totalCount: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
    pageSizeOptions?: number[]
  }
  mobileCard?: (row: T) => ReactNode // 모바일 카드 렌더링 함수
  footer?: ReactNode // 테이블 footer (마지막 행)
  className?: string
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = '데이터가 없습니다.',
  onRowClick,
  pagination,
  mobileCard,
  footer,
  className = '',
}: DataTableProps<T>) {

  // 데스크톱 테이블 헤더
  const renderTableHeader = () => (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-2 py-2 text-center text-xs font-medium text-white border border-white ${column.className || ''}`}
            style={{ 
              fontSize: '12px',
              backgroundColor: '#8E6C9D',
              fontWeight: 500
            }}
          >
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  )

  // 데스크톱 테이블 본문
  const renderTableBody = () => (
    <tbody>
      {data.map((row, index) => {
        const isEven = index % 2 === 1 // 0-based index, so index 1, 3, 5... are even rows
        const baseBgColor = isEven ? '#f8f9fa' : '#ffffff'
        return (
          <tr
            key={index}
            className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            style={{ backgroundColor: baseBgColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dee2e6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = baseBgColor
            }}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((column) => {
              const hasZeroPadding = column.className?.includes('p-0')
              const defaultPadding = hasZeroPadding ? '' : 'px-1 py-0.5'
              return (
                <td 
                  key={column.key} 
                  className={`${defaultPadding} text-center border border-[#e9ecef] ${column.className || ''}`}
                  style={{ 
                    fontSize: '13px',
                    padding: hasZeroPadding ? '0' : '2px 4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {column.cell ? column.cell(row) : (row[column.key] as ReactNode)}
                </td>
              )
            })}
          </tr>
        )
      })}
    </tbody>
  )

  // 페이지네이션
  const renderPagination = () => {
    if (!pagination) return null

    const { currentPage, pageSize, totalCount, onPageChange } = pagination
    const totalPages = Math.ceil(totalCount / pageSize)
    const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const endIndex = totalCount === 0 ? 0 : Math.min(currentPage * pageSize, totalCount)

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="font-medium text-foreground">{startIndex}</span>
          <span>~</span>
          <span className="font-medium text-foreground">{endIndex}</span>
          <span>/</span>
          <span className="font-medium text-foreground">전체 {totalCount.toLocaleString('ko-KR')}개</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-foreground hover:bg-accent'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-card rounded-xl border border-border overflow-hidden ${className}`}>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="md" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-xs">{emptyMessage}</div>
      ) : (
        <>
          {/* 데스크톱 테이블 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              {renderTableHeader()}
              {renderTableBody()}
              {footer && (
                <tfoot>
                  <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 600 }}>
                    {footer}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* 모바일 카드 */}
          {mobileCard && (
            <div className="md:hidden divide-y divide-border">
              {data.map((row, index) => (
                <div key={index}>{mobileCard(row)}</div>
              ))}
            </div>
          )}
        </>
      )}

      {renderPagination()}
    </div>
  )
}
