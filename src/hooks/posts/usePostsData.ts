import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { sumVotes, banDevice } from "../../utils/index";
import {
  toggleReaction,
  isEntityVisible,
  getFlagCount,
  loadAllPosts,
  loadAllPostsSync,
  saveAllPosts,
} from "../../utils/dataLayer";
import { SEEDS } from "../../data/seeds";
import { FLAG_HIDE_LIMIT, FLAG_BAN_LIMIT } from "../../constants/index";

export function usePostsData({ deviceHash, savedPosts }) {
  // localStorage متزامن بطبيعته (getPosts أعلاه لا تحتوي أي I/O حقيقي بطيء)،
  // فنقرأ القيمة الأولية مباشرة أثناء تهيئة useState بدل البدء بمصفوفة فارغة
  // ثم انتظار useEffect + async. هذا مهم بالتحديد لأن كل route هنا
  // (/, /post/[id], /profile, /settings) صفحة Next.js منفصلة، فأي تنقل
  // حقيقي بين المسارات يعيد تركيب (remount) هذا الكومبوننت بالكامل —
  // فبدون هذا التبديل، كانت تظهر لحظة "فاضية" (فلاش الصفحة الرئيسية /
  // اختفاء المنشورات) عند كل فتح منشور أو ضغط رجوع، لحين اكتمال
  // await loadAllPosts() غير الضروري من الأساس.
  const [posts, setPosts] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = loadAllPostsSync();
      return stored.filter((p) => p && p.id && !p.id.startsWith("seed-"));
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => typeof window === "undefined");
  // isRefreshing: منفصل عن loading (الذي يمثّل فقط التحميل الأولي عند فتح
  // التطبيق). هذا يمثّل تحديث لاحق يدوي (سحب لأعلى/بعد نشر منشور) — نعيد
  // قراءة نفس مصدر البيانات (loadAllPosts) دون افتراض وجود بيانات جديدة
  // فعليًا؛ عند الربط بـ Supabase مستقبلاً هذا سيصبح طلب شبكة حقيقي بنفس
  // الشكل (نفس التوقيع، بلا تغيير في المستدعين).
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tab, setTab] = useState("recent");
  const [catFilter, setCatFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const activeCatRef = useRef(undefined);

  useEffect(() => {
    // القراءة المتزامنة في تهيئة useState أعلاه غطّت بالفعل الحالة الشائعة
    // (توجد منشورات محفوظة) فورًا بدون أي وميض. هذا الـ effect يكمل فقط
    // الأعمال الجانبية التي تحتاج I/O كتابة (async) ولا يمكن إنجازها أثناء
    // الرندر: تنظيف بيانات seed القديمة من التخزين الفعلي، وزرع SEEDS إذا
    // كان التخزين فارغًا تمامًا (أول تشغيل على الإطلاق).
    let cancelled = false;

    (async () => {
      let stored = await loadAllPosts();
      const cleaned = stored.filter((p) => p && p.id && !p.id.startsWith("seed-"));
      if (cleaned.length !== stored.length) {
        await saveAllPosts(cleaned);
        stored = cleaned;
      }
      if (cancelled) return;

      if (stored.length === 0) {
        await saveAllPosts(SEEDS);
        if (!cancelled) setPosts(SEEDS);
      } else {
        // نحدّث فقط لو البيانات فعليًا مختلفة عمّا عُرض بالفعل من القراءة
        // المتزامنة، لتفادي إعادة رندر غير ضرورية على حالة صحيحة أصلاً.
        setPosts((prev) =>
          prev.length === stored.length && prev === stored ? prev : stored
        );
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayed = useMemo(() => {
    let res = posts.filter((p) => isEntityVisible(p.votes, FLAG_HIDE_LIMIT));
    if (catFilter) res = res.filter((p) => p.category === catFilter);
    if (tab === "saved") {
      res = res.filter((p) => savedPosts && savedPosts[p.id]);
    }
    if ((searchQuery || "").trim()) {
      const q = ((searchQuery || "").toLowerCase()).trim();
      res = res.filter((p) => {
        const textMatch = p.text && p.text.toLowerCase().includes(q);
        const noteMatch = p.note && p.note.toLowerCase().includes(q);
        const categoryMatch = p.category && p.category.toLowerCase().includes(q);
        return textMatch || noteMatch || categoryMatch;
      });
    }
    return tab === "top"
      ? [...res].sort((a, b) => sumVotes(b.votes, b.poll) - sumVotes(a.votes, a.poll))
      : [...res].sort((a, b) => b.timestamp - a.timestamp);
  }, [posts, tab, catFilter, searchQuery, savedPosts]);

  // debounce على الكتابة الفعلية فقط: تحديث الحالة (setPosts) يبقى فوريًا
  // في كل استدعاء، بينما saveAllPosts (I/O) يُجمَّع خلال نافذة 400ms لتفادي
  // إعادة كتابة القائمة الكاملة عند تفاعلات متتالية سريعة (تصويت/سكرول).
  // pendingRef يحمل آخر نسخة posts لضمان flush النسخة الصحيحة عند unmount.
  const saveTimerRef = useRef(null);
  const pendingRef = useRef(null);

  const flushSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (pendingRef.current !== null) {
      const toSave = pendingRef.current;
      pendingRef.current = null;
      saveAllPosts(toSave).catch((e) => {
        console.error("Failed to save posts:", e);
      });
    }
  }, []);

  useEffect(() => {
    return () => flushSave();
  }, [flushSave]);

  // refreshPosts: يُستدعى عند سحب الفيد لأعلى (pull-to-refresh) أو بعد نشر
  // منشور جديد بنجاح. يعيد قراءة loadAllPosts فعليًا (وليس فقط "محاكاة"
  // تحميل)، مفيد الآن لو فُتح التطبيق بأكثر من تبويب على نفس الجهاز، وسيصبح
  // الجلب الحقيقي للمحتوى الجديد من الخادم بعد الربط بـ Supabase دون تغيير
  // في نقطة الاستدعاء. isRefreshing يبقى true طوال مدة القراءة الفعلية،
  // ولا نعتمد على مؤقّت وهمي — الزر (FAB) يُعطَّل طالما القيمة true فعليًا.
  //
  // ملاحظة مهمة: savePosts تكتب فعليًا لـ localStorage بعد debounce من 400ms
  // (انظر التعليق فوق flushSave). لو استدعينا loadAllPosts مباشرة بعد نشر
  // منشور جديد (savePosts) بدون flush أولاً، كنا سنقرأ نسخة قديمة من
  // التخزين (بدون المنشور الجديد) ونُبطل التحديث المتفائل المعروض فعلاً في
  // الشاشة. flushSave() هنا يضمن كتابة أي تغيير معلَّق أولاً قبل القراءة.
  const refreshPosts = useCallback(async () => {
    setIsRefreshing(true);
    flushSave();
    try {
      const stored = await loadAllPosts();
      const cleaned = stored.filter((p) => p && p.id && !p.id.startsWith("seed-"));
      setPosts(cleaned);
    } catch (e) {
      console.error("Failed to refresh posts:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [flushSave]);

  const savePosts = useCallback((fn) => {
    setPosts((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      // تحديث متفائل (optimistic): الحالة المحلية تتحدث فورًا للحفاظ على
      // استجابة الواجهة، بينما الحفظ الفعلي (async) يُجدوَل بـ debounce.
      pendingRef.current = next;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(flushSave, 400);
      return next;
    });
  }, [flushSave]);

  const handlePollVote = useCallback((postId, optionId) => {
    savePosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        if (!p.poll) return p;
        const hasVoted = p.poll.votedBy && p.poll.votedBy[deviceHash];
        if (hasVoted === optionId) return p;
        const updatedPoll = { ...p.poll, votedBy: { ...(p.poll.votedBy || {}), [deviceHash]: optionId } };
        updatedPoll.options = updatedPoll.options.map(opt => ({
          ...opt,
          votes: Object.values(updatedPoll.votedBy).filter(val => val === opt.id).length
        }));
        return { ...p, poll: updatedPoll };
      })
    );
  }, [savePosts, deviceHash]);

  const updateVotes = useCallback((postId, commentId, reactionKey, replyId = null) => {
    savePosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        if (commentId) {
          return {
            ...p,
            comments: (p.comments || []).map((c) => {
              if (c.id !== commentId) return c;
              if (replyId) {
                return {
                  ...c,
                  replies: (c.replies || []).map((r) => {
                    if (r.id === replyId) {
                      const updatedReply = toggleReaction(r, reactionKey, deviceHash);
                      if (
                        reactionKey === "flag" &&
                        getFlagCount(updatedReply.votes) >= FLAG_BAN_LIMIT &&
                        updatedReply.authorHash &&
                        updatedReply.authorHash !== "seed"
                      ) {
                        // fire-and-forget مقصود: لا داعي لانتظار الحظر قبل
                        // تحديث الواجهة، لكن يجب التقاط أي رفض لتفادي
                        // Unhandled Promise Rejection في الكونسول.
                        banDevice(updatedReply.authorHash, 24).catch(() => {});
                      }
                      return updatedReply;
                    }
                    return r;
                  }),
                };
              }
              const updatedComment = toggleReaction(c, reactionKey, deviceHash);
              if (
                reactionKey === "flag" &&
                getFlagCount(updatedComment.votes) >= FLAG_BAN_LIMIT &&
                updatedComment.authorHash &&
                updatedComment.authorHash !== "seed"
              ) {
                banDevice(updatedComment.authorHash, 24).catch(() => {});
              }
              return updatedComment;
            }),
          };
        }
        const updated = toggleReaction(p, reactionKey, deviceHash);
        if (
          reactionKey === "flag" &&
          getFlagCount(updated.votes) >= FLAG_BAN_LIMIT &&
          updated.authorHash &&
          updated.authorHash !== "seed"
        ) {
          banDevice(updated.authorHash, 24).catch(() => {});
        }
        return updated;
      })
    );
  }, [savePosts, deviceHash]);

  return {
    handlePollVote,
    posts,
    setPosts,
    loading,
    setLoading,
    isRefreshing,
    refreshPosts,
    tab,
    setTab,
    catFilter,
    setCatFilter,
    searchQuery,
    setSearchQuery,
    activeCatRef,
    displayed,
    savePosts,
    updateVotes,
  };
}

export default usePostsData;
