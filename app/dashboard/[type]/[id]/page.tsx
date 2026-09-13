import { SiteDashboard } from "@/components/site-dashboard"
import { use } from "react"

interface SiteDashboardPageProps {
  params: Promise<{
    type: string
    id: string
  }>
}

export default function SiteDashboardPage({ params }: SiteDashboardPageProps) {
  const resolvedParams = use(params)
  return <SiteDashboard siteType={resolvedParams.type} siteId={resolvedParams.id} />
}
