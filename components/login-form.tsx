"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { AuthService } from "@/services/auth.service"
import type { AuthCredentials, AuthResponse } from "@/types/auth"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  

  const users = {
    "ecommerce@admin.com": { password: "ecommerce123", type: "ecommerce", redirect: "/dashboard/ecommerce/1" },
    "propiedades@admin.com": { password: "propiedades123", type: "properties", redirect: "/dashboard/properties/1" },
    "excursiones@admin.com": { password: "excursiones123", type: "excursions", redirect: "/dashboard/excursions/1" },
  }
  const clients = {
    "ecomercer": "/dashboard/ecommerce",
    "properties": "/dashboard/properties",
    "excursions": "/dashboard/excursions",
  }
  useEffect(() => {
    localStorage.setItem("schema_name", "")
    localStorage.setItem("products", "")
    localStorage.setItem("categories", "")
    localStorage.setItem("features", "")
    localStorage.setItem("properties", "")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    const credentials: AuthCredentials = {
      username: email || "",
      password: password || "",
    }
    const response = await AuthService.authenticate(credentials)
    setTimeout(() => {
      const user = users[email as keyof typeof users]
      if (response.success) {
        const client_type = response.data?.tenant?.client_type || "ecommerce"
        const redirectUrl = clients[client_type] || "/dashboard/ecommerce"
        // Store user type in localStorage for future use
        localStorage.setItem("userType", client_type)
        localStorage.setItem("userEmail", response.data.user.email || email)
        // Redirect to specific dashboard
        window.location.href = redirectUrl || "/dashboard/ecommerce/1"
      } else {
        setError("Credenciales incorrectas. Verifica el usuario y contraseña.")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para acceder al panel de administración
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="text"
                placeholder="ecommerce@admin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        {/* <div className="mt-6 space-y-3 text-center text-sm text-muted-foreground">
          <p className="font-medium">Credenciales de prueba:</p>
          <div className="space-y-2">
            <div className="p-2 bg-muted rounded">
              <p className="font-medium text-foreground">Ecommerce</p>
              <p>Email: ecommerce@admin.com</p>
              <p>Contraseña: ecommerce123</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <p className="font-medium text-foreground">Propiedades</p>
              <p>Email: propiedades@admin.com</p>
              <p>Contraseña: propiedades123</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <p className="font-medium text-foreground">Excursiones</p>
              <p>Email: excursiones@admin.com</p>
              <p>Contraseña: excursiones123</p>
            </div>
          </div>
        </div> */}
      </CardContent>
    </Card>
  )
}
