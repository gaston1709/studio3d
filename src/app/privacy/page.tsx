export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-1.5 h-8 bg-[#FF4F00] rounded-full"></div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Políticas de <span className="text-[#FF4F00]">Privacidad</span></h1>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-3xl p-12 shadow-sm space-y-12 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="text-[#FF4F00]">01.</span> Información Recopilada
          </h2>
          <p className="font-medium">
            Recopilamos únicamente la información necesaria para el funcionamiento de Studio3D, como nombre, correo electrónico y archivos de diseño técnico proporcionados por el usuario. Esta información se emplea de manera exclusiva para gestionar presupuestos, procesar pagos y ejecutar la manufactura aditiva.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="text-[#FF4F00]">02.</span> Uso de la Información
          </h2>
          <p className="font-medium">
            Studio3D utiliza la información recopilada para comunicarse con el cliente sobre el estado de sus piezas, coordinar envíos o entregas y brindar soporte técnico. En ningún caso venderemos, alquilaremos ni comercializaremos datos personales o modelos 3D a terceros u otras empresas.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="text-[#FF4F00]">03.</span> Seguridad de los Archivos
          </h2>
          <p className="font-medium bg-slate-100 p-6 rounded-xl border-l-4 border-[#FF4F00] italic">
            "Todo activo digital (.STL, .STEP, .3MF) está resguardado en servidores seguros. Studio3D garantiza absoluta confidencialidad sobre la propiedad intelectual y el diseño del cliente."
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="text-[#FF4F00]">04.</span> Retención de Datos
          </h2>
          <p className="font-medium">
            Mantenemos los archivos y registros de órdenes por un tiempo prudencial para facilitar reimpresiones o reclamos. Sin embargo, cualquier cliente puede exigir la purga y destrucción total de sus modelos digitales en nuestros servidores mediante una solicitud formal por nuestros canales de contacto.
          </p>
        </section>

        <div className="pt-12 border-t border-slate-100 text-center">
          <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-400">Revisión: Mayo 2026 | Córdoba, AR | Studio3D</p>
        </div>
      </div>
    </div>
  );
}
