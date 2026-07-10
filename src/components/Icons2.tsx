import React from "react";
import { useId } from "react";
import { IconThumbsUp, IconHandshake, IconHeart, IconSparkles, IconFlag } from "./Icons1";
const svgBase = (size, color, strokeWidth) => ({  width: size, height: size, viewBox: "0 0 24 24", fill: "none",  stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,});

export const IconSearch = ({ size = 15, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const IconBell = ({ size = 16, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const IconSprout = ({ size = 32, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <circle cx="12" cy="12" r="9.4" strokeDasharray="13.6 6.2" transform="rotate(-90 12 12)" />
    <circle cx="12" cy="12" r="6.2" fill={color} stroke="none" />
  </svg>
);

export const IconClock = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const IconStar = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M11.53 2.22a.5.5 0 0 1 .94 0l2.31 5.06a.5.5 0 0 0 .4.29l5.5.5a.5.5 0 0 1 .29.88l-4.15 3.73a.5.5 0 0 0-.16.49l1.27 5.4a.5.5 0 0 1-.75.55l-4.74-2.9a.5.5 0 0 0-.52 0l-4.74 2.9a.5.5 0 0 1-.75-.55l1.27-5.4a.5.5 0 0 0-.16-.49L2.29 8.95a.5.5 0 0 1 .29-.88l5.5-.5a.5.5 0 0 0 .4-.29z" />
  </svg>
);

export const IconMail = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const IconFileText = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

export const IconSun = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

export const IconMoon = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

export const IconCopy = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

export const IconX = ({ size = 15, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconDownload = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

export const IconMonitor = ({ size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

export const IconCheck = ({ size = 15, color = "currentColor", strokeWidth = 2.5 }) => (
  <svg {...svgBase(size, color, strokeWidth)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// مكوّن تحميل مستقل مبني على شكل IconSprout — الشكل ثابت تمامًا في مكانه
// (بدون أي دوران) واللون "يمتلئ" فيه من الأسفل للأعلى كسائل، بشكل متكرر.
// معزول تمامًا عن IconSprout الثابتة كي لا يتأثر أي استخدام آخر لها.
export const IconSproutLoader = ({ size = 32, color = "currentColor", strokeWidth = 2, duration = 1.6, label = "جاري التحميل" }) => {
  // معرّف فريد للـ mask لتفادي أي تعارض عند استخدام أكثر من نسخة بنفس الصفحة
  const maskId = `sprout-fill-${useId()}`;

  // نطاق الشكل الرأسي بالكامل (حلقة + دائرة) داخل viewBox 24x24، مع هامش أمان بسيط
  const top = 1.5;
  const bottom = 22.5;
  const fullHeight = bottom - top;

  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      strokeLinecap="round" strokeLinejoin="round"
      role="status" aria-label={label}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
          <rect x="0" y={bottom} width="24" height="0" fill="#fff">
            <animate
              attributeName="y"
              values={`${bottom};${top};${top};${bottom}`}
              keyTimes="0;0.45;0.55;1"
              dur={`${duration}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="height"
              values={`0;${fullHeight};${fullHeight};0`}
              keyTimes="0;0.45;0.55;1"
              dur={`${duration}s`}
              repeatCount="indefinite"
            />
          </rect>
        </mask>
      </defs>

      {/* الحالة الفارغة: نفس الشكل بالضبط بلون باهت جدًا، ثابت بلا حركة */}
      <g opacity="0.18" stroke={color} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="9.4" strokeDasharray="13.6 6.2" transform="rotate(-90 12 12)" />
        <circle cx="12" cy="12" r="6.2" fill={color} stroke="none" />
      </g>

      {/* الحالة الممتلئة: نفس الشكل بلون كامل، مقصوصة بالـ mask المتحرك */}
      <g stroke={color} strokeWidth={strokeWidth} mask={`url(#${maskId})`}>
        <circle cx="12" cy="12" r="9.4" strokeDasharray="13.6 6.2" transform="rotate(-90 12 12)" />
        <circle cx="12" cy="12" r="6.2" fill={color} stroke="none" />
      </g>
    </svg>
  );
};

export const REACTION_ICONS = {
  helpful: IconThumbsUp,
  agree: IconHandshake,
  relatable: IconHeart,
  inspiring: IconSparkles,
  flag: IconFlag,
};
