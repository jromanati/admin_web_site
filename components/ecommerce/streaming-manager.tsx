"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  Video,
  Plus,
  Settings,
  CalendarIcon,
  Clock,
  Users,
  Eye,
  Edit,
  Play,
  MoreHorizontal,
  ExternalLink,
  DollarSign,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Trash2
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import type { StreamConfig, ScheduledStream, PastStream } from "@/types/ecomerces/streaming"
import { StreamConfigService } from "@/services/ecomerce/streaming/streaming.service"
import { AuthService } from "@/services/auth.service"
import useSWR, { mutate } from "swr"

interface StreamingManagerProps {
  siteId: string
}

export function StreamingManager({ siteId }: StreamingManagerProps) {
  const [activeTab, setActiveTab] = useState("config")
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isCreateHistoryDialogOpen, setIsCreateHistoryDialogOpen] = useState(false)
  const [editingStream, setEditingStream] = useState<PastStream | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [messageSuccessToast, setMessageSuccessToast] = useState("")
  const [editingScheduledStream, setEditScheduledStream] = useState<ScheduledStream | null>(null)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string | null>(null);
  const [scheduledStreams, setScheduledStreams] = useState<ScheduledStream[]>([])
  const [pastStreams, setPastStreams] = useState<PastStream[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [editingHistoryStream, setEditHistoryStream] = useState<ScheduledStream | null>(null)
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [thirdBackgroundColor, setThirdBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const [placeholderStyle, setPlaceholderStyle] = useState("")
  
  useEffect(() => {
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


  const handleSaveConfig = () => {
    setShowSuccessToast(true)
    setTimeout(() => {
      setShowSuccessToast(false)
    }, 5000)
  }

  const mapStream = (scheduled_stream: any) => {
    const parts = scheduled_stream.scheduled_date.split(",").map((p: string) => parseInt(p.trim(), 10))
    const [year, month, day, hour, minute] = parts

    return {
      ...scheduled_stream,
      scheduledDate: new Date(year, month - 1, day, hour, minute),
    }
  }
  const fetchedStreamConfig = async (): Promise<StreamConfig | null> => {
    const isValid = AuthService.isTokenValid()
    if (!isValid) {
      const isRefreshValid = await AuthService.isRefreshTokenValid()
      if (!isRefreshValid) window.location.href = "/"
    }
    const response = await StreamConfigService.getStreamConfig()
    const stream_config = response.stream_config_data
    setScheduledStreams(response.scheduled_stream_data.map(mapStream))
    setPastStreams(response.past_stream_data.map(mapStream))
    return stream_config
  }
  const { data: streamConfig, isLoading } = useSWR<StreamConfig | null>('streamConfig', fetchedStreamConfig)

  useEffect(() => {
    if (streamConfig) {
      setFormData({
        name: streamConfig.name ?? "",
        stream_url: streamConfig.stream_url ?? "",
        stream_key: streamConfig.stream_key ?? "",
        is_active: !!streamConfig.is_active,
      })
    }
  }, [streamConfig])

  const totalPages = Math.ceil(pastStreams.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStreams = pastStreams.slice(startIndex, startIndex + itemsPerPage)

  const totalPagesScheduled = Math.ceil(scheduledStreams.length / itemsPerPage)
  const startIndexScheduled = (currentPage - 1) * itemsPerPage
  const paginatedStreamsScheduled = scheduledStreams.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className={`${principalText}`}>Programado</Badge>
      case "live":
        return <Badge className={`${principalText}`}>En Vivo</Badge>
      case "completed":
        return <Badge variant="secondary" className={`${principalText}`}>Completado</Badge>
      case "cancelled":
        return <Badge variant="destructive" className={`${principalText}`}>Cancelado</Badge>
      default:
        return <Badge variant="outline" className={`${principalText}`}>{status}</Badge>
    }
  }

  // ENVIO FORMULARIO CONFIGURACION
  const [formData, setFormData] = useState({
    name: "",
    stream_url: "",
    stream_key: "",
    is_active: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const handlePostStreamConfig = async () => {
    if (isSaving) return // evita doble click
    setIsSaving(true)
    try {
      const formStreamConfig: StreamConfig = {
        id: streamConfig.id ?? 0,
        name: formData.name,
        stream_url: formData.stream_url,
        stream_key: formData.stream_key,
        is_active: true,
      }

      const response = await StreamConfigService.postStreamConfig(formStreamConfig)

      if (response.success) {
        setMessageSuccessToast("Configuración guardada")
        handleSaveConfig()
        mutate(
          "streamConfig",
          () => response.data as StreamConfig,
          false
        )
      } else {
        // opcional: manejar error
        // setMessageErrorToast("No se pudo guardar la configuración")
      }
    } catch (err) {
      // setMessageErrorToast("Error de red o servidor")
    } finally {
      setIsSaving(false)
    }
  }

  const formatDateForUI = (d: Date | string | number) => {
    return format(new Date(d), "PPP", { locale: es })
  }
  const formatHourForUI = (d: Date | string | number) => {
    return format(new Date(d), "HH:mm", { locale: es })
  }

  // IMAGEN
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMainImageFile(f);
    const url = URL.createObjectURL(f);
    setMainImagePreviewUrl(url);
  };
  const removeMainImage = () => {
    setMainImageFile(null);
    setMainImagePreviewUrl(null);
  };
  const combineDateAndTime = (date?: Date, time?: string): Date | null => {
    if (!date) return null
    const [hh = "00", mm = "00"] = (time || "00:00").split(":")
    const d = new Date(date) // clonar
    d.setHours(Number(hh), Number(mm), 0, 0)
    return d
  }
  const toLocalWithOffset = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0")
    const y = date.getFullYear()
    const m = pad(date.getMonth() + 1)
    const d = pad(date.getDate())
    const hh = pad(date.getHours())
    const mm = pad(date.getMinutes())
    const ss = pad(date.getSeconds())
    const off = -date.getTimezoneOffset() // min
    const sign = off >= 0 ? "+" : "-"
    const oh = pad(Math.floor(Math.abs(off) / 60))
    const om = pad(Math.abs(off) % 60)
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}${sign}${oh}:${om}`
  }
  
  const [formScheduledStreamData, setFormScheduledStreamData] = useState({
    title: "",
    description: "",
    scheduled_date: null as string | null, // ← será ISO string
    duration: 0,
    status: "",
    viewers: 0,
    time: "",
    stream_url:""
  })
  useEffect(() => {
    const combined = combineDateAndTime(selectedDate, formScheduledStreamData.time)
    // const iso = combined ? combined.toISOString() : null     // opción UTC
    const iso = combined ? toLocalWithOffset(combined) : null // opción con offset local
    setFormScheduledStreamData(prev => ({ ...prev, scheduled_date: iso }))
  }, [selectedDate, formScheduledStreamData.time])
  
  const [isSavingScheduledStream, setIsSavingScheduledStream] = useState(false)
    
  // RESETEO FORMULARIO PORGRAMACION
  const formScheduledStreamDataReset = () => {
    const scheduled_stream_reset: ScheduledStream = {
      title: "",
      description: "",
      scheduled_date: null as string | null, // ← será ISO string
      duration: 0,
      status: "",
      viewers: 0,
      time: "",
      stream_url:""
    }
    setErrorMessage(null);
    setFormScheduledStreamData(scheduled_stream_reset)
    setSelectedDate(undefined)   // 🔥 esto limpia el calendario
    removeMainImage()
    setEditScheduledStream(null);
  }
  const handleCreateScheduledStream = () => {
    formScheduledStreamDataReset();
    setIsScheduleDialogOpen(true);
  };

  function parseBackendScheduledDate(s?: string | null): Date | null {
    if (!s) return null;
    // acepta "2025, 09, 12, 20, 57" (con o sin espacios)
    const parts = s.split(",").map(p => parseInt(p.trim(), 10));
    if (parts.length < 3 || parts.some(Number.isNaN)) return null;
    const [year, month, day, hour = 0, minute = 0] = parts;
    // JS Date: mes 0-based
    return new Date(year, month - 1, day, hour, minute, 0, 0);
  }
  function pad2(n: number) {
    return String(n).padStart(2, "0");
  }
  function toTimeHHMM(d: Date): string {
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }
  const upsertScheduledStream = (updated: ScheduledStream) => {
    setScheduledStreams(prev => {
      const exists = prev.some(stream => stream.id === updated.id)
      if (exists) {
        // reemplaza
        return prev.map(stream =>
          stream.id === updated.id ? updated : stream
        )
      } else {
        // agrega
        return [...prev, updated]
      }
    })
  }
  // ENVIO FORMULARIO PORGRAMACION
  const handleScheduledStreamSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSavingScheduledStream) return // evita doble click
    // setIsSavingScheduledStream(true)
    const scheduled_stream: ScheduledStream = {
      title: formScheduledStreamData.title,
      description: formScheduledStreamData.description,
      scheduled_date: formScheduledStreamData.scheduled_date,
      duration: formScheduledStreamData.duration,
      main_image: mainImageFile || null,
    }
    if (editingScheduledStream?.id) {
      scheduled_stream.id = editingScheduledStream.id;
    }
    const res = await StreamConfigService.postScheduledStream(scheduled_stream)
    if (res.success && res.data) {
      upsertScheduledStream(mapStream(res.data))
      setIsSavingScheduledStream(false)
      setIsScheduleDialogOpen(false)
      setMessageSuccessToast("Programación guardada")
      handleSaveConfig()
      formScheduledStreamDataReset()
    } else {
      alert("Error al crear producto")
    }
  }
  
  const handleEditScheduledStream = (stream: ScheduledStream) => {
    setEditScheduledStream(stream)
    const dateFromSnake = parseBackendScheduledDate((stream as any).scheduled_date);
    const dateFromCamel = (stream as any).scheduledDate
      ? new Date((stream as any).scheduledDate)
      : null;
    const d = dateFromSnake ?? dateFromCamel; // el que exista
    const timeStr = d ? toTimeHHMM(d) : (stream as any).time ?? "";
    setFormScheduledStreamData(
      {
        title: stream.title ?? "",
        description: stream.description ?? "",
        duration: Number(stream.duration) || 0,
        time: timeStr,
        scheduled_date: d ? d.toISOString() : null, // opcional para submit
      }
    );
    setSelectedDate(d ?? undefined);
    const urlFromBack =
      (stream as any).url || (stream as any).imageUrl || (stream as any).mainImageUrl || null;
    setMainImageFile(null);
    setMainImagePreviewUrl(urlFromBack);
    setIsScheduleDialogOpen(true);
  };

  // DELETE
  const [scheduledStreamToDelete, setScheduledStreamToDelete] = useState<ScheduledStream | null>(null)
  const handleScheduledStreamToDelete = (scheduled_stream: ScheduledStream) => {
    setScheduledStreamToDelete(scheduled_stream)
  }
  const confirmDeleteScheduledStream = () => {
    if (scheduledStreamToDelete) {
      setScheduledStreamToDelete(null)
      deleteScheduledStream(scheduledStreamToDelete.id)
    }
  }
  const deleteScheduledStream = async (scheduledStreamId: number) => {
    const response = await StreamConfigService.deleteScheduledStream(scheduledStreamId)
    if (response.success) {
      setScheduledStreams(prev =>
        prev.filter(stream => stream.id !== scheduledStreamId)
      )
    }
  }

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  function isPastDate(dateStr: string): boolean {
    const date = new Date(dateStr)
    const now = new Date()
    return date.getTime() < now.getTime()
  }
  function isValidHttpUrl(value: string): boolean {
    if (!value) return false
    try {
      const u = new URL(value)
      return u.protocol === "http:" || u.protocol === "https:"
    } catch {
      return false
    }
  }
  const upsertHistoryStream = (updated: PastStream) => {
    setPastStreams(prev => {
      const exists = prev.some(stream => stream.id === updated.id)
      if (exists) {
        return prev.map(stream =>
          stream.id === updated.id ? updated : stream
        )
      } else {
        return [...prev, updated]
      }
    })
  }

  const handleCreateHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSavingScheduledStream) return // evita doble click
    setErrorMessage(null)
    if (!isPastDate(formScheduledStreamData.scheduled_date)) {
      setErrorMessage("La fecha debe ser pasada")
      return
    }
    if (!formScheduledStreamData.scheduled_date) {
      setErrorMessage("Debe indicar fecha y hora de la transmisión")
      return
    }
    if (!isValidHttpUrl(formScheduledStreamData.stream_url)) {
      setErrorMessage("Ingresa una URL válida (http/https)")
      return
    }
    setIsSavingScheduledStream(true)
    const scheduled_stream: ScheduledStream = {
      title: formScheduledStreamData.title,
      description: formScheduledStreamData.description,
      scheduled_date: formScheduledStreamData.scheduled_date,
      duration: formScheduledStreamData.duration,
      stream_url: formScheduledStreamData.stream_url,
      viewers: formScheduledStreamData.viewers,
      main_image: mainImageFile || null,
      status: "completed"
    }
    if (editingScheduledStream?.id) {
      scheduled_stream.id = editingScheduledStream.id;
    }
    const res = await StreamConfigService.postScheduledStream(scheduled_stream)
    if (res.success && res.data) {
      upsertHistoryStream(mapStream(res.data))
      setIsSavingScheduledStream(false)
      setIsHistoryDialogOpen(false)
      setMessageSuccessToast("Transmisión historica guardada")
      handleSaveConfig()
      formScheduledStreamDataReset()
    } else {
      alert("Error al crear producto")
    }
  }

  const handleCreateHistoryStream = () => {
    setIsSavingScheduledStream(false);
    formScheduledStreamDataReset();
    setIsHistoryDialogOpen(true);
  };

  const handleEditHistoryStream = (stream: ScheduledStream) => {
    setEditScheduledStream(stream)
    const dateFromSnake = parseBackendScheduledDate((stream as any).scheduled_date);
    const dateFromCamel = (stream as any).scheduledDate
      ? new Date((stream as any).scheduledDate)
      : null;
    const d = dateFromSnake ?? dateFromCamel; // el que exista
    const timeStr = d ? toTimeHHMM(d) : (stream as any).time ?? "";
    setFormScheduledStreamData(
      {
        title: stream.title ?? "",
        description: stream.description ?? "",
        duration: Number(stream.duration) || 0,
        time: timeStr,
        scheduled_date: d ? d.toISOString() : null, // opcional para submit
        stream_url: stream.stream_url ?? "",
        viewers: stream.viewers ?? "",
      }
    );
    setSelectedDate(d ?? undefined);
    const urlFromBack =
      (stream as any).url || (stream as any).imageUrl || (stream as any).mainImageUrl || null;
    setMainImageFile(null);
    setMainImagePreviewUrl(urlFromBack);
    setIsHistoryDialogOpen(true);
  };

  const handleEditStream = (stream: PastStream) => {
    setEditingStream(stream)
    setIsHistoryDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
       {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-white border border-green-200 shadow-lg rounded-lg p-4 flex items-center gap-3 min-w-[300px]">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{messageSuccessToast}</p>
              <p className="text-xs text-gray-500">Los cambios se aplicaron exitosamente</p>
            </div>
          </div>
        </div>
      )}
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
                  <h1 className="text-xl font-semibold ">Gestión de Streaming</h1>
                  <p className="text-sm ">Administra tus transmisiones en vivo</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <Dialog open={isCreateHistoryDialogOpen} onOpenChange={setIsCreateHistoryDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Transmisión al Historial</DialogTitle>
                <DialogDescription>Registra una nueva transmisión en el historial</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleCreateHistorySubmit(formData)
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="create-title">Título</Label>
                  <Input id="create-title" name="title" placeholder="Título de la transmisión" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-description">Descripción</Label>
                  <Textarea id="create-description" name="description" placeholder="Describe la transmisión..." required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-date">Fecha</Label>
                    <Input id="create-date" name="date" type="datetime-local" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-duration">Duración (min)</Label>
                    <Input id="create-duration" name="duration" type="number" placeholder="60" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-viewers">Espectadores</Label>
                    <Input id="create-viewers" name="viewers" type="number" placeholder="100" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-sales">Ventas ($)</Label>
                    <Input id="create-sales" name="sales" type="number" placeholder="1000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-stream-url">URL del Stream</Label>
                    <Input id="create-stream-url" name="stream_url" placeholder="https://..." required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-recording-url">URL de Grabación (opcional)</Label>
                  <Input id="create-recording-url" name="recordingUrl" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-image">Imagen de la transmisión</Label>
                  <div className="flex items-center gap-2">
                    <Input id="create-image" type="file" accept="image/*" className="flex-1" />
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Subir
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="create-active" name="is_active" />
                  <Label htmlFor="create-active">Transmisión activa</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateHistoryDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Agregar al Historial</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={!!scheduledStreamToDelete} onOpenChange={() => setScheduledStreamToDelete(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Confirmar Eliminación
                </DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar la transmisión: "{scheduledStreamToDelete?.title}"?
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
                <Button variant="outline" onClick={() => setScheduledStreamToDelete(null)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={confirmDeleteScheduledStream}>
                  Eliminar Transmisión
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Programar Nueva Transmisión</DialogTitle>
                <DialogDescription>Configura una nueva transmisión en vivo</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleScheduledStreamSubmit} className="space-y-8">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stream-title">Título</Label>
                      <Input
                        id="stream-title" placeholder="Título de la transmisión"
                        value={formScheduledStreamData.title}
                        onChange={(e) => setFormScheduledStreamData({ ...formScheduledStreamData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stream-duration">Duración (minutos)</Label>
                      <Input
                        id="stream-duration"
                        type="number"
                        placeholder="60"
                        value={formScheduledStreamData.duration}
                        onChange={(e) =>
                          setFormScheduledStreamData(prev => ({ ...prev, duration: Number(e.target.value || 0) }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stream-description">Descripción</Label>
                    <Textarea id="stream-description" placeholder="Describe tu transmisión..."
                    value={formScheduledStreamData.description}
                    onChange={(e) => setFormScheduledStreamData({ ...formScheduledStreamData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stream-time">Hora</Label>
                      <Input
                          id="stream-time"
                          type="time"
                          value={formScheduledStreamData.time}
                          onChange={(e) =>
                            setFormScheduledStreamData(prev => ({ ...prev, time: e.target.value }))
                          }
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stream-image">Imagen de la transmisión</Label>
                    <input
                      id="main-image"
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      className="hidden"
                    />
                    {!mainImagePreviewUrl? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("main-image")?.click()}
                        className="w-full h-40 border-dashed"
                      >
                        <div className="text-center">
                          <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Haz clic para subir la imagen principal</p>
                        </div>
                      </Button>
                    ) : (
                      <div className="relative w-full h-40">
                        <img
                          src={mainImagePreviewUrl}
                          alt="Imagen principal"
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={removeMainImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)} type="button">
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSavingScheduledStream}
                      aria-busy={isSavingScheduledStream}
                    >
                      Programar
                    </Button>
                  </div>
                </div>
                </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Transmisión al Historial</DialogTitle>
                <DialogDescription>Registra una nueva transmisión en el historial</DialogDescription>
              </DialogHeader>
              {errorMessage && (
                <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
              )}
              <form onSubmit={handleCreateHistorySubmit} className="space-y-8">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stream-title">Título</Label>
                      <Input
                        required
                        id="stream-title" placeholder="Título de la transmisión"
                        value={formScheduledStreamData.title}
                        onChange={(e) => setFormScheduledStreamData({ ...formScheduledStreamData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stream-duration">Duración (minutos)</Label>
                      <Input
                        id="stream-duration"
                        type="number"
                        required
                        placeholder="60"
                        value={formScheduledStreamData.duration}
                        onChange={(e) =>
                          setFormScheduledStreamData(prev => ({ ...prev, duration: Number(e.target.value || 0) }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stream-description">Descripción</Label>
                    <Textarea id="stream-description" placeholder="Describe tu transmisión..."
                    value={formScheduledStreamData.description}
                    onChange={(e) => setFormScheduledStreamData({ ...formScheduledStreamData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stream-time">Hora</Label>
                      <Input
                          id="stream-time"
                          type="time"
                          value={formScheduledStreamData.time}
                          onChange={(e) =>
                            setFormScheduledStreamData(prev => ({ ...prev, time: e.target.value }))
                          }
                        />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-stream-url">URL del Stream</Label>
                      <Input
                        id="create-stream-url"
                        name="stream_url"
                        placeholder="https://..."
                        required
                        value={formScheduledStreamData.stream_url}
                        onChange={(e) => setFormScheduledStreamData({ ...formScheduledStreamData, stream_url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-viewers">Espectadores</Label>
                      <Input
                        id="create-viewers" name="viewers" type="number" placeholder="100" required
                        value={formScheduledStreamData.viewers}
                        onChange={(e) => setFormScheduledStreamData({ ...formScheduledStreamData, viewers: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stream-image">Imagen de la transmisión</Label>
                    <input
                      id="main-image"
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      className="hidden"
                    />
                    {!mainImagePreviewUrl? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("main-image")?.click()}
                        className="w-full h-40 border-dashed"
                      >
                        <div className="text-center">
                          <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Haz clic para subir la imagen principal</p>
                        </div>
                      </Button>
                    ) : (
                      <div className="relative w-full h-40">
                        <img
                          src={mainImagePreviewUrl}
                          alt="Imagen principal"
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={removeMainImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)} type="button">
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSavingScheduledStream}
                      aria-busy={isSavingScheduledStream}
                    >
                      Agregar al Historial
                    </Button>
                  </div>
                </div>
                </form>
            </DialogContent>
          </Dialog>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuración</TabsTrigger>
              <TabsTrigger value="scheduled">Programadas</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-6">
              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración del Streaming
                  </CardTitle>
                  <CardDescription className={`${principalText}`}>
                    Configura la URL y clave de tu servicio de streaming
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stream-name">Nombre del Stream</Label>
                      <Input
                        id="stream-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    {/* <div className="space-y-2">
                      <Label>Estado</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant={streamConfig.is_active ? "default" : "secondary"}>
                          {streamConfig.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          // onClick={() => setStreamConfig({ ...streamConfig, is_active: !streamConfig.is_active })}
                          className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                        >
                          {streamConfig.is_active ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                    </div> */}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stream-url">URL del Streaming (RTMP)</Label>
                    <Input
                      id="stream-url"
                      value={formData.stream_url}
                      onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                      placeholder="rtmp://live.example.com/live"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stream-key">Clave del Stream</Label>
                    <Input
                      id="stream-key"
                      value={formData.stream_key}
                      placeholder="sk_live_123456789"
                      onChange={(e) => setFormData({ ...formData, stream_key: e.target.value })}
                      // type="password"
                    />
                  </div>
                  {/* streamConfig */}
                  <Button
                    type="button"
                    onClick={handlePostStreamConfig}
                    disabled={isSaving}
                    aria-busy={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Settings className="h-4 w-4 mr-2" />
                    )}

                    {streamConfig.id
                      ? (isSaving ? "Guardando..." : "Guardar Cambios")
                      : (isSaving ? "Creando..." : "Guardar Configuración")}
                  </Button>
                  
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-6">
              <div className="flex justify-between items-center">
                {scheduledStreams.length < 1 ? (
                  <div>
                    <h2 className="text-xl font-semibold">Programar Nueva Transmisión</h2>
                    <p className="text-muted-foreground">Configura una nueva transmisión en vivo</p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold">Futuras Transmisiones</h2>
                    <p className="text-muted-foreground">
                      Configura las futuras transmisiones en vivo
                    </p>
                  </div>
                )}
                <Button onClick={() => handleCreateScheduledStream()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Programar Stream
                </Button>
              </div>

              <div className="grid gap-4">
                {paginatedStreamsScheduled.map((stream) => (
                  <Card key={stream.id} className={`${secondBackgroundColor} ${principalText}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{stream.title}</h3>
                            {getStatusBadge(stream.status)}
                          </div>
                          <p className="">{stream.description}</p>
                          <div className="flex items-center gap-4 text-sm ">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {formatDateForUI(stream.scheduledDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {stream.duration} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {stream.viewers} espectadores
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditScheduledStream(stream)} className={`${secondHoverBackground} ${principalHoverText}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPagesScheduled > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndexScheduled + 1}-{Math.min(startIndexScheduled + itemsPerPage, scheduledStreams.length)} de{" "}
                    {scheduledStreams.length} transmisiones
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    {Array.from({ length: totalPagesScheduled }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPagesScheduled}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Historial de Transmisiones</h2>
                  <p className="text-muted-foreground">Gestiona las transmisiones anteriores</p>
                </div>
                <Button onClick={() => handleCreateHistoryStream()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar al Historial
                </Button>
              </div>

              <div className="grid gap-4">
                {paginatedStreams.map((stream) => (
                  <Card key={stream.id} className={`${secondBackgroundColor} ${principalText}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{stream.title}</h3>
                            {getStatusBadge(stream.status)}
                          </div>
                          <p className="">{stream.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {formatDateForUI(stream.scheduledDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {stream.duration} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {stream.viewers} espectadores
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditHistoryStream(stream)} className={`${secondHoverBackground} ${principalHoverText}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, pastStreams.length)} de{" "}
                    {pastStreams.length} transmisiones
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
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
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        </div>
      )}
    </div>
  )
}
