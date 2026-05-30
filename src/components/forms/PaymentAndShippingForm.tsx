"use client";

import { useState, useEffect } from "react";
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
  const [paymentInfo, setPaymentInfo] = useState({ alias: "3D.PRINT.HUB.CBA", cbu: "0000000000000000000000" });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.paymentAlias) {
          setPaymentInfo({ alias: data.paymentAlias, cbu: data.paymentCbu });
        }
      })
      .catch(err => console.error("Error loading payment info:", err));
  }, []);

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
    } catch {
      setMessage("Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Envío */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
          <span className="w-8 h-[2px] bg-slate-400"></span> 01. Método de Entrega
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {shippingOptions.map((opt) => (
            <label 
              key={opt.id}
              className={`flex items-center justify-between p-5 border-4 rounded-3xl cursor-pointer transition-all ${
                shippingMethod === opt.id 
                  ? "border-[#FF4F00] bg-white shadow-xl shadow-orange-950/5 scale-[1.01]" 
                  : "border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <input 
                  type="radio" 
                  name="shipping" 
                  value={opt.id} 
                  checked={shippingMethod === opt.id}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="w-5 h-5 text-[#FF4F00] border-2 border-slate-900 focus:ring-[#FF4F00] accent-[#FF4F00]"
                />
                <div>
                  <p className="font-black text-slate-900 text-sm uppercase tracking-wide">{opt.label}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{opt.desc}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Pago */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
          <span className="w-8 h-[2px] bg-slate-400"></span> 02. Comprobante de Seña (${depositAmount.toFixed(2)})
        </h3>
        
        <div className="bg-white border-4 border-slate-900 p-8 rounded-3xl mb-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Cuentas de Transferencia (50% Seña)</p>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-100 pb-3 gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alias</span>
              <span className="text-sm font-black text-[#FF4F00] uppercase tracking-wider">{paymentInfo.alias}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CBU</span>
              <span className="text-sm font-black text-slate-900 tracking-widest">{paymentInfo.cbu}</span>
            </div>
          </div>
        </div>

        <div className="relative border-4 border-dashed border-slate-300 rounded-3xl p-10 hover:border-[#FF4F00] transition-all text-center group bg-white">
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
          <div className="space-y-4">
            <div className="w-12 h-12 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-[#FF4F00]/5 group-hover:border-[#FF4F00]/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 group-hover:text-[#FF4F00] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
              {file ? (
                <span className="text-[#FF4F00] border-b-2 border-[#FF4F00] pb-0.5">{file.name}</span>
              ) : (
                <>
                  Arrastrá o hacé click para subir <br />
                  <span className="text-[8px] text-slate-400 mt-1 block">PNG, JPG o PDF (máx. 5MB)</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-6 rounded-2xl font-black text-white transition-all uppercase tracking-[0.2em] shadow-xl text-xs active:scale-[0.98] ${
          isSubmitting 
            ? "bg-slate-300 cursor-not-allowed" 
            : "bg-slate-900 hover:bg-[#FF4F00] shadow-slate-900/10"
        }`}
      >
        {isSubmitting ? "Cargando Transacción..." : "Confirmar y Subir Comprobante"}
      </button>

      {message && (
        <div className="p-6 bg-emerald-50 text-emerald-800 rounded-2xl text-center font-black text-[10px] border-2 border-emerald-200 uppercase tracking-[0.2em] animate-in zoom-in-95">
          {message}
        </div>
      )}
    </form>
  );
}
