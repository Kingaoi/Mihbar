// ============================================================================
// localStorageAdapter.js — التنفيذ الفعلي الوحيد المسموح بلمس localStorage
// ============================================================================
// هذا الملف هو الموضع الحصري لكل قراءة/كتابة على localStorage في التطبيق.
// لا شيء خارج هذا الملف يجب أن يستدعي localStorage.getItem/setItem/removeItem
// مباشرة — كل شيء آخر (hooks, components) يمر عبر dataLayer.js الذي يستدعي
// هذا الملف.
//
// لماذا هذا الملف "محلي بحت" ولا يظهر شكله في العقد العام (dataLayer.js):
// منطق secureSave/secureLoad أدناه (التشويه + التوقيع الرقمي + بصمة التكامل
// الشاملة + كشف التلاعب) هو دفاع خاص بتخزين المتصفح نفسه — يحمي من تلاعب
// المستخدم بملفات localStorage الخاصة به على جهازه. هذا المفهوم لا معنى له
// في سياق Supabase (حيث الحماية تكون عبر RLS/Auth على السيرفر)، لذلك
// عند الربط بـ Supabase مستقبلاً، سيُستبدل هذا الملف بالكامل بـ
// supabaseAdapter.js الذي لن يحتاج أي تشويه أو توقيع محلي على الإطلاق —
// فقط استعلامات مباشرة، لأن الخادم هو من يفرض الصلاحيات والتكامل.
//
// كل التوقيعات (function signatures) هنا تطابق تمامًا ما كان موجودًا سابقًا
// في utils/index.js (db object + secureSave/secureLoad/safeSave) — لم يتغيّر
// أي سلوك، فقط أُعيد التنظيم في ملف مستقل واحد.
//
// ملاحظة async (إضافة لاحقة): كل دالة في الواجهة المُصدَّرة (localStorageAdapter
// أدناه) أصبحت async، رغم أن العمليات الداخلية على localStorage متزامنة وسريعة
// فعليًا. هذا قرار معماري مقصود: يضمن أن توقيع (signature) هذا الـ adapter
// يطابق تمامًا توقيع supabaseAdapter.stub.js (الذي عملياته async بطبيعتها عبر
// الشبكة)، بحيث يكون التبديل بين الاثنين لاحقًا مجرد تغيير سطر import واحد في
// dataLayer.js، بدون الحاجة لإعادة كتابة أي hook يستهلك هذه الدوال.
// المنطق الداخلي (secureSave/secureLoad/إلخ) يبقى متزامنًا كما هو تمامًا؛
// فقط الدوال المُصدَّرة في الأسفل هي من تُغلَّف بـ async.
// ============================================================================

import {
  POSTS_KEY,
  LANG_KEY,
  OWNER_KEY,
  OWNED_REPLIES_KEY,
  OWNED_COMMENTS_KEY,
  DEVICE_HASH_KEY,
  BANNED_KEY,
  RATE_KEY,
  THEME_KEY,
  INTEGRITY_KEY,
} from "../../constants/index";

// مفاتيح إضافية كانت مباشرة على localStorage خارج utils/index.js
// (منقولة هنا حرفيًا بنفس القيم بالضبط لضمان توافق رجعي كامل مع البيانات
// المخزنة سابقًا على أجهزة المستخدمين الحاليين)
const SAVED_POSTS_KEY = "mihbar_saved_posts";
const COMMENT_DRAFT_KEY = "mihbar_comment_draft";
const POST_DRAFT_KEY = "mihbar_post_draft";
// منقولة حرفيًا من ProfilePage.jsx وDevNoticeModal.jsx (كانت تستدعي
// localStorage مباشرة من داخل component، وهو ما يخالف قاعدة هذا الملف
// كموضع حصري للتخزين الخام)
const DISPLAY_NAME_KEY = "mh_display_name";
const USER_NAME_KEY = "mh_user_name";
const DEV_NOTICE_ACK_KEY = "_mh_dev_notice_ack_v1";

