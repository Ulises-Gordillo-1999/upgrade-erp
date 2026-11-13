"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronsUpDown, Check, X, Building2, Phone } from "lucide-react";
import { Cliente } from "@/types/database";

interface ClienteComboboxProps {
  clientes: Cliente[];
  defaultValue?: string;
  value?: string;
  onChange?: (clienteId: string) => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ClienteCombobox({
  clientes = [],
  defaultValue = "",
  value,
  onChange,
  name = "cliente_id",
  required = false,
  placeholder = "Buscar y seleccionar cliente...",
  disabled = false,
}: ClienteComboboxProps) {
  const [internalValue, setInternalValue] = useState<string>(value ?? defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar si cambia la prop value externamente
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const selectedCliente = useMemo(() => {
    return clientes.find((c) => c.id === internalValue) || null;
  }, [clientes, internalValue]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Enfocar el input de búsqueda automáticamente al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  // Normalizador para búsqueda insensible a acentos y mayúsculas
  const normalize = (text: string) =>
    (text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // Filtrado reactivo en tiempo real
  const filteredClientes = useMemo(() => {
    const q = normalize(search);
    if (!q) return clientes;

    return clientes.filter((c) => {
      const nombre = normalize(c.nombre_razon_social);
      const cuit = normalize(c.cuit_cuil || "");
      const tel = normalize(c.telefono || "");
      const dir = normalize(c.direccion || "");
      return nombre.includes(q) || cuit.includes(q) || tel.includes(q) || dir.includes(q);
    });
  }, [clientes, search]);

  const handleSelect = (clienteId: string) => {
    setInternalValue(clienteId);
    onChange?.(clienteId);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalValue("");
    onChange?.("");
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Inputs para integración transparente con formularios y validación HTML5 */}
      <input type="hidden" name={name} value={internalValue} />
      <input
        type="text"
        className="sr-only"
        tabIndex={-1}
        required={required}
        value={internalValue}
        onChange={() => {}}
        onInvalid={(e) => {
          (e.target as HTMLInputElement).setCustomValidity("Por favor selecciona un cliente de la lista.");
        }}
        onInput={(e) => {
          (e.target as HTMLInputElement).setCustomValidity("");
        }}
        aria-hidden="true"
      />

      {/* Botón Disparador del Selector */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
          isOpen
            ? "border-cyan-500 ring-2 ring-cyan-500/20 bg-slate-50 dark:bg-zinc-950"
            : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Building2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          {selectedCliente ? (
            <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
              <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm truncate">
                {selectedCliente.nombre_razon_social}
              </span>
              {selectedCliente.cuit_cuil && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono shrink-0">
                  {selectedCliente.cuit_cuil}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 dark:text-zinc-500 text-sm truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedCliente && !disabled && (
            <span
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors"
              title="Quitar cliente seleccionado"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronsUpDown className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
        </div>
      </button>

      {/* Menú Desplegable con Buscador en Vivo */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Cabecera del Buscador */}
          <div className="p-2.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Escribe el nombre, CUIT o teléfono..."
                className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-base sm:text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false);
                  }
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between px-1 pt-2 text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
              <span>
                {filteredClientes.length} {filteredClientes.length === 1 ? "cliente" : "clientes"}
              </span>
              {search && <span>Filtro activo</span>}
            </div>
          </div>

          {/* Lista de Resultados con Scroll Táctil */}
          <div className="max-h-60 sm:max-h-72 overflow-y-auto p-1.5 space-y-1">
            {filteredClientes.length === 0 ? (
              <div className="py-6 px-4 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  No se encontraron clientes
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                  No hay coincidencias para &quot;{search}&quot;.
                </p>
              </div>
            ) : (
              filteredClientes.map((c) => {
                const isSelected = c.id === internalValue;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-900 dark:text-cyan-200 font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-zinc-900/80 text-slate-800 dark:text-zinc-200 border border-transparent"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-medium leading-tight">
                          {c.nombre_razon_social}
                        </span>
                        {c.cuit_cuil && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono">
                            {c.cuit_cuil}
                          </span>
                        )}
                        {c.condicion_iva && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                            {c.condicion_iva}
                          </span>
                        )}
                      </div>
                      {c.telefono && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.telefono}</span>
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

