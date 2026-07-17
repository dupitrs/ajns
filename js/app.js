/* ============================================================
   A ja nu sanāk?  ·  Frontend prototype logic
   (mock data — savieno ar backend/DB izstrādes laikā)
   ============================================================ */
(function () {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = (c) => "€" + (c / 100).toFixed(2).replace(".", ",");

  const MONTHS_LV = ["JAN","FEB","MAR","APR","MAI","JŪN","JŪL","AUG","SEP","OKT","NOV","DEC"];
  const MONTHS_FULL = ["janvāris","februāris","marts","aprīlis","maijs","jūnijs","jūlijs","augusts","septembris","oktobris","novembris","decembris"];

  /* -------------------- Inline SVG icons (bez emoji) -------------------- */
  const svg = (p, w=16) => `<svg class="ic" viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICONS = {
    user:  svg('<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>'),
    clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    pin:   svg('<path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/>'),
    check: svg('<path d="M4 12.5 9.5 18 20 6"/>', 30),
    seat:  svg('<path d="M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"/><path d="M4 11h16v5H4z"/><path d="M6 16v3M18 16v3"/>'),
  };

  /* -------------------- MOCK: pasākumi -------------------- */
  /* Demonstrācijas dati. Reālie pasākumi nāks no datubāzes / admin paneļa. */
  const EVENTS = [
    { id:"jns-11", date:"2026-07-14T18:30", title:"Kā pārdot ideju 5 minūtēs",
      guest:"Viesis tiek izziņots", role:"Komunikācija un pārdošana",
      place:"Rīga (vieta tiek izziņota)", capacity:80, taken:61,
      desc:"Praktiska sesija par to, kā strukturēt savu ideju tā, lai to saprot un atceras. Pēc lekcijas — tīklošanās.",
      highlights:["Kā noķert uzmanību pirmajās 30 sekundēs","Stāsta uzbūve, kas pārdod","Q&A un tīklošanās ar dzērienu"] },
    { id:"jns-12", date:"2026-07-21T18:30", title:"No blakusprojekta uz reālu biznesu",
      guest:"Viesis tiek izziņots", role:"Uzņēmējdarbība",
      place:"Rīga (vieta tiek izziņota)", capacity:80, taken:80,
      desc:"Stāsts par to, kā hobijs pārtop par ienākumiem. Kļūdas, mācības un pirmie klienti.",
      highlights:["Pirmie soļi bez budžeta","Kad pamest darbu","Kā atrast pirmos klientus"] },
    { id:"jns-13", date:"2026-07-28T18:30", title:"Karjera, kas tev der",
      guest:"Ilona Baumane-Vītoliņa", role:"Vadītāju atlases konsultante",
      place:"Rīga (vieta tiek izziņota)", capacity:90, taken:47,
      desc:"Kā izcelties darba tirgū un veidot karjeru ar jēgu — no cilvēka, kas ikdienā atlasa augstākā līmeņa vadītājus.",
      highlights:["Ko tiešām skatās darba devēji","Personīgā zīmola pamati","Sarunas, kas atver durvis"] },
    { id:"jns-14", date:"2026-08-11T18:30", title:"Stāsts, kas pārdod",
      guest:"Armands Puče", role:"Žurnālists un uzņēmējs",
      place:"Rīga (vieta tiek izziņota)", capacity:90, taken:24,
      desc:"Par stāstu spēku medijos, biznesā un ikdienā. Kā runāt tā, lai klausās.",
      highlights:["Fakts vs. emocija","Kā uzrakstīt virsrakstu","Publiskas uzstāšanās bez bailēm"] },
    { id:"jns-15", date:"2026-08-25T18:30", title:"Nauda saprotami",
      guest:"Valters Vestmanis", role:"“Neatkarīgais investors”",
      place:"Rīga (vieta tiek izziņota)", capacity:100, taken:12,
      desc:"Finanšu pamati jaunajam profesionālim — uzkrājumi, investīcijas un pirmie soļi bez sarežģītiem terminiem.",
      highlights:["Kā sākt uzkrāt jau šodien","Pirmās investīcijas","Biežākās kļūdas"] },
    { id:"jns-16", date:"2026-09-08T18:30", title:"Organizē tā, lai sanāk",
      guest:"Raimonds Strokšs", role:"WRC rallija Latvijas posma organizators",
      place:"Rīga (vieta tiek izziņota)", capacity:100, taken:5,
      desc:"Kā no idejas līdz lielam pasākumam — projektu vadība reālā dzīvē.",
      highlights:["Komandas veidošana","Termiņi un budžets","Kad viss iet greizi"] },
  ];

  /* -------------------- MOCK: produkti -------------------- */
  const LOGO = "assets/img/logo.png";
  const PRODUCTS = [
    { id:"tee-coral", name:"T-krekls “Sanāks!”", cat:"krekli", price:2500, color:"#ED4C4C", tag:"Populārākais",
      sizes:["XS","S","M","L","XL"], desc:"Kokvilnas T-krekls ar zīmola uzdruku. Silti sarkans, kā mūsu logo." },
    { id:"tee-black", name:"T-krekls “A ja nu”", cat:"krekli", price:2500, color:"#1c1c1c",
      sizes:["S","M","L","XL"], desc:"Melns T-krekls ar smalku uzdruku uz krūtīm." },
    { id:"tee-sand", name:"T-krekls “Komūna”", cat:"krekli", price:2300, oldPrice:2800, color:"#e9e3d8", tag:"Akcija",
      sizes:["S","M","L"], desc:"Gaišs krekls no organiskās kokvilnas." },
    { id:"hood-coral", name:"Hūdijs “Ja nu → Sanāks”", cat:"virsjakas", price:4900, color:"#ED4C4C", tag:"Jaunums",
      sizes:["S","M","L","XL"], desc:"Silts hūdijs ar kapuci un ķengurkabatu." },
    { id:"hood-grey", name:"Hūdijs “JNS”", cat:"virsjakas", price:4900, color:"#3a3a3a",
      sizes:["M","L","XL"], desc:"Klasisks pelēks hūdijs ikdienai." },
    { id:"tote", name:"Auduma soma", cat:"aksesuari", price:1200, color:"#efe9df",
      sizes:["Viens izmērs"], desc:"Izturīga kokvilnas soma ar zīmola apdruku." },
    { id:"beanie", name:"Cepure", cat:"aksesuari", price:1800, color:"#2a2a2a",
      sizes:["Viens izmērs"], desc:"Adīta cepure aukstajām otrdienām." },
    { id:"stickers", name:"Uzlīmju komplekts", cat:"aksesuari", price:500, color:"#ED4C4C",
      sizes:["Komplekts"], desc:"5 uzlīmes ar zīmola motīviem." },
  ];
  const CATS = [["visi","Visi"],["krekli","Krekli"],["virsjakas","Virsjakas"],["aksesuari","Aksesuāri"]];

  /* -------------------- Toast -------------------- */
  let toastT;
  function toast(msg){
    const t = $("#toast");
    t.textContent = msg; t.hidden = false;
    requestAnimationFrame(() => t.classList.add("is-visible"));
    clearTimeout(toastT);
    toastT = setTimeout(() => { t.classList.remove("is-visible"); setTimeout(()=>t.hidden=true,300); }, 2600);
  }

  /* ============================================================
     MODE TOGGLE — Info / Veikals (signature)
     ============================================================ */
  const worlds = { info: $('.world--info'), shop: $('.world--shop'), about: $('.world--about') };
  const modeThumb = $(".mode-toggle__thumb");
  // Pumpurs (thumb) precīzi pielāgojas aktīvās pogas platumam un pozīcijai.
  // Pogas ir dažāda platuma (Info / Veikals / Par mums), tāpēc fiksēts 1/3 neder.
  function positionThumb(){
    const on = $(".mode-toggle__btn.is-active");
    if(!modeThumb || !on) return;
    modeThumb.style.width = on.offsetWidth + "px";
    modeThumb.style.transform = "translateX(" + (on.offsetLeft - modeThumb.offsetLeft) + "px)";
  }
  function setMode(mode){
    if(!worlds[mode] || document.body.dataset.mode === mode) return;
    const cur = document.body.dataset.mode;
    document.body.dataset.mode = mode;
    $$(".mode-toggle__btn").forEach(b=>{
      const on = b.dataset.mode===mode;
      b.classList.toggle("is-active",on);
      b.setAttribute("aria-selected", on?"true":"false");
    });
    positionThumb();
    // smooth cross-fade
    const out = worlds[cur], inn = worlds[mode];
    out.classList.add("is-leaving");
    setTimeout(()=>{
      out.hidden = true; out.classList.remove("is-leaving");
      inn.hidden = false; inn.classList.add("is-entering");
      window.scrollTo({top:0,behavior:"instant" in window ? "instant" : "auto"});
      requestAnimationFrame(()=>requestAnimationFrame(()=>inn.classList.remove("is-entering")));
      revealScan();
    },300);
  }
  $$(".mode-toggle__btn").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));
  $$('[data-goto]').forEach(a=>a.addEventListener("click",e=>{e.preventDefault();setMode(a.dataset.goto);}));
  // Sākuma pozīcija + pārrēķins, ja mainās loga platums vai ielādējas fonti.
  positionThumb();
  window.addEventListener("resize", positionThumb);
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(positionThumb); }

  /* ============================================================
     EVENTS + CALENDAR
     ============================================================ */
  const eventList = $("#eventList");
  const eventEmpty = $("#eventEmpty");
  const monthsWrap = $("#months");
  let activeMonth = null; // null = all

  function eventStatus(ev){
    const left = ev.capacity - ev.taken;
    if(left <= 0) return {key:"full", label:"Izpārdots", cls:"pill--full"};
    if(left <= 10) return {key:"soon", label:"Pēdējās vietas", cls:"pill--soon"};
    return {key:"free", label:"Bezmaksas", cls:"pill--free"};
  }
  function fmtDate(iso){
    const d = new Date(iso);
    return { day:d.getDate(), mon:MONTHS_LV[d.getMonth()], monIdx:d.getMonth(),
      full:`${d.getDate()}. ${MONTHS_FULL[d.getMonth()]}`,
      time:d.toTimeString().slice(0,5),
      weekday:["svētdiena","pirmdiena","otrdiena","trešdiena","ceturtdiena","piektdiena","sestdiena"][d.getDay()] };
  }

  function renderMonths(){
    const present = new Set(EVENTS.map(e=>new Date(e.date).getMonth()));
    let html = `<button class="month-btn is-active" data-month="all">Visi</button>`;
    MONTHS_LV.forEach((m,i)=>{
      if(!present.has(i)) return;
      html += `<button class="month-btn has-events" data-month="${i}">${m}</button>`;
    });
    monthsWrap.innerHTML = html;
    $$(".month-btn",monthsWrap).forEach(b=>b.addEventListener("click",()=>{
      $$(".month-btn",monthsWrap).forEach(x=>x.classList.remove("is-active"));
      b.classList.add("is-active");
      activeMonth = b.dataset.month==="all" ? null : Number(b.dataset.month);
      renderEvents();
    }));
  }

  function renderEvents(){
    const list = EVENTS
      .filter(e => activeMonth===null || new Date(e.date).getMonth()===activeMonth)
      .sort((a,b)=>new Date(a.date)-new Date(b.date));
    if(!list.length){ eventList.innerHTML=""; eventEmpty.hidden=false; return; }
    eventEmpty.hidden = true;
    eventList.innerHTML = list.map(ev=>{
      const d = fmtDate(ev.date), st = eventStatus(ev), left = ev.capacity-ev.taken;
      return `<button class="event-card reveal" data-id="${ev.id}" aria-label="Skatīt pasākumu: ${ev.title}">
        <span class="event-card__date"><span class="event-card__day">${d.day}</span><span class="event-card__mon">${d.mon}</span></span>
        <span class="event-card__main">
          <span class="event-card__title">${ev.title}</span>
          <span class="event-card__meta">
            <span>${ICONS.user}<b class="event-card__guest">${ev.guest}</b></span>
            <span>${ICONS.clock}${d.weekday}, ${d.time}</span>
            <span>${ICONS.pin}${ev.place}</span>
          </span>
        </span>
        <span class="event-card__cta">
          <span class="pill ${st.cls}">${st.label}</span>
          <span class="event-card__seats">${left>0 ? left+" brīvas vietas" : "Pieteikties gaidsarakstam"}</span>
        </span>
      </button>`;
    }).join("");
    $$(".event-card",eventList).forEach(c=>c.addEventListener("click",()=>openEvent(c.dataset.id)));
    revealScan();
  }

  /* ---------- Event modal + registration ---------- */
  const eventModal = $("#eventModal");
  const eventModalBody = $("#eventModalBody");

  function openEvent(id){
    const ev = EVENTS.find(e=>e.id===id); if(!ev) return;
    const d = fmtDate(ev.date), st = eventStatus(ev), left = ev.capacity-ev.taken;
    const full = left<=0;
    eventModalBody.innerHTML = `
      <div class="em-head">
        <p class="em-date">${d.full} · ${d.weekday}, ${d.time}</p>
        <h3 class="em-title">${ev.title}</h3>
        <p class="em-guest">Viesis: <b>${ev.guest}</b> · ${ev.role}</p>
        <div class="em-meta">
          <span>${ICONS.pin}${ev.place}</span>
          <span class="pill ${st.cls}">${st.label}</span>
          <span>${ICONS.seat}${full ? "Gaidsaraksts" : left+" brīvas vietas"}</span>
        </div>
        <p class="em-desc">${ev.desc}</p>
        <ul class="em-list">${ev.highlights.map(h=>`<li>${h}</li>`).join("")}</ul>
      </div>
      <form class="reg" id="regForm" novalidate>
        <h4>${full ? "Piesakies gaidsarakstam" : "Piesakies pasākumam"}</h4>
        <div class="field-row">
          <div class="field">
            <label for="rfName">Vārds</label>
            <input id="rfName" name="name" required autocomplete="given-name" />
            <p class="field-err">Lūdzu, ievadi vārdu.</p>
          </div>
          <div class="field">
            <label for="rfSurname">Uzvārds</label>
            <input id="rfSurname" name="surname" required autocomplete="family-name" />
            <p class="field-err">Lūdzu, ievadi uzvārdu.</p>
          </div>
        </div>
        <div class="field">
          <label for="rfEmail">E-pasts</label>
          <input id="rfEmail" name="email" type="email" required autocomplete="email" placeholder="tavs@epasts.lv" />
          <p class="field-err">Ievadi derīgu e-pasta adresi.</p>
        </div>
        <div class="field">
          <label for="rfPhone">Telefons <span class="opt">(nav obligāts)</span></label>
          <input id="rfPhone" name="phone" type="tel" autocomplete="tel" placeholder="+371 …" />
        </div>
        <p class="newsletter__consent">
          <input type="checkbox" id="rfConsent" required />
          <label for="rfConsent">Piekrītu, ka mani dati tiek apstrādāti pieteikuma nodrošināšanai saskaņā ar <a href="#" data-doc="privatums">privātuma politiku</a>.</label>
        </p>
        <button type="submit" class="btn btn--primary btn--block btn--lg">
          ${full ? "Pieteikties gaidsarakstam" : "Apstiprināt pieteikumu"}
        </button>
        <p class="ticket__note">Pēc pieteikuma uz e-pastu saņemsi apstiprinājumu un QR biļeti.</p>
      </form>`;
    openModal(eventModal);
    bindReg(ev);
  }

  function bindReg(ev){
    const form = $("#regForm");
    form.addEventListener("submit",e=>{
      e.preventDefault();
      let ok = true;
      const req = ["rfName","rfSurname","rfEmail"];
      req.forEach(id=>{
        const inp = $("#"+id), field = inp.closest(".field");
        const bad = !inp.value.trim() || (inp.type==="email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value));
        field.classList.toggle("is-error",bad); if(bad) ok=false;
      });
      if(!$("#rfConsent").checked){ ok=false; toast("Lūdzu, apstiprini piekrišanu."); }
      if(!ok) return;
      showTicket(ev, { name:$("#rfName").value.trim(), surname:$("#rfSurname").value.trim(), email:$("#rfEmail").value.trim() });
    });
  }

  function showTicket(ev, person){
    const d = fmtDate(ev.date);
    const code = "JNS-" + ev.id.split("-")[1] + "-" + Math.random().toString(36).slice(2,7).toUpperCase();
    eventModalBody.innerHTML = `
      <div class="ticket">
        <div class="ticket__badge">${ICONS.check}</div>
        <h3 class="ticket__title">Tu esi pieteicies!</h3>
        <p class="ticket__sub">${person.name}, apstiprinājums un QR biļete nosūtīti uz <b>${person.email}</b>.</p>
        <div class="ticket__card">
          <div class="ticket__qr">${qrSVG(code, 96)}</div>
          <div class="ticket__info">
            <p class="em-date">${d.full} · ${d.time}</p>
            <h4 class="em-title">${ev.title}</h4>
            <p class="em-guest">${ev.guest}</p>
            <p class="ticket__code">${code}</p>
          </div>
        </div>
        <p class="ticket__note">Uzrādi šo QR kodu pie ieejas — to noskenēs un atzīmēs tavu ierašanos.</p>
      </div>`;
    toast("Biļete izveidota — pārbaudi e-pastu!");
  }

  /* Pseudo-QR (vizuāls demo; ražošanā ģenerē īstu QR ar bibliotēku) */
  function qrSVG(seed, size){
    const n = 21; // klasiskā QR režģa izjūta
    let h = 0; for(let i=0;i<seed.length;i++){ h = (h*31 + seed.charCodeAt(i)) >>> 0; }
    const rnd = () => { h = (h*1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
    const cell = size/n;
    let rects = "";
    const finder = (x,y)=>{
      rects += `<rect x="${x*cell}" y="${y*cell}" width="${7*cell}" height="${7*cell}" fill="#181818"/>`;
      rects += `<rect x="${(x+1)*cell}" y="${(y+1)*cell}" width="${5*cell}" height="${5*cell}" fill="#fff"/>`;
      rects += `<rect x="${(x+2)*cell}" y="${(y+2)*cell}" width="${3*cell}" height="${3*cell}" fill="#181818"/>`;
    };
    const inFinder = (x,y)=> (x<8&&y<8)||(x>n-9&&y<8)||(x<8&&y>n-9);
    for(let y=0;y<n;y++) for(let x=0;x<n;x++){
      if(inFinder(x,y)) continue;
      if(rnd()>0.5) rects += `<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}" fill="#181818"/>`;
    }
    finder(0,0); finder(n-7,0); finder(0,n-7);
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR biļete"><rect width="${size}" height="${size}" fill="#fff"/>${rects}</svg>`;
  }

  /* ============================================================
     SHOP + CART
     ============================================================ */
  const grid = $("#productGrid");
  const chipsWrap = $("#shopChips");
  const shopCount = $("#shopCount");
  let activeCat = "visi";

  function renderChips(){
    chipsWrap.innerHTML = CATS.map(([k,l])=>`<button class="chip ${k==="visi"?"is-active":""}" data-cat="${k}">${l}</button>`).join("");
    $$(".chip",chipsWrap).forEach(c=>c.addEventListener("click",()=>{
      $$(".chip",chipsWrap).forEach(x=>x.classList.remove("is-active"));
      c.classList.add("is-active"); activeCat=c.dataset.cat; renderProducts();
    }));
  }
  function renderProducts(){
    const list = PRODUCTS.filter(p=>activeCat==="visi"||p.cat===activeCat);
    shopCount.textContent = list.length + (list.length===1?" produkts":" produkti");
    grid.innerHTML = list.map(p=>`
      <article class="product reveal" data-id="${p.id}">
        <div class="product__media" style="background:${p.color}">
          ${p.tag?`<span class="product__tag">${p.tag}</span>`:""}
          <img src="${LOGO}" alt="${p.name}" loading="lazy"/>
        </div>
        <div class="product__body">
          <h3 class="product__name">${p.name}</h3>
          <p class="product__desc">${p.desc}</p>
          <div class="product__row">
            <span class="product__price">${p.oldPrice?`<s>${money(p.oldPrice)}</s>`:""}${money(p.price)}</span>
            <button class="btn btn--primary btn--sm" data-add="${p.id}">Pievienot</button>
          </div>
        </div>
      </article>`).join("");
    $$("[data-add]",grid).forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();addToCart(b.dataset.add);}));
    revealScan();
  }

  /* Cart */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("jns_cart")||"[]"); } catch(_){}
  const cartCount = $("#cartCount");
  const cartBody = $("#cartBody");
  const cartTotal = $("#cartTotal");
  const cartDrawer = $("#cartDrawer");

  function saveCart(){ try{localStorage.setItem("jns_cart",JSON.stringify(cart));}catch(_){} }
  function cartQty(){ return cart.reduce((s,i)=>s+i.qty,0); }
  function cartSum(){ return cart.reduce((s,i)=>s+i.price*i.qty,0); }

  function addToCart(id, size){
    const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
    const sz = size || p.sizes[0];
    const key = id+"|"+sz;
    const found = cart.find(i=>i.key===key);
    if(found) found.qty++; else cart.push({key,id,name:p.name,price:p.price,color:p.color,size:sz,qty:1});
    saveCart(); syncCart(); toast(p.name+" pievienots grozam");
  }
  function changeQty(key,delta){
    const it = cart.find(i=>i.key===key); if(!it) return;
    it.qty += delta; if(it.qty<=0) cart = cart.filter(i=>i.key!==key);
    saveCart(); syncCart(); renderCart();
  }
  function removeItem(key){ cart = cart.filter(i=>i.key!==key); saveCart(); syncCart(); renderCart(); }

  function syncCart(){
    const q = cartQty();
    cartCount.textContent = q;
    cartCount.classList.toggle("is-visible",q>0);
    cartTotal.textContent = money(cartSum());
    $("#checkoutBtn").disabled = q===0;
  }
  function renderCart(){
    if(!cart.length){ cartBody.innerHTML = `<p class="cart-empty">Grozs ir tukšs.<br/>Aizej uz veikalu un izvēlies ko foršu.</p>`; return; }
    cartBody.innerHTML = cart.map(i=>`
      <div class="cart-item">
        <div class="cart-item__media" style="background:${i.color}"><img src="${LOGO}" alt=""/></div>
        <div>
          <div class="cart-item__name">${i.name}</div>
          <div class="cart-item__opt">Izmērs: ${i.size}</div>
          <div class="cart-item__qty">
            <button class="qtybtn" data-dec="${i.key}" aria-label="Samazināt">−</button>
            <span>${i.qty}</span>
            <button class="qtybtn" data-inc="${i.key}" aria-label="Palielināt">+</button>
          </div>
        </div>
        <div>
          <div class="cart-item__price">${money(i.price*i.qty)}</div>
          <a class="cart-item__rm" data-rm="${i.key}">Noņemt</a>
        </div>
      </div>`).join("");
    $$("[data-inc]",cartBody).forEach(b=>b.addEventListener("click",()=>changeQty(b.dataset.inc,1)));
    $$("[data-dec]",cartBody).forEach(b=>b.addEventListener("click",()=>changeQty(b.dataset.dec,-1)));
    $$("[data-rm]",cartBody).forEach(b=>b.addEventListener("click",()=>removeItem(b.dataset.rm)));
  }

  $("#cartOpen").addEventListener("click",()=>{ renderCart(); openModal(cartDrawer); });
  $("#checkoutBtn").addEventListener("click",()=>{
    toast("Šeit sāksies Stripe apmaksa (savieno izstrādes laikā).");
  });

  /* ============================================================
     MODALS (generic open/close)
     ============================================================ */
  let lastFocus = null;
  function openModal(el){
    lastFocus = document.activeElement;
    el.classList.add("is-open"); el.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
    const f = el.querySelector("input,button,a,[tabindex]"); if(f) setTimeout(()=>f.focus(),60);
  }
  function closeModal(el){
    el.classList.remove("is-open"); el.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
    if(lastFocus) lastFocus.focus();
  }
  document.addEventListener("click",e=>{
    if(e.target.matches("[data-close]") || e.target.closest("[data-close]")){
      const m = e.target.closest(".modal,.drawer"); if(m) closeModal(m);
    }
  });
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){ $$(".modal.is-open,.drawer.is-open").forEach(closeModal); }
  });

  /* ============================================================
     LEGAL DOC PLACEHOLDERS
     ============================================================ */
  const DOCS = {
    privatums:{ title:"Privātuma politika", body:`
      <p>Šeit būs pilna privātuma politika. Tā apraksta, kādus datus vācam, kāpēc un uz cik ilgu laiku.</p>
      <ul>
        <li>Kādus datus vācam: vārds, uzvārds, e-pasts, telefons (ja norādi), dalība pasākumos.</li>
        <li>Apstrādes pamats: tava piekrišana un pieteikuma izpilde.</li>
        <li>Tavas tiesības: piekļūt datiem, labot, dzēst un atsaukt piekrišanu.</li>
        <li>Kontakts jautājumiem par datiem: janusanak@janusanak.lv</li>
      </ul>
      <p>Reālo tekstu sagatavosim kopā ar juristu pirms publiskošanas.</p>` },
    noteikumi:{ title:"Lietošanas noteikumi", body:`
      <p>Vietnes un pakalpojumu lietošanas noteikumi — pasākumu pieteikumi, biļetes un veikala pirkumi.</p>
      <ul><li>Pieteikšanās kārtība un biļešu izmantošana.</li><li>Pircēja un pārdevēja pienākumi.</li><li>Strīdu risināšana.</li></ul>` },
    sikdatnes:{ title:"Sīkdatņu politika", body:`
      <p>Izmantojam nepieciešamās sīkdatnes lapas darbībai un — ar tavu piekrišanu — analītikas sīkdatnes.</p>
      <ul><li>Nepieciešamās: grozs, sesija, valoda.</li><li>Analītika: tikai pēc piekrišanas.</li></ul>` },
    piegade:{ title:"Piegāde", body:`
      <p>Preces piegādājam Latvijā ar Omniva un DPD pakomātiem 2–4 darba dienās.</p>
      <ul><li>Piegāde no €2,49.</li><li>Bezmaksas piegāde pirkumiem virs noteiktas summas.</li></ul>` },
    atteikums:{ title:"Atteikuma tiesības", body:`
      <p>Kā patērētājs vari izmantot 14 dienu atteikuma tiesības un atgriezt nevalkātu preci bez iemesla.</p>
      <ul><li>Termiņš: 14 dienas no preces saņemšanas.</li><li>Prece: nevalkāta, ar birkām.</li><li>Naudu atgriežam 14 dienu laikā.</li></ul>
      <p>Atteikuma tiesības neattiecas uz bezmaksas pasākumu pieteikumiem.</p>` },
  };
  const docModal = $("#docModal"), docBody = $("#docBody");
  document.addEventListener("click",e=>{
    const t = e.target.closest("[data-doc]"); if(!t) return;
    e.preventDefault();
    const d = DOCS[t.dataset.doc]; if(!d) return;
    docBody.innerHTML = `<div class="doc"><span class="doc-tag">Paraugs · sagatavojams</span><h3>${d.title}</h3>${d.body}</div>`;
    openModal(docModal);
  });

  /* ============================================================
     NEWSLETTER + COOKIES
     ============================================================ */
  $("#newsletterForm").addEventListener("submit",e=>{
    e.preventDefault();
    const em = $("#nlEmail");
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value)){ toast("Ievadi derīgu e-pastu."); return; }
    if(!$("#nlConsent").checked){ toast("Lūdzu, apstiprini piekrišanu."); return; }
    $("#nlOk").hidden = false; em.value="";
  });

  const cookie = $("#cookieBanner");
  if(!localStorage.getItem("jns_cookie")){ setTimeout(()=>cookie.hidden=false,1200); }
  function setCookie(v){ try{localStorage.setItem("jns_cookie",v);}catch(_){} cookie.hidden=true; }
  $("#cookieAccept").addEventListener("click",()=>{setCookie("all");toast("Paldies! Sīkdatnes iespējotas.");});
  $("#cookieDecline").addEventListener("click",()=>setCookie("essential"));

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  let io;
  function revealScan(){
    if(!("IntersectionObserver" in window)){ $$(".reveal").forEach(el=>el.classList.add("is-in")); return; }
    if(!io){
      io = new IntersectionObserver((ents)=>{
        ents.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("is-in"); io.unobserve(en.target); } });
      },{rootMargin:"0px 0px -8% 0px",threshold:.08});
    }
    $$(".reveal:not(.is-in)").forEach(el=>io.observe(el));
  }

  /* ============================================================
     KINETIC TICKER BAND
     ============================================================ */
  function buildTicker(){
    const track = $("#tickerTrack"); if(!track) return;
    const phrases = ["A ja nu sanāk?","Sanāks!","Otrdienu vakaros","Bezmaksas ieeja","Rīga","Aug kopā"];
    const half = phrases.map((p,i)=>`<span class="txt${i%2?' alt':''}">${p}</span><span class="dot"></span>`).join("");
    track.innerHTML = half + half; // dublēts nepārtrauktai cilpai
  }

  /* ============================================================
     PHOTO SHOW (kustīgas foto rindas)
     ============================================================ */
  function buildPhotoShow(){
    const a = $("#showRowA"), b = $("#showRowB"); if(!a||!b) return;
    const base = "assets/img/";
    const setA = ["event-wide-1.jpg","g1.jpg","event-3.jpg","g5.jpg","event-2.jpg","g2.jpg","event-4.jpg"];
    const setB = ["event-1.jpg","g3.jpg","event-wide-2.jpg","g6.jpg","event-5.jpg","g4.jpg","event-3.jpg"];
    const row = arr => arr.map(f=>`<figure><img src="${base}${f}" alt="Momentuzņēmums no pasākuma" loading="lazy"/></figure>`).join("");
    a.innerHTML = row(setA) + row(setA);
    b.innerHTML = row(setB) + row(setB);
  }

  /* ============================================================
     COUNTERS
     ============================================================ */
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function animateCount(el){
    const target = +el.dataset.count, suffix = el.dataset.suffix||"";
    if(reduce){ el.textContent = target+suffix; return; }
    const dur = 1400, t0 = performance.now();
    (function step(now){
      const p = Math.min(1,(now-t0)/dur);
      const eased = 1-Math.pow(1-p,3);
      el.textContent = Math.round(target*eased)+suffix;
      if(p<1) requestAnimationFrame(step);
    })(t0);
  }

  /* ============================================================
     REVEAL TARGETS (info world only — veikals paliek kā ir)
     ============================================================ */
  $$(".world--info .mission__text, .world--info .join__inner").forEach(el=>el.classList.add("reveal"));
  $$(".world--info .section > .section__head").forEach((el,i)=>el.classList.add("reveal", i%2?"reveal--right":"reveal--left"));
  $$(".values__grid, .team__grid, .speakers__list").forEach(el=>el.classList.add("reveal","stagger"));
  // counters fire when hero stats scroll-reveal (hero is above fold → observe directly)
  const statsUl = $(".hero__stats");
  if(statsUl){
    if(("IntersectionObserver" in window)){
      const co = new IntersectionObserver((ents)=>{ents.forEach(e=>{ if(e.isIntersecting){ $$("[data-count]",statsUl).forEach(animateCount); co.disconnect(); }});},{threshold:.4});
      co.observe(statsUl);
    } else { $$("[data-count]",statsUl).forEach(animateCount); }
  }

  /* ============================================================
     INIT
     ============================================================ */
  renderMonths();
  renderEvents();
  renderChips();
  renderProducts();
  syncCart();
  buildTicker();
  buildPhotoShow();
  revealScan();
  document.body.classList.add("ready");
})();
