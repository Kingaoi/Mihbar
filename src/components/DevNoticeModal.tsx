import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FONT, RADIUS, SHADOWS, TRANSITIONS } from "../constants/index";
import Loader from "./Loader";
import { getDevNoticeAcknowledged, saveDevNoticeAcknowledged } from "../utils/dataLayer";

// ملاحظة (Motion migration): handleClose كانت تستخدم isClosing + setTimeout(250)
// يدويًا لتأجيل الحفظ الفعلي وإخفاء العنصر حتى انتهاء أنيميشن الخروج المفترض.
// الآن نستخدم onExitComplete من AnimatePresence — يُستدعى تلقائيًا بعد انتهاء
// أنيميشن الخروج الفعلي (وليس توقيتًا مخمَّنًا)، فيكون أدق ولا يحتاج أي state
// إضافي لتتبع "هل نحن في مرحلة الإغلاق".
export default function DevNoticeModal({ CL, BORDERS, isMobile, s, btn0 }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const acknowledged = await getDevNoticeAcknowledged();
        if (!cancelled && !acknowledged) {
          setIsOpen(true);
        }
      } catch {
        // Ignore if storage layer throws
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence onExitComplete={() => { saveDevNoticeAcknowledged().catch(() => {}); }}>
      {isOpen && (
        <motion.div
          key="dev-notice-overlay"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "16px",
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            style={{
              background: CL.surface,
              borderRadius: RADIUS.lg,
              border: BORDERS.accent, // Use subtle accent border
              boxShadow: SHADOWS.modal,
              maxWidth: 480,
              width: "100%",
              padding: isMobile ? "24px 20px" : "30px 24px",
              boxSizing: "border-box",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Custom Core Loader */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Loader size={60} accent={CL.accent} ringColor={CL.textSub} />
            </div>

            {/* Decorative Indicator Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: CL.accentDim,
                border: `1px solid ${CL.accentBorder}`,
                color: CL.accent,
                borderRadius: RADIUS.pill,
                padding: "4px 12px",
                fontSize: FONT.caption,
                fontWeight: 800,
                marginBottom: 16,
                letterSpacing: s.d === "ltr" ? "0.03em" : "normal",
              }}
            >
              {s.devNoticeTitle}
            </div>

            {/* Description/Text */}
            <p
              style={{
                fontSize: FONT.bodyLg,
                lineHeight: 1.7,
                color: CL.text,
                margin: "0 0 24px",
                fontWeight: 500,
              }}
            >
              {s.devNoticeText}
            </p>

            {/* Action Button */}
            <button
              onClick={handleClose}
              className="pressable"
              style={{
                ...btn0,
                width: "100%",
                background: CL.accent,
                color: "#FFFFFF",
                padding: isMobile ? "12px" : "11px",
                borderRadius: RADIUS.md,
                fontSize: FONT.bodyLg,
                fontWeight: 800,
                minHeight: isMobile ? 46 : "auto",
                transition: TRANSITIONS.colorChange,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              {s.devNoticeClose}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
