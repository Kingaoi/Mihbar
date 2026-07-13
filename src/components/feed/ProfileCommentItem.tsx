import { FONT, TRANSITIONS } from "../../constants/index";
import { timeAgo } from "../../utils/index";

export default function ProfileCommentItem({
  p,
  onClick,
  s,
  CL,
  R,
  cardStyle,
}) {
  return (
    <div
      id={`profile-comment-card-${p.id}`}
      data-pressable="card"
      onClick={() => onClick && onClick(p.postId || p.id)}
      style={{
        ...cardStyle,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        transition: TRANSITIONS.colorChange,
      }}
    >
      <div
        style={{
          fontSize: FONT.caption,
          color: CL.textMuted,
          marginBottom: 6,
          display: "flex",
          justifyContent: "space-between",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "70%",
          }}
        >
          {s.profileOnPost} {p.postText}
        </span>
        <span style={{ flexShrink: 0 }}>{timeAgo(p.timestamp, s)}</span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: R.bodyText,
          lineHeight: 1.7,
          color: CL.text,
          wordBreak: "break-word",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {p.text}
      </p>
    </div>
  );
}
