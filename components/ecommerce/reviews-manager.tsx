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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Star,
  Search,
  Eye,
  Check,
  X,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Package,
  ChevronDown,
} from "lucide-react"
import type { Review } from "@/types/ecomerces/reviews"
import { ReviewsService } from "@/services/ecomerce/reviews/reviews.service"
import { AuthService } from "@/services/auth.service"
import useSWR, { mutate } from "swr"


const mockReviews: Review[] = [
  {
    id: "REV-001",
    productId: "1",
    product_name: "Camiseta Premium",
    customerName: "María García",
    customerEmail: "maria@example.com",
    rating: 5,
    comment: "Excelente calidad, muy cómoda y el material es suave. La recomiendo totalmente.",
    date: "2024-01-15",
    status: "pending",
    orderId: "ORD-001",
    helpful: 0,
    reported: 0,
  },
  {
    id: "REV-002",
    productId: "2",
    product_name: "Jeans Clásicos",
    customerName: "Juan Pérez",
    customerEmail: "juan@example.com",
    rating: 4,
    comment: "Buenos jeans, la talla es correcta pero el color se ve un poco diferente a la foto.",
    date: "2024-01-14",
    status: "approved",
    orderId: "ORD-002",
    helpful: 3,
    reported: 0,
  },
  {
    id: "REV-003",
    productId: "3",
    product_name: "Zapatillas Deportivas",
    customerName: "Ana López",
    customerEmail: "ana@example.com",
    rating: 2,
    comment: "No me gustaron, son incómodas y la suela es muy dura. Esperaba mejor calidad por el precio.",
    date: "2024-01-13",
    status: "pending",
    orderId: "ORD-003",
    helpful: 0,
    reported: 1,
  },
  {
    id: "REV-004",
    productId: "4",
    product_name: "Chaqueta de Cuero",
    customerName: "Carlos Ruiz",
    customerEmail: "carlos@example.com",
    rating: 5,
    comment: "Increíble chaqueta, el cuero es de excelente calidad y el diseño es perfecto.",
    date: "2024-01-12",
    status: "approved",
    orderId: "ORD-004",
    helpful: 8,
    reported: 0,
  },
  {
    id: "REV-005",
    productId: "1",
    product_name: "Camiseta Premium",
    customerName: "Laura Martín",
    customerEmail: "laura@example.com",
    rating: 1,
    comment: "Producto de muy mala calidad, se deshizo después del primer lavado. No lo recomiendo para nada.",
    date: "2024-01-11",
    status: "rejected",
    orderId: "ORD-005",
    helpful: 0,
    reported: 2,
  },
]

interface ReviewsManagerProps {
  siteId: string
}

