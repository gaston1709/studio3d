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
  const [shippingOptions, setShippingOptions] = useState<Array<{ id: string; label: string; desc: string }>>([
    { id: "local", label: "Retiro en local (CBA Capital)", desc: "Sin costo adicional" },
    { id: "point_nv", label: "Punto Retiro: Nueva Córdoba", desc: "Zona Buen Pastor" },
    { id: "point_ga", label: "Punto Retiro: General Paz", desc: "Plaza principal" },
    { id: "moto", label: "Envío en Moto / Uber", desc: "Costo a cargo del cliente al recibir" },
  ]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.paymentAlias) {
          setPaymentInfo({ alias: data.paymentAlias, cbu: data.paymentCbu });
        }
        if (data.shippingOptions && Array.isArray(data.shippingOptions)) {
          setShippingOptions(data.shippingOptions);
        }
      })
      .catch(err => console.error("Error loading payment info:", err));
  }, []);

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Envío */}
      <div className="space-y-4">
        <h3 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] flex items-center gap-3">
          <span className="w-6 h-px bg-[var(--paper-line)]" /> 01 · Método de Entrega
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {shippingOptions.map((opt) => (
            <label 
              key={opt.id}
              className={`flex items-center justify-between p-5 border rounded-2xl cursor-pointer transition-all perimeter-card ${
                shippingMethod === opt.id 
                  ? "border-[var(--amber)] bg-[color-mix(in_srgb,var(--amber)_5%,white)] warm-shadow" 
                  : "border-[var(--paper-line)] bg-white/60 hover:border-[var(--ink-soft)]"
              }`}
            >
              <div className="flex items-center gap-4">
                <input 
                  type="radio" 
                  name="shipping" 
                  value={opt.id} 
                  checked={shippingMethod === opt.id}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="w-4 h-4 text-[var(--amber)] border-[var(--paper-line)] focus:ring-[var(--amber)] accent-[var(--amber)] cursor-pointer"
                />
                <div>
                  <p className="font-semibold text-[var(--ink)] text-sm">{opt.label}</p>
                  <p className="text-xs text-[var(--ink-soft)] mt-1">{opt.desc}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Pago */}
      <div className="space-y-4">
        <h3 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] flex items-center gap-3">
          <span className="w-6 h-px bg-[var(--paper-line)]" /> 02 · Seña (${depositAmount.toFixed(2)})
        </h3>
        
        <div className="bg-white border border-[var(--paper-line)] p-6 rounded-2xl shadow-sm">
          <p className="mono text-[8px] uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-4">Cuentas de Transferencia (50% Seña)</p>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-[var(--paper-line)] pb-3 gap-2">
              <span className="mono text-[9px] uppercase tracking-widest text-[var(--ink-soft)]">Alias</span>
              <span className="text-sm font-semibold text-[var(--amber)] uppercase tracking-wider">{paymentInfo.alias}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="mono text-[9px] uppercase tracking-widest text-[var(--ink-soft)]">CBU</span>
              <span className="text-sm font-semibold text-[var(--ink)] tracking-widest">{paymentInfo.cbu}</span>
            </div>
          </div>
        </div>

        <div className="relative border-2 border-dashed border-[var(--paper-line)] rounded-2xl p-8 hover:border-[var(--amber)] hover:bg-[color-mix(in_srgb,var(--amber)_3%,transparent)] transition-all text-center group bg-white/60">
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
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[var(--paper)] border border-[var(--paper-line)] rounded-xl flex items-center justify-center mx-auto group-hover:bg-[color-mix(in_srgb,var(--amber)_5%,white)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--ink-soft)] group-hover:text-[var(--amber)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.2em] leading-relaxed">
              {file ? (
                <span className="text-[var(--amber)] border-b border-[var(--amber)] pb-0.5">{file.name}</span>
              ) : (
                <>
                  Arrastrá o hacé click para subir <br />
                  <span className="text-[8px] text-[var(--ink-soft)]/50 mt-1 block">PNG, JPG o PDF (máx. 5MB)</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 rounded-xl font-semibold text-sm text-[var(--graphite)] bg-[var(--amber)] hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="mono text-xs uppercase tracking-[0.2em]">Cargando Transacción...</span>
        ) : (
          "Confirmar y Subir Comprobante"
        )}
      </button>

      {message && (
        <div className="p-4 bg-[color-mix(in_srgb,var(--amber)_10%,white)] text-[var(--ink)] border border-[var(--paper-line)] rounded-xl text-center mono text-[10px] uppercase tracking-[0.2em] layer-press">
          {message}
        </div>
      )}
    </form>
  );
}
