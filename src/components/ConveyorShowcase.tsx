"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface CarouselImage {
  id: string;
  fileName: string;
  caption: string | null;
}

interface ConveyorShowcaseProps {
  images: CarouselImage[];
}

export default function ConveyorShowcase({ images }: ConveyorShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!containerRef.current || !railRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current || !railRef.current) {
            ticking = false;
            return;
          }
          const container = containerRef.current;
          const rail = railRef.current;
          const rect = container.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          if (rect.top < windowHeight && rect.bottom > 0) {
            const totalDistance = windowHeight + rect.height;
            const currentDistance = windowHeight - rect.top;
            const progress = Math.min(Math.max(currentDistance / totalDistance, 0), 1);

            const maxTranslation = 300; // max translation in pixels
            const translationX = -(progress * maxTranslation) + 50;

            rail.style.transform = `translateX(${translationX}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on load to position correctly
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Technical metadata mock generator for showcase items (appeals to design students)
  const getTechnicalMeta = (index: number) => {
    const materials = ["PLA-CF Carbono", "PETG Translúcido", "TPU Flexible (95A)", "ABS Técnico"];
    const layerHeights = ["0.12mm (Ultra Fino)", "0.16mm (Fino)", "0.20mm (Estándar)", "0.28mm (Draft)"];
    const times = ["2h 45m", "5h 12m", "1h 30m", "8h 22m"];
    
    return {
      material: materials[index % materials.length],
      layer: layerHeights[index % layerHeights.length],
      time: times[index % times.length],
      tolerance: "± 0.1 mm"
    };
  };

  return (
    <div ref={containerRef} className="w-full overflow-hidden py-10 relative">
      
      {/* Sleek horizontal steel guide rails (1px lines) */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200 -translate-y-20 z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-250 translate-y-24 z-0 pointer-events-none" />

      {/* Parallax Conveyor Belt Rail */}
      <div 
        ref={railRef} 
        className="conveyor-rail flex gap-10 px-6 relative z-10"
        style={{ transform: "translateX(50px)" }}
      >
        {images.map((img, idx) => {
          const meta = getTechnicalMeta(idx);
          return (
            <div 
              key={img.id} 
              className="w-[280px] sm:w-[340px] flex-shrink-0 bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md hover:border-[#FF4F00] transition-all duration-300 flex flex-col"
            >
              {/* Product Photo */}
              <div className="aspect-square bg-slate-50 relative overflow-hidden border-b border-slate-100">
                <Image
                  src={`/uploads/carousel/${img.fileName}`}
                  alt={img.caption || "Pieza Fabricada S3D"}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 640px) 280px, 340px"
                />
              </div>

              {/* Technical Spec Label */}
              <div className="p-6 space-y-4 bg-white flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-1 leading-none">
                    {img.caption || `Pieza S3D #${idx + 1}`}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">
                    REGISTRY: PRT-{1000 + idx}
                  </p>
                </div>

                {/* Micro tech specs */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  <div>
                    <span className="text-[8px] text-slate-300 block leading-none mb-1">Polímero</span>
                    <span className="text-slate-700 font-bold leading-none">{meta.material}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-300 block leading-none mb-1">Altura Capa</span>
                    <span className="text-slate-700 font-bold leading-none">{meta.layer}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-300 block leading-none mb-1">Tiempo</span>
                    <span className="text-[#FF4F00] font-black leading-none">{meta.time}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-300 block leading-none mb-1">Tolerancia</span>
                    <span className="text-slate-700 font-bold leading-none">{meta.tolerance}</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
