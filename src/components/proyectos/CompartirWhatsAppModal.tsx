"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MessageCircle,
  Copy,
  Check,
  Send,
  X,
  Phone,
  FileText,
  ExternalLink,
  ShieldCheck,
  ListFilter,
} from "lucide-react";
import {
  sanitizeWhatsAppPhone,
  generateBudgetMessage,
  BudgetMessageData,
} from "@/utils/whatsapp";
import { registrarCompartirWhatsAppAction } from "@/app/actions/proyectos";

interface Props {
  proyecto: any;
  items?: any[];
  variant?: "button" | "icon";
}

export function CompartirWhatsAppModal({
  proyecto,
  items = [],
  variant = "button",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [incluirItems, setIncluirItems] = useState(true);

  const clienteNombre =
    proyecto.clientes?.nombre_razon_social ||
    proyecto.cliente?.nombre_razon_social ||
    "Cliente";

  const rawTelefonoInicial =
    proyecto.clientes?.telefono ||
    proyecto.cliente?.telefono ||
    "";

  const [telefono, setTelefono] = useState(rawTelefonoInicial);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincronizar teléfono cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setTelefono(rawTelefonoInicial);
      setCopied(false);
    }
  }, [isOpen, rawTelefonoInicial]);

  // Cerrar con Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Formatear ítems para el mensaje
  const itemsFormateados = useMemo(() => {
    if (!items || items.length === 0) return undefined;
    return items.map((i) => {
      const cant = Number(
        i.cantidad_real !== null && i.cantidad_real !== undefined
          ? i.cantidad_real
          : i.cantidad_estimada || 0
      );
      const precio = Number(i.precio_congelado || 0);
      return {
        cantidad: cant,
        nombre: i.inventario?.nombre || "Ítem",
        tipo: i.inventario?.tipo || "Insumo",
        precioUnitario: precio,
        subtotal: cant * precio,
      };
    });
  }, [items]);

  // Generar texto en vivo del mensaje
  const mensajeWhatsApp = useMemo(() => {
    const data: BudgetMessageData = {
      proyectoId: proyecto.id,
      clienteNombre,
      estado: proyecto.estado || "Borrador_Bot",
      totalEstimado: Number(proyecto.total_estimado || 0),
      totalFinal: Number(proyecto.total_final || 0),
      notasTecnicas: proyecto.notas_tecnicas,
      items: incluirItems ? itemsFormateados : undefined,
    };
    return generateBudgetMessage(data);
  }, [proyecto, clienteNombre, incluirItems, itemsFormateados]);

  // Teléfono sanitizado para wa.me
  const cleanPhone = useMemo(() => sanitizeWhatsAppPhone(telefono), [telefono]);

  // Copiar al portapapeles
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mensajeWhatsApp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Error al copiar texto:", err);
    }
  };

  // Abrir WhatsApp Web / App
  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(mensajeWhatsApp);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    // Registrar en auditoría
    registrarCompartirWhatsAppAction(
      proyecto.id,
      clienteNombre,
      cleanPhone || "Sin número (Selector de chat)"
    ).catch(() => {});

    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón Disparador */}
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="min-h-[36px] min-w-[36px] flex items-center justify-center p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
          title="Compartir presupuesto por WhatsApp"
          aria-label="Compartir por WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto min-h-[44px] sm:min-h-[38px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/20"
          title="Compartir cotización por WhatsApp al cliente"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span>Compartir WhatsApp</span>
        </button>
      )}

      {/* Modal Desacoplado con React Portal */}
      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del Modal */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-950/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                      Compartir por WhatsApp
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {clienteNombre} • COT-{proyecto.id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido / Cuerpo con Scroll */}
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                {/* Input de Teléfono Destino */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Teléfono de WhatsApp del Cliente
                    </span>
                    {cleanPhone && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        Destino: +{cleanPhone}
                      </span>
                    )}
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej: +54 9 383 4123456 o 3834123456"
                      className="w-full min-h-[44px] px-3.5 py-2 text-base sm:text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                    {cleanPhone
                      ? "Número normalizado con código de país para abrir el chat directo sin tener que agendar el contacto."
                      : "Si no ingresas un número, WhatsApp te permitirá seleccionar cualquier contacto o grupo al abrirse."}
                  </p>
                </div>

                {/* Switch de inclusión de desglose */}
                {items && items.length > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 text-xs">
                    <div className="flex items-center gap-2">
                      <ListFilter className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="font-medium text-slate-800 dark:text-zinc-200">
                        Incluir desglose de materiales y servicios
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incluirItems}
                        onChange={(e) => setIncluirItems(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500" />
                    </label>
                  </div>
                )}

                {/* Previsualización en Vivo estilo Burbuja de WhatsApp */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Previsualización del Mensaje
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar texto</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-slate-800 dark:text-zinc-200 text-xs font-mono leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-text selection:bg-emerald-500/30">
                    {mensajeWhatsApp}
                  </div>
                </div>
              </div>

              {/* Footer con Acciones */}
              <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="col-span-1 min-h-[44px] px-3 sm:px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="col-span-1 min-h-[44px] px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-950/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Abrir WhatsApp</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

