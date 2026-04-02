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
    { icon: '💬', label: 'チャット', path: '/chat' },
    { icon: '👤', label: 'プロフィール', path: '/profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto backdrop-blur bg-black/40 border-t border-white/5">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 text-xs font-medium transition ${
              isActive(item.path)
                ? 'text-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
