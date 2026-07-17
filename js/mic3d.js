/* ============================================================
   3D mikrofons (fons) — Three.js
   Procedurāli būvēts skatuves mikrofons (SM58 stila): austa metāla
   režģa galva ar putu ieliktni, konusveida korpuss, zīmola sarkanais
   gredzens. Guļ fiksētā audeklā AIZ satura (z-index:-1) un, skrollējot,
   ceļo pa lapu starp sekcijām — kā itsoffbrand.com lode.
   Neviena ārēja modeļa vai tekstūras faila; viss uzzīmēts kodā.
   ============================================================ */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/RoomEnvironment.js";

(function () {
  "use strict";

  const canvas = document.getElementById("micCanvas");
  if (!canvas) return;

  /* Dzīvs, ne vienreizējs: lietotājs var pārslēgt "mazāk kustību" arī sesijas
     laikā — klausāmies izmaiņas (sk. dzīves cikla sadaļu). */
  const motionMq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  let reduce = !!(motionMq && motionMq.matches);

  /* -------------------- Renderētājs -------------------- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: "high-performance",
    });
  } catch (_) {
    canvas.remove(); // bez WebGL mikrofona vienkārši nav — lapa strādā tāpat
    return;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.set(0, 0, 10);

  /* Apgaismojums: telpas vides karte dod metālam reālas atspulgas,
     virziena gaismas piešķauj formu, koraļļu gaisma sasien ar zīmolu. */
  function buildEnv() {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }
  buildEnv();
  scene.environmentIntensity = 1.1;
  /* PMREM tekstūra dzīvo tikai GPU pusē — pēc konteksta zaudēšanas/atjaunošanas
     (draiveru maiņa, miega režīms, mobilais atmiņas spiediens) trīs to pats
     neatjauno, un metāls paliktu gandrīz melns. Uzbūvējam vidi no jauna. */
  canvas.addEventListener("webglcontextrestored", () => {
    buildEnv();
    if (reduce) renderPose();
  });

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 6, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xed4c4c, 2.2);
  rim.position.set(-7, 2, -5);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  fill.position.set(-3, -4, 6);
  scene.add(fill);

  /* -------------------- Režģa tekstūra -------------------- */
  /* Austs stieples režģis uz caurspīdīga fona. Caurumos redzams iekšējais
     putu lodveida ieliktnis — tas dod dziļumu un īsta mikrofona izjūtu. */
  function makeGrilleTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const step = 32, w = 13;
    // horizontālās stieples: gaišs augšas lokums, tumša apakša
    for (let y = 0; y <= 256; y += step) {
      const gr = g.createLinearGradient(0, y - w / 2, 0, y + w / 2);
      gr.addColorStop(0, "#f5f5f5");
      gr.addColorStop(0.45, "#c2c2c2");
      gr.addColorStop(1, "#5f5f5f");
      g.fillStyle = gr;
      g.fillRect(0, y - w / 2, 256, w);
    }
    // vertikālās stieples mazliet tumšākas — pinums kļūst nolasāms
    for (let x = 0; x <= 256; x += step) {
      const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      gr.addColorStop(0, "#e2e2e2");
      gr.addColorStop(0.45, "#a9a9a9");
      gr.addColorStop(1, "#4c4c4c");
      g.fillStyle = gr;
      g.fillRect(x - w / 2, 0, w, 256);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(14, 8);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return tex;
  }

  /* -------------------- Mikrofona modelis -------------------- */
  const mic = new THREE.Group();
  {
    const silver = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 0.95, roughness: 0.28 });

    // Režģa lode (mazliet saplacināta) + putas iekšpusē
    const grilleTex = makeGrilleTexture();
    const grille = new THREE.Mesh(
      new THREE.SphereGeometry(1, 72, 48),
      new THREE.MeshStandardMaterial({
        map: grilleTex, bumpMap: grilleTex, bumpScale: 0.6,
        alphaTest: 0.45, metalness: 0.9, roughness: 0.34,
      })
    );
    grille.scale.set(1, 0.94, 1);
    grille.position.y = 1.42;
    mic.add(grille);

    const foam = new THREE.Mesh(
      new THREE.SphereGeometry(0.93, 40, 28),
      new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 1, metalness: 0 })
    );
    foam.scale.copy(grille.scale);
    foam.position.copy(grille.position);
    mic.add(foam);

    // Apkakles gredzens vietā, kur galva satiekas ar korpusu
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.615, 0.075, 24, 72), silver);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.64;
    mic.add(collar);

    // Konusveida korpuss — virpots profils (lathe)
    const profile = [
      new THREE.Vector2(0.001, -2.14),
      new THREE.Vector2(0.21, -2.13),
      new THREE.Vector2(0.335, -2.06),
      new THREE.Vector2(0.375, -1.97),
      new THREE.Vector2(0.385, -1.88),
      new THREE.Vector2(0.555, 0.4),
      new THREE.Vector2(0.585, 0.54),
      new THREE.Vector2(0.6, 0.64),
    ];
    const body = new THREE.Mesh(
      new THREE.LatheGeometry(profile, 72),
      new THREE.MeshPhysicalMaterial({
        color: 0x262626, metalness: 0.85, roughness: 0.34,
        clearcoat: 0.55, clearcoatRoughness: 0.25,
      })
    );
    mic.add(body);

    // Zīmola akcents — koraļļu gredzens ap korpusu
    const brand = new THREE.Mesh(
      new THREE.TorusGeometry(0.586, 0.026, 16, 72),
      new THREE.MeshStandardMaterial({ color: 0xed4c4c, metalness: 0.55, roughness: 0.35 })
    );
    brand.rotation.x = Math.PI / 2;
    brand.position.y = 0.3;
    mic.add(brand);

    // XLR apkakles šuve pie pamatnes
    const seam = new THREE.Mesh(new THREE.TorusGeometry(0.352, 0.018, 12, 64), silver);
    seam.rotation.x = Math.PI / 2;
    seam.position.y = -1.94;
    mic.add(seam);
  }
  scene.add(mic);

  /* -------------------- Skrola horeogrāfija -------------------- */
  /* Atslēgkadri piesieti sekcijām: kadrs "izpildās", kad sekcijas centrs
     sakrīt ar skata centru. xf/yf ir daļa no skata pusplatuma/pusaugstuma
     (x: -1 kreisā mala … 1 labā), s — mērogs, r* — pagriezieni radiānos.
     Necaurspīdīgās joslas (kalendārs, runātāji, tumšā CTA) mikrofonu
     aizsedz pa ceļam — viņš ienirst un iznirst, tieši kā iecerēts. */
  const KEYS = [
    { at: "top",           xf: 0.33, yf:  0.10, rx: -0.30, ry: -0.85, rz: -0.5,  s: 1.0  },
    { at: "#misija",       xf: 0.68, yf:  0.02, rx:  0.22, ry:  0.95, rz:  0.55, s: 0.55 },
    { at: "#pasakumi",     xf: -0.6, yf:  0.05, rx:  0.05, ry:  2.4,  rz:  1.05, s: 0.52 },
    { at: "#komuna",       xf: 0.52, yf: -0.02, rx: -0.18, ry:  3.6,  rz:  0.45, s: 0.6  },
    { at: "#vertibas",     xf: 0.56, yf:  0.22, rx:  0.28, ry:  4.8,  rz:  0.5,  s: 0.5  },
    { at: "#runataji",     xf: -0.58, yf: 0.0,  rx:  0.0,  ry:  6.0,  rz: -0.9,  s: 0.46 },
    { at: "#pievienojies", xf: 0.0,  yf: -1.7,  rx:  0.9,  ry:  7.3,  rz:  0.0,  s: 0.42 },
  ];
  let track = []; // {pos, k} — izmērītās skrola pozīcijas augošā secībā

  function measure() {
    track = [];
    for (const k of KEYS) {
      if (k.at === "top") { track.push({ pos: 0, k }); continue; }
      const el = document.querySelector(k.at);
      if (!el || el.closest("[hidden]")) continue;
      const r = el.getBoundingClientRect();
      track.push({ pos: r.top + window.scrollY + r.height / 2 - innerHeight / 2, k });
    }
    track.sort((a, b) => a.pos - b.pos);
  }

  // skata puse pasaules vienībās pie z=0 (kamera skatās pa Z asi)
  let halfH = 1, halfW = 1, mobileK = 1;
  function updateViewport() {
    const w = innerWidth, h = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    halfW = halfH * camera.aspect;
    mobileK = w < 640 ? 0.72 : 1;
    measure();
  }

  const smooth = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;

  // mērķis pie dotā skrola — interpolē starp blakus atslēgkadriem
  const target = { x: 0, y: 0, rx: 0, ry: 0, rz: 0, s: 1 };
  function computeTarget(scrollY) {
    if (!track.length) return;
    let a = track[0], b = track[0], t = 0;
    if (scrollY >= track[track.length - 1].pos) {
      a = b = track[track.length - 1];
    } else {
      for (let i = 0; i < track.length - 1; i++) {
        if (scrollY >= track[i].pos && scrollY < track[i + 1].pos) {
          a = track[i]; b = track[i + 1];
          t = smooth((scrollY - a.pos) / (b.pos - a.pos));
          break;
        }
      }
    }
    const A = a.k, B = b.k;
    target.x = lerp(A.xf, B.xf, t) * halfW;
    target.y = lerp(A.yf, B.yf, t) * halfH;
    target.rx = lerp(A.rx, B.rx, t);
    target.ry = lerp(A.ry, B.ry, t);
    target.rz = lerp(A.rz, B.rz, t);
    target.s = lerp(A.s, B.s, t) * mobileK;
    // Šaurā ekrānā mikrofons nedrīkst gulēt uz teksta kolonnas: atbīdām pie
    // malas. Malu izvēlas ar histerēzi — bez tās, x šķērsojot nulli starp
    // pretējo pušu atslēgkadriem, mērķis lēktu no malas uz malu katru kadru.
    if (mobileK < 1 && Math.abs(target.y) < halfH) {
      if (target.x > halfW * 0.2) edgeSign = 1;
      else if (target.x < -halfW * 0.2) edgeSign = -1;
      target.x = edgeSign * Math.max(Math.abs(target.x), halfW * 0.78);
    }
  }
  let edgeSign = 1;

  /* -------------------- Animācijas cilpa -------------------- */
  const cur = { x: 0, y: 0, rx: 0, ry: 0, rz: 0, s: 1 };
  const mouse = { x: 0, y: 0 };
  let lastScroll = 0, velTilt = 0;

  addEventListener("pointermove", (e) => {
    if (reduce) return;
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  function apply(dt, time) {
    computeTarget(window.scrollY);

    // peles paralakse — viegli velk mikrofonu un skatienu līdzi kursoram
    const tx = target.x + mouse.x * halfW * 0.03;
    const ty = target.y - mouse.y * halfH * 0.03;

    const f = 1 - Math.exp(-dt * 4.2); // amortizēta sekošana (kadru neatkarīga)
    cur.x += (tx - cur.x) * f;
    cur.y += (ty - cur.y) * f;
    cur.rx += (target.rx + mouse.y * 0.1 - cur.rx) * f;
    cur.ry += (target.ry + mouse.x * 0.14 - cur.ry) * f;
    cur.rz += (target.rz - cur.rz) * f;
    cur.s += (target.s - cur.s) * f;

    // skrola ātrums mikrofonu mazliet sasver — inerces izjūta
    const vel = (window.scrollY - lastScroll) / Math.max(dt, 1e-4);
    lastScroll = window.scrollY;
    velTilt += (Math.max(-0.3, Math.min(0.3, vel * 0.00016)) - velTilt) * f;

    // dzīvības cilpa: elpojoša šūpošanās un lēna nepārtraukta rotācija
    const bobY = Math.sin(time * 1.1) * 0.05;
    const bobR = Math.sin(time * 0.7) * 0.04;

    mic.position.set(cur.x, cur.y + bobY, 0);
    mic.rotation.set(cur.rx + bobR, cur.ry + time * 0.14, cur.rz + velTilt);
    mic.scale.setScalar(cur.s);
  }

  let rafId = 0, lastT = 0, running = false;
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const t = now / 1000;
    const dt = Math.min(0.05, t - (lastT || t));
    lastT = t;
    apply(dt, t);
    renderer.render(scene, camera);
  }
  function start() {
    if (running || reduce) return;
    running = true; lastT = 0;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  /* Nekustīgs kadrs pašreizējā skrola pozā — "mazāk kustību" režīmam.
     Poza seko horeogrāfijai (citādi hero izmēra mikrofons brauktu līdzi
     skatam pāri visiem tekstiem), bet nekas negriežas un nešūpojas. */
  function renderPose() {
    computeTarget(window.scrollY);
    mic.position.set(target.x, target.y, 0);
    mic.rotation.set(target.rx, target.ry, target.rz);
    mic.scale.setScalar(target.s);
    renderer.render(scene, camera);
  }

  /* -------------------- Dzīves cikls -------------------- */
  updateViewport();
  if (reduce) renderPose(); else start();

  addEventListener("resize", () => { updateViewport(); if (reduce) renderPose(); });

  // "mazāk kustību": viens lēts kadrs uz skrolu, bez animācijas cilpas
  let poseTick = false;
  addEventListener("scroll", () => {
    if (!reduce || poseTick) return;
    poseTick = true;
    requestAnimationFrame(() => { poseTick = false; if (reduce) renderPose(); });
  }, { passive: true });

  if (motionMq && motionMq.addEventListener) {
    motionMq.addEventListener("change", (e) => {
      reduce = e.matches;
      if (reduce) { stop(); mouse.x = mouse.y = 0; renderPose(); }
      else if (!document.hidden && document.body.dataset.mode === "info") start();
    });
  }

  // saturs ielādējas/mainās asinhroni (kalendārs, fonti, bildes) → pārmērām
  if ("ResizeObserver" in window) {
    let mt;
    new ResizeObserver(() => {
      clearTimeout(mt);
      mt = setTimeout(() => { measure(); if (reduce) renderPose(); }, 120);
    }).observe(document.body);
  }
  addEventListener("load", () => { measure(); if (reduce) renderPose(); });

  // neredzamā cilnē un veikala/par-mums režīmā nerēķinām ne kadru
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop(); else if (document.body.dataset.mode === "info") start();
  });
  new MutationObserver(() => {
    if (document.body.dataset.mode === "info") { measure(); if (reduce) renderPose(); else start(); }
    else stop();
  }).observe(document.body, { attributes: true, attributeFilter: ["data-mode"] });
})();
