import { useEffect, useRef } from "react";
import { useMotionValue, animate, type MotionValue } from "motion/react";

// pull-to-refresh عام (موبايل + سطح مكتب)، على غرار X/Twitter/Instagram: يعيد
// تحميل الفيد عند السحب لأعلى وأنت في قمة الصفحة. يعمل على window مباشرة (لا
// يوجد container منفصل بسكرول داخلي للفيد في هذا المشروع — الصفحة كلها تسكرول).
//
// النسخة هذه بترجع أيضًا motion values (pullY وpullProgress) تسمح لأي مكوّن
// عرض (المحتوى + المؤشر البصري) يتحرك فعليًا مع السحب بدل ما يكون التحديث
// "صامت" بدون أي تغذية بصرية أثناء السحب نفسه:
//
// - pullY: المسافة الفعلية (بالبكسل) اللي يفترض يتحرك فيها المحتوى لتحت.
//   أثناء السحب باللمس تتحرك 1:1 مع الإصبع لكن بمقاومة تصاعدية (rubber-band)
//   تتباطأ كل ما زادت مسافة السحب، ومحدودة بسقف MAX_VISUAL_PULL. عند الإفلات
//   تتحرك بحركة spring: إما ترجع 0 (لو ما وصلت العتبة) أو تثبت عند LOCK_Y
//   وتفضل ثابتة طول ما isRefreshing=true، وترجع 0 تلقائيًا لما يخلص التحديث.
//   على سطح المكتب (wheel) نفس السلوك لكن بدون تتبع مستمر — نحرّكها برمجيًا
//   لنفس القفل عند تجاوز العتبة (السحب بعجلة الماوس مو له "موضع" مستمر زي
//   اللمس، فمافي بديل واقعي لتتبع 1:1 هناك).
// - pullProgress: قيمة خطية 0..1 تمثل قرب السحب من نقطة التفعيل (تصل بالضبط
//   1 عند تجاوز العتبة)، مخصصة لتدوير/تلوين مؤشر السهم بدل حركة المحتوى.
//
// onRefresh لا يُستدعى مرة أخرى وonRefresh قيد التنفيذ فعليًا (isRefreshing)،
// لتفادي إطلاق عدة تحديثات متراكبة من حركة واحدة مستمرة.

const PULL_THRESHOLD = 70; // بكسل (مسافة سحب فعلية باللمس) المطلوبة لتفعيل التحديث
const WHEEL_THRESHOLD = 40; // مجموع deltaY السالب المطلوب بالماوس/wheel
const MAX_VISUAL_PULL = 64; // أقصى مسافة مرئية ينسحب فيها المحتوى لتحت (سقف الـ rubber-band)
const EASE_K = PULL_THRESHOLD / 1.9; // ثابت التخميد: يخلي المحتوى يوصل ~85% من السقف عند نقطة العتبة بالضبط
const LOCK_Y = 52; // الموضع اللي يثبت فيه المحتوى/المؤشر أثناء التحديث الفعلي
const SPRING = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.7 };

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
  const lockedRef = useRef(false); // المحتوى مثبّت حاليًا عند LOCK_Y بانتظار انتهاء isRefreshing
  const wheelCooldownRef = useRef(false);

  // لما ينتهي التحديث (isRefreshing يرجع false) وكان مثبّتًا بسبب سحب سابق،
  // نرجّع المحتوى/المؤشر لموضعهم الطبيعي بحركة spring.
  useEffect(() => {
    if (!isRefreshing && lockedRef.current) {
      lockedRef.current = false;
      animate(pullY, 0, SPRING);
      animate(pullProgress, 0, SPRING);
    }
  }, [isRefreshing, pullY, pullProgress]);

  useEffect(() => {
    if (disabled) {
      // تعطيل مفاجئ أثناء سحب جارٍ (مثلًا فتح صفحة إعدادات) — نرجّع الحالة البصرية فورًا
      if (!lockedRef.current) {
        animate(pullY, 0, { duration: 0.15 });
        animate(pullProgress, 0, { duration: 0.15 });
      }
      return;
    }

    let wheelAccum = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || isRefreshing) {
        touchStartY.current = null;
        return;
      }
      touchStartY.current = e.touches[0].clientY;
      armedRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || lockedRef.current) return;
      if (window.scrollY > 0) return;

      const rawDelta = e.touches[0].clientY - touchStartY.current;
      if (rawDelta <= 0) {
        pullY.set(0);
        pullProgress.set(0);
        armedRef.current = false;
        return;
      }

      // مقاومة تصاعدية: كل ما زاد السحب، كل ما قلّت استجابة الحركة (rubber-band)
      const eased = MAX_VISUAL_PULL * (1 - Math.exp(-rawDelta / EASE_K));
      pullY.set(eased);
      pullProgress.set(Math.min(1, rawDelta / PULL_THRESHOLD));
      armedRef.current = rawDelta > PULL_THRESHOLD;
    };

    const handleTouchEnd = () => {
      if (touchStartY.current === null) return;
      touchStartY.current = null;

      if (lockedRef.current) return; // تم تفعيل تحديث مسبقًا، لا نلمس الحالة

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
      if (window.scrollY > 0) {
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
        // فترة تهدئة قصيرة بعد كل تفعيل عبر wheel لتفادي إطلاق تحديثات
        // متتالية من نفس حركة العجلة المستمرة (لا علاقة لها بمدة onRefresh
        // نفسها — isRefreshing يتكفّل بذلك أثناء التنفيذ الفعلي).
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
