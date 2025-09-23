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
import { ArrowLeft, Eye, Search, Package, Truck, CheckCircle } from "lucide-react"

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  date: string
  items: OrderItem[]
  shippingAddress: string
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "María García",
    customerEmail: "maria@example.com",
    total: 89.99,
    status: "delivered",
    date: "2024-01-15",
    shippingAddress: "Calle Principal 123, Ciudad",
    items: [
      { id: "1", productName: "Camiseta Premium", quantity: 2, price: 29.99 },
      { id: "2", productName: "Jeans Clásicos", quantity: 1, price: 29.99 },
    ],
  },
  {
    id: "ORD-002",
    customerName: "Juan Pérez",
    customerEmail: "juan@example.com",
    total: 156.5,
    status: "processing",
    date: "2024-01-15",
    shippingAddress: "Avenida Central 456, Ciudad",
    items: [
      { id: "3", productName: "Zapatillas Deportivas", quantity: 1, price: 79.99 },
      { id: "4", productName: "Chaqueta de Cuero", quantity: 1, price: 76.51 },
    ],
  },
  {
    id: "ORD-003",
    customerName: "Ana López",
    customerEmail: "ana@example.com",
    total: 75.25,
    status: "shipped",
    date: "2024-01-14",
    shippingAddress: "Plaza Mayor 789, Ciudad",
    items: [
      { id: "5", productName: "Camiseta Premium", quantity: 1, price: 29.99 },
      { id: "6", productName: "Accesorios Varios", quantity: 3, price: 15.09 },
    ],
  },
  {
    id: "ORD-004",
    customerName: "Carlos Ruiz",
    customerEmail: "carlos@example.com",
    total: 203.8,
    status: "pending",
    date: "2024-01-14",
    shippingAddress: "Barrio Norte 321, Ciudad",
    items: [
      { id: "7", productName: "Chaqueta de Cuero", quantity: 1, price: 149.99 },
      { id: "8", productName: "Jeans Clásicos", quantity: 1, price: 53.81 },
    ],
  },
]

interface OrdersManagerProps {
  siteId: string
}

export function OrdersManager({ siteId }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || order.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(
      orders.map((order) => (order.id === orderId ? { ...order, status: newStatus as Order["status"] } : order)),
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendiente</Badge>
      case "processing":
        return <Badge variant="secondary">Procesando</Badge>
      case "shipped":
        return <Badge variant="default">Enviado</Badge>
      case "delivered":
        return (
          <Badge variant="default" className="bg-green-600">
            Entregado
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Package className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => (window.location.href = `/dashboard/ecommerce/${siteId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Gestión de Pedidos</h1>
                <p className="text-sm text-muted-foreground">Administra todos los pedidos de tu tienda</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedidos..."
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
            <option value="pending">Pendientes</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviados</option>
            <option value="delivered">Entregados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{order.id}</CardTitle>
                      <CardDescription>
                        {order.customerName} • {order.customerEmail}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">${order.total}</p>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                    </div>
                    {getStatusBadge(order.status)}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalles del Pedido {order.id}</DialogTitle>
                          <DialogDescription>Información completa del pedido</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Customer Info */}
                          <div>
                            <h3 className="font-semibold mb-2">Información del Cliente</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Nombre:</span>
                                <p>{order.customerName}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Email:</span>
                                <p>{order.customerEmail}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Dirección de envío:</span>
                                <p>{order.shippingAddress}</p>
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <h3 className="font-semibold mb-2">Productos</h3>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                                  <div>
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                                  </div>
                                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-border mt-2">
                              <span className="font-semibold">Total:</span>
                              <span className="font-bold text-lg">${order.total}</span>
                            </div>
                          </div>

                          {/* Status Management */}
                          <div>
                            <h3 className="font-semibold mb-2">Estado del Pedido</h3>
                            <div className="flex items-center space-x-2">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className="p-2 border border-border rounded-md bg-background"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="processing">Procesando</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Cancelado</option>
                              </select>
                              {getStatusBadge(order.status)}
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
                  <span className="text-muted-foreground">
                    {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-muted-foreground">Envío a: {order.shippingAddress}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
