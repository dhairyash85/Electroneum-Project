"use client"
import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google"
import type React from "react"

import "./globals.css"
import Navbar from "@/components/navbar"
import { ClerkProvider } from "@clerk/nextjs"
import RoleSelectionPopup from "@/components/RoleSelectionPopup"
import { WalletProvider } from "@/lib/context/WalletContext"
import CompanyDetailsPopup from "@/components/CompanyDetailsPopup"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <WalletProvider>
        <html lang="en" className="dark">
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background min-h-screen`}>
            <div className="relative min-h-screen flex flex-col">
              <Navbar />
              <RoleSelectionPopup />
              <CompanyDetailsPopup />
              <main className="flex-1 pt-20">{children}</main>
              <footer className="py-6 border-t border-border/40 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                  <p>© {new Date().getFullYear()} BlockBounty. All rights reserved.</p>
                </div>
              </footer>
            </div>
          </body>
        </html>
      </WalletProvider>
    </ClerkProvider>
  )
}

