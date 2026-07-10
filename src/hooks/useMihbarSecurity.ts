import { useState, useEffect } from "react";
import { db, checkIfBanned, generateDeviceHash } from "../utils/index";

export function useMihbarSecurity() {
  // deviceHash/isBanned/banTimeLeft لم يعد ممكنًا حسابها بشكل متزامن داخل
  // useState initializer (كما كان سابقًا) لأن db.getDeviceHash()/checkIfBanned()
  // أصبحتا async. القيم الأولية أدناه محايدة وآمنة (جهاز غير محظور افتراضيًا)
  // ريثما يكتمل التحميل الفعلي في useEffect بالأسفل.
  const [deviceHash, setDeviceHash] = useState(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banTimeLeft, setBanTimeLeft] = useState(0);
  // securityReady: true فقط بعد اكتمال تحميل device hash وحالة الحظر
  // الفعليين من التخزين. أي إجراء حساس (نشر منشور/تعليق) في الـ hooks
  // الأخرى يجب أن ينتظر هذا العلم قبل السماح بالتنفيذ، لتفادي التصرف
  // بقيم افتراضية مؤقتة أثناء نافذة التحميل القصيرة.
  const [securityReady, setSecurityReady] = useState(false);

  const [ownedPosts, setOwnedPostsState] = useState({});
  const [ownedReplies, setOwnedRepliesState] = useState({});
  const [ownedComments, setOwnedCommentsState] = useState({});

  // تهيئة device hash + فحص الحظر الأولي + تحميل الملكية — كلها الآن في
  // effect init واحد لضمان ترتيب صحيح (device hash لازم يوجد أولاً).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let h = await db.getDeviceHash();
      if (!h) {
        h = generateDeviceHash();
        await db.saveDeviceHash(h);
      }
      if (cancelled) return;
      setDeviceHash(h);

      const e = await checkIfBanned();
      if (cancelled) return;
      setIsBanned(e !== null);
      setBanTimeLeft(e ? Math.ceil((e - Date.now()) / 1000) : 0);

      const [op, or_, oc] = await Promise.all([
        db.getOwnedPosts(),
        db.getOwnedReplies(),
        db.getOwnedComments(),
      ]);
      if (cancelled) return;
      setOwnedPostsState(op);
      setOwnedRepliesState(or_);
      setOwnedCommentsState(oc);

      setSecurityReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Ban effect timer
  useEffect(() => {
    if (!isBanned) return;
    const iv = setInterval(async () => {
      const e = await checkIfBanned();
      if (!e) {
        setIsBanned(false);
        setBanTimeLeft(0);
      } else {
        setBanTimeLeft(Math.ceil((e - Date.now()) / 1000));
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [isBanned]);

  const saveOwnedPosts = (v) => {
    setOwnedPostsState(v);
    db.saveOwnedPosts(v).catch((e) => console.error("Failed to save owned posts:", e));
  };

  const saveOwnedComments = (v) => {
    setOwnedCommentsState(v);
    db.saveOwnedComments(v).catch((e) => console.error("Failed to save owned comments:", e));
  };

  const saveOwnedReplies = (v) => {
    setOwnedRepliesState(v);
    db.saveOwnedReplies(v).catch((e) => console.error("Failed to save owned replies:", e));
  };

  return {
    deviceHash,
    securityReady,
    isBanned,
    setIsBanned,
    banTimeLeft,
    setBanTimeLeft,
    ownedPosts,
    saveOwnedPosts,
    ownedComments,
    saveOwnedComments,
    ownedReplies,
    saveOwnedReplies,
  };
}
