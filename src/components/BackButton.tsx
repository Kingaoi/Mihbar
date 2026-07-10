import { IconArrowRight } from "./Icons";
import { FONT, RADIUS } from "../constants/index";

export default function BackButton({ onClick, label, CL, BORDERS, isMobile, s, btn0 }) {
  return (
    <button
      onClick={onClick}
      className="pressable"
      data-pressable="btn"
      style={{
        ...btn0,
        background: CL.surface,
        border: BORDERS.default,
        borderRadius: RADIUS.lg,
        padding: isMobile ? "11px 16px" : "8px 14px",
        color: CL.accent,
        fontSize: FONT.body,
        fontWeight: 700,
        minHeight: isMobile ? 44 : "auto",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        style={{
          lineHeight: 1,
          display: "flex",
          transform: s.d === "rtl" ? "none" : "scaleX(-1)",
        }}
      >
        <IconArrowRight size={16} color={ CL.accent } />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}
