import { IconMessageCircle, IconPencil } from "../Icons";
import { FONT, RADIUS, CATS, TRANSITIONS } from "../../constants/index";
import { timeAgo } from "../../utils/index";
import { getFlagCount } from "../../utils/dataLayer";
import ActionMenuButton from "../ActionMenuButton";
import { MdBadge } from "../MdBadge";
import { PollRenderer } from "../PollRenderer";
import { LinkPreview } from "../LinkPreview";
import { TextWithLinks, extractFirstUrl } from "../TextWithLinks";
import { VideoPlayer } from "../VideoPlayer";
import ReactionRow from "../ReactionRow";

export default function FeedPostItem({
  p,
  onClick,
  s,
  CL,
  R,
  BORDERS,
  isMobile,
  btn0,
  isOwner,
  openMenuFor,
  setOpenMenuFor,
  onDelete,
  copyItemText,
  shareItemText,
  deviceHash,
  updateVotes, handlePollVote,
  editingPostId,
  setEditingPostId,
  editPostText,
  setEditPostText,
  saveEditPost,
  cancelEdit,
  err,
  threadPending,
  isLast = false,
  btnPrimary,
  btnSecondary,
  inputBase,
  activePostId,
  savedPosts,
  toggleSavePost,
}) {
  const ci = CATS[p.category] || CATS["عام"];
  const commentCount = (p.comments || []).length;
  const replyCount = (p.comments || []).reduce((a, c) => a + (c.replies || []).length, 0);
  const flagCount = getFlagCount(p.votes);

  return (
    <div
      id={`feed-item-card-${p.id}`}
      data-pressable="card"
      onClick={() => onClick && onClick(p.id)}
      style={{
        cursor: "pointer",
        opacity: flagCount > 1 ? 0.6 : 1,
        WebkitTapHighlightColor: "transparent",
        display: "flex",
        gap: 10,
        background: "transparent",
        margin: "0 -8px",
        padding: "12px 8px",
        borderBottom: isLast ? "none" : `1px solid ${CL.borderFaint}`,
        position: "relative",
        zIndex: openMenuFor === `post-${p.id}` ? 60 : "auto",
        transform: threadPending === p.id ? "scale(0.988)" : "scale(1)",
        transition:
          threadPending === p.id
            ? TRANSITIONS.press
            : `${TRANSITIONS.colorChange}, background-color 0.15s ease`,
        willChange: "transform",
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick(p.id);
        }}
        aria-label={s.cat(p.category)}
        style={{
          ...btn0,
          flexShrink: 0,
          width: isMobile ? 36 : 38,
          height: isMobile ? 36 : 38,
          borderRadius: RADIUS.circle,
          background: ci.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: FONT.heading,
          fontWeight: 800,
          color: ci.color,
          transition: TRANSITIONS.colorChange,
        }}
      >
        {s.cat(p.category)?.trim()?.charAt(0) || "•"}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 3,
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ color: ci.color, fontWeight: 700, fontSize: R.bodyText }}>
              {s.cat(p.category)}
            </span>
            <span style={{ fontSize: R.metaFont, color: CL.textMuted }}>
              · {timeAgo(p.timestamp, s)}
            </span>
            {p.edited && (
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
            {flagCount > 0 && (
              <span
                style={{
                  fontSize: FONT.micro,
                  color: CL.flag,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                ❌ {flagCount}
              </span>
            )}
          </div>
          <ActionMenuButton
            menuKey={`post-${p.id}`}
            text={p.text}
            url={`https://inkore.vercel.app/post/${p.id}`}
            isOwner={isOwner}
            onEdit={() => {
              setEditingPostId(p.id);
              setEditPostText(p.text);
            }}
            onDelete={() => onDelete(p.id)}
            openMenuFor={openMenuFor}
            setOpenMenuFor={setOpenMenuFor}
            copyItemText={copyItemText}
            shareItemText={shareItemText} onSave={() => toggleSavePost(p.id)} isSaved={savedPosts && savedPosts[p.id]}
            CL={CL}
            BORDERS={BORDERS}
            isMobile={isMobile}
            s={s}
            btn0={btn0}
          />
        </div>

        {editingPostId === p.id ? (
          <div style={{ marginBottom: 12 }} onClick={(e) => e.stopPropagation()}>
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
              <button onClick={() => saveEditPost(p.id)} style={btnPrimary}>
                {s.editSave}
              </button>
              <button onClick={cancelEdit} style={btnSecondary}>
                {s.editCancel}
              </button>
            </div>
          </div>
        ) : (
          <>
            <TextWithLinks text={p.text} CL={CL} style={{ margin: "0 0 8px", fontSize: R.bodyText, lineHeight: 1.7, color: CL.text, wordBreak: "break-word" }} />
            <LinkPreview url={extractFirstUrl(p.text)} CL={CL} BORDERS={BORDERS} />
            <PollRenderer poll={p.poll} postId={p.id} CL={CL} BORDERS={BORDERS} s={s} handlePollVote={handlePollVote} deviceHash={deviceHash} />
            {p.mdFile && (
              <MdBadge
                file={p.mdFile}
                CL={CL}
                BORDERS={BORDERS}
                isMobile={isMobile}
                s={s}
                btn0={btn0}
              />
            )}
            {p.videoUrl && (
              <VideoPlayer
                url={p.videoUrl}
                CL={CL}
                BORDERS={BORDERS}
                isViewActive={!activePostId}
              />
            )}
          </>
        )}

        {p.note && (
          <div
            style={{
              borderInlineStart: `3px solid ${ci.color}`,
              paddingInlineStart: 10,
              paddingTop: 4,
              paddingBottom: 4,
              marginBottom: 10,
              fontSize: FONT.label,
              color: CL.textSub,
              fontStyle: "italic",
              wordBreak: "break-word",
              display: "flex",
              gap: 6,
              alignItems: "flex-start",
            }}
          >
            <span>{p.note}</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginTop: 2, width: "100%" }}>
          <ReactionRow
            postId={p.id}
            commentId={null}
            votes={p.votes}
            deviceHash={deviceHash}
            updateVotes={updateVotes}
            CL={CL}
            BORDERS={BORDERS}
            isMobile={isMobile}
            R={R}
            btn0={btn0}
            s={s}
          />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick && onClick(p.id);
              }}
              style={{
                ...btn0,
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: CL.borderFaint,
                border: BORDERS.default,
                borderRadius: RADIUS.pill,
                padding: R.reactionPad,
                minHeight: isMobile ? 32 : "auto",
                color: CL.textMuted,
                fontSize: FONT.caption,
                fontWeight: 700,
                transition: TRANSITIONS.colorChange,
              }}
            >
              <span style={{ display: "flex" }}>
                <IconMessageCircle size={14} color={CL.textMuted} />
              </span>
              <span>{commentCount + replyCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
