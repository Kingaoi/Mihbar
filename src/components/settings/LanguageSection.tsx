import { FONT, RADIUS, TRANSITIONS } from "../../constants/index";
import { saveLangPreference } from "../../utils/dataLayer";

export default function LanguageSection({ lang, setLang, CL, BORDERS, isMobile, s, btn0 }) {
  return (
    <>
      <div style={{ fontSize: FONT.caption, color: CL.textMuted, fontWeight: 700, marginBottom: 8 }}>
        {s.settingsLang}
      </div>
      <div
        style={{
          display: "flex",
          gap: 5,
          background: CL.surface,
          borderRadius: RADIUS.lg,
          padding: 4,
          marginBottom: 22,
          border: BORDERS.default,
          direction: "ltr",
        }}
      >
        <button
          onClick={() => {
            setLang("ar");
            saveLangPreference("ar").catch(() => {});
          }}
          className="pressable"
          style={{
            ...btn0,
            flex: 1,
            padding: isMobile ? "11px 8px" : "9px 12px",
            borderRadius: RADIUS.md,
            background: lang === "ar" ? CL.accentDim : "transparent",
            border: lang === "ar" ? `1px solid ${CL.accentBorder}` : "1px solid transparent",
            color: lang === "ar" ? CL.accent : CL.textMuted,
            fontSize: FONT.bodyLg,
            fontWeight: 700,
            minHeight: isMobile ? 44 : "auto",
            transition: TRANSITIONS.colorChange,
          }}
        >
          العربية
        </button>
        <button
          onClick={() => {
            setLang("en");
            saveLangPreference("en").catch(() => {});
          }}
          className="pressable"
          style={{
            ...btn0,
            flex: 1,
            padding: isMobile ? "11px 8px" : "9px 12px",
            borderRadius: RADIUS.md,
            background: lang === "en" ? CL.accentDim : "transparent",
            border: lang === "en" ? `1px solid ${CL.accentBorder}` : "1px solid transparent",
            color: lang === "en" ? CL.accent : CL.textMuted,
            fontSize: FONT.bodyLg,
            fontWeight: 700,
            minHeight: isMobile ? 44 : "auto",
            transition: TRANSITIONS.colorChange,
          }}
        >
          English
        </button>
      </div>
    </>
  );
}
