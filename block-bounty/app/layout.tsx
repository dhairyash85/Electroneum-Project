"use client"
import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google"
import type React from "react"

import "./globals.css"
import Navbar from "@/components/navbar"
import { ClerkProvider } from "@clerk/nextjs"
import RoleSelectionPopup from "@/components/RoleSelectionPopup"
import { WalletProvider } from "@/lib/context/WalletContext"
import CompanyDetailsPopup from "@/components/CompanyDetailsPopup"
import Script from "next/script";

const GA_MEASUREMENT_ID = "G-H0WBP5MWS3";
const GTM_ID = "GTM-NWQB686D";

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
      <html lang="en" className="dark">
        <head>
          {/* Google Tag Manager Script */}
          <Script id="gtm" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `}
          </Script>

          {/* Google Analytics Script */}
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `,
            }}
          />
        </head>
        <WalletProvider>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background min-h-screen`}>
            {/* Google Tag Manager (noscript) */}
            <noscript>
              <iframe 
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              ></iframe>
            </noscript>
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
        </WalletProvider>
      </html>
    </ClerkProvider>
  )
}
