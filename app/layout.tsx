import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import ModeToggle from "@/components/mode-toggle"
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Indian Tax Assistant',
  description: 'AI-powered tax assistant for Indian taxation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                  <Link className="mr-6 flex items-center space-x-2" href="/">
                    <span className="font-bold">AI Tax Assistant</span>
                  </Link>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                  <nav className="flex items-center">
                    <ModeToggle />
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
