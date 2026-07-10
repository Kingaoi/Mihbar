const svgBase = (size, color, strokeWidth) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

export const IconThumbsUp = ({ size = 15, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M7 10v11" />
    <path d="M11 21h6.5a2 2 0 0 0 2-1.6l1.2-7A2 2 0 0 0 18.7 10H14V5a2 2 0 0 0-2-2l-3 7v11Z" />
  </svg>
);

export const IconHandshake = ({ size = 15, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="m11 17 2 2a1 1 0 0 0 3-3" />
    <path d="m14 14 2.5 2.5a1 1 0 0 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 0 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
    <path d="m21 3 1 11h-2" />
    <path d="M3 3 2 14l6.5 6.5a1 1 0 0 0 3-3" />
    <path d="M3 4h8" />
  </svg>
);

export const IconHeart = ({ size = 15, color = "currentColor", strokeWidth = 2, filled = false }) => (
  <svg {...svgBase(size, color, strokeWidth)} fill={filled ? color : "none"}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const IconSparkles = ({ size = 15, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
);

export const IconFlag = ({ size = 15, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <path d="M4 22v-7" />
  </svg>
);

export const IconMessageCircle = ({ size = 15, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export const IconReply = ({ size = 15, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);

export const IconPencil = ({ size = 13, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

export const IconTrash = ({ size = 13, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const IconArrowRight = ({ size = 16, color = "currentColor", strokeWidth = 2.2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export const IconLock = ({ size = 12, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const IconUnlock = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

export const IconUser = ({ size = 16, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const IconSettings = ({ size = 16, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconPaperclip = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

export const IconUpload = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

export const IconQuote = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
  </svg>
);

export const IconLink = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M9 17H7a5 5 0 0 1 0-10h2" />
    <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
    <line x1="8" x2="16" y1="12" y2="12" />
  </svg>
);

export const IconImage = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.1-3.1a2 2 0 0 0-2.83 0L6 21" />
  </svg>
);

export const IconPause = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <rect x="14" y="4" width="4" height="16" rx="1" />
    <rect x="6" y="4" width="4" height="16" rx="1" />
  </svg>
);

export const IconAlertTriangle = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);
