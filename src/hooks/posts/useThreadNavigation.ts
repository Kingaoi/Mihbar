import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ANIM, FLAG_HIDE_LIMIT } from "../../constants/index";

export function useThreadNavigation({
  posts,
  setCommentText,
  setCommentMdFile,
  setReplyingToId,
  setReplyText,
  setReplyMdFile,
  setExpandedIds,
  cancelEdit,
  setProfilePageOpen,
}) {
  const [activePostId, setActivePostId] = useState(null);
  const [threadPending, setThreadPending] = useState(null);
  const [threadClosing, setThreadClosing] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  const feedScrollPos = useRef(0);
  const prevActivePostId = useRef(null);
  // true أثناء تنفيذ تنقل برمجي (openThread/closeThread) بدأناه نحن،
  // بين لحظة تحديث activePostId ولحظة استقرار pathname معه.
  // effect المزامنة أدناه يتجاهل أي فرق مؤقت بينهما طالما هذا العلم مرفوع،
  // فلا يظن خطأً أن المستخدم رجع للرئيسية ويصفّر activePostId من جديد.
  const isProgrammaticNav = useRef(false);

  // ref يحمل دائمًا أحدث نسخة من القيم/الدوال المستخدمة داخل effect المزامنة
  // أدناه، دون أن تكون جزءًا من مصفوفة الاعتماديات الخاصة به. هذا يحل تحذير
  // react-hooks/exhaustive-deps بشكل صحيح (بدل تجاهله)، مع الحفاظ على
  // السلوك المقصود: الـ effect يجب أن يعمل فقط عند تغيّر pathname فعليًا،
  // وليس عند كل تغيّر في activePostId أو أي دالة setter (وإلا يدخل في حلقة
  // إعادة تشغيل ذاتية، لأن الـ effect نفسه يستدعي setActivePostId).
  // التحديث يتم عبر useLayoutEffect (وليس أثناء الرندر مباشرة) لأن قراءة/كتابة
  // ref.current أثناء الرندر ممنوعة بقاعدة react-hooks/refs؛ useLayoutEffect
  // يضمن أن القيمة محدَّثة قبل أي effect آخر يعمل بعد هذا الرندر.
  const latest = useRef({
    activePostId,
    cancelEdit,
    setCommentText,
    setCommentMdFile,
    setReplyingToId,
    setReplyText,
    setReplyMdFile,
    setExpandedIds,
  });
  useLayoutEffect(() => {
    latest.current = {
      activePostId,
      cancelEdit,
      setCommentText,
      setCommentMdFile,
      setReplyingToId,
      setReplyText,
      setReplyMdFile,
      setExpandedIds,
    };
  });

  // Sync activePostId with URL — كل الفروع مؤجَّلة عبر microtask واحد
  // لضمان ألا يُستدعى أي setState بشكل متزامن داخل جسم الـ effect نفسه
  // (متطلب react-hooks/set-state-in-effect).
  useEffect(() => {
    const match = pathname.match(/^\/post\/(.+)$/);
    const postIdFromUrl = match ? match[1] : null;
    const {
      activePostId: currentActivePostId,
      cancelEdit: currentCancelEdit,
      setCommentText: currentSetCommentText,
      setCommentMdFile: currentSetCommentMdFile,
      setReplyingToId: currentSetReplyingToId,
      setReplyText: currentSetReplyText,
      setReplyMdFile: currentSetReplyMdFile,
      setExpandedIds: currentSetExpandedIds,
    } = latest.current;
    if (postIdFromUrl === currentActivePostId) {
      // pathname و activePostId متطابقان الآن: أي تنقل برمجي كان جاريًا
      // قد اكتمل واستقر، فيمكن خفض العلم بأمان.
      isProgrammaticNav.current = false;
      return;
    }

    // إذا كان الفرق ناتجًا عن تنقل برمجي بدأناه في openThread/closeThread
    // (الرابط لم يلحق بعد بالـ state)، لا نفعل شيئًا وننتظر حتى يستقر pathname
    // مع activePostId في الرندر التالي، بدل تفسير الفرق كأنه "رجوع للرئيسية".
    if (isProgrammaticNav.current) return;

    const t = setTimeout(() => {
      if (postIdFromUrl) {
        // Navigated to a post via URL
        setActivePostId(postIdFromUrl);
      } else if (latest.current.activePostId) {
        // Navigated back to home
        setThreadClosing(true);
        setTimeout(() => {
          setActivePostId(null);
          currentSetCommentText("");
          currentSetCommentMdFile(null);
          currentSetReplyingToId(null);
          currentSetReplyText("");
          currentSetReplyMdFile(null);
          currentSetExpandedIds({});
          currentCancelEdit();
          setThreadClosing(false);
        }, ANIM.viewMs);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  // Scroll to top when activePostId changes, and restore scroll position when returning to feed
  useEffect(() => {
    if (activePostId) {
      window.scrollTo({ top: 0 });
    } else if (prevActivePostId.current && !activePostId) {
      const savedPos = feedScrollPos.current;
      setTimeout(() => {
        window.scrollTo({ top: savedPos });
      }, 20);
    }
    prevActivePostId.current = activePostId;
  }, [activePostId]);

  const openThread = useCallback((postId) => {
    feedScrollPos.current = window.scrollY;
    setThreadPending(postId);
    setTimeout(() => {
      // نرفع العلم قبل أي تحديث؛ effect المزامنة سيتجاهل الفارق المؤقت
      // بين activePostId الجديد و pathname القديم إلى أن يلحق الرابط فعليًا.
      isProgrammaticNav.current = true;

      // Update URL أولًا حتى لا يرى الـ effect الذي يراقب pathname
      // حالة وسيطة (activePostId موجود لكن pathname لا يزال "/")
      // فيظن أن المستخدم رجع للرئيسية ويصفّر activePostId من جديد.
      router.push(`/post/${postId}`);

      setActivePostId(postId);
      setCommentText("");
      setCommentMdFile(null);
      setReplyingToId(null);
      setReplyText("");
      setReplyMdFile(null);
      setExpandedIds({});
      cancelEdit();
      setThreadPending(null);
    }, ANIM.pressMs);
  }, [
    cancelEdit,
    setCommentText,
    setCommentMdFile,
    setReplyingToId,
    setReplyText,
    setReplyMdFile,
    setExpandedIds,
    router
  ]);

  const closeThread = useCallback((fromPopState = false) => {
    setThreadClosing(true);
    setTimeout(() => {
      if (!fromPopState) {
        // نفس المنطق: نرفع العلم ونحدّث الرابط أولًا لتفادي فارق مؤقت
        // يجعل effect المزامنة يعيد تفسير الإغلاق كحدث خارجي.
        isProgrammaticNav.current = true;
        router.push("/");
      }

      setActivePostId(null);
      setCommentText("");
      setCommentMdFile(null);
      setReplyingToId(null);
      setReplyText("");
      setReplyMdFile(null);
      setExpandedIds({});
      cancelEdit();
      setThreadClosing(false);
    }, ANIM.viewMs);
  }, [
    cancelEdit,
    setCommentText,
    setCommentMdFile,
    setReplyingToId,
    setReplyText,
    setReplyMdFile,
    setExpandedIds,
    router
  ]);

  useEffect(() => {
    if (!activePostId) return;
    const p = posts.find((x) => x.id === activePostId);
    if (!p || (p.votes?.flaggedBy || []).length < FLAG_HIDE_LIMIT) return;
    const t = setTimeout(() => closeThread(), 0);
    return () => clearTimeout(t);
  }, [posts, activePostId, closeThread]);

  const openThreadFromProfile = useCallback((postId) => {
    setProfilePageOpen(false);
    openThread(postId);
  }, [openThread, setProfilePageOpen]);

  return {
    activePostId,
    setActivePostId,
    threadPending,
    setThreadPending,
    threadClosing,
    setThreadClosing,
    openThread,
    closeThread,
    openThreadFromProfile,
  };
}

export default useThreadNavigation;
