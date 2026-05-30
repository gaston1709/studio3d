"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import dynamic from "next/dynamic";
import ZHeightRail from "@/components/landing/ZHeightRail";

const ThreeDViewer = dynamic(() => import("../ThreeDViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--graphite)] rounded-2xl flex flex-col items-center justify-center p-8">
      <div className="space-y-2 text-left w-full max-w-xs">
        {["CARGANDO GEOMETRÍA...", "CALCULANDO VOLUMEN...", "ESTIMANDO TIEMPO...", "LISTO."].map((line, i) => (
          <p
            key={line}
            className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--amber)]"
            style={{ opacity: 0, animation: `boot-line 200ms ${i * 300}ms both` }}
          >
            {line}
          </p>
        ))}
      </div>
      <style>{`@keyframes boot-line { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }`}</style>
    </div>
  ),
});

interface Color {
  id: string;
  name: string;
  hexCode: string;
}

interface Material {
  id: string;
  name: string;
  colors: Color[];
}

interface FileConfig {
  id: string;
  file: File;
  materialId: string;
  colorId: string;
  customMaterial: string;
  customColor: string;
  infillType: string;
  infillPercentage: string;
  layerHeightType: string;
  layerHeightManual: string;
  scaleFactor: string;
}

function WarmInput({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]">{label}</label>
      {children}
    </div>
  );
}

