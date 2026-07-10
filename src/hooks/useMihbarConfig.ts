import { useState, useEffect } from "react";
import { useBreakpoint } from "./useBreakpoint";
import { db } from "../utils/index";
import { S } from "../locales/strings";
import { CL_LIGHT, CL_DARK } from "../constants/index";

export function useMihbarConfig() {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "mobile";
  const isTablet = breakpoint === "tablet";

  // القيم الافتراضية أدناه ("ar" / "system") تطابق حرفيًا القيم الافتراضية
  // الداخلية في localStorageAdapter.js (getLang/getThemePref) — كانت db.getLang()
  // سابقًا متزامنة فتُرجع القيمة الحقيقية فورًا؛ الآن أصبحت async، لذا القيمة
  // الأولية هنا هي أفضل تخمين (نفس افتراضي الـ adapter نفسه) لتقليل "ومضة"
  // تغيّر اللغة/الثيم البصرية أثناء نافذة التحميل القصيرة عند أول تشغيل.
  const [lang, setLang] = useState("ar");
  const [themePref, setThemePrefState] = useState("system");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedLang, storedTheme] = await Promise.all([db.getLang(), db.getThemePref()]);
      if (cancelled) return;
      setLang(storedLang);
      setThemePrefState(storedTheme);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const s = S[lang];

  // Sync dir and lang on html document element
  useEffect(() => {
    document.documentElement.dir = s.d;
    document.documentElement.lang = lang;
  }, [lang, s.d]);

  // ملاحظة: MihbarShell لم يعد يُرسم على السيرفر (انظر MihbarClientOnly.jsx)،
  // لذلك يمكن قراءة matchMedia مباشرة في القيمة الأولية بأمان دون خطر
  // Hydration Mismatch — القيمة الصحيحة تظهر من أول render فعلي.
  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setSystemIsDark(e.matches);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const isDarkActive = themePref === "system" ? systemIsDark : themePref === "dark";
  const CL = isDarkActive ? CL_DARK : CL_LIGHT;

  // Sync the mobile toolbar, status bar color, and body background color
  useEffect(() => {
    document.body.style.backgroundColor = CL.bg;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", CL.bg);

    if (isDarkActive) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [CL.bg, isDarkActive]);

  const setThemePref = (pref) => {
    setThemePrefState(pref);
    db.saveThemePref(pref).catch(() => {});
  };

  const BORDERS = {
    default: `1px solid ${CL.border}`,
    danger: `1px solid ${CL.dangerBorder}`,
    edit: `1px solid ${CL.editBorder}`,
    flag: `1px solid ${CL.flagBorder}`,
    accent: `1px solid ${CL.accentBorder}`,
    ok: `1px solid ${CL.okBorder}`,
  };

  const R = {
    pagePad: isMobile ? "12px 14px" : isTablet ? "16px" : "20px",
    cardPad: isMobile ? "12px 14px" : isTablet ? "13px 15px" : "15px 17px",
    titleSize: "clamp(22px, 4vw, 28px)",
    tagSize: "clamp(11px, 1.6vw, 12px)",
    bodyText: "clamp(14px, 2vw, 15px)",
    commentText: "clamp(13px, 1.8vw, 14px)",
    replyText: "clamp(12px, 1.6vw, 13px)",
    inputFont: isMobile ? 16 : 13,
    textareaFont: isMobile ? 16 : 16,
    btnFont: "clamp(12px, 1.6vw, 13px)",
    metaFont: 10,
    reactionPad: isMobile ? "4px 8px" : "3px 8px",
    reactionFontSize: "clamp(11px, 1.5vw, 12px)",
    touchH: isMobile ? 44 : "auto",
    replyIndent: isMobile ? 10 : isTablet ? 16 : 20,
    replyPadStart: isMobile ? 8 : isTablet ? 10 : 12,
    gap: isMobile ? 6 : isTablet ? 7 : 8,
    headerMb: isMobile ? 18 : isTablet ? 21 : 24,
  };

  const radiusXl = isMobile ? 16 : 20;

  return {
    lang,
    setLang,
    s,
    themePref,
    setThemePref,
    isDarkActive,
    CL,
    BORDERS,
    R,
    radiusXl,
    isMobile,
    isTablet,
  };
}
