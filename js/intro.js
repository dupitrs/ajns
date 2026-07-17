/* ============================================================
   Intro animācija. Skatīt arī css/intro.css un js/intro-gate.js.

   Vai intro rādīt, izlemj js/intro-gate.js <head> sadaļā — šeit to tikai
   nolasa. Neliec šo lēmumu abās vietās.

   Atkļūdošanai:
     ?t=800     iesaldē animāciju 800. milisekundē
     ?intro=1   rāda intro arī tad, kad tas šai sesijai jau nostrādājis
   ============================================================ */
(() => {
  'use strict';

  const HOLE_X = 0.5383, HOLE_Y = 0.5007;     // cauruma platākā punkta vieta logo kastē
  const HOLE_R = 0.2899;                      // cauruma iekšējais rādiuss / logo platums

  const N       = 44;      // sloksnu skaits
  const CURL_R  = 0.30;    // vijuma rādiuss (daļa no sloksnu kvadrāta).
                           // Par mazu -> uzlīme satinas ciešā rullī. ~0.3 dod vaļīgu,
                           // dabisku loku, kas noiet mazliet vairāk par pusapli.
  const OVERLAP = 0.8;     // sloksnu pārlaidums px, lai starp tām nepaliktu matainas šuves

  // Lobīšanās ass grādos. Tā nav nemainīga: sākumā uzlīme ceļas no augšējā labā
  // stūra pa diagonāli uz leju pa kreisi, bet uz beigām fronte pagriežas gandrīz
  // horizontāli un pēdējais gabals atraujas no augšas uz leju. Tā to dara roka —
  // ar nemainīgu asi kustība izskatās mehāniska.
  const THETA0  = -38;
  const THETA1  = -58;

  const T_PEEL   = [0, 620];   // ms — lobīšanās fronte iet pāri uzlīmei
  const T_DETACH = 615;        // ms — pēdējais gabals atraujas; no šī brīža rēķina fizika.
                               // Nedrīkst būt agrāk par brīdi, kad lobīšanās praktiski
                               // pabeigta, citādi vēl pielīmētā daļa aizlido līdzi.
  const T_ZOOM   = [760, 1800];// sākas, kamēr uzlīme vēl krīt — tā visas trīs daļas
                               // pārklājas un skatās kā viena kustība, ne kā saraksts

  // Atrāvusies uzlīme neapstājas — tā turpina tīties ciešāk, jo līme vairs
  // netur to plakanu. To panāk, pakāpeniski saraujot vijuma rādiusu.
  const CURL_TIGHT = 0.62;     // cik daļa no sākotnējā rādiusa paliek pāri.
                               // Zem ~0.5 rullis satinas tik cieši, ka logo vairs
                               // nav redzams un lejā krīt tikai balta caurule.
  const T_TIGHTEN  = 700;      // ms, cik ilgi tīšanās turpinās pēc atraušanās

  // Fizika. Uzlīme neseko nevienai uzzīmētai līknei — ir tikai sākuma ātrums,
  // smagums un gaisa pretestība, pārējo izrēķina solis pa solim.
  const G      = 1900;   // px/s² — smagums
  const DRAG   = 2.6;    // 1/s — gaisa pretestība; gala ātrums = G/DRAG, te ~730 px/s.
                         // Papīrs ir viegls, tāpēc tas nekrīt kā akmens — pretestība dominē.
  const KICK_X = -170;   // px/s — papildu grūdiens pa kreisi. Pārējo sākuma ātrumu
                         // NEUZDOD ar roku, to izrēķina no lobīšanās — sk. launchVelocity().

  // Plīvošana. Krītošam papīram gaiss uzspiež no sāniem, un tas pats spēks to
  // groza. Tāpēc šūpošanās un griešanās nāk no VIENA avota — ja griešanos
  // uzdotu atsevišķi ar nemainīgu ātrumu, tā izskatītos pēc mehānisma.
  const FLUT_F  = 980;   // px/s² — sānu spēks; šis gan met te uz vienu, te uz otru pusi
  const FLUT_W  = 5.4;   // rad/s — cik bieži gaiss pārmet
  const OMEGA0  = -120;  // grādi/s — griešanās, ko uzlīme paņem līdzi no lobīšanās
  // Griezes moments paliek vienā zīmē, mainās tikai tā lielums: uzlīme griežas
  // tikai uz vienu pusi, te ātrāk, te lēnāk. Ja zīme mainītos, tā šūpotos
  // šurpu turpu kā svārsts, un tas nav tas, kā krīt papīrs.
  const OM_TORQ = 620;   // grādi/s² — lielākais griezes moments
  const OM_VARY = 0.45;  // cik lielā daļā tas svārstās (0 = vienmērīgi, 1 = līdz nullei)
  const OM_DRAG = 1.8;   // 1/s — griešanās rimst
  const DT      = 1/120; // fiksēts solis: vienāds rezultāts jebkurā kadru ātrumā

  // Lapā ir tikai tukšs <div id="intro">. Tas ar CSS jau ir sarkans, tāpēc lapa
  // aiz tā nepaspīd, kamēr šis skripts uzbūvē pārējo.
  const intro = document.getElementById('intro');
  if (!intro) return;

  let sheetG, wrap, flyer, shadow;

  const frozen = new URLSearchParams(location.search).get('t');

  // Jebkura darbība nozīmē "es to negribu skatīties" — arī ritināšana.
  const SKIP_ON = ['pointerdown', 'keydown', 'wheel', 'touchmove'];

  function finish() {
    intro.classList.add('is-done');
    document.documentElement.classList.remove('intro-running');
    for (const e of SKIP_ON) removeEventListener(e, skip);
  }
  function skip() { if (frozen === null) finish(); }

  // Vārti jau ir izlēmuši un atzīmējuši lapu. Neatkārto lēmumu — tas noved pie
  // divām patiesībām, kas ar laiku sāk atšķirties.
  if (document.documentElement.classList.contains('intro-skip')) { finish(); return; }

  document.documentElement.classList.add('intro-running');
  // Intro var pārtraukt jebkurā brīdī — neviens nav spiests to noskatīties.
  for (const e of SKIP_ON) addEventListener(e, skip, { passive: true });

  intro.innerHTML =
    '<div id="sheetGroup"><div id="sheet"></div><div id="holeWall"></div></div>' +
    '<div id="stickerWrap"><div id="flyer">' +
      '<div id="shadowLayer"><div class="scene"><div class="peel" id="peelS"></div></div></div>' +
      '<div class="scene"><div class="peel" id="peelF"></div></div>' +
    '</div></div>';
  sheetG = document.getElementById("sheetGroup");
  wrap   = document.getElementById('stickerWrap');
  flyer  = document.getElementById('flyer');
  shadow = document.getElementById('shadowLayer');

  // #sheet tagad nosedz visu tieši tāpat, tāpēc #intro pagaidu fons vairs nav
  // vajadzīgs — un tas ir jānoņem, citādi tas paliktu aiz izgrieztā cauruma un
  // caurums rādītu sarkanu, nevis lapu. Acij šis mirklis nav pamanāms.
  intro.style.background = 'none';

  const scenes = [
    { peel: document.getElementById('peelF'), shadow: false, strips: [] },
    { peel: document.getElementById('peelS'), shadow: true,  strips: [] }
  ];

  let W, H, D, w, R, ox, oy, S;

  // Cik tālu frontei jāaizslauka pa lobīšanās asi, lai tā pagūtu garām visai
  // logo kastei. Atkarīgs no ass leņķa, tāpēc jārēķina no jauna, tam mainoties.
  function axisRange(theta) {
    const th = theta * Math.PI / 180;
    let lo = Infinity, hi = -Infinity;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const px = sx * W / 2, py = sy * H / 2;
      const xp = px * Math.cos(th) + py * Math.sin(th) + D / 2;
      lo = Math.min(lo, xp); hi = Math.max(hi, xp);
    }
    return [hi, lo];            // [sākums, beigas] — fronte iet no hi uz lo
  }

  function layout() {
    W = wrap.offsetWidth;
    H = wrap.offsetHeight;
    D = Math.hypot(W, H);          // kvadrāts, kas nosedz logo jebkurā leņķī
    w = D / N;
    R = CURL_R * D;
    lastTheta = null;              // pēc izmēra maiņas pagriezieni jāuzliek no jauna

    // Tālummaiņas centrs = cauruma platākais punkts. Mēra pret PAŠAS loksnes
    // kasti, nevis pret innerWidth: ritjosla tos atšķir par ~15px, un tad
    // tālummaiņa ietu garām caurumam.
    const box = sheetG.getBoundingClientRect();
    ox = box.width  / 2 + (HOLE_X - 0.5) * W;
    oy = box.height / 2 + (HOLE_Y - 0.5) * H;
    sheetG.style.transformOrigin = `${ox}px ${oy}px`;

    // Cik jāpalielina, lai caurums nosegtu tālāko ekrāna stūri.
    let far = 0;
    for (const cx of [0, box.width]) for (const cy of [0, box.height])
      far = Math.max(far, Math.hypot(cx - ox, cy - oy));
    S = (far / (HOLE_R * W)) * 1.35;

    for (const sc of scenes) {
      Object.assign(sc.peel.style, {
        width: D + 'px', height: D + 'px',
        left: (W - D) / 2 + 'px', top: (H - D) / 2 + 'px'
      });
      if (!sc.strips.length) buildStrips(sc);
      for (let i = 0; i < N; i++) {
        const s = sc.strips[i];
        Object.assign(s.el.style, { left: i * w + 'px', width: (w + OVERLAP) + 'px', height: D + 'px' });
        // Pagriezienu šeit neliek — to katrā kadrā uzliek setPeel(), jo ass griežas.
        for (const f of s.faces) Object.assign(f.style, {
          left: -i * w + 'px', width: D + 'px', height: D + 'px',
          backgroundSize: `${W}px ${H}px`,
          backgroundPosition: `${(D - W) / 2}px ${(D - H) / 2}px`,
          webkitMaskSize: `${W}px ${H}px`, maskSize: `${W}px ${H}px`,
          webkitMaskPosition: `${(D - W) / 2}px ${(D - H) / 2}px`,
          maskPosition: `${(D - W) / 2}px ${(D - H) / 2}px`
        });
      }
    }
  }

  function buildStrips(sc) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < N; i++) {
      const el = document.createElement('div'); el.className = 'strip';
      const sf = document.createElement('div'); sf.className = 'sf';
      const ff = document.createElement('div');
      ff.className = 'face ' + (sc.shadow ? 'face--shadow' : 'face--front');
      sf.appendChild(ff);
      const sb = document.createElement('div'); sb.className = 'sb';
      const mir = document.createElement('div'); mir.className = 'mir';
      const fb = document.createElement('div');
      fb.className = 'face ' + (sc.shadow ? 'face--shadow' : 'face--back');
      mir.appendChild(fb); sb.appendChild(mir);
      el.append(sf, sb); frag.appendChild(el);
      sc.strips.push({ el, sf, sb, faces: [ff, fb], shade: 1 });
    }
    sc.peel.appendChild(frag);
  }

  // Sloksne aptinas ap cilindru, tiklīdz lobīšanās fronte to ir pagājusi.
  // rEff ir vijuma rādiuss šajā mirklī: jo mazāks, jo ciešāks rullis.
  // theta ir ass leņķis šajā mirklī — sloksnes griežas līdzi, attēls paliek uz vietas.
  let lastTheta = null;
  function setPeel(p, rEff, theta) {
    const [xStart, xEnd] = axisRange(theta);
    if (theta !== lastTheta) {
      const fwd  = `rotate(${theta.toFixed(2)}deg)`;
      const back = `rotate(${(-theta).toFixed(2)}deg)`;
      for (const sc of scenes) {
        sc.peel.style.transform = fwd;
        // Sejas griežas pretī tikpat, cik telpa uz priekšu, tāpēc attēls uz
        // nenolobītās daļas paliek nekustīgs neatkarīgi no ass leņķa.
        for (const st of sc.strips) for (const f of st.faces) f.style.transform = back;
      }
      lastTheta = theta;
    }
    const front = xStart + (xEnd - xStart) * p;
    for (let i = 0; i < N; i++) {
      const xL = i * w;                 // sloksnes kreisā mala lobīšanās telpā
      const s  = xL - front;            // cik tālu aiz frontes
      let tf, b;
      if (s <= 0) {
        tf = 'translateZ(0px)';         // vēl pielīmēts
        b = 1;
      } else {
        const phi = s / rEff;
        const dx  = (front + rEff * Math.sin(phi)) - xL;
        const dz  = rEff * (1 - Math.cos(phi));
        tf = `translate3d(${dx}px,0,${dz}px) rotateY(${-phi * 180 / Math.PI}deg)`;
        // Vienkāršs apgaismojums: jo vairāk sloksne pagriezta prom no skatītāja,
        // jo tumšāka. Bez tā vijums izskatās plakans.
        b = 0.62 + 0.38 * Math.abs(Math.cos(phi));
      }
      for (const sc of scenes) {
        const st = sc.strips[i];
        st.el.style.transform = tf;
        if (sc.shadow) continue;        // ēnai ēnojums nav vajadzīgs — tā jau ir melna
        if (Math.abs(b - st.shade) > 0.01) {
          st.sf.style.filter = st.sb.style.filter = b === 1 ? '' : `brightness(${b.toFixed(3)})`;
          st.shade = b;
        }
      }
    }
  }

  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const easeInOut = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2;
  const easeIn    = t => t * t;
  const span = (now, [a, b]) => clamp01((now - a) / (b - a));

  // Lobīšanās paātrinās: sākumā līme tur pretī, tad tā padodas. Nekādas
  // bremzēšanas beigās — tieši tur rastos rāviens pirms kritiena.
  const rip  = u => Math.pow(u, 1.8);
  const dRip = u => 1.8 * Math.pow(u, 0.8);
  const peelAngle = p => THETA0 + (THETA1 - THETA0) * p;

  // ---- Kritiens: nevis uzzīmēta trajektorija, bet integrēta kustība ----
  // Sākuma ātrumu NEIZDOMĀ. To nolasa no lobīšanās: brīdī, kad uzlīme atraujas,
  // vijums jau kustas ar noteiktu ātrumu noteiktā virzienā, un kritiens turpina
  // tieši no turienes. Ja to uzdotu ar roku, pārejā būtu redzams rāviens.
  function launchVelocity() {
    const dur = (T_PEEL[1] - T_PEEL[0]) / 1000;          // s
    const u   = clamp01((T_DETACH - T_PEEL[0]) / (T_PEEL[1] - T_PEEL[0]));
    const theta = peelAngle(rip(u));
    const [a, b] = axisRange(theta);
    const speed = Math.abs(b - a) * (dRip(u) / dur);     // px/s pa asi
    const th = theta * Math.PI / 180;
    // Fronte iet uz asi samazinošā virzienā, tāpēc ekrānā tas ir -(cos, sin).
    return { vx: -Math.cos(th) * speed + KICK_X, vy: -Math.sin(th) * speed };
  }

  const body = { t: 0, x: 0, y: 0, vx: 0, vy: 0, rot: 0, om: OMEGA0, ready: false };
  function stepTo(target) {            // target sekundēs kopš atraušanās
    if (!body.ready) { const v = launchVelocity(); body.vx = v.vx; body.vy = v.vy; body.ready = true; }
    while (body.t < target - 1e-9) {
      const dt = Math.min(DT, target - body.t);
      const flut = Math.sin(FLUT_W * body.t);      // gaiss met te uz vienu, te uz otru pusi
      body.vx += (-DRAG * body.vx + FLUT_F * flut) * dt;
      body.vy += (G - DRAG * body.vy) * dt;
      body.om += (-OM_TORQ * (1 - OM_VARY + OM_VARY * flut) - OM_DRAG * body.om) * dt;
      body.x  += body.vx * dt;
      body.y  += body.vy * dt;
      body.rot += body.om * dt;
      body.t  += dt;
    }
  }

  layout();
  addEventListener('resize', () => { if (!intro.classList.contains('is-done')) layout(); });

  let t0 = null;
  function frame(ts) {
    if (t0 === null) t0 = ts;
    const t = frozen !== null ? +frozen : ts - t0;

    // Kamēr uzlīme lobās, rādiuss ir nemainīgs; atrāvusies tā tinas ciešāk.
    const pp      = rip(span(t, T_PEEL));
    const tighten = span(t, [T_DETACH, T_DETACH + T_TIGHTEN]);
    setPeel(pp, R * (1 - (1 - CURL_TIGHT) * easeInOut(tighten)), peelAngle(pp));

    const fall = (t - T_DETACH) / 1000;
    if (fall > 0) {
      stepTo(fall);
      flyer.style.transform =
        `translate3d(${body.x.toFixed(1)}px, ${body.y.toFixed(1)}px, 0) ` +
        `rotate(${body.rot.toFixed(2)}deg)`;
    }

    // Ēna mīkstinās un attālinās, kamēr uzlīme ceļas nost no loksnes.
    const lift = clamp01(span(t, [0, 900]));
    shadow.style.filter = `blur(${(5 + 20 * lift).toFixed(1)}px) opacity(${(0.62 - 0.14 * lift).toFixed(3)})`;
    shadow.style.transform = `translate(${(4 + 28 * lift).toFixed(1)}px, ${(7 + 32 * lift).toFixed(1)}px)`;

    const zp = span(t, T_ZOOM);
    if (zp > 0) {
      // Eksponenciāla tālummaiņa — tā acij šķiet vienmērīga, nevis rāvienā.
      sheetG.style.transform = `scale(${Math.exp(Math.log(S) * easeIn(zp))})`;
    }

    if (frozen !== null) return;
    if (intro.classList.contains('is-done')) return;   // skatītājs izlaida
    // Tālummaiņa beidzas pēc pulksteņa, bet uzlīme krīt pa īstiem pikseļiem.
    // Uz augsta ekrāna tā vēl ir gaisā — tad nogaidām, līdz tā tiešām aizkrīt,
    // citādi tā pazustu pusceļā. Griesti, lai cikls nekad nepaliek mūžīgs.
    const airborne = body.y < innerHeight / 2 + H;
    if (t < T_ZOOM[1] || (airborne && t < T_ZOOM[1] + 1200)) requestAnimationFrame(frame);
    else finish();
  }

  // Neļauj attēla gaidīšanai aizturēt visu uz nenoteiktu laiku: ja tas
  // neatbild, sākam bez tā — aiz sarkanā ir visa lapa.
  const start = () => requestAnimationFrame(frame);
  let started = false;
  const startOnce = () => { if (!started) { started = true; start(); } };
  const png = new Image();
  png.src = 'assets/img/logo-sticker.png';
  (png.decode ? png.decode().catch(() => {}) : Promise.resolve()).then(startOnce);
  setTimeout(startOnce, 400);
})();
