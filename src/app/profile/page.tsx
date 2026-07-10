// Mihbar لم يعد يُركَّب هنا — انظر app/layout.tsx (الـ layout الجذري
// المشترك). هذا الملف لا يزال مطلوبًا حتى يكون /profile مسارًا صالحًا،
// لكن العرض الفعلي يتم داخل <Mihbar/> في الـ layout، الذي يقرأ
// usePathname() (عبر useAppUIState.js) ويكتشف "/profile" تلقائيًا فيفتح
// ProfilePage داخليًا.
export default function ProfileRoutePage() {
  return null;
}
