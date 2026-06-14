# Google Search Console nustatymas — LED BALDAI

Žingsnis po žingsnio instrukcija, kaip įtraukti `ledbaldai.lt` į Google
ir pradėti indeksavimą. Reikės: Google paskyros ir prieigos prie domeno
DNS (Interneto Vizija valdymo skydelis).

---

## 1. Atidarykite Google Search Console

1. Eikite į **https://search.google.com/search-console**
2. Prisijunkite su savo Google paskyra (ta pačia, kurią naudosite verslui).

---

## 2. Pridėkite svetainę (Property)

1. Viršuje kairėje spauskite **„Add property"** (Pridėti nuosavybę).
2. Pasirodys du variantai: **Domain** ir **URL prefix**.
3. Pasirinkite **Domain** (rekomenduojama) — ji apima visus variantus:
   `http`, `https`, `www` ir be `www`.
4. Įveskite: `ledbaldai.lt` (be `https://`, be `www`).
5. Spauskite **Continue**.

---

## 3. Patvirtinkite per DNS TXT įrašą

1. Google parodys **TXT įrašą**, pvz.:
   `google-site-verification=AbC123xyz...`
   **Nukopijuokite** šią reikšmę.
2. Atskirame skirtuke atidarykite **Interneto Vizija** valdymo skydelį:
   **https://www.iv.lt** → prisijunkite → **Mano paslaugos** →
   suraskite domeną `ledbaldai.lt` → **DNS zonos redagavimas**
   (arba „DNS įrašai" / „DNS zona").
3. Pridėkite naują įrašą:
   - **Tipas (Type):** `TXT`
   - **Pavadinimas / Host:** `@` (arba palikite tuščią — reiškia šakninį domeną)
   - **Reikšmė / Value:** įklijuokite `google-site-verification=...`
   - **TTL:** palikite numatytą (pvz. 3600)
4. **Išsaugokite** įrašą.
5. Grįžkite į Search Console ir spauskite **Verify**.

> DNS pakeitimai gali įsigalioti per kelias minutes, kartais iki 24 val.
> Jei iš karto neveikia — palaukite ~30 min. ir bandykite „Verify" dar kartą.

---

## 4. Pateikite sitemap

1. Patvirtinus, kairiame meniu spauskite **Sitemaps**.
2. Laukelyje „Add a new sitemap" įveskite: `sitemap.xml`
   (pilnas adresas: `https://ledbaldai.lt/sitemap.xml`)
3. Spauskite **Submit**.
4. Po kelių minučių statusas turi tapti **Success**.

---

## 5. Paprašykite indeksavimo

1. Viršuje esančioje paieškos juostoje („Inspect any URL") įveskite:
   `https://ledbaldai.lt/`
2. Palaukite, kol Google patikrins URL.
3. Spauskite **Request indexing** (Prašyti indeksuoti).
4. Tai paspartina pirmąjį svetainės aplankymą.

---

## 6. Ką patikrinti po pateikimo

- **Pages** (Puslapiai): po kelių dienų pagrindinis puslapis turi būti
  „Indexed".
- **Sitemaps:** statusas „Success", aptikta 1 nuoroda.
- **Enhancements / Rich results:** struktūriniai duomenys
  (`HomeAndConstructionBusiness`) be klaidų.
- **Performance:** po 1–2 savaičių pradės rodytis paieškos užklausos
  (pvz. „baldų surinkimas Klaipėdoje").

---

## Papildomai (rekomenduojama)

- Pasitikrinkite struktūrinius duomenis: **https://search.google.com/test/rich-results**
  → įveskite `https://ledbaldai.lt/`.
- Sukurkite **Google Business Profile** (žr. `SEO_DEPLOYMENT_CHECKLIST.md`) —
  tai svarbiausia vietinei paieškai Klaipėdoje.
