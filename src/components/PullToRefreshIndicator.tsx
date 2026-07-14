import { motion, useTransform, type MotionValue } from "motion/react";
import { IconSproutLoader } from "./Icons";

// مؤشر pull-to-refresh مثبّت أعلى الشاشة، يظهر ويكبر تدريجيًا مع pullY
// (المسافة الفعلية المرئية للسحب) لحد ما يوصل حجمه الطبيعي عند نقطة
// التفعيل تقريبًا. عنصر position:fixed مستقل تمامًا خارج شجرة المحتوى
// القابل للتمرير — لا يُطبَّق أي transform على المحتوى نفسه أبدًا، فقط
// هذا المؤشر هو ما يتحرك بصريًا (تمامًا كتصميم Threads/Instagram).
export function PullToRefreshIndicator({
  pullY,
  maxPull = 64,
  CL,
}: {
  pullY: MotionValue<number>;
  pullProgress?: MotionValue<number>;
  maxPull?: number;
  CL: any;
}) {
  const opacity = useTransform(pullY, [0, maxPull * 0.35], [0, 1]);
  const scale = useTransform(pullY, [0, maxPull], [0.55, 1]);
  const translateY = useTransform(pullY, [0, maxPull], [-16, maxPull * 0.5]);

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
      <IconSproutLoader size={20} color={CL.accent} />
    </motion.div>
  );
}

export default PullToRefreshIndicator;
