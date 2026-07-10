import Mihbar from "../../../MihbarClientOnly";

// تصميم "Shell + Sync": بدل تفكيك منطق الحالة المتشابك في MihbarShell.jsx
// (posts, comments, replies, editing, إلخ) عبر خمسة routes منفصلة — وهو
// إعادة هيكلة عالية المخاطر لمشروع بهذا الحجم — كل route هنا يُركِّب نفس
// المكوّن المركزي <Mihbar/>. المكوّن نفسه يقرأ usePathname() داخليًا
// (عبر useThreadNavigation.js) ليعرف تلقائيًا أن activePostId يجب أن يُفتح
// بناءً على [id] الحالي في الرابط. هذا يعطي routing حقيقي (URL صحيح،
// عمل زر الرجوع، قابلية مشاركة الرابط) دون المساس بمنطق الحالة الموجود.
//
// params.id غير مُستخدَم مباشرة هنا لأن useThreadNavigation.js يستخرجه بنفسه
// من usePathname() — لكنه موجود في التوقيع لأن Next.js يتطلب ذلك لصفحات
// المسارات الديناميكية [id].
export default function PostPage() {
  return <Mihbar />;
}
