"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
} from "lucide-react"
import { EcomerceService } from "@/services/ecomerce/categories/ecomerce.service"
import { AuthService } from "@/services/auth.service"
import useSWR, { mutate } from "swr"
import type {Category} from "@/types/ecomerces/categories"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"

// interface Category {
//   id: string
//   name: string
//   description: string
//   parent?: string
//   status: "active" | "inactive"
//   products_count: number
// }

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
  level: number
  isExpanded: boolean
}

export function CategoriesManager() {
  const [siteData, setSiteData] = useState<any>(null)
  const fetchCategories = async () => {
    const isValid = AuthService.isTokenValid()
    if (!isValid) {
      const isRefreshValid = await AuthService.isRefreshTokenValid()
      if (!isRefreshValid)window.location.href = "/"
    }
    const categoriesResponse = await EcomerceService.getCategories()
    setisLoading(false)
    const fetchedCategories = categoriesResponse || []
    return fetchedCategories
  }
  const { data: categories = [] } = useSWR('categories', fetchCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setisLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isCreateSubcategoryDialogOpen, setIsCreateSubcategoryDialogOpen] = useState(false)
  const [parentCategoryForSubcategory, setParentCategoryForSubcategory] = useState<Category | null>(null)
  const [principalImageFile, setPrincipalImageFile] = useState<File | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "cards">("list")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "",
    is_active: true,
  })
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [thirdBackgroundColor, setThirdBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const { toast } = useToast()

  useEffect(() => {
      const rawUserData = localStorage.getItem("user_data")
      const rawClientData = localStorage.getItem("tenant_data")
      const tenant_data = rawClientData ? JSON.parse(rawClientData) : null
      if (tenant_data.styles_site){
        setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
        setThirdBackgroundColor(tenant_data.styles_site.background_color)
        setPrincipalText(tenant_data.styles_site.principal_text)
        setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
        setSecondHoverBackground("hover:bg-[#b20c06]")
        setSecondHoverBackground(tenant_data.styles_site.second_hover_background)
        setPrincipalHoverText("hover:text-blue-100")
        setPrincipalHoverText(tenant_data.styles_site.principal_hover_text)
      }
  }, [])
  // const backgroundColor = "bd-card"
  

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories

    const matchingIds = new Set<number>()

    const addCategoryAndAncestors = (category: Category) => {
      matchingIds.add(category.id)
      if (typeof category.parent === "number") {
        const parent = categories.find((c: Category) => c.id === category.parent)
        if (parent && !matchingIds.has(parent.id)) {
          addCategoryAndAncestors(parent)
        }
      }
    }

    

    categories.forEach((category: Category) => {
      const nameMatch = category.name.toLowerCase().includes(searchTerm.toLowerCase())
      const descMatch = category.description.toLowerCase().includes(searchTerm.toLowerCase())

      if (nameMatch || descMatch) {
        addCategoryAndAncestors(category)

        // Incluir hijos
        const addChildren = (parentId: number) => {
          categories
            .filter((c: Category) => c.parent === parentId)
            .forEach((child: Category) => {
              matchingIds.add(child.id)
              addChildren(child.id)
            })
        }

        addChildren(category.id)
      }
    })
    setisLoading(false);
    return categories.filter((cat: Category) => matchingIds.has(cat.id))
  }, [categories, searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const categoryTree = useMemo(() => {
    const buildCategoryTree = (categories: Category[], parent: number | null = null, level = 0): CategoryTreeNode[] => {
      return categories
        .filter((cat) => cat.parent === parent)
        .map((cat) => ({
          ...cat,
          level,
          isExpanded: expandedNodes.has(cat.id),
          children: buildCategoryTree(categories, cat.id, level + 1),
        }))
    }
    const tree = buildCategoryTree(filteredCategories)
    return tree
  }, [filteredCategories, expandedNodes])

  const visibleNodes = useMemo(() => {
    const result: CategoryTreeNode[] = []

    const traverse = (nodes: CategoryTreeNode[]) => {
      nodes.forEach((node) => {
        result.push(node)
        if (node.isExpanded && node.children.length > 0) {
          traverse(node.children)
        }
      })
    }

    traverse(categoryTree)
    return result
  }, [categoryTree])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(visibleNodes.length / pageSize))
  }, [visibleNodes.length])

  const paginatedNodes = useMemo(() => {
    const page = Math.min(Math.max(currentPage, 1), totalPages)
    const start = (page - 1) * pageSize
    return visibleNodes.slice(start, start + pageSize)
  }, [currentPage, totalPages, visibleNodes])


  const toggleExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleCreateCategory = async () => {
    const newCategory: Category = {
      id: 0,
      name: formData.name,
      description: formData.description,
      products_count: 0,
      status: formData.is_active ? "active" : "inactive",
      is_active: formData.is_active,
      parent: formData.parent ? Number(formData.parent) : null,
    }

    const response = await EcomerceService.createCategory(newCategory, principalImageFile)

    const createdCategory = response.success ? response.data : undefined
    if (createdCategory) {
      // mutate('categories', (current: Category[] = []) => [...current, response.data], false)
      mutate('categories', (current: Category[] = []) => {
        const updated = [...current, createdCategory] // ejemplo crear
        localStorage.setItem("categories", JSON.stringify(updated))
        return updated
      }, false)
    }
    resetForm()
    setIsCreateDialogOpen(false)
  }

  const handleCreateSubcategory = async () => {
    const newCategory: Category = {
      id: 0,
      name: formData.name,
      description: formData.description,
      products_count: 0,
      status: formData.is_active ? "active" : "inactive",
      is_active: formData.is_active,
      parent: parentCategoryForSubcategory?.id || null,
    }

    const response = await EcomerceService.createCategory(newCategory, principalImageFile)

    const createdCategory = response.success ? response.data : undefined
    if (createdCategory) {
      // mutate('categories', (current: Category[] = []) => [...current, response.data], false)
      mutate('categories', (current: Category[] = []) => {
        const updated = [...current, createdCategory] // ejemplo crear
        localStorage.setItem("categories", JSON.stringify(updated))
        return updated
      }, false)
    }

    setIsCreateSubcategoryDialogOpen(false)
    resetForm()
    setParentCategoryForSubcategory(null)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setPrincipalImageFile(null)
    setFormData({
      name: category.name,
      description: category.description,
      parent: typeof category.parent === "number" ? String(category.parent) : "",
      is_active: typeof category.is_active === "boolean" ? category.is_active : category.status === "active",
    })
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    const updatedCategory: Category = {
      ...editingCategory,
      name: formData.name,
      description: formData.description,
      parent: formData.parent ? Number(formData.parent) : null,
      is_active: formData.is_active,
      status: formData.is_active ? "active" : "inactive",
    }

    const response = await EcomerceService.updateCategory(updatedCategory, editingCategory.id, principalImageFile)

    const updatedCategoryFromApi = response.success ? response.data : undefined
    if (updatedCategoryFromApi) {
      mutate('categories', (current: Category[] = []) => {
        const updated = current.map(cat =>
          cat.id === editingCategory.id ? updatedCategoryFromApi : cat
        )
        localStorage.setItem("categories", JSON.stringify(updated))
        return updated
      }, false)
    }

    setEditingCategory(null)
    resetForm()
  }

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category)
  }

  const deleteCategory = async (categoryId: string) => {
    const response = await EcomerceService.deleteCategory(Number(categoryId))

    if (response.success) {
      mutate('categories', (current: Category[] = []) => {
        const updated = current.filter(cat => cat.id !== Number(categoryId))
        localStorage.setItem("categories", JSON.stringify(updated))
        return updated
      }, false)
    }
  }

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      //setCategories(categories.filter((cat) => cat.id !== categoryToDelete.id))
      setCategoryToDelete(null)
      deleteCategory(categoryToDelete.id.toString())
    }
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const openCreateSubcategoryDialog = (parentCategory: Category) => {
    resetForm()
    setParentCategoryForSubcategory(parentCategory)
    setIsCreateSubcategoryDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      parent: "",
      is_active: true,
    })
    setPrincipalImageFile(null)
  }
  const getSubcategoryCount = (categoryId: number) => {
    return categories.filter((cat: Category) => cat.parent === categoryId).length
  }

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importType, setImportType] = useState<"products" | "images">("products")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<{
    message: string
    errors: string[]
    products_created?: number
    products_updated?: number
  } | null>(null)
  

  const handleImportProducts = async () => {
    if (!importFile) {
      setImportError({
        message: "Debes seleccionar un archivo para importar.",
        errors: [],
      })
      return
    }
    try {
      const res = await EcomerceService.uploadCategories(importFile)

      if (res.success) {
        await mutate("categories")
        toast({
          title: "Importación exitosa",
          description: "La importación de categorías se realizó correctamente.",
        })
        setIsImportDialogOpen(false)
        setImportFile(null)
        setImportError(null)
      } else {
        setImportError({
          message: res.error || "Ocurrieron errores al importar los productos.",
          errors: Array.isArray(res.data.errors) ? res.data.errors : [],
          products_created: res.data?.products_created ?? 0,
          products_updated: res.data?.products_updated ?? 0,
        })
      }
    } catch (error) {
      console.error("Error al importar categorías", error)
      setImportError({
        message: "Error inesperado al importar categorías.",
        errors: [],
        products_created: 0,
        products_updated: 0,
      })
    } finally {
      setIsImporting(false)
    }      
  }
  
  const handleDownloadTemplate = () => {
    // Definimos las columnas (headers)
    const headers = [
      "name",
      "description",
      "parent",
      "is_active",
    ]

    // Opcional: fila de ejemplo vacía o con valores de muestra
    const exampleRow = [
      "Categoría ejemplo",
      "Descripción de la categoría",
      "Nombre de la categoría padre",
    ]

    const instructionText = 'IMPORTANTE:\n' +
      '1) Completa los datos de las categorías en las filas inferiores.\n' +
      '2) No modifiques los nombres de las columnas.\n' +
      '3) Revisa el manual (sección importación).\n' +
      '4) Antes de subir el archivo, usa “Guardar como…” y elige formato CSV (delimitado por comas).\n' +
      '5) Elimina esta fila de instrucciones y deja solo la fila de cabecera (name, description, parent, ...).'


    // Creamos los datos de la hoja (primera fila headers, segunda fila ejemplo)
    const worksheetData = [[instructionText], headers, exampleRow]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // --- Estilos para la celda de instrucciones (A1) ---
    const instructionCellRef = "A1"

    if (!worksheet[instructionCellRef]) {
      worksheet[instructionCellRef] = { t: "s", v: instructionText }
    }

    worksheet[instructionCellRef].s = {
      font: {
        color: { rgb: "FF0000" }, // rojo
        bold: true,
      },
      alignment: {
        wrapText: true, // que respete los saltos de línea
        vertical: "top",
      },
    }

    // Hacemos que la celda A1 se fusione hasta la última columna de headers
    worksheet["!merges"] = [
      {
        s: { r: 0, c: 0 }, // start (row 0, col 0) -> A1
        e: { r: 0, c: headers.length - 1 }, // end (misma fila, última col)
      },
    ]

    // Ancho de columnas un poco más cómodo (opcional)
    worksheet["!cols"] = headers.map(() => ({ wch: 20 }))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template")

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "categorias_template.xlsx"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header con búsqueda y botón crear */}
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
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center space-x-4">              
                  <div>
                    <h1 className="font-semibold">Gestión de Categorías</h1>
                    <p className="text-sm">Organiza tus productos por categorías</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsImportDialogOpen(true)} >
                    Importación masiva
                  </Button>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Categoría Padre
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                
              </div>
            </div>
            {/* Información de resultados */}
            {searchTerm && (
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredCategories.length} resultado{filteredCategories.length !== 1 ? "s" : ""} para "{searchTerm}"
              </div>
            )}

            {/* Vista de árbol de categorías */}
            <Card className={`${secondBackgroundColor} ${principalText}`}>
              <CardContent className="p-0 ">
                {visibleNodes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    {isLoading ? (
                      <div className="text-center">
                        <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Cargando categorías...
                        </h3>
                      </div>
                    ) : (
                      <div className="text-center">
                          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            {searchTerm ? "No se encontraron categorías" : "No hay categorías"}
                          </h3>
                          <p className="text-muted-foreground text-center mb-4">
                            {searchTerm
                              ? "Intenta con otros términos de búsqueda"
                              : "Comienza creando tu primera categoría de productos"}
                          </p>
                          {!searchTerm && (
                            <Button onClick={openCreateDialog}>
                              <Plus className="h-4 w-4 mr-2" />
                              Crear Primera Categoría
                            </Button>
                          )}
                      </div>                    
                    )}
                  </div>
                ) : viewMode === "list" ? (
                  <div className="divide-y divide-border">
                    {paginatedNodes.map((node) => (
                      <div
                        key={node.id}
                        className="p-4 transition-colors border-b border-border/50 last:border-b-0"
                        style={{ paddingLeft: `${16 + node.level * 24}px` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center gap-1">
                              {node.children.length > 0 ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => toggleExpansion(node.id)}
                                >
                                  {node.isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              ) : (
                                <div className="w-6" />
                              )}
                              {node.children.length > 0 ? (
                                node.isExpanded ? (
                                  <FolderOpen className="h-4 w-4 " />
                                ) : (
                                  <Folder className="h-4 w-4 " />
                                )
                              ) : (
                                <Tag className="h-4 w-4 " />
                              )}
                            </div>

                            <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                              {node.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={node.image_url} alt={node.name} className="h-full w-full object-cover" />
                              ) : (
                                <Tag className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="">{node.name}</h3>
                                <Badge
                                  variant={(typeof node.is_active === "boolean" ? node.is_active : node.status === "active") ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {(typeof node.is_active === "boolean" ? node.is_active : node.status === "active") ? "Activa" : "Inactiva"}
                                </Badge>
                              </div>
                              <p className="text-sm mb-1">{node.description}</p>
                              <div className="flex gap-4 text-xs ">
                                <span>{node.products_count} productos</span>
                                {node.children.length > 0 && <span>{node.children.length} subcategorías</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCreateSubcategoryDialog(node)}
                              className={`${principalHoverBackground}`}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditCategory(node)}
                            className={`${principalHoverBackground}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(node)}
                              className={`${principalHoverBackground} `}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paginatedNodes.map((node) => (
                        <Card key={node.id} className="overflow-hidden">
                          <div className="h-32 bg-muted overflow-hidden">
                            {node.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={node.image_url} alt={node.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Tag className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium line-clamp-1">{node.name}</h3>
                              <Badge
                                variant={(typeof node.is_active === "boolean" ? node.is_active : node.status === "active") ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {(typeof node.is_active === "boolean" ? node.is_active : node.status === "active") ? "Activa" : "Inactiva"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{node.description}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                              <span>{node.products_count} productos</span>
                              {node.children.length > 0 && <span>{node.children.length} subcategorías</span>}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCreateSubcategoryDialog(node)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCategory(node)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCategory(node)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {visibleNodes.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Página {Math.min(currentPage, totalPages)} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Categoría Padre</DialogTitle>
                  <DialogDescription>Agrega una nueva categoría principal a tu tienda.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la categoría *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Electrónicos, Ropa, Hogar..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe qué tipo de productos incluye esta categoría..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.is_active ? "true" : "false"}
                      onValueChange={(value: "true" | "false") =>
                        setFormData({ ...formData, is_active: value === "true" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activa</SelectItem>
                        <SelectItem value="false">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="principal-image">Imagen principal</Label>
                    <p className="text-xs text-muted-foreground">
                      Esta imagen se mostrará en el listado de categorías.
                    </p>
                    <input
                      id="principal-image"
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80"
                      onChange={(e) => setPrincipalImageFile(e.target.files?.[0] || null)}
                    />
                    {principalImageFile?.name && (
                      <p className="text-xs text-muted-foreground">Archivo seleccionado: {principalImageFile.name}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCategory} disabled={(!formData.name.trim() || !formData.description.trim())}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Crear Categoría
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateSubcategoryDialogOpen} onOpenChange={setIsCreateSubcategoryDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Subcategoría</DialogTitle>
                  <DialogDescription>
                    Agrega una nueva subcategoría dentro de "{parentCategoryForSubcategory?.name}".
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Categoría padre:</strong> {parentCategoryForSubcategory?.name}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="sub-name" className="py-2">Nombre de la subcategoría</Label>
                    <Input
                      id="sub-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Smartphones, Camisas, Muebles..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="sub-description" className="py-2">Descripción</Label>
                    <Textarea
                      id="sub-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe qué tipo de productos incluye esta subcategoría..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="sub-status">Estado</Label>
                    <Select
                      value={formData.is_active ? "true" : "false"}
                      onValueChange={(value: "true" | "false") =>
                        setFormData({ ...formData, is_active: value === "true" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activa</SelectItem>
                        <SelectItem value="false">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-principal-image">Imagen principal</Label>
                    <p className="text-xs text-muted-foreground">
                      Esta imagen se mostrará en el listado de categorías.
                    </p>
                    <input
                      id="sub-principal-image"
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80"
                      onChange={(e) => setPrincipalImageFile(e.target.files?.[0] || null)}
                    />
                    {principalImageFile?.name && (
                      <p className="text-xs text-muted-foreground">Archivo seleccionado: {principalImageFile.name}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateSubcategoryDialogOpen(false)}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateSubcategory} disabled={!formData.name.trim()}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Crear Subcategoría
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog para editar categoría */}
            <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Categoría</DialogTitle>
                  <DialogDescription>Modifica los datos de la categoría seleccionada.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Nombre de la categoría</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Electrónicos, Ropa, Hogar..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Descripción</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe qué tipo de productos incluye esta categoría..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Estado</Label>
                    <Select
                      value={formData.is_active ? "true" : "false"}
                      onValueChange={(value: "true" | "false") =>
                        setFormData({ ...formData, is_active: value === "true" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activa</SelectItem>
                        <SelectItem value="false">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-principal-image">Imagen principal</Label>
                    {editingCategory?.image_url && (
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={editingCategory.image_url}
                            alt={editingCategory.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Imagen actual</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Selecciona una nueva imagen para reemplazar la actual.</p>
                    <input
                      id="edit-principal-image"
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80"
                      onChange={(e) => setPrincipalImageFile(e.target.files?.[0] || null)}
                    />
                    {principalImageFile?.name && (
                      <p className="text-xs text-muted-foreground">Archivo seleccionado: {principalImageFile.name}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingCategory(null)}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateCategory} disabled={!formData.name.trim()}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Guardar Cambios
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog de confirmación para eliminar */}
            <Dialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Confirmar Eliminación
                  </DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de que deseas eliminar la categoría "{categoryToDelete?.name}"?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      <strong>Advertencia:</strong> Esta acción eliminará permanentemente:
                    </p>
                    <ul className="text-sm text-red-700 mt-2 space-y-1">
                      <li>• La categoría "{categoryToDelete?.name}"</li>
                      <li>• {categoryToDelete?.products_count || 0} productos asociados</li>
                      {typeof categoryToDelete?.id === "number" && getSubcategoryCount(categoryToDelete.id) > 0 && (
                        <li>• {getSubcategoryCount(categoryToDelete.id)} subcategorías y sus productos</li>
                      )}
                    </ul>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCategoryToDelete(null)}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={confirmDeleteCategory}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Eliminar Categoría
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog de importación masiva */}
            <Dialog
              open={isImportDialogOpen}
              onOpenChange={(open) => {
                setIsImportDialogOpen(open)
                if (!open) {
                  setImportFile(null)
                  setImportError(null) // limpiar errores al cerrar
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importación masiva</DialogTitle>
                  <DialogDescription>
                    Selecciona el tipo de importación y el archivo a subir.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Archivo</label>
                    <input
                      type="file"
                      className="
                        block w-full text-sm
                        border border-gray-300 rounded-md
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-black file:text-white
                        hover:file:bg-neutral-800
                        cursor-pointer
                      "
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setImportFile(file)
                        setImportError(null)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div>
                       <p className="text-muted-foreground">
                      Puedes descargar un excel de ejemplo con la estructura requerida.
                    </p>
                    <p className="text-muted-foreground my-2">
                      <strong>
                        Importante! Recuerda que debes guardarlo como CSV
                      </strong>
                    </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate}>
                      Descargar Excel ejemplo
                    </Button>
                  </div>

                  {/* 🔴 Bloque de errores de importación */}
                  {importError && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-destructive/30 bg-destructive/5 p-3">
                      <p className="text-sm font-semibold text-destructive">
                        {importError.message}
                      </p>

                      {importError.errors.length > 0 && (
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                          {importError.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      <a
                        href="/ManualImportaciones.pdf"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver manual de importación (PDF)
                      </a>
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsImportDialogOpen(false)
                      setImportFile(null)
                      setImportError(null)
                    }}
                    className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleImportProducts} disabled={isImporting}>
                    {isImporting ? "Importando..." : "Importar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  )
}
