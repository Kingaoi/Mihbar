import { IconSun, IconMonitor, IconMoon } from "../Icons";
import { FONT, RADIUS, TRANSITIONS } from "../../constants/index";
import { saveThemePreference } from "../../utils/dataLayer";

export default function ThemeSection({ themePref, setThemePref, CL, BORDERS, isMobile, s, btn0 }) {
  return (
    <>
      <div style={{ fontSize: FONT.caption, color: CL.textMuted, fontWeight: 700, marginBottom: 8 }}>
        {s.settingsTheme}
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
            setThemePref("light");
            saveThemePreference("light").catch(() => {});
          }}
          className="pressable"
          style={{
            ...btn0,
            flex: 1,
            padding: isMobile ? "11px 8px" : "9px 12px",
            borderRadius: RADIUS.md,
            background: themePref === "light" ? CL.accentDim : "transparent",
            border: themePref === "light" ? `1px solid ${CL.accentBorder}` : "1px solid transparent",
            color: themePref === "light" ? CL.accent : CL.textMuted,
            fontSize: FONT.bodyLg,
            fontWeight: 700,
            minHeight: isMobile ? 44 : "auto",
            transition: TRANSITIONS.colorChange,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <IconSun size={15} color={themePref === "light" ? CL.accent : CL.textMuted} /> {s.themeLight}
        </button>
        <button
          onClick={() => {
            setThemePref("system");
            saveThemePreference("system").catch(() => {});
          }}
          className="pressable"
          style={{
            ...btn0,
            flex: 1,
            padding: isMobile ? "11px 8px" : "9px 12px",
            borderRadius: RADIUS.md,
            background: themePref === "system" ? CL.accentDim : "transparent",
            border: themePref === "system" ? `1px solid ${CL.accentBorder}` : "1px solid transparent",
            color: themePref === "system" ? CL.accent : CL.textMuted,
            fontSize: FONT.bodyLg,
            fontWeight: 700,
            minHeight: isMobile ? 44 : "auto",
            transition: TRANSITIONS.colorChange,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <IconMonitor size={15} color={themePref === "system" ? CL.accent : CL.textMuted} /> {s.themeSystem}
        </button>
        <button
          onClick={() => {
            setThemePref("dark");
            saveThemePreference("dark").catch(() => {});
          }}
          className="pressable"
          style={{
            ...btn0,
            flex: 1,
            padding: isMobile ? "11px 8px" : "9px 12px",
            borderRadius: RADIUS.md,
            background: themePref === "dark" ? CL.accentDim : "transparent",
            border: themePref === "dark" ? `1px solid ${CL.accentBorder}` : "1px solid transparent",
            color: themePref === "dark" ? CL.accent : CL.textMuted,
            fontSize: FONT.bodyLg,
            fontWeight: 700,
            minHeight: isMobile ? 44 : "auto",
            transition: TRANSITIONS.colorChange,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <IconMoon size={15} color={themePref === "dark" ? CL.accent : CL.textMuted} /> {s.themeDark}
        </button>
      </div>
    </>
  );
}
