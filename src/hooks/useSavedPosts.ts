import { useState, useEffect } from "react";
import { getSavedPostsMap, saveSavedPostsMap } from "../utils/dataLayer";

export function useSavedPosts() {
  const [savedPosts, setSavedPosts] = useState({});

  useEffect(() => {
    let cancelled = false;
    // القراءة الآن تمر عبر dataLayer.js بدل localStorage مباشرة، لكن نفس
    // fallback الأصلي محفوظ: الـ adapter نفسه يُرجع {} افتراضيًا عند غياب البيانات
    (async () => {
      const saved = await getSavedPostsMap();
      if (cancelled) return;
      if (saved && Object.keys(saved).length > 0) {
        setSavedPosts(saved);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSavePost = (postId) => {
    setSavedPosts((prev) => {
      const next = { ...prev };
      if (next[postId]) {
        delete next[postId];
      } else {
        next[postId] = true;
      }
      // تحديث متفائل: نفس نمط savePosts في usePostsData.js — الحالة تتحدث
      // فورًا، والحفظ الفعلي (async الآن) يحصل في الخلفية بدون انتظار.
      saveSavedPostsMap(next).catch((e) => {
        console.error("Failed to save saved-posts map:", e);
      });
      return next;
    });
  };

  return { savedPosts, toggleSavePost };
}
