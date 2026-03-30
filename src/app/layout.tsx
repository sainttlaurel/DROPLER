import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import '@/styles/globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dropler - The Only Dropshipping Engine You\'ll Ever Need',
  description: 'Scale your e-commerce empire with automated workflows and high-conversion storefronts. No fluff. Just raw sales power.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-background font-body text-on-background selection:bg-primary-container">
        <SessionProvider>
          {children}
          <Toaster 
            position="bottom-right" 
            richColors 
            expand={false}
            visibleToasts={3}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#f5f0e8',
                border: '4px solid #1a1a1a',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}
