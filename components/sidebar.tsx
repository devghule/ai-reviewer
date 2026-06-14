'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, BookOpen, Settings, GitBranch, Shield, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',         label: 'Review',   icon: Home     },
  { href: '/history',  label: 'History',  icon: History  },
  { href: '/context',  label: 'Context',  icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [dark, setDark] = useState(false)

  // Initialise from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') === 'dark'
    setDark(saved)
    document.documentElement.classList.toggle('dark', saved)
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <aside className="w-52 border-r bg-sidebar flex flex-col shrink-0 h-screen">
      {/* Brand */}
      <div className="px-4 py-5 border-b">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <GitBranch className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm tracking-tight">AI Reviewer</span>
        </div>
        <div className="flex items-center gap-1.5 ml-9">
          <Shield className="w-3 h-3 text-green-500" />
          <span className="text-xs text-muted-foreground">Local · Private</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t space-y-3">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <span>{dark ? 'Dark mode' : 'Light mode'}</span>
          {dark
            ? <Moon className="w-3.5 h-3.5" />
            : <Sun className="w-3.5 h-3.5" />}
        </button>
        <p className="text-[11px] text-muted-foreground px-1 leading-relaxed">
          Read-only · No commits · No pushes
        </p>
      </div>
    </aside>
  )
}