export default function OrderForm({ materials }: { materials: Material[] }) {
  const { data: session, status } = useSession();
  const [fileConfigs, setFilesConfigs] = useState<FileConfig[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [viewingFileId, setViewingFileId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("aesthetic");
  const [desiredDate, setDesiredDate] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const formProgress = useMemo(() => {
    const fields = [
      fileConfigs.length > 0,
      fileConfigs.every(f => f.materialId !== ""),
      fileConfigs.every(f => f.colorId !== "" || f.customColor !== ""),
      purpose !== "",
    ];
    const done = fields.filter(Boolean).length;
    return Math.round((done / fields.length) * 100);
  }, [fileConfigs, purpose]);

  // Update --accent when filament color is selected
  useEffect(() => {
    const firstFile = fileConfigs[0];
    if (!firstFile) {
      document.documentElement.style.removeProperty("--accent");
      return;
    }
    const mat = materials.find(m => m.id === firstFile.materialId);
    const color = mat?.colors.find(c => c.id === firstFile.colorId);
    if (color?.hexCode) {
      document.documentElement.style.setProperty("--accent", color.hexCode);
    } else {
      document.documentElement.style.removeProperty("--accent");
    }
    return () => { document.documentElement.style.removeProperty("--accent"); };
  }, [fileConfigs, materials]);

  if (status === "loading") return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--amber)] animate-pulse">Cargando...</span>
    </div>
  );

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto panel-paper p-12 rounded-2xl border border-[var(--paper-line)] warm-shadow text-center layer-press">
        <h2 className="text-3xl font-semibold text-[var(--ink)] mb-6 tracking-tight">Necesitás iniciar sesión</h2>
        <p className="text-[var(--ink-soft)] mb-10 leading-relaxed">Para cotizar una pieza tenés que estar logueado.</p>
        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <Link href="/auth/signin" className="bg-[var(--amber)] text-[var(--graphite)] py-4 rounded-xl font-semibold text-center hover:bg-[var(--amber-glow)] transition-colors warm-interactive">Entrar</Link>
          <Link href="/auth/signup" className="border border-[var(--paper-line)] text-[var(--ink)] py-4 rounded-xl font-medium text-center hover:border-[var(--ink)] transition-colors">Crear cuenta</Link>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    const allowedExtensions = [".stl", ".3mf", ".step"];
    const filteredFiles = selectedFiles.filter(file => {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      return allowedExtensions.includes(ext);
    });
    if (filteredFiles.length !== selectedFiles.length) alert("Algunos archivos fueron descartados. Solo se permiten .STL, .3MF y .STEP");
    if (filteredFiles.length === 0) { e.target.value = ""; return; }

    const newConfigs: FileConfig[] = filteredFiles.map(file => ({
      id: uuidv4(),
      file,
      materialId: materials[0]?.id || "custom",
      colorId: "",
      customMaterial: "",
      customColor: "",
      infillType: "auto",
      infillPercentage: "15",
      layerHeightType: "standard",
      layerHeightManual: "0.2",
      scaleFactor: "100%",
    }));
    setFilesConfigs([...fileConfigs, ...newConfigs]);
  };

  const removeFile = (id: string) => setFilesConfigs(fileConfigs.filter(f => f.id !== id));
  const updateFileConfig = (id: string, updates: Partial<FileConfig>) =>
    setFilesConfigs(fileConfigs.map(f => f.id === id ? { ...f, ...updates } : f));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fileConfigs.length === 0) { alert("Cargá al menos un archivo."); return; }
    for (const f of fileConfigs) {
      const isMatOk = (f.materialId !== "custom" && f.materialId !== "multi" && f.materialId !== "") || f.customMaterial.trim() !== "";
      const isColOk = (f.colorId !== "custom" && f.colorId !== "multi" && f.colorId !== "") || f.customColor.trim() !== "";
      if (!isMatOk || !isColOk) { alert(`Faltan parámetros para: ${f.file.name}`); return; }
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("email", session.user?.email || "");
    formData.append("purpose", purpose);
    if (desiredDate) formData.append("desiredDate", desiredDate);
    if (deliveryNotes) formData.append("deliveryNotes", deliveryNotes);
    fileConfigs.forEach((f, index) => {
      formData.append("file", f.file);
      formData.append(`config_${index}`, JSON.stringify({
        materialId: f.materialId, colorId: f.colorId, customMaterial: f.customMaterial,
        customColor: f.customColor, infillType: f.infillType, infillPercentage: f.infillPercentage,
        layerHeightType: f.layerHeightType, layerHeightManual: f.layerHeightManual, scaleFactor: f.scaleFactor,
      }));
    });
    try {
      const res = await fetch("/api/orders", { method: "POST", body: formData });
      if (res.ok) {
        setMessage("Pedido enviado. Te mandamos el presupuesto pronto.");
        setFilesConfigs([]);
      } else {
        const data = await res.json();
        setMessage(data.error || "Error al enviar el pedido.");
      }
    } catch {
      setMessage("Error de conexión con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-[var(--paper-line)] rounded-xl focus:border-[var(--accent)] outline-none text-[var(--ink)] bg-white/60 text-sm transition-colors appearance-none cursor-pointer";

  return (
    <>
      <ZHeightRail mode="form" formProgress={formProgress} />
      <form onSubmit={handleSubmit} className="full-bleed -mt-8 md:-mt-12">
        {/* Header seam */}
        <div className="panel-paper">
          <div className="container mx-auto px-6 pt-10 pb-0 flex items-center gap-4">
            <span className="layer-seam flex-1" />
            <span className="seam-label whitespace-nowrap">— El banco de trabajo —</span>
            <span className="layer-seam flex-1" />
          </div>
          <div className="container mx-auto px-6 pt-8 pb-4">
            <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--ink)] tracking-tight">Nueva cotización</h1>
            <p className="mono text-[10px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mt-2">Subí tu modelo, elegí material y mandanos el pedido</p>
          </div>
        </div>

        <div className="panel-paper">
          <div className="container mx-auto px-6 pb-24 space-y-16">

            {/* Volume limit notice */}
            <div className="flex items-start gap-3 p-4 bg-[color-mix(in_srgb,var(--amber)_8%,var(--paper))] rounded-xl border border-[color-mix(in_srgb,var(--amber)_30%,var(--paper-line))]">
              <span className="mono text-[10px] text-[var(--amber)] uppercase tracking-[0.2em] flex-shrink-0 mt-0.5">⚠ Límite</span>
              <p className="mono text-[11px] text-[var(--ink-soft)] tracking-wider leading-relaxed">
                Máximo por pieza: <span className="text-[var(--ink)] font-medium">320×320×325mm</span>. Si tu modelo supera esto, aclaralo en las notas.
              </p>
            </div>

            {/* 01 Files */}
            <section>
              <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mb-4 flex items-center gap-3">
                <span className="w-6 h-px bg-[var(--paper-line)]" /> 01 · Archivos
              </h2>

              <div className="relative border-2 border-dashed border-[var(--paper-line)] rounded-2xl p-8 hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_3%,transparent)] transition-all text-center group">
                <input type="file" multiple accept=".stl,.3mf,.step" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors" style={{ backgroundColor: "var(--accent)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-base font-semibold text-[var(--ink)] leading-none">Agregar modelos 3D</p>
                    <p className="mono text-[9px] text-[var(--ink-soft)] mt-1.5 uppercase tracking-[0.3em]">.STL / .STEP / .3MF</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                {fileConfigs.map((f, idx) => {
                  const selectedMat = materials.find(m => m.id === f.materialId);
                  const availableColors = selectedMat?.colors || [];
                  const selectedColor = availableColors.find(c => c.id === f.colorId);

                  return (
                    <div key={f.id} className="bg-white border border-[var(--paper-line)] rounded-2xl overflow-hidden layer-press perimeter-card">
                      <div className="bg-[color-mix(in_srgb,var(--paper)_60%,white)] px-6 py-3 border-b border-[var(--paper-line)] flex justify-between items-center">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="mono text-[9px] text-[var(--ink-soft)] flex-shrink-0">#{idx + 1}</span>
                          <p className="text-sm font-medium text-[var(--ink)] truncate max-w-[160px] sm:max-w-[300px]" title={f.file.name}>{f.file.name}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/\.(stl|obj)$/i.test(f.file.name) && (
                            <button
                              type="button"
                              onClick={() => setViewingFileId(viewingFileId === f.id ? null : f.id)}
                              className={`px-3 py-1.5 rounded-lg mono text-[9px] uppercase tracking-widest border transition-all active:scale-95 ${
                                viewingFileId === f.id
                                  ? "border-[var(--accent)] text-[var(--accent)]"
                                  : "border-[var(--paper-line)] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                              }`}
                            >
                              {viewingFileId === f.id ? "✕ Cerrar" : "Vista 3D"}
                            </button>
                          )}
                          <button type="button" onClick={() => removeFile(f.id)} className="text-[var(--ink-soft)] hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <WarmInput label="Material">
                          <select value={f.materialId} onChange={(e) => updateFileConfig(f.id, { materialId: e.target.value, colorId: "" })} className={inputClass}>
                            {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            <option value="multi">Varios materiales</option>
                            <option value="custom">Otro</option>
                          </select>
                        </WarmInput>

                        {f.materialId !== "custom" && f.materialId !== "multi" && (
                          <WarmInput label="Color">
                            <div className="relative">
                              <select value={f.colorId} required onChange={(e) => updateFileConfig(f.id, { colorId: e.target.value })} className={inputClass}>
                                <option value="" disabled>Seleccionar...</option>
                                {availableColors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                <option value="multi">Varios colores</option>
                                <option value="custom">Otro</option>
                              </select>
                              {selectedColor && (
                                <span className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-[var(--paper-line)] pointer-events-none" style={{ backgroundColor: selectedColor.hexCode }} />
                              )}
                            </div>
                          </WarmInput>
                        )}

                        {(f.materialId === "custom" || f.materialId === "multi" || f.colorId === "custom" || f.colorId === "multi") && (
                          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(f.materialId === "custom" || f.materialId === "multi") && (
                              <input type="text" required value={f.customMaterial} onChange={(e) => updateFileConfig(f.id, { customMaterial: e.target.value })} placeholder={f.materialId === "multi" ? "Detallá los materiales..." : "Especificá material..."} className="px-4 py-3 border border-[color-mix(in_srgb,var(--amber)_40%,var(--paper-line))] bg-[color-mix(in_srgb,var(--amber)_4%,white)] rounded-xl text-sm outline-none focus:border-[var(--amber)] transition-colors" />
                            )}
                            <input type="text" required value={f.customColor} onChange={(e) => updateFileConfig(f.id, { customColor: e.target.value })} placeholder="Especificá color..." className="px-4 py-3 border border-[color-mix(in_srgb,var(--amber)_40%,var(--paper-line))] bg-[color-mix(in_srgb,var(--amber)_4%,white)] rounded-xl text-sm outline-none focus:border-[var(--amber)] transition-colors" />
                          </div>
                        )}

                        {/* Technical specs */}
                        <div className="md:col-span-2 pt-4 border-t border-[var(--paper-line)] grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]">Densidad de relleno</label>
                            <div className="flex bg-[color-mix(in_srgb,var(--paper-line)_40%,transparent)] p-1 rounded-xl w-max">
                              <button type="button" onClick={() => updateFileConfig(f.id, { infillType: "auto" })} className={`px-4 py-2 rounded-lg mono text-[9px] uppercase tracking-[0.2em] transition-all ${f.infillType === "auto" ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"}`}>Auto</button>
                              <button type="button" onClick={() => updateFileConfig(f.id, { infillType: "manual" })} className={`px-4 py-2 rounded-lg mono text-[9px] uppercase tracking-[0.2em] transition-all ${f.infillType === "manual" ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"}`}>Manual</button>
                            </div>
                            {f.infillType === "manual" && (
                              <div className="mt-3">
                                <input type="range" min="0" max="100" step="5" value={f.infillPercentage} onChange={(e) => updateFileConfig(f.id, { infillPercentage: e.target.value })} className="w-full h-1 rounded-full appearance-none cursor-pointer" style={{ accentColor: "var(--accent)" }} />
                                <span className="mono text-lg font-medium text-[var(--ink)]">{f.infillPercentage}%</span>
                              </div>
                            )}
                          </div>

                          <WarmInput label="Altura de capa">
                            <select value={f.layerHeightType} onChange={(e) => updateFileConfig(f.id, { layerHeightType: e.target.value })} className={inputClass}>
                              <option value="standard">Estándar (0.20mm)</option>
                              <option value="detailed">Detalle (0.12mm)</option>
                              <option value="fast">Borrador (0.28mm)</option>
                              <option value="manual">Personalizado</option>
                            </select>
                            {f.layerHeightType === "manual" && (
                              <div className="mt-3 flex items-center gap-2">
                                <input type="number" step="0.01" min="0.08" max="0.28" value={f.layerHeightManual} onChange={(e) => updateFileConfig(f.id, { layerHeightManual: e.target.value })} className="w-20 px-3 py-2 border border-[var(--paper-line)] rounded-lg text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] text-center" />
                                <span className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-[0.2em]">mm</span>
                              </div>
                            )}
                          </WarmInput>

                          <div className="md:col-span-2">
                            <WarmInput label="Factor de escala">
                              <input type="text" value={f.scaleFactor} onChange={(e) => updateFileConfig(f.id, { scaleFactor: e.target.value })} placeholder="100%" className={inputClass} />
                            </WarmInput>
                          </div>
                        </div>

                        {viewingFileId === f.id && (
                          <div className="md:col-span-2 pt-4 border-t border-[var(--paper-line)]">
                            <label className="mono block text-[9px] text-[var(--ink-soft)] mb-3 uppercase tracking-[0.28em]">Inspección de geometría</label>
                            <div className="h-[300px] sm:h-[400px] rounded-2xl overflow-hidden">
                              <ThreeDViewer file={f.file} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 02 Application */}
            <section>
              <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mb-4 flex items-center gap-3">
                <span className="w-6 h-px bg-[var(--paper-line)]" /> 02 · Aplicación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "aesthetic", label: "Estético", desc: "Visual" },
                  { id: "decorative", label: "Funcional", desc: "Uso diario" },
                  { id: "mechanical", label: "Industrial", desc: "Resistencia" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPurpose(p.id)}
                    className={`p-6 rounded-2xl border text-left transition-all perimeter-card ${
                      purpose === p.id
                        ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_5%,white)] warm-shadow"
                        : "border-[var(--paper-line)] bg-white/60"
                    }`}
                  >
                    <p className="font-semibold text-sm text-[var(--ink)] leading-none">{p.label}</p>
                    <p className="mono text-[9px] text-[var(--ink-soft)] mt-1.5 uppercase tracking-[0.2em]">{p.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* 03 Logistics */}
            <section>
              <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mb-4 flex items-center gap-3">
                <span className="w-6 h-px bg-[var(--paper-line)]" /> 03 · Logística
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WarmInput label="Fecha preferida de entrega">
                  <input type="date" value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} className={`${inputClass} md:max-w-xs`} />
                </WarmInput>
                <div className="md:col-span-2">
                  <WarmInput label="Notas adicionales">
                    <textarea rows={3} value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} placeholder="Instrucciones especiales, requerimientos de ensamblado..." className="w-full px-4 py-3 border border-[var(--paper-line)] rounded-xl focus:border-[var(--accent)] outline-none text-[var(--ink)] bg-white/60 text-sm transition-colors resize-none" />
                  </WarmInput>
                </div>
              </div>
            </section>

            {/* Submit */}
            <section className="pt-4 border-t border-[var(--paper-line)]">
              <button
                type="submit"
                disabled={isSubmitting || fileConfigs.length === 0}
                className="w-full py-5 rounded-2xl font-semibold text-lg text-white transition-all active:scale-[0.98] disabled:opacity-50 warm-interactive"
                style={{ backgroundColor: isSubmitting ? "var(--ink-soft)" : "var(--accent)" }}
              >
                {isSubmitting ? (
                  <span className="mono text-sm uppercase tracking-[0.2em]">Enviando pedido...</span>
                ) : (
                  "Enviar pedido"
                )}
              </button>
              {message && (
                <div className={`mt-6 p-5 rounded-2xl text-center mono text-xs border uppercase tracking-[0.2em] layer-press ${
                  message.includes("enviado") || message.includes("correctamente")
                    ? "bg-[color-mix(in_srgb,var(--amber)_10%,white)] text-[var(--ink)] border-[color-mix(in_srgb,var(--amber)_30%,var(--paper-line))]"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {message}
                </div>
              )}
            </section>
          </div>
        </div>
      </form>
    </>
  );
}
