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

  return (
    <div className="space-y-12 bg-slate-100 min-h-screen pb-20">
      <div className="flex justify-between items-end border-b-4 border-slate-900 pb-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Gestor de <span className="text-[#FF4F00]">Showcase</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Carrusel de imágenes de la Home</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Upload Form */}
        <div className="lg:col-span-4 space-y-8">
          <form onSubmit={handleUpload} className="bg-white p-8 rounded-[2rem] border-2 border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Subir Nueva Pieza</h2>
            
            <div className="space-y-4">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Archivo (.jpg, .png)</label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-[#FF4F00] transition-all text-center group bg-slate-50">
                <input
                  id="file-input"
                  type="file"
                  required
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto group-hover:bg-orange-50 transition-colors shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-hover:text-[#FF4F00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {file ? <span className="text-[#FF4F00] truncate block max-w-full px-4">{file.name}</span> : "Seleccionar Foto"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Pie de Foto (Opcional)</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ej: Engranaje Helicoidal en PETG"
                className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:border-[#FF4F00] outline-none font-bold text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading || !file}
              className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                isUploading || !file ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-black text-white hover:bg-[#FF4F00] shadow-black/10"
              }`}
            >
              {isUploading ? "Subiendo..." : "Agregar al Carrusel"}
            </button>
          </form>
        </div>

        {/* Gallery Preview */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.length === 0 ? (
              <div className="col-span-2 py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Galería vacía</p>
              </div>
            ) : (
              images.map((img) => (
                <div key={img.id} className="bg-white rounded-[2rem] border-2 border-slate-200 overflow-hidden shadow-sm group">
                  <div className="relative aspect-video bg-slate-100">
                    <Image
                      src={`/uploads/carousel/${img.fileName}`}
                      alt={img.caption || "Showcase image"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDelete(img.id)}
                        disabled={isDeleting === img.id}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-colors shadow-xl"
                      >
                        {isDeleting === img.id ? "Borrando..." : "Eliminar Foto"}
                      </button>
                    </div>
                  </div>
                  {img.caption && (
                    <div className="p-5 border-t border-slate-100">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-widest truncate">{img.caption}</p>
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
