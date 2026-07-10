import { useState } from "react";
import { REACTION_ICONS } from "./Icons";
import { REACTIONS, RADIUS, TRANSITIONS, ANIMATIONS } from "../constants/index";
import { hasDeviceReacted } from "../utils/dataLayer";

export default function ReactionRow({
  postId,
  commentId,
  replyId = null,
  votes,
  deviceHash,
  updateVotes,
  CL,
  BORDERS,
  isMobile,
  R,
  btn0,
  s
}) {
  const [floats, setFloats] = useState([]);

  return (
    <div style={{ display: "flex", gap: isMobile ? 4 : 5, flexWrap: "wrap", alignItems: "center" }}>
      {REACTIONS.map((r) => {
        const hasVoted = hasDeviceReacted(votes, r.key, deviceHash);
        const count = votes?.[r.key] || 0;
        const Icon = REACTION_ICONS[r.key];
        const iconColor = hasVoted ? (r.isModeration ? CL.flag : CL.accent) : CL.textMuted;
        return (
          <div key={r.key} style={{ position: "relative", display: "inline-flex" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateVotes(postId, commentId, r.key, replyId);

                const floatId = Date.now() + Math.random();
                const labelText = s?.[r.labelKey] || r.key;
                setFloats(prev => [...prev, { id: floatId, text: labelText, key: r.key }]);
                setTimeout(() => {
                  setFloats(prev => prev.filter(f => f.id !== floatId));
                }, 1000);
              }}
              style={{
                ...btn0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                background: hasVoted ? (r.isModeration ? CL.flagDim : CL.accentDim) : CL.borderFaint,
                border: hasVoted ? (r.isModeration ? BORDERS.flag : BORDERS.accent) : BORDERS.default,
                borderRadius: RADIUS.pill,
                padding: R.reactionPad,
                minHeight: isMobile ? 32 : "auto",
                color: iconColor,
                fontSize: R.reactionFontSize,
                fontWeight: 700,
                transition: TRANSITIONS.colorChange,
              }}
            >
              <span style={{ lineHeight: 1, display: "flex" }}>
                <Icon size = { 14 } color = { iconColor } filled = { r.key === "relatable" && hasVoted } />
              </span>
              {count > 0 && <span>{count}</span>}
            </button>
            {floats.filter(f => f.key === r.key).map(f => (
              <span
                key={f.id}
                style={{
                  position: "absolute",
                  bottom: "115%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: r.isModeration ? CL.flag : CL.accent,
                  color: "#ffffff",
                  padding: "4px 8px",
                  borderRadius: RADIUS.md || 6,
                  fontSize: 10,
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  zIndex: 9999,
                  boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
                  animation: ANIMATIONS.reactionFloat,
                }}
              >
                {f.text}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
