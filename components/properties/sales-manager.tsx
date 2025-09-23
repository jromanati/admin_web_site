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
import { ArrowLeft, Eye, Search, DollarSign, Calendar, User } from "lucide-react"

interface Sale {
  id: string
  propertyAddress: string
  propertyType: string
  buyerName: string
  buyerEmail: string
  salePrice: number
  commissionRate: number
  commission: number
  saleDate: string
  status: "pending" | "completed" | "cancelled"
  notes: string
}

const mockSales: Sale[] = [
  {
    id: "SALE-001",
    propertyAddress: "Av. Principal 123, Zona Norte",
    propertyType: "Casa",
    buyerName: "Carlos Mendoza",
    buyerEmail: "carlos@example.com",
    salePrice: 350000,
    commissionRate: 3,
    commission: 10500,
    saleDate: "2024-01-15",
    status: "completed",
    notes: "Venta exitosa, cliente muy satisfecho",
  },
  {
    id: "SALE-002",
    propertyAddress: "Residencial Norte 789, Zona Norte",
    propertyType: "Apartamento",
    buyerName: "María González",
    buyerEmail: "maria@example.com",
    salePrice: 180000,
    commissionRate: 3.5,
    commission: 6300,
    saleDate: "2024-01-10",
    status: "completed",
    notes: "Primera vivienda del cliente",
  },
  {
    id: "SALE-003",
    propertyAddress: "Villa Premium 456, Zona Sur",
    propertyType: "Casa",
    buyerName: "Roberto Silva",
    buyerEmail: "roberto@example.com",
    salePrice: 450000,
    commissionRate: 2.5,
    commission: 11250,
    saleDate: "2024-01-20",
    status: "pending",
    notes: "Pendiente de documentación final",
  },
]

interface SalesManagerProps {
  siteId: string
}

export function SalesManager({ siteId }: SalesManagerProps) {
  const [sales, setSales] = useState<Sale[]>(mockSales)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || sale.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleStatusChange = (saleId: string, newStatus: string) => {
    setSales(sales.map((sale) => (sale.id === saleId ? { ...sale, status: newStatus as Sale["status"] } : sale)))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendiente</Badge>
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            Completada
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const totalSales = sales.filter((sale) => sale.status === "completed").length
  const totalRevenue = sales
    .filter((sale) => sale.status === "completed")
    .reduce((sum, sale) => sum + sale.salePrice, 0)
  const totalCommissions = sales
    .filter((sale) => sale.status === "completed")
    .reduce((sum, sale) => sum + sale.commission, 0)

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
                <h1 className="text-xl font-semibold text-foreground">Gestión de Ventas</h1>
                <p className="text-sm text-muted-foreground">Administra todas las ventas de propiedades</p>
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
              <CardTitle className="text-sm font-medium">Ventas Completadas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">En ventas completadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCommissions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Comisiones ganadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ventas..."
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
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        {/* Sales List */}
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <Card key={sale.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{sale.id}</CardTitle>
                      <CardDescription>{sale.propertyAddress}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">${sale.salePrice.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Comisión: ${sale.commission.toLocaleString()}</p>
                    </div>
                    {getStatusBadge(sale.status)}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedSale(sale)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalles de Venta {sale.id}</DialogTitle>
                          <DialogDescription>Información completa de la transacción</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Property Info */}
                          <div>
                            <h3 className="font-semibold mb-2">Información de la Propiedad</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Dirección:</span>
                                <p>{sale.propertyAddress}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tipo:</span>
                                <p>{sale.propertyType}</p>
                              </div>
                            </div>
                          </div>

                          {/* Buyer Info */}
                          <div>
                            <h3 className="font-semibold mb-2">Información del Comprador</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Nombre:</span>
                                <p>{sale.buyerName}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Email:</span>
                                <p>{sale.buyerEmail}</p>
                              </div>
                            </div>
                          </div>

                          {/* Financial Info */}
                          <div>
                            <h3 className="font-semibold mb-2">Información Financiera</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Precio de Venta:</span>
                                <p className="font-semibold">${sale.salePrice.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tasa de Comisión:</span>
                                <p>{sale.commissionRate}%</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Comisión:</span>
                                <p className="font-semibold">${sale.commission.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fecha de Venta:</span>
                                <p>{sale.saleDate}</p>
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <h3 className="font-semibold mb-2">Notas</h3>
                            <p className="text-sm text-muted-foreground">{sale.notes}</p>
                          </div>

                          {/* Status Management */}
                          <div>
                            <h3 className="font-semibold mb-2">Estado de la Venta</h3>
                            <div className="flex items-center space-x-2">
                              <select
                                value={sale.status}
                                onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                                className="p-2 border border-border rounded-md bg-background"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="completed">Completada</option>
                                <option value="cancelled">Cancelada</option>
                              </select>
                              {getStatusBadge(sale.status)}
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
                      <span className="text-muted-foreground">{sale.buyerName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{sale.saleDate}</span>
                    </div>
                  </div>
                  <span className="text-muted-foreground">{sale.propertyType}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
