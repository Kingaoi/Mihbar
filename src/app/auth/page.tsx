// Mihbar لم يعد يُركَّب هنا — انظر app/layout.tsx (الـ layout الجذري
// المشترك). هذا الملف لا يزال مطلوبًا حتى يكون /auth مسارًا صالحًا،
// لكن العرض الفعلي يتم داخل <Mihbar/> في الـ layout، الذي يقرأ
// usePathname() (عبر useAppUIState.js) ويكتشف "/auth" تلقائيًا فيفتح
// صفحات الحساب (AuthGatewayPage / UsernameAuthPage) داخليًا.
export default function AuthRoutePage() {
  return null;
}
