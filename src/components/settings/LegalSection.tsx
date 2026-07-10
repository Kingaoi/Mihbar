import { IconLock, IconFileText, IconMail, IconArrowRight } from "../Icons";
import { FONT, RADIUS } from "../../constants/index";

export default function LegalSection({ CL, BORDERS, isMobile, s, btn0 }) {
  return (
    <>
      <div style={{ fontSize: FONT.caption, color: CL.textMuted, fontWeight: 700, marginBottom: 8 }}>
        {s.settingsLegalTitle}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
        {[
          { label: s.privacyPolicy, IconEl: IconLock },
          { label: s.termsConditions, IconEl: IconFileText },
          { label: s.contactUs, IconEl: IconMail },
        ].map((item) => (
          <button
            key={item.label}
            className="pressable"
            style={{
              ...btn0,
              textAlign: s.d === "rtl" ? "right" : "left",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: CL.borderFaint,
              border: BORDERS.default,
              borderRadius: RADIUS.md,
              padding: isMobile ? "13px 14px" : "11px 14px",
              color: CL.textSub,
              fontSize: FONT.body,
              fontWeight: 700,
              minHeight: isMobile ? 46 : "auto",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <item.IconEl size={14} color={CL.textSub} /> {item.label}
            </span>
            <span
              style={{
                display: "flex",
                color: CL.textMuted,
                transform: s.d === "rtl" ? "none" : "scaleX(-1)",
              }}
            >
              <IconArrowRight size={13} color={CL.textMuted} />
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
