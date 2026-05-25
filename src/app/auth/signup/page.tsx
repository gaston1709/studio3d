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
      setError("Debés aceptar los protocolos de servicio.");
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
      setError("Falla de enlace crítico");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <form 
        onSubmit={handleSubmit} 
        className="max-w-xl w-full bg-white/60 backdrop-blur-md border-2 border-black/10 rounded-[3rem] p-12 md:p-16 shadow-2xl"
      >
        <h1 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tighter uppercase text-center leading-none">
          Registro <span className="opacity-30 italic">Usuario</span>
        </h1>
        <p className="text-slate-400 font-black text-center mb-12 text-[9px] uppercase tracking-[0.4em]">Creación de Terminal de Usuario</p>

        {error && (
          <div className="bg-red-50 text-red-700 p-5 rounded-2xl border-2 border-red-100 font-black text-[10px] mb-10 text-center uppercase tracking-[0.2em]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em] ml-2">Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-5 border-2 border-black/5 rounded-2xl focus:border-black outline-none font-black text-black placeholder:text-slate-300 transition-all bg-white/50"
              placeholder="Gaston Grasso"
              required
            />
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em] ml-2">Email Corporativo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-5 border-2 border-black/5 rounded-2xl focus:border-black outline-none font-black text-black placeholder:text-slate-300 transition-all bg-white/50"
              placeholder="id@empresa.com"
              required
            />
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em] ml-2">WhatsApp / Celular</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-6 py-5 border-2 border-black/5 rounded-2xl focus:border-black outline-none font-black text-black placeholder:text-slate-300 transition-all bg-white/50"
              placeholder="+54 351 ..."
              required
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em] ml-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-5 border-2 border-black/5 rounded-2xl focus:border-black outline-none font-black text-black placeholder:text-slate-300 transition-all bg-white/50"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div>
              <label className="block text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em] ml-2">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-6 py-5 border-2 border-black/5 rounded-2xl focus:border-black outline-none font-black text-black placeholder:text-slate-300 transition-all bg-white/50"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-start gap-4 p-6 bg-black/5 rounded-2xl border-2 border-black/5">
          <input 
            type="checkbox" 
            id="terms" 
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-6 h-6 border-2 border-black rounded cursor-pointer accent-black"
          />
          <label htmlFor="terms" className="text-[10px] font-bold text-slate-600 leading-tight cursor-pointer uppercase tracking-wider">
            Acepto los <Link href="/terms" className="text-black underline font-black" target="_blank">Protocolos de Servicio</Link> y la política de privacidad de activos digitales.
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-12 bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-black/20 active:scale-95 disabled:bg-slate-300"
        >
          {isSubmitting ? "Sincronizando..." : "Activar Cuenta"}
        </button>

        <p className="mt-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          ¿Ya tenés terminal activa?{" "}
          <Link href="/auth/signin" className="text-black underline underline-offset-4 hover:opacity-50 transition-opacity ml-2">Iniciar Sesión</Link>
        </p>
      </form>
    </div>
  );
}
