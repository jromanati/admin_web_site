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
    return fetchedCategories.map((category: any) => ({
      ...category,
    }))
  }
  const { data: categories = [] } = useSWR('categories', fetchCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setisLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isCreateSubcategoryDialogOpen, setIsCreateSubcategoryDialogOpen] = useState(false)
  const [parentCategoryForSubcategory, setParentCategoryForSubcategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "",
    status: "active" as "active" | "inactive",
  })
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [thirdBackgroundColor, setThirdBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")

  useEffect(() => {
      const rawUserData = localStorage.getItem("user_data")
      const rawClientData = localStorage.getItem("tenant_data")
      const tenant_data = rawUserData ? JSON.parse(rawClientData) : null
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

    const matchingIds = new Set<string>()

    const addCategoryAndAncestors = (category: Category) => {
      matchingIds.add(category.id)
      if (category.parent) {
        const parent = categories.find((c) => c.id === category.parent)
        if (parent && !matchingIds.has(parent.id)) {
          addCategoryAndAncestors(parent)
        }
      }
    }

    categories.forEach((category) => {
      const nameMatch = category.name.toLowerCase().includes(searchTerm.toLowerCase())
      const descMatch = category.description.toLowerCase().includes(searchTerm.toLowerCase())

      if (nameMatch || descMatch) {
        addCategoryAndAncestors(category)

        // Incluir hijos
        const addChildren = (parentId: string) => {
          categories
            .filter((c) => c.parent === parentId)
            .forEach((child) => {
              matchingIds.add(child.id)
              addChildren(child.id)
            })
        }

        addChildren(category.id)
      }
    })
    setisLoading(false);
    return categories.filter((cat) => matchingIds.has(cat.id))
  }, [categories, searchTerm])

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


  const toggleExpansion = (categoryId: string) => {
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
      status: "active",
      parent: formData.parent || null,
    }

    const response = await EcomerceService.createCategory(newCategory)

    if (response.success) {
      // mutate('categories', (current: Category[] = []) => [...current, response.data], false)
      mutate('categories', (current: Category[] = []) => {
        const updated = [...current, response.data] // ejemplo crear
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
      status: "active",
      parent: parentCategoryForSubcategory?.id || null,
    }

    const response = await EcomerceService.createCategory(newCategory)

    if (response.success) {
      // mutate('categories', (current: Category[] = []) => [...current, response.data], false)
      mutate('categories', (current: Category[] = []) => {
        const updated = [...current, response.data] // ejemplo crear
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
    setFormData({
      name: category.name,
      description: category.description,
      parent: category.parent || "",
      status: category.status,
    })
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    const updatedCategory: Category = {
      ...editingCategory,
      name: formData.name,
      description: formData.description,
      parent: formData.parent || null,
    }

    const response = await EcomerceService.updateCategory(updatedCategory, editingCategory.id)

    if (response.success) {
      mutate('categories', (current: Category[] = []) => {
        const updated = current.map(cat =>
          cat.id === editingCategory.id ? response.data : cat
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
    const response = await EcomerceService.deleteCategory(categoryId)

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
      status: "active",
    })
  }
  const getSubcategoryCount = (categoryId: string) => {
    return categories.filter((cat) => cat.parent === categoryId).length
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
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría Padre
                </Button>
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
                ) : (
                  <div className="divide-y divide-border">
                    {visibleNodes.map((node, index) => (
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

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="">{node.name}</h3>
                                <Badge variant={node.status === "active" ? "default" : "secondary"} className="text-xs">
                                  {node.status === "active" ? "Activa" : "Inactiva"}
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
                )}
              </CardContent>
            </Card>

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
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activa</SelectItem>
                        <SelectItem value="inactive">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
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
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activa</SelectItem>
                        <SelectItem value="inactive">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
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
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activa</SelectItem>
                        <SelectItem value="inactive">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
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
                      {getSubcategoryCount(categoryToDelete?.id || "") > 0 && (
                        <li>• {getSubcategoryCount(categoryToDelete?.id || "")} subcategorías y sus productos</li>
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
          </div>
        </div>
      )}
    </div>
  )
}
