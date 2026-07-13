import { motion, useTransform, type MotionValue } from "motion/react";
import { IconSproutLoader } from "./Icons";

// سهم بسيط يدور 180° لما تتجاوز مسافة السحب نقطة التفعيل (نفس فكرة تويتر/
// Gmail: سهم لأسفل يصير لأعلى كإشارة "خلّيه واطلق دلوقتي").
const IconArrowDown = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v15" />
    <path d="M6 13l6 6 6-6" />
  </svg>
);

// مؤشر pull-to-refresh مثبّت أعلى الشاشة، يتحرك ويظهر تدريجيًا مع pullY
// (المسافة الفعلية المرئية للسحب) ويدور سهمه حسب pullProgress (0..1 خطي
// يصل 1 بالضبط عند نقطة التفعيل). أثناء isRefreshing يتحول لأنيميشن
// IconSproutLoader (نفس مؤشر التحميل المستخدم بباقي التطبيق) بدل السهم.
export function PullToRefreshIndicator({
  pullY,
  pullProgress,
  isRefreshing,
  maxPull = 64,
  CL,
}: {
  pullY: MotionValue<number>;
  pullProgress: MotionValue<number>;
  isRefreshing: boolean;
  maxPull?: number;
  CL: any;
}) {
  const opacity = useTransform(pullY, [0, maxPull * 0.35], [0, 1]);
  const scale = useTransform(pullY, [0, maxPull], [0.55, 1]);
  const translateY = useTransform(pullY, [0, maxPull], [-16, maxPull * 0.5]);
  const rotate = useTransform(pullProgress, [0, 1], [0, 180]);
  const ringColor = useTransform(pullProgress, [0, 1], [CL.textSub, CL.accent]);

  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        x: "-50%",
        y: translateY,
        opacity,
        scale,
        zIndex: 850,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: CL.surface,
        border: `1.5px solid ${CL.accentBorder}`,
        boxShadow: "0 6px 16px rgba(0,0,0,0.28)",
      }}
    >
      {isRefreshing ? (
        <IconSproutLoader size={20} color={CL.accent} />
      ) : (
        <motion.div style={{ rotate, display: "flex" }}>
          <motion.div style={{ color: ringColor, display: "flex" }}>
            <IconArrowDown size={18} />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default PullToRefreshIndicator;