// ----------------------------------------------------------------------------
// 0. البنية الأمنية الداخلية (منقولة حرفيًا من utils/index.js — لا تغيير سلوكي)
// ----------------------------------------------------------------------------

const SECRET_SALT = "mihbar_secure_salt_v5_93817";
const OLD_SECRET_SALT = "inkore_secure_salt_v5_93817";

const simpleHash = (str, salt = SECRET_SALT) => {
  let hash = 5381;
  const fullStr = str + salt;
  for (let i = 0; i < fullStr.length; i++) {
    hash = (hash * 33) ^ fullStr.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
};

const scramble = (text) => {
  try {
    const b64 = window.btoa(unescape(encodeURIComponent(text)));
    return b64.split("").reverse().join("");
  } catch {
    return text;
  }
};

const unscramble = (scrambled) => {
  try {
    const b64 = scrambled.split("").reverse().join("");
    return decodeURIComponent(escape(window.atob(b64)));
  } catch {
    return scrambled;
  }
};

/**
 * حفظ آمن مشوّه وموقّع رقميًا. حصري لهذا الملف — لا يُستدعى مباشرة من
 * dataLayer.js، بل عبر دوال db.* أدناه فقط.
 */
const secureSave = (key, value) => {
  try {
    const rawStr = JSON.stringify(value);
    const scrambled = scramble(rawStr);
    const signature = simpleHash(scrambled);
    const payload = JSON.stringify({ d: scrambled, s: signature });
    localStorage.setItem(key, payload);
    updateGlobalIntegrity();
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      window.dispatchEvent(new CustomEvent("localstorage-quota-exceeded", { detail: { key } }));
    }
    console.warn("[Mihbar Storage] secureSave failed:", e);
  }
};

const secureLoad = (key, fallback = null) => {
  try {
    const ikPrefixKeyMap = {
      "_mh_sec_own_v5": "_ik_sec_own_v5",
      "_mh_sec_co_v5": "_ik_sec_co_v5",
      "_mh_sec_re_v5": "_ik_sec_re_v5",
      "_mh_sec_dev_v5": "_ik_sec_dev_v5",
      "_mh_sec_ban_v5": "_ik_sec_ban_v5",
    };

    const ikKey = ikPrefixKeyMap[key];
    if (ikKey && localStorage.getItem(key) === null) {
      const ikVal = localStorage.getItem(ikKey);
      if (ikVal !== null) {
        const parsedOld = secureLoad(ikKey, null);
        if (parsedOld !== null) {
          secureSave(key, parsedOld);
          localStorage.removeItem(ikKey);
        }
      }
    }

    const oldKeyMap = {
      "_mh_sec_own_v5": "inkore-owner-v5",
      "_mh_sec_co_v5": "inkore-owned-comments-v5",
      "_mh_sec_re_v5": "inkore-owned-replies-v5",
      "_mh_sec_dev_v5": "inkore-device-hash",
      "_mh_sec_ban_v5": "inkore-banned-devices",
      "_ik_sec_own_v5": "inkore-owner-v5",
      "_ik_sec_co_v5": "inkore-owned-comments-v5",
      "_ik_sec_re_v5": "inkore-owned-replies-v5",
      "_ik_sec_dev_v5": "inkore-device-hash",
      "_ik_sec_ban_v5": "inkore-banned-devices",
    };

    const oldKey = oldKeyMap[key];
    if (oldKey && localStorage.getItem(key) === null) {
      const oldVal = localStorage.getItem(oldKey);
      if (oldVal !== null) {
        let parsed;
        try {
          parsed = JSON.parse(oldVal);
        } catch {
          parsed = oldVal;
        }
        secureSave(key, parsed);
        localStorage.removeItem(oldKey);
        return parsed;
      }
    }

    const payloadStr = localStorage.getItem(key);
    if (!payloadStr) return fallback;

    const payload = JSON.parse(payloadStr);
    if (!payload || typeof payload !== "object" || !payload.s || !payload.d) {
      console.warn(`[Mihbar Security] هيكل بيانات غير صالح أو تلاعب تم اكتشافه للمفتاح: ${key}`);
      handleTamperingDetected();
      return fallback;
    }

    let calculatedSig = simpleHash(payload.d, SECRET_SALT);
    let isSigValid = calculatedSig === payload.s;

    if (!isSigValid) {
      const oldCalculatedSig = simpleHash(payload.d, OLD_SECRET_SALT);
      if (oldCalculatedSig === payload.s) {
        isSigValid = true;
        const decryptedStr = unscramble(payload.d);
        try {
          const parsedVal = JSON.parse(decryptedStr);
          secureSave(key, parsedVal);
        } catch {}
      }
    }

    if (!isSigValid) {
      console.warn(`[Mihbar Security] فشل التحقق من البصمة الرقمية للمفتاح: ${key}`);
      handleTamperingDetected();
      return fallback;
    }

    const decryptedStr = unscramble(payload.d);
    return JSON.parse(decryptedStr);
  } catch {
    return fallback;
  }
};

