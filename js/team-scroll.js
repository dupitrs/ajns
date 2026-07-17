/* ============================================================
   KOMANDA · ritināšanas vadītā skatuve
   Video ieslīd (1. no lejas, 2. no labās, 3. no kreisās, 4. no
   labās), atskaņojas līdzi ritināšanai un apstājas uz beigu kadra.
   Blakus iekrīt teksts pa burtiem. Beigās visi četri sastājas rindā.
   Mazos ekrānos un ar reduced-motion paliek vienkāršais režģis.
   ============================================================ */
(() => {
  "use strict";

  const section = document.querySelector(".team-scroll");
  if (!section) return;

  const stage = section.querySelector(".tm-stage");
  const items = Array.from(section.querySelectorAll(".tm-item"));
  const vids  = items.map(it => it.querySelector("video"));
  if (items.length !== 4) return;

  const FALLBACK_DUR = 5;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease  = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp  = (a, b, t) => a + (b - a) * t;

  /* ---------- Teksta bloki no data-atribūtiem ---------- */
  // Teksta puse: +1 = pa labi no centra, -1 = pa kreisi
  const SIDE = [1, -1, 1, -1];

  const texts = items.map((it, i) => {
    const t = document.createElement("div");
    t.className = "tm-text";
    t.setAttribute("aria-hidden", "true");
    const chars = Array.from(it.dataset.name).map((c, j) =>
      `<span class="tm-char" style="--d:${(j * 0.03).toFixed(3)}s">${c === " " ? "&nbsp;" : c}</span>`
    ).join("");
    t.innerHTML =
      `<p class="tm-text__num">0${i + 1}</p>` +
      `<h3 class="tm-text__name">${chars}</h3>` +
      `<p class="tm-text__role">${it.dataset.role}</p>` +
      `<p class="tm-text__tag">${it.dataset.tag}</p>`;
    t.style.transform = `translate(-50%,-50%) translate3d(${20 * SIDE[i]}vw,0,0)`;
    stage.appendChild(t);
    return t;
  });

  const cue = document.createElement("p");
  cue.className = "tm-cue";
  cue.textContent = "Ritini";
  section.querySelector(".team-scroll__sticky").appendChild(cue);

  /* ---------- Fāžu logi (daļa no sadaļas progresa 0..1) ---------- */
  const W = [
    { enter: [0.000, 0.130], text: [0.135, 0.205], up: [0.205, 0.300] },
    { enter: [0.205, 0.335], text: [0.340, 0.410], up: [0.410, 0.505] },
    { enter: [0.410, 0.540], text: [0.545, 0.615], up: [0.615, 0.710] },
    { enter: [0.615, 0.745], text: [0.750, 0.845] },
  ];
  const ROW_T = [[0.875, 0.925], [0.885, 0.935], [0.895, 0.945], [0.875, 0.935]];
  const ROW_X = [-27, -9, 9, 27];   // rindas pozīcijas (vw no centra)
  const ROW_Y = 2, ROW_S = 0.62;
  const ENTER_FROM = [{ x: 0, y: 115 }, { x: 75, y: 0 }, { x: -75, y: 0 }, { x: 75, y: 0 }];

  /* ---------- Stāvokļa aprēķins vienam dalībniekam ---------- */
  function place(i, p) {
    const w = W[i];
    const solo = { x: -14 * SIDE[i], y: 0, s: 1 };
    const from = ENTER_FROM[i];
    const [r0, r1] = ROW_T[i];
    const row = { x: ROW_X[i], y: ROW_Y, s: ROW_S };

    if (p < w.enter[0]) return { x: from.x, y: from.y, s: 1 };
    if (p < w.enter[1]) {
      const k = ease((p - w.enter[0]) / (w.enter[1] - w.enter[0]));
      return { x: lerp(from.x, solo.x, k), y: lerp(from.y, solo.y, k), s: 1 };
    }
    if (i < 3) {
      if (p < w.up[0]) return solo;
      if (p < w.up[1]) {
        const k = ease((p - w.up[0]) / (w.up[1] - w.up[0]));
        return { x: solo.x, y: lerp(0, -115, k), s: 1 };
      }
      if (p < r0) return { x: solo.x, y: -115, s: 1 };
      if (p < r1) {
        const k = ease((p - r0) / (r1 - r0));
        return { x: lerp(solo.x, row.x, k), y: lerp(-115, row.y, k), s: lerp(1, row.s, k) };
      }
      return row;
    }
    // 4. dalībnieks: no solo pozīcijas tieši uz rindu
    if (p < r0) return solo;
    if (p < r1) {
      const k = ease((p - r0) / (r1 - r0));
      return { x: lerp(solo.x, row.x, k), y: lerp(solo.y, row.y, k), s: lerp(1, row.s, k) };
    }
    return row;
  }

  /* ---------- Video ielāde un skrubēšana ----------
     Video ielādējam pilnībā kā blob: skrubēšanai vajag acumirklīgus
     lēcienus uz jebkuru kadru, ko progresīvā straumēšana (un serveri
     bez Range atbalsta) nenodrošina. */
  let loadKicked = false;
  function kickLoad() {
    if (loadKicked) return;
    loadKicked = true;
    vids.forEach(v => {
      fetch(v.currentSrc || v.src)
        .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
        .then(b => {
          v.src = URL.createObjectURL(b);
          v.load();
          v.dataset.ready = "1";
        })
        .catch(() => { v.dataset.ready = "1"; /* turpinām ar tīkla src */ });
    });
  }

  /* Kustības laikā video skrubējas līdz (garums − TAIL); sasniedzot
     pozīciju, atlikusī ~1 s nospēlējas reāllaikā — "dzīvā aste". */
  const TAIL = 1.0;
  const tailEnter = [false, false, false, false];
  const rowStart  = [false, false, false, false];

  function scrub(i, p) {
    const v = vids[i];
    if (v.dataset.ready !== "1") return;
    const durFull = (v.duration || FALLBACK_DUR) - 0.05;
    const durMove = Math.max(0.5, durFull - TAIL);
    const [e0, e1] = W[i].enter;
    const up = W[i].up;
    const [r0, r1] = ROW_T[i];

    let target = null, tail = null;

    if (p <= e0) { tailEnter[i] = false; target = 0; }
    else if (p < e1) { tailEnter[i] = false; target = ((p - e0) / (e1 - e0)) * durMove; } // ienāk
    else if (i < 3 && up && p >= up[0]) {
      if (p < up[1]) target = (1 - (p - up[0]) / (up[1] - up[0])) * durFull;  // prom: atpakaļgaitā
      else if (p < r0) { rowStart[i] = false; target = 0; }                   // gaida augšā
      else {
        // Rindā: video spēlējas pats reāllaikā (bez skrubēšanas)
        if (!rowStart[i]) {
          rowStart[i] = true;
          try { v.currentTime = 0; } catch (_) {}
          v.play().catch(() => {});
        }
        return;
      }
    }
    else if (!tailEnter[i]) tail = "enter";

    if (tail === "enter") { tailEnter[i] = true; v.play().catch(() => {}); return; }
    if (target === null) return; // aste nospēlēta — video paliek beigu kadrā

    if (!v.paused) v.pause();
    if (v.readyState >= 1 && Math.abs(v.currentTime - target) > 0.033) {
      try { v.currentTime = target; } catch (_) { /* vēl nav gatavs */ }
    }
  }

  /* ---------- Galvenā atjaunošana ---------- */
  /* Progresu izlīdzinām eksponenciāli — kustība plūst mīksti arī tad,
     ja ritināšana ir rāviena veida (ritenītis, tastatūra). */
  let pSm = 0, pInit = false;

  function update() {
    const rect = section.getBoundingClientRect();
    if (!rect.height) return;
    if (rect.bottom < -200 || rect.top > innerHeight + 1200) return;
    kickLoad();

    const total = rect.height - innerHeight;
    const pRaw = clamp(-rect.top / total, 0, 1);
    if (!pInit) { pSm = pRaw; pInit = true; }
    pSm += (pRaw - pSm) * 0.11;
    if (Math.abs(pRaw - pSm) < 0.0004) pSm = pRaw;
    const p = pSm;

    cue.classList.toggle("is-hidden", p > 0.04);

    for (let i = 0; i < 4; i++) {
      const s = place(i, p);
      items[i].style.transform =
        `translate(-50%,-50%) translate3d(${s.x}vw,${s.y}vh,0) scale(${s.s})`;
      items[i].classList.toggle("cap-in", p > 0.94);
      scrub(i, p);

      const t = texts[i], w = W[i];
      if (p >= w.text[0] && p < w.text[1]) {
        t.classList.add("is-in");
        t.classList.remove("is-out");
      } else if (p >= w.text[1]) {
        t.classList.add("is-out");
      } else {
        t.classList.remove("is-in", "is-out");
      }
    }
  }

  /* ---------- Režīma izvēle ---------- */
  const mqWide   = matchMedia("(min-width: 900px)");
  const mqMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let enhanced = false;

  function setEnhanced(on) {
    if (on === enhanced) return;
    enhanced = on;
    section.classList.toggle("is-enhanced", on);
    if (!on) {
      items.forEach(it => { it.style.transform = ""; it.classList.remove("cap-in"); });
      texts.forEach(t => t.classList.remove("is-in", "is-out"));
    } else {
      update();
    }
  }
  const evalMode = () => setEnhanced(mqWide.matches && !mqMotion.matches);
  mqWide.addEventListener?.("change", evalMode);
  mqMotion.addEventListener?.("change", evalMode);
  evalMode();

  /* Vienkāršajā režīmā (mobilie) — atskaņo vienreiz, kad kartīte redzama */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !enhanced) {
        const v = e.target;
        v.play?.().catch(() => {});
        io.unobserve(v);
      }
    });
  }, { threshold: 0.45 });
  vids.forEach(v => io.observe(v));

  /* rAF cilpa — strādā tikai, kad sadaļa tuvumā un režīms aktīvs */
  (function loop() {
    if (enhanced) update();
    requestAnimationFrame(loop);
  })();
})();
