"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, TrendingUp, ArrowLeft } from "lucide-react"

interface ExcursionsDashboardProps {
  siteId: string
}

const mockStats = {
  totalTours: 23,
  activeTours: 18,
  totalBookings: 156,
  totalGuides: 8,
  monthlyRevenue: 45600,
  monthlyGrowth: 15.2,
  upcomingTours: 12,
}

const recentBookings = [
  {
    id: "BOOK-001",
    tourName: "City Walking Tour",
    customerName: "María García",
    date: "2024-01-20",
    participants: 4,
    amount: 120,
  },
  {
    id: "BOOK-002",
    tourName: "Mountain Adventure",
    customerName: "Carlos López",
    date: "2024-01-22",
    participants: 2,
    amount: 180,
  },
  {
    id: "BOOK-003",
    tourName: "Cultural Heritage Tour",
    customerName: "Ana Martínez",
    date: "2024-01-25",
    participants: 6,
    amount: 240,
  },
  {
    id: "BOOK-004",
    tourName: "Food & Wine Experience",
    customerName: "Roberto Silva",
    date: "2024-01-28",
    participants: 3,
    amount: 150,
  },
]

const popularTours = [
  { name: "City Walking Tour", bookings: 45, revenue: 2250, rating: 4.8 },
  { name: "Mountain Adventure", bookings: 32, revenue: 2880, rating: 4.9 },
  { name: "Cultural Heritage Tour", bookings: 28, revenue: 2240, rating: 4.7 },
  { name: "Food & Wine Experience", bookings: 25, revenue: 1875, rating: 4.6 },
]

export function ExcursionsDashboard({ siteId }: ExcursionsDashboardProps) {
  const [siteData, setSiteData] = useState<any>(null)

  useEffect(() => {
    // Simulate loading site data
    setSiteData({
      name: "Tours Aventura",
      description: "Excursiones y tours turísticos",
    })
  }, [siteId])

  if (!siteData) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => (window.location.href = "/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{siteData.name}</h1>
                  <p className="text-sm text-muted-foreground">Dashboard de Excursiones</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Configurar Tours
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalTours}</div>
              <p className="text-xs text-muted-foreground">{mockStats.activeTours} activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">+23 este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guías</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalGuides}</div>
              <p className="text-xs text-muted-foreground">Guías activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockStats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{mockStats.monthlyGrowth}% este mes</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            onClick={() => (window.location.href = `/dashboard/excursions/${siteId}/tours`)}
          >
            <MapPin className="h-6 w-6" />
            <span>Gestionar Tours</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            onClick={() => (window.location.href = `/dashboard/excursions/${siteId}/bookings`)}
          >
            <Calendar className="h-6 w-6" />
            <span>Ver Reservas</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            onClick={() => (window.location.href = `/dashboard/excursions/${siteId}/guides`)}
          >
            <Users className="h-6 w-6" />
            <span>Gestionar Guías</span>
          </Button>

          <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent">
            <TrendingUp className="h-6 w-6" />
            <span>Reportes</span>
          </Button>
        </div>

        {/* Recent Bookings and Popular Tours */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Reservas Recientes</CardTitle>
              <CardDescription>Últimas reservas realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{booking.id}</p>
                      <p className="text-xs text-muted-foreground">{booking.tourName}</p>
                      <p className="text-xs text-muted-foreground">{booking.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${booking.amount}</p>
                      <p className="text-xs text-muted-foreground">{booking.participants} personas</p>
                      <p className="text-xs text-muted-foreground">{booking.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tours Más Populares</CardTitle>
              <CardDescription>Tours con mayor demanda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularTours.map((tour, index) => (
                  <div key={tour.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tour.name}</p>
                        <p className="text-xs text-muted-foreground">{tour.bookings} reservas</p>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-yellow-600">★</span>
                          <span className="text-xs text-muted-foreground">{tour.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${tour.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
