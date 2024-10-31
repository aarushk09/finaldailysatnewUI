import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import SharedLayout from '@/components/ui/shared-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Farm-to-Table Supply Chain Platform',
  description: 'Connect with local farmers and enjoy sustainable, organic food.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SharedLayout>
          {children}
        </SharedLayout>
        <Toaster />
      </body>
    </html>
  )
}