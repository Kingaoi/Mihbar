// Mihbar لم يعد يُركَّب هنا — انظر app/layout.tsx (الـ layout الجذري
// المشترك). هذا الملف لا يزال مطلوبًا حتى يكون /post/[id] مسارًا صالحًا
// في Next.js (يستجيب لـ GET، قابل للمشاركة، مفهرس)، لكن العرض الفعلي
// بالكامل يتم داخل <Mihbar/> في الـ layout، الذي يقرأ usePathname()
// (عبر useThreadNavigation.js) ليعرف أن activePostId يجب أن يُفتح بناءً
// على [id] الحالي في الرابط. params.id غير مُستخدَم مباشرة هنا لنفس
// السبب — لكنه موجود في التوقيع لأن Next.js يتطلب ذلك لمسارات [id].
export default function PostPage() {
  return null;
}
