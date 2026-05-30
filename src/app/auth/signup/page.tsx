"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Tenés que aceptar los términos de servicio.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone, name }),
      });

      if (res.ok) {
        router.push("/auth/signin?msg=registered");
      } else {
        const data = await res.json();
        setError(data.error || "Error de registro");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center panel-paper px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl w-full bg-[var(--paper)] border border-[var(--paper-line)] rounded-2xl p-10 md:p-12 warm-shadow layer-press"
      >
        <h1 className="text-3xl font-semibold text-[var(--ink)] mb-2 tracking-tight">
          Creá tu cuenta
        </h1>
        <p className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.28em] mb-8">
          Un taller. Una impresora. Empezamos cuando vos querés.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mono text-[10px] mb-8 tracking-[0.2em] uppercase layer-press">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]">Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 border border-[var(--paper-line)] rounded-xl focus:border-[var(--amber)] outline-none text-[var(--ink)] placeholder:text-[var(--ink-soft)]/40 transition-colors bg-white/60 text-sm"
              placeholder="Tu nombre"
              required
            />
          </div>

          <div>
            <label className="mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 border border-[var(--paper-line)] rounded-xl focus:border-[var(--amber)] outline-none text-[var(--ink)] placeholder:text-[var(--ink-soft)]/40 transition-colors bg-white/60 text-sm"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]">WhatsApp / Celular</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3.5 border border-[var(--paper-line)] rounded-xl focus:border-[var(--amber)] outline-none text-[var(--ink)] placeholder:text-[var(--ink-soft)]/40 transition-colors bg-white/60 text-sm"
              placeholder="+54 351 ..."
              required
            />
          </div>

          <div>
            <label className="mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 border border-[var(--paper-line)] rounded-xl focus:border-[var(--amber)] outline-none text-[var(--ink)] placeholder:text-[var(--ink-soft)]/40 transition-colors bg-white/60 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3.5 border border-[var(--paper-line)] rounded-xl focus:border-[var(--amber)] outline-none text-[var(--ink)] placeholder:text-[var(--ink-soft)]/40 transition-colors bg-white/60 text-sm"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3 p-4 bg-[color-mix(in_srgb,var(--paper-line)_30%,transparent)] rounded-xl border border-[var(--paper-line)]">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 border border-[var(--paper-line)] rounded cursor-pointer accent-[var(--amber)]"
          />
          <label htmlFor="terms" className="mono text-[10px] text-[var(--ink-soft)] leading-relaxed cursor-pointer tracking-[0.15em]">
            Acepto los{" "}
            <Link href="/terms" className="text-[var(--amber)] hover:text-[var(--ink)] transition-colors" target="_blank">
              Términos de Servicio
            </Link>{" "}
            y la política de privacidad.
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-8 bg-[var(--amber)] text-[var(--graphite)] py-4 rounded-xl font-semibold hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 disabled:opacity-60 text-sm"
        >
          {isSubmitting ? (
            <span className="mono text-xs uppercase tracking-[0.2em]">Creando cuenta...</span>
          ) : (
            "Crear cuenta"
          )}
        </button>

        <p className="mt-8 text-center mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.2em]">
          ¿Ya tenés cuenta?{" "}
          <Link href="/auth/signin" className="text-[var(--amber)] hover:text-[var(--ink)] transition-colors ml-1">Entrá</Link>
        </p>
      </form>
    </div>
  );
}