export function ReviewsManager({ siteId }: ReviewsManagerProps) {
  // const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [isLoading, setisLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterRating, setFilterRating] = useState<string>("all")
  const [filterProduct, setFilterProduct] = useState<string>("all")
  const [productSearchTerm, setProductSearchTerm] = useState<string>("")
  const [showProductDropdown, setShowProductDropdown] = useState<boolean>(false)
  const [filterDateFrom, setFilterDateFrom] = useState<string>("")
  const [filterDateTo, setFilterDateTo] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [moderationNote, setModerationNote] = useState("")
  const itemsPerPage = 10
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [thirdBackgroundColor, setThirdBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const [placeholderStyle, setPlaceholderStyle] = useState("")
  
  useEffect(() => {
      setisLoading(false);
      const rawUserData = localStorage.getItem("user_data")
      const rawClientData = localStorage.getItem("tenant_data")
      const tenant_data = rawUserData ? JSON.parse(rawClientData) : null
      if (tenant_data.styles_site){
        setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
        setThirdBackgroundColor(tenant_data.styles_site.background_color)
        setPrincipalText(tenant_data.styles_site.principal_text)
        setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
        setSecondHoverBackground(tenant_data.styles_site.second_hover_background)
        setPrincipalHoverText(tenant_data.styles_site.principal_hover_text)
        setPlaceholderStyle(tenant_data.styles_site.placeholder)
      }
  }, [])

  const fetchedReviews = async () => {
      const isValid = AuthService.isTokenValid()
      if (!isValid) {
        const isRefreshValid = await AuthService.isRefreshTokenValid()
        if (!isRefreshValid)window.location.href = "/"
      }
      const reviewsResponse = await ReviewsService.getReviews()
      const fetchedReviews = reviewsResponse || []
      // setisLoading(false);
      console.log(reviewsResponse, 'reviewsResponse')
      return fetchedReviews.map((review: any) => ({
        ...review,
      }))
  }
  const { data: reviews = [] } = useSWR('reviews', fetchedReviews)

  const uniqueProducts = Array.from(new Set(reviews.map((review) => review.product_name)))

  const filteredProducts = uniqueProducts.filter((product) =>
    product.toLowerCase().includes(productSearchTerm.toLowerCase()),
  )

  const parseDDMMYYYY = (s: string) => {
    if (!s) return null
    const [dd, mm, yyyy] = s.split("/").map(Number)
    if (!dd || !mm || !yyyy) return null
    // Crea un Date consistente (UTC a medianoche)
    return new Date(Date.UTC(yyyy, mm - 1, dd))
  }

  const parseYYYYMMDD = (s?: string | null) => {
    if (!s) return null
    const [yyyy, mm, dd] = s.split("-").map(Number)
    if (!yyyy || !mm || !dd) return null
    return new Date(Date.UTC(yyyy, mm - 1, dd))
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || review.status === filterStatus
    const matchesRating = filterRating === "all" || review.rating.toString() === filterRating
    const matchesProduct = filterProduct === "all" || review.product_name === filterProduct
    const reviewDate = parseDDMMYYYY(review.updated_at) // ← en vez de new Date(review.updated_at)
    const matchesDateFrom = !filterDateFrom || (reviewDate && reviewDate >= parseYYYYMMDD(filterDateFrom))
    const matchesDateTo   = !filterDateTo   || (reviewDate && reviewDate <= parseYYYYMMDD(filterDateTo))

    return matchesSearch && matchesStatus && matchesRating && matchesProduct && matchesDateFrom && matchesDateTo
  })

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendiente</Badge>
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            Aprobada
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rechazada</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const getStats = () => {
    const pending = reviews.filter((r) => r.status === "pending").length
    const approved = reviews.filter((r) => r.status === "approved").length
    const rejected = reviews.filter((r) => r.status === "rejected").length
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    return { pending, approved, rejected, averageRating }
  }

  const stats = getStats()

  const handleApproveReview = async (id:number) => {
    const response = await ReviewsService.approveProductReview(id)
    if (response.success) {
      mutate('reviews', (current: Review[] = []) => {
        const updated = current.map(cat =>
          cat.id === id ? response.data : cat
        )
        // localStorage.setItem("reviews", JSON.stringify(updated))
        return updated
      }, false)
    }
  }

  const handleRejectReview = async (id:number) => {
    const response = await ReviewsService.rejectProductReview(id)
    console.log(response, 'response')
    if (response.data) {
      mutate('reviews', (current: Review[] = []) => {
        const updated = current.map(cat =>
          cat.id === id ? response.data : cat
        )
        return updated
      }, false)
    }
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
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
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-xl font-semibold">Gestión de Reseñas</h1>
                    <p className="text-sm ">Administra las reseñas y calificaciones de productos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <MessageSquare className="h-4 w-4 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold ">{stats.pending}</div>
                  <p className="text-xs ">Esperando aprobación</p>
                </CardContent>
              </Card>

              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
                  <Check className="h-4 w-4 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                  <p className="text-xs ">Publicadas</p>
                </CardContent>
              </Card>

              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
                  <X className="h-4 w-4 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold ">{stats.rejected}</div>
                  <p className="text-xs ">No publicadas</p>
                </CardContent>
              </Card>

              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
                  <Star className="h-4 w-4 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.averageRating ? (
                      <span>
                        {stats.averageRating.toFixed(1)}
                      </span>
                    ) : (
                      <span>
                        0
                      </span>
                    )}
                  </div>
                  <p className="text-xs ">★ De todas las reseñas</p>
                </CardContent>
              </Card>
            </div>

            <Card className={`mb-6 ${secondBackgroundColor} ${principalText}`}>
              <CardHeader>
                <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
                <CardDescription className={`${principalText}`}>
                  Filtra las reseñas por diferentes criterios
                </CardDescription>
              </CardHeader>
              <CardContent >
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 " />
                    <Input
                      placeholder="Buscar reseñas..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                      }}                  
                      className={`pl-10 ${placeholderStyle}`}
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="p-2 border border-border rounded-md "
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendientes</option>
                    <option value="approved">Aprobadas</option>
                    <option value="rejected">Rechazadas</option>
                  </select>

                  {/* Rating Filter */}
                  <select
                    value={filterRating}
                    onChange={(e) => {
                      setFilterRating(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="p-2 border border-border rounded-md "
                  >
                    <option value="all">Todas las calificaciones</option>
                    <option value="5">5 estrellas</option>
                    <option value="4">4 estrellas</option>
                    <option value="3">3 estrellas</option>
                    <option value="2">2 estrellas</option>
                    <option value="1">1 estrella</option>
                  </select>

                  <div className="relative">
                    <Package className="absolute left-3 top-3 h-4 w-4  z-10" />
                    <Input
                      placeholder="Buscar producto..."
                      value={productSearchTerm}
                      onChange={(e) => {
                        setProductSearchTerm(e.target.value)
                        setShowProductDropdown(true)
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      className={`pl-10 pr-10 ${placeholderStyle}`}
                    />
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 " />

                    {showProductDropdown && (
                      <div
                      // className="absolute top-full left-0 right-0 z-20 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto"
                      className={`absolute top-full left-0 right-0 z-20 mt-1  border border-border rounded-md shadow-lg max-h-48 overflow-y-auto ${secondBackgroundColor}`}
                      >
                        <div
                          className={`p-2 cursor-pointer text-sm`}
                          onClick={() => {
                            setFilterProduct("all")
                            setProductSearchTerm("")
                            setShowProductDropdown(false)
                            setCurrentPage(1)
                          }}
                        >
                          Todos los productos
                        </div>
                        {filteredProducts.map((product) => (
                          <div
                            key={product}
                            // className="p-2 hover:bg-muted cursor-pointer text-sm"
                            className={`p-2 hover: cursor-pointer text-sm`}
                            onClick={() => {
                              setFilterProduct(product)
                              setProductSearchTerm(product)
                              setShowProductDropdown(false)
                              setCurrentPage(1)
                            }}
                          >
                            {product}
                          </div>
                        ))}
                        {filteredProducts.length === 0 && productSearchTerm && (
                          <div className="p-2 text-sm ">No se encontraron productos</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Date From Filter */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 " />
                    <Input
                      type="date"
                      placeholder="Fecha desde"
                      value={filterDateFrom}
                      onChange={(e) => {
                        setFilterDateFrom(e.target.value)
                        setCurrentPage(1)
                      }}
                      className={`pl-10 ${placeholderStyle} ${principalText}`}
                    />
                  </div>

                  {/* Date To Filter */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 " />
                    <Input
                      type="date"
                      placeholder="Fecha hasta"
                      value={filterDateTo}
                      onChange={(e) => {
                        setFilterDateTo(e.target.value)
                        setCurrentPage(1)
                      }}
                      className={`pl-10 ${placeholderStyle} ${principalText}`}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setFilterStatus("all")
                      setFilterRating("all")
                      setFilterProduct("all")
                      setProductSearchTerm("")
                      setFilterDateFrom("")
                      setFilterDateTo("")
                      setCurrentPage(1)
                    }}
                    className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showProductDropdown && <div className="fixed inset-0 z-10" onClick={() => setShowProductDropdown(false)} />}

            {/* Results Info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm ">
                Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredReviews.length)} de{" "}
                {filteredReviews.length} reseñas
              </p>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {paginatedReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 " />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <CardTitle className="text-base">{review.product_name}</CardTitle>
                            <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                          </div>
                          <CardDescription>
                            Por {review.customerName} • {review.updated_at} • Pedido: {review.orderId}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(review.status)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedReview(review)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles de la Reseña</DialogTitle>
                              <DialogDescription>Revisa y modera esta reseña</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Product and Customer Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Producto</h3>
                                  <p>{review.product_name}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">Cliente</h3>
                                  <p>{review.customer_name}</p>
                                  <p className="text-sm ">{review.customer_email}</p>
                                </div>
                              </div>

                              {/* Rating and Date */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Calificación</h3>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                                    <span className="font-medium">{review.rating}/5</span>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">Fecha</h3>
                                  <p>{review.updated_at}</p>
                                </div>
                              </div>

                              {/* Review Comment */}
                              <div>
                                <h3 className="font-semibold mb-2">Comentario</h3>
                                <div className="p-3 bg-muted rounded-md">
                                  <p>{review.comment}</p>
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Estado</h3>
                                  {getStatusBadge(review.status)}
                                </div>
                              </div>

                              {/* Moderation Actions */}
                              <div>
                                <h3 className="font-semibold mb-2">Acciones de Moderación</h3>
                                <div className="space-y-3">
                                  <Textarea
                                    placeholder="Nota de moderación (opcional)..."
                                    value={moderationNote}
                                    onChange={(e) => setModerationNote(e.target.value)}
                                    rows={2}
                                    className={`pl-10 ${placeholderStyle}`}
                                  />
                                  <div className="flex space-x-2">
                                    {review.status !== "approved" && (
                                      <div>
                                        <Button
                                          onClick={() => {
                                            handleApproveReview(review.id)
                                            setModerationNote("")
                                          }}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <Check className="h-4 w-4 mr-2" />
                                          Aprobar
                                        </Button>
                                      </div>
                                    )}
                                    {review.status !== "rejected" && (
                                      <div>
                                        <Button
                                          variant="destructive"
                                          onClick={() => {
                                            handleRejectReview(review.id)
                                            setModerationNote("")
                                          }}
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Rechazar
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{review.comment}</p>
                    <div className="flex items-center justify-between text-sm ">
                      <div className="flex space-x-2">
                        {review.status !== "approved" && (
                          <div>
                            <Button
                              size="sm"
                              onClick={() => handleApproveReview(review.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Aprobar
                            </Button>
                          </div>
                        )}
                        {review.status !== "rejected" && (
                          <div>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectReview(review.id)}>
                              <X className="h-3 w-3 mr-1" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
