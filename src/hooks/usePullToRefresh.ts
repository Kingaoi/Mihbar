import { useEffect, useRef } from "react";
import { useMotionValue, animate, type MotionValue } from "motion/react";

// pull-to-refresh (على غرار Threads): مؤشر تحميل مستقل يظهر أعلى الشاشة
// عند السحب لأسفل وأنت بقمة الصفحة، بدون أي حركة أو تعديل على المحتوى
// نفسه إطلاقاً.
//
// الفرق الجوهري عن أي نسخة سابقة من هذا الملف: لا نطبّق أي style أو ref
// على حاوية المحتوى القابل للتمرير — فقط motion values (pullY/pullProgress)
// يُستهلكان حصريًا من PullToRefreshIndicator (عنصر position:fixed مستقل
// تمامًا خارج شجرة المحتوى). هذا يمنع جذريًا أي احتمال لتعارض
// transform/touch-action مع native scroll، بغض النظر عن السبب الدقيق
// لأي مشكلة سكرول سابقة.
//
// كل المستمعات هنا passive:true فقط للقراءة — لا نستدعي preventDefault
// إطلاقًا في أي مكان، فالمتصفح يبقى المتحكم الكامل بالسكرول دائمًا.

const PULL_THRESHOLD = 70; // بكسل (مسافة سحب فعلية باللمس) المطلوبة لتفعيل التحديث
const WHEEL_THRESHOLD = 40; // مجموع deltaY السالب المطلوب بالماوس/wheel
const MAX_VISUAL_PULL = 64; // أقصى مسافة مرئية يتحرك فيها المؤشر (سقف الـ rubber-band)
const EASE_K = PULL_THRESHOLD / 1.9;
const LOCK_Y = 52; // الموضع اللي يثبت فيه المؤشر أثناء التحديث الفعلي
const SPRING = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.7 };

// أدق من window.scrollY في بعض حالات iOS Safari (rubber-band overscroll
// قد يعطي قيمة سالبة مؤقتًا بدل صفر أثناء الارتداد).
function isAtTop() {
  const el = document.scrollingElement || document.documentElement;
  return el.scrollTop <= 0;
}

export function usePullToRefresh({
  onRefresh,
  isRefreshing,
  disabled = false,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
  disabled?: boolean;
}) {
  const pullY = useMotionValue(0);
  const pullProgress = useMotionValue(0);

  const touchStartY = useRef<number | null>(null);
  const armedRef = useRef(false);
  const lockedRef = useRef(false);
  const wheelCooldownRef = useRef(false);

  useEffect(() => {
    if (!isRefreshing && lockedRef.current) {
      lockedRef.current = false;
      animate(pullY, 0, SPRING);
      animate(pullProgress, 0, SPRING);
    }
  }, [isRefreshing, pullY, pullProgress]);

  useEffect(() => {
    if (disabled) {
      if (!lockedRef.current) {
        animate(pullY, 0, { duration: 0.15 });
        animate(pullProgress, 0, { duration: 0.15 });
      }
      return;
    }

    let wheelAccum = 0;

    // ملاحظة: كل ما يلي قراءة فقط (نحسب قيم motion values مستقلة) — لا
    // نغيّر أي شيء بالـ DOM ولا نستدعي preventDefault. لو اتضح لاحقًا أن
    // حتى هذا القدر من المراقبة يسبب أي التباس، أبسط حل هو حذف هذا الملف
    // بالكامل (كما حدث سابقًا) بدل محاولة تصحيحه أكثر.
    const handleTouchStart = (e: TouchEvent) => {
      if (!isAtTop() || isRefreshing) {
        touchStartY.current = null;
        return;
      }
      touchStartY.current = e.touches[0].clientY;
      armedRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || lockedRef.current) return;
      if (!isAtTop()) {
        touchStartY.current = null;
        pullY.set(0);
        pullProgress.set(0);
        armedRef.current = false;
        return;
      }

      const rawDelta = e.touches[0].clientY - touchStartY.current;
      if (rawDelta <= 0) {
        pullY.set(0);
        pullProgress.set(0);
        armedRef.current = false;
        return;
      }

      const eased = MAX_VISUAL_PULL * (1 - Math.exp(-rawDelta / EASE_K));
      pullY.set(eased);
      pullProgress.set(Math.min(1, rawDelta / PULL_THRESHOLD));
      armedRef.current = rawDelta > PULL_THRESHOLD;
    };

    const handleTouchEnd = () => {
      if (touchStartY.current === null) return;
      touchStartY.current = null;

      if (lockedRef.current) return;

      if (armedRef.current && !isRefreshing) {
        lockedRef.current = true;
        animate(pullY, LOCK_Y, SPRING);
        animate(pullProgress, 1, SPRING);
        onRefresh();
      } else {
        animate(pullY, 0, SPRING);
        animate(pullProgress, 0, SPRING);
      }
      armedRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isAtTop()) {
        wheelAccum = 0;
        return;
      }
      if (e.deltaY >= 0) {
        wheelAccum = 0;
        return;
      }
      if (isRefreshing || wheelCooldownRef.current || lockedRef.current) return;

      wheelAccum += -e.deltaY;
      if (wheelAccum > WHEEL_THRESHOLD) {
        wheelAccum = 0;
        wheelCooldownRef.current = true;
        lockedRef.current = true;
        animate(pullY, LOCK_Y, SPRING);
        animate(pullProgress, 1, SPRING);
        onRefresh();
        setTimeout(() => {
          wheelCooldownRef.current = false;
        }, 800);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [onRefresh, isRefreshing, disabled, pullY, pullProgress]);

  return { pullY, pullProgress, maxPull: MAX_VISUAL_PULL, lockY: LOCK_Y } as {
    pullY: MotionValue<number>;
    pullProgress: MotionValue<number>;
    maxPull: number;
    lockY: number;
  };
}

export default usePullToRefresh;
