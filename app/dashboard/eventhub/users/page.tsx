"use client"

import { UsersManager } from "@/components/users/users-manager"
import { AdminSidebar } from "@/components/admin-sidebar"

interface UsersPageProps {
  params: { id: string }
}

export default function UsersPage({ params }: UsersPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar siteType="eventhub" siteId={params.id} siteName="" currentPath={`/dashboard/eventhub/users`} />
      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen"> <UsersManager siteId={params.id} siteType="eventhub" /></main>
      </div>
    </div>
  )
}
