"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  phone: string | null;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError("Error al cargar usuarios");
      }
    } catch {
      setError("Falla de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchUsers();
    }, 0);
  }, []);

  const toggleRole = async (user: User) => {
    const newRole = user.role === "ADMIN" ? "CLIENT" : "ADMIN";
    
    if (user.email === "gastongrasso@sie.com.ar") {
        alert("No se puede revocar permisos al Administrador Principal.");
        return;
    }

    if (!confirm(`¿Confirmar cambio de rango a ${newRole} para ${user.email}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar rol");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  const deleteUser = async (user: User) => {
    if (user.email === "gastongrasso@sie.com.ar") {
        alert("No se puede eliminar la cuenta del Administrador Principal.");
        return;
    }

    if (!confirm(`⚠️ ALERTA: ¿Estás seguro de eliminar permanentemente a ${user.email}? Se borrarán TODAS sus órdenes y archivos asociados.`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== user.id));
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar usuario");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-[var(--paper-line)]">
        <Link 
          href="/admin" 
          className="bg-[var(--paper-line)]/50 p-2 rounded-full hover:bg-[var(--paper-line)] hover:scale-105 transition-all text-[var(--ink)] cursor-pointer inline-flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Terminales de Usuario
          </h1>
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-[var(--ink-soft)] mt-1">Gestión de Cuentas y Accesos</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mono text-[10px] uppercase tracking-widest text-center">
          {error}
        </div>
      )}

      <div className="overflow-x-auto -mx-8 px-8">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-[0.25em]">
              <th className="pb-2 px-6">Usuario / Email</th>
              <th className="pb-2 px-6">Rango</th>
              <th className="pb-2 px-6">Teléfono</th>
              <th className="pb-2 px-6">Órdenes</th>
              <th className="pb-2 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center bg-white/40 border border-dashed border-[var(--paper-line)] rounded-3xl mono text-xs text-[var(--ink-soft)] uppercase tracking-[0.3em] animate-pulse"> Sincronizando Base de Datos... </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center bg-white/40 border border-dashed border-[var(--paper-line)] rounded-3xl mono text-xs text-[var(--ink-soft)] uppercase tracking-[0.3em]"> No se encontraron terminales activas </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="group transition-transform duration-200">
                  <td className="py-4 px-6 bg-white/60 border-y border-l border-[var(--paper-line)] rounded-l-2xl shadow-sm">
                    <p className="font-semibold text-sm text-[var(--ink)]">{user.name || "Sin Nombre"}</p>
                    <p className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-tight mt-0.5">{user.email}</p>
                  </td>
                  <td className="py-4 px-6 bg-white/60 border-y border-[var(--paper-line)] shadow-sm">
                    <span className={`px-3 py-1 rounded-lg mono text-[8px] uppercase tracking-widest border font-semibold inline-block ${
                      user.role === 'ADMIN' 
                        ? 'bg-[color-mix(in_srgb,var(--amber)_8%,white)] border-[var(--amber)] text-[var(--ink)]' 
                        : 'bg-[var(--paper)] text-[var(--ink-soft)] border-[var(--paper-line)]'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 bg-white/60 border-y border-[var(--paper-line)] shadow-sm mono text-xs text-[var(--ink)]">
                    {user.phone || "---"}
                  </td>
                  <td className="py-4 px-6 bg-white/60 border-y border-[var(--paper-line)] shadow-sm">
                     <span className="mono text-xs text-[var(--ink)] bg-[var(--paper)] px-3 py-1.5 rounded-lg border border-[var(--paper-line)] inline-block">
                       {user._count.orders}
                     </span>
                  </td>
                  <td className="py-4 px-6 bg-white/60 border-y border-r border-[var(--paper-line)] rounded-r-2xl shadow-sm text-right space-x-2">
                    <button 
                      onClick={() => toggleRole(user)}
                      className={`px-3 py-2 rounded-xl mono text-[9px] uppercase tracking-widest border transition-all active:scale-95 cursor-pointer font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-white border-[var(--paper-line)] text-[var(--ink)] hover:border-[var(--amber)] hover:bg-[color-mix(in_srgb,var(--amber)_8%,white)]'
                          : 'bg-[var(--graphite)] text-white border-transparent hover:bg-[var(--amber)] hover:text-[var(--graphite)]'
                      }`}
                      disabled={user.email === "gastongrasso@sie.com.ar"}
                    >
                      {user.role === 'ADMIN' ? 'Revocar Admin' : 'Hacer Admin'}
                    </button>
                    <button 
                      onClick={() => deleteUser(user)}
                      className="p-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-transparent transition-all active:scale-95 disabled:opacity-30 cursor-pointer inline-flex items-center justify-center align-middle"
                      title="Eliminar Cuenta"
                      disabled={user.email === "gastongrasso@sie.com.ar"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
