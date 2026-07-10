import { useState, useEffect } from "react";

// ملاحظة: MihbarShell لم يعد يُرسم على السيرفر (انظر MihbarClientOnly.jsx)،
// لذلك لا يوجد احتمال لـ Hydration Mismatch هنا، ويمكن قراءة window مباشرة
// في القيمة الأولية بأمان — هذا يعطي القياس الصحيح من أول render فعلي بدون
// أي فلاش وسيط.
export const getBreakpoint = () => {
  if (typeof window === "undefined") return "desktop";
  const docW = document.documentElement?.clientWidth || 0;
  const w = Math.max(window.innerWidth || 0, docW);
  const isTouch = typeof window.matchMedia === "function"
    && window.matchMedia("(pointer: coarse)").matches;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  if (isTouch && w < 900) return "mobile";
  return "desktop";
};

export const useBreakpoint = () => {
  const [bp, setBp] = useState(getBreakpoint);
  useEffect(() => {
    const handler = () => setBp(getBreakpoint());
    window.addEventListener("resize", handler);
    let ro;
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(handler);
      ro.observe(document.documentElement);
    }
    return () => {
      window.removeEventListener("resize", handler);
      if (ro) ro.disconnect();
    };
  }, []);
  return bp;
};
