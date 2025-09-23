import { BookingsManager } from "@/components/excursions/bookings-manager"

interface BookingsPageProps {
  params: {
    id: string
  }
}

export default function BookingsPage({ params }: BookingsPageProps) {
  return <BookingsManager siteId={params.id} />
}
