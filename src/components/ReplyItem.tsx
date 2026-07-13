import { IconReply, IconPencil } from "./Icons";
import { FONT, RADIUS } from "../constants/index";
import { timeAgo } from "../utils/index";
import ActionMenuButton from "./ActionMenuButton";
import ReactionRow from "./ReactionRow";
import { MdBadge } from "./MdBadge";
import { LinkPreview } from "./LinkPreview";
import { TextWithLinks, extractFirstUrl } from "./TextWithLinks";
import { VideoPlayer } from "./VideoPlayer";

export default function ReplyItem({
  r,
  commentId,
  activePost,
  deviceHash,
  ownedReplies,
  editingReplyInfo,
  setEditingReplyInfo,
  editReplyText,
  setEditReplyText,
  saveEditReply,
  deleteReply,
  cancelEdit,
  openMenuFor,
  setOpenMenuFor,
  copyItemText,
  shareItemText,
  updateVotes,
  isMobile,
  s,
  CL,
  BORDERS,
  btn0,
  btnPrimary,
  btnSecondary,
  inputBase,
  R,
  err,
}) {
  const isEditingThisReply = editingReplyInfo?.replyId === r.id;

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        position: "relative",
        zIndex: openMenuFor === `reply-${r.id}` ? 60 : "auto",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 20,
          height: 20,
          borderRadius: RADIUS.circle,
          background: CL.replyDim,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconReply size={10} color={CL.reply} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 4,
            gap: 6,
          }}
        >
          <span style={{ fontSize: R.metaFont, color: CL.textMuted }}>
            {timeAgo(r.timestamp, s)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: R.gap, flexWrap: "wrap" }}>
            {r.edited && (
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
            <ActionMenuButton
              menuKey={`reply-${r.id}`}
              text={r.text}
              url={`https://inkore.vercel.app/post/${activePost.id}`}
              isOwner={!!ownedReplies[r.id]}
              onEdit={() => {
                setEditingReplyInfo({ commentId, replyId: r.id });
                setEditReplyText(r.text);
              }}
              onDelete={() => deleteReply(activePost.id, commentId, r.id)}
              openMenuFor={openMenuFor}
              setOpenMenuFor={setOpenMenuFor}
              copyItemText={copyItemText}
              shareItemText={shareItemText}
              CL={CL}
              BORDERS={BORDERS}
              isMobile={isMobile}
              s={s}
              btn0={btn0}
            />
          </div>
        </div>

        {isEditingThisReply ? (
          <div>
            <textarea
              value={editReplyText}
              onChange={(e) => setEditReplyText(e.target.value)}
              maxLength={300}
              autoFocus
              rows={2}
              dir="auto"
              style={{
                ...inputBase,
                width: "100%",
                border: BORDERS.reply,
                fontSize: isMobile ? 16 : 12,
                minHeight: isMobile ? 56 : 46,
                resize: "vertical",
                fontFamily: s.font,
                lineHeight: 1.4,
              }}
            />
            {err && (
              <div style={{ color: "#D07070", fontSize: FONT.caption, marginTop: 4 }}>
                {err}
              </div>
            )}
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              <button
                onClick={() => saveEditReply(activePost.id, commentId, r.id)}
                style={{
                  ...btnPrimary,
                  padding: isMobile ? "8px 12px" : "6px 10px",
                  fontSize: FONT.caption,
                }}
              >
                {s.editSave}
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  ...btnSecondary,
                  padding: isMobile ? "8px 12px" : "6px 10px",
                  fontSize: FONT.caption,
                }}
              >
                {s.editCancel}
              </button>
            </div>
          </div>
        ) : (
          <>
            <TextWithLinks text={r.text} CL={CL} style={{ margin: "0 0 6px", fontSize: R.replyText, lineHeight: 1.65, color: CL.text, wordBreak: "break-word" }} />
            <LinkPreview url={extractFirstUrl(r.text)} CL={CL} BORDERS={BORDERS} />
            {r.mdFile && (
              <MdBadge
                file={r.mdFile}
                CL={CL}
                BORDERS={BORDERS}
                isMobile={isMobile}
                s={s}
                btn0={btn0}
              />
            )}
            {r.videoUrl && (
              <VideoPlayer
                url={r.videoUrl}
                CL={CL}
                BORDERS={BORDERS}
              />
            )}
            <div style={{ marginTop: 6 }}>
              <ReactionRow
                postId={activePost.id}
                commentId={commentId}
                replyId={r.id}
                votes={r.votes}
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
          </>
        )}
      </div>
    </div>
  );
}
