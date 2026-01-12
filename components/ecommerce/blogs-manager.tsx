"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Search, AlertTriangle, ImageIcon, LayoutGrid, List } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import useSWR, { mutate } from "swr"
import { AuthService } from "@/services/auth.service"
import { useRouter } from "next/navigation"
import type { Blog, BlogFormInput, BlogType } from "@/types/ecomerces/blogs"
import { BlogsService } from "@/services/ecomerce/blogs/blogs.service"

interface BlogsManagerProps {
  siteId: string
}

const BLOG_TYPE_LABELS: Record<BlogType, string> = {
  evento: "Evento",
  bandas: "Bandas",
  entrevista: "Entrevista",
  resenas: "Reseñas",
  historia: "Historia",
  tutoriales: "Tutoriales",
}

export function BlogsManager({ siteId }: BlogsManagerProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null)

  const [formData, setFormData] = useState<BlogFormInput>({
    titulo: "",
    descripcion: "",
    autor: "",
    fecha: new Date().toISOString(),
    tipo_blog: "evento",
    main_image: null,
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string | null>(null)

  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [thirdBackgroundColor, setThirdBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const [placeholderStyle, setPlaceholderStyle] = useState("")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const rawUserData = localStorage.getItem("user_data")
    const rawClientData = localStorage.getItem("tenant_data")
    const tenant_data = rawUserData ? JSON.parse(rawClientData || "null") : null
    if (tenant_data?.styles_site) {
      setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
      setThirdBackgroundColor(tenant_data.styles_site.background_color)
      setPrincipalText(tenant_data.styles_site.principal_text)
      setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
      setSecondHoverBackground(tenant_data.styles_site.second_hover_background)
      setPrincipalHoverText(tenant_data.styles_site.principal_hover_text)
      setPlaceholderStyle(tenant_data.styles_site.placeholder)
    }
  }, [])

  useEffect(() => {
    if (selectedDate) {
      const iso = selectedDate.toISOString()
      setFormData(prev => ({ ...prev, fecha: iso }))
    }
  }, [selectedDate])

  const fetchedBlogs = async () => {
    const isValid = AuthService.isTokenValid()
    if (!isValid) {
      const isRefreshValid = await AuthService.isRefreshTokenValid()
      if (!isRefreshValid) window.location.href = "/"
    }
    const response = await BlogsService.getBlogs()
    setIsLoading(false)
    if (!response.success || !response.data) return []
    return response.data
  }

  const { data: blogs = [] } = useSWR<Blog[]>("blogs", fetchedBlogs)

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (blog.autor || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || blog.tipo_blog === filterType
    return matchesSearch && matchesType
  })

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + itemsPerPage)

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFormData(prev => ({ ...prev, main_image: f }))
    const url = URL.createObjectURL(f)
    setMainImagePreviewUrl(url)
  }

  const removeMainImage = () => {
    setFormData(prev => ({ ...prev, main_image: null }))
    setMainImagePreviewUrl(null)
  }

  const openCreateDialog = () => {
    setSelectedBlog(null)
    setFormData({
      titulo: "",
      descripcion: "",
      autor: "",
      fecha: new Date().toISOString(),
      tipo_blog: "evento",
      main_image: null,
    })
    setSelectedDate(new Date())
    setMainImagePreviewUrl(null)
    setIsEditDialogOpen(true)
  }

  const openEditDialog = (blog: Blog) => {
    setSelectedBlog(blog)
    setFormData({
      id: blog.id,
      titulo: blog.titulo,
      descripcion: blog.descripcion || "",
      autor: blog.autor,
      fecha: blog.fecha,
      tipo_blog: blog.tipo_blog,
      main_image: null,
    })
    setSelectedDate(blog.fecha ? new Date(blog.fecha) : new Date())
    setMainImagePreviewUrl(blog.image_url || null)
    setIsEditDialogOpen(true)
  }

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return
    setIsSaving(true)
    try {
      let response
      if (formData.id) {
        response = await BlogsService.updateBlog(formData.id, formData)
      } else {
        response = await BlogsService.createBlog(formData)
      }
      if (response.success && response.data) {
        await mutate("blogs")
        setIsEditDialogOpen(false)
      } else {
        console.error("Error guardando blog", response.error)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteBlog = (blog: Blog) => {
    setBlogToDelete(blog)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteBlog = async () => {
    if (!blogToDelete) return
    const response = await BlogsService.deleteBlog(blogToDelete.id)
    if (response.success) {
      await mutate("blogs")
      setIsDeleteDialogOpen(false)
      setBlogToDelete(null)
    }
  }

  const formatDateForUI = (value: string) => {
    try {
      return format(new Date(value), "PPP", { locale: es })
    } catch {
      return value
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {isLoading ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F2CFCE]/30 border-t-[#F2CFCE]" />
            <p className="text-sm text-muted-foreground">Cargando…</p>
          </div>
        </div>
      ) : (
        <div>
          <div className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:h-16 sm:items-center sm:justify-between py-3 sm:py-0">
                <div>
                  <h1 className="text-xl font-semibold">Gestión de Blogs</h1>
                  <p className="text-sm">Administra los artículos y noticias de tu sitio</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <div className="flex gap-2 flex-1">
                    <div className="relative w-60">
                      <Input
                        placeholder="Buscar por título o autor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={placeholderStyle}
                      />
                      <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button onClick={openCreateDialog} className={principalHoverBackground}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Blog
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 my-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto md:items-center">
              <select
                className="p-2 border border-border rounded-md bg-background"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos los tipos de árticulos</option>
                {Object.entries(BLOG_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 justify-end">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {filteredBlogs.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay blogs aún. Crea el primero para comenzar.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {viewMode === "grid" ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {paginatedBlogs.map((blog) => (
                      <Card key={blog.id} className="overflow-hidden h-full flex flex-col">
                        <CardContent className="p-4 flex gap-4 flex-1">
                          {blog.image_url && (
                            <div className="w-24 h-20 flex items-center justify-center bg-muted rounded">
                              <img
                                src={blog.image_url}
                                alt={blog.titulo}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          )}
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold line-clamp-1">{blog.titulo}</h3>
                              <Badge variant="outline">{BLOG_TYPE_LABELS[blog.tipo_blog]}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              Por {blog.autor} · {formatDateForUI(blog.fecha)}
                            </p>
                            {blog.descripcion && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {blog.descripcion}
                              </p>
                            )}
                            <div className="flex justify-end gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/dashboard/ecommerce/blogs/sections/${blog.id}`)}
                              >
                                Secciones
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(blog)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteBlog(blog)}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                          <tr>
                            <th className="text-left px-4 py-2">Título</th>
                            <th className="text-left px-4 py-2">Tipo</th>
                            <th className="text-left px-4 py-2">Autor</th>
                            <th className="text-left px-4 py-2">Fecha</th>
                            <th className="text-right px-4 py-2">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedBlogs.map((blog) => (
                            <tr key={blog.id} className="border-t border-border">
                              <td className="px-4 py-2 align-top max-w-[240px]">
                                <div className="font-medium truncate">{blog.titulo}</div>
                                {blog.descripcion && (
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {blog.descripcion}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-2 align-top">
                                <Badge variant="outline">{BLOG_TYPE_LABELS[blog.tipo_blog]}</Badge>
                              </td>
                              <td className="px-4 py-2 align-top text-xs">
                                {blog.autor}
                              </td>
                              <td className="px-4 py-2 align-top text-xs whitespace-nowrap">
                                {formatDateForUI(blog.fecha)}
                              </td>
                              <td className="px-4 py-2 align-top">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/dashboard/ecommerce/blogs/sections/${blog.id}`)}
                                  >
                                    Secciones
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => openEditDialog(blog)}>
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteBlog(blog)}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Eliminar
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                )}

                {totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        aria-disabled={currentPage === 1}
                      />
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink
                            isActive={currentPage === index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        aria-disabled={currentPage === totalPages}
                      />
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Editar Blog" : "Crear Blog"}</DialogTitle>
            <DialogDescription>
              Completa la información del blog. La imagen principal es opcional.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveBlog} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 w-100">
              <div className="w-100">
                <label className="text-sm font-medium" htmlFor="titulo">Título</label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  required
                />
              </div>              
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="autor">Autor</label>
                <Input
                  id="autor"
                  value={formData.autor}
                  onChange={(e) => setFormData(prev => ({ ...prev, autor: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="tipo_blog">Tipo de blog</label>
                <select
                  id="tipo_blog"
                  className="border rounded-md px-3 py-2 text-sm w-full bg-background"
                  value={formData.tipo_blog}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo_blog: e.target.value as BlogType }))}
                >
                  {Object.entries(BLOG_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="descripcion">Descripción</label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Imagen principal</label>
              <input
                id="main-image"
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                className="hidden"
              />
              {!mainImagePreviewUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("main-image")?.click()}
                  className="w-full h-32 border-dashed"
                >
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Haz clic para subir la imagen principal</p>
                  </div>
                </Button>
              ) : (
                <div className="relative w-full h-32">
                  <img
                    src={mainImagePreviewUrl}
                    alt="Imagen principal"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={removeMainImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el blog "{blogToDelete?.titulo}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteBlog}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
