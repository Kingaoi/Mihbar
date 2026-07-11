import { IconUser, IconArrowRight } from "../Icons";
import { FONT, RADIUS } from "../../constants/index";

// نقطة دخول لصفحة الحساب (بوابة تسجيل الدخول/إنشاء حساب) من داخل
// الإعدادات — نفس نمط LegalSection.tsx تمامًا للاتساق البصري.
export default function AccountSection({ CL, BORDERS, isMobile, s, btn0, setAuthPageOpen }) {
  return (
    <>
      <div style={{ fontSize: FONT.caption, color: CL.textMuted, fontWeight: 700, marginBottom: 8 }}>
        {s.settingsAccountTitle}
      </div>
      <div style={{ marginBottom: 22 }}>
        <button
          onClick={() => setAuthPageOpen(true)}
          className="pressable"
          style={{
            ...btn0,
            width: "100%",
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
            <IconUser size={14} color={CL.textSub} /> {s.settingsAccountRow}
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
      </div>
    </>
  );
}
