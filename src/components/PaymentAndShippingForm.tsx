"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentAndShippingForm({ 
  orderId, 
  depositAmount,
  email 
}: { 
  orderId: string; 
  depositAmount: number;
  email?: string;
}) {
  const router = useRouter();
  const [shippingMethod, setShippingMethod] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const shippingOptions = [
    { id: "local", label: "Retiro en local (CBA Capital)", desc: "Sin costo adicional" },
    { id: "point_nv", label: "Punto Retiro: Nueva Córdoba", desc: "Zona Buen Pastor" },
    { id: "point_ga", label: "Punto Retiro: General Paz", desc: "Plaza principal" },
    { id: "moto", label: "Envío en Moto / Uber", desc: "Costo a cargo del cliente al recibir" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingMethod || !file) {
      alert("Completá el envío y subí el comprobante.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("shippingMethod", shippingMethod);
    formData.append("status", "PAYMENT_PENDING_VERIFICATION");

    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMessage("¡Comprobante enviado! Validaremos el pago y comenzaremos la impresión.");
        setTimeout(() => router.push(`/orders?email=${email}`), 3000);
      } else {
        setMessage("Error al enviar el comprobante.");
      }
    } catch (error) {
      setMessage("Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Envío */}
      <div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">1. Método de Entrega</h3>
        <div className="grid grid-cols-1 gap-3">
          {shippingOptions.map((opt) => (
            <label 
              key={opt.id}
              className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                shippingMethod === opt.id ? "border-blue-600 bg-blue-50" : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <input 
                  type="radio" 
                  name="shipping" 
                  value={opt.id} 
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-black text-slate-900 text-sm">{opt.label}</p>
                  <p className="text-xs font-bold text-slate-500">{opt.desc}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Pago */}
      <div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">2. Comprobante de Seña (${depositAmount.toFixed(2)})</h3>
        <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl mb-4">
          <p className="text-xs font-bold text-slate-600 mb-2">Datos para transferencia:</p>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">Alias: <span className="text-blue-600">3D.PRINT.HUB.CBA</span></p>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">CBU: <span className="text-blue-600">0000000000000000000000</span></p>
          </div>
        </div>

        <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-blue-500 transition-all text-center group bg-white">
          <input
            type="file"
            required
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              if (selectedFile) {
                const ext = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();
                const allowed = ['.png', '.jpg', '.jpeg', '.pdf'];
                if (!allowed.includes(ext)) {
                  alert("Formato no válido. Solo se permiten archivos PNG, JPG o PDF.");
                  e.target.value = "";
                  setFile(null);
                  return;
                }
              }
              setFile(selectedFile);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-blue-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              {file ? <span className="text-blue-600">{file.name}</span> : "Subir foto del comprobante"}
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-4 rounded-xl font-black text-white transition-all uppercase tracking-widest shadow-xl ${
          isSubmitting ? "bg-slate-300 cursor-not-allowed" : "bg-slate-900 hover:bg-blue-600 shadow-slate-900/10"
        }`}
      >
        {isSubmitting ? "Enviando..." : "Confirmar y Pagar Seña"}
      </button>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-center font-black text-sm border-2 border-emerald-100 uppercase tracking-widest">
          {message}
        </div>
      )}
    </form>
  );
}
