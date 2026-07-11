import { motion } from "motion/react";
import { IconPencil, IconMessageCircle, IconFileText } from "./Icons";
import { FONT, RADIUS, CATS, ANIMATIONS, FLAG_HIDE_LIMIT } from "../constants/index";
import { timeAgo } from "../utils/index";
import { isEntityVisible } from "../utils/dataLayer";
import BackButton from "./BackButton";
import ActionMenuButton from "./ActionMenuButton";
import ReactionRow from "./ReactionRow";
import { MdBadge } from "./MdBadge";
import { PollRenderer } from "./PollRenderer";
import { MdAttachRow } from "./MdAttachRow";
import { VideoPlayer } from "./VideoPlayer";
import CommentItem from "./CommentItem";

export default function ThreadView({
  activePost,
  threadClosing,
  closeThread,
  deviceHash,
  ownedPosts,
  ownedComments,
  ownedReplies,
  deletePost,
  deleteComment,
  deleteReply, handlePollVote, savedPosts, toggleSavePost,
  editingPostId,
  setEditingPostId,
  editPostText,
  setEditPostText,
  saveEditPost,
  editingCommentId,
  setEditingCommentId,
  editCommentText,
  setEditCommentText,
  saveEditComment,
  editingReplyInfo,
  setEditingReplyInfo,
  editReplyText,
  setEditReplyText,
  saveEditReply,
  cancelEdit,
  commentText,
  setCommentText,
  addComment,
  isCommenting,
  commentMdFile,
  setCommentMdFile,
  commentVideoUrl,
  setCommentVideoUrl,
  replyText,
  setReplyText,
  addReply,
  isReplying2,
  replyMdFile,
  setReplyMdFile,
  replyVideoUrl,
  setReplyVideoUrl,
  replyingToId,
  expandedIds,
  toggleReplies,
  startReply,
  openMenuFor,
  setOpenMenuFor,
  copyItemText,
  shareItemText,
  updateVotes,
  openMdEditor,
  isBanned,
  err,
  setErr,
  CL,
  BORDERS,
  isMobile,
  s,
  btn0,
  btnPrimary,
  btnSecondary,
  inputBase,
  R,
  pullY,
  pullAnchorRef,
}) {
  if (!activePost) return null;

  return (
    <div
      style={{
        animation: ANIMATIONS.threadEnter(threadClosing),
        willChange: "opacity, transform",
      }}
    >
      {/* Back button */}
      <div style={{ marginBottom: 14 }}>
        <BackButton onClick={() => closeThread()} label={s.back} CL={CL} BORDERS={BORDERS} isMobile={isMobile} s={s} btn0={btn0} />
      </div>

      {/* Post card */}
      <div style={{ display: "flex", gap: 11, marginBottom: 6, position: "relative" }}>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: isMobile ? 40 : 42,
              height: isMobile ? 40 : 42,
              borderRadius: RADIUS.circle,
              background: CATS[activePost.category]?.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: FONT.title,
              fontWeight: 800,
              color: CATS[activePost.category]?.color,
              flexShrink: 0,
            }}
          >
            {s.cat(activePost.category)?.trim()?.charAt(0) || "•"}
          </div>
          {(activePost.comments || []).length > 0 && (
            <div style={{ width: 2, flex: 1, minHeight: 20, background: CL.borderFaint, marginTop: 6 }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Meta row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 6,
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ color: CATS[activePost.category]?.color, fontWeight: 700, fontSize: R.bodyText }}>
                {s.cat(activePost.category)}
              </span>
              <span style={{ fontSize: R.metaFont, color: CL.textMuted }}>· {timeAgo(activePost.timestamp, s)}</span>
              {activePost.edited && (
                <span
                  style={{
                    fontSize: FONT.micro,
                    color: CL.textMuted,
                    fontStyle: "italic",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <IconPencil size={9} color={CL.textMuted} /> {s.editedLabel}
                </span>
              )}
            </div>
            <ActionMenuButton
              menuKey={`post-${activePost.id}`}
              text={activePost.text}
              url={`https://inkore.vercel.app/post/${activePost.id}`}
              isOwner={!!ownedPosts[activePost.id]}
              onEdit={() => {
                setEditingPostId(activePost.id);
                setEditPostText(activePost.text);
              }}
              onDelete={() => deletePost(activePost.id)}
              openMenuFor={openMenuFor}
              setOpenMenuFor={setOpenMenuFor}
              copyItemText={copyItemText}
              shareItemText={shareItemText} onSave={() => toggleSavePost(activePost.id)} isSaved={savedPosts && savedPosts[activePost.id]}
              CL={CL}
              BORDERS={BORDERS}
              isMobile={isMobile}
              s={s}
              btn0={btn0}
            />
          </div>

          {editingPostId === activePost.id ? (
            <div style={{ marginBottom: 12 }}>
              <textarea
                value={editPostText}
                onChange={(e) => setEditPostText(e.target.value)}
                maxLength={300}
                autoFocus
                style={{
                  ...inputBase,
                  width: "100%",
                  minHeight: 80,
                  resize: "none",
                  border: BORDERS.edit,
                  fontSize: R.textareaFont,
                }}
              />
              {err && (
                <div style={{ color: "#D07070", fontSize: FONT.caption, marginTop: 4, wordBreak: "break-word" }}>
                  {err}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <button onClick={() => saveEditPost(activePost.id)} style={btnPrimary}>
                  {s.editSave}
                </button>
                <button onClick={cancelEdit} style={btnSecondary}>
                  {s.editCancel}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ margin: "0 0 10px", fontSize: R.bodyText, lineHeight: 1.78, color: CL.text, wordBreak: "break-word" }}>
                {activePost.text}
              </p>
              <PollRenderer poll={activePost.poll} postId={activePost.id} CL={CL} BORDERS={BORDERS} s={s} handlePollVote={handlePollVote} deviceHash={deviceHash} />
              {activePost.mdFile && (
                <MdBadge
                  file={activePost.mdFile}
                  CL={CL}
                  BORDERS={BORDERS}
                  isMobile={isMobile}
                  s={s}
                  btn0={btn0}
                />
              )}
              {activePost.videoUrl && (
                <VideoPlayer
                  url={activePost.videoUrl}
                  CL={CL}
                  BORDERS={BORDERS}
                />
              )}
            </>
          )}

          {activePost.note && (
            <div
              style={{
                borderInlineStart: `3px solid ${CATS[activePost.category]?.color}`,
                paddingInlineStart: 10,
                paddingTop: 4,
                paddingBottom: 4,
                marginBottom: 12,
                fontSize: FONT.label,
                color: CL.textSub,
                fontStyle: "italic",
                wordBreak: "break-word",
                display: "flex",
                gap: 6,
                alignItems: "flex-start",
              }}
            >
              <span style={{ display: "flex", flexShrink: 0, marginTop: 2 }}>
                <IconFileText size={12} color={CL.textSub} />
              </span>
              <span>{activePost.note}</span>
            </div>
          )}
          <ReactionRow
            postId={activePost.id}
            commentId={null}
            votes={activePost.votes}
            deviceHash={deviceHash}
            updateVotes={updateVotes}
            CL={CL}
            BORDERS={BORDERS}
            isMobile={isMobile}
            R={R}
            btn0={btn0}
            s={s}
          />
        </div>
      </div>

      {/* Comments section */}
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: FONT.bodyLg, fontWeight: 700, color: CL.accent }}>
          {s.commentsTitle}
        </h3>

        {/* Comment input */}
        {!isBanned && (
          <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${CL.borderFaint}` }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <textarea
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  setErr("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isMobile) {
                    e.preventDefault();
                    addComment(activePost?.id);
                  }
                }}
                placeholder={s.commentPh}
                maxLength={300}
                rows={1}
                style={{
                  ...inputBase,
                  flex: 1,
                  minHeight: isMobile ? 44 : 38,
                  resize: "vertical",
                  maxHeight: 140,
                  fontFamily: s.font,
                  lineHeight: 1.4,
                  paddingTop: isMobile ? 12 : 9,
                  paddingBottom: isMobile ? 12 : 9,
                }}
              />
              <button
                onClick={() => addComment(activePost?.id)}
                disabled={isCommenting}
                style={{
                  ...btn0,
                  background: CL.accentDim,
                  border: BORDERS.accent,
                  borderRadius: RADIUS.sm,
                  padding: "0 14px",
                  color: CL.accent,
                  fontSize: R.btnFont,
                  fontWeight: 700,
                  minHeight: isMobile ? 44 : 38,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: isCommenting ? 0.7 : 1,
                  cursor: isCommenting ? "default" : "pointer",
                }}
              >
                {isCommenting && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 11,
                      height: 11,
                      border: `2px solid ${CL.accentBorder}`,
                      borderTopColor: CL.accent,
                      borderRadius: RADIUS.circle,
                      animation: ANIMATIONS.spinBtn,
                    }}
                  />
                )}
                {isCommenting ? s.commentBtnPosting : s.commentBtn}
              </button>
            </div>
            <MdAttachRow
              target="comment"
              file={commentMdFile}
              onRemove={() => {
                setCommentMdFile(null);
              }}
              openMdEditor={openMdEditor}
              videoUrl={commentVideoUrl}
              setVideoUrl={setCommentVideoUrl}
              CL={CL}
              BORDERS={BORDERS}
              isMobile={isMobile}
              s={s}
              btn0={btn0}
            />
            <div
              style={{
                textAlign: s.d === "rtl" ? "left" : "right",
                fontSize: FONT.badge,
                color: commentText.length > 260 ? "#D07070" : CL.textMuted,
                marginTop: 4,
              }}
            >
              {commentText.length}/300
            </div>
            {err && (
              <div style={{ color: "#D07070", fontSize: FONT.label, marginTop: 6, wordBreak: "break-word" }}>
                {err}
              </div>
            )}
          </div>
        )}

        {/* Comments list — قسم التعليقات: هو الجزء اللي ينسحب فعليًا لتحت مع
            pullY أثناء pull-to-refresh داخل صفحة المنشور المفتوح (المنشور
            نفسه وصندوق كتابة تعليق جديد يفضلوا ثابتين). المرساة أسفله ثابتة
            (خارج التحويل) عشان تفعّل السحب لما توصل بداية التعليقات فعليًا،
            حتى لو المنشور نفسه لسة يقدر يتمرّر لفوق أكثر (بدل ما يشترط
            الوصول لقمة الصفحة المطلقة اللي ممكن تكون بعيدة عن التعليقات). */}
        <div ref={pullAnchorRef} style={{ height: 0 }} aria-hidden />
        <motion.div style={{ y: pullY }}>
          {(activePost?.comments || []).length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: CL.textMuted }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <IconMessageCircle size={38} color={CL.textMuted} />
              </div>
              <div style={{ fontSize: FONT.heading, marginBottom: 5 }}>{s.noComments}</div>
              <div style={{ fontSize: FONT.body }}>{s.noCommentsSub}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {(activePost?.comments || [])
                .filter((c) => isEntityVisible(c.votes, FLAG_HIDE_LIMIT))
                .map((c) => (
                  <CommentItem
                    key={c.id}
                    c={c}
                    activePost={activePost}
                    deviceHash={deviceHash}
                    ownedComments={ownedComments}
                    ownedReplies={ownedReplies}
                    editingCommentId={editingCommentId}
                    setEditingCommentId={setEditingCommentId}
                    editCommentText={editCommentText}
                    setEditCommentText={setEditCommentText}
                    saveEditComment={saveEditComment}
                    editingReplyInfo={editingReplyInfo}
                    setEditingReplyInfo={setEditingReplyInfo}
                    editReplyText={editReplyText}
                    setEditReplyText={setEditReplyText}
                    saveEditReply={saveEditReply}
                    deleteComment={deleteComment}
                    deleteReply={deleteReply}
                    cancelEdit={cancelEdit}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    addReply={addReply}
                    isReplying2={isReplying2}
                    replyMdFile={replyMdFile}
                    setReplyMdFile={setReplyMdFile}
                    replyVideoUrl={replyVideoUrl}
                    setReplyVideoUrl={setReplyVideoUrl}
                    replyingToId={replyingToId}
                    expandedIds={expandedIds}
                    toggleReplies={toggleReplies}
                    startReply={startReply}
                    openMenuFor={openMenuFor}
                    setOpenMenuFor={setOpenMenuFor}
                    copyItemText={copyItemText}
                    shareItemText={shareItemText}
                    updateVotes={updateVotes}
                    openMdEditor={openMdEditor}
                    isBanned={isBanned}
                    err={err}
                    setErr={setErr}
                    CL={CL}
                    BORDERS={BORDERS}
                    isMobile={isMobile}
                    s={s}
                    btn0={btn0}
                    btnPrimary={btnPrimary}
                    btnSecondary={btnSecondary}
                    inputBase={inputBase}
                    R={R}
                  />
                ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
