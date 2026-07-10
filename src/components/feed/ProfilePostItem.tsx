import { FONT, RADIUS, CATS, TRANSITIONS } from "../../constants/index";
import { timeAgo } from "../../utils/index";
import { IconMessageCircle } from "../Icons";

export default function ProfilePostItem({
  p,
  onClick,
  s,
  CL,
  R,
  cardStyle,
}) {
  const ci = CATS[p.category] || CATS["عام"];
  const commentCount = (p.comments || []).length;

  return (
    <div
      id={`profile-post-card-${p.id}`}
      data-pressable="card"
      onClick={() => onClick && onClick(p.id)}
      style={{
        ...cardStyle,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        transition: TRANSITIONS.colorChange,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        <span
          style={{
            background: ci.bg,
            color: ci.color,
            padding: "3px 10px",
            borderRadius: RADIUS.pill,
            fontSize: FONT.caption,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {s.cat(p.category)}
        </span>
        <span style={{ fontSize: R.metaFont, color: CL.textMuted }}>
          {timeAgo(p.timestamp, s)}
        </span>
      </div>
      <p
        style={{
          margin: "0 0 8px",
          fontSize: R.bodyText,
          lineHeight: 1.7,
          color: CL.text,
          wordBreak: "break-word",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {p.text}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: CL.textMuted,
          fontSize: FONT.caption,
        }}
      >
        <span style={{ display: "flex" }}>
          <IconMessageCircle size={13} color={CL.textMuted} />
        </span>
        <span>{commentCount}</span>
      </div>
    </div>
  );
}
