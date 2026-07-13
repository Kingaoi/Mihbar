import { motion, AnimatePresence } from "motion/react";
import { IconPencil, IconSproutLoader } from "./Icons";

// ملاحظة (Motion migration): كان يستقبل floatingBtnVisible/floatingBtnClosing
// مُدارَين يدويًا من MihbarShell.tsx عبر useEffect+setTimeout (نفس نمط
// SettingsBottomSheet سابقًا). الآن يستقبل isVisible مباشرة فقط،
// وAnimatePresence يتولى أنيميشن الدخول/الخروج داخليًا.
//
// isRefreshing: أثناء تحديث الفيد (سحب لأعلى أو بعد نشر منشور)، الزر يعرض
// IconSproutLoader بدل IconPencil ويُعطَّل تمامًا (disabled + onClick لا
// يُنفَّذ) — لا يمكن فتح نافذة نشر جديدة قبل استقرار البيانات المعروضة.
export function FloatingPostButton({
  isVisible,
  isRefreshing = false,
  setFloatingPostOpen,
  isMobile,
  CL,
  s
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="floating-post-btn"
          className="pressable"
          onClick={() => {
            if (isRefreshing) return;
            setFloatingPostOpen(true);
          }}
          disabled={isRefreshing}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: "fixed",
            bottom: isMobile ? 80 : 30,
            left: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: CL.accent,
            color: "#fff",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 900,
            cursor: isRefreshing ? "default" : "pointer",
            opacity: isRefreshing ? 0.85 : 1,
          }}
          aria-label={isRefreshing ? (s.refreshing || "جاري التحديث") : (s.newPost || "New Post")}
          aria-busy={isRefreshing}
        >
          {isRefreshing ? (
            <IconSproutLoader size={26} color="#fff" />
          ) : (
            <IconPencil size={24} color="#fff" />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
