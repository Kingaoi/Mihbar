import { useState, useEffect } from "react";
import { FONT, RADIUS, ANIM, TRANSITIONS } from "../constants/index";
import BackButton from "./BackButton";
import FeedItem from "./FeedItem";
import { IconFileText, IconMessageCircle, IconUser } from "./Icons";
import { getDisplayName, saveDisplayName, getUserName, saveUserName } from "../utils/dataLayer";

export default function ProfilePage({
  profilePageOpen,
  setProfilePageOpen,
  myPosts,
  myComments,
  myTotalReactions,
  profileTab,
  setProfileTab,
  openThreadFromProfile,
  CL,
  BORDERS,
  isMobile,
  isDesktop,
  s,
  btn0,
  cardStyle,
  R
}) {
  const [displayName, setDisplayName] = useState("");
  const [userName, setUserName] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  // تحميل أولي من dataLayer.js (كان useState(() => localStorage.getItem(...))
  // متزامنًا سابقًا — الآن async عبر effect init، بنفس نمط باقي hooks المشروع).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [dn, un] = await Promise.all([getDisplayName(), getUserName()]);
      if (cancelled) return;
      setDisplayName(dn);
      setUserName(un);
      setProfileLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!profileLoaded) return;
    saveDisplayName(displayName).catch(() => {});
  }, [displayName, profileLoaded]);

  useEffect(() => {
    if (!profileLoaded) return;
    saveUserName(userName).catch(() => {});
  }, [userName, profileLoaded]);

  if (!profilePageOpen) return null;

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
            marginBottom: 20,
            paddingTop: isMobile ? 6 : 8,
            minHeight: 44,
          }}
        >
          <BackButton
            onClick={() => setProfilePageOpen(false)}
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
            {s.profileTitle}
          </div>
        </div>

        {/* إعدادات الملف الشخصي */}
        <div style={{ ...cardStyle, marginBottom: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{
              width: 48, height: 48, borderRadius: RADIUS.circle, background: CL.accentDim,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <IconUser size={24} color={CL.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder={s.displayName || "Display Name"}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: FONT.heading,
                  fontWeight: 800,
                  color: CL.text,
                  padding: 0,
                  marginBottom: 2,
                }}
              />
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ color: CL.textMuted, fontSize: FONT.body, marginRight: 2 }}>@</span>
                <input
                  type="text"
                  placeholder={s.userName || "username"}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: FONT.body,
                    color: CL.textMuted,
                    padding: 0,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* بطاقة الإحصائيات */}
        <div
          style={{
            ...cardStyle,
            marginBottom: 14,
            display: "flex",
            justifyContent: "space-around",
            textAlign: "center",
          }}
        >
          {[
            { n: myPosts.length, label: s.profileStatPosts, key: "posts" },
            { n: myComments.length, label: s.profileStatComments, key: "comments" },
            { n: myTotalReactions, label: s.profileStatReactions, key: "reactions" },
          ].map((st) => (
            <div key={st.key}>
              <div style={{ fontSize: FONT.title, fontWeight: 800, color: CL.accent }}>
                {st.n}
              </div>
              <div style={{ fontSize: FONT.caption, color: CL.textMuted, marginTop: 2 }}>
                {st.label}
              </div>
            </div>
          ))}
        </div>

        {/* ملاحظة الحالة المحلية */}
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
          }}
        >
          {s.profileLocalNote}
        </div>

        {/* تبويبات: منشوراتي / تعليقاتي */}
        <div
          style={{
            display: "flex",
            gap: 5,
            background: CL.surface,
            borderRadius: RADIUS.lg,
            padding: 4,
            marginBottom: 14,
            border: BORDERS.default,
          }}
        >
          {[
            { k: "posts", label: s.profileMyPosts },
            { k: "comments", label: s.profileMyComments },
          ].map((tb) => (
            <button
              key={tb.k}
              onClick={() => setProfileTab(tb.k)}
              style={{
                ...btn0,
                flex: 1,
                padding: isMobile ? "11px 8px" : "9px 12px",
                borderRadius: RADIUS.md,
                background: profileTab === tb.k ? CL.accentDim : "transparent",
                border:
                  profileTab === tb.k
                    ? `1px solid ${CL.accentBorder}`
                    : "1px solid transparent",
                color: profileTab === tb.k ? CL.accent : CL.textMuted,
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

        {/* محتوى التبويب: منشوراتي */}
        {profileTab === "posts" &&
          (myPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: CL.textMuted }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <IconFileText size={38} color={CL.textMuted} />
              </div>
              <div style={{ fontSize: FONT.heading, marginBottom: 5 }}>
                {s.profileEmptyPosts}
              </div>
              <div style={{ fontSize: FONT.body }}>{s.profileEmptyPostsSub}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 9 }}>
              {myPosts.map((p) => (
                <FeedItem
                  key={p.id}
                  type="profile-post"
                  p={p}
                  onClick={openThreadFromProfile}
                  s={s}
                  CL={CL}
                  R={R}
                  BORDERS={BORDERS}
                  isMobile={isMobile}
                  btn0={btn0}
                  cardStyle={cardStyle}
                />
              ))}
            </div>
          ))}

        {/* محتوى التبويب: تعليقاتي */}
        {profileTab === "comments" &&
          (myComments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: CL.textMuted }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <IconMessageCircle size={38} color={CL.textMuted} />
              </div>
              <div style={{ fontSize: FONT.heading, marginBottom: 5 }}>
                {s.profileEmptyComments}
              </div>
              <div style={{ fontSize: FONT.body }}>{s.profileEmptyCommentsSub}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 9 }}>
              {myComments.map((c) => (
                <FeedItem
                  key={c.id}
                  type="profile-comment"
                  p={c}
                  onClick={openThreadFromProfile}
                  s={s}
                  CL={CL}
                  R={R}
                  BORDERS={BORDERS}
                  isMobile={isMobile}
                  btn0={btn0}
                  cardStyle={cardStyle}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
