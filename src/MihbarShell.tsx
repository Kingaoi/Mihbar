"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { IconClock, IconStar, IconSprout, IconBookmark } from "./components/Icons";
import Loader from "./components/Loader";
import { RADIUS, FONT, TRANSITIONS, CATS } from "./constants/index";

// Custom Hooks for Modular Architecture
import { useMihbarConfig } from "./hooks/useMihbarConfig";
import { useMihbarSecurity } from "./hooks/useMihbarSecurity";
import { useMihbarPosts } from "./hooks/useMihbarPosts";
import { useSavedPosts } from "./hooks/useSavedPosts";
import { useAppUIState } from "./hooks/useAppUIState";
import { useDocumentMetadata } from "./hooks/useDocumentMetadata";
import { usePullToRefresh } from "./hooks/usePullToRefresh";

// Styles
import { getSharedStyles } from "./styles/sharedStyles";

// Modular Components
const MdEditorPage = dynamic(() => import("./components/MdEditorPage"), {
  loading: () => <Loader />,
});
import { ConfirmModal, DangerConfirmModal } from "./components/ConfirmDialogs";
import { SettingsPage } from "./components/SettingsPage";
import { SettingsBottomSheet } from "./components/SettingsBottomSheet";
import ProfilePage from "./components/ProfilePage";
import ThreadView from "./components/ThreadView";
import FeedItem from "./components/FeedItem";
import DevNoticeModal from "./components/DevNoticeModal";
import PWABanner from "./components/PWABanner";
import Toast from "./components/Toast";
import MainLayout from "./components/layout/MainLayout";
import { FloatingPostButton } from "./components/FloatingPostButton";
import { FloatingPostModal } from "./components/FloatingPostModal";
import { PullToRefreshIndicator } from "./components/PullToRefreshIndicator";

