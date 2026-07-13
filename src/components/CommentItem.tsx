import { useState } from "react";
import { IconLock, IconPencil, IconMessageCircle, IconReply } from "./Icons";
import { FONT, RADIUS, TRANSITIONS, ANIMATIONS, FLAG_HIDE_LIMIT } from "../constants/index";
import { timeAgo } from "../utils/index";
import { isEntityVisible } from "../utils/dataLayer";
import ActionMenuButton from "./ActionMenuButton";
import ReactionRow from "./ReactionRow";
import { MdBadge } from "./MdBadge";
import { LinkPreview } from "./LinkPreview";
import { TextWithLinks, extractFirstUrl } from "./TextWithLinks";
import { MdAttachRow } from "./MdAttachRow";
import { VideoPlayer } from "./VideoPlayer";
import ReplyItem from "./ReplyItem";

export default function CommentItem({
  c,
  activePost,
  deviceHash,
  ownedComments,
  ownedReplies,
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
  deleteComment,
  deleteReply,
  cancelEdit,
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
  onSave = undefined,
  isSaved = false,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const replies = c.replies || [];
  const isExpanded = expandedIds[c.id];
  const isReplying = replyingToId === c.id;
  const showThread = (isExpanded || isReplying) && !isCollapsed;

  return (
    <div
      style={{
        position: "relative",
        zIndex: openMenuFor === `comment-${c.id}` ? 60 : "auto",
        borderBottom: `1px solid ${CL.borderFaint}`,
        paddingBottom: 12,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", gap: 9 }}>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: RADIUS.circle,
              background: CL.borderFaint,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconLock size={11} color={CL.textMuted} />
          </div>
          {showThread && (
            <div style={{ width: 2, flex: 1, minHeight: 16, background: CL.replyBorder, marginTop: 6 }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: R.gap, flexWrap: "wrap" }}>
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                style={{ 
                  background: CL.borderFaint, 
                  border: "none", 
                  color: CL.textMuted, 
                  cursor: "pointer", 
                  padding: "2px 6px", 
                  borderRadius: RADIUS.xs,
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  transition: TRANSITIONS.colorChange
                }}
              >
                {isCollapsed ? (s.d === "rtl" ? "+ إظهار" : "+ Show") : (s.d === "rtl" ? "- طي" : "- Hide")}
              </button>
              <span style={{ fontSize: R.metaFont, color: CL.textMuted }}>{timeAgo(c.timestamp, s)}</span>
              {c.edited && (
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
              menuKey={`comment-${c.id}`}
              text={c.text}
              url={`https://inkore.vercel.app/post/${activePost.id}`}
              isOwner={!!ownedComments[c.id]}
              onEdit={() => {
                setEditingCommentId(c.id);
                setEditCommentText(c.text);
              }}
              onDelete={() => deleteComment(activePost.id, c.id)}
              openMenuFor={openMenuFor}
              setOpenMenuFor={setOpenMenuFor}
              copyItemText={copyItemText}
              shareItemText={shareItemText}
              onSave={onSave}
              isSaved={isSaved}
              CL={CL}
              BORDERS={BORDERS}
              isMobile={isMobile}
              s={s}
              btn0={btn0}
            />
          </div>

          {isCollapsed ? (
            <div style={{ fontSize: 12, color: CL.textMuted, fontStyle: "italic", marginTop: 4 }}>
              {s.d === "rtl" ? "تم طي هذا التعليق" : "This comment is collapsed"}
            </div>
          ) : (
            <>
              {editingCommentId === c.id ? (
                <div style={{ marginBottom: 8 }}>
                  <textarea
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    maxLength={300}
                    autoFocus
                    rows={2}
                    dir="auto"
                    style={{
                      ...inputBase,
                      width: "100%",
                      border: BORDERS.edit,
                      minHeight: isMobile ? 60 : 50,
                      resize: "vertical",
                      fontFamily: s.font,
                      lineHeight: 1.4,
                    }}
                  />
                  {err && <div style={{ color: "#D07070", fontSize: FONT.caption, marginTop: 4 }}>{err}</div>}
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    <button onClick={() => saveEditComment(activePost.id, c.id)} style={btnPrimary}>
                      {s.editSave}
                    </button>
                    <button onClick={cancelEdit} style={btnSecondary}>
                      {s.editCancel}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <TextWithLinks text={c.text} CL={CL} style={{ margin: "0 0 8px", fontSize: R.commentText, lineHeight: 1.7, color: CL.text, wordBreak: "break-word" }} />
                  <LinkPreview url={extractFirstUrl(c.text)} CL={CL} BORDERS={BORDERS} />
                  {c.mdFile && (
                    <MdBadge
                      file={c.mdFile}
                      CL={CL}
                      BORDERS={BORDERS}
                      isMobile={isMobile}
                      s={s}
                      btn0={btn0}
                    />
                  )}
                  {c.videoUrl && (
                    <VideoPlayer url={c.videoUrl} CL={CL} BORDERS={BORDERS} />
                  )}
                </>
              )}
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <ReactionRow
                  postId={activePost.id}
                  commentId={c.id}
                  votes={c.votes}
                  deviceHash={deviceHash}
                  updateVotes={updateVotes}
                  CL={CL}
                  BORDERS={BORDERS}
                  isMobile={isMobile}
                  R={R}
                  btn0={btn0}
                  s={s}
                />
                {replies.length > 0 && (
                  <button
                    onClick={() => toggleReplies(c.id)}
                    style={{
                      ...btn0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: "transparent",
                      border: "none",
                      padding: "4px 2px",
                      color: isExpanded ? CL.reply : CL.textMuted,
                      fontSize: isMobile ? 12 : 11,
                      fontWeight: 700,
                      minHeight: isMobile ? 32 : "auto",
                      transition: TRANSITIONS.colorChange,
                    }}
                  >
                    <IconMessageCircle size={12} color={isExpanded ? CL.reply : CL.textMuted} />
                    {s.showReplies(replies.length)}
                  </button>
                )}
                {!isBanned && (
                  <button
                    onClick={() => startReply(c.id)}
                    style={{
                      ...btn0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: "transparent",
                      border: "none",
                      padding: "4px 2px",
                      color: isReplying ? CL.reply : CL.textMuted,
                      fontSize: isMobile ? 12 : 11,
                      fontWeight: 700,
                      minHeight: isMobile ? 32 : "auto",
                      transition: TRANSITIONS.colorChange,
                    }}
                  >
                    <IconReply size={12} color={isReplying ? CL.reply : CL.textMuted} />
                    {s.replyLabel}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showThread && (
        <div style={{ marginTop: 8, marginInlineStart: 35, display: "flex", flexDirection: "column", gap: 10 }}>
          {isExpanded &&
            replies
              .filter((r) => isEntityVisible(r.votes, FLAG_HIDE_LIMIT))
              .map((r) => (
                <ReplyItem
                  key={r.id}
                  r={r}
                  commentId={c.id}
                  activePost={activePost}
                  deviceHash={deviceHash}
                  ownedReplies={ownedReplies}
                  editingReplyInfo={editingReplyInfo}
                  setEditingReplyInfo={setEditingReplyInfo}
                  editReplyText={editReplyText}
                  setEditReplyText={setEditReplyText}
                  saveEditReply={saveEditReply}
                  deleteReply={deleteReply}
                  cancelEdit={cancelEdit}
                  openMenuFor={openMenuFor}
                  setOpenMenuFor={setOpenMenuFor}
                  copyItemText={copyItemText}
                  shareItemText={shareItemText}
                  updateVotes={updateVotes}
                  isMobile={isMobile}
                  s={s}
                  CL={CL}
                  BORDERS={BORDERS}
                  btn0={btn0}
                  btnPrimary={btnPrimary}
                  btnSecondary={btnSecondary}
                  inputBase={inputBase}
                  R={R}
                  err={err}
                />
              ))}

          {isReplying && (
            <div style={{ background: "rgba(167,139,204,0.07)", border: BORDERS.reply, borderRadius: RADIUS.md, padding: isMobile ? "10px" : "10px 12px" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <textarea
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    setErr("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
                      e.preventDefault();
                      addReply(activePost?.id, c.id);
                    }
                  }}
                  autoFocus
                  placeholder={s.replyPh}
                  maxLength={300}
                  rows={1}
                  dir="auto"
                  style={{
                    ...inputBase,
                    flex: 1,
                    border: BORDERS.reply,
                    fontSize: isMobile ? 16 : 13,
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
                  onClick={() => addReply(activePost?.id, c.id)}
                  disabled={isReplying2}
                  style={{
                    ...btn0,
                    background: CL.replyDim,
                    border: BORDERS.reply,
                    borderRadius: RADIUS.sm,
                    padding: "0 12px",
                    color: CL.reply,
                    fontSize: R.btnFont,
                    fontWeight: 700,
                    minHeight: isMobile ? 44 : 38,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    opacity: isReplying2 ? 0.7 : 1,
                    cursor: isReplying2 ? "default" : "pointer",
                  }}
                >
                  {isReplying2 ? (
                    <span
                      style={{
                        display: "inline-block",
                        width: 11,
                        height: 11,
                        border: `2px solid ${CL.replyBorder}`,
                        borderTopColor: CL.reply,
                        borderRadius: RADIUS.circle,
                        animation: ANIMATIONS.spinBtn,
                      }}
                    />
                  ) : (
                    <>
                      <span style={{ display: "flex" }}>
                        <IconReply size={13} color={CL.reply} />
                      </span>
                    </>
                  )}{" "}
                  {isReplying2 ? s.replyBtnPosting : s.replyBtn}
                </button>
              </div>
              <MdAttachRow
                target="reply"
                file={replyMdFile}
                onRemove={() => {
                  setReplyMdFile(null);
                }}
                openMdEditor={openMdEditor}
                videoUrl={replyVideoUrl}
                setVideoUrl={setReplyVideoUrl}
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
                  color: replyText.length > 260 ? "#D07070" : CL.textMuted,
                  marginTop: 4,
                }}
              >
                {replyText.length}/300
              </div>
              {err && (
                <div style={{ color: "#D07070", fontSize: FONT.label, marginTop: 6, wordBreak: "break-word" }}>
                  {err}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
