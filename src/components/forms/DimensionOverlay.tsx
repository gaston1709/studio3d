"use client";

interface DimensionOverlayProps {
  dimensions: { x: number; y: number; z: number };
}

export default function DimensionOverlay({ dimensions }: DimensionOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-6 select-none flex flex-col justify-between">
      {/* Top Left info */}
      <div className="mono text-[8px] uppercase tracking-[0.2em] text-[var(--paper)]/60 bg-[var(--graphite)]/60 backdrop-blur-md p-3 rounded-xl border border-[var(--graphite-line)] w-max">
        <p className="text-[var(--amber)]">S3D · COTA GEOMÉTRICA</p>
        <p className="mt-1 text-[8px]">PRECISIÓN: ±0.1mm</p>
      </div>

      {/* SVG for Cotas */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Bottom X dimension line */}
        <g className="mono text-[8px] tracking-[0.1em]">
          {/* Left tick */}
          <line x1="15%" y1="90%" x2="15%" y2="94%" stroke="var(--amber)" strokeWidth="1" />
          {/* Right tick */}
          <line x1="85%" y1="90%" x2="85%" y2="94%" stroke="var(--amber)" strokeWidth="1" />
          {/* Horizontal line */}
          <line x1="15%" y1="92%" x2="85%" y2="92%" stroke="var(--amber)" strokeWidth="1" strokeDasharray="3,3" />
          {/* Text center label */}
          <text x="50%" y="92%" dominantBaseline="middle" textAnchor="middle" fill="var(--amber)" className="font-mono text-[10px]" stroke="var(--graphite)" strokeWidth="4" paintOrder="stroke fill">
            X: {dimensions.x}mm
          </text>
        </g>

        {/* Right Z dimension line */}
        <g className="mono text-[8px] tracking-[0.1em]">
          {/* Top tick */}
          <line x1="90%" y1="15%" x2="94%" y2="15%" stroke="var(--amber)" strokeWidth="1" />
          {/* Bottom tick */}
          <line x1="90%" y1="85%" x2="94%" y2="85%" stroke="var(--amber)" strokeWidth="1" />
          {/* Vertical line */}
          <line x1="92%" y1="15%" x2="92%" y2="85%" stroke="var(--amber)" strokeWidth="1" strokeDasharray="3,3" />
          {/* Text label */}
          <text x="92%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="var(--amber)" className="font-mono text-[10px]" stroke="var(--graphite)" strokeWidth="4" paintOrder="stroke fill" transform="rotate(-90 92 50)">
            Z: {dimensions.z}mm
          </text>
        </g>

        {/* Depth Y dimension line (diagonal in bottom-left corner) */}
        <g className="mono text-[8px] tracking-[0.1em]">
          {/* Diag tick 1 */}
          <line x1="15%" y1="73%" x2="12%" y2="76%" stroke="var(--amber)" strokeWidth="1" />
          {/* Diag tick 2 */}
          <line x1="25%" y1="63%" x2="22%" y2="66%" stroke="var(--amber)" strokeWidth="1" />
          {/* Diagonal line */}
          <line x1="13.5%" y1="74.5%" x2="23.5%" y2="64.5%" stroke="var(--amber)" strokeWidth="1" strokeDasharray="3,3" />
          {/* Text label */}
          <text x="18.5%" y="69.5%" dominantBaseline="middle" textAnchor="middle" fill="var(--amber)" className="font-mono text-[10px]" stroke="var(--graphite)" strokeWidth="4" paintOrder="stroke fill">
            Y: {dimensions.y}mm
          </text>
        </g>
      </svg>
    </div>
  );
}
