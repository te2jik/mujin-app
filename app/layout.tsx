import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '無尽 - Digital Mujin',
  description: '信頼を育てる積立コミュニティ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  )
}
