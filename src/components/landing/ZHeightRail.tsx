"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Z-height progress rail — the page "prints itself" as you scroll.
 * A slim fixed vertical rail fills upward like FDM Z-height, with a moving
 * nozzle marker and a monospace CAPA/Z counter. Hidden on small screens to
 * avoid clutter / horizontal scroll. Static (no listener) under reduced motion.
 */
export default function ZHeightRail() {
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const update = () => {
      frame.current = null;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress(p);
    };

    const onScroll = () => {
      if (frame.current === null) {
        frame.current = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  // Cosmetic counters derived from scroll progress.
  const layer = Math.round(progress * 240);
  const zMm = Math.round(progress * 96);
  const fillPct = `${progress * 100}%`;

  return (
    <div
      aria-hidden="true"
      className="hidden md:flex fixed right-5 top-28 bottom-16 z-40 flex-col items-center pointer-events-none select-none"
    >
      {/* Counter */}
      <span className="mono text-[9px] tracking-[0.2em] text-[var(--amber)] mb-3 whitespace-nowrap">
        CAPA {String(layer).padStart(3, "0")} · Z {zMm}mm
      </span>

      {/* Rail track */}
      <div className="relative flex-1 w-[3px] rounded-full bg-[var(--paper-line)]/60 overflow-visible">
        {/* Fill grows upward from the bottom */}
        <div
          className="absolute bottom-0 left-0 w-full rounded-full bg-[var(--amber)]"
          style={{ height: fillPct }}
        />
        {/* Nozzle marker rides the top of the fill */}
        <div
          className="nozzle-marker absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[var(--amber)]"
          style={{ bottom: `calc(${fillPct} - 5px)` }}
        />
      </div>
    </div>
  );
}
