import { useState, useCallback } from "react";
import { canPerformAction, isSpamQuality, emptyVotes, generateUniqueId } from "../../utils/index";

export function useReplies({
  s,
  isMobile,
  isBanned,
  deviceHash,
  securityReady,
  ownedReplies,
  saveOwnedReplies,
  savePosts,
  showToast,
  setErr,
  askConfirm,
}) {
  const [replyText, setReplyText] = useState("");
  const [replyMdFile, setReplyMdFile] = useState(null);
  const [replyVideoUrl, setReplyVideoUrl] = useState("");
  const [isReplying2, setIsReplying2] = useState(false);
  const [replyingToId, setReplyingToId] = useState(null);
  const [expandedIds, setExpandedIds] = useState({});
  const [editingReplyInfo, setEditingReplyInfo] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");

  const addReply = async (postId, commentId) => {
    if (isBanned) {
      setErr(s.banned);
      return;
    }
    // securityReady: false يعني تحميل بصمة الجهاز/حالة الحظر لم يكتمل بعد.
    // انظر التعليق المطابق في usePostForm.ts submit.
    if (!securityReady || !deviceHash) {
      return;
    }
    if (isSpamQuality(replyText)) {
      setErr(s.spamQuality);
      return;
    }
    if (!(replyText || "").trim() || replyText.length < 2) {
      setErr(s.replyTooShort);
      return;
    }
    const rate = await canPerformAction("reply");
    if (!rate.allowed) {
      setErr(s.rateLimitReply(rate.waitSeconds));
      return;
    }
    setIsReplying2(true);
    const r = {
      id: generateUniqueId("reply"),
      text: (replyText || "").trim(),
      votes: emptyVotes(),
      timestamp: Date.now(),
      edited: false,
      mdFile: replyMdFile || null,
      videoUrl: replyVideoUrl || null,
      authorHash: deviceHash,
    };
    setTimeout(() => {
      savePosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: (p.comments || []).map((c) =>
              c.id !== commentId ? c : { ...c, replies: [...(c.replies || []), r] }
            ),
          };
        })
      );
      const o = { ...ownedReplies, [r.id]: true };
      saveOwnedReplies(o);
      setExpandedIds((prev) => ({ ...prev, [commentId]: true }));
      setReplyText("");
      setReplyMdFile(null);
      setReplyVideoUrl("");
      setReplyingToId(null);
      setErr("");
      setIsReplying2(false);
      showToast(s.toastReplied);
    }, isMobile ? 300 : 180);
  };

  const deleteReply = (postId, commentId, replyId) => {
    askConfirm(s.confirmDeleteReply, () => {
      savePosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: (p.comments || []).map((c) =>
              c.id !== commentId
                ? c
                : { ...c, replies: (c.replies || []).filter((r) => r.id !== replyId) }
            ),
          };
        })
      );
      showToast(s.toastReplyDeleted);
    });
  };

  const saveEditReply = (postId, commentId, replyId) => {
    if (!(editReplyText || "").trim() || editReplyText.length < 2) {
      setErr(s.replyTooShort);
      return;
    }
    if (isSpamQuality(editReplyText)) {
      setErr(s.spamQuality);
      return;
    }
    savePosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: (p.comments || []).map((c) => {
            if (c.id !== commentId) return c;
            return {
              ...c,
              replies: (c.replies || []).map((r) =>
                r.id !== replyId ? r : { ...r, text: (editReplyText || "").trim(), edited: true }
              ),
            };
          }),
        };
      })
    );
    setEditingReplyInfo(null);
    setEditReplyText("");
    setErr("");
    showToast(s.toastReplyEdited);
  };

  const toggleReplies = useCallback((cid) => {
    setExpandedIds((prev) => ({ ...prev, [cid]: !prev[cid] }));
  }, []);

  const startReply = useCallback((cid) => {
    if (replyingToId === cid) {
      setReplyingToId(null);
      setReplyText("");
      setReplyMdFile(null);
    } else {
      setReplyingToId(cid);
      setExpandedIds((prev) => ({ ...prev, [cid]: true }));
      setReplyText("");
      setReplyMdFile(null);
    }
    setErr("");
  }, [replyingToId, setErr]);

  return {
    replyText,
    setReplyText,
    replyMdFile,
    setReplyMdFile,
    replyVideoUrl,
    setReplyVideoUrl,
    isReplying2,
    setIsReplying2,
    replyingToId,
    setReplyingToId,
    expandedIds,
    setExpandedIds,
    editingReplyInfo,
    setEditingReplyInfo,
    editReplyText,
    setEditReplyText,
    addReply,
    deleteReply,
    saveEditReply,
    toggleReplies,
    startReply,
  };
}

export default useReplies;
