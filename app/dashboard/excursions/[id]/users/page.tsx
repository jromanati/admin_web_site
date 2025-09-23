"use client"

import { UsersManager } from "@/components/users/users-manager"

interface UsersPageProps {
  params: { id: string }
}

export default function UsersPage({ params }: UsersPageProps) {
  return <UsersManager siteId={params.id} siteType="excursions" />
}
