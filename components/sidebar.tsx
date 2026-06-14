'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  History,
  FileText,
  Settings,
  BookOpen,
  GitBranch,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Review', icon: Home },
  { href: '/history', label: 'History', icon: History },
  { href: '/context', label: 'Context', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r bg-sidebar flex flex-col shrink-0">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">AI Reviewer</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Local · Private · Read-only</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              pathname === href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t">
        <p className="text-xs text-muted-foreground">
          Reviews auto-deleted after 14 days
        </p>
      </div>
    </aside>
  )
}
