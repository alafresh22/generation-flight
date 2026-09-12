// Guion exacto de la charla. El orden NO se modifica ni se omite ningún slide.
// Cada slide declara además el "estado estructural macro" del sistema de partículas.

import foto1 from "@/assets/FOTO_1.jpg.asset.json";
import foto2 from "@/assets/FOTO_2.jpeg.asset.json";
import foto3 from "@/assets/FOTO_3.jpg.asset.json";
import foto4 from "@/assets/FOTO4.jpg.asset.json";
import foto5 from "@/assets/FOTO_5.jpg.asset.json";
import foto6 from "@/assets/FOTO6.jpg.asset.json";

export type SlideDef = {
  /** Texto principal en pantalla (el texto manda sobre el sistema visual) */
  title: string;
  /** Línea secundaria opcional */
  kicker?: string;
  /** Foto del guion, integrada como plano dentro de la composición 3D */
  photo?: string;
  /** Nota de dirección: qué representa el comportamiento de partículas */
  meaning: string;
};

export const SLIDES: SlideDef[] = [
  {
    kicker: "@centrodeeventosupb",
    title: "Relevo generacional: la ventaja que nadie está aprovechando",
    meaning:
      "Masa ovoide compacta y quieta: potencial contenido, aún sin liberar.",
  },
  {
    title: "¿Un gran auditorio solo para hacer grados?",
    photo: foto1.url,
    meaning:
      "La forma sigue cerrada pero vibra desde adentro: tensión contenida, algo que quiere salir de un uso limitado.",
  },
  {
    title:
      "Los eventos no llegaron a la Universidad. La Universidad decidió encontrarse con el mundo.",
    meaning:
      "Primer quiebre de simetría: la forma se abre y las partículas escapan en trayectorias divergentes.",
  },
  {
    title: "Academia + Industria + Ciudad",
    photo: foto2.url,
    meaning:
      "Tres corrientes externas entran y confluyen en el punto de apertura: tres fuerzas empujan el nacimiento.",
  },
  {
    title: "Los eventos nunca fueron el objetivo. El impacto sí.",
    photo: foto3.url,
    meaning:
      "Las partículas liberadas forman por primera vez una silueta direccional y se expanden hacia afuera: el impacto no se concentra.",
  },
  {
    title: "Un evento trae personas. Una comunidad trae transformación.",
    meaning:
      "Un grupo se agrupa, brilla y se disuelve rápido (evento aislado) mientras la silueta sostiene su movimiento (comunidad).",
  },
  {
    title: "El talento crece a la velocidad de la confianza.",
    meaning:
      "Aparece la generación adulta con su trayectoria estable; las líneas de corriente entre ambas se engrosan con el tiempo en pantalla: la confianza se acumula.",
  },
  {
    title:
      "La experiencia construye el camino. Las nuevas generaciones descubren nuevas rutas.",
    photo: foto4.url,
    meaning:
      "La curva de vuelo adulta se vuelve visible y desde ella se ramifican rutas nuevas que divergen en dirección propia.",
  },
  {
    title: "Una visión. Dos generaciones.",
    meaning:
      "Vuelo en formación paralela: mismo vector de dirección, dos cuerpos claramente distintos.",
  },
  {
    title:
      "El crecimiento no ocurre cuando una generación reemplaza a otra. Ocurre cuando trabajan juntas.",
    meaning:
      "Intercambio real de partículas entre ambos cuerpos en la zona de contacto: nadie sustituye a nadie.",
  },
  {
    title:
      "Los jóvenes no son el futuro. Son el presente que muchas organizaciones aún no ven.",
    meaning:
      "Rotación de liderazgo: la silueta joven pasa al frente de la formación y la adulta al puesto de apoyo.",
  },
  {
    title: "El futuro no se hereda. Se construye.",
    photo: foto5.url,
    meaning:
      "Ascenso helicoidal compartido: una trayectoria que ambas construyen activamente, no una herencia pasiva.",
  },
  {
    title: "Dos generaciones que se sostienen en el aire.",
    kicker: "Gracias",
    photo: foto6.url,
    meaning:
      "Altura estable y formación abierta: sin caída y sin dispersión caótica. El final feliz frente al mito de Ícaro.",
  },
];
