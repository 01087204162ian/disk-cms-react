import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { cn } from '../lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={cn(
        "lg:pl-64 transition-all duration-300",
        sidebarOpen && "pl-64"
      )}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-6">
          {children}
        </main>
      </div>
      
      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
