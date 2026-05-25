"use client";

import { useEffect, useState } from "react";

interface PrinterState {
  id: string;
  name: string;
  model: string;
  status: "printing" | "idle" | "heating";
  pieceName: string;
  progress: number;
  nozzleTemp: number;
  targetNozzleTemp: number;
  bedTemp: number;
  targetBedTemp: number;
  speed: number;
  material: string;
  timeRemaining: string;
}

const INITIAL_PRINTERS: PrinterState[] = [
  {
    id: "p1",
    name: "Impresora Alfa",
    model: "Bambu Lab X1-Carbon",
    status: "printing",
    pieceName: "Soporte_Motor_CNC.gcode",
    progress: 42,
    nozzleTemp: 220,
    targetNozzleTemp: 220,
    bedTemp: 60,
    targetBedTemp: 60,
    speed: 250,
    material: "PLA-CF Carbono",
    timeRemaining: "01:24:12"
  },
  {
    id: "p2",
    name: "Impresora Beta",
    model: "Voron 2.4 Custom",
    status: "printing",
    pieceName: "Engranaje_Helicoidal.gcode",
    progress: 89,
    nozzleTemp: 245,
    targetNozzleTemp: 245,
    bedTemp: 100,
    targetBedTemp: 100,
    speed: 180,
    material: "ABS Industrial",
    timeRemaining: "00:14:35"
  },
  {
    id: "p3",
    name: "Impresora Gamma",
    model: "Original Prusa MK4",
    status: "idle",
    pieceName: "Ninguna (Lista)",
    progress: 0,
    nozzleTemp: 22,
    targetNozzleTemp: 0,
    bedTemp: 21,
    targetBedTemp: 0,
    speed: 0,
    material: "Ninguno",
    timeRemaining: "--:--:--"
  }
];

const GCODE_PIECES = [
  "Carcasa_Electronica.gcode",
  "Engranaje_Reductor.gcode",
  "Piston_Mecanico.gcode",
  "Acople_Flexible.gcode",
  "Soporte_GoPro.gcode",
  "Pieza_Puzzle_A.gcode",
  "Rotor_Turbina.gcode"
];

const MATERIALS = ["PLA Técnico", "PETG Reforzado", "ABS Industrial", "TPU Flexible"];

