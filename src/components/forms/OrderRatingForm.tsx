"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderRatingFormProps {
  orderId: string;
}

export default function OrderRatingForm({ orderId }: OrderRatingFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Por favor, seleccioná una calificación.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, ratingComment: comment }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar la calificación");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--paper)] border border-[var(--paper-line)] p-8 rounded-2xl warm-shadow layer-press">
      <h3 className="text-xl font-semibold text-[var(--ink)] tracking-tight mb-1">
        Calificá tu pieza
      </h3>
      <p className="mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-6">
        Queremos saber cómo fue tu experiencia de manufactura en S3D
      </p>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 mono text-[9px] uppercase tracking-wider rounded-xl">
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mono block text-[9px] text-[var(--ink-soft)] mb-3 uppercase tracking-[0.28em]">
            Calificación
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoverRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform active:scale-90 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={active ? "var(--amber)" : "none"}
                    stroke={active ? "var(--amber)" : "var(--ink-soft)"}
                    strokeWidth={1.5}
                    className="w-8 h-8 transition-colors"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499c.15-.343.64-.343.79 0l2.3 4.658 5.137.747c.379.055.53.518.256.787l-3.717 3.623.878 5.117c.064.375-.329.66-.668.48l-4.594-2.414-4.594 2.414c-.339.18-.732-.105-.668-.48l.878-5.117L3.1 10.428c-.275-.269-.123-.732.257-.787l5.137-.747 2.3-4.658z"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]">
            Comentarios Adicionales
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 border border-[var(--paper-line)] rounded-xl focus:border-[var(--amber)] outline-none text-[var(--ink)] bg-white/60 text-sm min-h-[100px] transition-colors resize-none placeholder:text-[var(--ink-soft)]/30"
            placeholder="¿Qué te pareció la resolución, el material o la atención? Tu feedback nos sirve un montón..."
            maxLength={500}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full py-4 rounded-xl font-semibold text-sm text-[var(--graphite)] bg-[var(--amber)] hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="mono text-xs uppercase tracking-[0.2em]">Enviando...</span>
          ) : (
            "Enviar Calificación"
          )}
        </button>
      </form>
    </div>
  );
}
