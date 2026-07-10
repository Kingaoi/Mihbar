import "./globals.css";
import ServiceWorkerRegistration from "./ServiceWorkerRegistration";
import Mihbar from "../MihbarClientOnly";

// كل الـ metadata أدناه منقولة حرفيًا من index.html الأصلي (Vite)، مُعاد
// تنظيمها بصيغة Next.js Metadata API القياسية. هذا يُنتج نفس meta tags
// بالضبط، لكن مُصيَّرة من الخادم (Server-Side) بدل الاعتماد على HTML ثابت —
// وهذا تحسين حقيقي للـ SEO ومعاينة الروابط دون أي تغيير في المحتوى نفسه.
export const metadata = {
  metadataBase: new URL("https://mihbar.app"),
  title: "محبار",
  description: "محبار — مساحة آمنة لمشاركة الآراء والتجارب والأفكار مجهولاً.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    url: "https://mihbar.app",
    title: "محبار — آراء · نصائح · تجارب",
    description:
      "مساحة آمنة لمشاركة الآراء والنصائح والتجارب والفضفضة بكل حرية وبشكل مجهول دون أي تتبع أو قيود.",
    images: ["/favicon.svg"],
  },
  twitter: {
    card: "summary",
    title: "محبار — آراء · نصائح · تجارب",
    description:
      "مساحة آمنة لمشاركة الآراء والنصائح والتجارب والفضفضة بكل حرية وبشكل مجهول دون أي تتبع أو قيود.",
    images: ["/favicon.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "محبار",
  },
  other: {
    google: "notranslate",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#141312",
};

export default function RootLayout({ children }) {
  // lang/dir هنا قيمة افتراضية ثابتة (نفس القيمة الثابتة التي كانت في
  // index.html الأصلي: lang="ar" dir="rtl") — لأن التفضيل الفعلي مخزَّن في
  // localStorage (client-only)، لا يمكن للخادم معرفته وقت أول طلب.
  // useMihbarConfig.js يواصل تحديث document.documentElement.dir/lang
  // ديناميكيًا بعد التحميل تمامًا كما كان يفعل في النسخة السابقة (Vite) —
  // لا تغيير سلوكي هنا، فقط مصدر القيمة الأولية اختلف.
  //
  // SPA حقيقي داخل Next.js App Router: <Mihbar/> يُركَّب هنا في الـ layout
  // الجذري المشترك بين كل المسارات (/, /post/[id], /profile, /settings)
  // بدل كل page.tsx على حدة. القاعدة في App Router: layout مشترك بين عدة
  // مسارات لا يُعاد تركيبه (remount) عند التنقل بينها — فقط {children}
  // (أي page.tsx الفردي) يتغيّر. بما أن كل صفحاتنا الأربعة تتفرّع مباشرة من
  // هذا الـ layout، فـ <Mihbar/> يبقى instance واحدًا ثابتًا طوال عمر
  // الجلسة، وكل حالته الداخلية (posts, deviceHash, ownedPosts...) تبقى
  // محمَّلة دون إعادة تحميل. {children} (محتوى page.tsx) لم يعد له أي دور
  // فعلي في العرض — Mihbar نفسه يقرأ usePathname() داخليًا (عبر
  // useThreadNavigation.js/useAppUIState.js) ليقرر ماذا يعرض، تمامًا كما
  // كان يفعل عبر useLocation() من react-router-dom في النسخة السابقة
  // (Vite + BrowserRouter) التي أُخذ منها هذا التصميم أصلاً.
  return (
    <html lang="ar" dir="rtl" translate="no" className="notranslate" suppressHydrationWarning>
      <body>
        <Mihbar />
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
