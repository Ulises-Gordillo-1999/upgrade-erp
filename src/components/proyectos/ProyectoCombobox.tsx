"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronsUpDown, Check, X, Briefcase } from "lucide-react";

interface ProyectoItem {
  id: string;
  cliente_id?: string;
  estado?: string;
  notas_tecnicas?: string;
  total_estimado?: number;
  total_final?: number;
  cliente?: {
    id: string;
    nombre_razon_social: string;
    cuit_cuil?: string;
  };
  clientes?: {
    id: string;
    nombre_razon_social: string;
    cuit_cuil?: string;
  };
}

interface ProyectoComboboxProps {
  proyectos: ProyectoItem[];
  value?: string;
  onChange?: (proyectoId: string) => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ProyectoCombobox({
  proyectos = [],
  value = "",
  onChange,
  name = "proyecto_id",
  placeholder = "Seleccionar o buscar proyecto...",
  disabled = false,
}: ProyectoComboboxProps) {
  const [internalValue, setInternalValue] = useState<string>(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  const selectedProyecto = useMemo(() => {
    return proyectos.find((p) => p.id === internalValue) || null;
  }, [proyectos, internalValue]);

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

  // Auto-foco en el input de búsqueda
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  const normalize = (text: string) =>
    (text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const getClienteNombre = (p: ProyectoItem) => {
    return p.clientes?.nombre_razon_social || p.cliente?.nombre_razon_social || "Sin cliente";
  };

  const filteredProyectos = useMemo(() => {
    const q = normalize(search);
    if (!q) return proyectos;

    return proyectos.filter((p) => {
      const clienteNombre = normalize(getClienteNombre(p));
      const notas = normalize(p.notas_tecnicas || "");
      const estado = normalize(p.estado || "");
      const id = normalize(p.id);
      return clienteNombre.includes(q) || notas.includes(q) || estado.includes(q) || id.includes(q);
    });
  }, [proyectos, search]);

  const handleSelect = (id: string) => {
    setInternalValue(id);
    onChange?.(id);
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
      <input type="hidden" name={name} value={internalValue} />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
          isOpen
            ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-50 dark:bg-zinc-950"
            : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {selectedProyecto ? (
            <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
              <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm truncate">
                {getClienteNombre(selectedProyecto)}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono shrink-0">
                #{selectedProyecto.id.substring(0, 8)}
              </span>
              {selectedProyecto.total_final !== undefined && selectedProyecto.total_final !== null && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono shrink-0">
                  Total: ${Number(selectedProyecto.total_final).toLocaleString("es-AR")}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-500 dark:text-zinc-400 text-sm truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedProyecto && !disabled && (
            <span
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors"
              title="Desvincular proyecto"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronsUpDown className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
        </div>
      </button>

      {/* Menú Desplegable con Buscador */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header con Input de Búsqueda */}
          <div className="p-2.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por cliente, ID o notas..."
                className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-base sm:text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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
                {filteredProyectos.length} {filteredProyectos.length === 1 ? "proyecto" : "proyectos"}
              </span>
              {search && <span>Filtrando</span>}
            </div>
          </div>

          {/* Opción para Desvincular / General */}
          <div className="p-1 border-b border-slate-100 dark:border-zinc-900">
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer text-xs ${
                !internalValue
                  ? "bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-bold"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/60"
              }`}
            >
              <span>Ninguno (Gasto / Ingreso general)</span>
              {!internalValue && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </button>
          </div>

          {/* Lista de Resultados con Scroll Táctil */}
          <div className="max-h-60 sm:max-h-72 overflow-y-auto p-1.5 space-y-1">
            {filteredProyectos.length === 0 ? (
              <div className="py-6 px-4 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  No se encontraron proyectos
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                  No hay coincidencias para &quot;{search}&quot;.
                </p>
              </div>
            ) : (
              filteredProyectos.map((p) => {
                const isSelected = p.id === internalValue;
                const clienteNombre = getClienteNombre(p);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p.id)}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-zinc-900/80 text-slate-800 dark:text-zinc-200 border border-transparent"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-medium leading-tight">
                          {clienteNombre}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono">
                          #{p.id.substring(0, 8)}
                        </span>
                        {p.estado && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                            {p.estado.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-mono">
                        {p.total_final !== undefined && p.total_final !== null && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Total: ${Number(p.total_final).toLocaleString("es-AR")}
                          </span>
                        )}
                        {p.notas_tecnicas && (
                          <span className="truncate max-w-[200px] text-slate-400 font-sans">
                            {p.notas_tecnicas}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
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

