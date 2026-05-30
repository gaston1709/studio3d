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
      setTimeout(() => {
        setName(session.user.name || "");
        const fetchUserData = async () => {
          try {
            const res = await fetch('/api/auth/session');
            if (res.ok) {
              const data = await res.json();
              if (data?.user?.phone) {
                setPhone(data.user.phone);
              }
            }
          } catch {
            console.error("Error loading session");
          }
        };
        fetchUserData();
      }, 0);
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
    } catch {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = "mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]";
  const inputClass = "w-full px-4 py-3.5 border border-[var(--paper-line)] rounded-xl focus:border-[var(--amber)] outline-none text-[var(--ink)] bg-white/60 text-sm transition-colors placeholder:text-[var(--ink-soft)]/30";

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      {/* Header seam */}
      <div className="flex items-center gap-4">
        <span className="layer-seam flex-1" />
        <span className="seam-label whitespace-nowrap">— Perfil del operador —</span>
        <span className="layer-seam flex-1" />
      </div>

      <div className="pb-4">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--ink)] tracking-tight">Mi Perfil</h1>
        <p className="mono text-[10px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mt-2">Gestión de Credenciales y Contacto</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--paper)] border border-[var(--paper-line)] rounded-2xl p-8 md:p-10 warm-shadow layer-press space-y-12">
        {/* Datos Personales */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-2">
            <h3 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--amber)] flex items-center gap-3">
              <span className="w-6 h-px bg-[var(--paper-line)]" /> 01 · Información
            </h3>
            <p className="text-xs text-[var(--ink-soft)] italic">Identidad digital y enlace directo en el taller.</p>
          </div>
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Nombre Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Teléfono / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="+54 9 351 ..."
                required
              />
            </div>
          </div>
        </section>

        {/* Seguridad */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 border-t border-[var(--paper-line)]">
          <div className="md:col-span-4 space-y-2">
            <h3 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--amber)] flex items-center gap-3">
              <span className="w-6 h-px bg-[var(--paper-line)]" /> 02 · Seguridad
            </h3>
            <p className="text-xs text-[var(--ink-soft)] italic">Cambie su clave de acceso periódicamente para resguardar su cuenta.</p>
          </div>
          <div className="md:col-span-8 space-y-6">
            <div>
              <label className={labelClass}>Contraseña Actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                placeholder="Requerido si va a cambiar su contraseña"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className={labelClass}>Confirmar Nueva</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="pt-4 space-y-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-semibold text-sm text-[var(--graphite)] bg-[var(--amber)] hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="mono text-xs uppercase tracking-[0.2em]">Sincronizando...</span>
            ) : (
              "Actualizar Perfil"
            )}
          </button>
          
          {message.text && (
            <div className={`p-4 rounded-xl text-center mono text-[10px] uppercase tracking-[0.2em] border layer-press ${
              message.type === "success" 
                ? "bg-[color-mix(in_srgb,var(--amber)_10%,white)] text-[var(--ink)] border-[color-mix(in_srgb,var(--amber)_30%,var(--paper-line))]" 
                : "bg-red-50 text-red-700 border-red-200"
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
