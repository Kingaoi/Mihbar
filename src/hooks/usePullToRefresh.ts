import { useEffect, useRef } from "react";

// pull-to-refresh عام (موبايل + سطح مكتب)، على غرار X/Twitter: يعيد تحميل
// الفيد عند السحب لأعلى وأنت في قمة الصفحة. يعمل على window مباشرة (لا يوجد
// container منفصل بسكرول داخلي للفيد في هذا المشروع — الصفحة كلها تسكرول).
//
// - موبايل: touchstart/touchmove/touchend، يُفعَّل فقط لو بدأ اللمس
//   وscrollY === 0 فعليًا، وتجاوزت مسافة السحب عتبة معقولة (تفادي تفعيله
//   بالخطأ من لمسة عرضية بسيطة).
// - سطح مكتب: wheel لأعلى (deltaY سالب) وأنت عند القمة، بقوة كافية (نفس
//   فكرة "السحب" لكن بالعجلة). عمليًا هذا التمرير للأعلى وأنت أصلًا فوق لا
//   يُحرّك شيئًا في الصفحة نفسها، فاستخدامه كإشارة تحديث آمن ولا يتعارض مع
//   أي سكرول فعلي.
//
// onRefresh لا يُستدعى مرة أخرى وonRefresh قيد التنفيذ فعليًا (isRefreshing)،
// لتفادي إطلاق عدة تحديثات متراكبة من حركة واحدة مستمرة.
export function usePullToRefresh({
  onRefresh,
  isRefreshing,
  disabled = false,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
  disabled?: boolean;
}) {
  const touchStartY = useRef<number | null>(null);
  const triggeredRef = useRef(false);
  const wheelCooldownRef = useRef(false);

  useEffect(() => {
    if (disabled) return;

    const PULL_THRESHOLD = 60; // بكسل، مسافة سحب اللمس المطلوبة لتفعيل التحديث
    const WHEEL_THRESHOLD = 40; // مجموع deltaY السالب المطلوب بالماوس/wheel

    let wheelAccum = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0) {
        touchStartY.current = null;
        return;
      }
      touchStartY.current = e.touches[0].clientY;
      triggeredRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || triggeredRef.current) return;
      if (window.scrollY > 0) return;
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > PULL_THRESHOLD && !isRefreshing) {
        triggeredRef.current = true;
        onRefresh();
      }
    };

    const handleTouchEnd = () => {
      touchStartY.current = null;
      triggeredRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (window.scrollY > 0) {
        wheelAccum = 0;
        return;
      }
      if (e.deltaY >= 0) {
        // سكرول لأسفل أو بلا حركة، نصفّر التراكم
        wheelAccum = 0;
        return;
      }
      if (isRefreshing || wheelCooldownRef.current) return;

      wheelAccum += -e.deltaY;
      if (wheelAccum > WHEEL_THRESHOLD) {
        wheelAccum = 0;
        wheelCooldownRef.current = true;
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
  }, [onRefresh, isRefreshing, disabled]);
}

export default usePullToRefresh;
