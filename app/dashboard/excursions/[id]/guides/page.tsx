import { GuidesManager } from "@/components/excursions/guides-manager"

interface GuidesPageProps {
  params: {
    id: string
  }
}

export default function GuidesPage({ params }: GuidesPageProps) {
  return <GuidesManager siteId={params.id} />
}
