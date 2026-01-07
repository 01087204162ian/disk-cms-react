import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard,
  Users,
  Shield,
  Pill,
  Car,
  GraduationCap,
  X,
  ChevronRight,
  Calendar,
  FileText,
  Plane,
  Golf,
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface MenuItem {
  id: string
  title: string
  icon?: string
  page?: string
  order: number
  roles?: string[]
  children?: MenuItem[]
}

interface MenuConfig {
  menus: MenuItem[]
}

// Font Awesome 아이콘을 Lucide 아이콘으로 매핑
const iconMap: Record<string, any> = {
  'fas fa-tachometer-alt': LayoutDashboard,
  'fas fa-users': Users,
  'fas fa-shield-alt': Shield,
  'fas fa-car': Car,
  'fas fa-graduation-cap': GraduationCap,
  'fas fa-pills': Pill,
  'fas fa-plane': Plane,
  'fas fa-golf-ball': Golf,
  'fas fa-calendar': Calendar,
  'fas fa-file-alt': FileText,
}

// 기본 아이콘
const DefaultIcon = FileText

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuthStore()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [menuConfig, setMenuConfig] = useState<MenuConfig | null>(null)

  useEffect(() => {
    // menu-config.json 로드
    fetch('/config/menu-config.json')
      .then((res) => res.json())
      .then((data) => {
        setMenuConfig(data)
      })
      .catch((err) => {
        console.error('메뉴 설정 로드 실패:', err)
      })
  }, [])

  // 현재 경로가 활성 메뉴인지 확인
  const isActiveMenu = (page?: string) => {
    if (!page) return false
    const currentPath = location.pathname
    // page 경로가 현재 경로와 일치하는지 확인
    return currentPath === `/${page}` || currentPath.startsWith(`/${page}/`)
  }

  // 권한 체크
  const hasPermission = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true
    if (!user?.role) return false
    return roles.includes(user.role)
  }

  // 메뉴 필터링 (권한 체크)
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => hasPermission(item.roles))
      .map((item) => ({
        ...item,
        children: item.children ? filterMenuItems(item.children) : undefined,
      }))
      .sort((a, b) => a.order - b.order)
  }

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const renderIcon = (iconName?: string) => {
    if (!iconName) return <DefaultIcon className="w-5 h-5" />
    const IconComponent = iconMap[iconName] || DefaultIcon
    return <IconComponent className="w-5 h-5" />
  }

  const renderMenuItem = (item: MenuItem, level: number = 0): JSX.Element | null => {
    // 권한 체크
    if (!hasPermission(item.roles)) return null

    // 자식 메뉴가 있는 경우
    if (item.children && item.children.length > 0) {
      const isExpanded = expandedItems.includes(item.id)
      const hasActiveChild = item.children.some((child) => isActiveMenu(child.page))

      return (
        <div key={item.id}>
          <button
            onClick={() => toggleExpand(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              'hover:bg-accent text-foreground',
              level > 0 && 'ml-4',
              hasActiveChild && 'bg-primary/10 text-primary'
            )}
          >
            {renderIcon(item.icon)}
            <span className="flex-1 text-left">{item.title}</span>
            <ChevronRight
              className={cn(
                'w-4 h-4 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    // 페이지 링크가 있는 경우
    if (item.page) {
      const path = `/${item.page}`
      const isActive = isActiveMenu(item.page)

      return (
        <Link
          key={item.id}
          to={path}
          onClick={() => {
            if (window.innerWidth < 1024) {
              onClose()
            }
          }}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
            level > 0 && 'ml-4',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-foreground'
          )}
        >
          {renderIcon(item.icon)}
          <span>{item.title}</span>
        </Link>
      )
    }

    // 링크가 없는 그룹 헤더인 경우
    return (
      <div
        key={item.id}
        className={cn(
          'px-4 py-2 text-sm font-semibold text-muted-foreground',
          level > 0 && 'ml-4'
        )}
      >
        {item.title}
      </div>
    )
  }

  if (!menuConfig) {
    return (
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </aside>
    )
  }

  const filteredMenus = filterMenuItems(menuConfig.menus)

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
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
            {filteredMenus.map((item) => renderMenuItem(item))}
          </nav>
        </div>
      </aside>
    </>
  )
}
