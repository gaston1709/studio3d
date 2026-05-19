"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function UserSettings() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      // Fetch phone from a dedicated call if needed, or assume it's in session if updated
      const fetchUserData = async () => {
          const res = await fetch('/api/auth/session');
          const data = await res.json();
          if (data?.user?.phone) setPhone(data.user.phone);
      };
      fetchUserData();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ text: "Las contraseñas nuevas no coinciden", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Perfil actualizado correctamente", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        update(); // Refresh session
      } else {
        setMessage({ text: data.error || "Error al actualizar", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-16 border-b-4 border-black pb-8">
        <h1 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">Mi Perfil</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Gestión de Credenciales y Contacto</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-16">
        {/* Datos Personales */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
                <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em] mb-4 flex items-center gap-4">
                    <span className="w-8 h-[2px] bg-black"></span> 01. Info
                </h3>
                <p className="text-xs text-slate-500 font-medium italic">"Identidad digital y enlace directo."</p>
            </div>
            <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em]">Nombre Completo</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-6 py-4 border-2 border-black/5 rounded-2xl focus:border-black outline-none font-black text-black bg-white/50"
                    />
                </div>
                <div>
                    <label className="block text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em]">Teléfono / WhatsApp</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-6 py-4 border-2 border-black/5 rounded-2xl focus:border-black outline-none font-black text-black bg-white/50"
                        placeholder="+54 9 351 ..."
                    />
                </div>
            </div>
        </section>

        {/* Seguridad */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 pt-16 border-t-2 border-black/5">
            <div className="md:col-span-4">
                <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em] mb-4 flex items-center gap-4">
                    <span className="w-8 h-[2px] bg-black"></span> 02. Seguridad
                </h3>
                <p className="text-xs text-slate-500 font-medium italic">"Cambie su clave de acceso periódicamente."</p>
            </div>
            <div className="md:col-span-8 space-y-8">
                <div>
                    <label className="block text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em]">Contraseña Actual</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-6 py-4 border-2 border-black/5 rounded-2xl focus:border-black outline-none font-black text-black bg-white/50"
                        placeholder="Requerido para cambiar contraseña"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em]">Nueva Contraseña</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-6 py-4 border-2 border-black/5 rounded-2xl focus:border-black outline-none font-black text-black bg-white/50"
                        />
                    </div>
                    <div>
                        <label className="block text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em]">Confirmar Nueva</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-6 py-4 border-2 border-black/5 rounded-2xl focus:border-black outline-none font-black text-black bg-white/50"
                        />
                    </div>
                </div>
            </div>
        </section>

        <div className="pt-10 flex flex-col gap-6">
            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-[0.98] ${isSubmitting ? 'bg-slate-300' : 'bg-black text-white hover:bg-slate-800 shadow-black/20'}`}
            >
                {isSubmitting ? "Sincronizando..." : "Actualizar Perfil"}
            </button>
            {message.text && (
                <div className={`p-6 rounded-2xl text-center font-black text-[10px] border-2 uppercase tracking-[0.2em] animate-in zoom-in-95 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                    {message.text}
                </div>
            )}
        </div>
      </form>
    </div>
  );
}
