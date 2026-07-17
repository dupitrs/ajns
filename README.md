# A ja nu sanāk? — mājaslapa

Jaunā `janusanak.lv` mājaslapa: landing + pasākumu kalendārs + pieteikšanās ar QR biļetēm, e-veikals un admin panelis.

Šobrīd šis ir **frontend prototips** (statisks HTML/CSS/JS ar demonstrācijas datiem). Reālo backendu (datubāze, e-pasti, maksājumi) pieslēdz izstrādes laikā — sk. `PLAN.md`.

## Kā apskatīt

Atver `index.html` pārlūkā vai palaid lokālu serveri mapē:

```bash
python3 -m http.server 8000
# → http://localhost:8000/index.html   (publiskā lapa)
# → http://localhost:8000/admin.html   (admin panelis)
```

## Struktūra

```
index.html          Publiskā lapa — divas pasaules ar “Info / Veikals” pārslēgu
admin.html          Admin paneļa makets (pārskats, pasākumi, dalībnieki, QR skeneris, veikals)
css/styles.css      Publiskās lapas stili
css/admin.css       Admin stili
js/app.js           Publiskā lapa: pārslēgs, kalendārs, pieteikšanās+QR, grozs
js/admin.js         Admin: tabulas, filtri, CSV eksports, QR demo
assets/img/         Logo un pasākumu foto
juridiskie/         Juridisko dokumentu MELNRAKSTI (latviski) — pirms publicēšanas pie jurista
PLAN.md             Pilns plāns: struktūra, servisi, datubāze, juridiskais, ceļakarte
```

## Zīmols

- Akcents: `#ED4C4C` · tinte `#181818` · gaišs `#F6F5F2` · tumšs `#161616`
- Fonti: Space Grotesk (virsraksti), Inter (teksts), Playfair Display (serif akcenti)
- Uzruna: “Tu”. Esošās lapas saturs atstāts negrozīts; jaunais rakstīts dabiskā latviešu valodā.

## Nākamie soļi (sk. `PLAN.md`)

Steks: **Next.js + Supabase (PostgreSQL) + Stripe/Klix + Resend**. Vispirms MVP: reālā DB, reģistrācija, QR ģenerēšana un e-pasti, pēc tam e-veikals un admin.
