import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agent Dashboard | Your AI Team',
  description: 'Visualize and manage your Clawdbot agent team',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  )
}
