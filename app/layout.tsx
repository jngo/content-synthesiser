import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Content Synthesizer",
  description: "Synthesize books, publications, articles, or other content",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/mermaid/8.11.0/mermaid.min.css" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

