import { SalesManager } from "@/components/properties/sales-manager"

interface SalesPageProps {
  params: {
    id: string
  }
}

export default function SalesPage({ params }: SalesPageProps) {
  return <SalesManager siteId={params.id} />
}
