import { AdminSidebar } from "@/components/admin-sidebar"
import { ShippingCostsManager } from "@/components/ecommerce/shipping-costs-manager"

export default function ShippingCostsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        siteType="ecommerce"
        siteId=""
        siteName=""
        currentPath={`/dashboard/ecommerce/shipping-costs`}
      />
      <div className="lg:pl-64">
        <main className="min-h-screen">
          <ShippingCostsManager />
        </main>
      </div>
    </div>
  )
}
