import { useState } from "react";
import { ANIM, FONT, RADIUS, TRANSITIONS } from "../constants/index";
import { IconLock } from "./Icons";
import BackButton from "./BackButton";

function IconEye({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7-10.5-7-10.5-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10.5-7-10.5-7a19.9 19.9 0 0 1 4.22-5.06M9.9 4.24A10.4 10.4 0 0 1 12 4c6.5 0 10.5 7 10.5 7a19.85 19.85 0 0 1-2.19 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

// نموذج اسم المستخدم/كلمة المرور — تبويبين (دخول/إنشاء حساب) بنفس نمط
// تبويبات ProfilePage. شكل فقط حاليًا: onSubmit ما يعمل شيء فعلي بعد
// (سيُربط لاحقًا بمنطق تسجيل حقيقي)، بس الحالة المحلية للحقول والتنقّل
// بين التبويبات شغّالة بالكامل عشان تقدر تعاين التصميم فعليًا.
export default function UsernameAuthPage({
  authPageOpen,
  authView,
  setAuthView,
  CL,
  BORDERS,
  isMobile,
  isDesktop,
  s,
  btn0,
  cardStyle,
  inputBase,
  btnPrimary,
}) {
  const [mode, setMode] = useState("signup"); // 'login' | 'signup'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!authPageOpen || authView !== "username") return null;

  const isSignup = mode === "signup";

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
          padding: isMobile ? "14px 18px 40px" : "20px 24px 40px",
        }}
      >
        {/* شريط علوي: رجوع لبوابة الاختيار + عنوان بالمنتصف */}
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
            onClick={() => setAuthView("gateway")}
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
            {s.authPageTitle}
          </div>
        </div>

        {/* تبويبات: تسجيل الدخول / إنشاء حساب */}
        <div
          style={{
            display: "flex",
            gap: 5,
            background: CL.surface,
            borderRadius: RADIUS.lg,
            padding: 4,
            marginBottom: 18,
            border: BORDERS.default,
          }}
        >
          {[
            { k: "login", label: s.authTabLogin },
            { k: "signup", label: s.authTabSignup },
          ].map((tb) => (
            <button
              key={tb.k}
              onClick={() => setMode(tb.k)}
              className="pressable"
              style={{
                ...btn0,
                flex: 1,
                padding: isMobile ? "11px 8px" : "9px 12px",
                borderRadius: RADIUS.md,
                background: mode === tb.k ? CL.accentDim : "transparent",
                border: mode === tb.k ? `1px solid ${CL.accentBorder}` : "1px solid transparent",
                color: mode === tb.k ? CL.accent : CL.textMuted,
                fontSize: 13,
                fontWeight: 700,
                minHeight: isMobile ? 44 : "auto",
                transition: TRANSITIONS.colorChange,
              }}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* بطاقة الحقول */}
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {/* اسم المستخدم */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              ...inputBase,
              padding: 0,
            }}
          >
            <span style={{ color: CL.textMuted, fontSize: R_inputFont(isMobile), padding: "10px 4px 10px 10px" }}>@</span>
            <input
              type="text"
              autoComplete="username"
              placeholder={s.authUsernamePh}
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: CL.text,
                fontSize: inputBase.fontSize,
                fontFamily: inputBase.fontFamily,
                padding: "10px 10px 10px 0",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* كلمة المرور */}
          <div style={{ display: "flex", alignItems: "center", ...inputBase, padding: 0 }}>
            <span style={{ margin: "0 10px", display: "flex" }}><IconLock size={14} color={CL.textMuted} /></span>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={s.authPasswordPh}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: CL.text,
                fontSize: inputBase.fontSize,
                fontFamily: inputBase.fontFamily,
                padding: "10px 4px",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="pressable"
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ ...btn0, background: "transparent", border: "none", padding: 10, display: "flex", color: CL.textMuted }}
            >
              {showPassword ? <IconEyeOff size={16} color={CL.textMuted} /> : <IconEye size={16} color={CL.textMuted} />}
            </button>
          </div>

          {/* تأكيد كلمة المرور — إنشاء حساب فقط */}
          {isSignup && (
            <div style={{ display: "flex", alignItems: "center", ...inputBase, padding: 0 }}>
              <span style={{ margin: "0 10px", display: "flex" }}><IconLock size={14} color={CL.textMuted} /></span>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={s.authConfirmPasswordPh}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: CL.text,
                  fontSize: inputBase.fontSize,
                  fontFamily: inputBase.fontFamily,
                  padding: "10px 4px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}
        </div>

        {/* ملاحظة المعاينة — نفس نمط ProfilePage.tsx profileLocalNote تمامًا،
            توضّح للمستخدم أن هذا تصميم فقط قبل أن يملأ النموذج، لا بعد. */}
        <div
          style={{
            background: CL.borderFaint,
            border: BORDERS.default,
            borderRadius: RADIUS.md,
            padding: "10px 12px",
            marginBottom: 16,
            fontSize: FONT.label,
            color: CL.textSub,
            wordBreak: "break-word",
            textAlign: "center",
          }}
        >
          {s.authPreviewNote}
        </div>

        {/* زر الإرسال الرئيسي — معطّل عمدًا (aria-disabled + opacity) بما أن
            onSubmit ما يعمل شيء فعلي بعد (انظر التعليق أعلى المكوّن) — تعطيل
            الزر بصريًا أوضح للمستخدم من ترك النموذج يبتلع كلمة مرور حقيقية
            بصمت بلا أي استجابة عند الضغط. */}
        <button
          className="pressable"
          disabled
          aria-disabled="true"
          style={{
            ...btnPrimary,
            width: "100%",
            padding: isMobile ? "13px 16px" : "12px 16px",
            fontSize: FONT.bodyLg,
            minHeight: isMobile ? 50 : "auto",
            marginBottom: 14,
            opacity: 0.5,
            cursor: "not-allowed",
          }}
        >
          {isSignup ? s.authSubmitSignup : s.authSubmitLogin}
        </button>

        {/* رابط سريع لجوجل */}
        <div
          onClick={() => setAuthView("gateway")}
          style={{
            textAlign: "center",
            fontSize: FONT.body,
            color: CL.textSub,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {s.authWithGoogleShort}
        </div>
      </div>
    </div>
  );
}

// مساعد صغير محلي بدل تمرير R كاملة لعنصر واحد بس — يطابق نفس منطق
// R.inputFont في useMihbarConfig.js (16 بالموبايل لمنع تكبير iOS التلقائي
// للحقل، 13 بسطح المكتب).
function R_inputFont(isMobile) {
  return isMobile ? 16 : 13;
}
