import { useState, useEffect } from "react";
import { canPerformAction, isSpamQuality, emptyVotes } from "../../utils/index";
import { getCommentDraft, saveCommentDraft, clearCommentDraft } from "../../utils/dataLayer";

export function useComments({
  s,
  lang,
  isMobile,
  isBanned,
  deviceHash,
  ownedComments,
  saveOwnedComments,
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
    // نفس الفحص الدفاعي الموجود في usePostForm.js submit — انظر التعليق هناك.
    if (!deviceHash) {
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
      id: `comment-${Date.now()}`,
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
      savePosts((prev) =>
        prev.map((p) =>
          p.id !== postId ? p : { ...p, comments: (p.comments || []).filter((c) => c.id !== commentId) }
        )
      );
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
