import { useEffect, useRef } from "react";
import { useMotionValue, animate, type MotionValue } from "motion/react";

// pull-to-refresh عام (موبايل + سطح مكتب)، على غرار X/Twitter/Instagram: يعيد
// تحميل الفيد عند السحب لأعلى وأنت في قمة الصفحة. يعمل على window مباشرة (لا
// يوجد container منفصل بسكرول داخلي للفيد في هذا المشروع — الصفحة كلها تسكرول).
//
// topAnchorRef (اختياري): مرجع لعنصر ثابت (خارج نطاق أي transform) يوضع
// مباشرة قبل بداية القسم القابل للسحب فعليًا (مثلًا قبل قائمة التعليقات
// بصفحة المنشور). بدون تمريره، "قمة الصفحة" تعني حرفيًا window.scrollY=0
// (مناسب للفيد الرئيسي لأنه قريب من أعلى الصفحة أصلًا). بتمريره، "قمة
// القسم" تُحسب من موضع العنصر نفسه بالنسبة للشاشة — يسمح بتفعيل السحب لما
// توصل بداية القسم المطلوب (مثلًا بداية التعليقات) حتى لو لسة فيه محتوى
// فوقه يقدر يتمرّر (زي المنشور نفسه بأعلى صفحة الـ thread)، بدل ما يشترط
// الوصول لقمة الصفحة المطلقة (اللي ممكن تكون بعيدة جدًا عن القسم الفعلي).
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
const ANCHOR_TOLERANCE = 6; // بكسل سماحية حول موضع المرساة يُعتبر معها "بقمة القسم"
// منطقة سماحية قبل ما نقرر اتجاه اللمسة فعليًا (سحب-تحديث أو سكرول عادي).
// مهمة جدًا: بدونها، أي رعشة يد طبيعية بأول بكسل أو اثنين من اللمسة ممكن
// تُفسَّر خطأً كـ"سحب لأسفل" وتستدعي preventDefault فورًا — وأغلب متصفحات
// الموبايل تحسم قرار "هل هذي اللمسة قابلة للسكرول؟" من أول touchmove بس
// وتقفل عليه لبقية اللمسة، فلو صار preventDefault بالغلط مرة وحدة بالبداية،
// يتعطّل السكرول الطبيعي بالكامل حتى لو الإصبع بعدها تحرّك لفوق فعليًا.
const DIRECTION_DEAD_ZONE = 8;
const SPRING = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.7 };

export function usePullToRefresh({
  onRefresh,
  isRefreshing,
  disabled = false,
  topAnchorRef,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
  disabled?: boolean;
  topAnchorRef?: React.RefObject<HTMLElement | null>;
}) {
  const pullY = useMotionValue(0);
  const pullProgress = useMotionValue(0);

  const touchStartY = useRef<number | null>(null);
  const armedRef = useRef(false);
  const lockedRef = useRef(false); // المحتوى مثبّت حاليًا عند LOCK_Y بانتظار انتهاء isRefreshing
  const wheelCooldownRef = useRef(false);
  // قرار اتجاه اللمسة الحالية: null (لسة داخل منطقة السماحية، ما تقرر بعد)،
  // "pull" (التزمنا نتحكم فيها كسحب-تحديث)، أو "scroll" (تبيّن إنها سكرول
  // عادي — نتخلى عنها نهائيًا لبقية هالِلمسة ولا نلمس preventDefault إطلاقًا).
  const decidedRef = useRef<"pull" | "scroll" | null>(null);

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

    // "بقمة القسم القابل للسحب؟" — إما قمة الصفحة المطلقة، أو (لو فيه
    // مرساة) وصلنا فعليًا لبداية القسم المستهدف بغض النظر عن باقي الصفحة.
    const isAtPullTop = () => {
      if (window.scrollY <= 0) return true;
      const anchor = topAnchorRef?.current;
      if (!anchor) return false;
      const top = anchor.getBoundingClientRect().top;
      return top >= -ANCHOR_TOLERANCE && top <= ANCHOR_TOLERANCE;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isAtPullTop() || isRefreshing) {
        touchStartY.current = null;
        return;
      }
      touchStartY.current = e.touches[0].clientY;
      armedRef.current = false;
      decidedRef.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || lockedRef.current) return;
      if (decidedRef.current === "scroll") return; // اتخذنا القرار مسبقًا: سكرول عادي، لا نتدخل إطلاقًا

      const rawDelta = e.touches[0].clientY - touchStartY.current;

      // أي حركة لأعلى تُحسم فورًا كسكرول عادي، بلا تريث عبر DIRECTION_DEAD_ZONE:
      // عكس "سحب لأسفل" (يحتاج تأكيد قبل ما نصادر اللمسة)، اتجاه لأعلى ما
      // له تفسير غير "المستخدم يسكرول"، وتأخير القرار عليها كان يخلي أول
      // touchmove يمر بلا معالجة — ومتصفحات الموبايل غالبًا تقفل قرار
      // "قابلية التمرير" لبقية اللمسة من نفس أول touchmove (خصوصًا مع
      // مستمع passive:false على window)، فيتعطل السكرول الطبيعي بالكامل.
      if (rawDelta <= 0) {
        decidedRef.current = "scroll";
        pullY.set(0);
        pullProgress.set(0);
        armedRef.current = false;
        return;
      }

      if (decidedRef.current === null) {
        // لسة داخل منطقة السماحية لاتجاه "لأسفل" فقط — ننتظر حركة أوضح
        // قبل ما نحسم (وبالتحديد: لا نستدعي preventDefault هنا إطلاقًا).
        if (rawDelta < DIRECTION_DEAD_ZONE) return;

        if (!isAtPullTop()) {
          decidedRef.current = "scroll";
          pullY.set(0);
          pullProgress.set(0);
          return;
        }
        decidedRef.current = "pull";
      }

      // نمنع السلوك الافتراضي للمتصفح (rubber-band / إعادة تحميل الصفحة
      // الفعلية عند السحب لأسفل بقمة الصفحة) بما إننا نمسك بزمام الأمر
      // ونعرض مؤشرنا الخاص بدلاً منه. نصل هنا فقط بعد ما التزمنا فعليًا
      // بإن هذي لمسة سحب-تحديث (decidedRef === "pull")، أبدًا قبل ذلك.
      if (e.cancelable) e.preventDefault();

      // مقاومة تصاعدية: كل ما زاد السحب، كل ما قلّت استجابة الحركة (rubber-band)
      const eased = MAX_VISUAL_PULL * (1 - Math.exp(-rawDelta / EASE_K));
      pullY.set(eased);
      pullProgress.set(Math.min(1, rawDelta / PULL_THRESHOLD));
      armedRef.current = rawDelta > PULL_THRESHOLD;
    };

    const handleTouchEnd = () => {
      if (touchStartY.current === null) return;
      touchStartY.current = null;
      decidedRef.current = null;

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
      if (!isAtPullTop()) {
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
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [onRefresh, isRefreshing, disabled, pullY, pullProgress, topAnchorRef]);

  return { pullY, pullProgress, maxPull: MAX_VISUAL_PULL, lockY: LOCK_Y } as {
    pullY: MotionValue<number>;
    pullProgress: MotionValue<number>;
    maxPull: number;
    lockY: number;
  };
}

export default usePullToRefresh;
