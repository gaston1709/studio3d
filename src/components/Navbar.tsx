"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#f1f5f9]/85 text-slate-900 border-b border-slate-200 py-4 md:py-6 px-6 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
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

          {/* Technical Node Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/80 border border-slate-300/80 text-[8px] font-black tracking-widest uppercase text-slate-500 select-none">
            <span className="w-1.5 h-1.5 rounded-full pulse-glow-green"></span>
            NODE: ONLINE
          </div>
        </div>

        {/* Botón Hamburguesa Celu */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-slate-900 hover:text-[#FF4F00] transition-colors"
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
          {!isAdmin && (
            <>
              <Link prefetch={false} href="/orders" className="text-[10px] font-black text-slate-500 hover:text-black uppercase tracking-widest transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#FF4F00] hover:after:w-full after:transition-all after:duration-300">
                Mis Pedidos
              </Link>
              <Link prefetch={false} href="/orders/new" className="text-[10px] font-black text-slate-500 hover:text-black uppercase tracking-widest transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#FF4F00] hover:after:w-full after:transition-all after:duration-300">
                Cotizar Pieza
              </Link>
            </>
          )}
          
          {status === "authenticated" ? (
            <div className="flex items-center gap-8 border-l border-slate-200 pl-8">
              <Link href="/profile" className="text-right group/user">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 group-hover/user:text-[#FF4F00] transition-colors">Mi Perfil</p>
                <p className="text-[11px] font-black text-slate-900 leading-none group-hover/user:text-[#FF4F00] transition-colors">{session.user?.email}</p>
              </Link>

              {isAdmin && (
                <Link 
                  prefetch={false}
                  href="/admin" 
                  className="bg-[#FF4F00] text-white text-[9px] font-black px-4 py-2.5 rounded-lg hover:bg-black transition-all uppercase tracking-widest shadow-md shadow-orange-500/10"
                >
                  Admin Panel
                </Link>
              )}

              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link 
                href="/auth/signup" 
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
              >
                Registro
              </Link>
              <Link 
                href="/auth/signin" 
                className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-6 py-3 rounded-xl hover:bg-[#FF4F00] transition-all shadow-lg shadow-black/10"
              >
                Ingresar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#f1f5f9] border-b border-slate-200 p-8 space-y-8 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
          {!isAdmin && (
            <>
              <Link onClick={() => setIsMenuOpen(false)} href="/orders" className="block text-sm font-black text-slate-600 hover:text-black uppercase tracking-[0.2em] transition-colors">Mis Pedidos</Link>
              <Link onClick={() => setIsMenuOpen(false)} href="/orders/new" className="block text-sm font-black text-slate-600 hover:text-black uppercase tracking-[0.2em] transition-colors">Cotizar Pieza</Link>
            </>
          )}
          
          <div className="h-px bg-slate-200 w-full"></div>

          {status === "authenticated" ? (
            <div className="space-y-6">
              <Link onClick={() => setIsMenuOpen(false)} href="/profile" className="block">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mi Perfil</p>
                <p className="text-xs font-black text-slate-900">{session.user?.email}</p>
              </Link>
              {isAdmin && (
                <Link onClick={() => setIsMenuOpen(false)} href="/admin" className="block bg-[#FF4F00] text-white text-[10px] font-black py-4 rounded-xl text-center uppercase tracking-widest">Admin Panel</Link>
              )}
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left text-xs font-black text-red-500 uppercase tracking-widest cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link onClick={() => setIsMenuOpen(false)} href="/auth/signin" className="bg-black text-white py-5 rounded-xl font-black text-center uppercase tracking-widest text-xs hover:bg-[#FF4F00] transition-colors">Ingresar</Link>
              <Link onClick={() => setIsMenuOpen(false)} href="/auth/signup" className="border-4 border-slate-900 text-slate-900 py-4 rounded-xl font-black text-center uppercase tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all">Crear Cuenta</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
