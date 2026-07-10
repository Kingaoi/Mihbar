import { motion, AnimatePresence } from "motion/react";
import { IconSprout, IconX, IconDownload } from "./Icons";
import { RADIUS, SHADOWS, FONT } from "../constants/index";

// This component handles prompting the user to install the app as a PWA
export default function PWABanner({
  showPwaBanner,
  deferredPrompt,
  handleDismissPWABanner,
  handleInstallPWA,
  CL,
  isMobile,
  s,
  btn0,
}) {
  const isVisible = showPwaBanner && !!deferredPrompt;

  return (
    <div
      style={{
        position: "fixed",
        bottom: isMobile ? 16 : 24,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              pointerEvents: "auto",
              background: CL.surface,
              border: `1px solid ${CL.border}`,
              borderRadius: RADIUS.lg,
              padding: "16px 20px",
              boxShadow: SHADOWS.modal,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxWidth: 350,
              width: "calc(100% - 32px)",
              boxSizing: "border-box",
            }}
          >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: RADIUS.md,
              background: CL.accentDim,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconSprout size={24} color={CL.accent} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: FONT.subhead, fontWeight: 800, color: CL.text, lineHeight: 1.3 }}>
              {s.pwaTitle}
            </h4>
            <p style={{ margin: "4px 0 0", fontSize: FONT.caption, color: CL.textSub, lineHeight: 1.4 }}>
              {s.pwaDesc}
            </p>
          </div>
          <button
            onClick={handleDismissPWABanner}
            className="pressable"
            style={{
              ...btn0,
              background: "transparent",
              border: "none",
              color: CL.textMuted,
              padding: 6,
              borderRadius: RADIUS.circle,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconX size={14} color={CL.textMuted} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={handleDismissPWABanner}
            className="pressable"
            style={{
              ...btn0,
              background: "transparent",
              border: "none",
              color: CL.textMuted,
              fontWeight: 700,
              fontSize: FONT.caption,
              padding: "6px 12px",
              borderRadius: RADIUS.sm,
            }}
          >
            {s.pwaNotNow}
          </button>
          <button
            onClick={handleInstallPWA}
            className="pressable"
            style={{
              ...btn0,
              background: CL.accent,
              border: "none",
              color: CL.bg,
              fontWeight: 800,
              fontSize: FONT.caption,
              padding: "6px 14px",
              borderRadius: RADIUS.sm,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <IconDownload size={12} color={CL.bg} />
            {s.pwaInstallBtn}
          </button>
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
