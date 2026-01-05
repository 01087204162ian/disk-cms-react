import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import {
  LayoutDashboard,
  Users,
  Shield,
  Pill,
  Car,
  GraduationCap,
  X,
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const menuItems = [
  {
    id: 'dashboard',
    title: '대시보드',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    id: 'staff',
    title: '직원전용',
    icon: Users,
    children: [
      { id: 'employees', title: '직원리스트', path: '/staff/employees' },
      { id: 'schedule', title: '근무일정', path: '/staff/schedule' },
      { id: 'holidays', title: '공휴일 관리', path: '/staff/holidays' },
    ],
  },
  {
    id: 'insurance',
    title: '보험상품',
    icon: Shield,
    children: [
      {
        id: 'pharmacy',
        title: '약국배상책임보험',
        icon: Pill,
        children: [
          { id: 'pharmacy-applications', title: '신청리스트', path: '/insurance/pharmacy/applications' },
          { id: 'pharmacy-claims', title: '클레임', path: '/insurance/pharmacy/claims' },
        ],
      },
      {
        id: 'field-practice',
        title: '현장실습보험',
        icon: GraduationCap,
        children: [
          { id: 'field-applications', title: '신청리스트', path: '/insurance/field-practice/applications' },
          { id: 'field-claims', title: '클레임', path: '/insurance/field-practice/claims' },
        ],
      },
      {
        id: 'kj-driver',
        title: 'KJ대리운전',
        icon: Car,
        children: [
          { id: 'kj-search', title: '검색', path: '/insurance/kj-driver/search' },
          { id: 'kj-company', title: '회사관리', path: '/insurance/kj-driver/company' },
        ],
      },
    ],
  },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const renderMenuItem = (item: any) => {
    if (item.children) {
      const isExpanded = expandedItems.includes(item.id)
      const Icon = item.icon

      return (
        <div key={item.id}>
          <button
            onClick={() => toggleExpand(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              "hover:bg-accent text-foreground"
            )}
          >
            {Icon && <Icon className="w-5 h-5" />}
            <span className="flex-1 text-left">{item.title}</span>
            <span className={cn(
              "transition-transform",
              isExpanded && "rotate-90"
            )}>
              ▶
            </span>
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child: any) => renderMenuItem(child))}
            </div>
          )}
        </div>
      )
    }

    const Icon = item.icon
    return (
      <Link
        key={item.id}
        to={item.path}
        onClick={() => {
          if (window.innerWidth < 1024) {
            onClose()
          }
        }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          isActive(item.path)
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent text-foreground"
        )}
      >
        {Icon && <Icon className="w-5 h-5" />}
        <span>{item.title}</span>
      </Link>
    )
  }

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border",
          "transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h1 className="text-xl font-bold text-foreground">보험 CMS</h1>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-accent rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 메뉴 */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map(renderMenuItem)}
          </nav>
        </div>
      </aside>
    </>
  )
}
