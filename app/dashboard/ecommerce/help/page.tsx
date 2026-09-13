import { AdminLayout } from "@/components/admin-layout"
import { EcommerceHelp } from "@/components/ecommerce/ecommerce-help"

export default function EcommerceHelpPage() {
  return (
    <AdminLayout
      siteType="ecommerce"
      siteId=""
      siteName="Tienda"
      currentPath="/dashboard/ecommerce/help"
    >
      <EcommerceHelp />
    </AdminLayout>
  )
}
