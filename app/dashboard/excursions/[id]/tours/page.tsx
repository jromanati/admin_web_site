import { ToursManager } from "@/components/excursions/tours-manager"

interface ToursPageProps {
  params: {
    id: string
  }
}

export default function ToursPage({ params }: ToursPageProps) {
  return <ToursManager siteId={params.id} />
}
