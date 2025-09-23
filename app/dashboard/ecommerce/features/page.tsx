import { FeaturesManager } from "@/components/ecommerce/features-manager"
import { AdminSidebar } from "@/components/admin-sidebar"

interface FeaturesManagerPageProps {
  params: {
    id: string
  }
}

export default function FeaturesPage({ params }: FeaturesManagerPageProps) {
  return (
      <div className="min-h-screen bg-background">
        <AdminSidebar siteType="ecommerce" siteId={params.id} siteName="" currentPath={`/dashboard/ecommerce/features`} />
        {/* Main content */}
        <div className="lg:pl-64">
          <main className="min-h-screen"> <FeaturesManager siteId={params.id} /></main>
        </div>
      </div>
    )
  
}
