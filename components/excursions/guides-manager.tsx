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
import { ArrowLeft, Plus, Edit, Trash2, Users, Search, Phone, Mail } from "lucide-react"

interface Guide {
  id: string
  name: string
  email: string
  phone: string
  specialties: string[]
  languages: string[]
  experience: number // years
  rating: number
  totalTours: number
  status: "active" | "inactive" | "vacation"
  bio: string
  certifications: string[]
}

const mockGuides: Guide[] = [
  {
    id: "1",
    name: "Carlos Mendoza",
    email: "carlos@toursaventura.com",
    phone: "+1234567890",
    specialties: ["Historia", "Arquitectura", "Cultura Local"],
    languages: ["Español", "Inglés", "Francés"],
    experience: 8,
    rating: 4.9,
    totalTours: 245,
    status: "active",
    bio: "Guía especializado en historia y cultura local con más de 8 años de experiencia",
    certifications: ["Guía Oficial de Turismo", "Primeros Auxilios"],
  },
  {
    id: "2",
    name: "Ana López",
    email: "ana@toursaventura.com",
    phone: "+1234567891",
    specialties: ["Aventura", "Montañismo", "Naturaleza"],
    languages: ["Español", "Inglés"],
    experience: 6,
    rating: 4.8,
    totalTours: 189,
    status: "active",
    bio: "Experta en tours de aventura y actividades al aire libre",
    certifications: ["Guía de Montaña", "Rescate en Montaña", "Primeros Auxilios"],
  },
  {
    id: "3",
    name: "Pedro González",
    email: "pedro@toursaventura.com",
    phone: "+1234567892",
    specialties: ["Arte", "Museos", "Patrimonio"],
    languages: ["Español", "Inglés", "Italiano"],
    experience: 12,
    rating: 4.7,
    totalTours: 356,
    status: "active",
    bio: "Historiador del arte especializado en patrimonio cultural",
    certifications: ["Guía Oficial de Turismo", "Especialista en Arte"],
  },
  {
    id: "4",
    name: "Carmen Torres",
    email: "carmen@toursaventura.com",
    phone: "+1234567893",
    specialties: ["Gastronomía", "Vinos", "Mercados"],
    languages: ["Español", "Inglés", "Portugués"],
    experience: 5,
    rating: 4.6,
    totalTours: 134,
    status: "vacation",
    bio: "Chef y sommelier especializada en tours gastronómicos",
    certifications: ["Sommelier Certificado", "Chef Profesional"],
  },
]

interface GuidesManagerProps {
  siteId: string
}

export function GuidesManager({ siteId }: GuidesManagerProps) {
  const [guides, setGuides] = useState<Guide[]>(mockGuides)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialties: "",
    languages: "",
    experience: "",
    bio: "",
    certifications: "",
  })

  const filteredGuides = guides.filter((guide) => {
    const matchesSearch =
      guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.specialties.some((specialty) => specialty.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === "all" || guide.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleCreateGuide = () => {
    const newGuide: Guide = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialties: formData.specialties
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      languages: formData.languages
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      experience: Number.parseInt(formData.experience),
      rating: 0,
      totalTours: 0,
      status: "active",
      bio: formData.bio,
      certifications: formData.certifications
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }
    setGuides([...guides, newGuide])
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialties: "",
      languages: "",
      experience: "",
      bio: "",
      certifications: "",
    })
    setIsCreateDialogOpen(false)
  }

  const handleEditGuide = (guide: Guide) => {
    setEditingGuide(guide)
    setFormData({
      name: guide.name,
      email: guide.email,
      phone: guide.phone,
      specialties: guide.specialties.join(", "),
      languages: guide.languages.join(", "),
      experience: guide.experience.toString(),
      bio: guide.bio,
      certifications: guide.certifications.join(", "),
    })
  }

  const handleUpdateGuide = () => {
    if (!editingGuide) return

    setGuides(
      guides.map((guide) =>
        guide.id === editingGuide.id
          ? {
              ...guide,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              specialties: formData.specialties
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
              languages: formData.languages
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
              experience: Number.parseInt(formData.experience),
              bio: formData.bio,
              certifications: formData.certifications
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            }
          : guide,
      ),
    )
    setEditingGuide(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialties: "",
      languages: "",
      experience: "",
      bio: "",
      certifications: "",
    })
  }

  const handleDeleteGuide = (guideId: string) => {
    setGuides(guides.filter((guide) => guide.id !== guideId))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-600">
            Activo
          </Badge>
        )
      case "inactive":
        return <Badge variant="secondary">Inactivo</Badge>
      case "vacation":
        return <Badge variant="outline">Vacaciones</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const activeGuides = guides.filter((guide) => guide.status === "active").length
  const totalTours = guides.reduce((sum, guide) => sum + guide.totalTours, 0)
  const averageRating = guides.reduce((sum, guide) => sum + guide.rating, 0) / guides.length

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
                <h1 className="text-xl font-semibold text-foreground">Gestión de Guías</h1>
                <p className="text-sm text-muted-foreground">Administra tu equipo de guías turísticos</p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Guía
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Guía</DialogTitle>
                  <DialogDescription>Registra un nuevo guía turístico en tu equipo</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Carlos Mendoza"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="carlos@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Años de experiencia</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="5"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="specialties">Especialidades (separadas por comas)</Label>
                    <Input
                      id="specialties"
                      value={formData.specialties}
                      onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                      placeholder="Historia, Arquitectura, Cultura Local"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="languages">Idiomas (separados por comas)</Label>
                    <Input
                      id="languages"
                      value={formData.languages}
                      onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                      placeholder="Español, Inglés, Francés"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Describe la experiencia y especialidades del guía..."
                      rows={3}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="certifications">Certificaciones (separadas por comas)</Label>
                    <Input
                      id="certifications"
                      value={formData.certifications}
                      onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                      placeholder="Guía Oficial de Turismo, Primeros Auxilios"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateGuide}>Agregar Guía</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guías Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGuides}</div>
              <p className="text-xs text-muted-foreground">De {guides.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tours Realizados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTours}</div>
              <p className="text-xs text-muted-foreground">Por todo el equipo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">★ Calificación general</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar guías..."
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
            <option value="vacation">En vacaciones</option>
          </select>
        </div>

        {/* Guides Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => (
            <Card key={guide.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{guide.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{guide.experience} años de experiencia</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditGuide(guide)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteGuide(guide.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">{guide.bio}</CardDescription>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span className="text-xs">{guide.email}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Teléfono:</span>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span className="text-xs">{guide.phone}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-600">★</span>
                      <span>{guide.rating}</span>
                      <span className="text-xs text-muted-foreground">({guide.totalTours})</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    {getStatusBadge(guide.status)}
                  </div>
                  <div className="pt-2">
                    <span className="text-sm text-muted-foreground">Especialidades:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {guide.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {guide.specialties.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{guide.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-sm text-muted-foreground">Idiomas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {guide.languages.map((language, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {language}
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
        <Dialog open={!!editingGuide} onOpenChange={() => setEditingGuide(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Guía</DialogTitle>
              <DialogDescription>Modifica los datos del guía</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nombre completo</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-experience">Años de experiencia</Label>
                <Input
                  id="edit-experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-specialties">Especialidades</Label>
                <Input
                  id="edit-specialties"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-languages">Idiomas</Label>
                <Input
                  id="edit-languages"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-bio">Biografía</Label>
                <Textarea
                  id="edit-bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-certifications">Certificaciones</Label>
                <Input
                  id="edit-certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                />
              </div>
              <div className="col-span-2 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingGuide(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateGuide}>Guardar Cambios</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
