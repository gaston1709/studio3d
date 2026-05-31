"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ShippingOption {
  id: string;
  label: string;
  desc: string;
}

export default function PaymentSettingsPage() {
  const [alias, setAlias] = useState("");
  const [cbu, setCbu] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [machineHourRate, setMachineHourRate] = useState<string>("500");
  const [materialPricePerGram, setMaterialPricePerGram] = useState<string>("30");
  const [materialPrices, setMaterialPrices] = useState<Record<string, string>>({});
  const [materials, setMaterials] = useState<{ id: string; name: string; isActive: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Temporary state for adding a new shipping option
  const [newId, setNewId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const fetchSettings = async () => {
    try {
      const [settingsRes, materialsRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/materials")
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setAlias(data.paymentAlias || "");
        setCbu(data.paymentCbu || "");
        setShippingOptions(data.shippingOptions || []);
        if (data.machineHourRate !== undefined) setMachineHourRate(String(data.machineHourRate));
        if (data.materialPricePerGram !== undefined) setMaterialPricePerGram(String(data.materialPricePerGram));
        
        const pricesObj: Record<string, string> = {};
        if (data.materialPrices) {
          Object.entries(data.materialPrices).forEach(([k, v]) => {
            pricesObj[k] = String(v);
          });
        }
        setMaterialPrices(pricesObj);
      }

      if (materialsRes.ok) {
        const materialsData = await materialsRes.json();
        setMaterials(materialsData || []);
      }
    } catch (err) {
      console.error("Error fetching settings and materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchSettings();
    }, 0);
  }, []);

  const handleAddShippingOption = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      alert("La etiqueta de la dirección es requerida.");
      return;
    }

    // Auto generate id if empty
    const idToUse = newId.trim() || `point_${Date.now()}`;
    
    // Check duplicates
    if (shippingOptions.some(opt => opt.id === idToUse)) {
      alert("Ya existe una opción con ese ID técnico.");
      return;
    }

    const newOption: ShippingOption = {
      id: idToUse,
      label: newLabel.trim(),
      desc: newDesc.trim() || "Sin costo adicional",
    };

    setShippingOptions([...shippingOptions, newOption]);
    setNewId("");
    setNewLabel("");
    setNewDesc("");
  };

  const handleRemoveShippingOption = (id: string) => {
    setShippingOptions(shippingOptions.filter(opt => opt.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    const parsedPrices: Record<string, number> = {};
    Object.entries(materialPrices).forEach(([k, v]) => {
      if (v.trim() !== "") {
        parsedPrices[k] = parseFloat(v) || 0;
      }
    });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentAlias: alias,
          paymentCbu: cbu,
          shippingOptions: shippingOptions,
          machineHourRate: parseFloat(machineHourRate) || 0,
          materialPricePerGram: parseFloat(materialPricePerGram) || 0,
          materialPrices: parsedPrices,
        }),
      });

      if (res.ok) {
        setMessage("Configuración guardada correctamente");
        router.refresh();
      } else {
        setMessage("Error al guardar la configuración");
      }
    } catch {
      setMessage("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <span className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--amber)] animate-pulse">Sincronizando...</span>
      </div>
    );
  }

  const labelClass = "mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]";
  const inputClass = "w-full px-4 py-3 border border-[var(--paper-line)] rounded-xl focus:border-[var(--amber)] outline-none text-[var(--ink)] bg-white/60 text-sm transition-colors placeholder:text-[var(--ink-soft)]/30";

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      {/* Header seam */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin" 
          className="bg-[var(--paper-line)]/50 p-2 rounded-full hover:bg-[var(--paper-line)] hover:scale-105 transition-all cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--ink)]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <div className="flex-1 flex items-center gap-4">
          <span className="layer-seam flex-grow" />
          <span className="seam-label whitespace-nowrap">— Control del Taller —</span>
          <span className="layer-seam flex-grow" />
        </div>
      </div>

      <div className="pb-4">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--ink)] tracking-tight">Configuración del Sistema</h1>
        <p className="mono text-[10px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mt-2">Parámetros de Cobro y Métodos de Retiro</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Sección 01: Configuración de Cobro */}
        <section className="bg-[var(--paper)] border border-[var(--paper-line)] p-8 md:p-10 rounded-2xl warm-shadow layer-press space-y-6">
          <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--amber)] flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--paper-line)]" /> 01 · Datos de Transferencia (Seña)
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Alias de Cobro</label>
              <input
                type="text"
                required
                value={alias}
                onChange={(e) => setAlias(e.target.value.toUpperCase())}
                placeholder="STUDIO3D.CBA"
                className={inputClass + " uppercase font-semibold"}
              />
              <p className="text-[9px] text-[var(--ink-soft)] mt-2 italic">Se mostrará al cliente en la pantalla de seña.</p>
            </div>

            <div>
              <label className={labelClass}>Número de CBU / CVU</label>
              <input
                type="text"
                required
                value={cbu}
                onChange={(e) => setCbu(e.target.value)}
                placeholder="0000000000000000000000"
                className={inputClass + " font-mono"}
              />
            </div>
          </div>
        </section>

        {/* Sección 02: Direcciones y Retiros */}
        <section className="bg-[var(--paper)] border border-[var(--paper-line)] p-8 md:p-10 rounded-2xl warm-shadow layer-press space-y-6">
          <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--amber)] flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--paper-line)]" /> 02 · Direcciones y Métodos de Retiro
          </h2>

          {/* List of current options */}
          <div className="space-y-3">
            <label className={labelClass}>Opciones Activas</label>
            {shippingOptions.length === 0 ? (
              <p className="text-xs text-[var(--ink-soft)] italic p-4 bg-white/40 border border-dashed border-[var(--paper-line)] rounded-xl text-center">No hay métodos de retiro configurados.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {shippingOptions.map((opt) => (
                  <div 
                    key={opt.id}
                    className="flex justify-between items-center p-4 border border-[var(--paper-line)] bg-white/60 rounded-xl hover:border-[var(--ink-soft)] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)]">{opt.label}</p>
                      <p className="text-xs text-[var(--ink-soft)] mt-0.5">{opt.desc}</p>
                      <span className="mono text-[7px] text-[var(--ink-soft)]/50 uppercase tracking-widest mt-1 block">ID: {opt.id}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveShippingOption(opt.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 text-xs mono uppercase tracking-wider cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add option fields */}
          <div className="pt-4 border-t border-[var(--paper-line)] space-y-4">
            <label className={labelClass}>Agregar Nueva Dirección / Método</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Etiqueta (ej: Punto Retiro: Centro)"
                  className={inputClass}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Descripción (ej: Zona Buen Pastor)"
                  className={inputClass}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  placeholder="ID técnico (opcional)"
                  className={inputClass + " font-mono"}
                />
                <button
                  type="button"
                  onClick={handleAddShippingOption}
                  className="bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--amber)] hover:text-[var(--graphite)] px-5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0"
                >
                  + Añadir
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 03: Parámetros de Cotización */}
        <section className="bg-[var(--paper)] border border-[var(--paper-line)] p-8 md:p-10 rounded-2xl warm-shadow layer-press space-y-6">
          <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--amber)] flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--paper-line)]" /> 03 · Parámetros de Cotización Automática
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Costo por Hora de Máquina ($/h)</label>
              <input
                type="number"
                step="any"
                required
                value={machineHourRate}
                onChange={(e) => setMachineHourRate(e.target.value)}
                placeholder="500"
                className={inputClass}
              />
              <p className="text-[9px] text-[var(--ink-soft)] mt-2 italic">Tarifa de amortización y consumo eléctrico por hora.</p>
            </div>

            <div>
              <label className={labelClass}>Costo por Gramo de Filamento ($/g)</label>
              <input
                type="number"
                step="any"
                required
                value={materialPricePerGram}
                onChange={(e) => setMaterialPricePerGram(e.target.value)}
                placeholder="30"
                className={inputClass}
              />
              <p className="text-[9px] text-[var(--ink-soft)] mt-2 italic">Costo de polímero básico (PLA/PETG) por gramo.</p>
            </div>
          </div>
        </section>

        {/* Sección 04: Tarifas por Material Específico */}
        <section className="bg-[var(--paper)] border border-[var(--paper-line)] p-8 md:p-10 rounded-2xl warm-shadow layer-press space-y-6">
          <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--amber)] flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--paper-line)]" /> 04 · Tarifas por Gramo por Material Específico ($/g)
          </h2>
          <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
            Configura un precio por gramo personalizado para cada tipo de material. Si un material no tiene un valor asignado o se deja vacío, el cotizador usará el costo por gramo de filamento básico configurado arriba (${materialPricePerGram || "0"}/g).
          </p>

          {materials.length === 0 ? (
            <p className="text-xs text-[var(--ink-soft)] italic p-4 bg-white/40 border border-dashed border-[var(--paper-line)] rounded-xl text-center">
              No hay materiales registrados en el sistema. Créalos en la sección de Materiales primero.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {materials.map((mat) => (
                <div key={mat.id} className="bg-white/40 p-4 rounded-xl border border-[var(--paper-line)] flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="mono text-[10px] text-[var(--ink)] font-bold uppercase tracking-wider block">
                      {mat.name}
                    </span>
                    <span className={`mono text-[7px] uppercase tracking-widest mt-1 inline-block px-1.5 py-0.5 rounded ${
                      mat.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {mat.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="w-32 shrink-0">
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs text-[var(--ink-soft)]/50">$</span>
                      <input
                        type="number"
                        step="any"
                        placeholder={materialPricePerGram}
                        value={materialPrices[mat.id] || ""}
                        onChange={(e) => setMaterialPrices({
                          ...materialPrices,
                          [mat.id]: e.target.value
                        })}
                        className={inputClass + " pl-7 py-2 text-xs"}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Status display */}
        {message && (
          <div className={`p-4 rounded-xl text-center mono text-[10px] uppercase tracking-[0.2em] border layer-press ${
            message.includes("Error") 
              ? "bg-red-50 text-red-700 border-red-200" 
              : "bg-[color-mix(in_srgb,var(--amber)_10%,white)] text-[var(--ink)] border-[color-mix(in_srgb,var(--amber)_30%,var(--paper-line))]"
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 rounded-xl font-semibold text-sm text-[var(--graphite)] bg-[var(--amber)] hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 disabled:opacity-50"
        >
          {isSaving ? "Guardando..." : "Actualizar Datos del Taller"}
        </button>

      </form>
    </div>
  );
}
