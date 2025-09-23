"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Eye, Search, Key, Calendar, User } from "lucide-react"

interface Rental {
  id: string
  propertyAddress: string
  propertyType: string
  tenantName: string
  tenantEmail: string
  monthlyRent: number
  deposit: number
  startDate: string
  endDate: string
  status: "active" | "expired" | "terminated" | "pending"
  notes: string
}

const mockRentals: Rental[] = [
  {
    id: "RENT-001",
    propertyAddress: "Centro Comercial 456, Centro",
    propertyType: "Local",
    tenantName: "Comercial ABC S.A.",
    tenantEmail: "contacto@abc.com",
    monthlyRent: 2500,
    deposit: 5000,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    notes: "Contrato anual renovable",
  },
  {
    id: "RENT-002",
    propertyAddress: "Plaza Central 321, Centro",
    propertyType: "Oficina",
    tenantName: "Estudio Legal Pérez",
    tenantEmail: "info@estudioperez.com",
    monthlyRent: 1800,
    deposit: 3600,
    startDate: "2023-06-01",
    endDate: "2024-05-31",
    status: "active",
    notes: "Cliente de larga data",
  },
  {
    id: "RENT-003",
    propertyAddress: "Residencial Sur 654, Zona Sur",
    propertyType: "Apartamento",
    tenantName: "Ana Martínez",
    tenantEmail: "ana.martinez@email.com",
    monthlyRent: 1200,
    deposit: 2400,
    startDate: "2023-03-01",
    endDate: "2024-02-29",
    status: "expired",
    notes: "Contrato vencido, pendiente renovación",
  },
  {
    id: "RENT-004",
    propertyAddress: "Avenida Norte 987, Zona Norte",
    propertyType: "Casa",
    tenantName: "Familia González",
    tenantEmail: "gonzalez.familia@email.com",
    monthlyRent: 1500,
    deposit: 3000,
    startDate: "2024-02-01",
    endDate: "2025-01-31",
    status: "pending",
    notes: "Pendiente de firma de contrato",
  },
]

interface RentalsManagerProps {
  siteId: string
}

export function RentalsManager({ siteId }: RentalsManagerProps) {
  const [rentals, setRentals] = useState<Rental[]>(mockRentals)
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredRentals = rentals.filter((rental) => {
    const matchesSearch =
      rental.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || rental.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleStatusChange = (rentalId: string, newStatus: string) => {
    setRentals(
      rentals.map((rental) => (rental.id === rentalId ? { ...rental, status: newStatus as Rental["status"] } : rental)),
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-600">
            Activo
          </Badge>
        )
      case "expired":
        return <Badge variant="destructive">Vencido</Badge>
      case "terminated":
        return <Badge variant="secondary">Terminado</Badge>
      case "pending":
        return <Badge variant="outline">Pendiente</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const activeRentals = rentals.filter((rental) => rental.status === "active").length
  const totalMonthlyRevenue = rentals
    .filter((rental) => rental.status === "active")
    .reduce((sum, rental) => sum + rental.monthlyRent, 0)
  const expiredRentals = rentals.filter((rental) => rental.status === "expired").length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => (window.location.href = `/dashboard/properties/${siteId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Gestión de Arriendos</h1>
                <p className="text-sm text-muted-foreground">Administra todos los contratos de arriendo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arriendos Activos</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRentals}</div>
              <p className="text-xs text-muted-foreground">Contratos vigentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalMonthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">De arriendos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Vencidos</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiredRentals}</div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar arriendos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-border rounded-md bg-background"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="expired">Vencidos</option>
            <option value="terminated">Terminados</option>
            <option value="pending">Pendientes</option>
          </select>
        </div>

        {/* Rentals List */}
        <div className="space-y-4">
          {filteredRentals.map((rental) => (
            <Card key={rental.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                      <Key className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{rental.id}</CardTitle>
                      <CardDescription>{rental.propertyAddress}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">${rental.monthlyRent.toLocaleString()}/mes</p>
                      <p className="text-sm text-muted-foreground">Depósito: ${rental.deposit.toLocaleString()}</p>
                    </div>
                    {getStatusBadge(rental.status)}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRental(rental)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalles de Arriendo {rental.id}</DialogTitle>
                          <DialogDescription>Información completa del contrato</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Property Info */}
                          <div>
                            <h3 className="font-semibold mb-2">Información de la Propiedad</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Dirección:</span>
                                <p>{rental.propertyAddress}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tipo:</span>
                                <p>{rental.propertyType}</p>
                              </div>
                            </div>
                          </div>

                          {/* Tenant Info */}
                          <div>
                            <h3 className="font-semibold mb-2">Información del Arrendatario</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Nombre:</span>
                                <p>{rental.tenantName}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Email:</span>
                                <p>{rental.tenantEmail}</p>
                              </div>
                            </div>
                          </div>

                          {/* Contract Info */}
                          <div>
                            <h3 className="font-semibold mb-2">Información del Contrato</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Renta Mensual:</span>
                                <p className="font-semibold">${rental.monthlyRent.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Depósito:</span>
                                <p className="font-semibold">${rental.deposit.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fecha de Inicio:</span>
                                <p>{rental.startDate}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fecha de Fin:</span>
                                <p>{rental.endDate}</p>
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <h3 className="font-semibold mb-2">Notas</h3>
                            <p className="text-sm text-muted-foreground">{rental.notes}</p>
                          </div>

                          {/* Status Management */}
                          <div>
                            <h3 className="font-semibold mb-2">Estado del Contrato</h3>
                            <div className="flex items-center space-x-2">
                              <select
                                value={rental.status}
                                onChange={(e) => handleStatusChange(rental.id, e.target.value)}
                                className="p-2 border border-border rounded-md bg-background"
                              >
                                <option value="active">Activo</option>
                                <option value="expired">Vencido</option>
                                <option value="terminated">Terminado</option>
                                <option value="pending">Pendiente</option>
                              </select>
                              {getStatusBadge(rental.status)}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{rental.tenantName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {rental.startDate} - {rental.endDate}
                      </span>
                    </div>
                  </div>
                  <span className="text-muted-foreground">{rental.propertyType}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
