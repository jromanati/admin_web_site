import { ProductsManager } from "@/components/ecommerce/products-manager"
import { AdminSidebar } from "@/components/admin-sidebar"

interface ProductsPageProps {
  params: {
    id: string
  }
}

export default function ProductsPage({ params }: ProductsPageProps) {
  return (
      <div className="min-h-screen bg-background">
        <AdminSidebar siteType="ecommerce" siteId={params.id} siteName="" currentPath={`/dashboard/ecommerce/products`} />
        {/* Main content */}
        <div className="lg:pl-64">
          <main className="min-h-screen"> <ProductsManager siteId={params.id} /></main>
        </div>
      </div>
    )
  
}
