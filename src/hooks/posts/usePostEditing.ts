import { useState, useCallback } from "react";
import { isSpamQuality } from "../../utils/index";

export function usePostEditing({
  s,
  posts,
  savePosts,
  showToast,
  ownedPosts,
  saveOwnedPosts,
  ownedComments,
  saveOwnedComments,
  ownedReplies,
  saveOwnedReplies,
  askConfirm,
  askDangerConfirm,
  setSettingsOpen,
  setSettingsPageOpen,
  setActivePostId,
  // setters from other hooks to reset on cancelEdit
  setEditingCommentId,
  setEditingReplyInfo,
  setEditCommentText,
  setEditReplyText,
  setErr,
}) {
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostText, setEditPostText] = useState("");

  const cancelEdit = useCallback(() => {
    setEditingPostId(null);
    setEditingCommentId(null);
    setEditingReplyInfo(null);
    setEditPostText("");
    setEditCommentText("");
    setEditReplyText("");
    setErr("");
  }, [
    setEditingCommentId,
    setEditingReplyInfo,
    setEditCommentText,
    setEditReplyText,
    setErr,
  ]);

  const deletePost = useCallback((postId) => {
    askConfirm(s.confirmDelete, () => {
      // إصلاح تسريب بيانات: كان الحذف يزيل المنشور من ownedPosts فقط،
      // تاركًا معرّفات كل تعليقاته وردوده كـ"يتيمة" (orphan) في
      // ownedComments/ownedReplies إلى الأبد — لا شيء ينظّفها لاحقًا، فتتراكم
      // في localStorage بلا حد مع الوقت. نحسب هنا كل معرّفات التعليقات
      // والردود التابعة للمنشور *قبل* حذفه من posts (savePosts تُحدّث
      // الحالة لاحقًا بشكل غير متزامن)، وننظّف الخرائط الثلاث معًا.
      const post = posts.find((p) => p.id === postId);
      const commentIds = (post?.comments || []).map((c) => c.id);
      const replyIds = (post?.comments || []).flatMap((c) => (c.replies || []).map((r) => r.id));

      savePosts((prev) => prev.filter((p) => p.id !== postId));

      const o = { ...ownedPosts };
      delete o[postId];
      saveOwnedPosts(o);

      if (commentIds.length > 0) {
        const oc = { ...ownedComments };
        commentIds.forEach((cid) => delete oc[cid]);
        saveOwnedComments(oc);
      }
      if (replyIds.length > 0) {
        const or_ = { ...ownedReplies };
        replyIds.forEach((rid) => delete or_[rid]);
        saveOwnedReplies(or_);
      }

      setActivePostId(null);
      showToast(s.toastDeleted);
    });
  }, [s.confirmDelete, s.toastDeleted, posts, savePosts, ownedPosts, ownedComments, ownedReplies, showToast, askConfirm, saveOwnedPosts, saveOwnedComments, saveOwnedReplies, setActivePostId]);

  const saveEditPost = useCallback((postId) => {
    if (!(editPostText || "").trim() || editPostText.length < 5) {
      setErr(s.eShort);
      return;
    }
    if (isSpamQuality(editPostText)) {
      setErr(s.spamQuality);
      return;
    }
    savePosts((prev) => prev.map((p) => (p.id !== postId ? p : { ...p, text: (editPostText || "").trim(), edited: true })));
    setEditingPostId(null);
    setErr("");
    showToast(s.toastEdited);
  }, [editPostText, s.eShort, s.spamQuality, s.toastEdited, savePosts, showToast, setErr]);

  const purgeMyContent = useCallback(() => {
    savePosts((prev) =>
      prev
        .filter((p) => !ownedPosts[p.id])
        .map((p) => ({
          ...p,
          comments: (p.comments || [])
            .filter((c) => !ownedComments[c.id])
            .map((c) => ({
              ...c,
              replies: (c.replies || []).filter((r) => !ownedReplies[r.id]),
            })),
        }))
    );
  }, [savePosts, ownedPosts, ownedComments, ownedReplies]);

  const purgeMyOwnership = useCallback(() => {
    saveOwnedPosts({});
    saveOwnedComments({});
    saveOwnedReplies({});
  }, [saveOwnedPosts, saveOwnedComments, saveOwnedReplies]);

  const confirmPurgeContent = useCallback(() => {
    askDangerConfirm(s.dangerPurgeContent, () => {
      purgeMyContent();
      purgeMyOwnership();
      setSettingsOpen(false);
      setSettingsPageOpen(false);
      showToast(s.toastPurged);
    });
  }, [s.dangerPurgeContent, s.toastPurged, purgeMyContent, purgeMyOwnership, setSettingsOpen, setSettingsPageOpen, showToast, askDangerConfirm]);

  const confirmPurgeOwnershipOnly = useCallback(() => {
    askDangerConfirm(s.dangerPurgeOwnership, () => {
      purgeMyOwnership();
      setSettingsOpen(false);
      setSettingsPageOpen(false);
      showToast(s.toastOwnershipCleared);
    });
  }, [s.dangerPurgeOwnership, s.toastOwnershipCleared, purgeMyOwnership, setSettingsOpen, setSettingsPageOpen, showToast, askDangerConfirm]);

  return {
    editingPostId,
    setEditingPostId,
    editPostText,
    setEditPostText,
    cancelEdit,
    deletePost,
    saveEditPost,
    purgeMyContent,
    purgeMyOwnership,
    confirmPurgeContent,
    confirmPurgeOwnershipOnly,
  };
}

export default usePostEditing;
