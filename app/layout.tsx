import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Playfair_Display } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

const playfair = Playfair_Display({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ilyes & Myriam - Wedding",
  description: "Wedding website for Ilyes and Myriam",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}


import './globals.css'