export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-1.5 h-8 bg-[#FF4F00] rounded-full"></div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Protocolos y <span className="text-[#FF4F00]">Condiciones</span></h1>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-3xl p-12 shadow-sm space-y-12 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="text-[#FF4F00]">01.</span> Gestión de Datos Personales
          </h2>
          <p className="font-medium">
            En cumplimiento con la Ley 25.326, Studio3D informa que los datos recolectados (Email, WhatsApp, Nombre) se utilizan estrictamente para la coordinación técnica de manufactura y logística de entrega. No se comparten registros con entidades externas. El usuario puede solicitar la purga de su terminal de usuario enviando un ticket a soporte.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="text-[#FF4F00]">02.</span> Integridad de Activos Digitales
          </h2>
          <p className="font-medium">
            Los archivos de ingeniería (STL, STEP, 3MF) suministrados son propiedad intelectual del cliente. Studio3D actúa como un nodo de procesamiento físico y se compromete a no divulgar, clonar ni comercializar dichos diseños. Los archivos se almacenan encriptados para facilitar órdenes recurrentes de reposición.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="text-[#FF4F00]">03.</span> Protocolo de Confirmación y Seña
          </h2>
          <p className="font-medium bg-slate-100 p-6 rounded-xl border-l-4 border-[#FF4F00] italic">
            "La activación del ciclo de manufactura requiere la validación de una seña equivalente al 50% del presupuesto técnico. Una vez procesada la orden y asignada a una celda de impresión, el monto no es reembolsable debido al consumo de materia prima y reserva de tiempo operativo."
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="text-[#FF4F00]">04.</span> Estándares de Calidad
          </h2>
          <p className="font-medium">
            Studio3D garantiza la fidelidad dimensional respecto al archivo fuente. No obstante, no asumimos responsabilidad por fallos mecánicos derivados de errores de diseño original o selección inadecuada de parámetros técnicos por parte del cliente. Errores críticos de manufactura atribuibles a nuestras estaciones serán resueltos mediante reimpresión inmediata.
          </p>
        </section>

        <div className="pt-12 border-t border-slate-100 text-center">
          <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-400">Revisión: Mayo 2026 | Córdoba, AR | Studio3D</p>
        </div>
      </div>
    </div>
  );
}
