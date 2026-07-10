import Mihbar from "../../MihbarClientOnly";

// نفس تصميم "Shell + Sync" الموضّح في app/post/[id]/page.jsx — useAppUIState.js
// يقرأ usePathname() ويكتشف "/profile" تلقائيًا فيفتح ProfilePage داخليًا.
export default function ProfileRoutePage() {
  return <Mihbar />;
}
