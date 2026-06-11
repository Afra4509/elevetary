import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Aeferalow API — AI API Gateway',
  description: 'Professional AI API Gateway with smart routing, streaming support, and OpenAI-compatible endpoints.',
  keywords: ['AI API', 'API Gateway', 'OpenAI compatible', 'gpt', 'Aeferalow'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
