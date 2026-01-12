"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BlogsService } from "@/services/ecomerce/blogs/blogs.service"
import type { Blog, BlogSection, BlogSectionFormInput } from "@/types/ecomerces/blogs"
import { AuthService } from "@/services/auth.service"
import { Trash2, Edit, Plus, ArrowLeft, ImageIcon } from "lucide-react"

export default function BlogSectionsPage() {
  const { id } = useParams()
  const router = useRouter()
  const blogId = Number(id)

  const [blog, setBlog] = useState<Blog | null>(null)
  const [sections, setSections] = useState<BlogSection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const [placeholderStyle, setPlaceholderStyle] = useState("")

  const [sectionForm, setSectionForm] = useState<BlogSectionFormInput | null>(null)
  const [sectionImagePreview, setSectionImagePreview] = useState<string | null>(null)
  const [isSavingSection, setIsSavingSection] = useState(false)

  useEffect(() => {
    const rawUserData = localStorage.getItem("user_data")
    const rawClientData = localStorage.getItem("tenant_data")
    const tenant_data = rawUserData ? JSON.parse(rawClientData || "null") : null
    if (tenant_data?.styles_site) {
      setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
      setPrincipalText(tenant_data.styles_site.principal_text)
      setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
      setSecondHoverBackground(tenant_data.styles_site.second_hover_background)
      setPrincipalHoverText(tenant_data.styles_site.principal_hover_text)
      setPlaceholderStyle(tenant_data.styles_site.placeholder)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const isValid = AuthService.isTokenValid()
      if (!isValid) {
        const isRefreshValid = await AuthService.isRefreshTokenValid()
        if (!isRefreshValid) {
          window.location.href = "/"
          return
        }
      }

      const blogRes = await BlogsService.getBlog(blogId)
      if (blogRes.success && blogRes.data) {
        setBlog(blogRes.data)
      }
      const secRes = await BlogsService.getSections(blogId)
      if (secRes.success && secRes.data) {
        setSections(secRes.data)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [blogId])

  const handleBack = () => {
    router.push("/dashboard/ecommerce/blogs")
  }

  const handleStartCreateSection = () => {
    setSectionForm({
      blogId,
      titulo: "",
      detalle: "",
      main_image: null,
    })
    setSectionImagePreview(null)
  }

  const handleStartEditSection = (section: BlogSection) => {
    setSectionForm({
      id: section.id,
      blogId: section.blog,
      titulo: section.titulo,
      detalle: section.detalle ?? "",
      main_image: null,
    })
    setSectionImagePreview(section.image_url || null)
  }

  const handleSectionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !sectionForm) return
    setSectionForm(prev => (prev ? { ...prev, main_image: f } : prev))
    setSectionImagePreview(URL.createObjectURL(f))
  }

  const resetSectionForm = () => {
    setSectionForm(null)
    setSectionImagePreview(null)
  }

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sectionForm) return
    setIsSavingSection(true)
    try {
      let res
      if (sectionForm.id) {
        res = await BlogsService.updateSection(sectionForm)
      } else {
        res = await BlogsService.createSection(sectionForm)
      }
      if (res.success && res.data) {
        setSections(prev => {
          const without = prev.filter(s => s.id !== res.data!.id)
          return [...without, res.data!]
        })
        resetSectionForm()
      }
    } finally {
      setIsSavingSection(false)
    }
  }

  const handleDeleteSection = async (section: BlogSection) => {
    const res = await BlogsService.deleteSection(section.id)
    if (res.success) {
      setSections(prev => prev.filter(s => s.id !== section.id))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar siteType="ecommerce" siteId="" siteName="" currentPath={`/dashboard/ecommerce/blogs`} />
      {isLoading ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F2CFCE]/30 border-t-[#F2CFCE]" />
            <p className="text-sm text-muted-foreground">Cargando…</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="lg:pl-64">
            <div className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Volver
                    </Button>
                    <div>
                      <h1 className="text-xl font-semibold ">Secciones del Blog</h1>
                      <p className="text-sm ">Gestiona las secciones de contenido de este blog</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              {blog && (
                <Card className={`${secondBackgroundColor} ${principalText}`}>
                  <CardHeader>
                    <CardTitle>Información del Blog</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><span className="font-semibold">Título:</span> {blog.titulo}</p>
                    <p><span className="font-semibold">Autor:</span> {blog.autor}</p>
                    <p><span className="font-semibold">Tipo:</span> {blog.tipo_blog}</p>
                    {blog.descripcion && (
                      <p><span className="font-semibold">Descripción:</span> {blog.descripcion}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Secciones</CardTitle>
                      <p className="text-sm mt-1">Crea, edita o elimina secciones del blog</p>
                    </div>
                    <Button type="button" size="sm" onClick={handleStartCreateSection}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva sección
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sections.length === 0 ? (
                    <div className={`${secondBackgroundColor} ${principalText}`}>
                      Este blog aún no tiene secciones.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sections.map(section => (
                        <div key={section.id} className="flex gap-3 items-start p-3 border border-border rounded-lg text-sm">
                          {section.image_url && (
                            <img
                              src={section.image_url}
                              alt={section.titulo}
                              className="w-16 h-16 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium truncate">{section.titulo}</p>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStartEditSection(section)}
                                  className={`${principalHoverBackground} `}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSection(section)}
                                  className={`${principalHoverBackground}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {section.detalle && (
                              <p className={`${secondBackgroundColor} ${principalText}`}>{section.detalle}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sectionForm && (
                    <form onSubmit={handleSaveSection} className="mt-2 space-y-3 border-t pt-3 text-sm">
                      <p className="font-medium">
                        {sectionForm.id ? "Editar sección" : "Nueva sección"}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs" htmlFor="section-title">Título</Label>
                          <Input
                            id="section-title"
                            value={sectionForm.titulo}
                            onChange={(e) => setSectionForm(prev => prev ? { ...prev, titulo: e.target.value } : prev)}
                            required
                            className={placeholderStyle}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs" htmlFor="section-detalle">Detalle</Label>
                          <Textarea
                            id="section-detalle"
                            value={sectionForm.detalle}
                            onChange={(e) => setSectionForm(prev => prev ? { ...prev, detalle: e.target.value } : prev)}
                            rows={3}
                            className={placeholderStyle}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Imagen de la sección</Label>
                        <input
                          id="section-image"
                          type="file"
                          accept="image/*"
                          onChange={handleSectionImageUpload}
                          className="hidden"
                        />
                        {!sectionImagePreview ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("section-image")?.click()}
                            className="w-full h-24 border-dashed"
                          >
                            <div className="text-center">
                              <ImageIcon className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">Subir imagen de sección (opcional)</p>
                            </div>
                          </Button>
                        ) : (
                          <div className="relative w-full h-24">
                            <img
                              src={sectionImagePreview}
                              alt="Imagen sección"
                              className="w-full h-full object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0"
                              onClick={resetSectionForm}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" variant="outline" size="sm" onClick={resetSectionForm}
                          className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" variant="outline" size="sm" disabled={isSavingSection} aria-busy={isSavingSection}
                          className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                        >
                          {isSavingSection ? "Guardando..." : "Guardar sección"}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