const calculateGlobalStateHash = () => {
  const own = localStorage.getItem(OWNER_KEY) || "";
  const co = localStorage.getItem(OWNED_COMMENTS_KEY) || "";
  const re = localStorage.getItem(OWNED_REPLIES_KEY) || "";
  const dev = localStorage.getItem(DEVICE_HASH_KEY) || "";
  const ban = localStorage.getItem(BANNED_KEY) || "";
  return simpleHash(own + co + re + dev + ban);
};

const updateGlobalIntegrity = () => {
  try {
    const hash = calculateGlobalStateHash();
    localStorage.setItem(INTEGRITY_KEY, hash);
  } catch {}
};

const verifyGlobalIntegrity = () => {
  try {
    const storedSig = localStorage.getItem(INTEGRITY_KEY);
    const own = localStorage.getItem(OWNER_KEY);
    const co = localStorage.getItem(OWNED_COMMENTS_KEY);
    const re = localStorage.getItem(OWNED_REPLIES_KEY);
    const dev = localStorage.getItem(DEVICE_HASH_KEY);
    const ban = localStorage.getItem(BANNED_KEY);

    if (!own && !co && !re && !dev && !ban) {
      return true;
    }
    if (!storedSig) {
      return false;
    }
    const currentHash = calculateGlobalStateHash();
    return storedSig === currentHash;
  } catch {
    return false;
  }
};

const handleTamperingDetected = () => {
  console.error("[Mihbar Security] تم اكتشاف تلاعب في بيانات المحرك الأمني للعميل! سيتم اتخاذ إجراءات رادعة.");
  try {
    localStorage.removeItem(OWNER_KEY);
    localStorage.removeItem(OWNED_COMMENTS_KEY);
    localStorage.removeItem(OWNED_REPLIES_KEY);
    updateGlobalIntegrity();
  } catch {}
};

const safeSave = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      window.dispatchEvent(new CustomEvent("localstorage-quota-exceeded", { detail: { key } }));
    }
    console.warn("[Mihbar Storage] safeSave failed:", e);
  }
};

// ----------------------------------------------------------------------------
// 1. المنشورات (Posts) — بدون تشويه أمني، فقط JSON عادي (كما كان سابقًا)
// ----------------------------------------------------------------------------

const getPosts = () => {
  try {
    let val = localStorage.getItem(POSTS_KEY);
    if (val === null) {
      const oldVal = localStorage.getItem("inkore-posts-v5");
      if (oldVal !== null) {
        localStorage.setItem(POSTS_KEY, oldVal);
        localStorage.removeItem("inkore-posts-v5");
        val = oldVal;
      }
    }
    return JSON.parse(val || "[]");
  } catch {
    return [];
  }
};

const savePosts = (posts) => safeSave(POSTS_KEY, posts);

// ----------------------------------------------------------------------------
// 2. الأمان (Security) — device hash, ملكية المحتوى, الحظر, تحديد المعدل
// ----------------------------------------------------------------------------

