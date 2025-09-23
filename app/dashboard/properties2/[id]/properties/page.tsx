import { PropertiesManager } from "@/components/properties/properties-manager"

interface PropertiesPageProps {
  params: {
    id: string
  }
}

export default function PropertiesPage({ params }: PropertiesPageProps) {
  return <PropertiesManager siteId={params.id} />
}
