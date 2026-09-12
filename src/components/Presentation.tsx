import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { SLIDES } from "@/lib/presentation/slides";
import { PresentationEngine } from "@/lib/presentation/engine";

// URLs de los QR del cierre (slide 13). Cámbialas si las memorias tienen otro enlace.
const QR_MEMORIAS = "https://www.upb.edu.co/es/centro-de-eventos-forum";
const QR_REDES = "https://www.instagram.com/centrodeeventosupb";

export default function Presentation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PresentationEngine | null>(null);
  const [index, setIndex] = useState(0);
  const [qr, setQr] = useState<{ memorias: string; redes: string } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new PresentationEngine(canvasRef.current);
    engineRef.current = engine;
    engine.setSlide(0);
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setSlide(index);
    engineRef.current?.setPhoto(SLIDES[index]?.photo);
  }, [index]);

  useEffect(() => {
    const opts = { width: 420, margin: 1, color: { dark: "#0b0d14", light: "#ffffff" } };
    Promise.all([
      QRCode.toDataURL(QR_MEMORIAS, opts),
      QRCode.toDataURL(QR_REDES, opts),
    ]).then(([memorias, redes]) => setQr({ memorias, redes }));
  }, []);

  const go = useCallback((dir: number) => {
    setIndex((i) => Math.min(SLIDES.length - 1, Math.max(0, i + dir)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight" || e.key === "PageDown" || e.key === "Enter") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key.toLowerCase() === "f") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const slide = SLIDES[index]!;
  const isLast = index === SLIDES.length - 1;

  return (
    <main
      className="fixed inset-0 overflow-hidden bg-background select-none cursor-none"
      onClick={() => go(1)}
      onContextMenu={(e) => {
        e.preventDefault();
        go(-1);
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Zona de texto: plano semitransparente + espacio negativo. El texto manda. */}
      <div className="pointer-events-none absolute inset-0 flex items-end">
        <div className="w-full bg-gradient-to-t from-background via-background/70 to-transparent px-[6vw] pb-[9vh] pt-[26vh]">
          <div className="max-w-[62ch]">
            {slide.kicker && (
              <p className="mb-4 font-mono text-[clamp(0.75rem,1vw,1rem)] uppercase tracking-[0.42em] text-accent">
                {slide.kicker}
              </p>
            )}
            <h1
              key={index}
              className="animate-rise text-balance font-display text-[clamp(2rem,4.4vw,4.4rem)] font-medium leading-[1.06] tracking-tight text-foreground"
            >
              {slide.title}
            </h1>
          </div>

          {isLast && qr && (
            <div className="mt-[4vh] flex flex-wrap gap-[3vw]">
              {[
                { src: qr.memorias, label: "Memorias del evento" },
                { src: qr.redes, label: "@centrodeeventosupb" },
              ].map((q) => (
                <figure key={q.label} className="flex items-center gap-4">
                  <img
                    src={q.src}
                    alt={`Código QR: ${q.label}`}
                    className="h-[11vh] w-[11vh] min-h-24 min-w-24 rounded-lg border border-border bg-card p-2"
                  />
                  <figcaption className="font-mono text-[clamp(0.7rem,0.9vw,0.95rem)] uppercase tracking-[0.22em] text-muted-foreground">
                    {q.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Indicador de progreso discreto */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex gap-1 px-[6vw] pb-4">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-px flex-1 transition-all duration-500 ${
              i <= index ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>
    </main>
  );
}