const getOwnedPosts = () => secureLoad(OWNER_KEY, {});
const saveOwnedPosts = (v) => secureSave(OWNER_KEY, v);

const getOwnedComments = () => secureLoad(OWNED_COMMENTS_KEY, {});
const saveOwnedComments = (v) => secureSave(OWNED_COMMENTS_KEY, v);

const getOwnedReplies = () => secureLoad(OWNED_REPLIES_KEY, {});
const saveOwnedReplies = (v) => secureSave(OWNED_REPLIES_KEY, v);

const getDeviceHash = () => secureLoad(DEVICE_HASH_KEY, null);
const saveDeviceHash = (h) => secureSave(DEVICE_HASH_KEY, h);

const getBannedDevices = () => secureLoad(BANNED_KEY, {});
const saveBannedDevices = (v) => secureSave(BANNED_KEY, v);

const getRateLimitTimes = (action) => secureLoad(`${RATE_KEY}-${action}`, []);
const saveRateLimitTimes = (action, times) => secureSave(`${RATE_KEY}-${action}`, times);

// ----------------------------------------------------------------------------
// 3. التفضيلات (Preferences) — اللغة والثيم، بدون تشويه (كما كانت سابقًا)
// ----------------------------------------------------------------------------

const getLang = () => {
  try {
    let val = localStorage.getItem(LANG_KEY);
    if (val === null) {
      const oldVal = localStorage.getItem("_ik_sys_lang_v5");
      if (oldVal !== null) {
        localStorage.setItem(LANG_KEY, oldVal);
        localStorage.removeItem("_ik_sys_lang_v5");
        val = oldVal;
      }
    }
    return val || "ar";
  } catch {
    return "ar";
  }
};

const saveLang = (lang) => {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
};

const getThemePref = () => {
  try {
    let val = localStorage.getItem(THEME_KEY);
    if (val === null) {
      const oldVal = localStorage.getItem("_ik_sys_thm_v5");
      if (oldVal !== null) {
        localStorage.setItem(THEME_KEY, oldVal);
        localStorage.removeItem("_ik_sys_thm_v5");
        val = oldVal;
      }
    }
    return val || "system";
  } catch {
    return "system";
  }
};

const saveThemePref = (t) => {
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {}
};

// ----------------------------------------------------------------------------
// 4. المنشورات المحفوظة (Saved Posts) — منقولة من useSavedPosts.js حرفيًا
// ----------------------------------------------------------------------------

