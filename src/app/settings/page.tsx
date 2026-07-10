// Mihbar لم يعد يُركَّب هنا — انظر app/layout.tsx (الـ layout الجذري
// المشترك). هذا الملف لا يزال مطلوبًا حتى يكون /settings مسارًا صالحًا،
// لكن العرض الفعلي يتم داخل <Mihbar/> في الـ layout، الذي يقرأ
// usePathname() (عبر useAppUIState.js) ويكتشف "/settings" تلقائيًا فيفتح
// SettingsPage داخليًا.
export default function SettingsRoutePage() {
  return null;
}
