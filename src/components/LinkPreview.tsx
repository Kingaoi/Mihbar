import { useState, useEffect } from "react";
import { RADIUS, FONT } from "../constants/index";

interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
  publisher: string;
}

interface LinkPreviewProps {
  url: string | null | undefined;
  CL: any;
  BORDERS: any;
}

// كاش وعود على مستوى الموديول (يعيش خارج أي instance من المكوّن). يحل
// مشكلة الطلبات المتزامنة المكررة: لو نفس الرابط ظهر في عدة تعليقات/ردود
// على نفس المنشور ورُسمت كلها معًا، كانت كل نسخة LinkPreview تطلق fetch
// مستقلاً حتى لو كانت النتيجة الأولى ستُخزَّن بعد قليل في sessionStorage —
// لأن الكتابة للكاش تحصل فقط بعد اكتمال أول طلب، فكل الطلبات المتزامنة
// اللي بدأت *قبل* ذلك الاكتمال تفوتها. الحل: نتشارك نفس الـ Promise بين كل
// الاستدعاءات المتزامنة لنفس الرابط، فيصير هناك fetch واحد فقط بغض النظر
// عن عدد المكوّنات التي تطلبه في نفس اللحظة.
const inFlightRequests = new Map<string, Promise<LinkPreviewData | null>>();

// إصلاح باگ: new window.URL(data.url).hostname كانت تُستدعى مباشرة بدون
// أي try/catch — لو أرجع API خارجي (microlink.io) قيمة url غير صالحة كـ
// URL (سلسلة فارغة، نص بدون بروتوكول، إلخ)، هذا يرمي TypeError يكسر رندر
// المكوّن بالكامل (بلا error boundary هنا). الآن نتحقق بأمان ونُرجع
// fallback (الرابط الخام كما وصل) بدل الانهيار.
function safeHostname(url: string): string {
  try {
    return new window.URL(url).hostname;
  } catch {
    return url || "";
  }
}

async function fetchLinkPreview(url: string): Promise<LinkPreviewData | null> {
  const cacheKey = `link_preview_${url}`;
  const cached = window.sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as LinkPreviewData;
    } catch {
      // كاش تالف، نكمل لجلب البيانات من جديد
    }
  }

  const existing = inFlightRequests.get(url);
  if (existing) return existing;

  const request = (async () => {
    try {
      const res = await window.fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (json.status === "success" && json.data) {
        // نتحقق من بروتوكول data.url القادم من استجابة API خارجي (microlink.io)
        // قبل استخدامه كـ href قابل للنقر — نفس مبدأ فحص https?:// المُطبَّق
        // في renderMarkdown لأي رابط من مصدر غير موثوق بالكامل. الرابط
        // الأصلي المُرسَل بالطلب آمن دائمًا (كل نقاط استدعاء LinkPreview
        // تُمرره عبر extractFirstUrl المُقيَّد بـ https?:// أصلاً)، لكن ما
        // يُرجعه API نفسه في الاستجابة قد يختلف نظريًا، فلا نثق فيه ضمنيًا.
        const reportedUrl = json.data.url;
        const safeUrl = typeof reportedUrl === "string" && /^https?:\/\//.test(reportedUrl)
          ? reportedUrl
          : url;
        const result: LinkPreviewData = {
          title: json.data.title || "",
          description: json.data.description || "",
          image: json.data.image?.url || "",
          url: safeUrl,
          publisher: json.data.publisher || "",
        };
        window.sessionStorage.setItem(cacheKey, JSON.stringify(result));
        return result;
      }
      return null;
    } catch {
      return null;
    } finally {
      inFlightRequests.delete(url);
    }
  })();

  inFlightRequests.set(url, request);
  return request;
}

export function LinkPreview({ url, CL, BORDERS }: LinkPreviewProps) {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let t0: ReturnType<typeof setTimeout> | undefined;
    if (!url) {
      const t = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(t);
    }

    t0 = setTimeout(() => {
      setLoading(true);
      setError(false);
    }, 0);

    fetchLinkPreview(url).then((result) => {
      if (!isMounted) return;
      if (result) {
        setData(result);
      } else {
        setError(true);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(t0);
    };
  }, [url]);

  if (loading) {
    return (
      <div style={{
        marginTop: 8, marginBottom: 8, height: 60, borderRadius: RADIUS.md,
        background: CL.borderFaint, border: BORDERS.default, opacity: 0.5,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: CL.textSub
      }}>
        ...
      </div>
    );
  }

  if (error || !data || (!data.title && !data.description && !data.image)) return null;

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        marginTop: 8,
        marginBottom: 8,
        borderRadius: RADIUS.md,
        border: BORDERS.default,
        overflow: "hidden",
        background: CL.surface,
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.opacity = "0.9";
        e.currentTarget.style.transform = "scale(0.995)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {data.image && (
        <div style={{
          width: "100%", height: 160, background: CL.borderFaint,
          backgroundImage: `url(${data.image})`, backgroundSize: "cover", backgroundPosition: "center"
        }} />
      )}
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        {data.title && (
          <div style={{ fontSize: FONT.body, fontWeight: 700, color: CL.text, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {data.title}
          </div>
        )}
        {data.description && (
          <div style={{ fontSize: FONT.caption, color: CL.textMuted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {data.description}
          </div>
        )}
        {(data.publisher || data.url) && (
          <div style={{ fontSize: 11, color: CL.textSub, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {data.publisher || safeHostname(data.url)}
          </div>
        )}
      </div>
    </a>
  );
}
