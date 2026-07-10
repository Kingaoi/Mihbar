import { useMemo } from "react";
import {
  IconSprout,
  IconCopy,
  IconLink,
  IconReply,
  IconTrash,
  IconPencil,
  IconSettings,
} from "./Icons";
import { ANIMATIONS } from "../constants/index";

export default function Toast({ toast, CL, isMobile, s, lang }) {
  const toastInfo = useMemo(() => {
    if (!toast) return null;
    const isCopy = toast === s.toastCopied;
    const isShare = toast === s.toastShared;
    const isPost = toast === s.toastPosted;
    const isReply = toast === s.toastReplied;
    const isDeleted = toast === s.toastDeleted || toast === s.toastCommentDeleted || toast === s.toastReplyDeleted;
    const isEdited = toast === s.toastEdited || toast === s.toastCommentEdited || toast === s.toastReplyEdited;

    if (isCopy || isShare || isPost || isReply) {
      return {
        label: lang === "ar" ? "تم بنجاح" : "SUCCESS",
        color: isCopy ? CL.accent : CL.ok,
        bgColor: isCopy ? CL.accentDim : CL.okDim,
        icon: isCopy ? <IconCopy size={13} color={CL.accent} /> : 
              isShare ? <IconLink size={13} color={CL.ok} /> : 
              isReply ? <IconReply size={13} color={CL.ok} /> : 
              <IconSprout size={14} color={CL.ok} />
      };
    }
    if (isDeleted) {
      return {
        label: lang === "ar" ? "تم الحذف" : "DELETED",
        color: CL.danger,
        bgColor: CL.dangerDim,
        icon: <IconTrash size={13} color={CL.danger} />
      };
    }
    if (isEdited) {
      return {
        label: lang === "ar" ? "تحديث" : "UPDATE",
        color: CL.ok,
        bgColor: CL.okDim,
        icon: <IconPencil size={13} color={CL.ok} />
      };
    }
    // Default fallback (e.g., cleared, purge settings)
    return {
      label: lang === "ar" ? "تحديث" : "UPDATE",
      color: CL.ok,
      bgColor: CL.okDim,
      icon: <IconSettings size={13} color={CL.ok} />
    };
  }, [toast, s, lang, CL]);

  if (!toast || !toastInfo) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: isMobile ? 32 : 40,
        left: "50%",
        transform: "translate(-50%, 0)",
        zIndex: 10000,
        background: CL.surface === "#FFFFFF" 
          ? "rgba(255, 255, 255, 0.94)" 
          : "rgba(37, 33, 28, 0.94)",
        backdropFilter: "blur(14px) saturate(180%)",
        WebkitBackdropFilter: "blur(14px) saturate(180%)",
        border: `1px solid ${CL.accentBorder}`,
        borderRadius: 30,
        padding: "10px 20px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        maxWidth: "92%",
        width: "max-content",
        animation: ANIMATIONS.toastSlideUp,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: toastInfo.bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {toastInfo.icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ 
          color: toastInfo.color, 
          fontWeight: 800, 
          fontSize: 11, 
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          lineHeight: 1.2,
          textAlign: s.d === "rtl" ? "right" : "left",
        }}>
          {toastInfo.label}
        </div>
        <div style={{ 
          color: CL.text, 
          fontSize: 13, 
          fontWeight: 500,
          lineHeight: 1.3,
          marginTop: 1,
          textAlign: s.d === "rtl" ? "right" : "left",
        }}>
          {toast}
        </div>
      </div>
      <div style={{ display: "flex", marginLeft: s.d === "rtl" ? 0 : 4, marginRight: s.d === "rtl" ? 4 : 0 }}>
        <IconSprout size={13} color={toastInfo.color} />
      </div>
    </div>
  );
}
