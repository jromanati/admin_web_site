import { redirect } from "next/navigation"
import { EventHubDashboard } from "@/components/eventhub/eventhub-dashboard"

interface EventHubDashboardPageProps {
  params: {
    id: string
  }
}

export default function EventHubDashboardPage({ params }: EventHubDashboardPageProps) {
  return <EventHubDashboard siteId={params.id} />
}
