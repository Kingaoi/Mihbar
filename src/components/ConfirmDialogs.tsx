import { motion, AnimatePresence } from "motion/react";
import { IconAlertTriangle } from "./Icons";
import { FONT, RADIUS, SHADOWS, TRANSITIONS } from "../constants/index";

// ملاحظة (Motion migration): كان يستخدم `if (!confirmState) return null` بدون
// أي أنيميشن خروج (يختفي فجأة). AnimatePresence يضيف أنيميشن خروج ناعم
// ويوحّد النمط مع بقية modals المشروع، دون أي تغيير في منطق العرض/الإخفاء.
export function ConfirmModal({
  confirmState,
  closeConfirm,
  cardStyle,
  CL,
  BORDERS,
  isMobile,
  s,
  btn0
}) {
  return (
    <AnimatePresence>
      {confirmState && (
        <motion.div
          key="confirm-overlay"
          onClick={closeConfirm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
            boxSizing: "border-box",
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            style={{
              ...cardStyle,
              maxWidth: 360,
              width: "100%",
              boxShadow: SHADOWS.modal,
            }}
          >
            <div
              style={{
                fontSize: FONT.subhead,
                color: CL.text,
                lineHeight: 1.6,
                marginBottom: 18,
                wordBreak: "break-word",
              }}
            >
              {confirmState.message}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={closeConfirm}
                style={{
                  ...btn0,
                  background: CL.borderFaint,
                  border: BORDERS.default,
                  borderRadius: RADIUS.md,
                  padding: isMobile ? "11px 16px" : "8px 16px",
                  color: CL.textSub,
                  fontSize: FONT.body,
                  fontWeight: 700,
                  minHeight: isMobile ? 44 : "auto",
                }}
              >
                {s.confirmNo}
              </button>
              <button
                onClick={() => {
                  const fn = confirmState.onConfirm;
                  closeConfirm();
                  fn();
                }}
                style={{
                  ...btn0,
                  background: CL.dangerDim,
                  border: BORDERS.danger,
                  borderRadius: RADIUS.md,
                  padding: isMobile ? "11px 16px" : "8px 16px",
                  color: CL.danger,
                  fontSize: FONT.body,
                  fontWeight: 700,
                  minHeight: isMobile ? 44 : "auto",
                }}
              >
                {s.confirmYes}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DangerConfirmModal({
  dangerState,
  closeDangerConfirm,
  dangerCountdown,
  cardStyle,
  CL,
  BORDERS,
  isMobile,
  s,
  btn0
}) {
  return (
    <AnimatePresence>
      {dangerState && (
        <motion.div
          key="danger-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), rgba(192,85,74,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1001,
            boxSizing: "border-box",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            style={{
              ...cardStyle,
              maxWidth: 380,
              width: "100%",
              border: BORDERS.danger,
              boxShadow: SHADOWS.danger,
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
              <IconAlertTriangle size={26} color={CL.danger} />
            </div>
            <div
              style={{
                fontSize: FONT.subhead,
                color: CL.text,
                lineHeight: 1.7,
                marginBottom: 20,
                wordBreak: "break-word",
                textAlign: "center",
              }}
            >
              {dangerState.message}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => {
                  const fn = dangerState.onConfirm;
                  closeDangerConfirm();
                  fn();
                }}
                disabled={dangerCountdown > 0}
                style={{
                  ...btn0,
                  background: dangerCountdown > 0 ? CL.borderFaint : CL.dangerDim,
                  border: dangerCountdown > 0 ? BORDERS.default : BORDERS.danger,
                  borderRadius: RADIUS.md,
                  padding: isMobile ? "13px 16px" : "10px 16px",
                  color: dangerCountdown > 0 ? CL.textMuted : CL.danger,
                  fontSize: FONT.body,
                  fontWeight: 700,
                  cursor: dangerCountdown > 0 ? "not-allowed" : "pointer",
                  minHeight: isMobile ? 48 : "auto",
                  opacity: dangerCountdown > 0 ? 0.7 : 1,
                  transition: TRANSITIONS.colorChange,
                }}
              >
                {s.dangerConfirmBtn(dangerCountdown)}
              </button>
              <button
                onClick={closeDangerConfirm}
                style={{
                  ...btn0,
                  background: CL.borderFaint,
                  border: BORDERS.default,
                  borderRadius: RADIUS.md,
                  padding: isMobile ? "13px 16px" : "10px 16px",
                  color: CL.textSub,
                  fontSize: FONT.body,
                  fontWeight: 700,
                  minHeight: isMobile ? 48 : "auto",
                }}
              >
                {s.confirmNo}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
