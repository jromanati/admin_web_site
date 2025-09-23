import { BrandsList } from "@/components/ecommerce/brands-list"

interface BrandsPageProps {
  params: {
    id: string
  }
}

export default function BrandsPage({ params }: BrandsPageProps) {
  return <BrandsList siteId={params.id} />
}
