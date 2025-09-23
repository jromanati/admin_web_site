"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserCreated: (user: any) => void
  siteType: "ecommerce" | "properties" | "excursions"
}

const permissions = {
  ecommerce: [
    { id: "read", label: "Ver productos y pedidos" },
    { id: "write", label: "Crear y editar productos" },
    { id: "delete", label: "Eliminar productos" },
    { id: "manage_orders", label: "Gestionar pedidos" },
    { id: "manage_users", label: "Gestionar usuarios" },
  ],
  properties: [
    { id: "read", label: "Ver propiedades" },
    { id: "write", label: "Crear y editar propiedades" },
    { id: "delete", label: "Eliminar propiedades" },
    { id: "manage_sales", label: "Gestionar ventas" },
    { id: "manage_users", label: "Gestionar usuarios" },
  ],
  excursions: [
    { id: "read", label: "Ver excursiones" },
    { id: "write", label: "Crear y editar excursiones" },
    { id: "delete", label: "Eliminar excursiones" },
    { id: "manage_bookings", label: "Gestionar reservas" },
    { id: "manage_users", label: "Gestionar usuarios" },
  ],
}

export function CreateUserDialog({ open, onOpenChange, onUserCreated, siteType }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    role: "viewer",
    permissions: [] as string[],
  })

  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("Debe tener al menos 8 caracteres")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Debe contener al menos una mayúscula")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Debe contener al menos una minúscula")
    }
    if (!/\d/.test(password)) {
      errors.push("Debe contener al menos un número")
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Debe contener al menos un carácter especial")
    }

    return errors
  }

  const handlePasswordChange = (password: string) => {
    setFormData((prev) => ({ ...prev, password }))
    setPasswordErrors(validatePassword(password))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validatePassword(formData.password)
    if (errors.length > 0) {
      setPasswordErrors(errors)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    onUserCreated({
      ...formData,
      status: "active",
      lastLogin: new Date().toISOString().split("T")[0],
    })
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      role: "viewer",
      permissions: [],
    })
    setPasswordErrors([])
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, permissionId],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => p !== permissionId),
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>Agrega un nuevo usuario al sistema con los permisos correspondientes.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nombre</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Apellido</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nombre de Usuario</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="usuario123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
            />
            {formData.password && (
              <div className="space-y-1">
                {passwordErrors.length > 0 ? (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        {passwordErrors.map((error, index) => (
                          <li key={index} className="text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700">Contraseña segura</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />
            {formData.confirmPassword && (
              <div className="mt-1">
                {formData.password === formData.confirmPassword ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Las contraseñas coinciden</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">Las contraseñas no coinciden</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div key="is_superuser" className="flex items-center space-x-2">
              <Checkbox
                id="is_superuser"
                // checked={formData.permissions.includes(permission.id)}
                // onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
              />
              <Label htmlFor="is_superuser" className="text-sm">
                Es super usuario
              </Label>
            </div>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="viewer">Visualizador</option>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Permisos</Label>
            <div className="space-y-2">
              {permissions[siteType].map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission.id}
                    checked={formData.permissions.includes(permission.id)}
                    onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                  />
                  <Label htmlFor={permission.id} className="text-sm">
                    {permission.label}
                  </Label>
                </div>
              ))}
            </div>
          </div> */}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={passwordErrors.length > 0 || formData.password !== formData.confirmPassword}
            >
              Crear Usuario
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
