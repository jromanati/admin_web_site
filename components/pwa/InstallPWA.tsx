"use client";

import { useEffect, useState } from "react";

function isStandalone(): boolean {
  // Chrome/Edge/PWA instaladas
  const mq = window.matchMedia?.("(display-mode: standalone)")?.matches;
  // iOS Safari instalado
  // @ts-ignore
  const iosStandalone = typeof window.navigator.standalone === "boolean" && window.navigator.standalone;
  return Boolean(mq || iosStandalone);
}

function getUAFlags() {
  const ua = (typeof navigator !== "undefined" ? navigator.userAgent : "").toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua); // Safari real
  const isAndroid = /android/.test(ua);
  const isSafari = isIOS && /safari/.test(ua);
  const isChrome = /chrome/.test(ua) && !/edge|opr/.test(ua);
  return { isIOS, isAndroid, isSafari, isChrome };
}

export default function InstallPWA() {
  const [deferred, setDeferred] = useState<any>(null);
  const [canInstallPrompt, setCanInstallPrompt] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // ya instalada
    const { isIOS } = getUAFlags();

    // ANDROID: escucha beforeinstallprompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setCanInstallPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: sin prompt -> mostrar banner con guía si Safari y no instalada
    if (isIOS) {
      const shown = localStorage.getItem("iosA2HSShown") === "1";
      if (!shown) setShowIOSBanner(true);
    }

    // Ocultar cuando se instale
    const installedHandler = () => {
      setCanInstallPrompt(false);
      setShowIOSBanner(false);
      setDeferred(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const onInstallClick = async () => {
    if (!deferred) return;
    deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    setCanInstallPrompt(false);
    console.log("User choice:", choice);
  };

  const dismissIOS = () => {
    setShowIOSBanner(false);
    localStorage.setItem("iosA2HSShown", "1");
  };

  if (isStandalone()) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Android/Chrome: botón real de instalar */}
      {canInstallPrompt && (
        <button
          onClick={onInstallClick}
          className="rounded-xl border px-4 py-2 bg-white/80 backdrop-blur shadow hover:shadow-lg text-sm"
          aria-label="Instalar aplicación"
        >
          Instalar aplicación
        </button>
      )}

      {/* iOS/Safari: banner con instrucciones */}
      {showIOSBanner && (
        <div className="max-w-[320px] rounded-2xl border p-3 bg-white/90 backdrop-blur shadow text-sm">
          <div className="font-semibold mb-1">Instala esta app</div>
          <p className="text-gray-700">
            En iPhone/iPad abre en <strong>Safari</strong>, toca{" "}
            <span aria-label="compartir">el botón Compartir</span> y luego{" "}
            <strong>Añadir a pantalla de inicio</strong>.
          </p>
          <div className="flex justify-end mt-2">
            <button onClick={dismissIOS} className="text-xs text-gray-600 underline">
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
