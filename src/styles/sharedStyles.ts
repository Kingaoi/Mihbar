import { TRANSITIONS, RADIUS, OUTLINE_NONE } from "../constants/index";

export function getSharedStyles({ s, CL, BORDERS, R, isMobile }) {
  const btn0 = {
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    cursor: "pointer",
    fontFamily: s.font,
    transition: TRANSITIONS.colorChangeExtended,
    borderRadius: RADIUS.md, // Default inherited rounded corners
  };

  const cardStyle = {
    background: CL.surface,
    border: BORDERS.default,
    borderRadius: isMobile ? 14 : 18,
    padding: R.cardPad,
  };

  const inputBase = {
    background: "rgba(0,0,0,0.15)",
    border: BORDERS.default,
    borderRadius: RADIUS.sm,
    color: CL.text,
    fontSize: R.inputFont,
    fontFamily: s.font,
    boxSizing: "border-box",
    padding: "10px 12px",
    outline: OUTLINE_NONE,
    WebkitAppearance: "none",
  };

  const btnPrimary = {
    ...btn0,
    background: `linear-gradient(135deg,${CL.edit} 0%,#5475A8 100%)`,
    border: "none",
    padding: "8px 14px",
    color: "#fff",
    fontSize: R.btnFont,
    fontWeight: 700,
    minHeight: R.touchH,
  };

  const btnSecondary = {
    ...btn0,
    background: CL.borderFaint,
    border: BORDERS.default,
    padding: "8px 12px",
    color: CL.textSub,
    fontSize: R.btnFont,
    fontWeight: 700,
    minHeight: R.touchH,
  };

  return {
    btn0,
    cardStyle,
    inputBase,
    btnPrimary,
    btnSecondary,
  };
}

export default getSharedStyles;