const getSavedPosts = () => {
  try {
    const saved = localStorage.getItem(SAVED_POSTS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveSavedPosts = (v) => {
  try {
    localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(v));
  } catch {}
};

// ----------------------------------------------------------------------------
// 5. المسودات (Drafts) — منقولة من usePostForm.js وuseComments.js حرفيًا
// ----------------------------------------------------------------------------

const getPostDraft = () => {
  try {
    const saved = localStorage.getItem(POST_DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const savePostDraft = (draft) => {
  try {
    localStorage.setItem(POST_DRAFT_KEY, JSON.stringify(draft));
  } catch {}
};

const clearPostDraft = () => {
  try {
    localStorage.removeItem(POST_DRAFT_KEY);
  } catch {}
};

const getCommentDraft = () => {
  try {
    return localStorage.getItem(COMMENT_DRAFT_KEY) || "";
  } catch {
    return "";
  }
};

const saveCommentDraft = (text) => {
  try {
    localStorage.setItem(COMMENT_DRAFT_KEY, text);
  } catch {}
};

const clearCommentDraft = () => {
  try {
    localStorage.removeItem(COMMENT_DRAFT_KEY);
  } catch {}
};

// ----------------------------------------------------------------------------
// 6. الملف الشخصي (Profile) — منقولة من ProfilePage.jsx حرفيًا
// ----------------------------------------------------------------------------

const getDisplayName = () => {
  try {
    return localStorage.getItem(DISPLAY_NAME_KEY) || "";
  } catch {
    return "";
  }
};

const saveDisplayName = (name) => {
  try {
    localStorage.setItem(DISPLAY_NAME_KEY, name);
  } catch {}
};

const getUserName = () => {
  try {
    return localStorage.getItem(USER_NAME_KEY) || "";
  } catch {
    return "";
  }
};

const saveUserName = (name) => {
  try {
    localStorage.setItem(USER_NAME_KEY, name);
  } catch {}
};

// ----------------------------------------------------------------------------
// 7. إشعار المطوّر (Dev Notice) — منقولة من DevNoticeModal.jsx حرفيًا
// ----------------------------------------------------------------------------

const getDevNoticeAcknowledged = () => {
  try {
    return !!localStorage.getItem(DEV_NOTICE_ACK_KEY);
  } catch {
    return false;
  }
};

const saveDevNoticeAcknowledged = () => {
  try {
    localStorage.setItem(DEV_NOTICE_ACK_KEY, "true");
  } catch {}
};

// ----------------------------------------------------------------------------
// الواجهة الموحدة المصدَّرة — هذا هو الشيء الوحيد الذي يستورده dataLayer.js
// ----------------------------------------------------------------------------

// كل دالة أدناه async فقط من ناحية الواجهة الخارجية (توافقًا مع
// supabaseAdapter.stub.js) — التنفيذ الداخلي يبقى متزامنًا بالكامل
// (لا يوجد أي await حقيقي على عملية I/O شبكية هنا).
export const localStorageAdapter = {
  // Posts
  getPosts: async () => getPosts(),
  // نسخة متزامنة صريحة من getPosts، لتهيئة الحالة الأولية على العميل فقط
  // (انظر شرح loadAllPostsSync في dataLayer.js). غير موجودة في
  // supabaseAdapter.stub.js عمدًا — لا معنى لها بعد الربط بشبكة حقيقية.
  getPostsSync: () => getPosts(),
  savePosts: async (posts) => savePosts(posts),
  // Security
  getOwnedPosts: async () => getOwnedPosts(),
  saveOwnedPosts: async (v) => saveOwnedPosts(v),
  getOwnedComments: async () => getOwnedComments(),
  saveOwnedComments: async (v) => saveOwnedComments(v),
  getOwnedReplies: async () => getOwnedReplies(),
  saveOwnedReplies: async (v) => saveOwnedReplies(v),
  getDeviceHash: async () => getDeviceHash(),
  saveDeviceHash: async (h) => saveDeviceHash(h),
  getBannedDevices: async () => getBannedDevices(),
  saveBannedDevices: async (v) => saveBannedDevices(v),
  getRateLimitTimes: async (action) => getRateLimitTimes(action),
  saveRateLimitTimes: async (action, times) => saveRateLimitTimes(action, times),
  verifyGlobalIntegrity: async () => verifyGlobalIntegrity(),
  handleTamperingDetected: async () => handleTamperingDetected(),
  // Preferences
  getLang: async () => getLang(),
  saveLang: async (lang) => saveLang(lang),
  getThemePref: async () => getThemePref(),
  saveThemePref: async (t) => saveThemePref(t),
  // Saved posts
  getSavedPosts: async () => getSavedPosts(),
  saveSavedPosts: async (v) => saveSavedPosts(v),
  // Drafts
  getPostDraft: async () => getPostDraft(),
  savePostDraft: async (draft) => savePostDraft(draft),
  clearPostDraft: async () => clearPostDraft(),
  getCommentDraft: async () => getCommentDraft(),
  saveCommentDraft: async (text) => saveCommentDraft(text),
  clearCommentDraft: async () => clearCommentDraft(),
  // Profile
  getDisplayName: async () => getDisplayName(),
  saveDisplayName: async (name) => saveDisplayName(name),
  getUserName: async () => getUserName(),
  saveUserName: async (name) => saveUserName(name),
  // Dev notice
  getDevNoticeAcknowledged: async () => getDevNoticeAcknowledged(),
  saveDevNoticeAcknowledged: async () => saveDevNoticeAcknowledged(),
};
