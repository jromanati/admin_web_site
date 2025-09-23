import { RentalsManager } from "@/components/properties/rentals-manager"

interface RentalsPageProps {
  params: {
    id: string
  }
}

export default function RentalsPage({ params }: RentalsPageProps) {
  return <RentalsManager siteId={params.id} />
}
