"use client";

import { useEffect } from "react";

interface CustomDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  type?: "alert" | "confirm" | "danger";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel: () => void;
}

export default function CustomDialog({
  isOpen,
  title,
  description,
  type = "alert",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: CustomDialogProps) {
  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200">
      <div className="w-full max-w-md bg-[var(--paper)] border border-[var(--paper-line)] rounded-2xl p-6 md:p-8 warm-shadow space-y-6 transform scale-100 transition-transform duration-200">
        
        {/* Header Seam */}
        <div className="flex items-center gap-3">
          <span className="layer-seam flex-grow h-px bg-[var(--paper-line)]" />
          <span className="mono text-[8px] uppercase tracking-[0.25em] text-[var(--ink-soft)] whitespace-nowrap">
            {isDanger ? "⚠️ Alerta del taller" : "· Mensaje del sistema ·"}
          </span>
          <span className="layer-seam flex-grow h-px bg-[var(--paper-line)]" />
        </div>

        <div className="space-y-2 text-left">
          <h3 className="text-lg font-semibold text-[var(--ink)] tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-[var(--ink-soft)] leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          {type !== "alert" && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-[var(--paper-line)] text-xs font-semibold text-[var(--ink)] bg-white/40 hover:bg-white/80 active:scale-95 transition-all cursor-pointer text-center"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
              else onCancel();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer text-center ${
              isDanger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-[var(--amber)] text-[var(--graphite)] hover:bg-[var(--amber-glow)]"
            }`}
          >
            {type === "alert" ? "Entendido" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
