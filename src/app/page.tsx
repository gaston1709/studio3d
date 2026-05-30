import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ZHeightRail from "@/components/landing/ZHeightRail";
import ScrollReveal from "@/components/landing/ScrollReveal";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is admin, redirect to admin dashboard directly
  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  }

  const materials = await prisma.material.findMany({
    where: { isActive: true },
    include: {
      colors: {
        where: { isActive: true }
      }
    },
    take: 3,
  });

  const carouselImages = await prisma.carouselImage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    // Full-bleed warm wrapper. Negative margins neutralise the <main>
    // container's vertical padding so the panels touch navbar and footer.
    <div className="full-bleed -mt-8 md:-mt-12 -mb-8 md:-mb-12">
      <ZHeightRail />

      {/* ===================== CAPA 01 · HERO (paper) ===================== */}
      <section className="panel-paper relative overflow-hidden">
        <div className="absolute inset-0 layer-lines opacity-70 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 container mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 min-h-[80vh] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">

            {/* Text */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
              <p className="mono text-[11px] tracking-[0.28em] uppercase text-[color-mix(in_srgb,var(--amber)_60%,var(--ink))] layer-build" style={{ animationDelay: "0ms" }}>
                Capa 01 · El taller
              </p>
              <h1
                className="text-5xl sm:text-7xl md:text-8xl font-semibold text-[var(--ink)] tracking-tight leading-[0.95] layer-build"
                style={{ animationDelay: "90ms" }}
              >
                Imprimí <span className="text-[var(--amber)]">tus</span> ideas.
              </h1>
              <p
                className="max-w-xl text-lg sm:text-xl text-[var(--ink-soft)] leading-relaxed layer-build"
                style={{ animationDelay: "180ms" }}
              >
                Un taller. Una impresora. Lo hacemos nosotros, capa por capa.
              </p>

              <div className="layer-build w-full sm:w-auto" style={{ animationDelay: "270ms" }}>
                {!session ? (
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center justify-center rounded-xl bg-[var(--amber)] text-[var(--graphite)] px-8 py-4 font-semibold transition-colors duration-200 hover:bg-[var(--amber-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)] active:scale-95 cursor-pointer"
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="inline-flex items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ink)_30%,transparent)] text-[var(--ink)] px-8 py-4 font-medium transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)] active:scale-95 cursor-pointer"
                    >
                      Crear cuenta
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Link
                      prefetch={false}
                      href="/orders/new"
                      className="inline-flex items-center justify-center rounded-xl bg-[var(--amber)] text-[var(--graphite)] px-8 py-4 font-semibold transition-colors duration-200 hover:bg-[var(--amber-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)] active:scale-95 cursor-pointer"
                    >
                      Pedir una pieza
                    </Link>
                    <Link
                      prefetch={false}
                      href="/orders"
                      className="inline-flex items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ink)_30%,transparent)] text-[var(--ink)] px-8 py-4 font-medium transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)] active:scale-95 cursor-pointer"
                    >
                      Mis pedidos
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Logo */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end layer-build" style={{ animationDelay: "150ms" }}>
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80">
                <Image
                  src="/logo.png"
                  alt="S3D Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================== CAPA 02 · MATERIALES (graphite) ===================== */}
      <section className="panel-graphite">
        <div className="container mx-auto px-6 pt-12 flex items-center gap-4">
          <span className="layer-seam flex-1" />
          <span className="seam-label whitespace-nowrap">— Capa 02 · Materiales —</span>
          <span className="layer-seam flex-1" />
        </div>

        <ScrollReveal>
          <div className="container mx-auto px-6 py-16 md:py-24 space-y-12">
            <div className="flex flex-wrap justify-between items-end gap-6">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-5xl font-semibold text-[var(--paper)] tracking-tight leading-none">Materiales</h2>
                <p className="mono text-[10px] tracking-[0.28em] uppercase text-[var(--amber-glow)]">Lo que tenemos en el taller</p>
              </div>
              <Link
                prefetch={false}
                href="/orders/new"
                className="mono text-xs uppercase tracking-[0.2em] text-[var(--amber-glow)] hover:opacity-70 transition-opacity duration-200 cursor-pointer"
              >
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {materials.map((m) => (
                <div key={m.id} className="bg-[var(--paper)] text-[var(--ink)] rounded-2xl overflow-hidden flex flex-col shadow-xl shadow-black/30 group">
                  <div className="p-8 space-y-5 flex-grow flex flex-col">
                    <h3 className="text-2xl font-semibold tracking-tight">{m.name}</h3>
                    <p className="text-sm text-[var(--ink-soft)] leading-relaxed italic flex-grow">&quot;{m.description}&quot;</p>
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {m.colors.map((c) => (
                        <div
                          key={c.id}
                          className="w-7 h-7 rounded-full border border-[var(--paper-line)] shadow-inner group-hover:scale-110 transition-transform duration-200"
                          style={{ backgroundColor: c.hexCode }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Printed bottom edge — layer lines */}
                  <div className="layer-lines h-4 w-full" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===================== CAPA 03 · SHOWCASE (paper) ===================== */}
      {carouselImages.length > 0 && (
        <section className="panel-paper">
          <div className="container mx-auto px-6 pt-12 flex items-center gap-4">
            <span className="layer-seam flex-1" />
            <span className="seam-label whitespace-nowrap">— Capa 03 · Hecho por nosotros —</span>
            <span className="layer-seam flex-1" />
          </div>

          <ScrollReveal>
            <div className="container mx-auto px-6 py-16 md:py-24 space-y-12">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-5xl font-semibold text-[var(--ink)] tracking-tight leading-none">Piezas reales</h2>
                <p className="mono text-[10px] tracking-[0.28em] uppercase text-[color-mix(in_srgb,var(--amber)_60%,var(--ink))]">Cosas que salieron de la impresora</p>
              </div>

              <div className="relative w-full">
                <div
                  id="showcase-scroll"
                  className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth gap-6 pb-6"
                >
                  {carouselImages.map((img) => (
                    <div key={img.id} className="w-[85vw] md:w-[40vw] lg:w-[28vw] flex-shrink-0 snap-center">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/5 h-full flex flex-col border border-[var(--paper-line)]">
                        <div className="aspect-square bg-[color-mix(in_srgb,var(--paper)_60%,white)] relative overflow-hidden">
                          <Image
                            src={`/uploads/carousel/${img.fileName}`}
                            alt={img.caption || "Showcase"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 85vw, (max-width: 1024px) 40vw, 28vw"
                          />
                        </div>
                        {img.caption && (
                          <div className="p-6 flex-grow flex items-center justify-center">
                            <p className="text-[13px] text-[var(--ink-soft)] leading-relaxed italic text-center">
                              &quot;{img.caption}&quot;
                            </p>
                          </div>
                        )}
                        {/* Printed bottom edge */}
                        <div className="layer-lines h-3 w-full" aria-hidden="true" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Auto-scroll script — paused under reduced motion */}
                <script dangerouslySetInnerHTML={{ __html: `
                  (function() {
                    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                    const el = document.getElementById('showcase-scroll');
                    setInterval(() => {
                      if (!el) return;
                      if (el.scrollLeft + el.offsetWidth >= el.scrollWidth - 50) {
                        el.scrollTo({ left: 0, behavior: 'smooth' });
                        return;
                      }
                      el.scrollBy({ left: el.offsetWidth * 0.4, behavior: 'smooth' });
                    }, 5000);
                  })();
                `}} />
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* ===================== CAPA 04 · CTA (graphite) ===================== */}
      <section className="panel-graphite relative overflow-hidden">
        <div className="absolute inset-0 layer-lines-dark opacity-60 pointer-events-none" aria-hidden="true" />
        <div className="container mx-auto px-6 pt-12 flex items-center gap-4 relative z-10">
          <span className="layer-seam flex-1" />
          <span className="seam-label whitespace-nowrap">— Capa 04 · Tu pieza —</span>
          <span className="layer-seam flex-1" />
        </div>

        <ScrollReveal>
          <div className="container mx-auto px-6 py-20 md:py-32 text-center space-y-8 relative z-10">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-semibold text-[var(--paper)] tracking-tight leading-[0.95]">
              ¿Hacemos tu pieza?
            </h2>
            <p className="text-lg sm:text-xl text-[color-mix(in_srgb,var(--paper)_70%,transparent)] max-w-xl mx-auto leading-relaxed">
              Contanos qué necesitás y lo imprimimos, capa por capa. Te pasamos un presupuesto sin vueltas.
            </p>
            <div className="pt-4">
              <Link
                prefetch={false}
                href="/orders/new"
                className="inline-flex items-center justify-center rounded-xl bg-[var(--amber)] text-[var(--graphite)] px-10 py-5 text-lg font-semibold transition-colors duration-200 hover:bg-[var(--amber-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--graphite)] active:scale-95 cursor-pointer"
              >
                Empezar mi pieza
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
