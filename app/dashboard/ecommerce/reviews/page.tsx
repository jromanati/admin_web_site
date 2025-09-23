"use client"
import { AdminSidebar } from "@/components/admin-sidebar"

import { ReviewsManager } from "@/components/ecommerce/reviews-manager"

interface ReviewsPageProps {
  params: {
    id: string
  }
}
export default function ReviewsPage({ params }: ReviewsPageProps) {
  return (
      <div className="min-h-screen bg-background">
        <AdminSidebar siteType="ecommerce" siteId={params.id} siteName="" currentPath={`/dashboard/ecommerce/reviews`} />
        {/* Main content */}
        <div className="lg:pl-64">
          <main className="min-h-screen"> <ReviewsManager siteId={params.id} /></main>
        </div>
      </div>
    )
  
}