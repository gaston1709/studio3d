"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

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
}

export default function OrderForm({ materials }: { materials: Material[] }) {
  const { data: session, status } = useSession();
  const [fileConfigs, setFilesConfigs] = useState<FileConfig[]>([]);
  const [scaleFactor, setScaleFactor] = useState("100%");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Technical Specs State (Global for the quote)
  const [purpose, setPurpose] = useState("aesthetic");

  // Delivery Preferences State
  const [desiredDate, setDesiredDate] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  if (status === "loading") return <div className="text-center py-20 font-black uppercase tracking-[0.4em] text-slate-300 animate-pulse">Sincronizando Terminal...</div>;

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto bg-white/60 backdrop-blur-md p-16 rounded-[3rem] border-2 border-black/10 shadow-2xl text-center">
        <h2 className="text-4xl font-black text-black mb-8 tracking-tighter uppercase">Identificación Requerida</h2>
        <p className="text-slate-600 font-medium mb-12 leading-relaxed max-w-sm mx-auto">
          Para acceder al nodo de configuración técnica y carga de activos, debe autenticarse en el sistema.
        </p>
        <div className="flex flex-col gap-6">
          <Link 
            href="/auth/signin" 
            className="bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/auth/signup" 
            className="text-black border-4 border-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all active:scale-95"
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const allowedExtensions = ['.stl', '.3mf', '.step'];
    const filteredFiles = selectedFiles.filter(file => {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      return allowedExtensions.includes(ext);
    });

    if (filteredFiles.length !== selectedFiles.length) {
      alert("Algunos archivos fueron descartados. Solo se permiten formatos .STL, .3MF y .STEP");
    }

    if (filteredFiles.length === 0) {
      e.target.value = "";
      return;
    }

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
      layerHeightManual: "0.2"
    }));

    setFilesConfigs([...fileConfigs, ...newConfigs]);
  };

  const removeFile = (id: string) => {
    setFilesConfigs(fileConfigs.filter(f => f.id !== id));
  };

  const updateFileConfig = (id: string, updates: Partial<FileConfig>) => {
    setFilesConfigs(fileConfigs.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fileConfigs.length === 0) {
      alert("Cargue al menos un archivo.");
      return;
    }

    // Validate that all files have material/color set correctly
    for (const f of fileConfigs) {
        // Material is OK if it's a known ID OR if it's 'custom'/'multi' AND customMaterial has text
        const isMatOk = (f.materialId !== "custom" && f.materialId !== "multi" && f.materialId !== "") || f.customMaterial.trim() !== "";
        // Color is OK if it's a known ID OR if it's 'custom'/'multi' AND customColor has text
        const isColOk = (f.colorId !== "custom" && f.colorId !== "multi" && f.colorId !== "") || f.customColor.trim() !== "";
        
        if (!isMatOk || !isColOk) {
            alert(`Faltan parámetros para el archivo: ${f.file.name}. Asegúrese de especificar material y color.`);
            return;
        }
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("email", session.user?.email || ""); 
    formData.append("scaleFactor", scaleFactor);
    formData.append("purpose", purpose);
    if (desiredDate) formData.append("desiredDate", desiredDate);
    if (deliveryNotes) formData.append("deliveryNotes", deliveryNotes);

    // Append file configs
    fileConfigs.forEach((f, index) => {
        formData.append(`file`, f.file);
        formData.append(`config_${index}`, JSON.stringify({
            materialId: f.materialId,
            colorId: f.colorId,
            customMaterial: f.customMaterial,
            customColor: f.customColor,
            infillType: f.infillType,
            infillPercentage: f.infillPercentage,
            layerHeightType: f.layerHeightType,
            layerHeightManual: f.layerHeightManual
        }));
    });

    try {
      const res = await fetch("/api/orders", { method: "POST", body: formData });
      if (res.ok) {
        setMessage("Configuración enviada correctamente. Procesando cotización...");
        setFilesConfigs([]);
        setScaleFactor("100%");
      } else {
        const data = await res.json();
        setMessage(data.error || "Error en el procesamiento.");
      }
    } catch (error) {
      setMessage("Error de enlace con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-24 max-w-5xl mx-auto mb-32">
      <div className="border-b-4 border-black pb-8">
        <h1 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">Nueva Cotización</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Gestione múltiples activos en una sola terminal</p>
      </div>

      {/* SECCIÓN 1: ARCHIVOS Y CONFIGURACIÓN INDIVIDUAL */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4">
          <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
            <span className="w-8 h-[2px] bg-black"></span> 01. Activos
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"Suba sus modelos y asigne la fisicalidad a cada uno."</p>
          
          <div className="mt-10 p-6 bg-amber-50 border-2 border-amber-200 rounded-3xl">
             <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic mb-2">⚠️ Límite de Volumen</p>
             <p className="text-[11px] font-bold text-slate-800 leading-relaxed">Máximo por pieza: <span className="font-black">320x320x325mm</span>. Si supera esto, aclare la escala abajo.</p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          {/* File Upload Box */}
          <div className="relative border-4 border-dashed border-black/10 rounded-[2.5rem] p-10 hover:border-black hover:bg-white/50 transition-all text-center group bg-white/20">
            <input type="file" multiple accept=".stl,.3mf,.step" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="flex items-center justify-center gap-6">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-black uppercase tracking-tighter leading-none">Agregar Modelos 3D</p>
                <p className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em]">.STL / .STEP / .3MF</p>
              </div>
            </div>
          </div>

          {/* Individual File Cards */}
          <div className="space-y-6">
            {fileConfigs.map((f, idx) => {
              const selectedMat = materials.find(m => m.id === f.materialId);
              const availableColors = selectedMat?.colors || [];

              return (
                <div key={f.id} className="bg-white border-2 border-black/10 rounded-[2rem] overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-slate-50 px-8 py-4 border-b-2 border-black/5 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400">#{idx + 1}</span>
                        <p className="text-sm font-black text-black truncate max-w-[200px] uppercase tracking-tight">{f.file.name}</p>
                     </div>
                     <button type="button" onClick={() => removeFile(f.id)} className="text-red-400 hover:text-red-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                     </button>
                  </div>
                  
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Material</label>
                      <select 
                        value={f.materialId} 
                        onChange={(e) => updateFileConfig(f.id, { materialId: e.target.value, colorId: "" })} 
                        className="w-full px-4 py-3 border-2 border-black/5 rounded-xl bg-slate-50 font-black text-xs uppercase outline-none focus:border-black transition-all appearance-none cursor-pointer"
                      >
                        {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        <option value="multi">-- VARIOS MATERIALES --</option>
                        <option value="custom">-- OTRO --</option>
                      </select>
                    </div>

                    {f.materialId !== "custom" && f.materialId !== "multi" && (
                      <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Color</label>
                        <select 
                          value={f.colorId} 
                          required
                          onChange={(e) => updateFileConfig(f.id, { colorId: e.target.value })} 
                          className="w-full px-4 py-3 border-2 border-black/5 rounded-xl bg-slate-50 font-black text-xs uppercase outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Seleccionar...</option>
                          {availableColors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          <option value="multi">-- VARIOS COLORES --</option>
                          <option value="custom">-- OTRO --</option>
                        </select>
                      </div>
                    )}

                    {(f.materialId === "custom" || f.materialId === "multi" || f.colorId === "custom" || f.colorId === "multi") && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                        {(f.materialId === "custom" || f.materialId === "multi") && (
                           <input 
                            type="text" required 
                            value={f.customMaterial} 
                            onChange={(e) => updateFileConfig(f.id, { customMaterial: e.target.value })}
                            placeholder={f.materialId === "multi" ? "Detalle los materiales..." : "Especifique Material..."}
                            className="w-full px-4 py-3 border-2 border-amber-200 bg-amber-50 rounded-xl font-black text-xs uppercase outline-none focus:border-amber-400"
                           />
                        )}
                        <input 
                          type="text" required 
                          value={f.customColor} 
                          onChange={(e) => updateFileConfig(f.id, { customColor: e.target.value })}
                          placeholder={(f.colorId === "multi" || f.materialId === "multi") ? "Detalle los colores..." : "Especifique Color..."}
                          className="w-full px-4 py-3 border-2 border-amber-200 bg-amber-50 rounded-xl font-black text-xs uppercase outline-none focus:border-amber-400"
                        />
                      </div>
                    )}

                    {/* Per-File Technical Specs */}
                    <div className="md:col-span-2 pt-6 border-t-2 border-black/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Infill */}
                      <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Densidad de Relleno</label>
                        <div className="flex bg-black/5 p-1 rounded-xl border-2 border-black/5 w-max">
                          <button type="button" onClick={() => updateFileConfig(f.id, { infillType: "auto" })} className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] transition-all ${f.infillType === "auto" ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-black'}`}>Automático</button>
                          <button type="button" onClick={() => updateFileConfig(f.id, { infillType: "manual" })} className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] transition-all ${f.infillType === "manual" ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-black'}`}>Manual</button>
                        </div>
                        {f.infillType === "manual" && (
                          <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                            <input type="range" min="0" max="100" step="5" value={f.infillPercentage} onChange={(e) => updateFileConfig(f.id, { infillPercentage: e.target.value })} className="w-full h-1 bg-black/10 rounded-full appearance-none cursor-pointer accent-black mb-2" />
                            <div className="text-right">
                              <span className="text-xl font-black text-black leading-none">{f.infillPercentage}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Layer Height */}
                      <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Altura de Capa (Res.)</label>
                        <select 
                          value={f.layerHeightType} 
                          onChange={(e) => updateFileConfig(f.id, { layerHeightType: e.target.value })} 
                          className="w-full px-4 py-3 border-2 border-black/5 rounded-xl bg-slate-50 font-black text-xs uppercase outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        >
                          <option value="standard">Estándar (0.20mm)</option>
                          <option value="detailed">Detalle (0.12mm)</option>
                          <option value="fast">Borrador (0.28mm)</option>
                          <option value="manual">Personalizado</option>
                        </select>
                        {f.layerHeightType === "manual" && (
                          <div className="mt-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <input type="number" step="0.01" min="0.08" max="0.28" value={f.layerHeightManual} onChange={(e) => updateFileConfig(f.id, { layerHeightManual: e.target.value })} className="w-20 px-3 py-2 border-2 border-black/10 rounded-lg font-black text-black outline-none focus:border-black text-center text-xs" />
                            <span className="font-black text-slate-400 uppercase tracking-[0.2em] text-[8px]">mm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t-2 border-black/5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Instrucciones de Escala (Global)</label>
            <input type="text" value={scaleFactor} onChange={(e) => setScaleFactor(e.target.value)} placeholder="Ej: 100%, Escalar el archivo 'A' al 50%..." className="w-full px-6 py-5 border-2 border-black/10 rounded-2xl focus:border-black outline-none bg-white/80 font-black text-black shadow-sm uppercase tracking-widest text-xs" />
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: ESTRUCTURA (Global) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-20 border-t-2 border-black/5">
        <div className="lg:col-span-4">
          <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
            <span className="w-8 h-[2px] bg-black"></span> 02. Aplicación
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"Determine el esfuerzo mecánico del conjunto."</p>
        </div>
        <div className="lg:col-span-8 space-y-16">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block">Aplicación del Conjunto</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: "aesthetic", label: "Estético", desc: "Visual" },
                { id: "decorative", label: "Funcional", desc: "Uso diario" },
                { id: "mechanical", label: "Industrial", desc: "Resistencia" },
              ].map((p) => (
                <button key={p.id} type="button" onClick={() => setPurpose(p.id)} className={`p-8 rounded-[2rem] border-4 text-left transition-all ${purpose === p.id ? 'border-black bg-white shadow-xl' : 'border-black/5 bg-white/20 hover:border-black/20'}`}>
                  <p className="font-black text-sm uppercase tracking-widest mb-2 leading-none">{p.label}</p>
                  <p className="text-[9px] font-black text-slate-500 leading-tight uppercase tracking-tighter opacity-60">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: LOGÍSTICA */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-20 border-t-2 border-black/5">
        <div className="lg:col-span-4">
          <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
            <span className="w-8 h-[2px] bg-black"></span> 03. Logística
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"Cronograma y requerimientos adicionales."</p>
        </div>
        <div className="lg:col-span-8 space-y-12">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Fecha Preferida de Entrega</label>
            <input 
                type="date" 
                value={desiredDate} 
                onChange={(e) => setDesiredDate(e.target.value)}
                className="w-full md:w-64 px-6 py-5 border-2 border-black/10 rounded-2xl focus:border-black outline-none bg-white/80 font-black text-black shadow-sm uppercase tracking-widest text-xs cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Notas Adicionales</label>
            <textarea 
              rows={4}
              value={deliveryNotes} 
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Ej: Instrucciones específicas de ensamblado / Requerimientos de empaque..." 
              className="w-full px-6 py-5 border-2 border-black/10 rounded-2xl focus:border-black outline-none bg-white/80 font-black text-black shadow-sm resize-none uppercase tracking-widest text-xs"
            />
          </div>
        </div>
      </section>

      <section className="pt-20 border-t-4 border-black">
          <button type="submit" disabled={isSubmitting} className={`w-full py-8 rounded-[2rem] font-black text-2xl text-white transition-all uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] ${isSubmitting ? "bg-slate-300 cursor-not-allowed" : "bg-black hover:bg-slate-800 shadow-black/30"}`}>
            {isSubmitting ? "Procesando Pipeline..." : "Enviar a Producción"}
          </button>
          {message && (
            <div className={`mt-10 p-8 rounded-2xl text-center font-black text-xs border-4 uppercase tracking-[0.3em] animate-in zoom-in-95 ${message.includes("correctamente") ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"}`}>
              {message}
            </div>
          )}
      </section>
    </form>
  );
}
