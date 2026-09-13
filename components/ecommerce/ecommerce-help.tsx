"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  LayoutDashboard,
  Tag,
  Palette,
  Package,
  Truck,
  Users,
  HelpCircle,
  BookOpen,
  AlertCircle,
} from "lucide-react"

const sections = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "1. Dashboard / Inicio",
    content: [
      {
        subtitle: "¿Qué es?",
        text: "Es la vista general de tu tienda. Aquí puedes ver de un vistazo la cantidad de productos, categorías y el uso de almacenamiento de imágenes.",
      },
      {
        subtitle: "Indicadores principales",
        text: "Total de productos, categorías creadas este mes y el estado de almacenamiento e imágenes. También se muestra el progreso de créditos.",
      },
      {
        subtitle: "Consejo",
        text: "Revisa regularmente el uso de almacenamiento para evitar que se acaben los créditos de imágenes.",
      },
    ],
  },
  {
    id: "categories",
    icon: Tag,
    title: "2. Categorías",
    content: [
      {
        subtitle: "¿Para qué sirve?",
        text: "Las categorías organizan tu catálogo de productos para que tus clientes puedan navegar más fácil. Un buen árbol de categorías mejora la experiencia de compra y ayuda a que los productos sean más fáciles de encontrar.",
      },
      {
        subtitle: "¿Qué puedes hacer?",
        text: "Crear categorías principales, agregar subcategorías, asignar un nombre, una descripción, una imagen destacada y definir si está activa o inactiva. También puedes editar, eliminar y reorganizar la jerarquía estableciendo una categoría padre.",
      },
      {
        subtitle: "Ejemplo de estructura",
        text: "Supongamos que vendes ropa. Podrías crear la categoría 'Ropa' y dentro de ella las subcategorías 'Hombre', 'Mujer' y 'Niños'. Cada una a su vez puede tener hijas como 'Poleras', 'Pantalones' o 'Zapatos'.",
      },
      {
        subtitle: "Importación masiva",
        text: "Si ya tienes una lista de categorías en Excel, descarga la plantilla, complétala con nombre, descripción, categoría padre y estado, guárdala como CSV delimitado por comas e impórtala. Es ideal cuando empiezas con muchas categorias.",
      },
      {
        subtitle: "Buenas prácticas",
        text: "Usa nombres claros, no crees demasiados niveles si no son necesarios y asigna una imagen representativa. Si una categoría aún no tiene productos, puedes dejarla inactiva hasta tenerlos disponibles.",
      },
    ],
  },
  {
    id: "brands",
    icon: Palette,
    title: "3. Marcas",
    content: [
      {
        subtitle: "Crear y editar marcas",
        text: "Ingresa el nombre, descripción, país, sitio web, email de contacto y logo. El slug se genera automáticamente a partir del nombre, pero puedes editarlo si es necesario.",
      },
      {
        subtitle: "Redes sociales",
        text: "Agrega enlaces a redes sociales como Instagram, Facebook, TikTok, YouTube, LinkedIn u otras. Marca una como principal si lo deseas.",
      },
      {
        subtitle: "Estado",
        text: "Cada marca puede estar activa o inactiva. Las inactivas no se mostrarán en la tienda.",
      },
    ],
  },
  {
    id: "products",
    icon: Package,
    title: "4. Productos",
    content: [
      {
        subtitle: "¿Para qué sirve?",
        text: "El catálogo de productos es el corazón de tu tienda online. Aquí creas, editas y organizas todo lo que tus clientes podrán comprar. Un producto bien configurado mejora la experiencia de compra y reduce consultas.",
      },
      {
        subtitle: "Información básica",
        text: "Nombre del producto: el título visible en la tienda. SKU: un código único interno. Descripción: texto que explica el producto. Precio original: precio de referencia para mostrar descuento. Precio: el valor final de venta. Stock: cantidad disponible. Cuando guardas el producto, queda activo por defecto y lo puedes desactivar después.",
      },
      {
        subtitle: "Especificaciones",
        text: "Permite agregar detalles técnicos como 'Material: Algodón', 'Peso: 250g' o 'Dimensiones: 30x20x5 cm'. Usa pares nombre/valor para que el cliente encuentre la información clara y ordenada.",
      },
      {
        subtitle: "Beneficios",
        module: "benefits",
        text: "Si tu plan lo incluye, puedes destacar ventajas del producto como 'Envío gratis', 'Garantía de 12 meses' o 'Devolución sin costo'. Esto ayuda a que el cliente tome la decisión de compra con mayor confianza.",
      },
      {
        subtitle: "Compatibilidad",
        module: "compatibility",
        text: "Si tu plan lo incluye, esta sección permite indicar con qué otros productos, modelos o accesorios es compatible. Útil para repuestos, accesorios o componentes que requieren combinación.",
      },
      {
        subtitle: "Marca",
        text: "Selecciona la marca del producto. Si aún no la has creado, debes hacerlo primero en la sección de Marcas. Asignar una marca mejora el filtrado y la confianza del cliente.",
      },
      {
        subtitle: "Categoría",
        text: "Elige la categoría a la que pertenece el producto. Esto determina en qué sección de la tienda se mostrará y es clave para que los clientes lo encuentren fácilmente.",
      },
      {
        subtitle: "Atributos",
        module: "attributes",
        text: "Si tu plan lo incluye, puedes asignar atributos como color, talla o material. Estos se crean previamente en el módulo de Atributos y permiten que el cliente filtre y elija variantes del producto.",
      },
      {
        subtitle: "Imágenes",
        text: "Sube una imagen principal que se verá en el catálogo y galería. También puedes agregar imágenes adicionales para mostrar diferentes ángulos o usos. Usa fotos claras, con buena iluminación y fondo neutro.",
      },
      {
        subtitle: "Importación masiva",
        text: "Si tienes muchos productos, descarga la plantilla de Excel, complétala con los campos solicitados y guárdala como CSV delimitado por comas. También puedes subir un archivo .zip con imágenes para importarlas masivamente.",
      },      
      {
        subtitle: "Buenas prácticas",
        text: "Usa fotos de calidad, descripciones claras, stock realista y SKUs únicos. Revisa el preview antes de publicar. Desactiva productos sin stock para evitar pedidos que no puedas cumplir.",
      },
      {
        subtitle: "Ejemplo de flujo",
        text: "Imagina que vendes una camiseta. Nombre: 'Camiseta Premium', SKU: 'CAM-001', precio original $19.990, precio $14.990, stock 50. Marca 'Camisetas Chilenas', categoría 'Ropa > Hombre > Poleras'. Especificaciones: 'Material: 100% Algodón', 'Peso: 250g'.",
      },
    ],
  },
  {
    id: "shipping",
    icon: Truck,
    title: "5. Costos de Envío",
    content: [
      {
        subtitle: "¿Para qué sirve?",
        text: "Permite cobrar un costo de envío ajustado según la ubicación del cliente y el monto de su compra. Puedes definir reglas por región y comuna, aplicar descuentos automáticos cuando el pedido supera cierto monto y simular el cálculo antes de publicar.",
      },
      {
        subtitle: "Cómo se configura una regla",
        text: "Región y comuna: definen dónde aplica. Código postal: opcional, para zonas más específicas. Costo base: valor normal del envío. Umbral de descuento: monto del pedido a partir del cual se aplica el descuento. Porcentaje: cuánto se descuenta del excedente. Activo: si la regla está vigente.",
      },
      {
        subtitle: "Cómo funciona el descuento",
        text: "Cuando el total del pedido supera el umbral, se descuenta un porcentaje de la diferencia. Ese descuento se descuenta del costo base. El costo final nunca es negativo y el descuento no puede superar el costo base.",
      },
      {
        subtitle: "Calculadora",
        text: "Usa la calculadora para probar cualquier combinación antes de configurarla en la tienda. Elige región y comuna, ingresa el total del pedido y revisa el costo base, el descuento aplicado y el costo final.",
      },
      {
        subtitle: "Ejemplo",
        text: "Configuras una regla para la Región Metropolitana y comuna Ñuñoa con costo base $5.000, umbral $10.000 y descuento 50%. Si un cliente compra una Camiseta Premium por $14.990, el excedente sobre el umbral es $4.990. El 50% es $2.495, por lo que el envío final queda aproximadamente $2.500.",
      },
      {
        subtitle: "Buenas prácticas",
        text: "Usa reglas claras por región, revisa frecuentemente los costos reales del transporte y evita sobrecargar el envío. La calculadora te ayuda a probar que el descuento se aplique correctamente antes de publicar.",
      },
    ],
  },
  {
    id: "users",
    icon: Users,
    title: "6. Usuarios",
    content: [
      {
        subtitle: "Gestión de accesos",
        text: "Crea, edita y elimina usuarios del panel administrativo. Cada usuario tiene nombre, apellido, email, nombre de usuario y contraseña.",
      },
      {
        subtitle: "Roles",
        text: "Superusuario (Administrador): acceso completo. Usuario no superusuario (Editor): acceso limitado. Puedes activar o desactivar un usuario con el botón del ojo.",
      },
      {
        subtitle: "Búsqueda",
        text: "Filtra los usuarios por nombre o correo electrónico para encontrar rápidamente quién quieres editar.",
      },
    ],
  },
]

