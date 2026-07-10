import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ANIM, FLAG_HIDE_LIMIT } from "../../constants/index";

// ملاحظة معمارية: هذا الملف كان يحتوي سابقًا منطقًا إضافيًا معقّدًا
// (isProgrammaticNav flag + useLayoutEffect + latest ref) للتعامل مع
// إعادة تركيب (remount) متكررة لكل شجرة <Mihbar/> كانت تحدث بسبب استخدام
// page.tsx منفصل لكل مسار (/, /post/[id], /profile, /settings). بعد نقل
// <Mihbar/> إلى app/layout.tsx (الجذر المشترك بين هذه المسارات كلها)، لم
// يعد يُعاد تركيبه إطلاقًا عند التنقل بينها — فقط pathname يتغيّر، وتمت
// إزالة ذلك المنطق بالكامل.
//
// التأجيل المتبقي عبر setTimeout(…, 0) داخل الـ effect أدناه لسبب مختلف
// تمامًا: قاعدة react-hooks/set-state-in-effect (مفعّلة في إعداد ESLint
// الخاص بـ Next.js) تمنع استدعاء setState بشكل متزامن مباشرة داخل جسم أي
// effect، لأن ذلك قد يسبب cascading renders. هذا نمط سليم بغض النظر عن
// مشكلة الـ remount القديمة.

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

  // Sync activePostId with URL — التحديث الفعلي (setState) مؤجَّل عبر
  // setTimeout(…, 0) وليس مستدعى مباشرة داخل جسم الـ effect، لأن استدعاء
  // setState بشكل متزامن هناك يخالف قاعدة react-hooks/set-state-in-effect
  // (يمكن أن يسبب cascading renders). هذا لا علاقة له بمشكلة الـ remount
  // القديمة التي حُلَّت في layout.tsx — هذا مجرد نمط سليم عمومًا لمزامنة
  // state مع مصدر خارجي (الرابط).
  useEffect(() => {
    const match = pathname.match(/^\/post\/(.+)$/);
    const postIdFromUrl = match ? match[1] : null;

    if (postIdFromUrl === activePostId) return;

    const t = setTimeout(() => {
      if (postIdFromUrl) {
        // Navigated to a post via URL
        setActivePostId(postIdFromUrl);
      } else if (activePostId) {
        // Navigated back to home
        setThreadClosing(true);
        setTimeout(() => {
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
      }
    }, 0);
    return () => clearTimeout(t);
    // Removed dependencies that cause loops, we only want to sync on pathname change
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setActivePostId(postId);
      setCommentText("");
      setCommentMdFile(null);
      setReplyingToId(null);
      setReplyText("");
      setReplyMdFile(null);
      setExpandedIds({});
      cancelEdit();
      setThreadPending(null);

      // Update URL
      router.push(`/post/${postId}`);
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
      setActivePostId(null);
      setCommentText("");
      setCommentMdFile(null);
      setReplyingToId(null);
      setReplyText("");
      setReplyMdFile(null);
      setExpandedIds({});
      cancelEdit();
      setThreadClosing(false);

      if (!fromPopState) {
        router.push("/");
      }
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
