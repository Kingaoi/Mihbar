// الصفحة الرئيسية (feed). Mihbar لم يعد يُركَّب هنا — انظر app/layout.tsx.
// هذا الملف لا يزال مطلوبًا لأن Next.js App Router يحتاج page.tsx فعليًا
// في كل مجلد route حتى يُعتبر مسارًا صالحًا (يستجيب لـ GET /)، لكنه لا
// يُرندر أي شيء بصريًا بنفسه — <Mihbar/> في الـ layout الجذري (المشترك
// بين كل المسارات) هو من يقرأ usePathname() ويقرر ماذا يُعرض فعليًا.
export default function HomePage() {
  return null;
}
