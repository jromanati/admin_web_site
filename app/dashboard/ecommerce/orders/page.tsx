import { OrdersManager } from "@/components/ecommerce/orders-manager"

interface OrdersPageProps {
  params: {
    id: string
  }
}

export default function OrdersPage({ params }: OrdersPageProps) {
  return <OrdersManager siteId={params.id} />
}
