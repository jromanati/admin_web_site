import { AICreditsFullPage } from "@/components/properties/ai-credits-full-page"
import { AdminSidebar } from "@/components/admin-sidebar"

interface AICreditsPageProps {
  params: {
    id: string
  }
}

export default function AICreditsPage({ params }: AICreditsPageProps) {
//   return <AICreditsFullPage siteId={params.id} />
  return (
      <div className="min-h-screen bg-background">
        <AdminSidebar siteType="properties" siteId="" siteName="" currentPath={`/dashboard/properties/properties`} />
        {/* Main content */}
        <div className="lg:pl-64">
          <main className="min-h-screen">  <AICreditsFullPage siteId={params.id} /></main>
        </div>
      </div>
    )
}
