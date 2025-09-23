"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Edit, Trash2, MapPin, Search, Clock, Users } from "lucide-react"

interface Tour {
  id: string
  name: string
  description: string
  destination: string
  duration: number // in hours
  maxParticipants: number
  price: number
  difficulty: "easy" | "moderate" | "hard"
  status: "active" | "inactive" | "seasonal"
  includes: string[]
  schedule: string[]
  rating: number
  totalBookings: number
}

const mockTours: Tour[] = [
  {
    id: "1",
    name: "City Walking Tour",
    description: "Descubre los secretos de la ciudad con nuestro tour a pie",
    destination: "Centro Histórico",
    duration: 3,
    maxParticipants: 15,
    price: 25,
    difficulty: "easy",
    status: "active",
    includes: ["Guía profesional", "Mapa de la ciudad", "Degustación local"],
    schedule: ["09:00", "14:00", "17:00"],
    rating: 4.8,
    totalBookings: 45,
  },
  {
    id: "2",
    name: "Mountain Adventure",
    description: "Aventura en la montaña con vistas espectaculares",
    destination: "Sierra Norte",
    duration: 8,
    maxParticipants: 8,
    price: 90,
    difficulty: "hard",
    status: "active",
    includes: ["Transporte", "Almuerzo", "Equipo de seguridad", "Guía especializado"],
    schedule: ["07:00"],
    rating: 4.9,
    totalBookings: 32,
  },
  {
    id: "3",
    name: "Cultural Heritage Tour",
    description: "Explora la rica historia y cultura local",
    destination: "Museos y Monumentos",
    duration: 4,
    maxParticipants: 20,
    price: 40,
    difficulty: "easy",
    status: "active",
    includes: ["Entradas a museos", "Guía cultural", "Material informativo"],
    schedule: ["10:00", "15:00"],
    rating: 4.7,
    totalBookings: 28,
  },
  {
    id: "4",
    name: "Food & Wine Experience",
    description: "Degustación de comida y vinos locales",
    destination: "Mercado Central",
    duration: 3,
    maxParticipants: 12,
    price: 50,
    difficulty: "easy",
    status: "seasonal",
    includes: ["Degustaciones", "Guía gastronómico", "Recetas tradicionales"],
    schedule: ["11:00", "16:00"],
    rating: 4.6,
    totalBookings: 25,
  },
]

interface ToursManagerProps {
  siteId: string
}

