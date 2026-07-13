import {
  IconArrowRight,
  IconDownload,
} from "./Icons";
import { FONT, RADIUS, ANIM } from "../constants/index";
import BackButton from "./BackButton";
import LanguageSection from "./settings/LanguageSection";
import ThemeSection from "./settings/ThemeSection";
import LegalSection from "./settings/LegalSection";
import DangerZoneSection from "./settings/DangerZoneSection";

export function SettingsPage({
  settingsPageOpen,
  setSettingsPageOpen,
  lang,
  setLang,
  themePref,
  setThemePref,
  confirmPurgeContent,
  confirmPurgeOwnershipOnly,
  CL,
  BORDERS,
  isMobile,
  isDesktop,
  s,
  btn0,
  deferredPrompt,
  onInstallPWA,
}) {
  if (!settingsPageOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: CL.bg,
        zIndex: 990,
        overflowY: "auto",
        animation: `pageEnter ${ANIM.normal} forwards`,
      }}
    >
      <div
        style={{
          maxWidth: isDesktop ? 900 : 700,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          padding: isMobile ? "14px 14px 40px" : "20px 24px 40px",
        }}
      >
        {/* شريط علوي: رجوع + عنوان في المنتصف الحقيقي */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            marginBottom: 24,
            paddingTop: isMobile ? 6 : 8,
            minHeight: 44,
          }}
        >
          <BackButton
            onClick={() => setSettingsPageOpen(false)}
            label={s.back}
            CL={CL}
            BORDERS={BORDERS}
            isMobile={isMobile}
            s={s}
            btn0={btn0}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: FONT.title,
              fontWeight: 800,
              color: CL.text,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {s.settings}
          </div>
        </div>

        {/* اللغة */}
        <LanguageSection
          lang={lang}
          setLang={setLang}
          CL={CL}
          BORDERS={BORDERS}
          isMobile={isMobile}
          s={s}
          btn0={btn0}
        />

        {/* الثيم */}
        <ThemeSection
          themePref={themePref}
          setThemePref={setThemePref}
          CL={CL}
          BORDERS={BORDERS}
          isMobile={isMobile}
          s={s}
          btn0={btn0}
        />

        {/* تثبيت التطبيق PWA */}
        {deferredPrompt && (
          <>
            <div style={{ fontSize: FONT.caption, color: CL.textMuted, fontWeight: 700, marginBottom: 8 }}>
              {s.pwaTitle}
            </div>
            <div style={{ marginBottom: 22 }}>
              <button
                onClick={onInstallPWA}
                className="pressable"
                style={{
                  ...btn0,
                  width: "100%",
                  textAlign: s.d === "rtl" ? "right" : "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: CL.accentDim,
                  border: `1px solid ${CL.accentBorder}`,
                  borderRadius: RADIUS.md,
                  padding: isMobile ? "13px 14px" : "11px 14px",
                  color: CL.accent,
                  fontSize: FONT.body,
                  fontWeight: 800,
                  minHeight: isMobile ? 46 : "auto",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <IconDownload size={14} color={CL.accent} /> {s.pwaInstallBtn}
                </span>
                <span
                  style={{
                    display: "flex",
                    color: CL.accent,
                    transform: s.d === "rtl" ? "none" : "scaleX(-1)",
                  }}
                >
                  <IconArrowRight size={13} color={CL.accent} />
                </span>
              </button>
            </div>
          </>
        )}

        {/* الصفحات الرسمية */}
        <LegalSection
          CL={CL}
          BORDERS={BORDERS}
          isMobile={isMobile}
          s={s}
          btn0={btn0}
        />

        {/* منطقة خطرة: إدارة البيانات */}
        <DangerZoneSection
          confirmPurgeContent={confirmPurgeContent}
          confirmPurgeOwnershipOnly={confirmPurgeOwnershipOnly}
          CL={CL}
          BORDERS={BORDERS}
          isMobile={isMobile}
          s={s}
          btn0={btn0}
        />
      </div>
    </div>
  );
}
