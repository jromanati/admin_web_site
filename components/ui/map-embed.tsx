"use client"

import { useState, useEffect } from "react"
import { MapPin, Copy, Check, Search } from "lucide-react"

interface MapEmbedProps {
  value?: string
  onChange: (src: string) => void
}

const MapEmbed = ({ value, onChange }: MapEmbedProps) => {
  const [iframeCode, setIframeCode] = useState("")
  const [searchAddress, setSearchAddress] = useState("")
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
      if (value) {
        setShowPreview(true);
      }
  }, [])

  // Extraer src del código iframe
  const extractSrcFromIframe = (iframeHtml: string) => {
    const srcMatch = iframeHtml.match(/src="([^"]*)"/)
    return srcMatch ? srcMatch[1] : ""
  }

  // Manejar pegado del código iframe
  const handleIframeCodeChange = (code: string) => {
    setIframeCode(code)
    const extractedSrc = extractSrcFromIframe(code)
    if (extractedSrc) {
      onChange(extractedSrc)
      setShowPreview(true)
    }
  }

  // Generar URL de Google Maps desde dirección
  const generateMapFromAddress = () => {
    if (!searchAddress.trim()) return

    // Crear URL básica de Google Maps embed
    const encodedAddress = encodeURIComponent(searchAddress)
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDaWxAug55TKlwNdYmnMIE-1RoSGiTi33E&q=${encodedAddress}`

    // Por ahora usamos una URL de ejemplo ya que necesitaríamos API key real
    const exampleUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3330.331042843777!2d-70.5832803!3d-33.4146127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662cf1860e0dbc5%3A0xd5a4f2b0e43417d5!2s${encodedAddress}!5e0!3m2!1ses!2scl!4v1758418630187!5m2!1ses!2scl`

    onChange(mapUrl)
    setShowPreview(true)
  }

  // Copiar al portapapeles
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda por dirección */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Search className="h-4 w-4 mr-2" />
          Buscar Ubicación
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Ej: Av. Apoquindo 4499, Las Condes, Santiago"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            onKeyPress={(e) => e.key === "Enter" && generateMapFromAddress()}
          />
          <button
            type="button"
            onClick={generateMapFromAddress}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Pegar código iframe */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Pegar Código de Google Maps
        </h4>
        <textarea
          value={iframeCode}
          onChange={(e) => handleIframeCodeChange(e.target.value)}
          placeholder="Pega aquí el código iframe completo de Google Maps..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Ve a Google Maps → Compartir → Insertar un mapa → Copia el código HTML
        </p>
      </div>

      {/* URL extraída */}
      {value && (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <h4 className="text-sm font-medium text-green-700 mb-2">URL del Mapa Extraída</h4>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm text-gray-600"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(value)}
              className="p-2 text-green-600 hover:text-green-700 focus:outline-none"
              title="Copiar URL"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Preview del mapa */}
      {value && showPreview && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Vista Previa del Mapa</h4>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showPreview ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {showPreview && (
            <div className="aspect-video w-full">
              <iframe
                src={value}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MapEmbed
