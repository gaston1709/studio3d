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
      setError("Por favor, selecciona una calificación.");
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
    <div className="bg-white border-4 border-slate-900 p-8 rounded-[2.5rem] shadow-xl">
      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
        Califica tu Pieza
      </h3>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
        Queremos saber cómo fue tu experiencia de manufactura en S3D
      </p>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border-4 border-red-500 rounded-xl text-red-700 font-black text-xs uppercase tracking-wider">
          🚨 {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Calificación
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoverRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={active ? "#FF4F00" : "none"}
                    stroke="#000"
                    strokeWidth={2.5}
                    className="w-10 h-10 transition-colors"
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
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Comentarios Adicionales
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 border-4 border-slate-900 rounded-xl font-bold text-slate-900 focus:border-[#FF4F00] outline-none bg-slate-50 min-h-[120px] transition-colors resize-none"
            placeholder="¿Qué te pareció la resolución, el material o la atención? Tu feedback nos sirve un montón..."
            maxLength={500}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#FF4F00] hover:shadow-[#FF4F00]/10 border-4 border-slate-900 transition-all shadow-xl active:scale-95 disabled:bg-slate-300 disabled:border-slate-300"
        >
          {isSubmitting ? "Enviando..." : "Enviar Calificación"}
        </button>
      </form>
    </div>
  );
}
