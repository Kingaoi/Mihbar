import { useState, useRef } from "react";
import { IconArrowRight, IconUpload } from "./Icons";
import { FONT, RADIUS } from "../constants/index";
import { readMdFile, isSpamQuality } from "../utils/index";
import WritePane from "./md_editor/WritePane";
import PreviewPane from "./md_editor/PreviewPane";

export default function MdEditorPage({
  mdEditorState,
  closeMdEditor,
  saveMdEditor,
  CL,
  BORDERS,
  isMobile,
  R,
  s,
  inputBase,
  btn0
}) {
  const [name, setName] = useState(mdEditorState.file.name || "");
  const [content, setContent] = useState(mdEditorState.file.content || "");
  const [mobileTab, setMobileTab] = useState("write"); // "write" | "preview"
  const [error, setError] = useState("");
  const taRef = useRef(undefined);
  const uploadRef = useRef(undefined);

  const wrapSelection = (before, after = "", placeholder = "") => {
    const ta = taRef.current;
    if (!ta) {
      setContent((c) => c + before + placeholder + after);
      return;
    }
    const start = ta.selectionStart,
      end = ta.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next =
      content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = start + before.length + selected.length + after.length;
      ta.setSelectionRange(cursor, cursor);
    });
  };

  const prefixLines = (prefix) => {
    const ta = taRef.current;
    if (!ta) {
      setContent((c) => c + prefix);
      return;
    }
    const start = ta.selectionStart,
      end = ta.selectionEnd;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const before = content.slice(0, lineStart);
    const target = content.slice(lineStart, end) || "";
    const withPrefix = (target || "\u200b")
      .split("\n")
      .map((l) => prefix + l)
      .join("\n");
    const next = before + withPrefix + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
    });
  };

  const handleUploadFile = (file) => {
    setError("");
    readMdFile(
      file,
      ({ name: fn, content: fc }) => {
        setName(fn);
        setContent(fc);
      },
      (errType) => {
        if (errType === "too_large") {
          setError(s.mdTooLarge);
        } else if (errType === "spam") {
          setError(s.spamQuality);
        }
      }
    );
  };

  const handleSave = () => {
    if (isSpamQuality(content)) {
      setError(s.spamQuality);
      return;
    }
    saveMdEditor({ name: (name || "").trim() || "note.md", content });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: CL.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
          padding: isMobile ? "12px 14px" : "14px 20px",
          borderBottom: BORDERS.default,
          background: CL.surface,
        }}
      >
        <button
          onClick={closeMdEditor}
          style={{
            ...btn0,
            color: CL.textSub,
            padding: "4px 8px",
            minHeight: isMobile ? 40 : "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: RADIUS.sm,
          }}
        >
          <span style={{ display: "flex", transform: s.d === "rtl" ? "none" : "scaleX(-1)" }}>
            <IconArrowRight size={17} color={CL.textSub} />
          </span>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: FONT.body, fontWeight: 700, color: CL.text }}>
            {s.mdEditorTitle}
          </div>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={s.mdFileNamePh}
          dir="auto"
          style={{
            ...inputBase,
            width: isMobile ? 110 : 180,
            fontSize: FONT.caption,
            padding: "7px 10px",
            flexShrink: 0,
          }}
        />
      </div>

      {error && (
        <div
          style={{
            background: CL.dangerDim,
            borderBottom: BORDERS.danger,
            color: CL.danger,
            padding: "8px 14px",
            fontSize: FONT.caption,
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            style={{ ...btn0, background: "transparent", border: "none", color: CL.danger, padding: "0 4px", fontSize: 16, cursor: "pointer" }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── Toolbar row 2: استيراد من الجهاز + تبويب موبايل */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
          padding: isMobile ? "8px 14px" : "10px 20px",
          borderBottom: BORDERS.default,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => uploadRef.current?.click()}
          style={{
            ...btn0,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: CL.borderFaint,
            border: BORDERS.default,
            borderRadius: RADIUS.pill,
            padding: "6px 12px",
            color: CL.textSub,
            fontSize: FONT.caption,
            fontWeight: 700,
            minHeight: isMobile ? 36 : "auto",
          }}
        >
          <IconUpload size={13} color={CL.textSub} /> {s.mdEditorUpload}
        </button>
        <input
          ref={uploadRef}
          type="file"
          accept=".md"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files[0]) handleUploadFile(e.target.files[0]);
            e.target.value = "";
          }}
        />

        {isMobile && (
          <div
            style={{
              display: "flex",
              gap: 4,
              marginInlineStart: "auto",
              background: CL.surface,
              borderRadius: RADIUS.md,
              padding: 3,
              border: BORDERS.default,
            }}
          >
            {[
              { k: "write", label: s.mdEditorTabWrite },
              { k: "preview", label: s.mdEditorTabPreview },
            ].map((tb) => (
              <button
                key={tb.k}
                onClick={() => setMobileTab(tb.k)}
                style={{
                  ...btn0,
                  padding: "6px 14px",
                  borderRadius: RADIUS.sm,
                  background: mobileTab === tb.k ? CL.accentDim : "transparent",
                  border:
                    mobileTab === tb.k
                      ? `1px solid ${CL.accentBorder}`
                      : "1px solid transparent",
                  color: mobileTab === tb.k ? CL.accent : CL.textMuted,
                  fontSize: FONT.caption,
                  fontWeight: 700,
                  minHeight: 32,
                }}
              >
                {tb.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Body: split ثابت بالديسكتوب / تبويب واحد بالموبايل */}
      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {isMobile ? (
          mobileTab === "write" ? (
            <WritePane
              taRef={taRef}
              content={content}
              setContent={setContent}
              s={s}
              R={R}
              CL={CL}
              BORDERS={BORDERS}
              isMobile={isMobile}
              btn0={btn0}
              wrapSelection={wrapSelection}
              prefixLines={prefixLines}
            />
          ) : (
            <PreviewPane
              content={content}
              isMobile={isMobile}
              CL={CL}
              s={s}
            />
          )
        ) : (
          <>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                borderInlineEnd: BORDERS.default,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <WritePane
                taRef={taRef}
                content={content}
                setContent={setContent}
                s={s}
                R={R}
                CL={CL}
                BORDERS={BORDERS}
                isMobile={isMobile}
                btn0={btn0}
                wrapSelection={wrapSelection}
                prefixLines={prefixLines}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <PreviewPane
                content={content}
                isMobile={isMobile}
                CL={CL}
                s={s}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Footer actions */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          flexShrink: 0,
          padding: isMobile ? "12px 14px" : "12px 20px",
          borderTop: BORDERS.default,
          background: CL.surface,
        }}
      >
        <button
          onClick={closeMdEditor}
          style={{
            ...btn0,
            background: CL.borderFaint,
            border: BORDERS.default,
            borderRadius: RADIUS.md,
            padding: isMobile ? "11px 18px" : "9px 18px",
            color: CL.textSub,
            fontSize: FONT.body,
            fontWeight: 700,
            minHeight: isMobile ? 44 : "auto",
          }}
        >
          {s.mdEditorCancel}
        </button>
        <button
          onClick={handleSave}
          style={{
            ...btn0,
            background: `linear-gradient(135deg,${CL.edit} 0%,#5475A8 100%)`,
            border: "none",
            borderRadius: RADIUS.md,
            padding: isMobile ? "11px 18px" : "9px 18px",
            color: "#fff",
            fontSize: FONT.body,
            fontWeight: 700,
            minHeight: isMobile ? 44 : "auto",
          }}
        >
          {s.mdEditorSave}
        </button>
      </div>
    </div>
  );
}
