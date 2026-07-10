import { FONT } from "../../constants/index";
import { renderMarkdown } from "../../utils/index";

export default function PreviewPane({ content, isMobile, CL, s }) {
  return (
    <div
      className="md-render-scope"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: isMobile ? "16px" : "18px 24px",
        minHeight: 0,
      }}
    >
      {(content || "").trim() ? (
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: CL.textMuted,
            fontSize: FONT.body,
          }}
        >
          {s.mdEditorPreviewEmpty}
        </div>
      )}
    </div>
  );
}
