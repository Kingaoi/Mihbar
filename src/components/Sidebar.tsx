import { IconUser } from "./Icons";
import { FONT, RADIUS, CATS } from "../constants/index";

// Desktop aside sidebar containing the user quick-profile metrics and categories filter list
export default function Sidebar({
  setProfilePageOpen,
  myPosts,
  myComments,
  myTotalReactions,
  catFilter,
  setCatFilter,
  CL,
  s,
  btn0,
  cardStyle,
}) {
  return (
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        position: "sticky",
        top: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ ...cardStyle, cursor: "pointer" }} onClick={() => setProfilePageOpen(true)}>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center", marginBottom: 12 }}>
          {[
            { n: myPosts.length, label: s.profileStatPosts, key: "posts" },
            { n: myComments.length, label: s.profileStatComments, key: "comments" },
            { n: myTotalReactions, label: s.profileStatReactions, key: "reactions" },
          ].map((st) => (
            <div key={st.key}>
              <div style={{ fontSize: FONT.heading, fontWeight: 800, color: CL.accent }}>{st.n}</div>
              <div style={{ fontSize: FONT.micro, color: CL.textMuted, marginTop: 2 }}>{st.label}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: FONT.caption,
            color: CL.edit,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
        >
          <IconUser size={13} color={CL.edit} /> {s.sidebarViewProfile}
        </div>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            fontSize: FONT.label,
            fontWeight: 700,
            color: CL.textMuted,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {s.sidebarCatsTitle}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button
            onClick={() => setCatFilter(null)}
            style={{
              ...btn0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              textAlign: s.d === "rtl" ? "right" : "left",
              padding: "8px 10px",
              borderRadius: RADIUS.md,
              background: catFilter === null ? CL.accentDim : "transparent",
              border: catFilter === null ? `1px solid ${CL.accentBorder}` : "1px solid transparent",
              color: catFilter === null ? CL.accent : CL.textSub,
              fontSize: FONT.body,
              fontWeight: catFilter === null ? 700 : 500,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: CL.textMuted, flexShrink: 0 }} />
            {s.sidebarCatAll}
          </button>
          {Object.keys(CATS).map((catKey) => {
            const ci = CATS[catKey];
            const active = catFilter === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setCatFilter(active ? null : catKey)}
                style={{
                  ...btn0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  textAlign: s.d === "rtl" ? "right" : "left",
                  padding: "8px 10px",
                  borderRadius: RADIUS.md,
                  background: active ? ci.bg : "transparent",
                  border: active ? `1px solid ${ci.color}55` : "1px solid transparent",
                  color: active ? ci.color : CL.textSub,
                  fontSize: FONT.body,
                  fontWeight: active ? 700 : 500,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: ci.color, flexShrink: 0 }} />
                {s.cat(catKey)}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
