"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Color {
  id: string;
  name: string;
  hexCode: string;
  isActive: boolean;
}

interface Material {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  colors: Color[];
}

export default function MaterialManager({ initialMaterials }: { initialMaterials: Material[] }) {
  const router = useRouter();
  const [materials] = useState(initialMaterials);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  
  const [editingMaterial, setEditingMaterial] = useState<Partial<Material> | null>(null);
  const [editingColor, setEditingColor] = useState<Partial<Color> & { materialId?: string } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  async function saveMaterial(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMaterial),
      });
      if (res.ok) {
        setIsMaterialModalOpen(false);
        router.refresh();
        // Since we are in a client component with local state, we might need a better way to sync or just let refresh happen.
        // For now, let's assume refresh works or the user can just reload.
        window.location.reload(); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveColor(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingColor),
      });
      if (res.ok) {
        setIsColorModalOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleMaterialStatus(id: string, currentStatus: boolean) {
    if (!confirm("¿Seguro que desea cambiar el estado de este material?")) return;
    try {
      await fetch("/api/admin/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteColor(id: string) {
    if (!confirm("¿Desea desactivar este color?")) return;
    try {
      await fetch("/api/admin/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: false }),
      });
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  }

  const labelClass = "mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]";
  const inputClass = "w-full px-4 py-3 border border-[var(--paper-line)] rounded-xl focus:border-[var(--amber)] outline-none text-[var(--ink)] bg-white/60 text-sm transition-colors placeholder:text-[var(--ink-soft)]/30";

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[var(--paper-line)] pb-8 gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">Inventario de Polímeros</h1>
          <p className="mono text-[10px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mt-1.5">Control de Materia Prima y Catálogo</p>
        </div>
        <button 
          onClick={() => { setEditingMaterial({ name: "", description: "", isActive: true }); setIsMaterialModalOpen(true); }}
          className="bg-[var(--graphite)] text-white hover:bg-[var(--amber)] hover:text-[var(--graphite)] px-6 py-3 rounded-xl mono text-[10px] uppercase tracking-wider font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          + Registrar Material
        </button>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 gap-8">
        {materials.map((material) => (
          <div 
            key={material.id} 
            className={`panel-paper rounded-3xl border overflow-hidden warm-shadow transition-all ${
              material.isActive 
                ? 'border-[var(--paper-line)] bg-white/40' 
                : 'border-red-200 opacity-60 grayscale bg-red-50/10'
            }`}
          >
            <div className="bg-[color-mix(in_srgb,var(--paper)_60%,white)] p-6 border-b border-[var(--paper-line)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                   <div className={`w-2 h-2 rounded-full ${material.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                   <h2 className="text-xl font-semibold tracking-tight text-[var(--ink)] uppercase">{material.name}</h2>
                </div>
                <p className="text-xs text-[var(--ink-soft)] max-w-2xl leading-relaxed">{material.description}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setEditingMaterial(material); setIsMaterialModalOpen(true); }}
                  className="bg-white border border-[var(--paper-line)] px-4 py-2 rounded-xl mono text-[9px] uppercase tracking-widest text-[var(--ink)] hover:border-[var(--amber)] hover:bg-[color-mix(in_srgb,var(--amber)_8%,white)] transition-all font-semibold active:scale-95 cursor-pointer"
                >
                  Editar
                </button>
                <button 
                  onClick={() => toggleMaterialStatus(material.id, material.isActive)}
                  className={`px-4 py-2 rounded-xl mono text-[9px] uppercase tracking-widest transition-all font-semibold active:scale-95 cursor-pointer ${
                    material.isActive 
                      ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-transparent' 
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-transparent'
                  }`}
                >
                  {material.isActive ? "Suspender" : "Activar"}
                </button>
              </div>
            </div>
            
            <div className="p-6 bg-white/20">
              <h3 className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                <span className="h-[1px] w-6 bg-[var(--paper-line)]" />
                Gama de Colores Disponibles
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {material.colors.filter(c => c.isActive).map((color) => (
                  <div 
                    key={color.id} 
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/60 border border-[var(--paper-line)] hover:border-[var(--amber)] hover:bg-white/90 transition-all group relative"
                  >
                    <div 
                      className="w-12 h-12 rounded-full border border-[var(--paper-line)] shadow-md group-hover:scale-105 transition-transform cursor-pointer" 
                      style={{ backgroundColor: color.hexCode }}
                      onClick={() => { setEditingColor({ ...color, materialId: material.id }); setIsColorModalOpen(true); }}
                    />
                    <span className="mono text-[8px] text-[var(--ink)] uppercase tracking-wider text-center font-medium truncate w-full px-1">{color.name}</span>
                    <button 
                      onClick={() => deleteColor(color.id)}
                      className="absolute top-1 right-1.5 text-[var(--ink-soft)] hover:text-red-600 font-medium text-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => { setEditingColor({ name: "", hexCode: "#000000", materialId: material.id, isActive: true }); setIsColorModalOpen(true); }}
                  className="flex flex-col items-center justify-center gap-3 border border-dashed border-[var(--paper-line)] bg-white/20 p-4 rounded-2xl text-[var(--ink-soft)] hover:border-[var(--amber)] hover:text-[var(--amber)] hover:bg-[color-mix(in_srgb,var(--amber)_5%,white)] transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full border border-dashed border-[var(--paper-line)] flex items-center justify-center text-lg group-hover:border-[var(--amber)] transition-colors">+</div>
                  <span className="mono text-[8px] uppercase tracking-wider font-semibold">Nuevo Color</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL MATERIAL */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 bg-[var(--graphite)]/85 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[var(--paper)] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[var(--paper-line)] animate-in zoom-in-95 duration-200">
            <div className="bg-[var(--graphite)] p-6 border-b border-[var(--graphite-line)] text-white">
               <span className="mono text-[8px] text-[var(--amber)] uppercase tracking-[0.25em]">MÓDULO DE INVENTARIO</span>
               <h2 className="text-xl font-semibold tracking-tight uppercase mt-1">{editingMaterial?.id ? "Editar Material" : "Nuevo Material"}</h2>
            </div>
            <form onSubmit={saveMaterial} className="p-6 space-y-6">
              <div>
                <label className={labelClass}>Nombre del Material</label>
                <input 
                  type="text" required 
                  value={editingMaterial?.name || ""} 
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                  placeholder="Ej: Carbon Fiber Nylon" 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Descripción Técnica</label>
                <textarea 
                  required rows={3}
                  value={editingMaterial?.description || ""} 
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                  placeholder="Propiedades mecánicas y acabado..." 
                  className={inputClass + " resize-none"} 
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="flex-1 py-3 text-xs font-semibold mono uppercase tracking-wider text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={isLoading}
                  className="flex-[2] py-3.5 rounded-xl font-semibold text-sm text-[var(--graphite)] bg-[var(--amber)] hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL COLOR */}
      {isColorModalOpen && (
        <div className="fixed inset-0 bg-[var(--graphite)]/85 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[var(--paper)] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-[var(--paper-line)] animate-in zoom-in-95 duration-200">
            <div className="bg-[var(--graphite)] p-6 border-b border-[var(--graphite-line)] text-white text-center">
               <span className="mono text-[8px] text-[var(--amber)] uppercase tracking-[0.25em]">MÓDULO DE COLORES</span>
               <h2 className="text-xl font-semibold tracking-tight uppercase mt-1">{editingColor?.id ? "Editar Color" : "Nuevo Color"}</h2>
               <div 
                 className="w-12 h-12 rounded-full border border-white/20 mx-auto mt-4 shadow-md transition-all" 
                 style={{ backgroundColor: editingColor?.hexCode }} 
               />
            </div>
            <form onSubmit={saveColor} className="p-6 space-y-6">
              <div>
                <label className={labelClass}>Nombre del Color</label>
                <input 
                  type="text" required 
                  value={editingColor?.name || ""} 
                  onChange={(e) => setEditingColor({ ...editingColor, name: e.target.value })}
                  placeholder="Ej: Industrial Grey" 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Código Hexadecimal</label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    value={editingColor?.hexCode || "#000000"} 
                    onChange={(e) => setEditingColor({ ...editingColor, hexCode: e.target.value })}
                    className="h-12 w-12 rounded-xl cursor-pointer border border-[var(--paper-line)] shrink-0" 
                  />
                  <input 
                    type="text" required 
                    value={editingColor?.hexCode || ""} 
                    onChange={(e) => setEditingColor({ ...editingColor, hexCode: e.target.value })}
                    className={inputClass + " uppercase font-mono"} 
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsColorModalOpen(false)}
                  className="flex-1 py-3 text-xs font-semibold mono uppercase tracking-wider text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={isLoading}
                  className="flex-[2] py-3.5 rounded-xl font-semibold text-sm text-[var(--graphite)] bg-[var(--amber)] hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Guardando..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
