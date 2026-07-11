import { ANIM, FONT, RADIUS } from "../constants/index";
import { IconSprout, IconUser } from "./Icons";
import BackButton from "./BackButton";

// أيقونة جوجل الرسمية متعددة الألوان (نفس شكل زر "Sign in with Google"
// القياسي حسب إرشادات جوجل نفسها للمطوّرين) — ثابتة الألوان بغض النظر عن
// الثيم لأنها علامة تجارية، الزر نفسه محايد (خلفية بيضاء دايمًا) عشان
// التباين يفضل صحيح بالوضعين الفاتح والغامق.
function GoogleGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 34.9 26.9 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C41.4 36.5 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

// بوابة الدخول/إنشاء الحساب: تصميم فقط حاليًا — الأزرار ما لها منطق تسجيل
// حقيقي بعد (لا Google OAuth ولا حفظ فعلي)، بس شكل ونقل بين الشاشات كامل
// وجاهز يتربط لاحقًا. متسقة مع باقي صفحات التطبيق (نفس نمط pageEnter
// الثابت بـ SettingsPage/ProfilePage).
export default function AuthGatewayPage({
  authPageOpen,
  setAuthPageOpen,
  setAuthView,
  CL,
  BORDERS,
  isMobile,
  isDesktop,
  s,
  btn0,
}) {
  if (!authPageOpen) return null;

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
          maxWidth: isDesktop ? 460 : 420,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          padding: isMobile ? "14px 18px 40px" : "20px 24px 48px",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* شريط علوي: رجوع بس (بدون عنوان — الهيرو تحت يقوم بدور العنوان) */}
        <div style={{ paddingTop: isMobile ? 6 : 8, minHeight: 44 }}>
          <BackButton
            onClick={() => setAuthPageOpen(false)}
            label={s.back}
            CL={CL}
            BORDERS={BORDERS}
            isMobile={isMobile}
            s={s}
            btn0={btn0}
          />
        </div>

        {/* Hero */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: RADIUS.circle,
                background: CL.accentDim,
                border: `1px solid ${CL.accentBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <IconSprout size={30} color={CL.accent} />
            </div>
            <div style={{ fontSize: FONT.displayLg, fontWeight: 800, color: CL.text, marginBottom: 6 }}>
              {s.authGatewayTitle}
            </div>
            <div style={{ fontSize: FONT.body, color: CL.textMuted, lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
              {s.authGatewaySubtitle}
            </div>
          </div>

          {/* خيارات الدخول */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              className="pressable"
              style={{
                ...btn0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: RADIUS.md,
                padding: isMobile ? "13px 16px" : "12px 16px",
                color: "#1f1f1f",
                fontSize: FONT.bodyLg,
                fontWeight: 700,
                minHeight: isMobile ? 50 : "auto",
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
              }}
            >
              <GoogleGlyph size={18} />
              {s.authContinueGoogle}
            </button>

            {/* فاصل "أو" */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0" }}>
              <div style={{ flex: 1, height: 1, background: CL.border }} />
              <span style={{ fontSize: FONT.caption, color: CL.textMuted, fontWeight: 700 }}>{s.authOr}</span>
              <div style={{ flex: 1, height: 1, background: CL.border }} />
            </div>

            <button
              className="pressable"
              onClick={() => setAuthView("username")}
              style={{
                ...btn0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                background: CL.surface,
                border: BORDERS.default,
                borderRadius: RADIUS.md,
                padding: isMobile ? "13px 16px" : "12px 16px",
                color: CL.text,
                fontSize: FONT.bodyLg,
                fontWeight: 700,
                minHeight: isMobile ? 50 : "auto",
              }}
            >
              <IconUser size={16} color={CL.text} />
              {s.authContinueUsername}
            </button>
          </div>

          {/* متابعة بدون حساب — يحافظ على روح "مِحبار" المجهولة */}
          <button
            className="pressable"
            onClick={() => setAuthPageOpen(false)}
            style={{
              ...btn0,
              background: "transparent",
              border: "none",
              padding: "14px 8px",
              color: CL.textSub,
              fontSize: FONT.body,
              fontWeight: 700,
              textAlign: "center",
              width: "100%",
              marginTop: 4,
            }}
          >
            {s.authGuestContinue}
          </button>
        </div>

        {/* ملاحظة الخصوصية */}
        <div
          style={{
            textAlign: "center",
            fontSize: FONT.caption,
            color: CL.textMuted,
            lineHeight: 1.6,
            paddingTop: 8,
          }}
        >
          {s.authFooterNote}
        </div>
      </div>
    </div>
  );
}
