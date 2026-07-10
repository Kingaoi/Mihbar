"use client";

import { useEffect } from "react";

// منقول حرفيًا من main.jsx الأصلي (Vite). لازم أن يكون Client Component
// منفصلاً لأن navigator.serviceWorker غير متاح في بيئة الخادم (Server
// Components)، وlayout.jsx الأب يبقى قابلاً لأن يكون Server Component.
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.error("[PWA] Service Worker registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}
