import { CategoriesManager } from "@/components/ecommerce/categories-manager"
import { AdminSidebar } from "@/components/admin-sidebar"
interface CategoriesPageProps {
  params: {
    id: string
  }
}

export default function CategoriesPage({ params }: CategoriesPageProps) {
  // return <CategoriesManager siteId={params.id} />
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar siteType="ecommerce" siteId={params.id} siteName="" currentPath={`/dashboard/ecommerce/categories`} />
      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen"> <CategoriesManager siteId={params.id} /></main>
      </div>
    </div>
  )
}
