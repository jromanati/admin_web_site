import type React from "react"
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import ServiceWorkerRegistrar from "./(pwa)/service-worker-registrar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Admin Web Sites",
  description: "Administracion",
  // 👇 aquí solo lo básico (sin manifest, sin themeColor)
  applicationName: "Admin Web Sites",
  authors: [{ name: "Metra´s" }],
};

export const viewport: Viewport = {
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <ServiceWorkerRegistrar />
      <body className="antialiased">{children}</body>
    </html>
  )
}
