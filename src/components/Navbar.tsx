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
    <nav className="bg-[var(--paper)]/85 text-[var(--ink)] border-b border-[var(--paper-line)] py-4 md:py-5 px-6 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center group cursor-pointer">
          <div className="relative w-28 md:w-36 h-11 md:h-14 overflow-hidden">
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
          aria-label="Abrir menú"
          className="md:hidden p-2 text-[var(--ink)] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {!isAdmin && (
            <>
              <Link prefetch={false} href="/orders" className="text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors duration-200">
                Mis Pedidos
              </Link>
              <Link prefetch={false} href="/orders/new" className="text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors duration-200">
                Cotizar Pieza
              </Link>
            </>
          )}

          {status === "authenticated" ? (
            <div className="flex items-center gap-6 border-l border-[var(--paper-line)] pl-8">
              <Link href="/profile" className="text-right group/user">
                <p className="mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-soft)] leading-none mb-1 group-hover/user:text-[var(--amber)] transition-colors duration-200">Mi Perfil</p>
                <p className="text-xs font-medium text-[var(--ink)] leading-none">{session.user?.email}</p>
              </Link>

              {isAdmin && (
                <Link
                  prefetch={false}
                  href="/admin"
                  className="bg-[var(--amber)] text-[var(--graphite)] text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-[var(--amber-glow)] transition-colors duration-200 cursor-pointer"
                >
                  Admin Panel
                </Link>
              )}

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs font-medium text-[var(--ink-soft)] hover:text-red-600 transition-colors duration-200 cursor-pointer"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/auth/signup"
                className="text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors duration-200"
              >
                Registro
              </Link>
              <Link
                href="/auth/signin"
                className="text-sm font-semibold bg-[var(--amber)] text-[var(--graphite)] px-6 py-2.5 rounded-xl hover:bg-[var(--amber-glow)] transition-colors duration-200 cursor-pointer"
              >
                Ingresar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[var(--paper)] border-b border-[var(--paper-line)] p-8 space-y-7 shadow-2xl">
          {!isAdmin && (
            <>
              <Link onClick={() => setIsMenuOpen(false)} href="/orders" className="block text-base font-medium text-[var(--ink)]">Mis Pedidos</Link>
              <Link onClick={() => setIsMenuOpen(false)} href="/orders/new" className="block text-base font-medium text-[var(--ink)]">Cotizar Pieza</Link>
            </>
          )}

          <div className="h-px bg-[var(--paper-line)] w-full"></div>

          {status === "authenticated" ? (
            <div className="space-y-6">
              <Link onClick={() => setIsMenuOpen(false)} href="/profile" className="block">
                <p className="mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-1">Mi Perfil</p>
                <p className="text-sm font-medium text-[var(--ink)]">{session.user?.email}</p>
              </Link>
              {isAdmin && (
                <Link onClick={() => setIsMenuOpen(false)} href="/admin" className="block bg-[var(--amber)] text-[var(--graphite)] text-sm font-semibold py-4 rounded-xl text-center">Admin Panel</Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left text-sm font-medium text-red-600 cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link onClick={() => setIsMenuOpen(false)} href="/auth/signin" className="bg-[var(--amber)] text-[var(--graphite)] py-4 rounded-xl font-semibold text-center text-sm">Ingresar</Link>
              <Link onClick={() => setIsMenuOpen(false)} href="/auth/signup" className="border border-[color-mix(in_srgb,var(--ink)_30%,transparent)] py-4 rounded-xl font-medium text-center text-sm text-[var(--ink)]">Crear Cuenta</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
