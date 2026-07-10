import { motion, AnimatePresence } from "motion/react";
import { IconCopy, IconLink, IconPencil, IconTrash, IconBookmark } from "./Icons";
import { FONT, RADIUS, SHADOWS } from "../constants/index";

export default function ActionMenuButton({
  menuKey,
  text,
  url,
  isOwner,
  onEdit,
  onDelete,
  openMenuFor,
  setOpenMenuFor,
  copyItemText,
  shareItemText,
  onSave = undefined,
  isSaved = false,
  CL,
  BORDERS,
  isMobile,
  s,
  btn0
}) {
  const isOpen = openMenuFor === menuKey;

  return (
    <div data-action-menu style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpenMenuFor(isOpen ? null : menuKey)}
        aria-label={s.actionMenuLabel}
        style={{
          ...btn0,
          background: "none",
          border: "none",
          color: CL.textMuted,
          fontSize: FONT.subhead,
          fontWeight: 800,
          lineHeight: 1,
          padding: isMobile ? "4px 8px" : "2px 6px",
          minHeight: isMobile ? 32 : "auto",
          borderRadius: RADIUS.sm,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ⋯
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              [s.d === "rtl" ? "left" : "right"]: 0,
              background: CL.surface,
              border: BORDERS.default,
              borderRadius: RADIUS.md,
              boxShadow: SHADOWS.modal,
              zIndex: 1051,
              minWidth: 150,
              padding: 4,
            }}
          >
          {onSave && (
            <button
              onClick={() => {
                onSave();
                setOpenMenuFor(null);
              }}
              style={{
                ...btn0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                textAlign: s.d === "rtl" ? "right" : "left",
                background: "none",
                border: "none",
                padding: "10px 14px",
                color: isSaved ? CL.accent : CL.text,
                fontSize: FONT.body,
                fontWeight: 600,
                borderRadius: RADIUS.sm,
              }}
            >
              <IconBookmark size={14} color={isSaved ? CL.accent : CL.text} /> {isSaved ? (s.d === "rtl" ? "إلغاء الحفظ" : "Unsave") : (s.d === "rtl" ? "حفظ المنشور" : "Save Post")}
            </button>
          )}
          <button
            onClick={() => {
              copyItemText(text, url);
              setOpenMenuFor(null);
            }}
            style={{
              ...btn0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              textAlign: s.d === "rtl" ? "right" : "left",
              background: "none",
              border: "none",
              padding: "10px 14px",
              color: CL.text,
              fontSize: FONT.body,
              fontWeight: 600,
              borderRadius: RADIUS.sm,
            }}
          >
            <IconCopy size = { 14 } color = { CL.text } /> { s.actionCopy }
          </button>
          <button
            onClick={() => {
              shareItemText(text, url);
              setOpenMenuFor(null);
            }}
            style={{
              ...btn0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              textAlign: s.d === "rtl" ? "right" : "left",
              background: "none",
              border: "none",
              padding: "10px 14px",
              color: CL.text,
              fontSize: FONT.body,
              fontWeight: 600,
              borderRadius: RADIUS.sm,
            }}
          >
            <IconLink size = { 14 } color = { CL.text } /> { s.actionShare }
          </button>
          {isOwner && (
            <>
              <div style={{ height: 1, background: CL.border, margin: "4px 0" }} />
              <button
                onClick={() => {
                  onEdit();
                  setOpenMenuFor(null);
                }}
                style={{
                  ...btn0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  textAlign: s.d === "rtl" ? "right" : "left",
                  background: "none",
                  border: "none",
                  padding: "10px 14px",
                  color: CL.edit,
                  fontSize: FONT.body,
                  fontWeight: 600,
                  borderRadius: RADIUS.sm,
                }}
              >
                <IconPencil size = { 13 } color = { CL.edit } /> { s.actionEdit }
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setOpenMenuFor(null);
                }}
                style={{
                  ...btn0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  textAlign: s.d === "rtl" ? "right" : "left",
                  background: "none",
                  border: "none",
                  padding: "10px 14px",
                  color: CL.danger,
                  fontSize: FONT.body,
                  fontWeight: 600,
                  borderRadius: RADIUS.sm,
                }}
              >
                <IconTrash size = { 13 } color = { CL.danger } /> { s.actionDelete }
              </button>
            </>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
