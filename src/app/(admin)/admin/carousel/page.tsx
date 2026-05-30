"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type CarouselImage = {
  id: string;
  fileName: string;
  caption: string | null;
  createdAt: string;
};

export default function CarouselManagerPage() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/admin/carousel");
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error("Error fetching images", error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchImages();
    }, 0);
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);

    try {
      const res = await fetch("/api/admin/carousel", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setFile(null);
        setCaption("");
        (document.getElementById("file-input") as HTMLInputElement).value = "";
        fetchImages();
      } else {
        alert("Error al subir la imagen");
      }
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta imagen del carrusel?")) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/carousel/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchImages();
      } else {
        alert("Error al eliminar la imagen");
      }
    } catch (error) {
      console.error("Delete error", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const labelClass = "mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]";
  const inputClass = "w-full px-4 py-3 border border-[var(--paper-line)] rounded-xl focus:border-[var(--amber)] outline-none text-[var(--ink)] bg-white/60 text-sm transition-colors placeholder:text-[var(--ink-soft)]/30";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[var(--paper-line)]">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">Gestor de Showcase</h1>
        <p className="mono text-[10px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mt-2">Carrusel de imágenes de la Home</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Form */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleUpload} className="panel-paper p-6 rounded-2xl border border-[var(--paper-line)] bg-white/40 warm-shadow space-y-5">
            <h2 className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.25em] mb-4">Subir Nueva Pieza</h2>
            
            <div className="space-y-3">
              <label className={labelClass}>Archivo (.jpg, .png)</label>
              <div className="relative border border-dashed border-[var(--paper-line)] rounded-xl p-6 hover:border-[var(--amber)] hover:bg-[color-mix(in_srgb,var(--amber)_3%,white)] transition-all text-center group bg-white/20">
                <input
                  id="file-input"
                  type="file"
                  required
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-white border border-[var(--paper-line)] rounded-lg flex items-center justify-center mx-auto group-hover:bg-[color-mix(in_srgb,var(--amber)_8%,white)] transition-colors shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--ink-soft)] group-hover:text-[var(--amber)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-wider">
                    {file ? <span className="text-[var(--amber)] truncate block max-w-full px-2">{file.name}</span> : "Seleccionar Foto"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className={labelClass}>Pie de Foto (Opcional)</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ej: Engranaje Helicoidal en PETG"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={isUploading || !file}
              className="w-full py-4 rounded-xl font-semibold text-sm text-[var(--graphite)] bg-[var(--amber)] hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? "Subiendo..." : "Agregar al Carrusel"}
            </button>
          </form>
        </div>

        {/* Gallery Preview */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.length === 0 ? (
              <div className="col-span-2 py-20 text-center bg-white/20 border border-dashed border-[var(--paper-line)] rounded-3xl">
                <p className="mono text-xs text-[var(--ink-soft)] uppercase tracking-widest italic">Galería vacía</p>
              </div>
            ) : (
              images.map((img) => (
                <div key={img.id} className="panel-paper rounded-2xl border border-[var(--paper-line)] overflow-hidden bg-white/40 warm-shadow group">
                  <div className="relative aspect-video bg-[var(--paper)]">
                    <Image
                      src={`/uploads/carousel/${img.fileName}`}
                      alt={img.caption || "Showcase image"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[var(--graphite)]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDelete(img.id)}
                        disabled={isDeleting === img.id}
                        className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-xl mono text-[9px] uppercase tracking-wider font-semibold transition-all active:scale-95 cursor-pointer shadow-md"
                      >
                        {isDeleting === img.id ? "Borrando..." : "Eliminar Foto"}
                      </button>
                    </div>
                  </div>
                  {img.caption && (
                    <div className="p-4 border-t border-[var(--paper-line)] bg-white/40">
                      <p className="mono text-[10px] text-[var(--ink)] uppercase tracking-wider truncate" title={img.caption}>{img.caption}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
