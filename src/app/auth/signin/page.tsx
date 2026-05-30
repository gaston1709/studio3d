"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function BootText({ text, onDone }: { text: string; onDone: () => void }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(onDone, 300);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text, onDone]);

  return (
    <span className="mono text-[10px] uppercase tracking-[0.28em] text-[var(--amber)]">
      {shown}<span className="animate-pulse">_</span>
    </span>
  );
}

function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [booted, setBooted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const msg = searchParams.get("msg");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciales inválidas");
      setIsLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center panel-paper px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-[var(--paper)] border border-[var(--paper-line)] rounded-2xl p-10 warm-shadow layer-press"
      >
        {/* Boot sequence */}
        <div className="mb-6 h-5">
          {!booted && <BootText text="INICIANDO SESIÓN..." onDone={() => setBooted(true)} />}
        </div>

        <h1 className="text-3xl font-semibold text-[var(--ink)] mb-8 tracking-tight leading-tight">
          Entrá
        </h1>

        {msg === "registered" && (
          <div className="bg-[color-mix(in_srgb,var(--amber)_10%,white)] text-[var(--ink)] p-4 rounded-xl border border-[var(--paper-line)] mono text-[10px] mb-6 tracking-[0.2em] uppercase layer-press">
            ¡Registro exitoso! Ya podés ingresar.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mono text-[10px] mb-6 tracking-[0.2em] uppercase layer-press">
            {error}
          </div>
        )}

        <div className="space-y-6">
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

          <div className="relative">
            <label className="mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]">Contraseña</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 border border-[var(--paper-line)] rounded-xl focus:border-[var(--amber)] outline-none text-[var(--ink)] placeholder:text-[var(--ink-soft)]/40 transition-colors bg-white/60 text-sm pr-12"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[2.6rem] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-8 relative overflow-hidden bg-[var(--amber)] text-[var(--graphite)] py-4 rounded-xl font-semibold hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 disabled:opacity-60"
        >
          {isLoading ? (
            <span className="mono text-xs uppercase tracking-[0.2em]">Verificando...</span>
          ) : (
            <span className="text-sm font-semibold">Entrar</span>
          )}
        </button>

        <p className="mt-8 text-center mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.2em]">
          ¿Primera vez?{" "}
          <Link href="/auth/signup" className="text-[var(--amber)] hover:text-[var(--ink)] transition-colors ml-1">Creá tu cuenta</Link>
        </p>
      </form>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center panel-paper">
        <span className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--amber)] animate-pulse">Cargando...</span>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