export default function Mihbar() {

  const config = useMihbarConfig();
  const {
    lang, setLang, s, themePref, setThemePref, isDarkActive, CL, BORDERS, R, isMobile, isTablet,
  } = config;

  const isDesktop = !isMobile && !isTablet;

  const security = useMihbarSecurity();
  const {
    deviceHash, securityReady, isBanned, banTimeLeft, ownedPosts, saveOwnedPosts, ownedComments, saveOwnedComments, ownedReplies, saveOwnedReplies,
  } = security;

  // UI State Management Hook
  const { savedPosts, toggleSavePost } = useSavedPosts();
  const uiState = useAppUIState();
  const {
    toast, showToast, confirmState, askConfirm, closeConfirm, dangerState, dangerCountdown, askDangerConfirm, closeDangerConfirm,
    settingsOpen, setSettingsOpen, settingsPageOpen, setSettingsPageOpen, profilePageOpen, setProfilePageOpen, profileTab, setProfileTab,
    openMenuFor, setOpenMenuFor, floatingPostOpen, setFloatingPostOpen,
  } = uiState;

  // Posts State and Navigation Hook
  const postsManager = useMihbarPosts({
    s, lang, isMobile, isBanned, deviceHash, securityReady, ownedPosts, saveOwnedPosts, ownedComments, saveOwnedComments, ownedReplies, saveOwnedReplies,
    showToast, askConfirm, savedPosts, askDangerConfirm, setSettingsOpen, setSettingsPageOpen, setProfilePageOpen,
  });

  const {
    posts, loading, isRefreshing, refreshPosts, displayed, isPosting, isCommenting, isReplying2, text, setText, note, setNote, category, setCategory,
    mdFile, setMdFile, videoUrl, setVideoUrl, pollOptions, setPollOptions, commentText, setCommentText, commentMdFile, setCommentMdFile, commentVideoUrl,
    setCommentVideoUrl, replyText, setReplyText, replyMdFile, setReplyMdFile, replyVideoUrl, setReplyVideoUrl, replyingToId,
    expandedIds, mdEditorState, openMdEditor, closeMdEditor, saveMdEditor, editingPostId, setEditingPostId,
    editingCommentId, setEditingCommentId, editingReplyInfo, setEditingReplyInfo, editPostText, setEditPostText, editCommentText,
    setEditCommentText, editReplyText, setEditReplyText, err, setErr, tab, setTab, catFilter, setCatFilter, searchQuery, setSearchQuery, activePostId,
    threadPending, threadClosing, showPwaBanner, handleInstallPWA, handleDismissPWABanner, activeCatRef, deferredPrompt,
    updateVotes, handlePollVote, submit, addComment, addReply, deletePost, deleteComment, deleteReply, saveEditPost, saveEditComment,
    saveEditReply, cancelEdit, confirmPurgeContent, confirmPurgeOwnershipOnly, openThread, closeThread, openThreadFromProfile,
    copyItemText, shareItemText, myPosts, myComments, myTotalReactions, toggleReplies, startReply,
  } = postsManager;

  const shouldShowFloatingBtn = !activePostId && !settingsPageOpen && !profilePageOpen && !floatingPostOpen;

  // Pull-to-refresh: مفعّل بسياقين — الفيد الرئيسي (يسحب قسم المنشورات) وصفحة
  // المنشور المفتوح (يسحب قسم التعليقات تحديدًا). refreshPosts نفسها تكفي
  // للحالتين لأن activePost مُشتقّة من posts (posts.find)، فإعادة جلب
  // المنشورات يحدّث تعليقات المنشور المفتوح تلقائيًا. يبقى معطّلًا فقط داخل
  // صفحات/نوافذ فرعية (إعدادات، بروفايل، نافذة نشر) ما إلها معنى تحديث فيها.
  const { pullY, pullProgress, maxPull } = usePullToRefresh({
    onRefresh: refreshPosts,
    isRefreshing,
    disabled: settingsPageOpen || profilePageOpen || floatingPostOpen,
  });

  // Shared Styles retrieval
  // Shared Styles retrieval — memoized: الدالة نقية وتُرجع أوبجكت جديد كل
  // استدعاء، فبدون useMemo كانت تُعيد بناء كل الـ style objects في كل render
  // حتى لو لم تتغيّر مدخلاتها (CL/isMobile ثابتة عبر معظم الـ re-renders).
  const { btn0, cardStyle, inputBase, btnPrimary, btnSecondary } = useMemo(
    () => getSharedStyles({ s, CL, BORDERS, R, isMobile }),
    [s, CL, BORDERS, R, isMobile]
  );

  const activePost = useMemo(() => posts.find((p) => p.id === activePostId), [posts, activePostId]);

  // Dynamic document metadata and OG tags synchronization
  useDocumentMetadata({ activePost, s });

  return (
    <div
      style={{
        direction: s.d,
        fontFamily: s.font,
        background: CL.bg,
        color: CL.text,
        minHeight: "100dvh",
        width: "100%",
        padding: R.pagePad,
        boxSizing: "border-box",
        overflowX: "hidden",
        WebkitFontSmoothing: "antialiased",
        display: "flex",
        flexDirection: "column",
        "--accent-border": CL.accentBorder,
        "--md-code-bg": CL.borderFaint,
        "--md-link": CL.edit,
        "--md-quote": CL.accent,
        "--md-quote-text": CL.textSub,
        "--md-border": CL.border,
        "--md-text": CL.text,
        "--border-faint-hover": CL.borderFaint,
        "--shine-start": isDarkActive ? '#e08a6e' : '#cc6a4c',
        "--shine-mid": isDarkActive ? '#ffbca6' : '#ff9875',
        "--shine-highlight": isDarkActive ? '#ffffff' : '#ffd3c2',
        "--shine-shadow": isDarkActive ? 'rgba(224, 138, 110, 0.15)' : 'rgba(204, 106, 76, 0.1)',
      } as CSSProperties}
    >
      <AnimatePresence>
        {mdEditorState && (
          <motion.div
            key="md-editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ position: "fixed", inset: 0, zIndex: 1200 }}
          >
            <MdEditorPage
              mdEditorState={mdEditorState} closeMdEditor={closeMdEditor} saveMdEditor={saveMdEditor}
              CL={CL} BORDERS={BORDERS} isMobile={isMobile} R={R} s={s} inputBase={inputBase} btn0={btn0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        confirmState={confirmState} closeConfirm={closeConfirm} cardStyle={cardStyle}
        CL={CL} BORDERS={BORDERS} isMobile={isMobile} s={s} btn0={btn0}
      />

      <DangerConfirmModal
        dangerState={dangerState} closeDangerConfirm={closeDangerConfirm} dangerCountdown={dangerCountdown}
        cardStyle={cardStyle} CL={CL} BORDERS={BORDERS} isMobile={isMobile} s={s} btn0={btn0}
      />

      <SettingsBottomSheet
        settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} setSettingsPageOpen={setSettingsPageOpen}
        setProfilePageOpen={setProfilePageOpen} CL={CL} BORDERS={BORDERS} isMobile={isMobile} s={s} btn0={btn0}
      />

      <SettingsPage
        settingsPageOpen={settingsPageOpen} setSettingsPageOpen={setSettingsPageOpen} lang={lang} setLang={setLang}
        themePref={themePref} setThemePref={setThemePref} confirmPurgeContent={confirmPurgeContent}
        confirmPurgeOwnershipOnly={confirmPurgeOwnershipOnly} CL={CL} BORDERS={BORDERS} isMobile={isMobile}
        isDesktop={isDesktop} s={s} btn0={btn0} deferredPrompt={deferredPrompt} onInstallPWA={handleInstallPWA}
      />

      <ProfilePage
        profilePageOpen={profilePageOpen} setProfilePageOpen={setProfilePageOpen} myPosts={myPosts} myComments={myComments}
        myTotalReactions={myTotalReactions} profileTab={profileTab} setProfileTab={setProfileTab}
        openThreadFromProfile={openThreadFromProfile} CL={CL} BORDERS={BORDERS} isMobile={isMobile} isDesktop={isDesktop}
        s={s} btn0={btn0} cardStyle={cardStyle} R={R}
      />

      <PullToRefreshIndicator
        pullY={pullY} pullProgress={pullProgress} isRefreshing={isRefreshing} maxPull={maxPull} CL={CL}
      />

      <MainLayout
        isDesktop={isDesktop} setProfilePageOpen={setProfilePageOpen} myPosts={myPosts}
        myComments={myComments} myTotalReactions={myTotalReactions} catFilter={catFilter} setCatFilter={setCatFilter}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} closeThread={closeThread} activePostId={activePostId}
        CL={CL} s={s} btn0={btn0} cardStyle={cardStyle} R={R} setSettingsOpen={setSettingsOpen} BORDERS={BORDERS}
        isBanned={isBanned} banTimeLeft={banTimeLeft}
      >
        {activePostId ? (
          <ThreadView
            activePost={activePost} threadClosing={threadClosing} closeThread={closeThread} deviceHash={deviceHash}
            ownedPosts={ownedPosts} ownedComments={ownedComments} ownedReplies={ownedReplies} deletePost={deletePost}
            deleteComment={deleteComment} deleteReply={deleteReply} editingPostId={editingPostId} setEditingPostId={setEditingPostId}
            editPostText={editPostText} setEditPostText={setEditPostText} saveEditPost={saveEditPost} editingCommentId={editingCommentId}
            setEditingCommentId={setEditingCommentId} editCommentText={editCommentText} setEditCommentText={setEditCommentText}
            saveEditComment={saveEditComment} editingReplyInfo={editingReplyInfo} setEditingReplyInfo={setEditingReplyInfo}
            editReplyText={editReplyText} setEditReplyText={setEditReplyText} saveEditReply={saveEditReply} cancelEdit={cancelEdit}
            commentText={commentText} setCommentText={setCommentText} addComment={addComment} isCommenting={isCommenting}
            commentMdFile={commentMdFile} setCommentMdFile={setCommentMdFile} commentVideoUrl={commentVideoUrl}
            setCommentVideoUrl={setCommentVideoUrl} replyText={replyText} setReplyText={setReplyText} addReply={addReply}
            isReplying2={isReplying2} replyMdFile={replyMdFile} setReplyMdFile={setReplyMdFile} replyVideoUrl={replyVideoUrl}
            setReplyVideoUrl={setReplyVideoUrl} replyingToId={replyingToId} expandedIds={expandedIds}
            toggleReplies={toggleReplies} savedPosts={savedPosts} toggleSavePost={toggleSavePost} startReply={startReply} openMenuFor={openMenuFor} setOpenMenuFor={setOpenMenuFor}
            copyItemText={copyItemText} shareItemText={shareItemText} updateVotes={updateVotes} handlePollVote={handlePollVote} openMdEditor={openMdEditor}
            isBanned={isBanned} err={err} setErr={setErr} CL={CL} BORDERS={BORDERS} isMobile={isMobile} s={s} btn0={btn0}
            btnPrimary={btnPrimary} btnSecondary={btnSecondary} inputBase={inputBase} R={R} pullY={pullY}
          />
        ) : (
          <>
            {/* Feed Filters Tabs */}
            <div
              style={{
                display: "flex", gap: 5, background: CL.surface, borderRadius: RADIUS.lg, padding: 4, marginBottom: 12, border: BORDERS.default,
              }}
            >
              {[
                { k: "recent", label: s.t0, IconEl: IconClock },
                { k: "top", label: s.t1, IconEl: IconStar },
                { k: "saved", label: s.d === "rtl" ? "محفوظة" : "Saved", IconEl: IconBookmark },
              ].map((tb) => (
                <button
                  key={tb.k} onClick={() => setTab(tb.k)}
                  style={{
                    ...btn0, flex: 1, padding: isMobile ? "11px 8px" : "9px 12px", borderRadius: RADIUS.md,
                    background: tab === tb.k ? CL.accentDim : "transparent",
                    border: tab === tb.k ? `1px solid ${CL.accentBorder}` : "1px solid transparent",
                    color: tab === tb.k ? CL.accent : CL.textMuted, fontSize: 13, fontWeight: 700, minHeight: isMobile ? 44 : "auto",
                    transition: TRANSITIONS.colorChange, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <tb.IconEl size={13} color={tab === tb.k ? CL.accent : CL.textMuted} />
                  {tb.label}
                </button>
              ))}
            </div>

            {/* Mobile Category Filters */}
            {isMobile && (
              <div
                style={{
                  display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12, scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
                }}
              >
                <button
                  onClick={() => setCatFilter(null)}
                  style={{
                    ...btn0, padding: "8px 16px", borderRadius: RADIUS.pill, flexShrink: 0,
                    background: !catFilter ? CL.accent : CL.surface,
                    color: !catFilter ? CL.bg : CL.textSub,
                    border: !catFilter ? `1px solid ${CL.accent}` : BORDERS.default,
                    fontWeight: 600, fontSize: 12,
                    transition: TRANSITIONS.colorChange,
                  }}
                >
                  {s.all || "الكل"}
                </button>
                {Object.keys(CATS).map((catName) => (
                  <button
                    key={catName} onClick={() => setCatFilter(catName)}
                    style={{
                      ...btn0, padding: "8px 16px", borderRadius: RADIUS.pill, flexShrink: 0,
                      background: catFilter === catName ? CATS[catName].bg : CL.surface,
                      color: catFilter === catName ? CATS[catName].color : CL.textSub,
                      border: catFilter === catName ? `1px solid ${CATS[catName].color}` : BORDERS.default,
                      fontWeight: 600, fontSize: 12,
                      transition: TRANSITIONS.colorChange,
                    }}
                  >
                    {s.d === "rtl" ? catName : CATS[catName].en}
                  </button>
                ))}
              </div>
            )}

            {/* Feed items — قسم المنشورات: هو الجزء اللي ينسحب فعليًا لتحت مع
                pullY أثناء pull-to-refresh بالفيد الرئيسي (التابات/فلاتر
                الفئات فوقه تفضل ثابتة). */}
            <motion.div style={{ y: pullY }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: 64, color: CL.textMuted }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                    <Loader size={52} accent={CL.accent} ringColor={CL.textSub} />
                  </div>
                  <div style={{ fontSize: FONT.body }}>{s.loadTxt}</div>
                </div>
              ) : displayed.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: CL.textMuted }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                    <IconSprout size={38} color={CL.textMuted} />
                  </div>
                  <div style={{ fontSize: FONT.heading, marginBottom: 5 }}>{s.emH}</div>
                  <div style={{ fontSize: FONT.body }}>{s.emP}</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {displayed.map((p, idx) => (
                    <FeedItem
                      key={p.id} type="feed" p={p} onClick={openThread} s={s} CL={CL} R={R} BORDERS={BORDERS} isMobile={isMobile}
                      btn0={btn0} isOwner={!!ownedPosts[p.id]} openMenuFor={openMenuFor} setOpenMenuFor={setOpenMenuFor}
                      onDelete={deletePost} copyItemText={copyItemText} shareItemText={shareItemText} deviceHash={deviceHash}
                      updateVotes={updateVotes} handlePollVote={handlePollVote} editingPostId={editingPostId} setEditingPostId={setEditingPostId} editPostText={editPostText}
                      setEditPostText={setEditPostText} saveEditPost={saveEditPost} cancelEdit={cancelEdit} err={err}
                      threadPending={threadPending} isLast={idx === displayed.length - 1} cardStyle={cardStyle}
                      btnPrimary={btnPrimary} btnSecondary={btnSecondary} inputBase={inputBase}
                      activePostId={activePostId} savedPosts={savedPosts} toggleSavePost={toggleSavePost}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </MainLayout>

      <FloatingPostButton
        isVisible={shouldShowFloatingBtn}
        isRefreshing={isRefreshing}
        setFloatingPostOpen={setFloatingPostOpen} isMobile={isMobile} CL={CL} s={s}
      />
      <FloatingPostModal
        isOpen={floatingPostOpen}
        setFloatingPostOpen={setFloatingPostOpen} text={text} setText={setText} note={note} setNote={setNote}
        category={category} setCategory={setCategory} mdFile={mdFile} setMdFile={setMdFile} videoUrl={videoUrl}
        setVideoUrl={setVideoUrl} pollOptions={pollOptions} setPollOptions={setPollOptions} isBanned={isBanned} isPosting={isPosting} submit={submit} err={err}
        setErr={setErr} openMdEditor={openMdEditor} activeCatRef={activeCatRef} CL={CL} BORDERS={BORDERS}
        isMobile={isMobile} s={s} btn0={btn0} inputBase={inputBase} R={R}
      />
      <PWABanner
        showPwaBanner={showPwaBanner} deferredPrompt={deferredPrompt} handleDismissPWABanner={handleDismissPWABanner}
        handleInstallPWA={handleInstallPWA} CL={CL} isMobile={isMobile} s={s} btn0={btn0}
      />

      <Toast
        toast={toast} CL={CL} isMobile={isMobile} s={s} lang={lang}
      />

      <DevNoticeModal
        CL={CL} BORDERS={BORDERS} isMobile={isMobile} s={s} btn0={btn0}
      />
    </div>
  );
}