export function ToursManager({ siteId }: ToursManagerProps) {
  const [tours, setTours] = useState<Tour[]>(mockTours)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    destination: "",
    duration: "",
    maxParticipants: "",
    price: "",
    difficulty: "easy",
    includes: "",
    schedule: "",
  })

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.destination.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || tour.status === filterStatus
    const matchesDifficulty = filterDifficulty === "all" || tour.difficulty === filterDifficulty
    return matchesSearch && matchesStatus && matchesDifficulty
  })

  const handleCreateTour = () => {
    const newTour: Tour = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      destination: formData.destination,
      duration: Number.parseInt(formData.duration),
      maxParticipants: Number.parseInt(formData.maxParticipants),
      price: Number.parseFloat(formData.price),
      difficulty: formData.difficulty as Tour["difficulty"],
      status: "active",
      includes: formData.includes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      schedule: formData.schedule
        .split(",")
        .map((time) => time.trim())
        .filter(Boolean),
      rating: 0,
      totalBookings: 0,
    }
    setTours([...tours, newTour])
    setFormData({
      name: "",
      description: "",
      destination: "",
      duration: "",
      maxParticipants: "",
      price: "",
      difficulty: "easy",
      includes: "",
      schedule: "",
    })
    setIsCreateDialogOpen(false)
  }

  const handleEditTour = (tour: Tour) => {
    setEditingTour(tour)
    setFormData({
      name: tour.name,
      description: tour.description,
      destination: tour.destination,
      duration: tour.duration.toString(),
      maxParticipants: tour.maxParticipants.toString(),
      price: tour.price.toString(),
      difficulty: tour.difficulty,
      includes: tour.includes.join(", "),
      schedule: tour.schedule.join(", "),
    })
  }

  const handleUpdateTour = () => {
    if (!editingTour) return

    setTours(
      tours.map((tour) =>
        tour.id === editingTour.id
          ? {
              ...tour,
              name: formData.name,
              description: formData.description,
              destination: formData.destination,
              duration: Number.parseInt(formData.duration),
              maxParticipants: Number.parseInt(formData.maxParticipants),
              price: Number.parseFloat(formData.price),
              difficulty: formData.difficulty as Tour["difficulty"],
              includes: formData.includes
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
              schedule: formData.schedule
                .split(",")
                .map((time) => time.trim())
                .filter(Boolean),
            }
          : tour,
      ),
    )
    setEditingTour(null)
    setFormData({
      name: "",
      description: "",
      destination: "",
      duration: "",
      maxParticipants: "",
      price: "",
      difficulty: "easy",
      includes: "",
      schedule: "",
    })
  }

  const handleDeleteTour = (tourId: string) => {
    setTours(tours.filter((tour) => tour.id !== tourId))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Activo</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactivo</Badge>
      case "seasonal":
        return <Badge variant="outline">Estacional</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Fácil
          </Badge>
        )
      case "moderate":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Moderado
          </Badge>
        )
      case "hard":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Difícil
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

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
                <h1 className="text-xl font-semibold text-foreground">Gestión de Tours</h1>
                <p className="text-sm text-muted-foreground">Administra tu catálogo de excursiones</p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Tour
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Tour</DialogTitle>
                  <DialogDescription>Agrega una nueva excursión a tu catálogo</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del tour</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: City Walking Tour"
                    />
                  </div>
                  <div>
                    <Label htmlFor="destination">Destino</Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="Ej: Centro Histórico"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe la excursión..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duración (horas)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants">Máx. participantes</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                      placeholder="15"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio por persona</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="25.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Dificultad</Label>
                    <select
                      id="difficulty"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="easy">Fácil</option>
                      <option value="moderate">Moderado</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="includes">Incluye (separado por comas)</Label>
                    <Input
                      id="includes"
                      value={formData.includes}
                      onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                      placeholder="Guía profesional, Mapa, Degustación"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="schedule">Horarios (separados por comas)</Label>
                    <Input
                      id="schedule"
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      placeholder="09:00, 14:00, 17:00"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTour}>Crear Tour</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tours..."
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
            <option value="inactive">Inactivos</option>
            <option value="seasonal">Estacionales</option>
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="p-2 border border-border rounded-md bg-background"
          >
            <option value="all">Todas las dificultades</option>
            <option value="easy">Fácil</option>
            <option value="moderate">Moderado</option>
            <option value="hard">Difícil</option>
          </select>
        </div>

        {/* Tours Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTours.map((tour) => (
            <Card key={tour.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{tour.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{tour.destination}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditTour(tour)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTour(tour.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">{tour.description}</CardDescription>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Precio:</span>
                    <span className="font-semibold">${tour.price}/persona</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Duración:</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{tour.duration}h</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Máx. personas:</span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{tour.maxParticipants}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Dificultad:</span>
                    {getDifficultyBadge(tour.difficulty)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    {getStatusBadge(tour.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-600">★</span>
                      <span>{tour.rating}</span>
                      <span className="text-xs text-muted-foreground">({tour.totalBookings})</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="text-sm text-muted-foreground">Horarios:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tour.schedule.map((time, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingTour} onOpenChange={() => setEditingTour(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Tour</DialogTitle>
              <DialogDescription>Modifica los datos del tour</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nombre del tour</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-destination">Destino</Label>
                <Input
                  id="edit-destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duración (horas)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-maxParticipants">Máx. participantes</Label>
                <Input
                  id="edit-maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Precio por persona</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-difficulty">Dificultad</Label>
                <select
                  id="edit-difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="easy">Fácil</option>
                  <option value="moderate">Moderado</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-includes">Incluye</Label>
                <Input
                  id="edit-includes"
                  value={formData.includes}
                  onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-schedule">Horarios</Label>
                <Input
                  id="edit-schedule"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                />
              </div>
              <div className="col-span-2 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingTour(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateTour}>Guardar Cambios</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
