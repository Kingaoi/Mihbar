import EditorToolbar from "./EditorToolbar";

export default function WritePane({
  taRef,
  content,
  setContent,
  s,
  R,
  CL,
  BORDERS,
  isMobile,
  btn0,
  wrapSelection,
  prefixLines,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <EditorToolbar
        s={s}
        CL={CL}
        BORDERS={BORDERS}
        isMobile={isMobile}
        btn0={btn0}
        wrapSelection={wrapSelection}
        prefixLines={prefixLines}
        setContent={setContent}
      />
      <textarea
        ref={taRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={s.mdEditorPlaceholder}
        dir="auto"
        style={{
          flex: 1,
          width: "100%",
          border: "none",
          outline: "none",
          resize: "none",
          padding: isMobile ? "14px" : "16px 20px",
          fontSize: R.textareaFont,
          lineHeight: 1.7,
          fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace",
          background: "transparent",
          color: CL.text,
          boxSizing: "border-box",
          minHeight: 0,
        }}
      />
    </div>
  );
}
