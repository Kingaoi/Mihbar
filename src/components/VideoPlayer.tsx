import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { ANIMATIONS } from "../constants/index";

// Global state to synchronize playing status of video URLs across different views/pages (e.g. Feed to Thread View)
const playingUrls = new Set<string>();
const listeners = new Set<() => void>();

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setVideoPlaying(url, isPlaying) {
  if (isPlaying) {
    playingUrls.add(url);
  } else {
    playingUrls.delete(url);
  }
  listeners.forEach(l => l());
}

// This component manages embedding and rendering media from external links like YouTube/Vimeo
// as well as providing a secure fallback for direct HTML5 video links.
export function VideoPlayer({ url, CL, BORDERS, isViewActive = true }) {
  const [globalPlaying, setGlobalPlaying] = useState(() => playingUrls.has(url));

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setGlobalPlaying(playingUrls.has(url));
    });
    return unsubscribe;
  }, [url]);

  const isPlaying = globalPlaying && isViewActive;

  // Helpers to check YouTube/Vimeo IDs
  const getYouTubeId = (urlStr) => {
    if (!urlStr) return null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = urlStr.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch {
      return null;
    }
  };

  const getVimeoId = (urlStr) => {
    if (!urlStr) return null;
    try {
      const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
      const match = urlStr.match(regExp);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  const ytId = getYouTubeId(url);
  const vmId = getVimeoId(url);

  // Unconditional state & effects for Vimeo thumbnail fetch
  const [vimeoThumb, setVimeoThumb] = useState(null);
  useEffect(() => {
    if (vmId) {
      window.fetch(`https://vimeo.com/api/v2/video/${vmId}.json`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].thumbnail_large) {
            setVimeoThumb(data[0].thumbnail_large);
          }
        })
        .catch(() => {});
    }
  }, [vmId]);

  // Early return if URL is missing
  if (!url) return null;

  const containerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    background: "#000",
    border: BORDERS.default,
    boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
    margin: "14px 0",
  };

  // Inline CSS to support gorgeous hover transitions synced with system theme colors
  const hoverStyles = (
    <style>{`
      .video-container-wrapper {
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .video-container-wrapper:hover {
        transform: scale(1.015);
      }
      .video-cover-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
        background: #000;
        background-size: cover;
        background-position: center;
      }
      .video-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%);
        transition: all 0.4s ease;
      }
      .video-cover-container:hover .video-overlay {
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.45) 100%);
      }
      .video-play-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(1);
        width: 76px;
        height: 76px;
        border-radius: 50%;
        background: rgba(15, 15, 15, 0.75) !important;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 2px solid rgba(255, 255, 255, 0.35) !important;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff !important;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255,255,255,0.2);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        z-index: 2;
        padding: 0;
        margin: 0;
        cursor: pointer;
        outline: none;
      }
      .video-play-btn-pulse {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(1);
        width: 76px;
        height: 76px;
        border-radius: 50%;
        background: ${CL.accent || "#ff6b4a"};
        opacity: 0.3;
        z-index: 1;
        pointer-events: none;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        animation: ${ANIMATIONS.pulse};
      }
      .video-cover-container:hover .video-play-btn {
        transform: translate(-50%, -50%) scale(1.14) !important;
        background: ${CL.accent || "#ff6b4a"} !important;
        border-color: #ffffff !important;
        box-shadow: 0 20px 44px ${CL.accent || "#ff6b4a"}80, inset 0 1px 1px rgba(255,255,255,0.3) !important;
      }
      .video-cover-container:hover .video-play-btn-pulse {
        transform: translate(-50%, -50%) scale(1.7) !important;
        opacity: 0 !important;
      }
      .video-play-icon {
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), fill 0.35s ease;
      }
      .video-cover-container:hover .video-play-icon {
        transform: scale(1.12);
      }
    `}</style>
  );

  // Modern play triangle path with rounded corners.
  // Set margin-left to exactly 2px to balance the physical asymmetry of a play triangle flawlessly.
  const playIconSvg = (
    <svg 
      className="video-play-icon" 
      width="28" 
      height="28" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      style={{
        display: "block",
        marginLeft: "2px" // Symmetrical optical alignment
      }}
    >
      <path d="M8 5.14c0-.85.91-1.39 1.66-.97l10.3 5.88c.78.44.78 1.57 0 2.01l-10.3 5.88c-.75.42-1.66-.12-1.66-.97V5.14z" />
    </svg>
  );

  if (ytId) {
    // Max resolution (1080p/720p HD) thumbnail as primary, fallback automatically handled
    const maxResThumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    const hqThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

    return (
      <div 
        className="video-container-wrapper"
        style={containerStyle}
        onClick={(e) => e.stopPropagation()} // Stop navigation click on post cards
      >
        {hoverStyles}
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          {isPlaying ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
              title="YouTube Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          ) : (
            <div 
              className="video-cover-container"
              onClick={() => setVideoPlaying(url, true)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                // CSS multiple background syntax provides a perfect higher-quality image fallback
                backgroundImage: `url(${maxResThumb}), url(${hqThumb})`,
              }}
            >
              <div className="video-overlay" />
              <div className="video-play-btn-pulse" />
              <button className="video-play-btn">
                {playIconSvg}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (vmId) {
    return (
      <div 
        className="video-container-wrapper"
        style={containerStyle}
        onClick={(e) => e.stopPropagation()} // Stop navigation click on post cards
      >
        {hoverStyles}
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          {isPlaying ? (
            <iframe
              src={`https://player.vimeo.com/video/${vmId}?autoplay=1`}
              title="Vimeo Video Player"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          ) : (
            <div 
              className="video-cover-container"
              onClick={() => setVideoPlaying(url, true)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundImage: vimeoThumb ? `url(${vimeoThumb})` : "linear-gradient(135deg, #1e1e1e, #0e0e0e)",
              }}
            >
              <div className="video-overlay" />
              <div className="video-play-btn-pulse" />
              <button className="video-play-btn">
                {playIconSvg}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Fallback: Direct HTML5 Video Player
  return (
    <div 
      style={containerStyle}
      onClick={(e) => e.stopPropagation()} // Stop navigation click on post cards
    >
      <video
        src={url}
        controls
        playsInline
        style={{
          width: "100%",
          maxHeight: 380,
          display: "block",
          objectFit: "contain",
        }}
        onError={() => {
          console.log("Direct video load failed, fallback to external link");
        }}
      >
        <div style={{ padding: "16px", color: CL.textMuted, textAlign: "center", fontSize: 13 }}>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: CL.accent, fontWeight: "bold", textDecoration: "underline" }}>
            {url}
          </a>
        </div>
      </video>
    </div>
  );
}

export default VideoPlayer;
