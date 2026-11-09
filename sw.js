// Recify servis çalışanı: uygulama dosyalarını önbelleğe alır, böylece uygulama hızlı ve internetsiz açılır.
// Kayıtlar ve fotoğraflar cihazın kendi veritabanında (IndexedDB) durur.
const SURUM = "recify-v11";
const DOSYALAR = [
  "./", "index.html", "app.css", "app.js", "okuma.js", "acilis.js", "manifest.webmanifest",
  "vendor/exceljs.min.js", "vendor/jszip.min.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png",
  "icons/favicon-32.png", "icons/wordmark.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SURUM).then((c) => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== SURUM).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  // Önce ağ: yeni sürüm yayınlanınca hemen gelsin; çevrimdışıyken önbellekten aç.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) { const kopya = res.clone(); caches.open(SURUM).then((c) => c.put(e.request, kopya)); }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});
