import { PropertiesDashboard } from "@/components/properties/properties-dashboard"

interface EcommerceDashboardPageProps {
  params: {
    id: string
  }
}

export default function PropertiesDashboardPage({ params }: EcommerceDashboardPageProps) {
  return <PropertiesDashboard siteId={params.id} />
}
