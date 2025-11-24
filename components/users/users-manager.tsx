"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, ArrowLeft, Edit, Trash2, Shield, Eye, UserCheck, AlertTriangle } from "lucide-react"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { EditUserDialog } from "@/components/users/edit-user-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { UsersService } from "@/services/users.service"
import { AuthService } from "@/services/auth.service"
import useSWR, { mutate } from "swr"
import type {User} from "@/types/users"

interface UsersManagerProps {
  siteId: string
  siteType: "ecommerce" | "properties" | "excursions"
}

const mockUsers = [
  {
    id: "1",
    name: "Ana García",
    email: "ana@empresa.com",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-15",
    permissions: ["read", "write", "delete", "manage_users"],
  },
  {
    id: "2",
    name: "Carlos López",
    email: "carlos@empresa.com",
    role: "editor",
    status: "active",
    lastLogin: "2024-01-14",
    permissions: ["read", "write"],
  },
  {
    id: "3",
    name: "María Rodríguez",
    email: "maria@empresa.com",
    role: "viewer",
    status: "inactive",
    lastLogin: "2024-01-10",
    permissions: ["read"],
  },
  {
    id: "4",
    name: "Juan Pérez",
    email: "juan@empresa.com",
    role: "editor",
    status: "active",
    lastLogin: "2024-01-15",
    permissions: ["read", "write"],
  },
]

const roleLabels = {
  admin: "Administrador",
  editor: "Editor",
  viewer: "Visualizador",
}

const roleColors = {
  admin: "default",
  editor: "secondary",
  viewer: "outline",
} as const

const siteTypeLabels = {
  ecommerce: "Ecommerce",
  properties: "Propiedades",
  excursions: "Excursiones",
}

export function UsersManager({ siteId, siteType }: UsersManagerProps) {
  // const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [thirdBackgroundColor, setThirdBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const [placeholderStyle, setPlaceholderStyle] = useState("")
  const [isLoading, setisLoading] = useState(true)
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

  const fetchUsers = async () => {
    const isValid = AuthService.isTokenValid()
    if (!isValid) {
      const isRefreshValid = await AuthService.isRefreshTokenValid()
      if (!isRefreshValid)window.location.href = "/"
    }
    const categoriesResponse = await UsersService.getUsers()
    const fetchedUsers = categoriesResponse || []
    return fetchedUsers.map((user: any) => ({
      ...user,
    }))
  }
  const { data: users = [] } = useSWR('users', fetchUsers)


  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  // const handleDeleteUser = (userId: string) => {
  //   setUsers(users.filter((user) => user.id !== userId))
  // }
  
  // const getBackUrl = () => {
  //   return `/dashboard/${siteType}/${siteId}`
  // }

  const handleCreateUser = async (newUser:User) => {
    const response = await UsersService.createUser(newUser)

    if (response.success) {
      // mutate('categories', (current: User[] = []) => [...current, response.data], false)
      mutate('users', (current: User[] = []) => {
        const updated = [...current, response.data] // ejemplo crear
        localStorage.setItem("users", JSON.stringify(updated))
        return updated
      }, false)
    }
  }

  const handleUpdateUser = async (newUser:User, id:number) => {
    const userData = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      is_superuser: newUser.is_superuser,
      password: newUser.password
    }
    const response = await UsersService.updateUser(userData, id)

    if (response.success) {
      mutate('users', (current: User[] = []) => {
        const updated = current.map(cat =>
          cat.id === newUser.id ? response.data : cat
        )
        localStorage.setItem("users", JSON.stringify(updated))
        return updated
      }, false)
    }
    // resetForm()
    // setIsCreateDialogOpen(false)
  }

  const handleToggleStatus = async (id:number) => {
    const response = await UsersService.activeUser(id)
    if (response.success) {
      mutate('users', (current: User[] = []) => {
        const updated = current.map(cat =>
          cat.id === id ? response.data : cat
        )
        localStorage.setItem("users", JSON.stringify(updated))
        return updated
      }, false)
    }
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
  }
  
  const deleteUser = async (userId: number) => {
    const response = await UsersService.deleteUser(userId)

    if (response.success) {
      mutate('users', (current: User[] = []) => {
        const updated = current.filter(cat => cat.id !== Number(userId))
        localStorage.setItem("users", JSON.stringify(updated))
        return updated
      }, false)
    }
  }

  const confirmDeleteUser = () => {
    if (userToDelete) {
      //setCategories(categories.filter((cat) => cat.id !== userToDelete.id))
      setUserToDelete(null)
      deleteUser(userToDelete.id)
    }
  }

  return (
    <div className="min-h-screen bg-background">
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
                  <div className="flex items-center space-x-3">
                    <div>
                      <h1 className="text-xl font-semibold">Gestión de Usuarios</h1>
                      <p className="text-sm "> Administrar accesos</p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                  <Users className="h-4 w-4 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>

              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activos</CardTitle>
                  <UserCheck className="h-4 w-4 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.filter((u) => u.is_active).length}</div>
                </CardContent>
              </Card>

              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                  <Shield className="h-4 w-4 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.filter((u) => u.is_superuser ).length}</div>
                </CardContent>
              </Card>

              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Editores</CardTitle>
                  <Edit className="h-4 w-4 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.filter((u) => !u.is_superuser).length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className={`mb-6 ${secondBackgroundColor} ${principalText}`}>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 " />
                    <Input
                      placeholder="Buscar por nombre o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 ${placeholderStyle}`}
                    />
                  </div>
                  {/* <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="all">Todos los roles</option>
                    <option value="admin">Administradores</option>
                    <option value="editor">Editores</option>
                    <option value="viewer">Visualizadores</option>
                  </select> */}
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card className={`mb-6 ${secondBackgroundColor} ${principalText}`}>
              <CardHeader>
                <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
                <CardDescription className={`${principalText}`}>Gestiona los usuarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{user.first_name} {user.last_name}</p>
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                          <p className="text-sm ">{user.email}</p>
                          <p className="text-xs ">
                            Último acceso: {user.last_login ? user.last_login : "--"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* <Badge variant={roleColors[user.role as keyof typeof roleColors]}>
                          {roleLabels[user.role as keyof typeof roleLabels]}
                        </Badge> */}
                        <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}
                        className={`${principalHoverBackground}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user.id)}
                        className={`${principalHoverBackground}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className={`${principalHoverBackground}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <CreateUserDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onUserCreated={(newUser) => {
              handleCreateUser(newUser)
              setIsCreateDialogOpen(false)
            }}
            siteType={siteType}
          />

          {editingUser && (
            <EditUserDialog
              user={editingUser}
              open={!!editingUser}
              onOpenChange={(open) => !open && setEditingUser(null)}
              onUserUpdated={(updatedUser) => {
                // setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
                handleUpdateUser(updatedUser, updatedUser.id)
                setEditingUser(null)
              }}
              siteType={siteType}
            />
          )}
          {/* Dialog de confirmación para eliminar */}
          <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Confirmar Eliminación
                </DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar el usuaro "{userToDelete?.username}"?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Advertencia:</strong> Esta acción eliminará permanentemente
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUserToDelete(null)}
                className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                >
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={confirmDeleteUser}
                className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                >
                  Eliminar Usuario
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}
