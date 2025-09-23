import { BrandForm } from "@/components/ecommerce/brand-form"

interface CreateBrandPageProps {
  params: {
    id: string
  }
}

export default function CreateBrandPage({ params }: CreateBrandPageProps) {
  return <BrandForm siteId={params.id} />
}
