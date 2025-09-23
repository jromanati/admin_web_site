import { PropertyFormPage } from "@/components/properties/property-form-page"
import { AdminSidebar } from "@/components/admin-sidebar"

interface CreatePropertyPageProps {
  
}

export default function CreatePropertyPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar siteType="properties" siteId="" siteName="" currentPath={`/dashboard/properties/properties`} />
      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen"> <PropertyFormPage propertyId="" mode="create" /></main>
      </div>
    </div>
  )
}
