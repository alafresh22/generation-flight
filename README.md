# Generational Flight

ROL Y CONTEXTO

Eres un desarrollador creativo especializado en Three.js y sistemas de partículas generativos. Vas a construir una presentación web en pantalla completa para el Centro de Eventos Fórum UPB, para la charla "Relevo generacional: la ventaja que nadie está aprovechando".

No es un slideshow con partículas de fondo. Es un único sistema generativo continuo que atraviesa toda la charla: una estructura de partículas que nace como un huevo, se transforma en un ave joven, y es acompañada en vuelo por un ave adulta que ya existía. La metáfora evoca el ciclo huevo → ave y, de fondo, el mito de Ícaro y su padre — pero con final feliz: aquí nadie cae, ambas generaciones vuelan juntas.

Esta metáfora no debe ilustrarse literalmente. Nada de huevos con textura de cáscara, ni aves con plumas dibujadas, ni iconografía mitológica explícita. Todo se construye por silueta, comportamiento y trayectoria de partículas abstractas: campos de vectores, curvas de vuelo, densidad y conexión entre puntos. Si alguien reconoce "un huevo" o "un ave" debe ser por cómo se mueve la estructura, no porque la dibujaste.

Memo Akten sigue siendo la referencia conceptual: el movimiento como lenguaje estructural, no un estilo a copiar.

SISTEMA VISUAL (gramática ya definida)
Elementos base
Partículas del ave joven (Generación B): nacen contenidas, luego se liberan y forman un cuerpo/silueta en vuelo. Comportamiento inicialmente errático/exploratorio una vez libres.
Partículas del ave adulta (Generación A): existen desde el inicio, siempre en vuelo, con una trayectoria ya definida y estable (una curva/spline suave que representa la experiencia — un camino ya recorrido).
Conexiones estructurales: no son líneas decorativas sueltas. Representan corrientes de vuelo compartidas — en el mundo real, las aves migratorias vuelan en formación aprovechando el vórtice que deja el ala del ave de adelante, ahorrando energía. Aquí eso se traduce en: cuando el ave joven entra en la estela del ave adulta, aparecen líneas de flujo entre ambas estructuras que se refuerzan cuanto más tiempo se mantiene esa cercanía (misma regla de "confianza que crece con el tiempo" del guion, slide 7).
Nunca hay reemplazo: en ningún momento las partículas de una generación sustituyen o "matan" a las de la otra. Se entrelazan, se turnan en la posición de liderazgo, comparten trayectoria — pero ambas siguen presentes hasta el final.
Estados estructurales macro (una transición por slide)
Slide 1 (portada) — Una masa compacta y quieta de partículas en formación ovoide (el huevo, sugerido solo por densidad y forma, sin contorno duro). Silencio visual, potencial contenido, centrado en pantalla.
Slide 2 — La masa ovoide se mantiene cerrada y rígida, con una vibración interna sutil (partículas que empujan desde adentro sin romper la forma): la pregunta "¿solo para hacer grados?" como tensión contenida, algo que quiere salir pero está limitado a una forma cerrada.
Slide 3 — La forma ovoide se abre: las partículas empiezan a escapar hacia afuera en trayectorias divergentes, hacia los bordes de la pantalla. Primer quiebre de simetría: "la Universidad decidió encontrarse con el mundo".
Slide 4 — Tres corrientes externas de partículas (academia / industria / ciudad) entran desde tres direcciones y confluyen justo en el punto donde la forma se está abriendo, acelerando la apertura: tres fuerzas externas empujan el nacimiento.
Slide 5 — Las partículas liberadas se organizan por primera vez en una silueta alargada y direccional (el cuerpo del ave joven tomando forma) y se dispersan en un movimiento expansivo hacia afuera, no de vuelta al centro: el impacto se expande, no se concentra.
Slide 6 — Contraste: un grupo de partículas se agrupa, brilla intensamente y se disuelve rápido (el evento aislado) mientras, en paralelo, la silueta del ave joven se mantiene estable y sigue en movimiento sostenido (la comunidad que permanece).
Slide 7 — Aparece por primera vez el ave adulta (Generación A) con su trayectoria ya establecida. Entre ambas siluetas se empiezan a formar las líneas de corriente/vórtice descritas arriba, tenues al inicio, y se van engrosando en tiempo real mientras el texto está en pantalla: la confianza como métrica visual de grosor y persistencia.
Slide 8 — El ave adulta deja tras de sí una curva de vuelo sólida y visible (el camino/experiencia). El ave joven, apoyada en esa curva, empieza a generar sus propias curvas nuevas que se ramifican desde la curva adulta pero divergen en dirección propia: nuevas rutas que parten del camino existente.
Slide 9 — Ambas siluetas vuelan en formación paralela, compartiendo el mismo vector de dirección general pero manteniéndose como dos cuerpos claramente distintos (dos generaciones, una visión).
Slide 10 — Las partículas de ambas siluetas se entrelazan parcialmente en la zona de contacto entre ambas (intercambio real de partículas entre los dos cuerpos, no solo proximidad): visualiza literalmente que "trabajan juntas" sin que ninguna reemplace a la otra.
Slide 11 — Rotación de liderazgo: el ave joven avanza a la posición delantera de la formación (la que corta el viento, la que lidera) y el ave adulta pasa a la posición de apoyo detrás — comportamiento real de vuelo en formación en aves migratorias. El ave joven no es una promesa a futuro: ya está liderando ahora.
Slide 12 — Ambas siluetas dejan de simplemente volar en formación y empiezan a construir activamente una trayectoria ascendente compartida (una espiral térmica, un ascenso helicoidal claro y geométrico): el futuro no se hereda pasivamente, se construye con esfuerzo conjunto y visible.
Slide 13 (cierre) — Ambas siluetas alcanzan una altura estable y abren su formación en un espacio sereno, sin caída, sin dispersión caótica — el final feliz frente al mito de Ícaro: ninguna de las dos generaciones cae, ambas se sostienen en el aire. Los QR se integran en ese espacio abierto, como puntos de descanso dentro de la composición final.
Regla de oro (no negociable)

