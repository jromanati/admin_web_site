import { AdminSidebar } from "@/components/admin-sidebar"
import { BlogsManager } from "@/components/ecommerce/blogs-manager"

interface BlogsPageProps {
  params: {
    id: string
  }
}

export default function BlogsPage({ params }: BlogsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar siteType="ecommerce" siteId={params.id} siteName="" currentPath={`/dashboard/ecommerce/blogs`} />
      <div className="lg:pl-64">
        <main className="min-h-screen">
          <BlogsManager siteId={params.id} />
        </main>
      </div>
    </div>
  )
}
