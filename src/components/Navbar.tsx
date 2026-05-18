"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#FFFCDC] text-black border-b border-black/10 py-4 md:py-6 px-6 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center group">
          <div className="relative w-32 md:w-40 h-12 md:h-16 overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="S3D Logo" 
              fill 
              className="object-contain transition-transform group-hover:scale-105"
              priority
            />
          </div>
        </Link>

        {/* Botón Hamburguesa Celu */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-black"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-10">
          <Link prefetch={false} href="/orders" className="text-[10px] font-black text-slate-500 hover:text-black uppercase tracking-widest transition-colors">
            Mis Pedidos
          </Link>
          <Link prefetch={false} href="/orders/new" className="text-[10px] font-black text-slate-500 hover:text-black uppercase tracking-widest transition-colors">
            Cotizar Pieza
          </Link>
          
          {status === "authenticated" ? (
            <div className="flex items-center gap-8 border-l border-black/10 pl-8">
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Usuario</p>
                <p className="text-[11px] font-black text-black leading-none">{session.user?.email}</p>
              </div>

              {isAdmin && (
                <Link 
                  prefetch={false}
                  href="/admin" 
                  className="bg-black text-[#FFFCDC] text-[9px] font-black px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-all uppercase tracking-widest"
                >
                  Admin Panel
                </Link>
              )}

              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link 
                href="/auth/signup" 
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black"
              >
                Registro
              </Link>
              <Link 
                href="/auth/signin" 
                className="text-[10px] font-black uppercase tracking-widest bg-black text-[#FFFCDC] px-6 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-black/10"
              >
                Ingresar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#FFFCDC] border-b border-black/10 p-8 space-y-8 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
          <Link onClick={() => setIsMenuOpen(false)} href="/orders" className="block text-sm font-black text-black uppercase tracking-[0.2em]">Mis Pedidos</Link>
          <Link onClick={() => setIsMenuOpen(false)} href="/orders/new" className="block text-sm font-black text-black uppercase tracking-[0.2em]">Cotizar Pieza</Link>
          
          <div className="h-px bg-black/10 w-full"></div>

          {status === "authenticated" ? (
            <div className="space-y-6">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Usuario</p>
                <p className="text-xs font-black text-black">{session.user?.email}</p>
              </div>
              {isAdmin && (
                <Link onClick={() => setIsMenuOpen(false)} href="/admin" className="block bg-black text-[#FFFCDC] text-[10px] font-black py-4 rounded-xl text-center uppercase tracking-widest">Admin Panel</Link>
              )}
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left text-xs font-black text-red-600 uppercase tracking-widest"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link onClick={() => setIsMenuOpen(false)} href="/auth/signin" className="bg-black text-[#FFFCDC] py-5 rounded-xl font-black text-center uppercase tracking-widest text-xs">Ingresar</Link>
              <Link onClick={() => setIsMenuOpen(false)} href="/auth/signup" className="border-4 border-black py-4 rounded-xl font-black text-center uppercase tracking-widest text-xs text-black">Crear Cuenta</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