function ProductExample() {
  return (
    <Card className="mt-4 overflow-hidden border-dashed">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-64 md:h-auto min-h-[260px]">
          <img
            src="/camiseta_prueba.png"
            alt="Camiseta Premium"
            className="absolute inset-0 h-75 w-75 object-cover"
          />
        </div>
        <CardContent className="p-6 space-y-3 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">Camiseta Premium</h4>
            <Badge>Nuevo</Badge>
          </div>
          <p className="text-sm text-muted-foreground">SKU: CAM-001</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">$14.990</span>
            <span className="text-sm text-muted-foreground line-through">$19.990</span>
          </div>
          <p className="text-sm">Stock: 50 unidades</p>
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Especificaciones:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Material: 100% Algodón</li>
              <li>Peso: 250g</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">Marca: Camisetas Chilenas</p>
          <p className="text-xs text-muted-foreground">Categoría: Ropa &gt; Hombre &gt; Poleras</p>
        </CardContent>
      </div>
    </Card>
  )
}

function ShippingExample() {
  return (
    <Card className="mt-4 overflow-hidden border-dashed">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-64 md:h-auto min-h-[260px]">
          <img
            src="/camiseta_prueba.png"
            alt="Camiseta Premium"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <CardContent className="p-6 space-y-3 flex flex-col justify-center">
          <h4 className="font-semibold text-lg">Camiseta Premium</h4>
          <p className="text-sm text-muted-foreground">Precio: $14.990</p>
          <div className="rounded-lg border p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Región</span>
              <span className="font-medium">Metropolitana</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Comuna</span>
              <span className="font-medium">Ñuñoa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total del pedido</span>
              <span className="font-medium">$14.990</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo base de envío</span>
              <span className="font-medium">$5.000</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Descuento aplicado</span>
              <span className="font-medium">-$2.500</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span>Costo final de envío</span>
              <span>$2.500</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Umbral de $10.000 con 50% de descuento sobre el excedente.
          </p>
        </CardContent>
      </div>
    </Card>
  )
}

