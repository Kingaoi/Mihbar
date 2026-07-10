"use client";

import dynamic from "next/dynamic";
import Loader from "./components/Loader";

// السبب المعماري لهذا الملف:
// MihbarShell هو تطبيق SPA-shell كامل — القياس (isMobile/isTablet) يقرر
// عمليًا كل شيء في شجرة الرندر عبر inline styles (232 استخدامًا عبر 35
// ملفًا)، وليس عبر CSS classes/variables. تحويل كل هذا لنمط "متوافق مع
// SSR" (نفس القيمة على السيرفر والعميل، ثم CSS يبدّل بصريًا) هو إعادة
// هيكلة كبيرة وخطرة غير مبررة هنا، خصوصًا أن هذا الشل لا يحتاج فهرسة SEO
// حقيقية (المحتوى ديناميكي بالكامل، خلف تفاعل مستخدم).
//
// التوصية الرسمية من Next.js لهذه الحالة بالذات (arrow "Page is already
// fully dynamic" / "Client Component re-renders with client values") هي
// إخراج المكوّن من مسار الـ SSR كليًا: بذلك لا يوجد رندر سيرفر لهذا الجزء
// إطلاقًا، فلا يوجد "تصميم افتراضي" يظهر مؤقتًا قبل التصحيح، ولا يوجد
// Hydration Mismatch لأن المقارنة سيرفر-عميل لا تحدث من الأساس.
// المرجع: https://nextjs.org/docs/app/guides/preventing-flash-before-hydration
const MihbarShell = dynamic(() => import("./MihbarShell"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#141312",
      }}
    >
      <Loader />
    </div>
  ),
});

export default function MihbarClientOnly() {
  return <MihbarShell />;
}
