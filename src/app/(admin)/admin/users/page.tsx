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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError("Error al cargar usuarios");
      }
    } catch (err) {
      setError("Falla de conexión");
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
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
    } catch (err) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="bg-slate-200 p-2 rounded-full hover:bg-slate-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-900" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Terminales de Usuario
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border-2 border-red-100 font-black text-xs uppercase tracking-widest text-center">
          {error}
        </div>
      )}

      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Usuario / Email</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Rango</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Teléfono</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Órdenes</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse"> Sincronizando Base de Datos... </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]"> No se encontraron terminales activas </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900 text-sm">{user.name || "Sin Nombre"}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{user.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border-2 ${
                        user.role === 'ADMIN' 
                          ? 'bg-amber-50 text-amber-600 border-amber-200' 
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900 text-[11px] uppercase tracking-tighter">
                      {user.phone || "---"}
                    </td>
                    <td className="px-8 py-6">
                       <span className="font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg text-xs">
                         {user._count.orders}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right space-x-3">
                      <button 
                        onClick={() => toggleRole(user)}
                        className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 transition-all active:scale-95 ${
                            user.role === 'ADMIN'
                            ? 'bg-white text-slate-900 border-slate-900 hover:bg-slate-900 hover:text-white'
                            : 'bg-amber-400 text-black border-amber-400 hover:bg-black hover:text-amber-400 hover:border-black'
                        }`}
                        disabled={user.email === "gastongrasso@sie.com.ar"}
                      >
                        {user.role === 'ADMIN' ? 'Revocar Admin' : 'Hacer Admin'}
                      </button>
                      <button 
                        onClick={() => deleteUser(user)}
                        className="p-2.5 rounded-xl bg-white text-red-600 border-2 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                        title="Eliminar Cuenta"
                        disabled={user.email === "gastongrasso@sie.com.ar"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
    </div>
  );
}
