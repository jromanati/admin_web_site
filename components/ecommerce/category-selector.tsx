"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronRight, FolderOpen, Tag } from "lucide-react"
import type {Category} from "@/types/ecomerces/categories"

// Mock data - in real app, this would come from API
const mockCategories = [
  {
    id: "1",
    name: "Ropa y Accesorios de Moda Contemporánea",
    subcategories: [
      {
        id: "1-1",
        name: "Camisetas",
        subcategories: [
          { id: "1-1-1", name: "Manga Corta", subcategories: [] },
          { id: "1-1-2", name: "Manga Larga", children: [] },
        ],
      },
      {
        id: "1-2",
        name: "Pantalones",
        subcategories: [
          { id: "1-2-1", name: "Jeans", subcategories: [] },
          { id: "1-2-2", name: "Deportivos", subcategories: [] },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Electrónicos",
    subcategories: [
      {
        id: "2-1",
        name: "Smartphones",
        subcategories: [
          { id: "2-1-1", name: "Android", subcategories: [] },
          { id: "2-1-2", name: "iPhone", subcategories: [] },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Libros",
    children: [], // Categoría sin subcategorías para testing
  },
]

interface CategorySelectorProps {
  selectedCategory: any
  onCategorySelect: (category: any) => void
}

const countAllSubcategories = (category: any): number => {
  if (!category.subcategories || category.subcategories.length === 0) return 0

  let count = category.subcategories.length
  category.subcategories.forEach((child: any) => {
    count += countAllSubcategories(child)
  })
  return count
}

const CategoryTree = ({
  categories,
  onSelect,
  level = 0,
}: { categories: any[]; onSelect: (category: any) => void; level?: number }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }


  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const hasChildren = category.subcategories && category.subcategories.length > 0
        const isExpanded = expandedCategories.has(category.id)
        const canSelect = !hasChildren // Solo se pueden seleccionar categorías sin hijos

        return (
          <div key={category.id}>
            <div
              className={`flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 ${level > 0 ? "ml-" + (level * 4) : ""}`}
              style={{ marginLeft: level * 16 }}
            >
              {hasChildren && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleExpanded(category.id)}>
                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </Button>
              )}
              {!hasChildren && <div className="w-6" />}

              {hasChildren ? (
                <FolderOpen className="h-4 w-4 text-primary" />
              ) : (
                <Tag className="h-4 w-4 text-muted-foreground" />
              )}

              <span
                className={`flex-1 text-sm ${!canSelect ? "text-muted-foreground" : "cursor-pointer hover:text-primary"}`}
              >
                {category.name}
              </span>

              {canSelect && (
                <Button size="sm" variant="outline" onClick={() => onSelect(category)}>
                  Seleccionar
                </Button>
              )}
            </div>

            {hasChildren && isExpanded && (
              <CategoryTree categories={category.subcategories} onSelect={onSelect} level={level + 1} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function CategorySelector({ selectedCategory, onCategorySelect }: CategorySelectorProps) {
  const [showModal, setShowModal] = useState(false)
  const [modalCategory, setModalCategory] = useState<any>(null)
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const [placeholderStyle, setPlaceholderStyle] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("")
  useEffect(() => {
      const rawUserData = localStorage.getItem("user_data")
      const rawClientData = localStorage.getItem("tenant_data")
      const tenant_data = rawUserData ? JSON.parse(rawClientData) : null
      if (tenant_data.styles_site){
        setBackgroundColor(tenant_data.styles_site.background_color)
        setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
        setPrincipalText(tenant_data.styles_site.principal_text)
        setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
        setSecondHoverBackground(tenant_data.styles_site.second_hover_background)
        setPrincipalHoverText(tenant_data.styles_site.principal_hover_text)
        setPlaceholderStyle(tenant_data.styles_site.placeholder)
      }
  }, [])

  const handleCategoryClick = (category: any) => {
    const hasChildren = category.subcategories && category.subcategories.length > 0

    if (hasChildren) {
      setModalCategory(category)
      setShowModal(true)
    } else {
      onCategorySelect(category)
    }
  }

  const handleModalSelect = (category: any) => {
    onCategorySelect(category)
    setShowModal(false)
    setModalCategory(null)
  }

  // const getCachedCategories = (): Category[] => {
  //   const stored = localStorage.getItem("categories")
  //   if (!stored) return []
  //   try {
  //     return JSON.parse(stored)
  //   } catch {
  //     return []
  //   }
  // }

  // const cachedCategories = useMemo(() => getCachedCategories(), [])

  const [cachedCategories, setCachedCategories] = useState<Category[]>([])

  function buildCategoryTree(flatCategories: any[]): any[] {
    const categoryMap = new Map<number, any>()

    // Primero crear un mapa por ID
    flatCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, subcategories: [] })
    })

    const rootCategories: any[] = []

    flatCategories.forEach((cat) => {
      if (cat.parent == null) {
        // Categoría raíz
        rootCategories.push(categoryMap.get(cat.id))
      } else {
        // Subcategoría → agregar al padre
        const parent = categoryMap.get(cat.parent)
        if (parent) {
          parent.subcategories.push(categoryMap.get(cat.id))
        }
      }
    })

    return rootCategories
  }

  useEffect(() => {
    const stored = localStorage.getItem("categories")
    if (stored) {
      try {
        const parsed = buildCategoryTree(JSON.parse(stored))
        setCachedCategories(parsed)
      } catch (e) {
        console.error("Error parsing categories from localStorage", e)
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Selected Category Display */}
      {selectedCategory && (
        // <Card className="p-3 bg-primary/5 border-primary/20">
        <Card className={`p-3 border-primary/20 ${backgroundColor} `}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Categoría seleccionada:</p>
              <p className="text-primary font-semibold truncate">{selectedCategory.name}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCategorySelect(undefined)}
              className={`ml-2 flex-shrink-0 ${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
            >
              Limpiar
            </Button>
          </div>
        </Card>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cachedCategories.map((category) => {
        // {mockCategories.map((category) => {

          const subcategoryCount = countAllSubcategories(category)
          const hasChildren = category.subcategories && category.subcategories.length > 0

          return (
            <Card
              key={category.id}
              className={`
                p-4 cursor-pointer border-2 
                ${secondBackgroundColor} ${principalText} ${principalHoverBackground}`
              }
              onClick={() => handleCategoryClick(category)}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start space-x-3 flex-1">
                  {hasChildren ? (
                    <FolderOpen className="h-5 w-5  flex-shrink-0 mt-1" />
                  ) : (
                    <Tag className="h-5 w-5  flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-2">{category.name}</h3>
                    {hasChildren && (
                      <p className="text-xs ">
                        {subcategoryCount} subcategoría{subcategoryCount !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="text-xs ">
                    {hasChildren ? "Clic para explorar" : "Clic para seleccionar"}
                  </span>
                  <ChevronRight className="h-4 w-4 " />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5" />
              <span>Seleccionar subcategoría de: {modalCategory?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {modalCategory && <CategoryTree categories={modalCategory.subcategories} onSelect={handleModalSelect} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
