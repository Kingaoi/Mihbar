import { motion, AnimatePresence } from "motion/react";
import {
  IconSettings,
  IconUser,
} from "./Icons";
import { FONT, RADIUS } from "../constants/index";

// ملاحظة (Motion migration): هذا المكوّن كان يدير دخول/خروج العنصر يدويًا عبر
// isOpenLocal + isClosing + useEffect مع setTimeout مزدوج (300ms) — نفس النمط
// الذي تسبب في مشاكل react-hooks/set-state-in-effect عبر المشروع (موثَّق في
// MIGRATION_NOTES.md). AnimatePresence يحل هذا بنيويًا: يعرف تلقائيًا متى
// يجب تشغيل أنيميشن الخروج (exit) ومتى يُزال العنصر فعليًا من DOM بعد
// انتهائه، دون أي state أو setTimeout إضافي من طرفنا.
export function SettingsBottomSheet({
  settingsOpen,
  setSettingsOpen,
  setSettingsPageOpen,
  setProfilePageOpen,
  CL,
  BORDERS,
  isMobile,
  s,
  btn0,
}) {
  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          key="settings-overlay"
          onClick={() => setSettingsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            style={{
              background: CL.surface,
              borderRadius: RADIUS.sheetTop,
              maxWidth: 700,
              width: "100%",
              boxSizing: "border-box",
              padding: isMobile ? "16px 16px 28px" : "20px 24px 28px",
              border: BORDERS.default,
              borderBottom: "none",
            }}
          >
            {/* مقبض بصري للسحب */}
            <div
              style={{
                width: 36,
                height: 4,
                background: CL.border,
                borderRadius: RADIUS.xs,
                margin: "0 auto 18px",
              }}
            />

            {/* زر الملف الشخصي */}
            <button
              onClick={() => {
                setTimeout(() => {
                  setSettingsOpen(false);
                  setProfilePageOpen(true);
                }, 120);
              }}
              className="pressable"
              style={{
                ...btn0,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: CL.borderFaint,
                border: BORDERS.default,
                borderRadius: RADIUS.lg,
                padding: isMobile ? "14px 16px" : "12px 16px",
                color: CL.text,
                minHeight: isMobile ? 48 : "auto",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: FONT.subhead, fontWeight: 800 }}>{s.profile}</span>
              <span style={{ display: "flex", color: CL.textSub }}>
                <IconUser size={18} color={CL.textSub} />
              </span>
            </button>

            {/* زر الإعدادات */}
            <button
              onClick={() => {
                setTimeout(() => {
                  setSettingsOpen(false);
                  setSettingsPageOpen(true);
                }, 120);
              }}
              className="pressable"
              style={{
                ...btn0,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: CL.borderFaint,
                border: BORDERS.default,
                borderRadius: RADIUS.lg,
                padding: isMobile ? "14px 16px" : "12px 16px",
                color: CL.text,
                minHeight: isMobile ? 48 : "auto",
              }}
            >
              <span style={{ fontSize: FONT.subhead, fontWeight: 800 }}>{s.settings}</span>
              <span style={{ display: "flex", color: CL.textSub }}>
                <IconSettings size={18} color={CL.textSub} />
              </span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}