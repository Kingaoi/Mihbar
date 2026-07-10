const CACHE_NAME = "mihbar-cache-v2";
// ملاحظة (Next.js migration): القائمة السابقة كانت تحتوي مسارات Vite القديمة
// (/index.html, /src/main.jsx, /src/App.jsx, /src/index.css) — هذه الملفات
// غير موجودة إطلاقًا في بنية Next.js (لا يوجد index.html كملف مستقل، وأصول
// JS/CSS مبنية ومُجزَّأة بأسماء hash ديناميكية تحت /_next/static/ يستحيل
// معرفتها مسبقًا هنا). محاولة تخزينها كانت تفشل بصمت (بفضل Promise.allSettled
// أدناه) دون التسبب بخطأ ظاهر، لكنها كانت تُفرغ "تسخين" الكاش الأولي من أي
// فائدة حقيقية. القائمة الآن تقتصر على الأصول ذات المسار الثابت المعروف
// مسبقًا فقط؛ بقية أصول Next.js (_next/static/*) تُخزَّن تلقائيًا عبر
// استراتيجية Cache-First في fetch handler أدناه، عند أول طلب فعلي لكل منها.
const ASSETS_TO_CACHE = [
  "/",
  "/favicon.svg",
  "/manifest.json"
];

// Install Event - Caching App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching App Shell and Assets");
      // Use addAll with try-catch or individually to prevent one failure from blocking all
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[Service Worker] Failed to cache: ${url}`, err);
          })
        )
      ).then(() => self.skipWaiting());
    })
  );
});

// Activate Event - Cleaning Up Old Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing Old Cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First with Cache Fallback for maximum reliability in dev & prod
self.addEventListener("fetch", (event) => {
  // Only handle HTTP/HTTPS requests (ignore chrome-extension, etc.)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Define strategy: Cache-first for static assets, Network-first for dynamic elements
  const isStaticAsset = 
    event.request.url.includes("/favicon.svg") || 
    event.request.url.includes("/manifest.json") ||
    event.request.url.match(/\.(png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|otf|css)$/);

  if (isStaticAsset) {
    // Cache First, fallback to Network
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // If offline and request is HTML, return cached index
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/");
          }
        });
      })
    );
  } else {
    // Network First, fallback to Cache
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback for document navigation if completely offline and not cached
            if (event.request.mode === "navigate") {
              return caches.match("/");
            }
          });
        })
    );
  }
});
