"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-6 max-w-7xl mx-auto px-4">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 space-y-4 flex-shrink-0">
        <div className="panel-paper p-6 rounded-2xl border border-[var(--paper-line)] warm-shadow">
          <h2 className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.25em] mb-4 px-2">
            CONSOLA ADMIN
          </h2>
          <nav className="flex flex-col space-y-1.5">
            <NavLink href="/admin" active={pathname === "/admin"}>Resumen</NavLink>
            <NavLink href="/admin/orders" active={pathname.startsWith("/admin/orders")}>Pedidos</NavLink>
            <NavLink href="/admin/materials" active={pathname.startsWith("/admin/materials")}>Materiales</NavLink>
            <NavLink href="/admin/queue" active={pathname.startsWith("/admin/queue")}>Cola Impresión</NavLink>
            <NavLink href="/admin/carousel" active={pathname.startsWith("/admin/carousel")}>Galería Carrusel</NavLink>
            <NavLink href="/admin/users" active={pathname.startsWith("/admin/users")}>Usuarios</NavLink>
            <NavLink href="/admin/settings" active={pathname.startsWith("/admin/settings")}>Configuración</NavLink>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="panel-paper p-8 rounded-3xl border border-[var(--paper-line)] warm-shadow min-h-[650px] layer-press">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2.5 rounded-xl transition-all mono text-[10px] uppercase tracking-widest border font-medium block ${
        active
          ? "bg-[color-mix(in_srgb,var(--amber)_8%,white)] border-[var(--amber)] text-[var(--ink)] shadow-sm"
          : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-white/40"
      }`}
    >
      {children}
    </Link>
  );
}
