import { RADIUS, FONT, TRANSITIONS } from "../constants/index";
import { IconCheck } from "./Icons";

export function PollRenderer({ poll, postId, CL, BORDERS, s, handlePollVote, deviceHash }) {
  if (!poll || !poll.options || poll.options.length === 0) return null;

  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
  const myVote = poll.votedBy ? poll.votedBy[deviceHash] : null;
  const hasVoted = myVote !== null && myVote !== undefined;

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      style={{ 
        marginTop: 8, 
        marginBottom: 8, 
        padding: "14px 12px", 
        background: CL.borderFaint, 
        border: BORDERS.default, 
        borderRadius: RADIUS.md 
      }}
    >
      {poll.options.map((opt) => {
        const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
        const isSelected = myVote === opt.id;
        
        return (
          <div key={opt.id} style={{ marginBottom: 8, position: "relative" }}>
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                if (handlePollVote) handlePollVote(postId, opt.id); 
              }}
              style={{
                width: "100%",
                background: isSelected ? CL.surface : "transparent",
                border: isSelected ? `2.5px solid ${CL.accent}` : BORDERS.default,
                borderRadius: RADIUS.sm,
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                color: isSelected ? CL.accent : CL.text,
                fontSize: 14,
                position: "relative",
                zIndex: 1,
                overflow: "hidden",
                transition: TRANSITIONS.colorChange,
                textAlign: s.d === "rtl" ? "right" : "left",
                minHeight: 44
              }}
            >
              {/* Progress Fill Layer */}
              <div 
                style={{ 
                  position: "absolute", 
                  left: 0, 
                  top: 0, 
                  bottom: 0, 
                  width: `${percent}%`, 
                  background: isSelected ? CL.accentDim : CL.borderFaint, 
                  zIndex: -1, 
                  transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  opacity: 0.5
                }} 
              />
              
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                {isSelected && <IconCheck size={16} color={CL.accent} strokeWidth={3} />}
                <span style={{ fontWeight: isSelected ? 800 : 500, flex: 1 }}>{opt.text}</span>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: FONT.label, fontWeight: 800, color: isSelected ? CL.accent : CL.textSub }}>
                  {percent}%
                </span>
                {hasVoted && (
                  <span style={{ fontSize: 10, color: CL.textMuted, opacity: 0.8 }}>
                    {opt.votes}
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        fontSize: 11, 
        color: CL.textMuted, 
        marginTop: 6,
        padding: "0 4px"
      }}>
        <span>{totalVotes} {s.d === "rtl" ? "صوت" : "votes"}</span>
        {hasVoted && <span style={{ fontStyle: "italic", opacity: 0.8 }}>{s.d === "rtl" ? "تم التصويت" : "Voted"}</span>}
      </div>
    </div>
  );
}
