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
import { ArrowLeft, Eye, Search, Calendar, Users, MapPin } from "lucide-react"

interface Booking {
  id: string
  tourName: string
  tourDestination: string
  customerName: string
  customerEmail: string
  customerPhone: string
  participants: number
  totalAmount: number
  bookingDate: string
  tourDate: string
  tourTime: string
  status: "confirmed" | "pending" | "cancelled" | "completed"
  specialRequests: string
  guideName: string
}

const mockBookings: Booking[] = [
  {
    id: "BOOK-001",
    tourName: "City Walking Tour",
    tourDestination: "Centro Histórico",
    customerName: "María García",
    customerEmail: "maria@example.com",
    customerPhone: "+1234567890",
    participants: 4,
    totalAmount: 100,
    bookingDate: "2024-01-15",
    tourDate: "2024-01-20",
    tourTime: "09:00",
    status: "confirmed",
    specialRequests: "Grupo familiar con niños",
    guideName: "Carlos Mendoza",
  },
  {
    id: "BOOK-002",
    tourName: "Mountain Adventure",
    tourDestination: "Sierra Norte",
    customerName: "Roberto Silva",
    customerEmail: "roberto@example.com",
    customerPhone: "+1234567891",
    participants: 2,
    totalAmount: 180,
    bookingDate: "2024-01-16",
    tourDate: "2024-01-22",
    tourTime: "07:00",
    status: "confirmed",
    specialRequests: "Experiencia en montañismo",
    guideName: "Ana López",
  },
  {
    id: "BOOK-003",
    tourName: "Cultural Heritage Tour",
    tourDestination: "Museos y Monumentos",
    customerName: "Laura Martínez",
    customerEmail: "laura@example.com",
    customerPhone: "+1234567892",
    participants: 6,
    totalAmount: 240,
    bookingDate: "2024-01-17",
    tourDate: "2024-01-25",
    tourTime: "10:00",
    status: "pending",
    specialRequests: "Interés en historia local",
    guideName: "Pedro González",
  },
  {
    id: "BOOK-004",
    tourName: "Food & Wine Experience",
    tourDestination: "Mercado Central",
    customerName: "Diego Ruiz",
    customerEmail: "diego@example.com",
    customerPhone: "+1234567893",
    participants: 3,
    totalAmount: 150,
    bookingDate: "2024-01-18",
    tourDate: "2024-01-28",
    tourTime: "11:00",
    status: "confirmed",
    specialRequests: "Restricciones alimentarias",
    guideName: "Carmen Torres",
  },
]

interface BookingsManagerProps {
  siteId: string
}

export function BookingsManager({ siteId }: BookingsManagerProps) {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tourName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || booking.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: newStatus as Booking["status"] } : booking,
      ),
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-600">
            Confirmada
          </Badge>
        )
      case "pending":
        return <Badge variant="outline">Pendiente</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>
      case "completed":
        return <Badge variant="secondary">Completada</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const totalBookings = bookings.length
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed").length
  const totalRevenue = bookings
    .filter((booking) => booking.status === "confirmed" || booking.status === "completed")
    .reduce((sum, booking) => sum + booking.totalAmount, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => (window.location.href = `/dashboard/excursions/${siteId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Gestión de Reservas</h1>
                <p className="text-sm text-muted-foreground">Administra todas las reservas de tours</p>
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
              <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedBookings}</div>
              <p className="text-xs text-muted-foreground">Listas para realizar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">De reservas confirmadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar reservas..."
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
            <option value="confirmed">Confirmadas</option>
            <option value="pending">Pendientes</option>
            <option value="cancelled">Canceladas</option>
            <option value="completed">Completadas</option>
          </select>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{booking.id}</CardTitle>
                      <CardDescription>{booking.tourName}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">${booking.totalAmount}</p>
                      <p className="text-sm text-muted-foreground">{booking.participants} personas</p>
                    </div>
                    {getStatusBadge(booking.status)}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalles de Reserva {booking.id}</DialogTitle>
                          <DialogDescription>Información completa de la reserva</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Tour Info */}
                          <div>
                            <h3 className="font-semibold mb-2">Información del Tour</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Tour:</span>
                                <p>{booking.tourName}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Destino:</span>
                                <p>{booking.tourDestination}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fecha:</span>
                                <p>{booking.tourDate}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Hora:</span>
                                <p>{booking.tourTime}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Guía:</span>
                                <p>{booking.guideName}</p>
                              </div>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div>
                            <h3 className="font-semibold mb-2">Información del Cliente</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Nombre:</span>
                                <p>{booking.customerName}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Email:</span>
                                <p>{booking.customerEmail}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Teléfono:</span>
                                <p>{booking.customerPhone}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Participantes:</span>
                                <p>{booking.participants} personas</p>
                              </div>
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div>
                            <h3 className="font-semibold mb-2">Detalles de la Reserva</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Fecha de reserva:</span>
                                <p>{booking.bookingDate}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Monto total:</span>
                                <p className="font-semibold">${booking.totalAmount}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Solicitudes especiales:</span>
                                <p>{booking.specialRequests}</p>
                              </div>
                            </div>
                          </div>

                          {/* Status Management */}
                          <div>
                            <h3 className="font-semibold mb-2">Estado de la Reserva</h3>
                            <div className="flex items-center space-x-2">
                              <select
                                value={booking.status}
                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                className="p-2 border border-border rounded-md bg-background"
                              >
                                <option value="confirmed">Confirmada</option>
                                <option value="pending">Pendiente</option>
                                <option value="cancelled">Cancelada</option>
                                <option value="completed">Completada</option>
                              </select>
                              {getStatusBadge(booking.status)}
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
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{booking.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {booking.tourDate} - {booking.tourTime}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{booking.tourDestination}</span>
                    </div>
                  </div>
                  <span className="text-muted-foreground">Guía: {booking.guideName}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
