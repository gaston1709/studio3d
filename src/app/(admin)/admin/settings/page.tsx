"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PaymentSettingsPage() {
  const [alias, setAlias] = useState("");
  const [cbu, setCbu] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setAlias(data.paymentAlias);
        setCbu(data.paymentCbu);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchSettings();
    }, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentAlias: alias, paymentCbu: cbu }),
      });

      if (res.ok) {
        setMessage("Configuración guardada correctamente");
      } else {
        setMessage("Error al guardar la configuración");
      }
    } catch {
      setMessage("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-400">Sincronizando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin" 
          className="bg-slate-200 p-2 rounded-full hover:bg-slate-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-900" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
          Configuración <span className="opacity-30 italic">de Pagos</span>
        </h1>
      </div>

      <div className="bg-white border-4 border-slate-900 p-12 rounded-[3rem] shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 gap-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 block ml-2">Alias de CBU/CVU</label>
              <input
                type="text"
                required
                value={alias}
                onChange={(e) => setAlias(e.target.value.toUpperCase())}
                placeholder="STUDIO3D.CBA"
                className="w-full px-8 py-6 border-2 border-black/5 rounded-2xl focus:border-black outline-none bg-slate-50 font-black text-xl text-slate-900 transition-all uppercase"
              />
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-3 ml-2 italic">Se mostrará tal cual al cliente en el checkout.</p>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 block ml-2">Número de CBU / CVU</label>
              <input
                type="text"
                required
                value={cbu}
                onChange={(e) => setCbu(e.target.value)}
                placeholder="0000000000000000000000"
                className="w-full px-8 py-6 border-2 border-black/5 rounded-2xl focus:border-black outline-none bg-slate-50 font-black text-xl text-slate-900 transition-all"
              />
            </div>
          </div>

          {message && (
            <div className={`p-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center border-2 ${
              message.includes("Error") ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-black/20 active:scale-95 disabled:bg-slate-300"
          >
            {isSaving ? "Guardando..." : "Actualizar Datos de Pago"}
          </button>
        </form>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-[2.5rem]">
         <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           Información Importante
         </p>
         <p className="text-xs font-bold text-slate-700 leading-relaxed uppercase">
           Los cambios realizados en este panel se reflejarán inmediatamente en la pantalla de pago de todos los clientes. Asegúrese de que los datos sean correctos para evitar confusiones en las transferencias.
         </p>
      </div>
    </div>
  );
}
