// Recify açılış animasyonu (design/recify-splash.html): uygulama her açıldığında bir kez oynar,
// sonunda logo büyüyerek kaybolur ve kasa ekranı görünür. Ekrana dokunmak animasyonu atlar.
"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  const perde = $("acilis");
  if (!perde) return;
  const anims = [];
  let bitti = false;

  function kapat(sure) {
    if (bitti) return;
    bitti = true;
    const a = perde.animate([{ opacity: 1 }, { opacity: 0 }], { duration: sure, easing: "ease-out", fill: "forwards" });
    a.onfinish = () => { anims.forEach((x) => x.cancel()); perde.remove(); };
  }

  function placeDot() {
    // "ı" harfinin üstüne logodaki gibi mavi eğik nokta
    try {
      const b = $("wordText").getExtentOfChar(3);
      const cx = b.x + b.width / 2 + 6;
      const top = b.y + b.height * 0.24;
      $("idot").setAttribute("d", `M${cx - 28} ${top + 18} L${cx + 4} ${top - 8} L${cx + 30} ${top + 4} L${cx - 2} ${top + 32} Z`);
    } catch { /* yazı tipi yoksa nokta çizilmez */ }
  }

  function A(el, frames, opts) {
    const a = el.animate(frames, Object.assign({ fill: "both", easing: "ease-out" }, opts));
    anims.push(a);
    return a;
  }

  function oynat() {
    if (bitti) return;
    placeDot();

    // 1) Mavi uygulama kutusu beliriyor
    A($("tile"), [
      { opacity: 0, transform: "scale(.55)" },
      { opacity: 1, transform: "scale(1.04)", offset: 0.7 },
      { opacity: 1, transform: "scale(1)" },
    ], { delay: 0, duration: 450, easing: "cubic-bezier(.2,.8,.2,1)" });

    // yazar kasa ağzı (yarık) beliriyor
    $("slit").style.transformBox = "fill-box"; $("slit").style.transformOrigin = "center";
    A($("slit"), [{ opacity: 0, transform: "scaleX(.3)" }, { opacity: 1, transform: "scaleX(1)" }], { delay: 300, duration: 250 });

    // 2) Fiş yazar kasadan çıkıyormuş gibi kesik kesik besleniyor
    const ADIM = 9, BAS = -232, kareler = [];
    for (let i = 0; i <= ADIM; i++) {
      const y = BAS + (0 - BAS) * i / ADIM;
      if (i > 0) kareler.push({ transform: `translateY(${y}px)`, offset: (i - 0.45) / ADIM });
      kareler.push({ transform: `translateY(${y}px)`, offset: i / ADIM });
    }
    kareler[0].offset = 0;
    A($("receipt"), kareler, { delay: 550, duration: 1200, easing: "linear" });

    // 3) R harfi çiziliyor, sonra dolduruluyor
    A($("slit"), [{ opacity: 1 }, { opacity: 0 }], { delay: 1850, duration: 400 });
    A($("R"), [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { delay: 1850, duration: 950, easing: "ease-in-out" });
    A($("R"), [{ fillOpacity: 0 }, { fillOpacity: 1 }], { delay: 2600, duration: 400 });
    A($("R"), [{ strokeOpacity: 1 }, { strokeOpacity: 0 }], { delay: 2800, duration: 250 });

    // 4) "Recify" yazısı
    A($("word"), [
      { opacity: 0, transform: "translateY(30px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], { delay: 2850, duration: 450, easing: "cubic-bezier(.2,.8,.2,1)" });

    // 5) Logo büyüyerek ekrana yaklaşıyor ve kayboluyor
    const z = $("zoom"), zr = z.getBoundingClientRect(), tr = $("tile").getBoundingClientRect();
    z.style.transformOrigin = `${tr.left + tr.width / 2 - zr.left}px ${tr.top + tr.height / 2 - zr.top}px`;
    A(z, [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(0.94)", opacity: 1, offset: 0.2 },
      { transform: "scale(5)", opacity: 0 },
    ], { delay: 3700, duration: 700, easing: "cubic-bezier(.5,0,.75,.25)" });

    // Uygulama ekranı ortaya çıkıyor
    setTimeout(() => kapat(400), 4150);
  }

  // Dokunma ya da tuş animasyonu atlar
  perde.addEventListener("pointerdown", () => kapat(200));
  document.addEventListener("keydown", () => kapat(200), { once: true });

  // Hareketi azalt ayarı açıksa ya da tarayıcı animasyon desteklemiyorsa kısa geçiş
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !perde.animate) {
    $("tile").style.opacity = 1; $("word").style.opacity = 1;
    $("R").style.fillOpacity = 1; $("receipt").style.transform = "none";
    setTimeout(() => (perde.animate ? kapat(300) : perde.remove()), 600);
    return;
  }

  // Lexend yazı tipi gelsin (en fazla 1,2 sn beklenir; internetsizken hemen başlar)
  const yaziTipi = document.fonts?.load ? document.fonts.load('700 196px "Lexend"').catch(() => {}) : Promise.resolve();
  Promise.race([yaziTipi, new Promise((r) => setTimeout(r, 1200))]).then(() => setTimeout(oynat, 150));
})();
