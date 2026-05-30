"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "scroll" | "form" | "counter";

interface ZHeightRailProps {
  mode?: Mode;
  formProgress?: number; // 0-100, only used in "form" mode
  counterValue?: number; // only used in "counter" mode
  counterLabel?: string;
}

export default function ZHeightRail({
  mode = "scroll",
  formProgress = 0,
  counterValue = 0,
  counterLabel = "PIEZAS",
}: ZHeightRailProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (mode !== "scroll") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const update = () => {
      frame.current = null;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setScrollProgress(p);
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
  }, [mode]);

  const progress = mode === "scroll" ? scrollProgress : mode === "form" ? formProgress / 100 : Math.min(1, counterValue / 100);

  const layer = Math.round(progress * 240);
  const zMm = Math.round(progress * 96);
  const fillPct = `${progress * 100}%`;

  let label = `CAPA ${String(layer).padStart(3, "0")} · Z ${zMm}mm`;
  if (mode === "form") label = `PROGRESO · ${Math.round(formProgress)}%`;
  if (mode === "counter") label = `${counterValue} ${counterLabel}`;

  return (
    <div
      aria-hidden="true"
      className="hidden md:flex fixed right-5 top-28 bottom-16 z-40 flex-col items-center pointer-events-none select-none"
    >
      <span className="mono text-[9px] tracking-[0.2em] text-[var(--amber)] mb-3 whitespace-nowrap">
        {label}
      </span>

      <div className="relative flex-1 w-[3px] rounded-full bg-[var(--paper-line)]/60 overflow-visible">
        <div
          className="absolute bottom-0 left-0 w-full rounded-full bg-[var(--amber)]"
          style={{ height: fillPct }}
        />
        <div
          className="nozzle-marker absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[var(--amber)]"
          style={{ bottom: `calc(${fillPct} - 5px)` }}
        />
      </div>
    </div>
  );
}
