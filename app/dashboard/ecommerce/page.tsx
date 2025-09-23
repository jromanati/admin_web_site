import { EcommerceDashboard } from "@/components/ecommerce/ecommerce-dashboard"

interface EcommerceDashboardPageProps {
  params: {
    id: string
  }
}

export default function EcommerceDashboardPage({ params }: EcommerceDashboardPageProps) {
  return <EcommerceDashboard siteId={params.id} />
}