export default function FactoryFarmMonitor() {
  const [printers, setPrinters] = useState<PrinterState[]>(INITIAL_PRINTERS);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrinters((prevPrinters) =>
        prevPrinters.map((printer) => {
          // If printer is idle, it has a 30% chance of starting a new print
          if (printer.status === "idle") {
            if (Math.random() < 0.15) {
              const randomMaterial = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
              const randomPiece = GCODE_PIECES[Math.floor(Math.random() * GCODE_PIECES.length)];
              const targetNozzle = randomMaterial.includes("ABS") ? 245 : randomMaterial.includes("PETG") ? 235 : 220;
              const targetBed = randomMaterial.includes("ABS") ? 100 : randomMaterial.includes("PETG") ? 75 : 60;
              
              return {
                ...printer,
                status: "heating",
                pieceName: randomPiece,
                progress: 0,
                nozzleTemp: 22,
                targetNozzleTemp: targetNozzle,
                bedTemp: 21,
                targetBedTemp: targetBed,
                speed: 0,
                material: randomMaterial,
                timeRemaining: "Preparando..."
              };
            }
            return printer;
          }

          // If printer is heating, heat it up
          if (printer.status === "heating") {
            const nextNozzle = Math.min(printer.nozzleTemp + 15, printer.targetNozzleTemp);
            const nextBed = Math.min(printer.bedTemp + 8, printer.targetBedTemp);
            
            if (nextNozzle >= printer.targetNozzleTemp && nextBed >= printer.targetBedTemp) {
              const randomMins = Math.floor(30 + Math.random() * 120);
              return {
                ...printer,
                status: "printing",
                nozzleTemp: printer.targetNozzleTemp,
                bedTemp: printer.targetBedTemp,
                speed: printer.model.includes("Bambu") ? 250 : printer.model.includes("Voron") ? 180 : 120,
                timeRemaining: `0${Math.floor(randomMins / 60)}:${(randomMins % 60).toString().padStart(2, '0')}:00`
              };
            }

            return {
              ...printer,
              nozzleTemp: nextNozzle,
              bedTemp: nextBed
            };
          }

          // If printer is printing, advance progress
          if (printer.status === "printing") {
            const nextProgress = printer.progress + 1;
            
            // Fluctuating telemetry
            const nozzleFluct = printer.targetNozzleTemp + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);
            const bedFluct = printer.targetBedTemp + (Math.random() > 0.5 ? 0.3 : -0.3) * Math.random();

            if (nextProgress >= 100) {
              // Finish printing, set to idle
              return {
                ...printer,
                status: "idle",
                pieceName: "Ninguna (Lista)",
                progress: 0,
                nozzleTemp: 50, // cooling down
                targetNozzleTemp: 0,
                bedTemp: 45, // cooling down
                targetBedTemp: 0,
                speed: 0,
                material: "Ninguno",
                timeRemaining: "--:--:--"
              };
            }

            // Estimate new time remaining
            const totalSecondsLeft = Math.round((100 - nextProgress) * (printer.model.includes("Bambu") ? 8 : 15));
            const hrs = Math.floor(totalSecondsLeft / 3600).toString().padStart(2, '0');
            const mins = Math.floor((totalSecondsLeft % 3600) / 60).toString().padStart(2, '0');
            const secs = Math.floor(totalSecondsLeft % 60).toString().padStart(2, '0');

            return {
              ...printer,
              progress: nextProgress,
              nozzleTemp: nozzleFluct,
              bedTemp: parseFloat(bedFluct.toFixed(1)),
              timeRemaining: `${hrs}:${mins}:${secs}`
            };
          }

          return printer;
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {printers.map((printer) => (
        <div 
          key={printer.id} 
          className="bg-white border-2 border-slate-900 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between technical-corner shadow-md hover:shadow-lg hover:border-[#FF4F00] transition-all relative overflow-hidden"
        >
          {/* Header Panel */}
          <div>
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                  {printer.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  {printer.model}
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  printer.status === "printing" 
                    ? "bg-green-500 pulse-led-green" 
                    : printer.status === "heating" 
                    ? "bg-[#FF4F00] pulse-led-orange" 
                    : "bg-slate-300"
                }`} />
                <span className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-600">
                  {printer.status === "printing" 
                    ? "IMPRIMIENDO" 
                    : printer.status === "heating" 
                    ? "CALENTANDO" 
                    : "DISPONIBLE"}
                </span>
              </div>
            </div>

            {/* Simulated Live Animation Box */}
            <div className="h-32 bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden border border-slate-800 mb-6">
              
              {/* Radial grid overlay */}
              <div className="absolute inset-0 opacity-15 dark-industrial-grid" />

              {/* SVG Animation of Printer Frame */}
              <svg className="w-40 h-24 relative z-10" viewBox="0 0 100 60">
                {/* Outer frame */}
                <rect x="10" y="5" width="80" height="50" rx="3" fill="none" stroke="#334155" strokeWidth="2.5" />
                {/* Print bed horizontal plate */}
                <line 
                  x1="12" 
                  y1={printer.status === "printing" ? `${15 + printer.progress * 0.3}` : "45"} 
                  x2="88" 
                  y2={printer.status === "printing" ? `${15 + printer.progress * 0.3}` : "45"} 
                  stroke="#475569" 
                  strokeWidth="3" 
                />

                {/* Print head assembly */}
                {printer.status === "printing" ? (
                  <>
                    {/* Toolhead X-axis guide rail */}
                    <line x1="12" y1="15" x2="88" y2="15" stroke="#1e293b" strokeWidth="2.5" />
                    
                    {/* Toolhead body moving back and forth */}
                    <g className="animate-pulse">
                      <rect 
                        x="0" 
                        y="10" 
                        width="8" 
                        height="8" 
                        rx="1.5" 
                        fill="#0f172a" 
                        stroke="#FF4F00"
                        strokeWidth="1"
                        style={{
                          transform: "translateX(0px)",
                          animation: "printerHeadMove 1.5s ease-in-out infinite alternate"
                        }}
                      />
                      {/* Nozzle glowing tip */}
                      <circle 
                        cx="4" 
                        cy="18" 
                        r="1" 
                        fill="#FF4F00" 
                        style={{
                          transform: "translateX(0px)",
                          animation: "printerHeadMove 1.5s ease-in-out infinite alternate"
                        }}
                      />
                    </g>

                    {/* Extruded layer growing on the bed */}
                    <path 
                      d={`M 25,${15 + printer.progress * 0.3} L 75,${15 + printer.progress * 0.3}`} 
                      stroke="#FF4F00" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                  </>
                ) : printer.status === "heating" ? (
                  <>
                    {/* Pulsing glow inside printer to show heating */}
                    <circle cx="50" cy="30" r="12" fill="#FF4F00" opacity="0.15" className="animate-ping" />
                    <text x="50" y="33" textAnchor="middle" fill="#FF4F00" fontSize="7" fontWeight="bold" fontFamily="monospace">HEATING</text>
                  </>
                ) : (
                  <>
                    <text x="50" y="33" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold" fontFamily="monospace">ONLINE / READY</text>
                  </>
                )}
              </svg>

              {/* Status telemetry label on top of SVG */}
              {printer.status === "printing" && (
                <div className="absolute bottom-2 right-2 bg-slate-900/90 border border-slate-800 rounded px-1.5 py-0.5 text-[8px] font-mono text-green-400 font-bold uppercase tracking-widest">
                  FEEDRATE: {printer.speed}mm/s
                </div>
              )}
            </div>

            {/* Telemetry log list */}
            <div className="space-y-2.5 text-xs font-mono mb-6">
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Pieza:</span>
                <span className="text-slate-900 font-bold max-w-[160px] truncate" title={printer.pieceName}>
                  {printer.pieceName.replace(".gcode", "")}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Material:</span>
                <span className="text-slate-800">{printer.material}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Temp. Boquilla:</span>
                <span className="text-slate-800">
                  <span className="text-[#FF4F00] font-bold">{printer.nozzleTemp}°C</span> 
                  {printer.targetNozzleTemp > 0 && ` / ${printer.targetNozzleTemp}°C`}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Temp. Cama:</span>
                <span className="text-slate-800">
                  <span className="text-slate-900 font-bold">{printer.bedTemp}°C</span> 
                  {printer.targetBedTemp > 0 && ` / ${printer.targetBedTemp}°C`}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Restante:</span>
                <span className="text-[#FF4F00] font-black">{printer.timeRemaining}</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Avance del ciclo</span>
              <span className="text-xs font-mono font-bold text-slate-900">{printer.progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF4F00] rounded-full transition-all duration-500"
                style={{ width: `${printer.progress}%` }}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Insert inline styles for custom animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes printerHeadMove {
          0% { transform: translateX(15px); }
          100% { transform: translateX(65px); }
        }
      `}} />
    </div>
  );
}
