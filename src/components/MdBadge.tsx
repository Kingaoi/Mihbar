import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { IconFileText, IconX, IconCopy, IconDownload } from "./Icons";
import { FONT, RADIUS } from "../constants/index";
import { renderMarkdown } from "../utils/index";


export function MdBadge({
  file,
  CL,
  BORDERS,
  isMobile,
  s,
  btn0
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // ملاحظة (Next.js migration): Vite كان يضع React داخل <div id="root">
    // (معرَّف في index.html)، بينما Next.js يضع React مباشرة داخل <body>
    // بدون أي عنصر "root" وسيط — لذلك getElementById("root") كان يُرجع
    // دائمًا null هنا بصمت (لا خطأ ظاهر، فقط تعطُّل صامت لميزة منع تحديد
    // النص خلف المودال). document.body هو الجذر الفعلي المكافئ في Next.js.
    if (isOpen) {
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
    } else {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    }
    return () => {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        const renderScope = document.querySelector(".md-render-scope");
        if (renderScope) {
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(renderScope);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    let sanitizedName = file.name ? file.name.trim() : "";
    if (!sanitizedName) {
      sanitizedName = "attachment.md";
    }
    if (!sanitizedName.toLowerCase().endsWith(".md")) {
      sanitizedName += ".md";
    }

    const blob = new window.Blob([file.content], { type: "text/markdown;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sanitizedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const isAr = s.d === "rtl";
  const strCopy = isAr ? "نسخ المصدر" : "Copy Source";
  const strDownload = isAr ? "تنزيل" : "Download";
  const strCopied = isAr ? "تم النسخ ✓" : "Copied ✓";

  const modalStyle: CSSProperties = {
    background: CL.surface,
    border: BORDERS.default,
    borderRadius: isMobile ? 14 : 18,
    padding: isMobile ? "20px" : "24px",
    maxWidth: 640,
    width: "100%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    position: "relative",
    maxHeight: "85vh",
    userSelect: "none",
    WebkitUserSelect: "none",
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        style={{
          ...btn0,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: CL.editDim,
          border: BORDERS.edit,
          borderRadius: RADIUS.sm,
          padding: "4px 10px",
          fontSize: FONT.caption,
          color: CL.edit,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minHeight: isMobile ? 32 : "auto",
        }}
      >
        <IconFileText size={12} color={CL.edit} />
        {s.attachedFile(file.name)} ▼
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
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
                zIndex: 2000,
                boxSizing: "border-box",
              }}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                style={modalStyle}
              >
            {/* Header with Title and close button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: FONT.subhead,
                  fontWeight: 700,
                  color: CL.accent,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <IconFileText size={16} color={CL.accent} />
                {file.name || (isAr ? "مرفق Markdown" : "Markdown Attachment")}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                aria-label="Close"
                style={{
                  ...btn0,
                  background: "transparent",
                  border: "none",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: CL.textSub,
                  borderRadius: RADIUS.sm,
                }}
              >
                <IconX size={18} color={CL.textSub} />
              </button>
            </div>

            {/* Scrollable Markdown render area */}
            <div
              className="md-render-scope"
              style={{
                background: CL.borderFaint,
                border: BORDERS.default,
                borderRadius: RADIUS.md,
                padding: "16px",
                overflowY: "auto",
                fontSize: FONT.body,
                wordBreak: "break-word",
                flex: "1 1 auto",
                minHeight: 0,
                marginBottom: 18,
                textAlign: isAr ? "right" : "left",
                direction: isAr ? "rtl" : "ltr",
                userSelect: "text",
                WebkitUserSelect: "text",
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(file.content) }}
            />

            {/* Fixed footer buttons */}
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                width: "100%",
                flexShrink: 0,
              }}
            >
              <button
                onClick={handleCopy}
                style={{
                  ...btn0,
                  background: copied ? CL.okDim : CL.editDim,
                  border: copied ? BORDERS.ok : BORDERS.edit,
                  borderRadius: RADIUS.md,
                  padding: isMobile ? "11px 16px" : "8px 16px",
                  color: copied ? CL.ok : CL.edit,
                  fontSize: FONT.body,
                  fontWeight: 700,
                  minHeight: isMobile ? 44 : "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <IconCopy size={14} color={copied ? CL.ok : CL.edit} />
                {copied ? strCopied : strCopy}
              </button>
              <button
                onClick={handleDownload}
                style={{
                  ...btn0,
                  background: CL.accentDim,
                  border: BORDERS.accent,
                  borderRadius: RADIUS.md,
                  padding: isMobile ? "11px 16px" : "8px 16px",
                  color: CL.accent,
                  fontSize: FONT.body,
                  fontWeight: 700,
                  minHeight: isMobile ? 44 : "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <IconDownload size={14} color={CL.accent} />
                {strDownload}
              </button>
            </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

