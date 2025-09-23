"use client"

import type React from "react"

import { AdminSidebar } from "./admin-sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
  siteType: "ecommerce" | "properties" | "excursions"
  siteId: string
  siteName: string
  currentPath?: string
}

export function AdminLayout({ children, siteType, siteId, siteName, currentPath }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar siteType={siteType} siteId={siteId} siteName={siteName} currentPath={currentPath} />

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
