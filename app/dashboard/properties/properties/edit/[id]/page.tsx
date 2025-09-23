import { PropertyFormPage } from "@/components/properties/property-form-page"
import { AdminSidebar } from "@/components/admin-sidebar"

interface EditPropertyPageProps {
  params: {
    id: string
    propertyId: string
  }
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  // return <PropertyFormPage siteId={params.id} propertyId={params.propertyId} mode="edit" />
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar siteType="properties" siteId={params.id} siteName="" currentPath={`/dashboard/properties/properties`} />
      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen">
          <PropertyFormPage propertyId={params.id} mode="edit" />
        </main>
      </div>
    </div>
  )
}
