// Recify açılış animasyonu (design/recify-splash-yeni-5.html, 1,9 sn): uygulama her açıldığında bir kez oynar.
// Kutu yaylanarak büyür, R arkadan süpürülerek gelir, fiş görünmez bir hattan kâğıt gibi bükülerek yazdırılır,
// harfler tek tek zıplar, ı'nın noktası düşer; sonunda logo büyüyerek kaybolur ve kasa ekranı görünür.
// Ekrana dokunmak animasyonu atlar.
"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  const perde = $("acilis");
  if (!perde) return;
  const anims = [];
  let bitti = false;
  let kagitKare = 0;

  function kapat(sure) {
    if (bitti) return;
    bitti = true;
    cancelAnimationFrame(kagitKare);
    const a = perde.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure, easing: "ease-out", fill: "forwards" });
    a.onfinish = () => { anims.forEach((x) => x.cancel()); perde.remove(); };
  }

  function placeDot() {
    // "ı" harfinin üstüne logodaki gibi mavi eğik nokta
    try {
      const b = $("wordText").getExtentOfChar(3);
      const cx = b.x + b.width / 2 + 6, top = b.y + b.height * 0.24;
      $("idot").setAttribute("d", `M${cx - 28} ${top + 18} L${cx + 4} ${top - 8} L${cx + 30} ${top + 4} L${cx - 2} ${top + 32} Z`);
    } catch { /* yazı tipi yoksa nokta çizilmez */ }
  }

  /* ---------- Fiş kâğıdının bükülmesi ---------- */
  const kagit = $("paper").querySelector("path");
  const kagitD = kagit.getAttribute("d");
  // Yolun her parçasını ayrı örnekle; tırtıklı alt kenarın köşeleri korunur.
  const noktalar = [];
  {
    const t = kagitD.match(/[MLCZ]|-?\d+(?:\.\d+)?/g);
    let i = 0, px = 0, py = 0;
    while (i < t.length) {
      const k = t[i++];
      if (k === "Z") break;
      if (k === "M") { px = +t[i++]; py = +t[i++]; noktalar.push([px, py]); }
      else if (k === "L") {
        const x = +t[i++], y = +t[i++];
        const adim = Math.max(1, Math.ceil(Math.hypot(x - px, y - py) / 4));
        for (let s = 1; s <= adim; s++) noktalar.push([px + (x - px) * s / adim, py + (y - py) * s / adim]);
        px = x; py = y;
      } else if (k === "C") {
        const x1 = +t[i++], y1 = +t[i++], x2 = +t[i++], y2 = +t[i++], x = +t[i++], y = +t[i++];
        for (let s = 1; s <= 24; s++) {
          const u = s / 24, v = 1 - u;
          noktalar.push([v * v * v * px + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x,
            v * v * v * py + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y]);
        }
        px = x; py = y;
      }
    }
  }
  // Fiş çizgileri kâğıtla birlikte bükülsün diye her biri bir gruba sarılır (çizginin kendi açılma animasyonu bozulmaz).
  const cizgiler = Array.from(document.querySelectorAll("#acilis .ln"), (ln) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    ln.before(g); g.append(ln);
    return { g, x: +ln.getAttribute("x"), y: +ln.getAttribute("y") + 8.5 };
  });
  function kagidiSifirla() {
    kagit.setAttribute("d", kagitD);
    cizgiler.forEach(({ g }) => g.removeAttribute("transform"));
  }
  // 220–440 ms: kâğıt çıkarken aşağı doğru ilerleyen dalga; 440–700 ms: sönümlenerek orijinal şekle döner.
  function kagidiBuk(baslangic) {
    function kare() {
      const zaman = document.timeline.currentTime - baslangic;
      if (bitti || zaman >= 700) { kagidiSifirla(); return; }
      if (zaman < 220) { kagidiSifirla(); kagitKare = requestAnimationFrame(kare); return; }
      const gecen = zaman - 220, durulma = Math.max(0, (zaman - 440) / 260);
      const zarf = zaman < 440 ? Math.min(1, gecen / 32) : Math.pow(1 - durulma, 1.5);
      const faz = zaman < 440 ? gecen / 100 * 2 * Math.PI : 2.2 * 2 * Math.PI + durulma * 2.4 * 2 * Math.PI;
      const kayma = (y) => {
        const h = Math.max(0, Math.min(1, (y - 323) / 190));
        return zarf * (14 * h ** 1.2 * Math.sin(faz - h * 4.4) + 2 * Math.sin(Math.PI * h) * Math.sin(faz - 0.7));
      };
      kagit.setAttribute("d", noktalar.map(([x, y], i) => {
        const kivrim = y >= 500 ? zarf * 1.9 * ((y - 323) / 190) * Math.sin(faz + (x - 568) * 0.065) : 0;
        return `${i ? "L" : "M"}${(x + kayma(y)).toFixed(3)} ${(y + kivrim).toFixed(3)}`;
      }).join(" ") + " Z");
      cizgiler.forEach(({ g, x, y }) => {
        const aci = Math.atan2(kayma(y + 1) - kayma(y - 1), 2) * 180 / Math.PI;
        g.setAttribute("transform", `translate(${kayma(y)} 0) rotate(${-aci * 0.28} ${x} ${y})`);
      });
      kagitKare = requestAnimationFrame(kare);
    }
    kagitKare = requestAnimationFrame(kare);
  }

  /* ---------- Harf harf yazı ---------- */
  function harfler() {
    const kaynak = $("wordText"), ns = "http://www.w3.org/2000/svg";
    for (let i = 0; i < kaynak.textContent.length; i++) {
      const b = kaynak.getExtentOfChar(i);
      const kirp = document.createElementNS(ns, "clipPath");
      kirp.id = "acilisHarf" + i;
      kirp.setAttribute("clipPathUnits", "userSpaceOnUse");
      const r = document.createElementNS(ns, "rect");
      for (const [k, v] of Object.entries({ x: b.x, y: b.y - 8, width: b.width, height: b.height + 16 })) r.setAttribute(k, v);
      kirp.append(r);
      $("stage").querySelector("defs").append(kirp);
      const grup = document.createElementNS(ns, "g"), pencere = document.createElementNS(ns, "g");
      grup.id = "glyph" + i; grup.setAttribute("class", "glyph");
      pencere.setAttribute("clip-path", `url(#${kirp.id})`);
      const kopya = kaynak.cloneNode(true); kopya.removeAttribute("id");
      pencere.append(kopya); grup.append(pencere);
      $("word").insertBefore(grup, $("idot"));
    }
    kaynak.style.opacity = "0";
  }

  function A(id, kareler, gecikme, sure, egri, baslangic) {
    const a = $(id).animate(kareler, { delay: gecikme, duration: sure, fill: "both", easing: egri });
    a.startTime = baslangic;
    anims.push(a);
  }

  function oynat() {
    if (bitti) return;
    placeDot();
    harfler();
    const t0 = document.timeline.currentTime;
    perde.classList.add("oynuyor");

    // 0–420 ms: mavi kutu patlar gibi büyüyüp yaylanarak yerleşir
    A("tile", [
      { opacity: 0, transform: "translateY(90px) rotate(-16deg) scale(.12)" },
      { opacity: 1, transform: "translateY(-24px) rotate(5deg) scale(1.13,.94)", offset: 0.52 },
      { transform: "translateY(8px) rotate(-2deg) scale(.96,1.04)", offset: 0.78 },
      { transform: "translateY(0) rotate(0) scale(1)" },
    ], 0, 420, "cubic-bezier(.22,.8,.3,1)", t0);
    // 140–500 ms: R arkadan süpürülerek gelir
    A("R", [
      { opacity: 0, transform: "translateX(-185px) skewX(-18deg) scaleX(.65)" },
      { opacity: 1, transform: "translateX(16px) skewX(4deg) scaleX(1.04)", offset: 0.67 },
      { opacity: 1, transform: "translateX(0) skewX(0) scaleX(1)" },
    ], 140, 360, "cubic-bezier(.16,1,.3,1)", t0);
    // 220–440 ms: fiş görünmez hattan (y=292) adım adım yazdırılır; 220–700 ms kâğıt bükülür
    A("receipt", [{ transform: "translateY(-232px)" }, { transform: "translateY(0)" }], 220, 220, "steps(12, end)", t0);
    kagidiBuk(t0);
    // 440 ms'den itibaren fiş çizgileri sırayla soldan dolar
    document.querySelectorAll("#acilis .ln").forEach((ln, i) => {
      ln.id = "acilisCizgi" + i;
      A(ln.id, [{ opacity: 0, transform: "scaleX(0)" }, { opacity: 1, transform: "scaleX(1)" }], 440 + i * 65, 180, "cubic-bezier(.16,1,.3,1)", t0);
    });
    // 380–935 ms: Recify harfleri tek tek zıplayarak gelir
    for (let i = 0; i < $("wordText").textContent.length; i++) {
      A("glyph" + i, [
        { opacity: 0, transform: "translate(22px,65px) rotate(9deg) scale(.75)" },
        { opacity: 1, transform: "translate(0,-13px) rotate(-3deg) scale(1.04)", offset: 0.58 },
        { transform: "translate(0,5px) rotate(1deg) scale(.98)", offset: 0.8 },
        { transform: "translate(0,0) rotate(0) scale(1)" },
      ], 380 + i * 55, 280, "cubic-bezier(.2,.8,.3,1)", t0);
    }
    // 500–820 ms: kutunun üzerinden ışık geçer
    A("sweep", [
      { opacity: 0, transform: "translateX(-210px)" },
      { opacity: 1, transform: "translateX(-90px)", offset: 0.18 },
      { opacity: 1, transform: "translateX(470px)", offset: 0.8 },
      { opacity: 0, transform: "translateX(650px)" },
    ], 500, 320, "linear", t0);
    // 750–1030 ms: ı'nın noktası düşüp sekerek yerleşir
    A("idot", [
      { opacity: 0, transform: "translateY(-125px) rotate(-28deg) scale(.7)" },
      { opacity: 1, transform: "translateY(5px) rotate(7deg) scale(1.12,.8)", offset: 0.48 },
      { transform: "translateY(-19px) rotate(-6deg) scale(.94,1.06)", offset: 0.7 },
      { transform: "translateY(0) rotate(0) scale(1)" },
    ], 750, 280, "cubic-bezier(.3,.65,.4,1)", t0);
    // 1120–1280 ms geri çekilme, 1280–1900 ms büyüyerek kaybolma (büyüme noktası mavi kutunun merkezi)
    const z = $("zoom"), zr = z.getBoundingClientRect(), tr = $("stage").getBoundingClientRect();
    const birim = tr.width / 696;
    z.style.transformOrigin = `${tr.left + tr.width / 2 - zr.left}px ${tr.top + (375 - 30) * birim - zr.top}px`;
    A("zoom", [
      { transform: "scale(1)", opacity: 1, offset: 0, easing: "ease-in-out" },
      { transform: "scale(.94)", opacity: 1, offset: 160 / 780, easing: "cubic-bezier(.5,0,.75,.25)" },
      { transform: "scale(5)", opacity: 0 },
    ], 1120, 780, "linear", t0);
    // Kasa ekranı 1500 ms'den itibaren görünür
    setTimeout(() => kapat(400), 1500);
  }

  // Dokunma ya da tuş animasyonu atlar
  perde.addEventListener("pointerdown", () => kapat(200));
  document.addEventListener("keydown", () => kapat(200), { once: true });

  // Hareketi azalt ayarı açıksa ya da tarayıcı animasyon desteklemiyorsa logo kısa gösterilip geçilir
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !perde.animate) {
    perde.classList.add("oynuyor");
    placeDot();
    setTimeout(() => (perde.animate ? kapat(300) : perde.remove()), 600);
    return;
  }

  // Lexend yazı tipi gelsin ki harfler doğru yerde başlasın (en fazla 1,2 sn beklenir; internetsizken hemen başlar)
  const yaziTipi = document.fonts?.load ? document.fonts.load('700 196px "Lexend"').catch(() => {}) : Promise.resolve();
  Promise.race([yaziTipi, new Promise((r) => setTimeout(r, 1200))]).then(() => requestAnimationFrame(oynat));
})();
