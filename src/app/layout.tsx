import type { Metadata } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import { ToastProvider } from '@/components/ui/Toast'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  // Space Grotesk supports 300–700 as named weights; use variable for full range
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'Aeferalow API — AI API Gateway',
  description: 'Professional AI API Gateway with smart routing, streaming support, rate limiting, and OpenAI-compatible endpoints.',
  keywords: ['AI API', 'API Gateway', 'OpenAI compatible', 'gpt', 'Aeferalow', 'AI Gateway'],
  openGraph: {
    title: 'Aeferalow API — AI API Gateway',
    description: 'Professional AI API Gateway with smart routing, streaming support, and OpenAI-compatible endpoints.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
