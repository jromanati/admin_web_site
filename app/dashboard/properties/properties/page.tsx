import { ProductsManager } from "@/components/ecommerce/products-manager"
import { PropertiesManager } from "@/components/properties/properties-manager"
import { AdminSidebar } from "@/components/admin-sidebar"

interface ProductsPageProps {
  params: {
    id: string
  }
}

export default function ProductsPage({ params }: ProductsPageProps) {
  return (
      <div className="min-h-screen bg-background">
        <AdminSidebar siteType="properties" siteId={params.id} siteName="" currentPath={`/dashboard/properties/properties`} />
        {/* Main content */}
        <div className="lg:pl-64">
          <main className="min-h-screen"> <PropertiesManager siteId={params.id} /></main>
        </div>
      </div>
    )
  
}
