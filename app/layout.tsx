import type { Metadata, Viewport } from 'next'
import { Sora, Manrope } from 'next/font/google'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Splitsy - Las cuentas claras, el amor intacto',
  description: 'App para parejas que comparten gastos',
}

export const viewport: Viewport = {
  width: 390,
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${manrope.variable} ${sora.variable}`}>{children}</body>
    </html>
  )
}
