import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sales Tracker App',
  description: 'Created with Aniket',
  generator: 'Self Creations',
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
