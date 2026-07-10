import React from "react";
import { ANIMATIONS } from "../constants/index";

/**
 * لودر مِحبار الاحترافي
 * مبني على تصميم المستخدم الأصلي: نواة متوهجة بتدرج لوني + حلقة دوّارة
 * الألوان مأخوذة من هوية الموقع (accent) بدل الألوان الثابتة، عشان يتكيف مع الوضع الفاتح/الداكن تلقائيًا.
 */
export default function Loader({ size = 60, accent = "#D97757", ringColor = "#8A7260" }) {
  const gradId = React.useId();
  const glowId = React.useId();
  const ringId = React.useId();

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "inline-block",
        animation: ANIMATIONS.spinner,
      }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
            <stop offset="100%" stopColor={accent} />
          </linearGradient>
          <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ringColor} stopOpacity="0.55" />
            <stop offset="100%" stopColor={ringColor} />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeWidth="8" opacity="0.12" />
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke={`url(#${ringId})`}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray="112 51"
          transform="rotate(-90 100 100)"
        />
        <circle cx="100" cy="100" r="52" fill={`url(#${gradId})`} filter={`url(#${glowId})`} />
      </svg>
    </div>
  );
}
