import { IconQuote, IconLink, IconImage } from "../Icons";
import type { CSSProperties } from "react";
import { RADIUS } from "../../constants/index";

export default function EditorToolbar({
  s,
  CL,
  BORDERS,
  isMobile,
  btn0,
  wrapSelection,
  prefixLines,
  setContent,
}) {
  const tools = [
    { icon: "𝐁", label: s.mdToolBold, action: () => wrapSelection("**", "**", "نص عريض") },
    { icon: "<i>I</i>", label: s.mdToolItalic, action: () => wrapSelection("*", "*", "نص مائل") },
    { icon: "S̶", label: s.mdToolStrike, action: () => wrapSelection("~~", "~~", "نص") },
    { icon: "H1", label: s.mdToolH1, action: () => prefixLines("# ") },
    { icon: "H2", label: s.mdToolH2, action: () => prefixLines("## ") },
    { icon: <IconQuote size={13} color={CL.text} />, label: s.mdToolQuote, action: () => prefixLines("> ") },
    { icon: "•", label: s.mdToolUl, action: () => prefixLines("- ") },
    { icon: "1.", label: s.mdToolOl, action: () => prefixLines("1. ") },
    { icon: "</>", label: s.mdToolCode, action: () => wrapSelection("`", "`", "code") },
    { icon: "{ }", label: s.mdToolCodeBlock, action: () => wrapSelection("```\n", "\n```", "") },
    {
      icon: <IconLink size={13} color={CL.text} />,
      label: s.mdToolLink,
      action: () => wrapSelection("[", "](https://)", "نص الرابط"),
    },
    {
      icon: <IconImage size={13} color={CL.text} />,
      label: s.mdToolImage,
      action: () => wrapSelection("![", "](https://)", "وصف الصورة"),
    },
    {
      icon: "—",
      label: s.mdToolHr,
      action: () =>
        setContent(
          (c) => c + (c.endsWith("\n") || !c ? "" : "\n") + "\n---\n"
        ),
    },
  ];

  const toolbarBtnStyle: CSSProperties = {
    ...btn0,
    minWidth: isMobile ? 38 : 34,
    height: isMobile ? 38 : 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: CL.borderFaint,
    border: BORDERS.default,
    borderRadius: RADIUS.sm,
    color: CL.text,
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        padding: "8px 10px",
        overflowX: "auto",
        borderBottom: BORDERS.default,
        flexShrink: 0,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {tools.map((t) => (
        <button
          key={t.label}
          type="button"
          title={t.label}
          onClick={t.action}
          style={toolbarBtnStyle}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
