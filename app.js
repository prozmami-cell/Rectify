"use strict";

/* ---------- Sabitler ---------- */
const KATEGORILER = ["Merkez Kasa Girişi", "Yakıt", "Yemek/Gıda", "Hırdavat/Malzeme", "Nakliye", "Personel Avansı", "Araç Bakım", "Diğer"];
const EVRAK_TIPLERI = ["Fiş", "Fatura", "Tutanak", "Diğer"];
const AYLAR = ["OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN", "TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK"];
const AYLAR_K = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const AYLAR_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const ODEME_AD = { kart: "Kart", nakit: "Nakit", gelen: "Gelen" };
const KAT_STIL = {
  "Yemek/Gıda": { bg: "#FFF1E2", fg: "#8A4B00", renk: "#E8862A", ikon: '<path d="M7 3v8a2 2 0 0 0 2 2v8"/><path d="M11 3v8a2 2 0 0 1-2 2"/><path d="M17 21V3c-2 1-3 4-3 8h3"/>' },
  "Hırdavat/Malzeme": { bg: "#E6F0FF", fg: "#0A4FC4", renk: "#0A66FF", ikon: '<path d="M14.7 6.3a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/><path d="M14.7 6.3 17 4l3 3-2.3 2.3"/>' },
  "Yakıt": { bg: "#E3F8FD", fg: "#00667F", renk: "#00B8E6", ikon: '<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M3 21h12M4 10h10"/><path d="M14 8h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3"/>' },
  "Nakliye": { bg: "#F0EBFF", fg: "#5B3CC4", renk: "#7C5CE0", ikon: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>' },
  "Araç Bakım": { bg: "#EAEFF5", fg: "#334155", renk: "#64748B", ikon: '<path d="M5 17h14v-5l-2-5H7l-2 5z"/><path d="M5 12h14"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/>' },
  "Merkez Kasa Girişi": { bg: "#E3F5EA", fg: "#17663A", renk: "#2E9E5B", ikon: '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>' },
  "Personel Avansı": { bg: "#FDEBF3", fg: "#9D174D", renk: "#DB2777", ikon: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>' },
  "Diğer": { bg: "#EEF1F6", fg: "#475069", renk: "#94A3B8", ikon: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>' },
};
const svg = (ic) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg>`;
const IKON = {
  sol: svg('<path d="m15 18-6-6 6-6"/>'),
  sag: svg('<path d="m9 18 6-6-6-6"/>'),
  galeri: svg('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
  excel: svg('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="m9 13 6 5M15 13l-6 5"/>'),
  arti: svg('<path d="M12 5v14M5 12h14"/>'),
  indir: svg('<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>'),
  yukle: svg('<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>'),
  ara: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  tik: svg('<path d="m5 12 5 5 9-10"/>'),
  kalem: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
};

/* ---------- Yardımcılar ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const para = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tamSayi = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const tl = (n) => para.format(Number(n) || 0) + " ₺";
const trUpper = (s) => (s || "").toLocaleUpperCase("tr-TR");
const sayi = (v) => Number(v) || 0;
const tutarOf = (k) => sayi(k.gelen) || sayi(k.nakit) || sayi(k.kart);
const odemeOf = (k) => (sayi(k.gelen) ? "gelen" : sayi(k.nakit) ? "nakit" : "kart");
const ayKey = (t) => (t || "").slice(0, 7);
const ayAdi = (key) => { const [y, m] = key.split("-"); return AYLAR_K[Number(m) - 1] + " " + y; };
const sayfaAdi = (key) => { const [y, m] = key.split("-"); return AYLAR[Number(m) - 1] + " " + y; };
const tarihTR = (t) => (t ? t.split("-").reverse().join(".") : "");
const kisaTarih = (t) => { const [, m, d] = t.split("-"); return Number(d) + " " + AYLAR_KISA[Number(m) - 1]; };
const bugun = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const dosyaAdi = (s) => s.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim();
const kimlik = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
const masaustu = () => matchMedia("(min-width: 900px)").matches;

function parseTutar(v) {
  if (typeof v === "number") return isFinite(v) ? v : NaN;
  let s = String(v || "").replace(/\s|₺|TL/gi, "");
  if (!s) return NaN;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  return Number(s);
}
function toast(msg, sure = 3200) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.z); toast.z = setTimeout(() => { t.hidden = true; }, sure);
}
function banner(msg) { $("#banner").textContent = msg || ""; $("#banner").hidden = !msg; }

/* ---------- Cihazdaki veritabanı (IndexedDB) ---------- */
const VT = {
  db: null,
  ac() {
    return new Promise((res, rej) => {
      const r = indexedDB.open("recify", 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        d.createObjectStore("kayitlar", { keyPath: "id" });
        d.createObjectStore("fotolar");
        d.createObjectStore("ayarlar");
      };
      r.onsuccess = () => { VT.db = r.result; res(); };
      r.onerror = () => rej(r.error);
    });
  },
  islem(depo, kip, fn) {
    return new Promise((res, rej) => {
      const tx = VT.db.transaction(depo, kip);
      const istek = fn(tx.objectStore(depo));
      let sonuc;
      if (istek) istek.onsuccess = () => { sonuc = istek.result; };
      tx.oncomplete = () => res(sonuc);
      tx.onerror = () => rej(tx.error);
      tx.onabort = () => rej(tx.error);
    });
  },
  hepsi: (depo) => VT.islem(depo, "readonly", (s) => s.getAll()),
  al: (depo, anahtar) => VT.islem(depo, "readonly", (s) => s.get(anahtar)),
  yaz: (depo, deger, anahtar) => VT.islem(depo, "readwrite", (s) => (anahtar === undefined ? s.put(deger) : s.put(deger, anahtar))),
  sil: (depo, anahtar) => VT.islem(depo, "readwrite", (s) => s.delete(anahtar)),
};

/* ---------- Durum ---------- */
const st = {
  hazir: false, kasaAdi: "Şantiye Kasası", kayitlar: [], ay: null, gorunum: "kasa",
  kuyruk: [], filtreKat: "Tümü", ara: "", form: null, fotoUrl: new Map(), kurulumOlayi: null,
};
// Saklanan kayıt -> ekranda kullanılan kayıt
const normal = (v) => ({ id: v.id, tarih: v.tarih, evrak_tipi: v.evrakTipi || "Fiş", evrak_no: v.evrakNo || "", kategori: v.kategori || "Diğer", aciklama: v.aciklama || "", firma: v.firma || "", gelen: v.gelen, nakit: v.nakit, kart: v.kart, foto: v.foto || null, created_at: v.olusturma || "" });
const sirali = (list) => [...list].sort((a, b) => a.tarih.localeCompare(b.tarih) || (a.created_at || "").localeCompare(b.created_at || ""));
function aylarListesi() {
  const s = new Set(st.kayitlar.map((k) => ayKey(k.tarih)));
  s.add(ayKey(bugun()));
  return [...s].sort();
}
const ayKayitlari = (key) => sirali(st.kayitlar.filter((k) => ayKey(k.tarih) === key));
function toplamlar(list) {
  const t = { kart: 0, nakit: 0, gelen: 0 };
  list.forEach((k) => { t.kart += sayi(k.kart); t.nakit += sayi(k.nakit); t.gelen += sayi(k.gelen); });
  t.harcama = t.kart + t.nakit;
  return t;
}
async function fotoUrl(id) {
  if (!id) return null;
  if (st.fotoUrl.has(id)) return st.fotoUrl.get(id);
  const blob = await VT.al("fotolar", id).catch(() => null);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  st.fotoUrl.set(id, url);
  return url;
}

/* ---------- Başlangıç (dosyanın sonunda çağrılır) ---------- */
async function baslat() {
  EVRAK_TIPLERI.forEach((v) => $("#fEvrakTipi").append(new Option(v, v)));
  KATEGORILER.forEach((v) => $("#fKategori").append(new Option(v, v)));
  olaylariBagla();
  rotayiUygula();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  try {
    await VT.ac();
    const ad = await VT.al("ayarlar", "kasaAdi");
    if (ad) st.kasaAdi = ad;
    $$("[data-kasa-adi]").forEach((e) => { e.textContent = st.kasaAdi; });
    await yukle();
  } catch {
    banner("Bu tarayıcı kayıt saklamaya izin vermiyor. Gizli sekmede değilsen tarayıcıyı güncelleyip tekrar dene.");
    st.hazir = true; ciz();
  }
}

async function yukle() {
  st.kayitlar = (await VT.hepsi("kayitlar")).map(normal).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k.tarih || ""));
  st.hazir = true;
  const aylar = aylarListesi();
  if (!st.ay || !aylar.includes(st.ay)) st.ay = aylar[aylar.length - 1];
  ciz();
}

/* ---------- Yönlendirme ---------- */
// Menülerin ekrandaki sırası; kayma yönü buna göre seçilir
const SIRA_TEL = ["kasa", "raporlar", "fisler", "ayarlar"];
const SIRA_MASA = ["kasa", "fisler", "raporlar", "ayarlar"];
let ilkRota = true;

function rotayiUygula() {
  const onceki = st.gorunum;
  const h = location.hash.replace("#", "");
  st.gorunum = SIRA_TEL.includes(h) ? h : "kasa";
  $$("[data-gorunum]").forEach((a) => {
    if (a.dataset.gorunum === st.gorunum) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  const eski = $("#v-" + onceki), yeni = $("#v-" + st.gorunum);
  const hareket = !ilkRota && onceki !== st.gorunum && yeni.animate && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (hareket) {
    const sira = masaustu() ? SIRA_MASA : SIRA_TEL;
    kaydir(eski, yeni, sira.indexOf(st.gorunum) > sira.indexOf(onceki) ? 1 : -1);
  } else {
    $$(".gorunum").forEach((s) => { s.hidden = s !== yeni; });
    ciz();
    window.scrollTo(0, 0);
  }
  ilkRota = false;
  camKonumla();
}

// Eski ekran bir yana kayarak çıkar, yenisi öbür yandan kayarak girer.
function kaydir(eski, yeni, yon) {
  yeni.getAnimations().forEach((a) => a.cancel());
  yeni.removeAttribute("style");
  // Eski ekranı bulunduğu yerde sabitle (sayfa en üste kaydırılınca zıplamasın)
  const ust = eski.offsetTop - window.scrollY;
  Object.assign(eski.style, { position: "absolute", top: ust + "px", left: eski.offsetLeft + "px", width: eski.offsetWidth + "px", pointerEvents: "none" });
  $$(".gorunum").forEach((s) => { if (s !== eski && s !== yeni) s.hidden = true; });
  yeni.hidden = false;
  ciz();
  window.scrollTo(0, 0);
  const secenek = { duration: 340, easing: "cubic-bezier(.22, .8, .25, 1)" };
  const cikis = eski.animate([
    { transform: "translateX(0)", opacity: 1 },
    { transform: `translateX(${-yon * 32}%)`, opacity: 0 },
  ], { ...secenek, fill: "forwards" });
  cikis.onfinish = () => { eski.hidden = true; eski.removeAttribute("style"); cikis.cancel(); };
  yeni.animate([
    { transform: `translateX(${yon * 32}%)`, opacity: 0 },
    { transform: "translateX(0)", opacity: 1 },
  ], secenek);
}

// Cam kabarcığı etkin menünün altına taşır: alt menüde simgeden biraz büyük, kenar menüde satır boyunda.
function camKonumla() {
  $$(".alt-menu, .yan-menu").forEach((menu) => {
    const cam = menu.querySelector(".cam");
    const etkin = menu.querySelector('[aria-current="page"]');
    if (!cam || !etkin) return;
    const m = menu.getBoundingClientRect();
    const alt = menu.classList.contains("alt-menu");
    // Alt menüde simge ve altındaki menü adı birlikte camın içinde kalır
    let r = etkin.getBoundingClientRect();
    if (alt) { const aralik = document.createRange(); aralik.selectNodeContents(etkin); r = aralik.getBoundingClientRect(); }
    if (!r.width) return;
    const g = alt ? r.width + 20 : r.width;
    const y = alt ? r.height + 10 : r.height;
    cam.style.width = g + "px";
    cam.style.height = y + "px";
    cam.style.transform = `translate(${r.left - m.left + (r.width - g) / 2}px, ${r.top - m.top + (r.height - y) / 2}px)`;
    if (!cam.classList.contains("hazir")) requestAnimationFrame(() => cam.classList.add("hazir"));
  });
}

function ciz() {
  if (!st.ay) st.ay = ayKey(bugun());
  ({ kasa: cizKasa, fisler: cizFisler, raporlar: cizRaporlar, ayarlar: cizAyarlar })[st.gorunum]();
}

/* ---------- Ortak parçalar ---------- */
function aySecici(acik) {
  const aylar = aylarListesi(); const i = aylar.indexOf(st.ay);
  return `<span class="ay-sec ${acik ? "acik" : ""}"><button type="button" data-ay="-1" aria-label="Önceki ay" ${i <= 0 ? "disabled" : ""}>${IKON.sol}</button><span>${ayAdi(st.ay)}</span><button type="button" data-ay="1" aria-label="Sonraki ay" ${i >= aylar.length - 1 ? "disabled" : ""}>${IKON.sag}</button></span>`;
}
function katIkon(kat) {
  const s = KAT_STIL[kat] || KAT_STIL["Diğer"];
  return `<span class="kat-ikon" style="background:${s.bg};color:${s.fg}">${svg(s.ikon)}</span>`;
}
function satirLi(k) {
  return `<li><button type="button" class="satir" data-kayit="${k.id}">${katIkon(k.kategori)}
    <span class="satir-orta"><span class="satir-firma">${esc(k.firma || "—")}</span><span class="satir-acik">${esc(k.aciklama || "Açıklama yok")}</span></span>
    <span class="satir-sag"><span class="satir-tutar sayi">${tl(tutarOf(k))}</span><span class="satir-meta">${kisaTarih(k.tarih)} · ${ODEME_AD[odemeOf(k)]}</span></span></button></li>`;
}
function kuyrukIc() {
  return st.kuyruk.map((o) => {
    const ad = o.sonuc?.firma || (o.durum === "okunuyor" ? "Fiş okunuyor…" : o.durum === "sirada" ? "Sırada bekliyor" : o.durum === "hazir" ? "Fiş okundu" : "Okunamayan fiş");
    const alt = o.durum === "okunuyor" ? `<span class="durum-okunuyor"><span class="donen"></span> Okunuyor</span>`
      : o.durum === "sirada" ? `<span class="durum-okunuyor">Okunmayı bekliyor</span>`
      : o.durum === "hata" ? `<span class="durum-hata">${esc(o.hata)}</span>`
      : `<span class="durum-hazir">${o.sonuc?.tutar ? tl(o.sonuc.tutar) + " · " : ""}Açıklama bekliyor</span>`;
    return `<button type="button" class="kuyruk-oge" data-kuyruk="${o.id}"><img src="${o.url}" alt=""><div><strong>${esc(ad)}</strong>${alt}</div></button>`;
  }).join("");
}
function kuyrukKutusu(sinif) {
  return `<section class="kuyruk ${sinif}" data-kuyruk-kutu ${st.kuyruk.length ? "" : "hidden"}>
    <div class="bolum-bas"><h2>Onay bekliyor</h2><span class="sayac" data-kuyruk-sayac>${st.kuyruk.length} fiş</span></div>
    <div data-kuyruk-liste style="display:flex;flex-direction:column;gap:10px">${kuyrukIc()}</div></section>`;
}
function kuyrukCiz() {
  $$("[data-kuyruk-kutu]").forEach((k) => { k.hidden = !st.kuyruk.length; });
  $$("[data-kuyruk-liste]").forEach((k) => { k.innerHTML = kuyrukIc(); });
  $$("[data-kuyruk-sayac]").forEach((k) => { k.textContent = st.kuyruk.length + " fiş"; });
}
const yukleniyor = () => `<div class="bos"><span class="donen"></span><br>Kasa yükleniyor…</div>`;
const markaSatiri = (ek = "") => `<div class="tel m-ust"><div class="marka"><img src="icons/icon-192.png" alt=""><img src="icons/wordmark.png" alt="Recify" class="marka-yazi"></div>${ek}</div>`;

/* ---------- Kasa görünümü ---------- */
function cizKasa() {
  const el = $("#v-kasa");
  const marka = markaSatiri(`<label for="galeriGirdi" class="ikon-btn" aria-label="Galeriden fiş ekle">${IKON.galeri}</label>`);
  if (!st.hazir) { el.innerHTML = marka + yukleniyor(); return; }
  const rows = ayKayitlari(st.ay);
  const t = toplamlar(rows);
  const tum = toplamlar(st.kayitlar);
  const kalan = tum.gelen - tum.nakit;

  el.innerHTML = `
  ${marka}
  <a href="#ayarlar" class="tel kasa-hap"><span class="nokta"></span><span>${esc(st.kasaAdi)}</span>${IKON.kalem}</a>
  <section class="tel bakiye">
    <div class="bakiye-ust">${aySecici(false)}<span class="rozet">${rows.length} fiş</span></div>
    <div class="bakiye-tutar sayi">${para.format(t.harcama)} <small>₺</small></div>
    <div class="mini sayi">
      <div><span>Kredi kartı</span><strong>${tl(t.kart)}</strong></div>
      <div><span>Nakit çıkış</span><strong>${tl(t.nakit)}</strong></div>
      <div><span>Kasada kalan</span><strong>${tl(kalan)}</strong></div>
    </div>
  </section>
  <div class="tel hizli">
    <button type="button" data-eylem="excel"><span class="hizli-ikon" style="background:#E6F0FF;color:#0A66FF">${IKON.excel}</span>Excel indir</button>
    <label for="galeriGirdi"><span class="hizli-ikon" style="background:#E3F8FD;color:#00799A">${IKON.galeri}</span>Galeriden</label>
    <button type="button" data-eylem="elle"><span class="hizli-ikon" style="background:#EDEFFA;color:#0A2A7A">${IKON.arti}</span>Elle ekle</button>
  </div>
  ${kuyrukKutusu("tel")}
  <div class="tel bolum-bas"><h2>Son fişler</h2><a href="#fisler">Tümünü gör</a></div>
  ${rows.length ? `<ul class="tel liste">${[...rows].reverse().slice(0, 6).map(satirLi).join("")}</ul>`
    : `<div class="tel bos"><strong>${ayAdi(st.ay)} için kayıt yok</strong>Alttaki tarama düğmesiyle fişin fotoğrafını çek; tarih, firma, fiş no ve tutar otomatik dolar.</div>`}

  <header class="masa ust-bar">
    <div class="baslik-grup"><span>${esc(st.kasaAdi)}</span><h1>${aySecici(true)}</h1></div>
    <label class="ara">${IKON.ara}<input id="masaAra" aria-label="Fişlerde ara" placeholder="Firma, açıklama, fiş no…" value="${esc(st.ara)}"></label>
    <button type="button" class="btn" data-eylem="excel">${IKON.indir}Excel indir</button>
    <button type="button" class="btn" data-eylem="elle">${IKON.arti}Elle ekle</button>
    <label for="galeriGirdi" class="btn birincil">${IKON.yukle}Fiş yükle</label>
  </header>
  <section class="masa kpi-satir sayi">
    <div class="kpi gradyan"><span>Toplam harcama</span><strong>${tl(t.harcama)}</strong><small>${rows.length} fiş · ${ayAdi(st.ay)}</small></div>
    <div class="kpi"><span>Kredi kartı</span><strong>${tl(t.kart)}</strong><small>${t.harcama ? "%" + tamSayi.format((t.kart / t.harcama) * 100) + " harcamanın" : "Bu ay kart harcaması yok"}</small></div>
    <div class="kpi"><span>Nakit çıkış</span><strong>${tl(t.nakit)}</strong><small>${t.nakit ? "Kasadan ödenen" : "Bu ay nakit harcama yok"}</small></div>
    <div class="kpi"><span>Kasada kalan nakit</span><strong>${tl(kalan)}</strong><small>Merkezden gelen: ${tl(tum.gelen)}</small></div>
  </section>
  <div class="masa masa-izgara">
    <section class="panel">
      <div class="panel-bas"><h2>Kasa hareketleri</h2><div class="cipler">${katCipleri(rows)}</div></div>
      <div class="tablo-kutu"><table id="masaTablo">
        <thead><tr><th>SIRA</th><th>TARİH</th><th>FİRMA / AÇIKLAMA</th><th>EVRAK</th><th>KATEGORİ</th><th>TUTAR</th></tr></thead>
        <tbody>${tabloGovde(rows)}</tbody></table></div>
    </section>
    <aside>
      <label for="galeriGirdi" class="birak-alan"><span class="ikon">${IKON.yukle}</span><strong>Fiş fotoğraflarını sürükleyin</strong><p>Ya da tıklayıp seçin. WhatsApp'tan indirdiğiniz fişleri toplu bırakabilirsiniz, her biri sırayla okunur.</p></label>
      ${kuyrukKutusu("")}
    </aside>
  </div>`;
}
function katCipleri(rows) {
  const kats = ["Tümü", ...KATEGORILER.filter((k) => rows.some((r) => r.kategori === k))];
  if (!kats.includes(st.filtreKat)) st.filtreKat = "Tümü";
  return kats.map((k) => `<button type="button" class="cip" data-kat="${esc(k)}" aria-pressed="${k === st.filtreKat}">${esc(k)}</button>`).join("");
}
function aramaUyar(k) {
  const q = st.ara.trim().toLocaleLowerCase("tr-TR");
  if (!q) return true;
  return [k.firma, k.aciklama, k.evrak_no, k.kategori, tarihTR(k.tarih)].join(" ").toLocaleLowerCase("tr-TR").includes(q);
}
function tabloGovde(rows) {
  const satirlar = rows.map((k, i) => [k, i + 1]).filter(([k]) => (st.filtreKat === "Tümü" || k.kategori === st.filtreKat) && aramaUyar(k)).reverse();
  if (!satirlar.length) return `<tr><td colspan="6" style="text-align:center;color:var(--soluk);padding:28px">${rows.length ? "Aramaya uyan kayıt yok." : "Bu ay için kayıt yok. Sağdaki alana fiş fotoğraflarını bırakın."}</td></tr>`;
  return satirlar.map(([k, sira]) => {
    const s = KAT_STIL[k.kategori] || KAT_STIL["Diğer"];
    return `<tr data-kayit="${k.id}" tabindex="0"><td class="sayi" style="color:var(--soluk);font-weight:700">${sira}</td><td class="sayi" style="font-weight:700;white-space:nowrap">${tarihTR(k.tarih)}</td>
      <td><div class="t-firma">${esc(k.firma)}</div><div class="t-acik">${esc(k.aciklama)}</div></td>
      <td style="font-weight:700;white-space:nowrap">${esc(k.evrak_tipi)}${k.evrak_no ? " " + esc(k.evrak_no) : ""}</td>
      <td><span class="kat-cip" style="background:${s.bg};color:${s.fg}">${esc(k.kategori)}</span></td>
      <td><div class="t-tutar sayi">${tl(tutarOf(k))}</div><div class="t-acik">${ODEME_AD[odemeOf(k)]}</div></td></tr>`;
  }).join("");
}

/* ---------- Fişler görünümü ---------- */
function cizFisler() {
  const el = $("#v-fisler");
  el.classList.add("dar");
  if (!st.hazir) { el.innerHTML = yukleniyor(); return; }
  el.innerHTML = `
    <div class="ust-bar"><div class="baslik-grup"><span>${esc(st.kasaAdi)}</span><h1 class="baslik" style="font-size:24px">Fişler</h1></div>
      <span class="sayac" style="background:var(--mavi-acik);color:var(--mavi-koyu)">${st.kayitlar.length} kayıt</span></div>
    <label class="ara">${IKON.ara}<input id="fisAra" aria-label="Fişlerde ara" placeholder="Firma, açıklama, fiş no, tarih…" value="${esc(st.ara)}"></label>
    <div class="cipler">${katCipleri(st.kayitlar)}</div>
    ${kuyrukKutusu("")}
    <div id="fisListe" style="display:flex;flex-direction:column;gap:10px">${fisListesi()}</div>`;
}
function fisListesi() {
  const list = sirali(st.kayitlar).reverse().filter((k) => (st.filtreKat === "Tümü" || k.kategori === st.filtreKat) && aramaUyar(k));
  if (!st.kayitlar.length) return `<div class="bos"><strong>Henüz fiş yok</strong>Tarama düğmesiyle ilk fişini ekle.</div>`;
  if (!list.length) return `<div class="bos">Aramaya uyan kayıt yok.</div>`;
  const gunler = new Map();
  list.forEach((k) => { if (!gunler.has(k.tarih)) gunler.set(k.tarih, []); gunler.get(k.tarih).push(k); });
  return [...gunler].map(([g, ks]) => `<div class="gun-bas">${tarihTR(g)} · ${tl(ks.reduce((s, k) => s + tutarOf(k), 0))}</div><ul class="liste">${ks.map(satirLi).join("")}</ul>`).join("");
}

/* ---------- Raporlar ---------- */
function cizRaporlar() {
  const el = $("#v-raporlar");
  if (!st.hazir) { el.innerHTML = yukleniyor(); return; }
  const rows = ayKayitlari(st.ay);
  const t = toplamlar(rows);
  const gunler = new Map();
  rows.forEach((k) => { const h = sayi(k.kart) + sayi(k.nakit); if (h) gunler.set(k.tarih, (gunler.get(k.tarih) || 0) + h); });
  const enCok = Math.max(0, ...gunler.values());
  const kats = KATEGORILER.map((k) => [k, rows.filter((r) => r.kategori === k).reduce((s, r) => s + sayi(r.kart) + sayi(r.nakit), 0)]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const yuzde = (v) => (t.harcama ? "%" + (v / t.harcama * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1, minimumFractionDigits: 1 }) : "");
  const fotoSayisi = rows.filter((k) => k.foto).length;

  el.innerHTML = `
    <div class="ust-bar"><div class="baslik-grup"><span class="masa">${esc(st.kasaAdi)}</span><h1 class="baslik" style="font-size:24px">Raporlar</h1></div>${aySecici(true)}</div>
    <div class="rapor-izgara">
      <section class="kart">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px">
          <div style="display:flex;flex-direction:column;gap:4px"><span class="not">Toplam harcama</span><span class="baslik sayi" style="font-size:28px">${tl(t.harcama)}</span></div>
          <span class="not" style="text-align:right">${rows.length} fiş<br>${gunler.size} gün</span>
        </div>
        ${gunler.size ? `<div class="cubuklar" aria-label="Günlük harcama">${[...gunler].map(([, v]) => `<div class="cubuk ${v === enCok ? "en" : ""}"><b class="sayi">${tamSayi.format(v)}</b><i style="height:${Math.max(3, Math.round(v / enCok * 110))}px"></i></div>`).join("")}</div>
        <div class="cubuk-gun">${[...gunler.keys()].map((g) => `<span>${kisaTarih(g)}</span>`).join("")}</div>` : `<div class="bos">Bu ay harcama yok.</div>`}
      </section>
      <section class="kart">
        <h2>Kategoriye göre</h2>
        ${kats.length ? `<div class="serit" aria-hidden="true">${kats.map(([k, v]) => `<div style="width:${(v / t.harcama * 100).toFixed(2)}%;background:${(KAT_STIL[k] || KAT_STIL["Diğer"]).renk}"></div>`).join("")}</div>
        <div style="display:flex;flex-direction:column;gap:10px">${kats.map(([k, v]) => `<div class="kat-satir"><span class="renk" style="background:${(KAT_STIL[k] || KAT_STIL["Diğer"]).renk}"></span><span class="ad">${esc(k)}</span><span class="yuzde sayi">${yuzde(v)}</span><span class="deger sayi">${tl(v)}</span></div>`).join("")}</div>
        <div class="kat-satir" style="border-top:1px solid var(--cizgi-2);padding-top:10px"><span class="ad">Kredi kartı / Nakit</span><span class="deger sayi" style="min-width:0">${tl(t.kart)} / ${tl(t.nakit)}</span></div>` : `<p class="not">Bu ay kategorilere dağılacak harcama yok.</p>`}
      </section>
      <section class="kart" style="gap:10px">
        <h2>Şirkete gönder</h2>
        <button type="button" class="disa koyu" data-eylem="excel"><span class="ikon" style="background:rgba(0,198,242,.18);color:#5FDDFB">${IKON.excel}</span><span class="metin"><b>Excel kasa dosyası</b><small>${esc(dosyaAdi(trUpper(st.kasaAdi)))}.xlsx · tüm aylar</small></span>${IKON.indir}</button>
        <button type="button" class="disa" data-eylem="zip"><span class="ikon" style="background:#E3F8FD;color:#00708F">${IKON.galeri}</span><span class="metin"><b>Fiş fotoğrafları</b><small>${ayAdi(st.ay)} · ${fotoSayisi} fotoğraf · ZIP</small></span>${IKON.indir}</button>
        <p class="not">Telefonda paylaşım menüsü açılır; WhatsApp ya da e-postayla doğrudan gönderebilirsin. Fotoğraf adları Excel'deki Sıra No ile başlar.</p>
      </section>
    </div>`;
}

/* ---------- Ayarlar ---------- */
function cizAyarlar() {
  const el = $("#v-ayarlar");
  el.classList.add("dar");
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const kurulu = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  el.innerHTML = `
    ${markaSatiri()}
    <h1 class="baslik" style="font-size:24px">Ayarlar</h1>
    <section class="kart">
      <h2>Kasa</h2>
      <form class="yatay" data-form="kasa-ad"><label class="alan"><span>Kasanın adı (Excel dosyasının adı da bu olur)</span><input name="ad" maxlength="60" value="${esc(st.kasaAdi)}"></label><button class="btn birincil" type="submit" style="align-self:flex-end">Kaydet</button></form>
    </section>
    <section class="kart">
      <h2>Uygulamayı yükle</h2>
      ${kurulu ? `<p class="not">Recify bu cihazda uygulama olarak açık.</p>`
        : st.kurulumOlayi ? `<p class="not">Recify'ı bu cihaza uygulama olarak ekle; simgesiyle tek dokunuşla açılır.</p><button type="button" class="btn birincil" data-eylem="kur">${IKON.indir}Recify'ı yükle</button>`
        : ios ? `<p class="not">Safari'de alttaki <b>Paylaş</b> düğmesine, ardından <b>Ana Ekrana Ekle</b>'ye dokun.</p>`
        : `<p class="not">Tarayıcı menüsünden <b>Uygulamayı yükle</b> ya da <b>Ana ekrana ekle</b>'yi seç.</p>`}
    </section>
    <section class="kart">
      <h2>Yedek ve taşıma</h2>
      <p class="not">Kayıtlar ve fotoğraflar yalnızca bu cihazda saklanır. Telefondaki kasayı bilgisayara taşımak ya da yedeklemek için yedek dosyası al, diğer cihazda içe aktar. Aynı kayıtlar iki kez eklenmez.</p>
      <div class="yatay">
        <button type="button" class="btn" data-eylem="yedek">${IKON.indir}Yedek al (.zip)</button>
        <label for="iceAktarGirdi" class="btn">${IKON.yukle}İçe aktar (.zip)</label>
      </div>
      <p class="not">Eski Fiş Kasa Defteri'ndeki kayıtlar için oradaki <b>Recify'a taşı</b> düğmesiyle aldığın dosyayı içe aktar.</p>
    </section>
    <section class="kart">
      <h2>Fiş okuma</h2>
      <p class="not">Fişler bu cihazın içinde okunur; fotoğraflar hiçbir yere gönderilmez. İlk okumada okuma motoru bir kez indirilir (yaklaşık 5 MB). Okunan alanları kaydetmeden önce kontrol et; emin olunamayanlar turuncu görünür.</p>
    </section>`;
}

/* ---------- Fotoğraf ve okuma kuyruğu ---------- */
async function kucult(file) {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const olcek = Math.min(1, 2200 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * olcek); c.height = Math.round(bmp.height * olcek);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/jpeg", 0.85));
}

async function yeniOge(file) {
  let blob = file;
  try { blob = await kucult(file); } catch { /* tarayıcı küçültemezse özgün dosya kullanılır */ }
  const oge = { id: kimlik(), blob, url: URL.createObjectURL(blob), durum: "sirada", sonuc: null, hata: null };
  st.kuyruk.push(oge);
  oku(oge);
  return oge;
}

async function fotolarGeldi(files) {
  files = [...files].filter((f) => f.type.startsWith("image/") || /\.(heic|heif|jpe?g|png)$/i.test(f.name));
  if (!files.length) return;
  // Kontrol ekranı yeni bir fiş için açıkken çekilen foto, o fişin fotoğrafını değiştirir.
  if (st.form && !st.form.kayit && files.length === 1) {
    if (st.form.oge) kuyruktanCikar(st.form.oge);
    st.form.oge = await yeniOge(files[0]);
    st.form.dokunulan.clear();
    kontrolFotoGoster();
    formuOgedenDoldur(st.form.oge);
    kuyrukCiz();
    return;
  }
  const ogeler = [];
  for (const f of files) ogeler.push(await yeniOge(f));
  kuyrukCiz();
  if (ogeler.length === 1) kontrolAc({ oge: ogeler[0] });
  else toast(ogeler.length + " fiş sırayla okunuyor. Hazır olanları Onay bekliyor listesinden kaydet.", 5000);
}

// Fişler sırayla okunur; aynı anda çok fiş bırakıldığında cihaz yorulmaz.
let okumaZinciri = Promise.resolve();
function oku(oge) {
  oge.durum = "sirada"; oge.hata = null; kuyrukCiz();
  if (st.form?.oge === oge) formuOgedenDoldur(oge);
  okumaZinciri = okumaZinciri.then(() => okuSimdi(oge));
}
async function okuSimdi(oge) {
  if (!st.kuyruk.includes(oge)) return;
  oge.durum = "okunuyor"; kuyrukCiz();
  if (st.form?.oge === oge) formuOgedenDoldur(oge);
  try {
    oge.sonuc = await RecifyOkuma.fisOku(oge.blob);
    oge.durum = "hazir";
  } catch (e) {
    oge.durum = "hata";
    oge.hata = e?.message || "Fiş okunamadı. Bilgileri fotoğrafa bakarak gir.";
  }
  kuyrukCiz();
  if (st.form?.oge === oge) formuOgedenDoldur(oge);
}

function kuyruktanCikar(oge) {
  st.kuyruk = st.kuyruk.filter((o) => o !== oge);
  URL.revokeObjectURL(oge.url);
  kuyrukCiz();
}

/* ---------- Fişi kontrol et ---------- */
function odemeSec(v) {
  st.form.odeme = v;
  $$("#fOdeme button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
}
function alanlariDoldur(v, sadeceDokunulmayan) {
  const d = st.form.dokunulan;
  const yaz = (id, deger, ad) => { if (!sadeceDokunulmayan || !d.has(ad)) $(id).value = deger; };
  yaz("#fTarih", v.tarih || "", "tarih");
  yaz("#fEvrakTipi", EVRAK_TIPLERI.includes(v.evrakTipi) ? v.evrakTipi : "Fiş", "evrakTipi");
  yaz("#fEvrakNo", v.evrakNo || "", "evrakNo");
  yaz("#fKategori", KATEGORILER.includes(v.kategori) ? v.kategori : "Diğer", "kategori");
  yaz("#fFirma", v.firma || "", "firma");
  yaz("#fTutar", v.tutar ? para.format(v.tutar) + " ₺" : "", "tutar");
  if (!sadeceDokunulmayan) $("#fAciklama").value = v.aciklama || "";
  if (!sadeceDokunulmayan || !d.has("odeme")) odemeSec(v.odeme || "kart");
}
function isaretle(dikkatli, bekliyor) {
  $$("#kForm .alan").forEach((el) => {
    const a = el.dataset.alan;
    el.classList.toggle("bekliyor", !!bekliyor && ["tarih", "evrakNo", "firma"].includes(a));
    el.classList.toggle("dikkat", (dikkatli || []).includes(a));
  });
  $(".tutar-satir").classList.toggle("dikkat", (dikkatli || []).includes("tutar") || (dikkatli || []).includes("odeme"));
}
function kDurum(tip, html) {
  const d = $("#kDurum");
  d.hidden = !tip; d.className = "k-durum" + (tip === "hata" ? " hata" : ""); d.innerHTML = html || "";
}
function kUyari(msg) { $("#kUyari").textContent = msg || ""; $("#kUyari").hidden = !msg; }

function kontrolFotoGoster() {
  const f = st.form, kutu = $("#kResimKutu"), img = $("#kResim");
  kutu.classList.remove("buyuk");
  const var_ = !!(f.oge || f.kayit?.foto);
  kutu.classList.toggle("fotosuz", !var_);
  $(".k-foto").classList.toggle("fotosuz-kol", !var_);
  img.removeAttribute("src");
  if (f.oge) img.src = f.oge.url;
  else if (f.kayit?.foto) fotoUrl(f.kayit.foto).then((u) => { if (u && st.form === f) img.src = u; });
}

function kontrolAc({ kayit, oge } = {}) {
  st.form = { id: kayit?.id || null, kayit: kayit || null, oge: oge || null, odeme: "kart", dokunulan: new Set() };
  $("#kontrolBaslik").textContent = kayit ? "Kaydı düzenle" : oge ? "Fişi kontrol et" : "Elle kayıt";
  $("#kontrolYeniden").hidden = !!kayit;
  $("#aciklamaEtiket").textContent = kayit ? "Açıklama" : "Açıklama · senin yazman gerekiyor";
  const sil = $("#kSil");
  sil.hidden = !(kayit || oge); sil.classList.remove("onay"); sil.textContent = kayit ? "Sil" : "Çıkar";
  $("#kKaydet").lastChild.textContent = kayit ? "Değişiklikleri kaydet" : "Kasaya kaydet";
  kUyari(""); kDurum(null); isaretle([]);
  kontrolFotoGoster();
  if (kayit) alanlariDoldur({ tarih: kayit.tarih, evrakTipi: kayit.evrak_tipi, evrakNo: kayit.evrak_no, kategori: kayit.kategori, firma: kayit.firma, aciklama: kayit.aciklama, tutar: tutarOf(kayit), odeme: odemeOf(kayit) });
  else alanlariDoldur({ tarih: bugun(), evrakTipi: "Fiş", kategori: "Yemek/Gıda", odeme: "kart" });
  if (oge) formuOgedenDoldur(oge);
  $("#kontrol").hidden = false; $("#kontrol").scrollTop = 0;
  document.body.style.overflow = "hidden";
  if (!kayit && !oge) setTimeout(() => $("#fFirma").focus(), 60);
}

function formuOgedenDoldur(oge) {
  if (oge.durum === "okunuyor" || oge.durum === "sirada") {
    kDurum("okunuyor", `<span class="donen"></span> ${oge.durum === "sirada" ? "Sırada, birazdan okunacak…" : "Fiş okunuyor… (5-20 sn)"}`);
    isaretle([], true);
    return;
  }
  if (oge.durum === "hata") {
    isaretle([]);
    kDurum("hata", `${esc(oge.hata)} <button type="button" data-eylem="tekrar-oku">Tekrar oku</button>`);
    return;
  }
  const r = oge.sonuc || {};
  const tarihOk = /^\d{4}-\d{2}-\d{2}$/.test(r.tarih || "");
  const tutar = parseTutar(r.tutar);
  alanlariDoldur({
    tarih: tarihOk ? r.tarih : $("#fTarih").value,
    evrakTipi: r.evrakTipi === "Fatura" ? "Fatura" : "Fiş", evrakNo: r.evrakNo || "",
    kategori: r.kategori, firma: trUpper(r.firma), tutar: tutar > 0 ? tutar : 0,
    odeme: r.odeme === "nakit" ? "nakit" : "kart",
  }, true);
  const dikkat = Array.isArray(r.emin_olunmayan) ? r.emin_olunmayan.map(String) : [];
  isaretle(dikkat);
  const dolu = ["tarih", "evrakTipi", "evrakNo", "firma", "tutar", "odeme", "kategori"].filter((a) => !dikkat.includes(a)).length;
  kDurum("tamam", `<span class="tik">${IKON.tik}</span> Fiş okundu · ${dolu} alan dolduruldu, kontrol et`);
  tekrarKontrol();
  if (!$("#fAciklama").value && !masaustu()) $("#fAciklama").focus({ preventScroll: true });
}

function kontrolKapat() {
  if (!st.form) return;
  st.form = null;
  $("#kontrol").hidden = true; document.body.style.overflow = "";
}

function tekrarKontrol() {
  const f = st.form; if (!f) return;
  const tarih = $("#fTarih").value, tutar = parseTutar($("#fTutar").value);
  const no = $("#fEvrakNo").value.trim(), firma = trUpper($("#fFirma").value.trim());
  const ayni = st.kayitlar.find((k) => k.id !== f.id && k.tarih === tarih && Math.abs(tutarOf(k) - tutar) < 0.01 && ((no && k.evrak_no === no) || (firma && k.firma === firma)));
  if (ayni) kUyari(`Bu fiş daha önce eklenmiş olabilir: ${tarihTR(ayni.tarih)}, ${ayni.firma}, ${tl(tutarOf(ayni))}.`);
}

async function kaydet() {
  const f = st.form; if (!f || !VT.db) return;
  const tarih = $("#fTarih").value;
  const tutar = parseTutar($("#fTutar").value);
  const aciklama = $("#fAciklama").value.trim();
  const firma = $("#fFirma").value.trim();
  const eksik = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tarih)) eksik.push("tarih");
  if (!(tutar > 0)) eksik.push("tutar");
  if (!firma) eksik.push("firma");
  if (!aciklama) eksik.push("açıklama");
  if (eksik.length) { kUyari("Kaydetmeden önce şunları doldur: " + eksik.join(", ") + "."); $("#kUyari").scrollIntoView({ block: "center" }); return; }

  const btn = $("#kKaydet"); btn.disabled = true; btn.lastChild.textContent = "Kaydediliyor…";
  try {
    navigator.storage?.persist?.().catch(() => {});
    let foto = f.kayit?.foto || null;
    if (f.oge) { foto = kimlik(); await VT.yaz("fotolar", f.oge.blob, foto); }
    const t2 = Math.round(tutar * 100) / 100;
    const simdi = new Date().toISOString();
    await VT.yaz("kayitlar", {
      id: f.id || kimlik(),
      tarih, evrakTipi: $("#fEvrakTipi").value, evrakNo: $("#fEvrakNo").value.trim(), kategori: $("#fKategori").value,
      aciklama: trUpper(aciklama), firma: trUpper(firma),
      gelen: f.odeme === "gelen" ? t2 : null, nakit: f.odeme === "nakit" ? t2 : null, kart: f.odeme === "kart" ? t2 : null,
      foto, olusturma: f.kayit?.created_at || simdi, guncelleme: simdi,
    });
    if (f.oge) kuyruktanCikar(f.oge);
    const yeni = !f.id;
    kontrolKapat();
    st.ay = ayKey(tarih);
    await yukle();
    toast(yeni ? "Kasaya eklendi" : "Kayıt güncellendi");
  } catch (e) {
    kUyari(e?.name === "QuotaExceededError" ? "Cihazda yer kalmadı. Eski fotoğrafları yedekleyip silmen gerekebilir." : "Kaydedilemedi. Tekrar dene.");
  } finally {
    btn.disabled = false; btn.lastChild.textContent = st.form?.kayit ? "Değişiklikleri kaydet" : "Kasaya kaydet";
  }
}

async function silVeyaCikar() {
  const f = st.form; if (!f) return;
  if (f.oge && !f.kayit) { kuyruktanCikar(f.oge); kontrolKapat(); toast("Fiş listeden çıkarıldı"); return; }
  const b = $("#kSil");
  if (!b.classList.contains("onay")) { b.classList.add("onay"); b.textContent = "Silmek için tekrar dokun"; return; }
  b.disabled = true;
  try {
    await VT.sil("kayitlar", f.id);
    if (f.kayit.foto) await VT.sil("fotolar", f.kayit.foto).catch(() => {});
    kontrolKapat();
    await yukle();
    toast("Kayıt silindi");
  } catch { kUyari("Silinemedi. Tekrar dene."); }
  finally { b.disabled = false; }
}

/* ---------- Dosya verme (telefonda paylaş, bilgisayarda indir) ---------- */
async function dosyaVer(blob, ad, tip) {
  const file = new File([blob], ad, { type: tip });
  if (!masaustu() && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: ad }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = ad;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  toast("İndirildi: " + ad);
}

/* ---------- Excel ---------- */
const SATIR = 500;
const XL = { lacivert: "FF1F4E78", gri: "FFF2F2F2", beyaz: "FFFFFFFF", cizgi: "FFD9D9D9", para: '#,##0.00\\ "₺"', tarih: "dd\\.mm\\.yyyy" };
const kenar = { style: "thin", color: { argb: XL.cizgi } };
const KENAR = { top: kenar, left: kenar, bottom: kenar, right: kenar };
const q = (ad) => "'" + ad.replace(/'/g, "''") + "'";

async function excelOlustur() {
  const gruplar = aylarListesi().map((key) => ({ key, ad: sayfaAdi(key), rows: ayKayitlari(key) })).filter((g) => g.rows.length || g.key === ayKey(bugun()));
  const wb = new ExcelJS.Workbook();
  wb.creator = "Recify";
  wb.calcProperties.fullCalcOnLoad = true;
  const ozet = wb.addWorksheet("Özet ve Rapor", { views: [{ showGridLines: false }] });
  const ayar = wb.addWorksheet("Ayarlar", { state: "hidden" });
  EVRAK_TIPLERI.forEach((v, i) => { ayar.getCell(i + 1, 1).value = v; });
  KATEGORILER.forEach((v, i) => { ayar.getCell(i + 1, 2).value = v; });

  const aralik = (ad, kol) => q(ad) + "!$" + kol + "$2:$" + kol + "$" + SATIR;
  gruplar.forEach((g, gi) => {
    const ws = wb.addWorksheet(g.ad, { views: [{ state: "frozen", ySplit: 1, topLeftCell: "A2", activeCell: "A2" }] });
    [10, 11, 15.55, 14.89, 22.33, 70, 40, 18, 18, 20, 22.11].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
    const bas = ws.getRow(1); bas.height = 30;
    ["Sıra No", "Tarih", "Evrak Tipi", "Evrak No", "Gider Kategorisi", "Açıklama", "Firma / Kişi Adı", "Gelen Nakit", "Nakit Çıkış", "Kredi Kartı Çıkış", "Kalan Kasa Bakiyesi"].forEach((t, i) => {
      const c = bas.getCell(i + 1);
      c.value = t;
      c.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: XL.beyaz } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: XL.lacivert } };
      c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      c.border = KENAR;
    });
    // Bakiye önceki ayların nakit hareketlerini de taşır; kartlı (boş) satırlar formülü bozmaz.
    const oncekiH = gruplar.slice(0, gi).map((o) => aralik(o.ad, "H"));
    const oncekiI = gruplar.slice(0, gi).map((o) => aralik(o.ad, "I"));
    for (let r = 2; r <= SATIR; r++) {
      const k = g.rows[r - 2];
      const row = ws.getRow(r); row.height = 15;
      const dolgu = { type: "pattern", pattern: "solid", fgColor: { argb: r % 2 === 0 ? XL.gri : XL.beyaz } };
      const deg = [
        r - 1,
        k ? (() => { const [y, m, d] = k.tarih.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); })() : null,
        k ? k.evrak_tipi : null,
        k && k.evrak_no ? (/^\d{1,15}$/.test(k.evrak_no) ? Number(k.evrak_no) : k.evrak_no) : null,
        k ? k.kategori : null,
        k ? k.aciklama : null,
        k ? k.firma : null,
        k && sayi(k.gelen) ? sayi(k.gelen) : null,
        k && sayi(k.nakit) ? sayi(k.nakit) : null,
        k && sayi(k.kart) ? sayi(k.kart) : null,
        { formula: `IF(AND(H${r}="",I${r}=""),"",SUM(${[...oncekiH, "$H$2:H" + r].join(",")})-SUM(${[...oncekiI, "$I$2:I" + r].join(",")}))` },
      ];
      deg.forEach((v, i) => {
        const c = row.getCell(i + 1);
        if (v !== null) c.value = v;
        c.font = { name: "Segoe UI", size: 10 };
        c.fill = dolgu; c.border = KENAR;
        c.alignment = { horizontal: "center", vertical: "middle" };
        if (i === 1) c.numFmt = XL.tarih;
        if (i >= 7) c.numFmt = XL.para;
      });
      row.getCell(3).dataValidation = { type: "list", allowBlank: true, formulae: ["Ayarlar!$A$1:$A$4"] };
      row.getCell(5).dataValidation = { type: "list", allowBlank: true, formulae: ["Ayarlar!$B$1:$B$8"] };
    }
    ws.autoFilter = "A1:K" + SATIR;
  });

  ozet.getColumn(1).width = 9.11; ozet.getColumn(2).width = 46.22; ozet.getColumn(3).width = 25; ozet.getColumn(4).width = 11;
  ozet.mergeCells("B2:C2");
  ozet.getRow(2).height = 30;
  const baslik = ozet.getCell("B2");
  baslik.value = trUpper(st.kasaAdi) + " ÖZETİ";
  baslik.font = { name: "Segoe UI", size: 18, bold: true, color: { argb: XL.beyaz } };
  baslik.fill = { type: "pattern", pattern: "solid", fgColor: { argb: XL.lacivert } };
  baslik.alignment = { horizontal: "center", vertical: "middle" };
  const topla = (kol) => "SUM(" + gruplar.map((g) => aralik(g.ad, kol)).join(",") + ")";
  [
    [4, "Toplam Gelen Nakit (Merkezden vs.):", topla("H"), false],
    [5, "Toplam Nakit Harcama (Kasadan Çıkan):", topla("I"), false],
    [6, "Kalan Nakit Bakiye:", "C4-C5", true],
    [7, "Toplam Kredi Kartı Harcaması:", topla("J"), false],
  ].forEach(([r, etiket, f, kirmizi]) => {
    ozet.getRow(r).height = 19.2;
    const l = ozet.getCell("B" + r), v = ozet.getCell("C" + r);
    l.value = etiket;
    l.font = { name: "Segoe UI", size: 12, bold: true, color: { argb: kirmizi ? "FFC00000" : "FF333333" } };
    v.value = { formula: f };
    v.numFmt = XL.para;
    v.font = { name: "Segoe UI", size: kirmizi ? 14 : 12, bold: true, color: { argb: kirmizi ? "FFC00000" : "FF000000" } };
    v.alignment = { horizontal: "right" };
  });
  wb.views = [{ activeTab: wb.worksheets.length - 1 }];
  return new Blob([await wb.xlsx.writeBuffer()], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

async function excelIndir(btn) {
  if (!window.ExcelJS) { toast("Excel aracı yükleniyor, birkaç saniye sonra tekrar dene."); return; }
  btn.disabled = true;
  try { const b = await excelOlustur(); await dosyaVer(b, dosyaAdi(trUpper(st.kasaAdi)) + ".xlsx", b.type); }
  catch { toast("Excel oluşturulamadı."); }
  finally { btn.disabled = false; }
}

async function fotolarZip(btn) {
  if (!window.JSZip) { toast("Arşiv aracı yükleniyor, birkaç saniye sonra tekrar dene."); return; }
  const rows = ayKayitlari(st.ay);
  const zip = new JSZip();
  const klasor = zip.folder(sayfaAdi(st.ay));
  let adet = 0;
  btn.disabled = true;
  try {
    for (const [i, k] of rows.entries()) {
      if (!k.foto) continue;
      const blob = await VT.al("fotolar", k.foto);
      if (!blob) continue;
      klasor.file(`${String(i + 1).padStart(3, "0")}_${tarihTR(k.tarih)}_${dosyaAdi(k.firma || "FİŞ").slice(0, 40)}_${para.format(tutarOf(k))}TL.jpg`, blob);
      adet++;
    }
    if (!adet) { toast(ayAdi(st.ay) + " için fiş fotoğrafı yok."); return; }
    await dosyaVer(await zip.generateAsync({ type: "blob" }), dosyaAdi(trUpper(st.kasaAdi) + " " + sayfaAdi(st.ay) + " FİŞLER") + ".zip", "application/zip");
  } catch { toast("Fotoğraflar hazırlanamadı."); }
  finally { btn.disabled = false; }
}

/* ---------- Yedek al / içe aktar ---------- */
async function yedekAl(btn) {
  if (!window.JSZip) { toast("Arşiv aracı yükleniyor, birkaç saniye sonra tekrar dene."); return; }
  btn.disabled = true;
  try {
    const zip = new JSZip();
    const kayitlar = [];
    for (const k of await VT.hepsi("kayitlar")) {
      let foto = null;
      if (k.foto) { const b = await VT.al("fotolar", k.foto); if (b) { foto = "fotolar/" + k.id + ".jpg"; zip.file(foto, b); } }
      kayitlar.push({ ...k, foto });
    }
    zip.file("kasa.json", JSON.stringify({ kasaAdi: st.kasaAdi, kayitlar }, null, 2));
    await dosyaVer(await zip.generateAsync({ type: "blob" }), dosyaAdi(trUpper(st.kasaAdi)) + " RECIFY YEDEK " + tarihTR(bugun()) + ".zip", "application/zip");
  } catch { toast("Yedek hazırlanamadı."); }
  finally { btn.disabled = false; }
}

async function iceAktar(file) {
  if (!window.JSZip) { toast("Arşiv aracı yükleniyor, birkaç saniye sonra tekrar dene."); return; }
  try {
    const zip = await JSZip.loadAsync(file);
    const json = zip.file("kasa.json");
    if (!json) throw new Error("Bu dosya bir Recify yedeği değil.");
    const veri = JSON.parse(await json.async("string"));
    const anahtar = (k) => [k.tarih, trUpper(k.firma || ""), k.evrakNo || "", (sayi(k.gelen) || sayi(k.nakit) || sayi(k.kart)).toFixed(2)].join("|");
    const var_ = new Set((await VT.hepsi("kayitlar")).map(anahtar));
    let eklenen = 0, atlanan = 0;
    for (const [i, k] of (veri.kayitlar || []).entries()) {
      toast(`Aktarılıyor: ${i + 1} / ${veri.kayitlar.length}`, 60000);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k.tarih || "") || var_.has(anahtar(k))) { atlanan++; continue; }
      let foto = null;
      if (k.foto && zip.file(k.foto)) {
        foto = kimlik();
        await VT.yaz("fotolar", new Blob([await zip.file(k.foto).async("blob")], { type: "image/jpeg" }), foto);
      }
      await VT.yaz("kayitlar", {
        id: kimlik(), tarih: k.tarih, evrakTipi: k.evrakTipi || "Fiş", evrakNo: k.evrakNo || "", kategori: k.kategori || "Diğer",
        aciklama: k.aciklama || "", firma: k.firma || "", gelen: k.gelen ?? null, nakit: k.nakit ?? null, kart: k.kart ?? null,
        foto, olusturma: k.olusturma || new Date().toISOString(), guncelleme: new Date().toISOString(),
      });
      var_.add(anahtar(k)); eklenen++;
    }
    if (veri.kasaAdi && !st.kayitlar.length) { st.kasaAdi = veri.kasaAdi; await VT.yaz("ayarlar", st.kasaAdi, "kasaAdi"); $$("[data-kasa-adi]").forEach((e) => { e.textContent = st.kasaAdi; }); }
    navigator.storage?.persist?.().catch(() => {});
    st.ay = null;
    await yukle();
    toast(`${eklenen} kayıt aktarıldı${atlanan ? `, ${atlanan} kayıt zaten vardı` : ""}.`, 5000);
  } catch (e) {
    toast("İçe aktarılamadı: " + (e.message || "dosya okunamadı."), 6000);
  }
}

/* ---------- Olaylar ---------- */
function olaylariBagla() {
  window.addEventListener("hashchange", () => { if (st.form) kontrolKapat(); rotayiUygula(); });

  $("#kameraGirdi").addEventListener("change", (e) => { const fs = [...e.target.files]; e.target.value = ""; fotolarGeldi(fs); });
  $("#galeriGirdi").addEventListener("change", (e) => { const fs = [...e.target.files]; e.target.value = ""; fotolarGeldi(fs); });
  $("#iceAktarGirdi").addEventListener("change", (e) => { const f = e.target.files[0]; e.target.value = ""; if (f) iceAktar(f); });

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-ay],[data-kayit],[data-kuyruk],[data-kat],[data-eylem]");
    if (!t) return;
    if (t.dataset.ay) {
      const aylar = aylarListesi(); const i = aylar.indexOf(st.ay) + Number(t.dataset.ay);
      if (aylar[i]) { st.ay = aylar[i]; ciz(); }
    } else if (t.dataset.kayit) {
      const k = st.kayitlar.find((x) => x.id === t.dataset.kayit); if (k) kontrolAc({ kayit: k });
    } else if (t.dataset.kuyruk) {
      const o = st.kuyruk.find((x) => x.id === t.dataset.kuyruk); if (o) kontrolAc({ oge: o });
    } else if (t.dataset.kat) {
      st.filtreKat = t.dataset.kat;
      $$("[data-kat]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.kat === st.filtreKat)));
      aramayiYenile();
    } else {
      const ey = t.dataset.eylem;
      if (ey === "excel") excelIndir(t);
      else if (ey === "zip") fotolarZip(t);
      else if (ey === "yedek") yedekAl(t);
      else if (ey === "elle") kontrolAc({});
      else if (ey === "tekrar-oku") { if (st.form?.oge) oku(st.form.oge); }
      else if (ey === "kur" && st.kurulumOlayi) { st.kurulumOlayi.prompt(); st.kurulumOlayi.userChoice.finally(() => { st.kurulumOlayi = null; ciz(); }); }
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("tr[data-kayit]")) e.target.click();
    if (e.key === "Escape" && st.form) kontrolKapat();
  });
  document.addEventListener("input", (e) => {
    if (e.target.id === "masaAra" || e.target.id === "fisAra") { st.ara = e.target.value; aramayiYenile(); }
  });
  document.addEventListener("submit", async (e) => {
    const f = e.target.closest("[data-form='kasa-ad']"); if (!f) return;
    e.preventDefault();
    const ad = f.elements.ad.value.trim();
    if (!ad || !VT.db) return;
    try {
      await VT.yaz("ayarlar", ad, "kasaAdi");
      st.kasaAdi = ad; $$("[data-kasa-adi]").forEach((x) => { x.textContent = ad; });
      toast("Kasa adı kaydedildi");
    } catch { toast("Kasa adı kaydedilemedi."); }
  });

  // Kontrol ekranı
  $("#kontrolKapat").onclick = kontrolKapat;
  $("#kResim").onclick = () => $("#kResimKutu").classList.toggle("buyuk");
  $("#kForm").addEventListener("submit", (e) => { e.preventDefault(); kaydet(); });
  $("#kSil").onclick = silVeyaCikar;
  $("#fOdeme").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    st.form.dokunulan.add("odeme"); odemeSec(b.dataset.v);
    if (b.dataset.v === "gelen") $("#fKategori").value = "Merkez Kasa Girişi";
    else if ($("#fKategori").value === "Merkez Kasa Girişi") $("#fKategori").value = "Diğer";
  });
  const alanAdi = { fTarih: "tarih", fEvrakTipi: "evrakTipi", fEvrakNo: "evrakNo", fKategori: "kategori", fFirma: "firma", fTutar: "tutar" };
  $("#kForm").addEventListener("input", (e) => { if (st.form && alanAdi[e.target.id]) st.form.dokunulan.add(alanAdi[e.target.id]); });
  ["#fTarih", "#fTutar", "#fEvrakNo", "#fFirma"].forEach((id) => $(id).addEventListener("change", tekrarKontrol));
  $("#fTutar").addEventListener("blur", () => { const n = parseTutar($("#fTutar").value); if (n > 0) $("#fTutar").value = para.format(n) + " ₺"; });

  // Sürükle-bırak (masaüstü)
  let derinlik = 0;
  const dosyaMi = (e) => [...(e.dataTransfer?.types || [])].includes("Files");
  window.addEventListener("dragenter", (e) => { if (!dosyaMi(e)) return; derinlik++; $("#birak").hidden = false; });
  window.addEventListener("dragleave", (e) => { if (!dosyaMi(e)) return; derinlik = Math.max(0, derinlik - 1); if (!derinlik) $("#birak").hidden = true; });
  window.addEventListener("dragover", (e) => { if (dosyaMi(e)) e.preventDefault(); });
  window.addEventListener("drop", (e) => {
    if (!dosyaMi(e)) return;
    e.preventDefault(); derinlik = 0; $("#birak").hidden = true;
    const zip = [...e.dataTransfer.files].find((f) => /\.zip$/i.test(f.name));
    if (zip) iceAktar(zip); else fotolarGeldi(e.dataTransfer.files);
  });
  window.addEventListener("resize", () => camKonumla());
  document.fonts?.ready?.then(() => camKonumla());
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); st.kurulumOlayi = e; if (st.gorunum === "ayarlar") ciz(); });
}

function aramayiYenile() {
  const tb = $("#masaTablo tbody");
  if (tb && st.gorunum === "kasa") tb.innerHTML = tabloGovde(ayKayitlari(st.ay));
  const fl = $("#fisListe");
  if (fl && st.gorunum === "fisler") fl.innerHTML = fisListesi();
}

baslat();
