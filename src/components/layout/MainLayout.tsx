import { useState } from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconSettings, IconPause, IconSearch, IconX, IconBell } from "../Icons";
import { RADIUS, FONT } from "../../constants/index";
import Sidebar from "../Sidebar";

export function MainLayout({
  isDesktop,
  setProfilePageOpen,
  myPosts,
  myComments,
  myTotalReactions,
  catFilter,
  setCatFilter,
  searchQuery = "",
  setSearchQuery = (_q: string) => {},
  closeThread = () => {},
  activePostId = null,
  CL,
  s,
  btn0,
  cardStyle,
  R,
  setSettingsOpen,
  BORDERS,
  isBanned,
  banTimeLeft,
  children,
}) {
  const [searchBarVisible, setSearchBarVisible] = useState(!!searchQuery);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: s.notif1, read: false, time: s.d === "rtl" ? "قبل دقيقة" : "1m ago" },
    { id: 2, text: s.notif2, read: false, time: s.d === "rtl" ? "قبل ساعة" : "1h ago" },
    { id: 3, text: s.notif3, read: true, time: s.d === "rtl" ? "أمس" : "Yesterday" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const inputBase: CSSProperties = {
    background: "rgba(0,0,0,0.15)",
    border: BORDERS.default,
    borderRadius: RADIUS.sm,
    color: CL.text,
    fontSize: R.inputFont,
    fontFamily: s.font,
    boxSizing: "border-box",
    padding: "10px 12px",
    outline: "none",
    WebkitAppearance: "none",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isDesktop ? "row" : "column",
        gap: isDesktop ? 28 : 0,
        maxWidth: isDesktop ? 1200 : 700,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
        flex: "1 0 auto",
        alignItems: "flex-start",
      }}
    >
      {isDesktop && (
        <Sidebar
          setProfilePageOpen={setProfilePageOpen}
          myPosts={myPosts}
          myComments={myComments}
          myTotalReactions={myTotalReactions}
          catFilter={catFilter}
          setCatFilter={setCatFilter}
          CL={CL}
          s={s}
          btn0={btn0}
          cardStyle={cardStyle}
        />
      )}

      <main
        style={{
          maxWidth: isDesktop ? 900 : 700,
          margin: isDesktop ? 0 : "0 auto",
          width: "100%",
          boxSizing: "border-box",
          flex: "1 0 auto",
        }}
      >
        {/* Header */}
        <div 
          style={{ 
            display: "flex", 
            flexDirection: "row",
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: searchBarVisible ? 12 : R.headerMb,
            gap: 12
          }}
        >
          <div>
            <h1 
              className="mihbar-shining-title" 
              style={{ margin: 0, fontSize: R.titleSize, fontWeight: 800, lineHeight: 1.2 }}
            >
              {s.name}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: R.tagSize, color: CL.textMuted }}>{s.tag}</p>
          </div>

          <div 
            style={{ 
              display: "flex", 
              gap: 8, 
              alignItems: "center",
            }}
          >
            {/* Search Toggle Button */}
            <button
              onClick={() => setSearchBarVisible(!searchBarVisible)}
              aria-label="Search"
              data-pressable="btn"
              style={{
                ...btn0,
                background: searchBarVisible ? CL.accentDim : CL.surface,
                border: searchBarVisible ? `1px solid ${CL.accentBorder}` : BORDERS.default,
                borderRadius: RADIUS.lg,
                padding: "10px 12px",
                color: searchBarVisible ? CL.accent : CL.textSub,
                height: 40,
                width: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
            >
              <IconSearch size={18} color={searchBarVisible ? CL.accent : CL.textSub} />
            </button>

            {/* Notifications Toggle Button with dropdown wrapper */}
            <div style={{ position: "relative" }}>
              <button
                onClick={toggleNotifications}
                aria-label={s.notificationsHeading}
                data-pressable="btn"
                style={{
                  ...btn0,
                  background: showNotifications ? CL.accentDim : CL.surface,
                  border: showNotifications ? `1px solid ${CL.accentBorder}` : BORDERS.default,
                  borderRadius: RADIUS.lg,
                  padding: "10px 12px",
                  color: showNotifications ? CL.accent : CL.textSub,
                  height: 40,
                  width: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transition: "all 0.2s ease"
                }}
              >
                <IconBell size={18} color={showNotifications ? CL.accent : CL.textSub} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      background: CL.danger,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "bold",
                      borderRadius: "50%",
                      height: 16,
                      minWidth: 16,
                      padding: "0 4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `2px solid ${CL.surface}`,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div 
                    onClick={() => setShowNotifications(false)} 
                    style={{ position: "fixed", inset: 0, zIndex: 40, background: "transparent" }} 
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "48px",
                      right: s.d === "rtl" ? "auto" : "0",
                      left: s.d === "rtl" ? "0" : "auto",
                      width: "290px",
                      maxHeight: "360px",
                      background: CL.surface,
                      border: BORDERS.default,
                      borderRadius: RADIUS.lg,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
                      zIndex: 50,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden"
                    }}
                  >
                    {/* Dropdown Header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        borderBottom: BORDERS.default,
                        background: CL.borderFaint
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 13, color: CL.text }}>
                        {s.notificationsHeading}
                      </span>
                      {notifications.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotifications([]);
                          }}
                          style={{
                            ...btn0,
                            fontSize: 11,
                            fontWeight: 600,
                            color: CL.accent,
                            background: "none",
                            border: "none",
                            padding: "2px 6px"
                          }}
                        >
                          {s.clearAll}
                        </button>
                      )}
                    </div>

                    {/* Dropdown List */}
                    <div style={{ overflowY: "auto", flex: 1, padding: "4px 0" }}>
                      {notifications.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px 16px", color: CL.textMuted }}>
                          <div style={{ margin: "0 auto 8px", opacity: 0.5, width: 24, height: 24 }}>
                            <IconBell size={24} color={CL.textMuted} />
                          </div>
                          <div style={{ fontSize: 12 }}>{s.noNotifications}</div>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "flex-start",
                              padding: "10px 14px",
                              borderBottom: `1px solid ${CL.borderFaint}`,
                              transition: "background 0.2s",
                              position: "relative",
                              background: notif.read ? "transparent" : CL.accentDim,
                            }}
                            className="hover:bg-opacity-5"
                          >
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontSize: 12, color: CL.text, lineHeight: 1.4, textAlign: s.d === "rtl" ? "right" : "left" }}>
                                {notif.text}
                              </p>
                              <span style={{ fontSize: 10, color: CL.textMuted, display: "block", marginTop: 4, textAlign: s.d === "rtl" ? "right" : "left" }}>
                                {notif.time}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNotifications(prev => prev.filter(n => n.id !== notif.id));
                              }}
                              style={{
                                ...btn0,
                                background: "none",
                                border: "none",
                                padding: 2,
                                color: CL.textMuted,
                                cursor: "pointer",
                                opacity: 0.7
                              }}
                            >
                              <IconX size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label={s.settings}
              data-pressable="btn"
              style={{
                ...btn0,
                background: CL.surface,
                border: BORDERS.default,
                borderRadius: RADIUS.lg,
                padding: "8px 12px",
                color: CL.textSub,
                height: 40,
                width: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSettings size={18} color={CL.textSub} />
            </button>
          </div>
        </div>

        {/* Collapsible Search Input Bar with Motion Animation */}
        <AnimatePresence>
          {searchBarVisible && (
            <motion.div 
              initial={{ height: 0, opacity: 0, scaleY: 0.95, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, scaleY: 1, marginBottom: 16 }}
              exit={{ height: 0, opacity: 0, scaleY: 0.95, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ 
                width: "100%",
                overflow: "hidden",
                transformOrigin: "top"
              }}
            >
              <div 
                style={{ 
                  position: "relative", 
                  width: "100%",
                  paddingBottom: "1px"
                }}
              >
                <div 
                  style={{ 
                    position: "absolute", 
                    left: s.d === "rtl" ? "auto" : "12px", 
                    right: s.d === "rtl" ? "12px" : "auto", 
                    top: "50%", 
                    transform: "translateY(-50%)", 
                    display: "flex", 
                    alignItems: "center",
                    pointerEvents: "none",
                    opacity: 0.5
                  }}
                >
                  <IconSearch size={16} color={CL.textSub} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activePostId && e.target.value.trim() !== "") {
                      closeThread();
                    }
                  }}
                  placeholder={s.searchPh}
                  dir="auto"
                  style={{
                    ...inputBase,
                    width: "100%",
                    paddingLeft: s.d === "rtl" ? "12px" : "34px",
                    paddingRight: s.d === "rtl" ? "34px" : "12px",
                    borderRadius: RADIUS.lg,
                    background: CL.surface,
                    fontSize: 14,
                    height: 40,
                    boxSizing: "border-box"
                  }}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{
                      ...btn0,
                      position: "absolute",
                      right: s.d === "rtl" ? "auto" : "10px",
                      left: s.d === "rtl" ? "10px" : "auto",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      padding: 4,
                      color: CL.textMuted,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconX size={14} color={CL.textMuted} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ban warning */}
        {isBanned && (
          <div
            style={{
              background: CL.dangerDim,
              border: BORDERS.danger,
              borderRadius: RADIUS.lg,
              padding: "12px 14px",
              marginBottom: 14,
              color: CL.danger,
              fontSize: FONT.body,
              wordBreak: "break-word",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <IconPause size={14} color={CL.danger} /> {s.banned} ({banTimeLeft}s)
          </div>
        )}

        {/* ملاحظة: pull-to-refresh (السحب-للتحديث) أُعيد لاحقًا بتصميم آمن
            (على غرار Threads) بعد أن كان محذوفًا بالكامل مؤقتًا بسبب
            مشكلة سكرول متكررة يصعب حصرها (تعارض transform/touch-action
            مع native scroll على الأجهزة الحقيقية). التصميم الحالي: مؤشر
            تحميل مستقل (PullToRefreshIndicator، position:fixed) يُعرض في
            MihbarShell.tsx فوق هذا المكوّن بالكامل — {children} هنا لا
            يُغلَّف بأي motion.div ولا يستقبل أي pullY إطلاقًا، فلا يوجد
            أي transform يُطبَّق على المحتوى القابل للتمرير نفسه أبدًا.
            هذا يضمن أن السكرول الطبيعي غير قابل للتأثر بهذه الميزة مهما
            كان سبب أي مشكلة سابقة. */}
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
