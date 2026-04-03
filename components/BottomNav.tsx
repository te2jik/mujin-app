'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface BottomNavProps {
  userId: string
}

export default function BottomNav({ userId }: BottomNavProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const navItems = [
    { icon: '🏠', label: 'ホーム', path: '/dashboard' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-50">
      <div className="mx-3 mb-3 backdrop-blur-xl bg-[#111827]/90 border border-white/10 rounded-2xl shadow-lg shadow-black/30">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex-1 py-2.5 flex flex-col items-center justify-center gap-1 text-xs font-medium transition rounded-xl mx-1 ${
                isActive(item.path)
                  ? 'text-white bg-white/10'
                  : 'text-white/40 hover:text-white/60 active:bg-white/5'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
