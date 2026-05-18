"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Material {
  id: string;
  name: string;
  colors: {
    id: string;
    name: string;
    hexCode: string;
  }[];
}

export default function OrderForm({ materials }: { materials: Material[] }) {
  const { data: session, status } = useSession();
  const [selectedMaterialId, setSelectedMaterialId] = useState(materials[0]?.id || "custom");
  const [selectedColorId, setSelectedColorId] = useState("");
  const [customMaterial, setCustomMaterial] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [scaleFactor, setScaleFactor] = useState("100%");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Technical Specs State
  const [purpose, setPurpose] = useState("aesthetic");
  const [infillType, setInfillType] = useState("auto");
  const [infillPercentage, setInfillPercentage] = useState("15");
  const [layerHeightType, setLayerHeightType] = useState("standard");
  const [layerHeightManual, setLayerHeightManual] = useState("0.2");

  // Delivery Preferences State
  const [desiredDate, setDesiredDate] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const isCustomMaterial = selectedMaterialId === "custom";
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);
  const availableColors = selectedMaterial?.colors || [];

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
            className="bg-black text-[#FFFCDC] py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/auth/signup" 
            className="text-black border-4 border-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-black hover:text-[#FFFCDC] transition-all active:scale-95"
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isMaterialOk = isCustomMaterial ? customMaterial : selectedMaterialId;
    const isColorOk = (isCustomMaterial || selectedColorId === "custom") ? customColor : selectedColorId;

    if (files.length === 0 || !isMaterialOk || !isColorOk) {
      alert("Faltan parámetros de configuración.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));
    formData.append("email", session.user?.email || ""); 
    formData.append("scaleFactor", scaleFactor); 
    
    if (isCustomMaterial) {
      formData.append("customMaterial", customMaterial);
      formData.append("customColor", customColor);
    } else {
      formData.append("materialId", selectedMaterialId);
      if (selectedColorId === "custom") {
        formData.append("customColor", customColor);
      } else {
        formData.append("colorId", selectedColorId);
      }
    }

    formData.append("purpose", purpose);
    formData.append("infillType", infillType);
    if (infillType === "manual") formData.append("infillPercentage", infillPercentage);
    formData.append("layerHeightType", layerHeightType);
    if (layerHeightType === "manual") formData.append("layerHeightManual", layerHeightManual);
    if (desiredDate) formData.append("desiredDate", desiredDate);
    if (deliveryNotes) formData.append("deliveryNotes", deliveryNotes);

    try {
      const res = await fetch("/api/orders", { method: "POST", body: formData });
      if (res.ok) {
        setMessage("Configuración enviada correctamente. Procesando cotización...");
        setFiles([]);
        setCustomMaterial("");
        setCustomColor("");
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
      {/* HEADER SIMPLIFICADO */}
      <div className="border-b-4 border-black pb-8">
        <h1 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">Nueva Cotización</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Complete los parámetros técnicos del componente</p>
      </div>

      {/* SECCIÓN 1: ARCHIVO Y CUENTA */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4">
          <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
            <span className="w-8 h-[2px] bg-black"></span> 01. Origen
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"Suba el activo digital y verifique los permisos de su terminal de usuario."</p>
        </div>
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white/40 backdrop-blur-sm p-8 rounded-2xl border-2 border-black/5 flex justify-between items-center shadow-sm">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Usuario Activo</p>
              <p className="text-sm font-black text-black tracking-tight">{session.user?.email}</p>
            </div>
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-[#FFFCDC] shadow-xl">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
            </div>
          </div>

          <div className="relative border-4 border-dashed border-black/10 rounded-[2.5rem] p-16 hover:border-black hover:bg-white/50 transition-all text-center group bg-white/20">
            <input type="file" multiple required accept=".stl,.3mf,.step" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="space-y-6">
              <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#FFFCDC]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <div>
                <div className="text-xl font-black text-black uppercase tracking-tighter leading-none mb-4">
                  {files.length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {files.map((f, i) => <li key={i}>{f.name}</li>)}
                    </ul>
                  ) : "Cargar Archivos (.STL / .STEP / .3MF)"}
                </div>
                <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.3em]">Se permiten múltiples modelos</p>
                <div className="mt-6 inline-block bg-amber-50 border-2 border-amber-200 p-4 rounded-xl text-left">
                   <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic mb-2">⚠️ Límite de Volumen</p>
                   <p className="text-xs font-bold text-slate-800 leading-relaxed">El volumen máximo de impresión por pieza es de <span className="font-black">320x320x325mm</span>. Si tu modelo supera estas dimensiones, por favor indicá el factor de escala deseado a continuación.</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Factor de Escala</label>
            <input type="text" value={scaleFactor} onChange={(e) => setScaleFactor(e.target.value)} placeholder="Ej: 100%, 50%, Escalar a 15cm" className="w-full px-6 py-5 border-2 border-black/10 rounded-2xl focus:border-black outline-none bg-white/80 font-black text-black shadow-sm placeholder:text-slate-300 uppercase tracking-widest text-xs" />
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: MATERIAL Y COLOR */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-20 border-t-2 border-black/5">
        <div className="lg:col-span-4">
          <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
            <span className="w-8 h-[2px] bg-black"></span> 02. Fisicalidad
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"Defina la composición molecular y la terminación cromática del componente."</p>
        </div>
        <div className="lg:col-span-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block text-center md:text-left">Base de Polímero</label>
              <select value={selectedMaterialId} onChange={(e) => { setSelectedMaterialId(e.target.value); setSelectedColorId(""); }} className="w-full px-6 py-5 border-2 border-black/10 rounded-2xl focus:border-black outline-none bg-white/80 font-black text-black shadow-sm appearance-none cursor-pointer uppercase tracking-widest text-xs">
                {materials.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                <option value="custom">-- OTRO --</option>
              </select>
            </div>
            {!isCustomMaterial && (
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block text-center md:text-left">Acabado Cromático</label>
                <select value={selectedColorId} required onChange={(e) => setSelectedColorId(e.target.value)} className="w-full px-6 py-5 border-2 border-black/10 rounded-2xl focus:border-black outline-none bg-white/80 font-black text-black shadow-sm appearance-none cursor-pointer uppercase tracking-widest text-xs">
                  <option value="" disabled>Seleccionar...</option>
                  {availableColors.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  <option value="custom">-- OTRO --</option>
                </select>
              </div>
            )}
          </div>

          {(isCustomMaterial || selectedColorId === "custom") && (
            <div className="p-10 bg-black rounded-[2.5rem] space-y-8 animate-in fade-in slide-in-from-top-4 shadow-2xl">
              <h4 className="text-[10px] font-black text-[#FFFCDC] uppercase tracking-[0.4em] flex items-center gap-4">
                <span className="w-4 h-[1px] bg-[#FFFCDC]/30"></span> Pedido Especial
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isCustomMaterial && (
                  <input type="text" required value={customMaterial} onChange={(e) => setCustomMaterial(e.target.value)} placeholder="Material (Ej: Carbon Fiber)" className="w-full px-6 py-5 border-2 border-[#FFFCDC]/10 bg-white/5 rounded-2xl focus:border-[#FFFCDC] outline-none font-black text-[#FFFCDC] placeholder:text-slate-700 uppercase tracking-widest text-xs" />
                )}
                <input type="text" required value={customColor} onChange={(e) => setCustomColor(e.target.value)} placeholder="Referencia de Color" className="w-full px-6 py-5 border-2 border-[#FFFCDC]/10 bg-white/5 rounded-2xl focus:border-[#FFFCDC] outline-none font-black text-[#FFFCDC] placeholder:text-slate-700 uppercase tracking-widest text-xs" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN 3: ESPECIFICACIONES TÉCNICAS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-20 border-t-2 border-black/5">
        <div className="lg:col-span-4">
          <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
            <span className="w-8 h-[2px] bg-black"></span> 03. Estructura
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"Calibre la resolución vertical y la densidad volumétrica interna."</p>
        </div>
        <div className="lg:col-span-8 space-y-16">
          {/* Propósito */}
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block">Aplicación del Componente</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: "aesthetic", label: "Estético", desc: "Modelado y Visual" },
                { id: "decorative", label: "Funcional", desc: "Uso cotidiano" },
                { id: "mechanical", label: "Industrial", desc: "Alta Resistencia" },
              ].map((p) => (
                <button key={p.id} type="button" onClick={() => setPurpose(p.id)} className={`p-8 rounded-[2rem] border-4 text-left transition-all ${purpose === p.id ? 'border-black bg-white shadow-xl' : 'border-black/5 bg-white/20 hover:border-black/20'}`}>
                  <p className="font-black text-sm uppercase tracking-widest mb-2 leading-none">{p.label}</p>
                  <p className="text-[9px] font-black text-slate-500 leading-tight uppercase tracking-tighter opacity-60">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Relleno e Infill */}
          <div className="bg-white/40 backdrop-blur-md p-12 rounded-[3rem] border-2 border-black/10 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12 relative z-10">
               <div>
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] mb-2 block leading-none">Infill Density</label>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mt-2">Densidad de malla interna</p>
               </div>
               <div className="flex bg-black/5 p-1.5 rounded-2xl border-2 border-black/5">
                  <button type="button" onClick={() => setInfillType("auto")} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${infillType === "auto" ? 'bg-black text-[#FFFCDC] shadow-2xl' : 'text-slate-400 hover:text-black'}`}>Optimizado</button>
                  <button type="button" onClick={() => setInfillType("manual")} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${infillType === "manual" ? 'bg-black text-[#FFFCDC] shadow-2xl' : 'text-slate-400 hover:text-black'}`}>Manual</button>
               </div>
            </div>
            {infillType === "manual" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                <input type="range" min="0" max="100" step="5" value={infillPercentage} onChange={(e) => setInfillPercentage(e.target.value)} className="w-full h-2 bg-black/10 rounded-full appearance-none cursor-pointer accent-black" />
                <div className="flex justify-between mt-10 items-end">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Hollow</span>
                  <span className="text-7xl font-black text-black tracking-tighter leading-none">{infillPercentage}<span className="text-2xl opacity-20">%</span></span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Solid</span>
                </div>
              </div>
            )}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none">
               <span className="text-[12rem] font-black leading-none">V%</span>
            </div>
          </div>

          {/* Altura de Capa */}
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block text-center md:text-left">Resolución Vertical (Z-Pitch)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: "fast", label: "Draft", val: "0.28" },
                { id: "standard", label: "Std", val: "0.20" },
                { id: "detailed", label: "High", val: "0.12" },
                { id: "manual", label: "Libre", val: "..." },
              ].map((l) => (
                <button key={l.id} type="button" onClick={() => setLayerHeightType(l.id)} className={`p-6 rounded-2xl border-4 text-center transition-all ${layerHeightType === l.id ? 'border-black bg-white shadow-xl' : 'border-black/5 bg-white/20 text-slate-400 hover:border-black/20'}`}>
                  <p className="font-black text-[9px] uppercase tracking-[0.2em] mb-2 leading-none">{l.label}</p>
                  <p className="text-lg font-black tracking-tighter text-black">{l.val}{l.id !== "manual" && <span className="text-[10px] opacity-30 ml-1">mm</span>}</p>
                </button>
              ))}
            </div>
            {layerHeightType === "manual" && (
              <div className="flex items-center gap-6 mt-10 animate-in fade-in slide-in-from-left-4">
                <input type="number" step="0.01" min="0.04" max="0.4" value={layerHeightManual} onChange={(e) => setLayerHeightManual(e.target.value)} className="w-32 px-6 py-4 border-4 border-black rounded-2xl font-black text-black outline-none shadow-2xl text-center text-xl tracking-tighter" />
                <span className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">Micrones específicos</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: LOGÍSTICA */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-20 border-t-2 border-black/5">
        <div className="lg:col-span-4">
          <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
            <span className="w-8 h-[2px] bg-black"></span> 04. Logística
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"Indique sus preferencias de cronograma y cualquier requerimiento adicional."</p>
        </div>
        <div className="lg:col-span-8 space-y-12">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Fecha Preferida de Entrega</label>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <input 
                type="date" 
                value={desiredDate} 
                onChange={(e) => setDesiredDate(e.target.value)}
                className="w-full md:w-64 px-6 py-5 border-2 border-black/10 rounded-2xl focus:border-black outline-none bg-white/80 font-black text-black shadow-sm uppercase tracking-widest text-xs cursor-pointer"
              />
              <div className="flex items-center gap-3 px-6 py-4 bg-black/5 rounded-2xl border-2 border-black/5">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] font-black text-black uppercase tracking-widest">Demora estándar: 48 - 72hs hábiles</p>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-4 font-bold uppercase tracking-widest italic leading-relaxed">
              * El plazo definitivo se confirma tras el análisis técnico y la validación de la seña.
            </p>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Notas Adicionales / Requerimientos</label>
            <textarea 
              rows={4}
              value={deliveryNotes} 
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Ej: Necesito que sea resistente a la intemperie / Color específico de referencia..." 
              className="w-full px-6 py-5 border-2 border-black/10 rounded-2xl focus:border-black outline-none bg-white/80 font-black text-black shadow-sm placeholder:text-slate-300 resize-none uppercase tracking-widest text-xs"
            />
          </div>
        </div>
      </section>

      {/* SECCIÓN FINAL */}
      <section className="pt-20 border-t-4 border-black flex flex-col md:flex-row gap-16 items-start">
        <div className="flex-grow w-full">
          <button type="submit" disabled={isSubmitting} className={`w-full py-8 rounded-[2rem] font-black text-2xl text-[#FFFCDC] transition-all uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] ${isSubmitting ? "bg-slate-300 cursor-not-allowed" : "bg-black hover:bg-slate-800 shadow-black/30"}`}>
            {isSubmitting ? "Procesando Pipeline..." : "Enviar a Producción"}
          </button>
          {message && (
            <div className={`mt-10 p-8 rounded-2xl text-center font-black text-xs border-4 uppercase tracking-[0.3em] animate-in zoom-in-95 ${message.includes("correctamente") ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"}`}>
              {message}
            </div>
          )}
        </div>
        <div className="md:w-80 space-y-6 pt-2">
           <p className="text-[10px] font-black text-slate-400 uppercase leading-relaxed tracking-[0.2em] italic">
            * El cronograma de entrega final será validado post-depósito. S3D garantiza la integridad del activo durante el ciclo de vida del proyecto.
           </p>
           <div className="flex gap-3">
              <div className="w-3 h-3 bg-black rounded-full shadow-lg"></div>
              <div className="w-3 h-3 bg-black/10 rounded-full"></div>
              <div className="w-3 h-3 bg-black/10 rounded-full"></div>
           </div>
        </div>
      </section>
    </form>
  );
}
