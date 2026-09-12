/**
 * SISTEMA GENERATIVO CONTINUO — "Relevo generacional"
 *
 * No es un slideshow con partículas de fondo: es UN solo sistema de partículas
 * que nunca se reinicia. Cada slide solo cambia los ESCALARES de estado
 * (tensión, apertura, "birdness", confianza, etc.) y todas las posiciones
 * objetivo se interpolan de forma continua hacia la nueva configuración.
 *
 * Dos poblaciones que coexisten hasta el final (nunca hay reemplazo):
 *   - Generación B (joven, cálida): nace contenida en la forma ovoide.
 *   - Generación A (adulta, fría): siempre en vuelo sobre una curva ya definida.
 *
 * Las líneas entre ambas NO son decoración: representan la estela / vórtice de
 * ala que las aves migratorias aprovechan para ahorrar energía. Se engrosan
 * cuanto más tiempo se mantiene la cercanía = la confianza que crece con el tiempo.
 */

import * as THREE from "three";

/** Vista laxa sobre Float32Array para los bucles de partículas (acceso por índice sin chequeos). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NumArr = any;
const arr = (a: Float32Array): NumArr => a;

// ─────────────────────────────────────────────────────────────────────────────
// PARÁMETROS AJUSTABLES (todo lo que normalmente querrás tocar está aquí)
// ─────────────────────────────────────────────────────────────────────────────
export const PARAMS = {
  youngCount: 7000, // partículas de la generación joven (incluye el huevo)
  adultCount: 4500, // partículas de la generación adulta
  currentCount: 1800, // partículas de las tres corrientes (academia/industria/ciudad)
  transitionSpeed: 0.9, // velocidad de interpolación entre estados de slide
  particleFollow: 2.2, // qué tan rápido cada partícula alcanza su objetivo
  flowMaxLines: 110, // "grosor" máximo aparente de las corrientes de vuelo
  trustGrowth: 0.085, // qué tan rápido crece la confianza mientras el slide 7 está en pantalla
  flightSpeed: 0.035, // velocidad del recorrido sobre las curvas de vuelo
  pixelRatioCap: 1.75, // baja a 1 si el rendimiento cae en la pantalla del auditorio
};

const YOUNG_COLOR = new THREE.Color("#ffc46b");
const ADULT_COLOR = new THREE.Color("#8fd4ff");

// ─────────────────────────────────────────────────────────────────────────────
// Estado macro por slide. Un solo cambio estructural por slide.
// ─────────────────────────────────────────────────────────────────────────────
type State = {
  tension: number; // vibración interna dentro de la forma cerrada
  openness: number; // apertura de la forma ovoide
  birdness: number; // grado de organización en silueta direccional
  expansion: number; // dispersión expansiva hacia afuera
  currents: number; // visibilidad de las tres corrientes externas
  adult: number; // presencia de la generación adulta
  flow: number; // corrientes de vuelo compartidas (confianza)
  trail: number; // curva de vuelo adulta visible (el camino)
  branch: number; // rutas nuevas ramificadas desde esa curva
  exchange: number; // intercambio real de partículas entre cuerpos
  burst: number; // evento aislado que brilla y se disuelve
  lead: number; // 0 = adulta al frente, 1 = joven al frente
  helix: number; // ascenso helicoidal compartido
  calm: number; // altura estable, formación abierta
  gap: number; // separación entre las dos siluetas
};

const base: State = {
  tension: 0, openness: 0, birdness: 0, expansion: 0, currents: 0,
  adult: 0, flow: 0, trail: 0, branch: 0, exchange: 0, burst: 0,
  lead: 0, helix: 0, calm: 0, gap: 1,
};

const SLIDE_STATES: State[] = [
  { ...base }, // 1 huevo quieto
  { ...base, tension: 1 }, // 2 tensión contenida
  { ...base, tension: 0.4, openness: 1 }, // 3 la forma se abre
  { ...base, openness: 1, currents: 1 }, // 4 tres corrientes aceleran la apertura
  { ...base, openness: 0.25, currents: 0.35, birdness: 1, expansion: 1 }, // 5 silueta + expansión
  { ...base, birdness: 1, expansion: 0.25, burst: 1 }, // 6 evento aislado vs comunidad
  { ...base, birdness: 1, adult: 1, flow: 0.15, gap: 1.35 }, // 7 aparece la adulta, nace la estela
  { ...base, birdness: 1, adult: 1, flow: 0.7, trail: 1, branch: 1, gap: 1.15 }, // 8 camino + rutas nuevas
  { ...base, birdness: 1, adult: 1, flow: 0.8, trail: 0.6, branch: 0.5, gap: 1 }, // 9 formación paralela
  { ...base, birdness: 1, adult: 1, flow: 0.9, trail: 0.4, exchange: 1, gap: 0.6 }, // 10 intercambio
  { ...base, birdness: 1, adult: 1, flow: 0.9, exchange: 0.4, lead: 1, gap: 0.85 }, // 11 relevo de liderazgo
  { ...base, birdness: 1, adult: 1, flow: 1, lead: 0.6, helix: 1, gap: 0.9 }, // 12 ascenso construido
  { ...base, birdness: 1, adult: 1, flow: 0.75, lead: 0.5, helix: 0.35, calm: 1, gap: 1.6 }, // 13 cierre sereno
];

// ─────────────────────────────────────────────────────────────────────────────
const vShader = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (210.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const fShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    float a = smoothstep(0.25, 0.0, d);
    gl_FragColor = vec4(uColor, a * vAlpha * uOpacity * 0.16);
  }
`;

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export class PresentationEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private raf = 0;

  private state: State = { ...SLIDE_STATES[0]! };
  private target: State = { ...SLIDE_STATES[0]! };
  private slide = 0;
  private slideTime = 0;
  private trust = 0; // confianza acumulada (crece con el tiempo en pantalla)

  // poblaciones
  private young!: THREE.Points;
  private adult!: THREE.Points;
  private currents!: THREE.Points;
  private yPos!: NumArr;
  private aPos!: NumArr;
  private cPos!: NumArr;
  private yAlpha!: NumArr;
  private cAlpha!: NumArr;

  // datos estables por partícula
  private egg: NumArr = arr(new Float32Array(0));
  private escape: NumArr = arr(new Float32Array(0));
  private local: NumArr = arr(new Float32Array(0)); // silueta local del cuerpo
  private localA: NumArr = arr(new Float32Array(0));
  private seed: NumArr = arr(new Float32Array(0));
  private swap: NumArr = arr(new Float32Array(0));

  // curvas de vuelo
  private adultCurve!: THREE.CatmullRomCurve3;
  private youngCurve!: THREE.CatmullRomCurve3;
  private trailLine!: THREE.Line;
  private branches: THREE.Line[] = [];
  private flow!: THREE.LineSegments;
  private flowPos!: NumArr;

  private photoMesh!: THREE.Mesh;
  private photoMat!: THREE.MeshBasicMaterial;
  private photoTargetOpacity = 0;
  private texLoader = new THREE.TextureLoader();
  private texCache = new Map<string, THREE.Texture>();

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setClearColor(0x05060a, 1);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 400);
    this.camera.position.set(0, 1.5, 38);

    this.buildCurves();
    this.buildParticles();
    this.buildLines();
    this.buildPhoto();
    this.resize();
    window.addEventListener("resize", this.resize);
    this.loop();
  }

  // ── curvas ────────────────────────────────────────────────────────────────
  private buildCurves() {
    // Curva adulta: un camino amplio, suave y YA recorrido (la experiencia).
    const a: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * Math.PI * 2;
      a.push(new THREE.Vector3(Math.cos(t) * 8.5, Math.sin(t * 2) * 2.2, Math.sin(t) * 5));
    }
    this.adultCurve = new THREE.CatmullRomCurve3(a, true, "catmullrom", 0.5);

    // Curva joven: exploratoria, más corta e irregular (todavía sin camino fijo).
    const b: THREE.Vector3[] = [];
    for (let i = 0; i < 7; i++) {
      const t = (i / 7) * Math.PI * 2;
      b.push(
        new THREE.Vector3(
          Math.cos(t) * rnd(4, 6.5),
          Math.sin(t * 3) * rnd(1, 3),
          Math.sin(t) * rnd(2.5, 4.5),
        ),
      );
    }
    this.youngCurve = new THREE.CatmullRomCurve3(b, true, "catmullrom", 0.5);
  }

  // ── partículas ────────────────────────────────────────────────────────────
  private makePoints(n: number, color: THREE.Color) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const alpha = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      size[i] = rnd(0.5, 1.35);
      alpha[i] = 1;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: color }, uOpacity: { value: 1 } },
      vertexShader: vShader,
      fragmentShader: fShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const p = new THREE.Points(g, m);
    p.frustumCulled = false;
    this.scene.add(p);
    return { points: p, pos, alpha };
  }

  /** Silueta local: cuerpo alargado + alas barridas. Nunca un ave dibujada:
   *  solo densidad y dirección. z = eje del cuerpo, x = envergadura. */
  private fillSilhouette(out: NumArr, n: number, scale: number) {
    for (let i = 0; i < n; i++) {
      const isBody = Math.random() < 0.32;
      let x: number, y: number, z: number;
      if (isBody) {
        z = rnd(-1.4, 2.0);
        const r = Math.pow(Math.random(), 0.6) * 0.55 * (1 - Math.abs(z) / 3);
        const a = Math.random() * Math.PI * 2;
        x = Math.cos(a) * r;
        y = Math.sin(a) * r;
      } else {
        const s = (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.pow(Math.random(), 0.75) * 2.6);
        x = s;
        z = -0.55 * Math.abs(s) + rnd(-0.3, 0.5);
        y = rnd(-0.3, 0.3);
      }
      out[i * 3] = x * scale;
      out[i * 3 + 1] = y * scale;
      out[i * 3 + 2] = z * scale;
    }
  }

  private buildParticles() {
    const { youngCount: N, adultCount: A, currentCount: C } = PARAMS;

    const y = this.makePoints(N, YOUNG_COLOR);
    this.young = y.points;
    this.yPos = arr(y.pos);
    this.yAlpha = arr(y.alpha);

    const ad = this.makePoints(A, ADULT_COLOR);
    this.adult = ad.points;
    this.aPos = arr(ad.pos);
    (this.adult.material as THREE.ShaderMaterial).uniforms['uOpacity']!.value = 0;

    const cu = this.makePoints(C, YOUNG_COLOR.clone().lerp(new THREE.Color("#ffffff"), 0.35));
    this.currents = cu.points;
    this.cPos = arr(cu.pos);
    this.cAlpha = arr(cu.alpha);
    (this.currents.material as THREE.ShaderMaterial).uniforms['uOpacity']!.value = 0;

    // forma ovoide inicial (huevo sugerido solo por densidad, sin contorno duro)
    this.egg = arr(new Float32Array(N * 3));
    this.escape = arr(new Float32Array(N * 3));
    this.seed = arr(new Float32Array(N * 3));
    this.swap = arr(new Float32Array(N));
    for (let i = 0; i < N; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 1 / 2.4);
      const ex = Math.sin(v) * Math.cos(u) * r * 2.6;
      const ey = Math.cos(v) * r * 3.8;
      const ez = Math.sin(v) * Math.sin(u) * r * 2.6;
      this.egg.set([ex, ey, ez], i * 3);
      const d = new THREE.Vector3(ex, ey * 0.6, ez).normalize();
      this.escape.set([d.x, d.y, d.z], i * 3);
      this.seed.set([Math.random(), Math.random(), Math.random()], i * 3);
      this.swap[i] = Math.random();
      this.yPos.set([ex, ey, ez], i * 3);
    }

    this.local = arr(new Float32Array(N * 3));
    this.fillSilhouette(this.local, N, 2.3);
    this.localA = arr(new Float32Array(A * 3));
    this.fillSilhouette(this.localA, A, 2.9); // la adulta es algo mayor

    // corrientes: tres direcciones de entrada (academia / industria / ciudad)
    for (let i = 0; i < C; i++) {
      this.cPos.set([0, 0, 0], i * 3);
    }
  }

  private buildLines() {
    // Corrientes de vuelo compartidas (estela / vórtice de ala)
    const g = new THREE.BufferGeometry();
    const flowBuf = new Float32Array(PARAMS.flowMaxLines * 6);
    this.flowPos = arr(flowBuf);
    g.setAttribute("position", new THREE.BufferAttribute(flowBuf, 3));
    this.flow = new THREE.LineSegments(
      g,
      new THREE.LineBasicMaterial({
        color: 0xbfe6ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.flow.frustumCulled = false;
    this.scene.add(this.flow);

    // Camino ya recorrido por la generación adulta
    const pts = this.adultCurve.getPoints(400);
    this.trailLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({
        color: 0x9fd8ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.scene.add(this.trailLine);

    // Rutas nuevas: nacen SOBRE la curva adulta y divergen en dirección propia
    for (let k = 0; k < 5; k++) {
      const u0 = k / 5;
      const p0 = this.adultCurve.getPointAt(u0);
      const t0 = this.adultCurve.getTangentAt(u0);
      const off = new THREE.Vector3(rnd(-1, 1), rnd(0.3, 1), rnd(-1, 1)).normalize();
      const ctrl = [p0.clone()];
      for (let s = 1; s <= 4; s++) {
        ctrl.push(
          p0
            .clone()
            .add(t0.clone().multiplyScalar(s * 1.6))
            .add(off.clone().multiplyScalar(s * s * 0.55)),
        );
      }
      const curve = new THREE.CatmullRomCurve3(ctrl, false, "catmullrom", 0.5);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(120)),
        new THREE.LineBasicMaterial({
          color: 0xffc46b,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      line.geometry.setDrawRange(0, 0);
      this.branches.push(line);
      this.scene.add(line);
    }
  }

  private buildPhoto() {
    this.photoMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    this.photoMesh = new THREE.Mesh(new THREE.PlaneGeometry(17, 11.3), this.photoMat);
    this.photoMesh.position.set(12.5, 8, -18);
    this.photoMesh.rotation.y = -0.18;
    this.scene.add(this.photoMesh);
  }

  setPhoto(url?: string) {
    if (!url) {
      this.photoTargetOpacity = 0;
      return;
    }
    let tex = this.texCache.get(url);
    if (!tex) {
      tex = this.texLoader.load(url);
      tex.colorSpace = THREE.SRGBColorSpace;
      this.texCache.set(url, tex);
    }
    this.photoMat.map = tex;
    this.photoMat.needsUpdate = true;
    this.photoTargetOpacity = 0.6; // integrada, nunca compitiendo con el texto
  }

  setSlide(i: number) {
    this.slide = Math.max(0, Math.min(SLIDE_STATES.length - 1, i));
    this.target = SLIDE_STATES[this.slide]!;
    this.slideTime = 0;
    if (this.slide < 6) this.trust = 0;
  }

  private resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, PARAMS.pixelRatioCap));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  // ── bucle ─────────────────────────────────────────────────────────────────
  private tmpP = new THREE.Vector3();
  private tmpT = new THREE.Vector3();
  private tmpN = new THREE.Vector3();
  private tmpB = new THREE.Vector3();
  private up = new THREE.Vector3(0, 1, 0);

  private frame(anchor: THREE.Vector3, dir: THREE.Vector3, l: NumArr, i: number, out: THREE.Vector3) {
    this.tmpB.copy(dir).cross(this.up).normalize();
    this.tmpN.copy(this.tmpB).cross(dir).normalize();
    out
      .copy(anchor)
      .addScaledVector(this.tmpB, l[i * 3])
      .addScaledVector(this.tmpN, l[i * 3 + 1])
      .addScaledVector(dir, l[i * 3 + 2]);
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    this.slideTime += dt;

    // interpolación continua de los escalares de estado (nunca corte abrupto)
    const k = 1 - Math.exp(-PARAMS.transitionSpeed * dt);
    for (const key of Object.keys(this.state) as (keyof State)[]) {
      this.state[key] += (this.target[key] - this.state[key]) * k;
    }
    const S = this.state;

    // CONFIANZA: crece mientras la cercanía se mantiene (slide 7 en adelante)
    if (this.slide >= 6) this.trust = Math.min(1, this.trust + PARAMS.trustGrowth * dt);
    const flow = S.flow * (0.35 + 0.65 * this.trust);

    // anclas de vuelo
    const uA = (t * PARAMS.flightSpeed) % 1;
    const aPoint = this.adultCurve.getPointAt(uA, this.tmpP.clone());
    const aDir = this.adultCurve.getTangentAt(uA, this.tmpT.clone()).normalize();

    // ascenso helicoidal compartido (slide 12): construido, no heredado
    const helixY = S.helix * (2.5 + Math.sin(t * 0.35) * 0.6) + S.calm * 0.6;
    aPoint.y += helixY;

    const uY = (t * PARAMS.flightSpeed * 1.15 + 0.12) % 1;
    const freePoint = this.youngCurve.getPointAt(uY, new THREE.Vector3());
    const freeDir = this.youngCurve.getTangentAt(uY, new THREE.Vector3()).normalize();

    // formación: la joven se posiciona respecto a la adulta.
    // lead=1 → la joven pasa al frente y la adulta al puesto de apoyo.
    const bSide = new THREE.Vector3().copy(aDir).cross(this.up).normalize();
    const along = (-7.5 + S.lead * 15.0) * (0.6 + 0.4 * S.gap);
    const lateral = -5.2 * S.gap;
    const formPoint = aPoint
      .clone()
      .addScaledVector(aDir, along)
      .addScaledVector(bSide, lateral)
      .addScaledVector(this.up, -0.8 * S.gap + S.calm * 0.8);

    const yAnchor = freePoint.lerp(formPoint, S.adult);
    const yDir = freeDir.lerp(aDir, S.adult * 0.9).normalize();

    // ── generación joven ────────────────────────────────────────────────────
    const N = PARAMS.youngCount;
    const follow = 1 - Math.exp(-PARAMS.particleFollow * dt);
    const flap = Math.sin(t * 2.6);
    const burstCenter = yAnchor.clone().addScaledVector(bSide, 6.5).addScaledVector(this.up, 2.2);
    const burstCycle = (t % 4.2) / 4.2; // brilla y se disuelve rápido
    const burstAmp = S.burst * Math.max(0, Math.sin(burstCycle * Math.PI)) ** 2;

    const tmp = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      const s0 = this.seed[i3];

      // 1) huevo, con vibración interna que empuja sin romper la forma
      const breathe = 1 + S.tension * 0.06 * Math.sin(t * 6 + s0 * 30);
      let tx = this.egg[i3] * breathe;
      let ty = this.egg[i3 + 1] * breathe;
      let tz = this.egg[i3 + 2] * breathe;
      // rotación lenta del conjunto: potencial contenido, no inercia muerta
      const rot = t * 0.12;
      const cx = tx * Math.cos(rot) - tz * Math.sin(rot);
      tz = tx * Math.sin(rot) + tz * Math.cos(rot);
      tx = cx;

      // 2) apertura: escape divergente hacia los bordes
      const gate = Math.min(1, Math.max(0, S.openness * 1.35 - this.seed[i3 + 1] * 0.5));
      const esc = gate * (2.5 + 9 * S.openness) * (0.5 + this.seed[i3 + 2]);
      tx += this.escape[i3] * esc;
      ty += this.escape[i3 + 1] * esc;
      tz += this.escape[i3 + 2] * esc;

      // 3) silueta direccional (o intercambio de cuerpo en el slide 10)
      const toAdult = S.exchange > 0.02 && this.swap[i] < S.exchange * 0.18;
      this.frame(toAdult ? aPoint : yAnchor, toAdult ? aDir : yDir, this.local, i, tmp);
      tmp.y += flap * 0.32 * Math.abs(this.local[i3]);

      // 4) expansión hacia afuera: el impacto se expande, no se concentra
      const ex = 1 + S.expansion * (0.6 + 0.9 * Math.sin(t * 0.7 + s0 * 6));
      tmp.sub(yAnchor).multiplyScalar(ex).add(yAnchor);

      const bird = S.birdness;
      let fx = tx * (1 - bird) + tmp.x * bird;
      let fy = ty * (1 - bird) + tmp.y * bird;
      let fz = tz * (1 - bird) + tmp.z * bird;

      // 5) evento aislado: un grupo se agrupa, brilla y se disuelve
      let alpha = 1;
      if (burstAmp > 0.001 && this.swap[i] > 0.9) {
        const b = burstAmp;
        fx += (burstCenter.x - fx) * b;
        fy += (burstCenter.y - fy) * b;
        fz += (burstCenter.z - fz) * b;
        alpha = 1 + b * 2.5;
      }

      this.yPos[i3] += (fx - this.yPos[i3]) * follow;
      this.yPos[i3 + 1] += (fy - this.yPos[i3 + 1]) * follow;
      this.yPos[i3 + 2] += (fz - this.yPos[i3 + 2]) * follow;
      this.yAlpha[i] = alpha;
    }
    this.young.geometry.attributes['position']!.needsUpdate = true;
    this.young.geometry.attributes['aAlpha']!.needsUpdate = true;

    // ── generación adulta ───────────────────────────────────────────────────
    const A = PARAMS.adultCount;
    // cuando la joven lidera, la adulta se retrasa al puesto de apoyo
    const adultAnchor = aPoint.clone().addScaledVector(aDir, -S.lead * 3.2);
    for (let i = 0; i < A; i++) {
      const i3 = i * 3;
      const toYoung = S.exchange > 0.02 && Math.abs(this.localA[i3]) > 2.0 && (i % 7 === 0);
      this.frame(toYoung ? yAnchor : adultAnchor, toYoung ? yDir : aDir, this.localA, i, tmp);
      tmp.y += Math.sin(t * 2.1) * 0.28 * Math.abs(this.localA[i3]);
      this.aPos[i3] += (tmp.x - this.aPos[i3]) * follow;
      this.aPos[i3 + 1] += (tmp.y - this.aPos[i3 + 1]) * follow;
      this.aPos[i3 + 2] += (tmp.z - this.aPos[i3 + 2]) * follow;
    }
    this.adult.geometry.attributes['position']!.needsUpdate = true;
    (this.adult.material as THREE.ShaderMaterial).uniforms['uOpacity']!.value = S.adult;

    // ── tres corrientes externas ────────────────────────────────────────────
    const C = PARAMS.currentCount;
    const dirs = [
      new THREE.Vector3(-1, 0.45, 0.3).normalize(), // academia
      new THREE.Vector3(1, 0.2, -0.5).normalize(), // industria
      new THREE.Vector3(0.15, -1, 0.4).normalize(), // ciudad
    ];
    for (let i = 0; i < C; i++) {
      const i3 = i * 3;
      const d = dirs[i % 3]!;
      const phase = ((t * 0.5 + i / C) % 1);
      const dist = (1 - phase) * 26 + 1.2;
      const jitter = Math.sin(i * 12.9 + t) * 0.6;
      // convergen exactamente donde la forma se está abriendo
      const cx = d.x * dist + jitter * 0.4;
      const cy = d.y * dist + jitter * 0.3;
      const cz = d.z * dist;
      // una vez nacida el ave, se integran a su cuerpo (nunca quedan como polvo)
      const merge = S.birdness;
      this.frame(yAnchor, yDir, this.local, i, tmp);
      this.cPos[i3] += (cx * (1 - merge) + tmp.x * merge - this.cPos[i3]) * follow;
      this.cPos[i3 + 1] += (cy * (1 - merge) + tmp.y * merge - this.cPos[i3 + 1]) * follow;
      this.cPos[i3 + 2] += (cz * (1 - merge) + tmp.z * merge - this.cPos[i3 + 2]) * follow;
      this.cAlpha[i] = phase < 0.06 ? phase / 0.06 : 1;
    }
    this.currents.geometry.attributes['position']!.needsUpdate = true;
    this.currents.geometry.attributes['aAlpha']!.needsUpdate = true;
    (this.currents.material as THREE.ShaderMaterial).uniforms['uOpacity']!.value = Math.max(
      S.currents,
      S.birdness * 0.9,
    );

    // ── corrientes de vuelo compartidas (confianza acumulada) ───────────────
    const active = Math.floor(flow * PARAMS.flowMaxLines);
    for (let l = 0; l < PARAMS.flowMaxLines; l++) {
      const o = l * 6;
      if (l < active) {
        const yi = ((l * 137) % PARAMS.youngCount) * 3;
        const ai = ((l * 251) % PARAMS.adultCount) * 3;
        this.flowPos[o] = this.yPos[yi];
        this.flowPos[o + 1] = this.yPos[yi + 1];
        this.flowPos[o + 2] = this.yPos[yi + 2];
        this.flowPos[o + 3] = this.aPos[ai];
        this.flowPos[o + 4] = this.aPos[ai + 1];
        this.flowPos[o + 5] = this.aPos[ai + 2];
      } else {
        for (let z = 0; z < 6; z++) this.flowPos[o + z] = 0;
      }
    }
    this.flow.geometry.attributes['position']!.needsUpdate = true;
    (this.flow.material as THREE.LineBasicMaterial).opacity = 0.08 + 0.35 * flow;

    // camino recorrido + rutas nuevas (dibujadas progresivamente)
    (this.trailLine.material as THREE.LineBasicMaterial).opacity = S.trail * 0.55;
    this.trailLine.position.y = helixY;
    for (const line of this.branches) {
      (line.material as THREE.LineBasicMaterial).opacity = S.branch * 0.6;
      line.geometry.setDrawRange(0, Math.floor(S.branch * 121));
      line.position.y = helixY;
    }

    // foto del guion: integrada en la composición, nunca reemplaza al sistema
    this.photoMat.opacity += (this.photoTargetOpacity - this.photoMat.opacity) * dt * 1.6;
    this.photoMesh.visible = this.photoMat.opacity > 0.01;

    // cámara: acompaña, nunca compite con la lectura del texto
    const camY = 1.5 + helixY * 0.6 + S.calm * 0.8;
    const camZ = 38 + S.expansion * 4 + S.calm * 3;
    this.camera.position.x += (Math.sin(t * 0.13) * 1.2 - this.camera.position.x) * dt * 0.6;
    this.camera.position.y += (camY + Math.sin(t * 0.17) * 0.4 - this.camera.position.y) * dt * 0.8;
    this.camera.position.z += (camZ - this.camera.position.z) * dt * 0.8;
    this.camera.lookAt(-5.5, helixY * 0.6 - 5.5, 0);

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.resize);
    this.renderer.dispose();
    this.scene.traverse((o) => {
      const any = o as THREE.Mesh;
      any.geometry?.dispose?.();
      const m = any.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m?.dispose?.();
    });
  }
}
