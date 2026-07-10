import { useEffect } from "react";

// ملاحظة معمارية (Next.js migration): هذا الـ hook يعدّل meta tags من جهة
// العميل بعد التحميل (client-side)، وهذا مطلوب حاليًا لأن بيانات المنشورات
// كلها في localStorage — لا يوجد مصدر بيانات يقدر عليه الخادم وقت الطلب.
//
// MIGRATION_NOTE: بعد الربط بـ Supabase، الحل الأصح هندسيًا هو تحويل
// app/post/[id]/page.jsx إلى Server Component يستخدم `generateMetadata`
// (يقرأ المنشور من Supabase مباشرة على الخادم قبل الإرسال للمتصفح) — هذا
// يعطي meta tags صحيحة فور وصول الصفحة (أفضل لمشاركة الروابط على
// واتساب/تويتر التي تقرأ الـ HTML الأولي فقط ولا تُنفّذ JavaScript)، بدل
// الاعتماد على تعديل DOM بعد التحميل كما هو الحال هنا الآن. عند ذلك، هذا
// الـ hook يمكن حذفه بالكامل من مسار /post/[id] (ويبقى مفيدًا فقط للصفحة
// الرئيسية إن احتجنا عنوانًا ديناميكيًا فيها).
export function useDocumentMetadata({ activePost, s }) {
  useEffect(() => {
    let title = s.name;
    let desc = "مساحة آمنة لمشاركة الآراء والتجارب والأفكار مجهولاً.";
    let url = window.location.origin + window.location.pathname;

    if (activePost) {
      const truncateText = activePost.text.length > 60 ? activePost.text.slice(0, 60) + "..." : activePost.text;
      title = `${truncateText} — ${s.name}`;
      desc = activePost.text.length > 150 ? activePost.text.slice(0, 150) + "..." : activePost.text;
      url = `${window.location.origin}${window.location.pathname}?post=${activePost.id}`;
    } else {
      title = `${s.name} — ${s.tag}`;
      desc = s.d === "rtl" 
        ? "مساحة آمنة لمشاركة الآراء والنصائح والتجارب والفضفضة بكل حرية وبشكل مجهول دون أي تتبع أو قيود."
        : "A safe space to share opinions, advice, experiences, and thoughts freely and anonymously with no tracking or judgment.";
    }

    // Update document title
    document.title = title;

    // Helper to set or update meta tag
    const setMetaTag = (attrName, attrVal, content) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Update standard meta description
    setMetaTag("name", "description", desc);

    // Update Open Graph (og:) tags
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", desc);
    setMetaTag("property", "og:url", url);

    // Update Twitter Card tags
    setMetaTag("property", "twitter:title", title);
    setMetaTag("property", "twitter:description", desc);
    setMetaTag("property", "twitter:url", url);
  }, [activePost, s.tag, s.d, s.name]);
}

export default useDocumentMetadata;