export function EcommerceHelp() {
  const [siteName, setSiteName] = useState("tu tienda")
  const [extrasModules, setExtrasModules] = useState<string[]>([])

  useEffect(() => {
    const rawClientData = localStorage.getItem("tenant_data")
    const clientData = rawClientData ? JSON.parse(rawClientData) : null
    if (clientData?.name) {
      setSiteName(clientData.name)
    }
    if (clientData?.extras_modules && Array.isArray(clientData.extras_modules)) {
      setExtrasModules(clientData.extras_modules)
    }
  }, [])

  const visibleSections = useMemo(() => {
    return sections
      .filter((section) => section.id !== "shipping" || extrasModules.includes("shippingcost"))
      .map((section) => {
        if (section.id === "products") {
          return {
            ...section,
            content: section.content.filter((item) => !item.module || extrasModules.includes(item.module)),
          }
        }
        return section
      })
  }, [extrasModules])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            Centro de Ayuda
          </h1>
          <p className="text-muted-foreground">
            Guía de uso del panel de administración.
          </p>
        </div>

        
        <Accordion type="single" collapsible defaultValue="dashboard" className="space-y-4">
          {visibleSections.map((section) => {
            const Icon = section.icon
            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border rounded-lg px-4 data-[state=open]:bg-card"
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {section.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-4">
                    {section.content.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <h4 className="font-medium text-sm">{item.subtitle}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                    {section.id === "products" && <ProductExample />}
                    {section.id === "shipping" && <ShippingExample />}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        <Card className="mt-12">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            ¿Necesitas más ayuda? Contacta al administrador del sistema o revisa la documentación técnica.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
