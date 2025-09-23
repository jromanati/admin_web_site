import { BrandForm } from "@/components/ecommerce/brand-form"

interface EditBrandPageProps {
  params: {
    id: string
    brandId: string
  }
}

export default function EditBrandPage({ params }: EditBrandPageProps) {
  return <BrandForm siteId={params.id} brandId={params.brandId} />
}
