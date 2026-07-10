import { memo } from "react";
import ProfilePostItem from "./feed/ProfilePostItem";
import ProfileCommentItem from "./feed/ProfileCommentItem";
import FeedPostItem from "./feed/FeedPostItem";

const FeedItem = memo(function FeedItem({
  type = "feed", // "feed", "profile-post", "profile-comment"
  p,
  onClick,
  s,
  CL,
  R,
  BORDERS,
  isMobile,
  btn0,
  
  // For 'feed'
  isOwner,
  openMenuFor,
  setOpenMenuFor,
  onDelete,
  copyItemText,
  shareItemText,
  
  deviceHash,
  updateVotes,
  handlePollVote,
  
  editingPostId,
  setEditingPostId,
  editPostText,
  setEditPostText,
  saveEditPost,
  cancelEdit,
  err,
  
  threadPending,
  isLast = false,
  cardStyle,
  btnPrimary,
  btnSecondary,
  inputBase,
  activePostId,
  savedPosts,
  toggleSavePost,
}: any) {
  if (type === "profile-post") {
    return (
      <ProfilePostItem
        p={p}
        onClick={onClick}
        s={s}
        CL={CL}
        R={R}
        cardStyle={cardStyle}
      />
    );
  }

  if (type === "profile-comment") {
    return (
      <ProfileCommentItem
        p={p}
        onClick={onClick}
        s={s}
        CL={CL}
        R={R}
        cardStyle={cardStyle}
      />
    );
  }

  // default / "feed"
  return (
    <FeedPostItem
      p={p}
      onClick={onClick}
      s={s}
      CL={CL}
      R={R}
      BORDERS={BORDERS}
      isMobile={isMobile}
      btn0={btn0}
      isOwner={isOwner}
      openMenuFor={openMenuFor}
      setOpenMenuFor={setOpenMenuFor}
      onDelete={onDelete}
      copyItemText={copyItemText}
      shareItemText={shareItemText}
      deviceHash={deviceHash}
      updateVotes={updateVotes}
      handlePollVote={handlePollVote}
      editingPostId={editingPostId}
      setEditingPostId={setEditingPostId}
      editPostText={editPostText}
      setEditPostText={setEditPostText}
      saveEditPost={saveEditPost}
      cancelEdit={cancelEdit}
      err={err}
      threadPending={threadPending}
      isLast={isLast}
      btnPrimary={btnPrimary}
      btnSecondary={btnSecondary}
      inputBase={inputBase}
      activePostId={activePostId}
      savedPosts={savedPosts}
      toggleSavePost={toggleSavePost}
    />
  );
});

export default FeedItem;
