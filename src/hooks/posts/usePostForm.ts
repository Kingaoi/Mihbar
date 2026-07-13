import { useState, useEffect } from "react";
import { canPerformAction, isSpamQuality, emptyVotes, generateUniqueId } from "../../utils/index";
import { getPostDraft, savePostDraft, clearPostDraft } from "../../utils/dataLayer";

export function usePostForm({
  s,
  isMobile,
  isBanned,
  deviceHash,
  securityReady,
  ownedPosts,
  saveOwnedPosts,
  savePosts,
  refreshPosts,
  showToast,
}) {
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("عام");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [mdFile, setMdFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [err, setErr] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Load draft on mount — يمر الآن عبر dataLayer.js (getPostDraft) بدل
  // localStorage.getItem(DRAFT_KEY) المباشر (DRAFT_KEY لم يكن معرَّفًا أصلاً
  // في هذا الملف، وهو خطأ سابق تم إصلاحه هنا).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const parsed = await getPostDraft();
        if (cancelled || !parsed) {
          if (!cancelled) setDraftLoaded(true);
          return;
        }
        if (parsed.text) setText(parsed.text);
        if (parsed.note) setNote(parsed.note);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.videoUrl) setVideoUrl(parsed.videoUrl);
        if (parsed.pollOptions) setPollOptions(parsed.pollOptions);
      } catch {
        // نفس السلوك السابق: فشل القراءة يُتجاهل بصمت
      }
      if (!cancelled) setDraftLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Save draft when typing — عبر dataLayer.js (savePostDraft)، fire-and-forget
  // لأن هذا مجرد حفظ مسودة في الخلفية أثناء الكتابة، لا يجب أن يعطّل الإدخال.
  useEffect(() => {
    if (!draftLoaded) return;
    const draft = { text, note, category, videoUrl, pollOptions };
    savePostDraft(draft).catch(() => {});
  }, [text, note, category, videoUrl, pollOptions, draftLoaded]);

  // Live rate-limit countdown effect
  useEffect(() => {
    if (!err) return;
    const isRateLimit = err.includes("انتظر") || err.includes("Wait");
    if (!isRateLimit) return;

    const match = err.match(/(\d+)/);
    if (!match) return;
    const seconds = parseInt(match[1], 10);
    if (seconds <= 0) {
      const t = setTimeout(() => setErr(""), 0);
      return () => clearTimeout(t);
    }

    const timer = setTimeout(() => {
      const nextSeconds = seconds - 1;
      if (nextSeconds <= 0) {
        setErr("");
      } else {
        setErr(err.replace(match[1], String(nextSeconds)));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [err]);

  const submit = async (): Promise<boolean> => {
    if (isBanned) {
      setErr(s.banned);
      return false;
    }
    // securityReady: false يعني تحميل بصمة الجهاز/حالة الحظر من التخزين
    // لم يكتمل بعد (نافذة قصيرة عند أول تحميل). نمنع النشر بهدوء ريثما
    // يكتمل، بدل الاعتماد فقط على فحص deviceHash المنفرد الذي كان يفوّت
    // حالات نادرة (مثال: isBanned لم يُحمَّل بعد فيُسمح بمنشور من جهاز محظور).
    if (!securityReady || !deviceHash) {
      return false;
    }
    if (!(text || "").trim() || text.length < 5) {
      setErr(s.eShort);
      return false;
    }
    if (text.length > 300) {
      setErr(s.eLong);
      return false;
    }
    if (isSpamQuality(text)) {
      setErr(s.spamQuality);
      return false;
    }
    const rate = await canPerformAction("post");
    if (!rate.allowed) {
      setErr(s.rateLimitPost(rate.waitSeconds));
      return false;
    }

    setIsPosting(true);

    const newPost = {
      id: generateUniqueId("post"),
      category,
      text: (text || "").trim(),
      votes: emptyVotes(),
      timestamp: Date.now(),
      edited: false,
      note: (note || "").trim(),
      comments: [],
      mdFile: mdFile || null,
      videoUrl: videoUrl || null,
      poll: pollOptions.filter(o => (o || "").trim()).length >= 2 ? {
        options: pollOptions.filter(o => (o || "").trim()).map((opt, i) => ({ id: `opt-${i}`, text: (opt || "").trim(), votes: 0 })),
        votedBy: {}
      } : null,
      authorHash: deviceHash,
    };

    // مُغلَّفة بـ Promise عشان الـ Promise اللي تُرجعها submit() ينتظر فعليًا
    // حتى اكتمال هذا الجزء (بما فيه تأخير حركة "جارِ النشر..." المتعمَّد)،
    // لا أن يُحسَم فور انتهاء الجزء المتزامن من الدالة فقط.
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        savePosts((prev) => [newPost, ...prev]);
        const o = { ...ownedPosts, [newPost.id]: true };
        saveOwnedPosts(o);

        setText("");
        setNote("");
        setMdFile(null);
        setVideoUrl("");
        setPollOptions(["", ""]);
        setCategory("عام");
        setErr("");
        setIsPosting(false);
        clearPostDraft().catch(() => {});
        showToast(s.toastPosted, 3000);
        // نفس تأثير "التحديث" (سبروت لودر في زر الـ FAB) المستخدَم عند سحب
        // الفيد لأعلى، يظهر أيضًا هنا بعد نشر منشور جديد بنجاح — طلب صريح من
        // المستخدم. refreshPosts تتولى تفريغ أي كتابة معلَّقة أولاً (انظر
        // تعليقها في usePostsData.ts) فتقرأ نسخة تتضمن المنشور الجديد فعليًا.
        if (refreshPosts) refreshPosts();
        resolve(true);
      }, isMobile ? 350 : 200);
    });
  };

  return {
    text,
    setText,
    note,
    setNote,
    category,
    setCategory,
    mdFile,
    setMdFile,
    videoUrl,
    setVideoUrl,
    pollOptions,
    setPollOptions,
    isPosting,
    setIsPosting,
    err,
    setErr,
    submit,
  };
}

export default usePostForm;
