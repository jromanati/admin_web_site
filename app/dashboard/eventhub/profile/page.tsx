import { redirect } from "next/navigation"
import { EventHubDashboard } from "@/components/eventhub/eventhub-dashboard"

interface EventHubProfilePageProps {
  params: {
    id: string
  }
}

export default function EventHubProfilePage({ params }: EventHubProfilePageProps) {
  return <EventHubDashboard siteId={params.id} />
}
