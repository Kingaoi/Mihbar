import { useState, useEffect } from "react";
import { canPerformAction, isSpamQuality, emptyVotes, generateUniqueId } from "../../utils/index";
import { getCommentDraft, saveCommentDraft, clearCommentDraft } from "../../utils/dataLayer";

export function useComments({
  s,
  lang,
  isMobile,
  isBanned,
  deviceHash,
  securityReady,
  posts,
  ownedComments,
  saveOwnedComments,
  ownedReplies,
  saveOwnedReplies,
  savePosts,
  showToast,
  setErr,
  askConfirm,
}) {
  const [commentText, setCommentText] = useState("");
  const [commentMdFile, setCommentMdFile] = useState(null);
  const [commentVideoUrl, setCommentVideoUrl] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Load comment draft — يمر الآن عبر dataLayer.js (getCommentDraft) بدل
  // localStorage.getItem("mihbar_comment_draft") المباشر.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await getCommentDraft();
        if (!cancelled && saved) setCommentText(saved);
      } catch {}
      if (!cancelled) setDraftLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Save comment draft — fire-and-forget عبر dataLayer.js أثناء الكتابة.
  useEffect(() => {
    if (!draftLoaded) return;
    saveCommentDraft(commentText).catch(() => {});
  }, [commentText, draftLoaded]);

  const addComment = async (postId) => {
    if (isBanned) {
      setErr(s.banned);
      return;
    }
    // securityReady: false يعني تحميل بصمة الجهاز/حالة الحظر لم يكتمل بعد.
    // انظر التعليق المطابق في usePostForm.ts submit.
    if (!securityReady || !deviceHash) {
      return;
    }
    if (isSpamQuality(commentText)) {
      setErr(s.spamQuality);
      return;
    }
    if (!(commentText || "").trim() || commentText.length < 2) {
      setErr(s.commentTooShort);
      return;
    }
    const rate = await canPerformAction("comment");
    if (!rate.allowed) {
      setErr(s.rateLimitComment(rate.waitSeconds));
      return;
    }
    setIsCommenting(true);
    const c = {
      id: generateUniqueId("comment"),
      text: (commentText || "").trim(),
      votes: emptyVotes(),
      timestamp: Date.now(),
      edited: false,
      mdFile: commentMdFile || null,
      videoUrl: commentVideoUrl || null,
      replies: [],
      authorHash: deviceHash,
    };
    setTimeout(() => {
      savePosts((prev) =>
        prev.map((p) => (p.id !== postId ? p : { ...p, comments: [...(p.comments || []), c] }))
      );
      const owned = { ...ownedComments, [c.id]: true };
      saveOwnedComments(owned);
      setCommentText("");
      clearCommentDraft().catch(() => {});
      setCommentMdFile(null);
      setCommentVideoUrl("");
      setErr("");
      setIsCommenting(false);
      showToast(lang === "ar" ? "💬 تم إضافة تعليقك!" : "💬 Comment added!");
    }, isMobile ? 300 : 180);
  };

  const deleteComment = (postId, commentId) => {
    askConfirm(s.confirmDeleteComment, () => {
      // إصلاح تسريب بيانات: كانت الملكية (ownedComments للتعليق نفسه،
      // وownedReplies لكل ردوده) لا تُنظَّف إطلاقًا عند الحذف — تبقى
      // معرّفات يتيمة في localStorage للأبد. نحسب هنا ردود التعليق *قبل*
      // حذفه من posts، وننظّف الخريطتين معًا.
      const post = posts.find((p) => p.id === postId);
      const comment = post?.comments?.find((c) => c.id === commentId);
      const replyIds = (comment?.replies || []).map((r) => r.id);

      savePosts((prev) =>
        prev.map((p) =>
          p.id !== postId ? p : { ...p, comments: (p.comments || []).filter((c) => c.id !== commentId) }
        )
      );

      if (ownedComments[commentId]) {
        const oc = { ...ownedComments };
        delete oc[commentId];
        saveOwnedComments(oc);
      }
      if (replyIds.length > 0) {
        const or_ = { ...ownedReplies };
        replyIds.forEach((rid) => delete or_[rid]);
        saveOwnedReplies(or_);
      }

      showToast(s.toastCommentDeleted);
    });
  };

  const saveEditComment = (postId, commentId) => {
    if (!(editCommentText || "").trim() || editCommentText.length < 2) {
      setErr(s.commentTooShort);
      return;
    }
    if (isSpamQuality(editCommentText)) {
      setErr(s.spamQuality);
      return;
    }
    savePosts((prev) =>
      prev.map((p) =>
        p.id !== postId
          ? p
          : {
              ...p,
              comments: (p.comments || []).map((c) =>
                c.id !== commentId ? c : { ...c, text: (editCommentText || "").trim(), edited: true }
              ),
            }
      )
    );
    setEditingCommentId(null);
    setErr("");
    showToast(s.toastCommentEdited);
  };

  return {
    commentText,
    setCommentText,
    commentMdFile,
    setCommentMdFile,
    commentVideoUrl,
    setCommentVideoUrl,
    isCommenting,
    setIsCommenting,
    editingCommentId,
    setEditingCommentId,
    editCommentText,
    setEditCommentText,
    addComment,
    deleteComment,
    saveEditComment,
  };
}

export default useComments;