Ningún movimiento existe solo para decorar. Cada transición debe poder explicarse con una frase del tipo: "esto pasa porque representa X relación o X intención comunicativa del guion". Si no puedes completar esa frase, no se implementa.

Qué evitar explícitamente
Nada de cáscaras de huevo dibujadas, plumas ilustradas, picos, ojos, ni ninguna figura reconocible como "animal" en el sentido literal.
Nada de referencias visuales directas a Ícaro (alas de cera, sol como elemento pictórico, caída dramática). La referencia es solo estructural: vuelo asistido, sin caída.
Nada de partículas sueltas que no pertenezcan a ninguna de las dos siluetas o sus corrientes — cero "polvo" decorativo.
REQUISITOS TÉCNICOS (Three.js)
Stack: Three.js (última versión estable), THREE.Points con BufferGeometry para las partículas (o InstancedMesh si necesitas geometría con volumen), shaders personalizados (ShaderMaterial) si el rendimiento con miles de partículas lo requiere.
Trayectorias: usa THREE.CatmullRomCurve3 o splines equivalentes para las curvas de vuelo del ave adulta y las rutas ramificadas del ave joven; anima el recorrido con interpolación por tiempo, no con físicas aleatorias.
Cámara: perspectiva fija o con movimiento muy sutil (nunca vertiginoso) — la cámara acompaña la composición pero no compite con la legibilidad del texto. Evita rotaciones de cámara agresivas que dificulten leer el texto en pantalla grande.
Formato: página web única, fullscreen, sin scroll, sin chrome de navegador visible al presentar, pensada para pantalla grande de auditorio.
Navegación: clic / barra espaciadora / flecha derecha para avanzar; flecha izquierda para retroceder. La secuencia del guion no se reordena ni se omite.
Legibilidad: el texto de cada slide debe mantenerse perfectamente legible sobre el sistema de partículas (usa un plano semitransparente detrás del texto o compón dejando espacio negativo claro). El texto manda.
Transiciones: las partículas migran de una configuración a la siguiente de forma fluida al cambiar de slide (interpola posiciones objetivo), nunca con corte abrupto ni reinicio del sistema.
Imágenes del guion: donde el guion indica FOTO (slides 2, 4, 5, 8, 12), intégralas como textura de fondo o plano dentro de la composición 3D, sin que reemplacen el sistema de partículas.
Slide 13: incluye los dos QR (memorias en pp móvil y redes @centrodeeventosupb), legibles e integrados a la composición final descrita.
Rendimiento: objetivo 60fps en tiempo real; ajusta el número de partículas según el rendimiento real logrado, no según el ideal.
ENTREGABLE

Un proyecto Three.js funcional (HTML + JS, con Three.js importado vía CDN o módulo ES) que yo pueda abrir directamente en un navegador en pantalla completa y presentar slide por slide siguiendo exactamente el guion de abajo, con el sistema descrito ya implementado y comentado en el código (qué representa cada comportamiento y por qué).

GUION (secuencia exacta, no modificar)
RELEVO GENERACIONAL: LA VENTAJA QUE NADIE ESTÁ APROVECHANDO — @centrodeeventosupb
¿un gran auditorio solo para hacer grados? — [FOTO 1: ceremonia de grados en Fórum]
Los eventos no llegaron a la Universidad. La Universidad decidió encontrarse con el mundo.
Academia + Industria + Ciudad — [FOTO 2]
Los eventos nunca fueron el objetivo. El impacto sí. — [FOTO 3]
Un evento trae personas. Una comunidad trae transformación.
El talento crece a la velocidad de la confianza.
La experiencia construye el camino. Las nuevas generaciones descubren nuevas rutas. — [FOTO 4]
Una visión. Dos generaciones.
El crecimiento no ocurre cuando una generación reemplaza a otra. Ocurre cuando trabajan juntas.
Los jóvenes no son el futuro. Son el presente que muchas organizaciones aún no ven.
El futuro no se hereda. Se construye. — [FOTO 5]
[Cierre]  CONCLUSION — [FOTO 6]
AL TERMINAR

Explícame brevemente, después del código:

Tabla slide → comportamiento de partículas → qué representa (incluyendo por qué no es literal/decorativo).
Qué parámetros puedo ajustar fácilmente (número de partículas, velocidad de las transiciones, grosor máximo de las líneas de corriente, etc.).
Cómo probarlo en pantalla completa antes de la charla real, y qué hacer si el rendimiento baja con muchas partículas.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/28c9748d-57b9-43ad-9098-1eb1bc8226fc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
