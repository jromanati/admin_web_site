import { ExcursionsDashboard } from "@/components/excursions/excursions-dashboard"

interface ExcursionsDashboardPageProps {
  params: {
    id: string
  }
}

export default function ExcursionsDashboardPage({ params }: ExcursionsDashboardPageProps) {
  return <ExcursionsDashboard siteId={params.id} />
}
