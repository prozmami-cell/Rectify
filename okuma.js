// Recify fiş okuma: fotoğraftaki fişi kırpar, telefonda/bilgisayarda Tesseract ile okur
// ve kasaya yazılacak alanları (tarih, tutar, fiş no, firma, ödeme, kategori) çıkarır. İnternete veri gönderilmez.
"use strict";
(function () {
  let isci = null;

  // Fişin beyaz kağıdını bulur, kırpar, griye çevirip kontrastı açar.
  async function hazirla(blob) {
    const img = await createImageBitmap(blob, { imageOrientation: "from-image" });
    const K = 400 / Math.max(img.width, img.height);
    const kw = Math.round(img.width * K), kh = Math.round(img.height * K);
    const kc = document.createElement("canvas"); kc.width = kw; kc.height = kh;
    const kx = kc.getContext("2d", { willReadFrequently: true }); kx.drawImage(img, 0, 0, kw, kh);
    const kd = kx.getImageData(0, 0, kw, kh).data;
    const beyaz = new Uint8Array(kw * kh);
    for (let i = 0; i < kw * kh; i++) {
      const r = kd[i * 4], g = kd[i * 4 + 1], b = kd[i * 4 + 2];
      beyaz[i] = Math.min(r, g, b) > 150 && Math.max(r, g, b) - Math.min(r, g, b) < 40 ? 1 : 0;
    }
    // En büyük beyaz bölge fişin kendisidir
    const gorulen = new Uint8Array(kw * kh);
    let kutu = null, enBoy = 0;
    for (let s = 0; s < kw * kh; s++) {
      if (!beyaz[s] || gorulen[s]) continue;
      const yigin = [s]; gorulen[s] = 1;
      let n = 0, x0 = kw, y0 = kh, x1 = 0, y1 = 0;
      while (yigin.length) {
        const p = yigin.pop(); n++;
        const x = p % kw, y = (p / kw) | 0;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (x > 0 && beyaz[p - 1] && !gorulen[p - 1]) { gorulen[p - 1] = 1; yigin.push(p - 1); }
        if (x < kw - 1 && beyaz[p + 1] && !gorulen[p + 1]) { gorulen[p + 1] = 1; yigin.push(p + 1); }
        if (y > 0 && beyaz[p - kw] && !gorulen[p - kw]) { gorulen[p - kw] = 1; yigin.push(p - kw); }
        if (y < kh - 1 && beyaz[p + kw] && !gorulen[p + kw]) { gorulen[p + kw] = 1; yigin.push(p + kw); }
      }
      if (n > enBoy) { enBoy = n; kutu = [x0, y0, x1, y1]; }
    }
    // Beyaz bölge çok küçükse (fiş bulunamadı) fotoğrafın tamamını kullan
    if (!kutu || enBoy < kw * kh * 0.04) kutu = [0, 0, kw - 1, kh - 1];
    let [x0, y0, x1, y1] = kutu;
    const pay = 4;
    x0 = Math.max(0, x0 - pay); y0 = Math.max(0, y0 - pay); x1 = Math.min(kw - 1, x1 + pay); y1 = Math.min(kh - 1, y1 + pay);
    const sx = x0 / K, sy = y0 / K, sw = (x1 - x0 + 1) / K, sh = (y1 - y0 + 1) / K;
    const O = Math.min(1600, sw * 2.2) / sw;
    const c = document.createElement("canvas");
    c.width = Math.round(sw * O); c.height = Math.round(sh * O);
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    img.close?.();
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    const hist = new Uint32Array(256), gri = new Uint8ClampedArray(c.width * c.height);
    for (let i = 0; i < gri.length; i++) { const v = (p[i * 4] * 0.3 + p[i * 4 + 1] * 0.59 + p[i * 4 + 2] * 0.11) | 0; gri[i] = v; hist[v]++; }
    let alt = 0, ust = 255, top = 0;
    for (let v = 0; v < 256; v++) { top += hist[v]; if (top > gri.length * 0.02) { alt = v; break; } }
    top = 0;
    for (let v = 255; v >= 0; v--) { top += hist[v]; if (top > gri.length * 0.4) { ust = v; break; } }
    for (let i = 0; i < gri.length; i++) {
      const v = Math.max(0, Math.min(255, ((gri[i] - alt) * 255) / Math.max(1, ust - alt)));
      p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = v;
    }
    x.putImageData(d, 0, 0);
    return c;
  }

  async function isciAl() {
    if (!isci) {
      isci = Tesseract.createWorker("tur").then(async (w) => {
        await w.setParameters({ tessedit_pageseg_mode: "4", preserve_interword_spaces: "1" });
        return w;
      }).catch((e) => { isci = null; throw e; });
    }
    return isci;
  }

  /* ---------- Metinden alanları çıkarma ---------- */
  const buyuk = (s) => s.toLocaleUpperCase("tr-TR");
  // "25.000,00" / "25 000,00" / "3.760" / "*22.500,00" gibi tutarları sayıya çevirir
  function tutarlar(satir) {
    const sonuc = [];
    const re = /(\d{1,3}(?:[.\s]\d{3})+|\d+)\s?,\s?(\d{2})(?!\d)|(\d{1,3}(?:\.\d{3})+)(?=\s*(?:TL|₺))/g;
    let m;
    while ((m = re.exec(satir))) {
      const v = m[1] !== undefined ? Number(m[1].replace(/[.\s]/g, "") + "." + m[2]) : Number(m[3].replace(/\./g, ""));
      if (v > 0 && v < 10000000) sonuc.push(v);
    }
    return sonuc;
  }

  function tarihBul(metin) {
    const re = /(\d{1,2})\s?[./\-]\s?(\d{1,2})\s?[./\-\s]\s?(20\d{2})/g;
    let m;
    while ((m = re.exec(metin))) {
      const g = Number(m[1]), a = Number(m[2]), y = Number(m[3]);
      if (g >= 1 && g <= 31 && a >= 1 && a <= 12 && y >= 2020 && y <= 2040) return `${y}-${String(a).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
    }
    return "";
  }

  function fisNoBul(metin) {
    const m = buyuk(metin).match(/[FŞS]?[İI]Ş\s*N[OÜ0]\s*[^\d\n]{0,6}(\d{1,6})/);
    return m ? m[1].replace(/^0+(?=\d)/, "") : "";
  }

  // Türkçe harfler \b ile çalışmadığı için kelime sınırı elle yazıldı
  const kelime = (liste) => new RegExp("(^|[^A-ZÇĞİÖŞÜ])(" + liste + ")(?=[^A-ZÇĞİÖŞÜ]|$)");
  const ADRES = kelime("MAH|MAHALLE|CAD|CADDE|SOK|SK|SKK|BULVAR|BLV|NO|VD|V\\.D|VERGİ|DAİRE|DAİRES|DAİRESİ|TEL|TLF|GSM|MERSİS|BİLGİ|TEŞEKKÜRLER|TARİH|SAAT|MÜŞTERİ");
  const TICARI = /(LTD|ŞTİ|A\.Ş|TİC|SAN|SARAYI|PETROL|LOKANTA|RESTORAN|YEMEK|KEBAP|DÖNER|MARKET|GIDA|FIRIN|PASTANE|KAFE|CAFE|OTO|LASTİK|YAPI|NALBUR|HIRDAVAT|REKLAM|TİCARET|ÇARŞI|AVM|ECZANE)/;
  function firmaBul(satirlar) {
    const adaylar = [];
    for (const s of satirlar.slice(0, 10)) {
      const t = buyuk(s).replace(/[|“”"'*#»«]/g, " ").replace(/\s+/g, " ").trim();
      const harf = (t.match(/[A-ZÇĞİÖŞÜ]/g) || []).length;
      if (harf < 5 || harf / t.replace(/\s/g, "").length < 0.75) continue;
      if (ADRES.test(t) || /\d{5,}/.test(t)) continue;
      // Anlamsız harf yığınlarını ele: en az bir uzun kelime, kısa kelimeler azınlıkta
      const kelimeler = t.split(" ");
      if (!kelimeler.some((k) => k.length >= 4) || kelimeler.filter((k) => k.length <= 2).length > kelimeler.length / 2) continue;
      adaylar.push(t);
    }
    return adaylar.find((t) => TICARI.test(t)) || adaylar[0] || "";
  }

  function tutarBul(satirlar) {
    const puan = new Map();
    const ekle = (v, p) => puan.set(v, (puan.get(v) || 0) + p);
    satirlar.forEach((s, i) => {
      const t = buyuk(s);
      const vs = tutarlar(t);
      const sonraki = tutarlar(buyuk(satirlar[i + 1] || ""));
      if (/TOPLAM|TOPLAN/.test(t) && !/KDV|TOPKDV|MAL HİZMET/.test(t)) (vs.length ? vs : sonraki).forEach((v) => ekle(v, 5));
      if (/TUTAR/.test(t) && !/KDV/.test(t)) (vs.length ? vs : sonraki).forEach((v) => ekle(v, 4));
      if (/KRED|KART|NAKİT|NAKIT|TAHSİLAT/.test(t)) vs.forEach((v) => ekle(v, 3));
      if (/KDV|TOPKDV/.test(t)) vs.forEach((v) => ekle(v, -6));
      vs.forEach((v) => ekle(v, 1));
    });
    let en = 0, enPuan = -Infinity;
    for (const [v, p] of puan) if (p > enPuan || (p === enPuan && v > en)) { en = v; enPuan = p; }
    return enPuan > 0 ? en : 0;
  }

  function kategoriBul(t) {
    if (/LASTİK|OTO SERVİS|OTO ELEKTR|OTO YIKAMA|OTOMOTİV|ARAÇ BAKIM|BALATA|AKÜ/.test(t)) return "Araç Bakım";
    if (/MOTORİN|BENZİN|KURŞUNSUZ|DİZEL|DIESEL|LPG|AKARYAKIT|LİTRE/.test(t) && !/YİYECEK|İÇECEK|GIDA/.test(t)) return "Yakıt";
    if (/NALBUR|HIRDAVAT|BORU|KAPLİN|TESİSAT|YAPI MARKET|BOYA|CIVATA|KABLO|İNŞAAT MALZ|AMBALAJ/.test(t) && !/YİYECEK/.test(t)) return "Hırdavat/Malzeme";
    if (/YİYECEK|YEMEK|LOKANTA|RESTORAN|KEBAP|DÖNER|SİMİT|PİDE|ÇORBA|KAHVALT|MARKET|GIDA|FIRIN|EKMEK|KAFE|CAFE|PASTANE|İÇECEK|ÇAY|KAHVE|TOST/.test(t)) return "Yemek/Gıda";
    if (/YAPI|VİDA|KAYNAK|TAMİR|ELEKTRİK/.test(t)) return "Hırdavat/Malzeme";
    if (/KARGO|NAKLİYE|TAŞIMA|LOJİSTİK/.test(t)) return "Nakliye";
    if (/PETROL|OPET|SHELL|BP\b|TOTAL|AYTEMİZ|PO\b/.test(t)) return "Yakıt";
    return "Diğer";
  }

  function ayristir(metin) {
    const satirlar = metin.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    const T = buyuk(metin);
    const sonuc = {
      tarih: tarihBul(metin),
      evrakTipi: /E[-\s]?FATURA|E[-\s]?ARŞİV|E[-\s]?ARSIV|\bFATURA\b/.test(T) ? "Fatura" : "Fiş",
      evrakNo: fisNoBul(metin),
      firma: firmaBul(satirlar),
      tutar: tutarBul(satirlar),
      odeme: /NAKİT|NAKIT/.test(T) && !/KRED|KART|MASTERCARD|VISA|POS/.test(T) ? "nakit" : "kart",
      kategori: kategoriBul(T),
    };
    sonuc.emin_olunmayan = ["tarih", "evrakNo", "firma", "tutar"].filter((a) => !sonuc[a]);
    if (!/KRED|KART|NAKİT|NAKIT|MASTERCARD|VISA/.test(T)) sonuc.emin_olunmayan.push("odeme");
    if (sonuc.kategori === "Diğer") sonuc.emin_olunmayan.push("kategori");
    return sonuc;
  }

  async function fisOku(blob) {
    if (!window.Tesseract) throw new Error("Okuma motoru yüklenemedi. İnternet bağlantısını kontrol et (ilk kullanımda bir kez indirilir).");
    const tuval = await hazirla(blob);
    const w = await isciAl();
    const { data } = await w.recognize(tuval);
    const sonuc = ayristir(data.text || "");
    if (!sonuc.tutar && !sonuc.tarih && !sonuc.firma) throw new Error("Fişteki yazılar okunamadı. Fişi düz bir zemine koyup yakından, net çek.");
    return sonuc;
  }

  window.RecifyOkuma = { fisOku, ayristir, hazirla };
})();
