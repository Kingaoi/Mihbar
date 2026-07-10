import Mihbar from "../MihbarClientOnly";

// الصفحة الرئيسية (feed). المكوّن Mihbar نفسه (Client Component، بدون SSR —
// انظر MihbarClientOnly.jsx للسبب) يحتوي كل منطق العرض والحالة المشتركة —
// بما فيها التبديل بين عرض الفيد الرئيسي وThreadView حسب activePostId
// (المُزامَن مع URL عبر useThreadNavigation.js). نفس هذا المكوّن يُستخدم
// أيضًا من app/post/[id]/page.jsx، app/profile/page.jsx، وapp/settings/page.jsx
// — انظر التعليق التوضيحي في تلك الملفات لسبب هذا التصميم (Shell + Sync).
export default function HomePage() {
  return <Mihbar />;
}
