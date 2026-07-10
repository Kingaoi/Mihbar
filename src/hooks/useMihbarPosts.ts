import { useEffect } from "react";

// Import specialized sub-hooks
import { usePostsData } from "./posts/usePostsData";
import { usePostForm } from "./posts/usePostForm";
import { useComments } from "./posts/useComments";
import { useReplies } from "./posts/useReplies";
import { usePostEditing } from "./posts/usePostEditing";
import { useThreadNavigation } from "./posts/useThreadNavigation";
import { usePWAInstall } from "./posts/usePWAInstall";
import { useShareActions } from "./posts/useShareActions";
import { useMdEditor } from "./posts/useMdEditor";

export function useMihbarPosts({
  s,
  lang,
  isMobile,
  isBanned,
  deviceHash,
  ownedPosts,
  saveOwnedPosts,
  ownedComments,
  saveOwnedComments,
  ownedReplies,
  saveOwnedReplies,
  showToast,
  askConfirm,
  savedPosts,
  askDangerConfirm,
  setSettingsOpen,
  setSettingsPageOpen,
  setProfilePageOpen,
}) {
  // 1. Posts Data Storage, Filtering & Reactions
  const postsData = usePostsData({ deviceHash, savedPosts });
  const { posts, setPosts, loading, tab, setTab, catFilter, setCatFilter, searchQuery, setSearchQuery, activeCatRef, displayed, savePosts, updateVotes, handlePollVote } = postsData;

  // 2. Post Creation Form State
  const postForm = usePostForm({
    s,
    isMobile,
    isBanned,
    deviceHash,
    ownedPosts,
    saveOwnedPosts,
    savePosts,
    showToast,
  });
  const {
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
    err,
    setErr,
    submit,
  } = postForm;

  // Keep selected pill visible
  useEffect(() => {
    activeCatRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [category, activeCatRef]);

  // 3. Comments Logic
  const comments = useComments({
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
  });
  const {
    commentText,
    setCommentText,
    commentMdFile,
    setCommentMdFile,
    commentVideoUrl,
    setCommentVideoUrl,
    isCommenting,
    editingCommentId,
    setEditingCommentId,
    editCommentText,
    setEditCommentText,
    addComment,
    deleteComment,
    saveEditComment,
  } = comments;

  // 4. Replies Logic
  const replies = useReplies({
    s,
    isMobile,
    isBanned,
    deviceHash,
    ownedReplies,
    saveOwnedReplies,
    savePosts,
    showToast,
    setErr,
    askConfirm,
  });
  const {
    replyText,
    setReplyText,
    replyMdFile,
    setReplyMdFile,
    replyVideoUrl,
    setReplyVideoUrl,
    isReplying2,
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
  } = replies;

  // 5. Thread Navigation
  const navigation = useThreadNavigation({
    posts,
    setCommentText,
    setCommentMdFile,
    setReplyingToId,
    setReplyText,
    setReplyMdFile,
    setExpandedIds,
    cancelEdit: () => cancelEdit(), // will be defined below in postEditing
    setProfilePageOpen,
  });
  const {
    activePostId,
    setActivePostId,
    threadPending,
    setThreadPending,
    threadClosing,
    setThreadClosing,
    openThread,
    closeThread,
    openThreadFromProfile,
  } = navigation;

  // 6. Post Editing & Deletion
  const postEditing = usePostEditing({
    s,
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
    setEditingCommentId,
    setEditingReplyInfo,
    setEditCommentText,
    setEditReplyText,
    setErr,
  });
  const {
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
  } = postEditing;

  // 7. PWA Installation Banner
  const pwaInstall = usePWAInstall({ s, showToast });
  const {
    showPwaBanner,
    deferredPrompt,
    handleInstallPWA,
    handleDismissPWABanner,
  } = pwaInstall;

  // 8. Sharing & User Profile Statistics
  const shareActions = useShareActions({
    posts,
    deviceHash,
    ownedComments,
    s,
    showToast,
  });
  const {
    myPosts,
    myComments,
    myTotalReactions,
    copyItemText,
    shareItemText,
  } = shareActions;

  // 9. Shared Markdown Editor Logic
  const mdEditor = useMdEditor({
    setMdFile,
    setCommentMdFile,
    setReplyMdFile,
  });
  const {
    mdEditorState,
    openMdEditor,
    closeMdEditor,
    saveMdEditor,
  } = mdEditor;

  return {
    posts,
    setPosts,
    loading,
    displayed,
    isPosting,
    isCommenting,
    isReplying2,

    // Core state
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

    commentText,
    setCommentText,
    commentMdFile,
    setCommentMdFile,
    commentVideoUrl,
    setCommentVideoUrl,

    replyText,
    setReplyText,
    replyMdFile,
    setReplyMdFile,
    replyVideoUrl,
    setReplyVideoUrl,
    replyingToId,
    setReplyingToId,
    expandedIds,
    setExpandedIds,

    // Editor & Edits
    mdEditorState,
    openMdEditor,
    closeMdEditor,
    saveMdEditor,
    toggleReplies,
    startReply,
    editingPostId,
    setEditingPostId,
    editingCommentId,
    setEditingCommentId,
    editingReplyInfo,
    setEditingReplyInfo,
    editPostText,
    setEditPostText,
    editCommentText,
    setEditCommentText,
    editReplyText,
    setEditReplyText,
    err,
    setErr,

    // Navigation and Filters
    tab,
    setTab,
    catFilter,
    setCatFilter,
    searchQuery,
    setSearchQuery,
    activePostId,
    setActivePostId,
    threadPending,
    setThreadPending,
    threadClosing,
    setThreadClosing,

    // PWA properties
    showPwaBanner,
    handleInstallPWA,
    handleDismissPWABanner,
    activeCatRef,
    deferredPrompt,

    // Operations
    updateVotes,
    handlePollVote,
    submit,
    addComment,
    addReply,
    deletePost,
    deleteComment,
    deleteReply,
    saveEditPost,
    saveEditComment,
    saveEditReply,
    cancelEdit,
    purgeMyContent,
    purgeMyOwnership,
    confirmPurgeContent,
    confirmPurgeOwnershipOnly,
    openThread,
    closeThread,
    openThreadFromProfile,
    copyItemText,
    shareItemText,

    // Profile variables
    myPosts,
    myComments,
    myTotalReactions,
  };
}
