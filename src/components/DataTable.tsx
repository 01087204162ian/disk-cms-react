import { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

export interface Column<T> {
  key: string
  header: string
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
  className = '',
}: DataTableProps<T>) {

  // 데스크톱 테이블 헤더
  const renderTableHeader = () => (
    <thead className="bg-accent">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-4 py-3 text-left text-sm font-medium text-foreground ${column.className || ''}`}
          >
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  )

  // 데스크톱 테이블 본문
  const renderTableBody = () => (
    <tbody className="divide-y divide-border">
      {data.map((row, index) => (
        <tr
          key={index}
          className={`hover:bg-accent/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
          onClick={() => onRowClick?.(row)}
        >
          {columns.map((column) => (
            <td key={column.key} className={`px-4 py-3 text-xs ${column.className || ''}`}>
              {column.cell ? column.cell(row) : (row[column.key] as ReactNode)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )

  // 페이지네이션
  const renderPagination = () => {
    if (!pagination) return null

    const { currentPage, pageSize, totalCount, onPageChange, onPageSizeChange, pageSizeOptions } = pagination
    const totalPages = Math.ceil(totalCount / pageSize)
    const startIndex = (currentPage - 1) * pageSize + 1
    const endIndex = Math.min(currentPage * pageSize, totalCount)

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="text-sm text-muted-foreground">
          {startIndex} ~ {endIndex} / 전체 {totalCount}개
        </div>
        <div className="flex items-center gap-2">
          {onPageSizeChange && pageSizeOptions && (
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value))
                onPageChange(1)
              }}
              className="px-3 py-1.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}개
                </option>
              ))}
            </select>
          )}
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
            <table className="w-full">
              {renderTableHeader()}
              {renderTableBody()}
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
