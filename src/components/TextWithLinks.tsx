
const urlRegex = /(https?:\/\/[^\s]+)/g;
const mentionRegex = /(@[a-zA-Z0-9_]+)/g;

export function extractFirstUrl(text) {
  if (!text) return null;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}

export function TextWithLinks({ text, CL, style }) {
  if (!text) return null;

  const urlParts = text.split(urlRegex);

  return (
    <p style={style}>
      {urlParts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: CL.accent, textDecoration: "underline", wordBreak: "break-all" }}
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }

        const mentionParts = part.split(mentionRegex);
        return mentionParts.map((subPart, j) => {
          if (subPart.match(mentionRegex)) {
            return (
              <span
                key={`${i}-${j}`}
                style={{ color: CL.accent, fontWeight: 700, background: CL.accentDim, padding: "0 4px", borderRadius: 4, cursor: "pointer" }}
              >
                {subPart}
              </span>
            );
          }
          return subPart;
        });
      })}
    </p>
  );
}
