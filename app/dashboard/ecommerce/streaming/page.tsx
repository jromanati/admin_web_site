import { AdminLayout } from "@/components/admin-layout"
import { AdminSidebar } from "@/components/admin-sidebar"
import { StreamingManager } from "@/components/ecommerce/streaming-manager"

interface StreamingPageProps {
  params: {
    id: string
  }
}

export default function StreamingPage({ params }: StreamingPageProps) {
  return (
      <div className="min-h-screen bg-background">
        <AdminSidebar siteType="ecommerce" siteId={params.id} siteName="" currentPath={`/dashboard/ecommerce/streaming`} />
        {/* Main content */}
        <div className="lg:pl-64">
          <main className="min-h-screen"> <StreamingManager siteId={params.id} /></main>
        </div>
      </div>
    )
}
