"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const msg = searchParams.get("msg");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciales inválidas");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FFFCDC] px-4 py-12">
      <form 
        onSubmit={handleSubmit} 
        className="max-w-md w-full bg-white/60 backdrop-blur-md border-2 border-black/10 rounded-[3rem] p-12 shadow-2xl"
      >
        <h1 className="text-4xl font-black text-black mb-10 tracking-tighter uppercase text-center leading-none">
          Acceso <span className="opacity-30 italic">Terminal</span>
        </h1>

        {msg === "registered" && (
          <div className="bg-emerald-50 text-emerald-700 p-5 rounded-2xl border-2 border-emerald-100 font-black text-[10px] mb-8 text-center uppercase tracking-[0.2em]">
            ¡Registro exitoso! Ya podés ingresar.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-5 rounded-2xl border-2 border-red-100 font-black text-[10px] mb-8 text-center uppercase tracking-[0.2em]">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <div>
            <label className="block text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.3em] ml-2">Email Usuario</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-5 border-2 border-black/5 rounded-2xl focus:border-black outline-none font-black text-black placeholder:text-slate-300 transition-all bg-white/50"
              placeholder="id@terminal.com"
              required
            />
          </div>

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
        </div>

        <button
          type="submit"
          className="w-full mt-12 bg-black text-[#FFFCDC] py-6 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-black/20 active:scale-95"
        >
          Autenticar
        </button>

        <p className="mt-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          ¿Nuevo en el nodo?{" "}
          <Link href="/auth/signup" className="text-black underline underline-offset-4 hover:opacity-50 transition-opacity ml-2">Crear Cuenta</Link>
        </p>
      </form>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-black uppercase tracking-[0.4em] animate-pulse">Cargando Terminal...</div>}>
      <SignInContent />
    </Suspense>
  );
}
