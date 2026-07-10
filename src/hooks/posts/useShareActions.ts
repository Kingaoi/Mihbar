import { useMemo, useCallback } from "react";
import { sumVotes } from "../../utils/index";

export function useShareActions({
  posts,
  deviceHash,
  ownedComments,
  s,
  showToast,
}) {
  const myPosts = useMemo(() => posts.filter((p) => p.authorHash === deviceHash), [posts, deviceHash]);
  
  const myComments = useMemo(() => posts.reduce((arr, p) => {
    (p.comments || []).forEach((c) => {
      if (ownedComments[c.id]) arr.push({ ...c, postId: p.id, postText: p.text });
    });
    return arr;
  }, []), [posts, ownedComments]);

  const myTotalReactions = useMemo(() => myPosts.reduce((sum, p) => sum + sumVotes(p.votes), 0), [myPosts]);

  const fallbackCopy = (textVal, done) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = textVal;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      done();
    } catch {}
  };

  const copyItemText = useCallback((textVal, urlVal = "") => {
    const fullText = urlVal ? `${textVal}\n\n${urlVal}` : textVal;
    const done = () => showToast(s.toastCopied);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(fullText)
        .then(done)
        .catch(() => fallbackCopy(fullText, done));
    } else {
      fallbackCopy(fullText, done);
    }
  }, [s.toastCopied, showToast]);

  const shareItemText = useCallback((textVal, urlVal = "") => {
    if (navigator.share) {
      navigator
        .share({ title: s.shareTitle, text: textVal, url: urlVal || undefined })
        .then(() => showToast(s.toastShared))
        .catch(() => copyItemText(textVal, urlVal));
    } else {
      copyItemText(textVal, urlVal);
    }
  }, [s.shareTitle, s.toastShared, showToast, copyItemText]);

  return {
    myPosts,
    myComments,
    myTotalReactions,
    copyItemText,
    shareItemText,
  };
}

export default useShareActions;
