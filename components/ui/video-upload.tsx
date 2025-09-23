"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Upload, Trash2 } from "lucide-react"

interface VideoUploadProps {
  value?: string
  onChange: (video: string | null) => void
  maxSize?: number // in MB
}

const VideoUpload = ({ value, onChange, maxSize = 150 }: VideoUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoValue, setvideoValue] = useState("")
  useEffect(() => {
    if (value) {
      setvideoValue(value)
    }
  }, [])

  const handleFileSelect = (file: File) => {
    setError(null)

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setError("Por favor selecciona un archivo de video válido")
      return
    }

    // Validate file size (convert MB to bytes)
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`El archivo es muy grande. Máximo ${maxSize}MB permitido`)
      return
    }

    // Create object URL for preview
    const videoUrl = URL.createObjectURL(file)
    setvideoValue(videoUrl)
    onChange(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeVideo = () => {
    if (videoValue) {
      URL.revokeObjectURL(videoValue)
    }
    onChange(null)
    setError(null)
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-4">
      {!value ? (
        <div
          className={`relative border-2 border-dashed rounded-lg transition-colors ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : error
                ? "border-red-300 bg-red-50"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`w-8 h-8 mb-4 ${error ? "text-red-500" : "text-gray-500"}`} />
              <p className={`mb-2 text-sm ${error ? "text-red-600" : "text-gray-500"}`}>
                <span className="font-semibold">Click para subir</span> o arrastra y suelta
              </p>
              <p className={`text-xs ${error ? "text-red-500" : "text-gray-500"}`}>MP4, MOV, AVI (MAX. {maxSize}MB)</p>
            </div>
            <input type="file" className="hidden" accept="video/*" onChange={handleFileInput} />
          </label>
        </div>
      ) : (
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <video src={videoValue || undefined} className="w-full h-48 object-cover" controls preload="metadata" />
          <button
            type="button"
            onClick={removeVideo}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}

export default VideoUpload
