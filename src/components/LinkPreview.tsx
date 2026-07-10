import { useState, useEffect } from "react";
import { RADIUS, FONT } from "../constants/index";

export function LinkPreview({ url, CL, BORDERS }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!url) {
      const t = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(t);
    }
    
    // Check cache
    const cacheKey = `link_preview_${url}`;
    const cached = window.sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const t = setTimeout(() => {
          setData(parsed);
          setLoading(false);
        }, 0);
        return () => clearTimeout(t);
      } catch {}
    }

    const t0 = setTimeout(() => setLoading(true), 0);
    window.fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.status === "success" && json.data) {
          const result = {
            title: json.data.title || "",
            description: json.data.description || "",
            image: json.data.image?.url || "",
            url: json.data.url || url,
            publisher: json.data.publisher || "",
          };
          setData(result);
          window.sessionStorage.setItem(cacheKey, JSON.stringify(result));
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setError(true);
        setLoading(false);
      });
      
    return () => { isMounted = false; clearTimeout(t0); };
  }, [url]);

  if (loading) {
    return (
      <div style={{
        marginTop: 8, marginBottom: 8, height: 60, borderRadius: RADIUS.md,
        background: CL.borderFaint, border: BORDERS.default, opacity: 0.5,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: CL.textSub
      }}>
        ...
      </div>
    );
  }

  if (error || !data || (!data.title && !data.description && !data.image)) return null;

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        marginTop: 8,
        marginBottom: 8,
        borderRadius: RADIUS.md,
        border: BORDERS.default,
        overflow: "hidden",
        background: CL.surface,
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.opacity = "0.9";
        e.currentTarget.style.transform = "scale(0.995)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {data.image && (
        <div style={{
          width: "100%", height: 160, background: CL.borderFaint,
          backgroundImage: `url(${data.image})`, backgroundSize: "cover", backgroundPosition: "center"
        }} />
      )}
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        {data.title && (
          <div style={{ fontSize: FONT.body, fontWeight: 700, color: CL.text, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {data.title}
          </div>
        )}
        {data.description && (
          <div style={{ fontSize: FONT.caption, color: CL.textMuted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {data.description}
          </div>
        )}
        {(data.publisher || data.url) && (
          <div style={{ fontSize: 11, color: CL.textSub, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {data.publisher || new window.URL(data.url).hostname}
          </div>
        )}
      </div>
    </a>
  );
}
