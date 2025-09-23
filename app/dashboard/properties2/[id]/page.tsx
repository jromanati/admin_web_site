import { PropertiesDashboard } from "@/components/properties/properties-dashboard"

interface PropertiesDashboardPageProps {
  params: {
    id: string
  }
}

export default function PropertiesDashboardPage({ params }: PropertiesDashboardPageProps) {
  return <PropertiesDashboard siteId={params.id} />
}
