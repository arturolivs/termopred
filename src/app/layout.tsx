import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TermoPred — Registros Termográficos',
  description: 'Sistema de gestão de registros de termografia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
