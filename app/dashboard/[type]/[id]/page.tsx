import { SiteDashboard } from "@/components/site-dashboard"

interface SiteDashboardPageProps {
  params: {
    type: string
    id: string
  }
}

export default function SiteDashboardPage({ params }: SiteDashboardPageProps) {
  return <SiteDashboard siteType={params.type} siteId={params.id} />
}
