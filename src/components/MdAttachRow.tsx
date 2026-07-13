import { useState } from "react";
import { IconFileText, IconPaperclip } from "./Icons";
import { FONT, RADIUS } from "../constants/index";



export function MdAttachRow({
  target,
  file,
  onRemove,
  openMdEditor,
  videoUrl = "",
  setVideoUrl = (_url: string) => {},
  CL,
  BORDERS,
  isMobile,
  s,
  btn0
}) {
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [tempUrl, setTempUrl] = useState("");
  const [videoUrlError, setVideoUrlError] = useState(false);

  // إصلاح: كانت handleAttachVideo تقبل أي نص كرابط فيديو بدون أي تحقق من
  // الصيغة (لا حتى التأكد من وجود http(s)://). النتيجة: مستخدم يكتب نصًا
  // خاطئًا يحصل على مرفق "فيديو" لا يعمل بصمت (VideoPlayer لاحقًا يضعه
  // كـ src مباشرة بلا رسالة خطأ واضحة). تحقق بسيط هنا يمنع الحالة الشائعة
  // (نسيان النسخ الكامل للرابط، أو كتابة نص عشوائي) برسالة فورية.
  const handleAttachVideo = () => {
    const trimmed = tempUrl.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      setVideoUrlError(true);
      return;
    }
    setVideoUrlError(false);
    setVideoUrl(trimmed);
    setShowVideoInput(false);
  };

  const handleRemoveVideo = () => {
    setVideoUrl("");
    setTempUrl("");
    setVideoUrlError(false);
  };

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {/* MD Attachment */}
        <button
          onClick={() => openMdEditor(target, file)}
          style={{
            ...btn0,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: CL.editDim,
            border: BORDERS.edit,
            borderRadius: RADIUS.md,
            padding: "6px 10px",
            color: CL.edit,
            fontSize: FONT.caption,
            fontWeight: 700,
            minHeight: isMobile ? 36 : "auto",
          }}
        >
          <IconPaperclip size={12} color={CL.edit} />
          {file ? s.mdEditorEditing(file.name || "") : s.attachMd}
        </button>
        {file && (
          <>
            <span
              style={{
                background: CL.editDim,
                border: BORDERS.edit,
                borderRadius: RADIUS.sm,
                padding: "4px 8px",
                fontSize: FONT.caption,
                color: CL.edit,
                maxWidth: isMobile ? 100 : 160,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <IconFileText size={11} color={CL.edit} />
              {s.attachedFile(file.name)}
            </span>
            <button
              onClick={onRemove}
              style={{
                ...btn0,
                background: "transparent",
                border: BORDERS.danger,
                borderRadius: RADIUS.sm,
                padding: "4px 8px",
                color: CL.danger,
                fontSize: FONT.caption,
                minHeight: isMobile ? 32 : "auto",
              }}
            >
              {s.removeFile}
            </button>
          </>
        )}

        {/* Video Attachment separator */}
        <div style={{ width: 1, height: 16, background: CL.border, margin: "0 2px" }} />

        {/* Video Attachment */}
        {!videoUrl ? (
          !showVideoInput ? (
            <button
              onClick={() => {
                setShowVideoInput(true);
                setTempUrl("");
                setVideoUrlError(false);
              }}
              style={{
                ...btn0,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: CL.okDim || "rgba(100, 180, 100, 0.1)",
                border: BORDERS.ok || `1px solid ${CL.ok}`,
                borderRadius: RADIUS.md,
                padding: "6px 10px",
                color: CL.ok || "#4CAF50",
                fontSize: FONT.caption,
                fontWeight: 700,
                minHeight: isMobile ? 36 : "auto",
              }}
            >
              <span style={{ display: "flex" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 8-6 4 6 4V8Z" />
                  <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                </svg>
              </span>
              {s.attachVideo}
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "nowrap" }}>
                <input
                  type="text"
                  placeholder={s.videoUrlPh}
                  value={tempUrl}
                  onChange={(e) => {
                    setTempUrl(e.target.value);
                    if (videoUrlError) setVideoUrlError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAttachVideo();
                    } else if (e.key === "Escape") {
                      setShowVideoInput(false);
                    }
                  }}
                  style={{
                    background: CL.borderFaint,
                    border: `1px solid ${videoUrlError ? CL.danger : CL.border}`,
                    borderRadius: RADIUS.sm,
                    padding: "4px 8px",
                    fontSize: FONT.caption,
                    color: CL.text,
                    outline: "none",
                    width: isMobile ? "150px" : "240px",
                  }}
                  autoFocus
                />
                <button
                  onClick={handleAttachVideo}
                  disabled={!tempUrl.trim()}
                  style={{
                    ...btn0,
                    background: tempUrl.trim() ? CL.accent : CL.accentDim,
                    border: "none",
                    borderRadius: RADIUS.sm,
                    padding: "4px 8px",
                    color: "#fff",
                    fontSize: FONT.caption,
                    fontWeight: "bold",
                    minHeight: isMobile ? 28 : "auto",
                  }}
                >
                  {s.confirmAttachVideo || (s.d === "rtl" ? "إرفاق" : "Attach")}
                </button>
                <button
                  onClick={() => setShowVideoInput(false)}
                  style={{
                    ...btn0,
                    background: "transparent",
                    border: `1px solid ${CL.border}`,
                    borderRadius: RADIUS.sm,
                    padding: "4px 8px",
                    color: CL.textSub,
                    fontSize: FONT.caption,
                    minHeight: isMobile ? 28 : "auto",
                  }}
                >
                  {s.cancelVideo || (s.d === "rtl" ? "إلغاء" : "Cancel")}
                </button>
              </div>
              {videoUrlError && (
                <span style={{ fontSize: FONT.micro, color: CL.danger }}>
                  {s.d === "rtl" ? "الرابط يجب أن يبدأ بـ http:// أو https://" : "Link must start with http:// or https://"}
                </span>
              )}
            </div>
          )
        ) : (
          <>
            <span
              style={{
                background: CL.okDim || "rgba(100, 180, 100, 0.1)",
                border: BORDERS.ok || `1px solid ${CL.ok}`,
                borderRadius: RADIUS.sm,
                padding: "4px 8px",
                fontSize: FONT.caption,
                color: CL.ok || "#4CAF50",
                maxWidth: isMobile ? 120 : 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
              title={videoUrl}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m22 8-6 4 6 4V8Z" />
                <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
              </svg>
              {s.videoAttached}
            </span>
            <button
              onClick={handleRemoveVideo}
              style={{
                ...btn0,
                background: "transparent",
                border: BORDERS.danger,
                borderRadius: RADIUS.sm,
                padding: "4px 8px",
                color: CL.danger,
                fontSize: FONT.caption,
                minHeight: isMobile ? 32 : "auto",
              }}
            >
              {s.removeVideo}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
