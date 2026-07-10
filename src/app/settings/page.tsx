import Mihbar from "../../MihbarClientOnly";

// نفس تصميم "Shell + Sync" الموضّح في app/post/[id]/page.jsx — useAppUIState.js
// يقرأ usePathname() ويكتشف "/settings" تلقائيًا فيفتح SettingsPage داخليًا.
export default function SettingsRoutePage() {
  return <Mihbar />;
}
