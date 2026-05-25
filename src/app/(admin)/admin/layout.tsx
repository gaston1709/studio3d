import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8 py-8 md:py-12 w-full">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-4">
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
          <h2 className="text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4 px-2">
            Administración
          </h2>
          <nav className="flex flex-col space-y-1">
            <NavLink href="/admin">Resumen</NavLink>
            <NavLink href="/admin/orders">Pedidos</NavLink>
            <NavLink href="/admin/materials">Materiales</NavLink>
            <NavLink href="/admin/queue">Cola de Impresión</NavLink>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-200 min-h-[600px]">
          {children}
        </div>
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-all text-slate-900 font-black text-sm border-2 border-transparent hover:border-slate-900"
    >
      {children}
    </Link>
  );
}
