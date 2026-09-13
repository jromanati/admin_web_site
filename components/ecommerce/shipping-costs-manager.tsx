"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/services/auth.service"
import { ShippingCostsService } from "@/services/ecomerce/shipping-costs/shipping-costs.service"
import type { ShippingCost, ShippingCostInput, ShippingCostUpdateInput, ShippingCostCalculationResponse } from "@/types/ecomerces/shipping-costs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Plus, Search, Edit, Trash2, Calculator, AlertTriangle, ChevronsUpDown, Check } from "lucide-react"
import { regions, communes } from "@/data/adminData"

const emptyForm: ShippingCostInput = {
  city: "",
  region: "",
  zip_code: "",
  shipping_cost: 0,
  discount_threshold: 0,
  discount_percentage: 0,
  is_active: true,
}

export function ShippingCostsManager() {
  const { toast } = useToast()
  const [shippingCosts, setShippingCosts] = useState<ShippingCost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState<string>("all")

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [editingCost, setEditingCost] = useState<ShippingCost | null>(null)
  const [formData, setFormData] = useState<ShippingCostInput>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [regionOpen, setRegionOpen] = useState(false)
  const [comunaOpen, setComunaOpen] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [costToDelete, setCostToDelete] = useState<ShippingCost | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isCalculateDialogOpen, setIsCalculateDialogOpen] = useState(false)
  const [calculateForm, setCalculateForm] = useState({ city: "", region: "", order_total: 0 })
  const [calculateResult, setCalculateResult] = useState<ShippingCostCalculationResponse | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calcRegionOpen, setCalcRegionOpen] = useState(false)
  const [calcComunaOpen, setCalcComunaOpen] = useState(false)

  const loadShippingCosts = async () => {
    try {
      const isValid = AuthService.isTokenValid()
      if (!isValid) {
        const isRefreshValid = await AuthService.isRefreshTokenValid()
        if (!isRefreshValid) {
          window.location.href = "/"
          return
        }
      }
      const filters: { is_active?: boolean } = {}
      if (filterActive === "true") filters.is_active = true
      if (filterActive === "false") filters.is_active = false
      const response = await ShippingCostsService.getShippingCosts(filters)
      if (response.success && response.data) {
        setShippingCosts(response.data)
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudieron cargar los costos de envío",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading shipping costs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadShippingCosts()
  }, [filterActive])

  const filteredCosts = useMemo(() => {
    return shippingCosts.filter((cost) => {
      const term = searchTerm.toLowerCase()
      return (
        cost.city.toLowerCase().includes(term) ||
        cost.region.toLowerCase().includes(term) ||
        cost.zip_code.toLowerCase().includes(term)
      )
    })
  }, [shippingCosts, searchTerm])

  const openCreateDialog = () => {
    setEditingCost(null)
    setFormData(emptyForm)
    setIsFormDialogOpen(true)
  }

  const openEditDialog = (cost: ShippingCost) => {
    setEditingCost(cost)
    setFormData({
      city: cost.city,
      region: cost.region,
      zip_code: cost.zip_code,
      shipping_cost: cost.shipping_cost,
      discount_threshold: cost.discount_threshold,
      discount_percentage: cost.discount_percentage,
      is_active: cost.is_active,
    })
    setIsFormDialogOpen(true)
  }

  const handleFormChange = (field: keyof ShippingCostInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegionSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, region: value, city: "" }))
    setRegionOpen(false)
  }

  const handleComunaSelect = (value: string) => {
    handleFormChange("city", value)
    setComunaOpen(false)
  }

  const handleCalcRegionSelect = (value: string) => {
    setCalculateForm((prev) => ({ ...prev, region: value, city: "" }))
    setCalcRegionOpen(false)
  }

  const handleCalcComunaSelect = (value: string) => {
    setCalculateForm((prev) => ({ ...prev, city: value }))
    setCalcComunaOpen(false)
  }

  const validateForm = () => {
    if (!formData.city.trim()) return "La comuna es requerida"
    if (!formData.region.trim()) return "La región es requerida"
    if (!formData.zip_code.trim()) return "El código postal es requerido"
    if (formData.shipping_cost < 0) return "El costo de envío no puede ser negativo"
    if (formData.discount_threshold < 0) return "El umbral de descuento no puede ser negativo"
    if (formData.discount_percentage < 0 || formData.discount_percentage > 100) {
      return "El porcentaje de descuento debe estar entre 0 y 100"
    }
    return null
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const error = validateForm()
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" })
      return
    }
    setIsSaving(true)
    try {
      let response
      if (editingCost) {
        const updateData: ShippingCostUpdateInput = formData
        response = await ShippingCostsService.updateShippingCost(editingCost.id, updateData)
      } else {
        response = await ShippingCostsService.createShippingCost(formData)
      }
      if (response.success) {
        toast({
          title: "Éxito",
          description: editingCost ? "Costo de envío actualizado" : "Costo de envío creado",
        })
        setIsFormDialogOpen(false)
        await loadShippingCosts()
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo guardar el costo de envío",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving shipping cost:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (cost: ShippingCost) => {
    setCostToDelete(cost)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!costToDelete) return
    setIsDeleting(true)
    try {
      const response = await ShippingCostsService.deleteShippingCost(costToDelete.id)
      if (response.success) {
        toast({ title: "Éxito", description: "Costo de envío eliminado" })
        setIsDeleteDialogOpen(false)
        await loadShippingCosts()
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo eliminar el costo de envío",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting shipping cost:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!calculateForm.region.trim() || !calculateForm.city.trim()) {
      toast({ title: "Error", description: "Región y comuna son requeridas", variant: "destructive" })
      return
    }
    setIsCalculating(true)
    setCalculateResult(null)
    try {
      const response = await ShippingCostsService.calculateShippingCost({
        city: calculateForm.city,
        region: calculateForm.region,
        order_total: calculateForm.order_total,
      })
      if (response.success && response.data) {
        setCalculateResult(response.data as ShippingCostCalculationResponse)
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo calcular el costo de envío",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error calculating shipping cost:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(value)
  }

  return (
    <div className="min-h-screen bg-background">
      {isLoading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      )}
      <div className="border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:h-16 sm:items-center sm:justify-between py-3 sm:py-0">
            <div>
              <h1 className="text-xl font-semibold">Costos de Envío</h1>
              <p className="text-sm text-muted-foreground">Administra las reglas de costos de envío</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <div className="relative w-full sm:w-60">
                <Input
                  placeholder="Buscar ciudad, región o zip..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <Select value={filterActive} onValueChange={setFilterActive}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setIsCalculateDialogOpen(true)}>
                <Calculator className="h-4 w-4 mr-2" />
                Calcular
              </Button>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {filteredCosts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No hay costos de envío configurados.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2">Ciudad</th>
                    <th className="text-left px-4 py-2">Región</th>
                    <th className="text-left px-4 py-2">Código Postal</th>
                    <th className="text-left px-4 py-2">Costo</th>
                    <th className="text-left px-4 py-2">Umbral</th>
                    <th className="text-left px-4 py-2">Descuento</th>
                    <th className="text-left px-4 py-2">Estado</th>
                    <th className="text-right px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCosts.map((cost) => (
                    <tr key={cost.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{cost.city}</td>
                      <td className="px-4 py-3">{cost.region}</td>
                      <td className="px-4 py-3">{cost.zip_code}</td>
                      <td className="px-4 py-3">{formatCurrency(cost.shipping_cost)}</td>
                      <td className="px-4 py-3">{formatCurrency(cost.discount_threshold)}</td>
                      <td className="px-4 py-3">{cost.discount_percentage}%</td>
                      <td className="px-4 py-3">
                        <Badge variant={cost.is_active ? "default" : "secondary"}>
                          {cost.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(cost)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(cost)}>
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
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>{editingCost ? "Editar Costo de Envío" : "Nuevo Costo de Envío"}</DialogTitle>
            <DialogDescription>
              {editingCost ? "Modifica los datos de la regla de envío." : "Crea una nueva regla de envío."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Región</Label>
                <Popover open={regionOpen} onOpenChange={setRegionOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={regionOpen}
                      className="w-full justify-between"
                    >
                      {formData.region ? formData.region : "Seleccionar región..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar región..." />
                      <CommandList>
                        <CommandEmpty>No se encontró la región.</CommandEmpty>
                        <CommandGroup>
                          {regions.map((region) => (
                            <CommandItem
                              key={region}
                              value={region}
                              onSelect={() => handleRegionSelect(region)}
                            >
                              {region}
                              {formData.region === region && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Comuna</Label>
                <Popover open={comunaOpen} onOpenChange={setComunaOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comunaOpen}
                      className="w-full justify-between"
                      disabled={!formData.region}
                    >
                      {formData.city ? formData.city : "Seleccionar comuna..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar comuna..." />
                      <CommandList>
                        <CommandEmpty>
                          {!formData.region
                            ? "Selecciona una región primero"
                            : "No se encontró la comuna."}
                        </CommandEmpty>
                        <CommandGroup>
                          {(communes[formData.region] || []).map((comuna) => (
                            <CommandItem
                              key={comuna}
                              value={comuna}
                              onSelect={() => handleComunaSelect(comuna)}
                            >
                              {comuna}
                              {formData.city === comuna && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="zip_code">Código Postal</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => handleFormChange("zip_code", e.target.value)}
                  placeholder="8320000"
                />
              </div>
              <div>
                <Label htmlFor="shipping_cost">Costo de Envío</Label>
                <Input
                  id="shipping_cost"
                  type="number"
                  min={0}
                  value={formData.shipping_cost}
                  onChange={(e) => handleFormChange("shipping_cost", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="discount_threshold">Umbral de Descuento</Label>
                <Input
                  id="discount_threshold"
                  type="number"
                  min={0}
                  value={formData.discount_threshold}
                  onChange={(e) => handleFormChange("discount_threshold", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="discount_percentage">% Descuento</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.discount_percentage}
                  onChange={(e) => handleFormChange("discount_percentage", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleFormChange("is_active", checked)}
              />
              <Label htmlFor="is_active">Activo</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : editingCost ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Eliminar Costo de Envío
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar la regla para {costToDelete?.city} - {costToDelete?.region}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCalculateDialogOpen} onOpenChange={setIsCalculateDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calcular Costo de Envío
            </DialogTitle>
            <DialogDescription>
              Ingresa la ubicación y el total del pedido para calcular el envío.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCalculate} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Región</Label>
                <Popover open={calcRegionOpen} onOpenChange={setCalcRegionOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={calcRegionOpen}
                      className="w-full justify-between"
                    >
                      {calculateForm.region ? calculateForm.region : "Seleccionar región..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar región..." />
                      <CommandList>
                        <CommandEmpty>No se encontró la región.</CommandEmpty>
                        <CommandGroup>
                          {regions.map((region) => (
                            <CommandItem
                              key={region}
                              value={region}
                              onSelect={() => handleCalcRegionSelect(region)}
                            >
                              {region}
                              {calculateForm.region === region && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Comuna</Label>
                <Popover open={calcComunaOpen} onOpenChange={setCalcComunaOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={calcComunaOpen}
                      className="w-full justify-between"
                      disabled={!calculateForm.region}
                    >
                      {calculateForm.city ? calculateForm.city : "Seleccionar comuna..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar comuna..." />
                      <CommandList>
                        <CommandEmpty>
                          {!calculateForm.region
                            ? "Selecciona una región primero"
                            : "No se encontró la comuna."}
                        </CommandEmpty>
                        <CommandGroup>
                          {(communes[calculateForm.region] || []).map((comuna) => (
                            <CommandItem
                              key={comuna}
                              value={comuna}
                              onSelect={() => handleCalcComunaSelect(comuna)}
                            >
                              {comuna}
                              {calculateForm.city === comuna && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="calc-total">Total del Pedido</Label>
                <Input
                  id="calc-total"
                  type="number"
                  min={0}
                  value={calculateForm.order_total}
                  onChange={(e) => setCalculateForm((prev) => ({ ...prev, order_total: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            {calculateResult && (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Costo base</span>
                  <span className="font-medium">{formatCurrency(calculateResult.base_cost)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Descuento aplicado</span>
                  <span className="font-medium">{formatCurrency(calculateResult.discount_applied)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Costo final</span>
                  <span>{formatCurrency(calculateResult.shipping_cost)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Descuento del {calculateResult.discount_percentage}% sobre umbral de{" "}
                  {formatCurrency(calculateResult.discount_threshold)}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCalculateDialogOpen(false)}>
                Cerrar
              </Button>
              <Button type="submit" disabled={isCalculating}>
                {isCalculating ? "Calculando..." : "Calcular"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
