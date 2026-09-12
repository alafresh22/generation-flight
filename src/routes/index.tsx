import { createFileRoute } from "@tanstack/react-router";
import Presentation from "@/components/Presentation";

export const Route = createFileRoute("/")({
  ssr: false, // el sistema de partículas es WebGL puro: nunca se renderiza en servidor
  head: () => ({
    meta: [
      { title: "Relevo generacional | Centro de Eventos Fórum UPB" },
      {
        name: "description",
        content:
          "Presentación generativa en Three.js para la charla 'Relevo generacional: la ventaja que nadie está aprovechando' del Centro de Eventos Fórum UPB.",
      },
      { property: "og:title", content: "Relevo generacional | Fórum UPB" },
      {
        property: "og:description",
        content:
          "Un sistema de partículas continuo: huevo, vuelo joven y vuelo adulto, dos generaciones que se sostienen en el aire.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Presentation,
});
