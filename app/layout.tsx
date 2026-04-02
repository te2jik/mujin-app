import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '無尽 - デジタル回転貯蓄',
  description: '信頼を育てる積立コミュニティ。家族や友人とお金を共に育てる。',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0a0e1a" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔄</text></svg>" />
      </head>
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  )
}
