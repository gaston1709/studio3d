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
  const [materials, setMaterials] = useState(initialMaterials);
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

  return (
    <div className="space-y-16 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-100 pb-10 gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Inventario de <span className="text-blue-600">Polímeros</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Control de Materia Prima y Catálogo</p>
        </div>
        <button 
          onClick={() => { setEditingMaterial({ name: "", description: "", isActive: true }); setIsMaterialModalOpen(true); }}
          className="bg-[#0F1115] text-white px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10 active:scale-95"
        >
          + Registrar Material
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {materials.map((material) => (
          <div key={material.id} className={`bg-white border rounded-[2rem] overflow-hidden shadow-sm transition-all ${material.isActive ? 'border-slate-200 hover:border-slate-300' : 'border-red-100 opacity-60 grayscale'}`}>
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <div className={`w-2 h-2 rounded-full ${material.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{material.name}</h2>
                </div>
                <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">{material.description}</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setEditingMaterial(material); setIsMaterialModalOpen(true); }}
                  className="text-[10px] font-bold bg-white border border-slate-200 px-5 py-2.5 rounded-lg hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest active:scale-95 shadow-sm"
                >
                  Editar
                </button>
                <button 
                  onClick={() => toggleMaterialStatus(material.id, material.isActive)}
                  className={`text-[10px] font-bold bg-white border px-5 py-2.5 rounded-lg transition-all uppercase tracking-widest active:scale-95 shadow-sm ${material.isActive ? 'border-red-100 hover:bg-red-600 hover:text-white text-red-500' : 'border-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-500'}`}
                >
                  {material.isActive ? "Suspender" : "Activar"}
                </button>
              </div>
            </div>
            
            <div className="p-10 bg-white">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
                <span className="h-[1px] w-12 bg-slate-200"></span>
                Gama de Colores Disponibles
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {material.colors.filter(c => c.isActive).map((color) => (
                  <div key={color.id} className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white transition-all group relative">
                    <div 
                      className="w-16 h-16 rounded-full border-4 border-white shadow-xl group-hover:scale-110 transition-transform cursor-pointer" 
                      style={{ backgroundColor: color.hexCode }}
                      onClick={() => { setEditingColor({ ...color, materialId: material.id }); setIsColorModalOpen(true); }}
                    />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">{color.name}</span>
                    <button 
                      onClick={() => deleteColor(color.id)}
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-600 font-bold text-xl transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => { setEditingColor({ name: "", hexCode: "#000000", materialId: material.id, isActive: true }); setIsColorModalOpen(true); }}
                  className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200 p-6 rounded-2xl text-slate-400 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-2xl group-hover:border-blue-600 transition-colors">+</div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Nuevo Color</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL MATERIAL */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="bg-[#0F1115] p-8 text-white">
               <h2 className="text-2xl font-black tracking-tighter uppercase">{editingMaterial?.id ? "Editar Material" : "Nuevo Material"}</h2>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Configuración de Base Polimérica</p>
            </div>
            <form onSubmit={saveMaterial} className="p-8 space-y-6">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nombre del Material</label>
                <input 
                  type="text" required 
                  value={editingMaterial?.name || ""} 
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                  placeholder="Ej: Carbon Fiber Nylon" 
                  className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:border-blue-600 outline-none font-bold text-slate-900" 
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Descripción Técnica</label>
                <textarea 
                  required rows={3}
                  value={editingMaterial?.description || ""} 
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                  placeholder="Propiedades mecánicas y acabado..." 
                  className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:border-blue-600 outline-none font-bold text-slate-900 resize-none" 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="flex-1 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={isLoading}
                  className="flex-[2] bg-[#0F1115] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="bg-[#0F1115] p-8 text-white text-center">
               <h2 className="text-xl font-black tracking-tighter uppercase">{editingColor?.id ? "Editar Color" : "Nuevo Color"}</h2>
               <div 
                 className="w-16 h-16 rounded-full border-4 border-white/20 mx-auto mt-6 shadow-2xl transition-all" 
                 style={{ backgroundColor: editingColor?.hexCode }} 
               />
            </div>
            <form onSubmit={saveColor} className="p-8 space-y-6">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nombre del Color</label>
                <input 
                  type="text" required 
                  value={editingColor?.name || ""} 
                  onChange={(e) => setEditingColor({ ...editingColor, name: e.target.value })}
                  placeholder="Ej: Industrial Grey" 
                  className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:border-blue-600 outline-none font-bold text-slate-900" 
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Código Hexadecimal</label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    value={editingColor?.hexCode || "#000000"} 
                    onChange={(e) => setEditingColor({ ...editingColor, hexCode: e.target.value })}
                    className="h-14 w-14 rounded-xl cursor-pointer border-none bg-transparent" 
                  />
                  <input 
                    type="text" required 
                    value={editingColor?.hexCode || ""} 
                    onChange={(e) => setEditingColor({ ...editingColor, hexCode: e.target.value })}
                    className="flex-grow px-5 py-4 border border-slate-200 rounded-xl focus:border-blue-600 outline-none font-bold text-slate-900 uppercase" 
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsColorModalOpen(false)}
                  className="flex-1 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={isLoading}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
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
