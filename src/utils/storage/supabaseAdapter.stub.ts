// ============================================================================
// supabaseAdapter.stub.js — هيكل جاهز للتفعيل المستقبلي (غير مُفعّل الآن)
// ============================================================================
// هذا الملف ليس مستخدمًا حاليًا في أي مكان بالتطبيق. هو "عقد مطابق" لنفس
// الواجهة الموجودة في localStorageAdapter.js، بحيث عندما يحين وقت الربط
// الفعلي بـ Supabase، يكون التبديل في dataLayer.js سطرًا واحدًا:
//
//   import { localStorageAdapter as adapter } from "./storage/localStorageAdapter";
//   →
//   import { supabaseAdapter as adapter } from "./storage/supabaseAdapter.js";
//
// بدون الحاجة لتعديل أي hook أو component يستخدم dataLayer.js.
//
// ملاحظات تصميم مهمّة عند التفعيل الفعلي لاحقًا:
//
// 1. جدول reactions منفصل (بدل votes المُضمَّن):
//    create table reactions (
//      id uuid primary key default gen_random_uuid(),
//      entity_type text check (entity_type in ('post','comment','reply')),
//      entity_id uuid not null,
//      device_hash text not null,
//      reaction_type text check (reaction_type in ('helpful','agree','relatable','inspiring')),
//      created_at timestamptz default now(),
//      unique(entity_type, entity_id, device_hash, reaction_type)
//    );
//
// 2. جدول reports منفصل تمامًا عن reactions (انظر dataLayer.js لسبب الفصل):
//    create table reports (
//      id uuid primary key default gen_random_uuid(),
//      entity_type text not null,
//      entity_id uuid not null,
//      reporter_hash text not null,
//      created_at timestamptz default now(),
//      unique(entity_type, entity_id, reporter_hash)
//    );
//
// 3. جداول posts/comments/replies مسطّحة (بدل المستندات المتداخلة الحالية)
//    مرتبطة عبر post_id / comment_id (foreign keys)، مع RLS policies تحل
//    محل منطق device_hash/ownership المحلي الحالي بالكامل.
//
// 4. الحظر (banned devices) ينتقل لجدول banned_devices مركزي بدل تخزين محلي
//    لكل جهاز — هذا يحل مشكلة جوهرية في التصميم الحالي: الحظر المحلي حاليًا
//    يمكن الالتفاف عليه بمسح localStorage، بينما حظر مركزي في Supabase
//    (مربوط بـ IP أو فingerprint خادمي) يكون أصعب على الالتفاف حوله.
//
// 5. secureSave/secureLoad (التشويه والتوقيع الرقمي) لا تُنقل هنا إطلاقًا —
//    هذا المنطق خاص بحماية localStorage من التلاعب المحلي، ولا معنى له في
//    سياق قاعدة بيانات محمية عبر RLS/Auth على السيرفر. أي استبدال مستقبلي
//    يجب أن يعتمد فقط على صلاحيات Supabase (Row Level Security) بدل أي
//    تشويه/توقيع من جهة العميل.
// ============================================================================

const NOT_IMPLEMENTED = (fnName) => {
  throw new Error(
    `[supabaseAdapter] "${fnName}" غير مُفعّلة بعد. هذا الملف هيكل مستقبلي فقط — ` +
    `التطبيق الحالي يستخدم localStorageAdapter.js. لتفعيل Supabase، ابدأ بتنفيذ ` +
    `هذه الدالة باستخدام supabase-js (انظر التعليقات أعلى الملف لتصميم الجداول المقترح).`
  );
};

export const supabaseAdapter = {
  // Posts
  getPosts: async () => NOT_IMPLEMENTED("getPosts"),
  savePosts: async () => NOT_IMPLEMENTED("savePosts"),
  // Security
  getOwnedPosts: async () => NOT_IMPLEMENTED("getOwnedPosts"),
  saveOwnedPosts: async () => NOT_IMPLEMENTED("saveOwnedPosts"),
  getOwnedComments: async () => NOT_IMPLEMENTED("getOwnedComments"),
  saveOwnedComments: async () => NOT_IMPLEMENTED("saveOwnedComments"),
  getOwnedReplies: async () => NOT_IMPLEMENTED("getOwnedReplies"),
  saveOwnedReplies: async () => NOT_IMPLEMENTED("saveOwnedReplies"),
  getDeviceHash: async () => NOT_IMPLEMENTED("getDeviceHash"),
  saveDeviceHash: async () => NOT_IMPLEMENTED("saveDeviceHash"),
  getBannedDevices: async () => NOT_IMPLEMENTED("getBannedDevices"),
  saveBannedDevices: async () => NOT_IMPLEMENTED("saveBannedDevices"),
  getRateLimitTimes: async () => NOT_IMPLEMENTED("getRateLimitTimes"),
  saveRateLimitTimes: async () => NOT_IMPLEMENTED("saveRateLimitTimes"),
  verifyGlobalIntegrity: async () => true, // يُستبدل بصلاحيات RLS، دائمًا "سليم" من جهة العميل
  handleTamperingDetected: async () => {},  // لا معنى له مع RLS خادمي
  // Preferences
  getLang: async () => NOT_IMPLEMENTED("getLang"),
  saveLang: async () => NOT_IMPLEMENTED("saveLang"),
  getThemePref: async () => NOT_IMPLEMENTED("getThemePref"),
  saveThemePref: async () => NOT_IMPLEMENTED("saveThemePref"),
  // Saved posts
  getSavedPosts: async () => NOT_IMPLEMENTED("getSavedPosts"),
  saveSavedPosts: async () => NOT_IMPLEMENTED("saveSavedPosts"),
  // Drafts
  getPostDraft: async () => NOT_IMPLEMENTED("getPostDraft"),
  savePostDraft: async () => NOT_IMPLEMENTED("savePostDraft"),
  clearPostDraft: async () => NOT_IMPLEMENTED("clearPostDraft"),
  getCommentDraft: async () => NOT_IMPLEMENTED("getCommentDraft"),
  saveCommentDraft: async () => NOT_IMPLEMENTED("saveCommentDraft"),
  clearCommentDraft: async () => NOT_IMPLEMENTED("clearCommentDraft"),
  // Profile — على الأرجح تنتقل لجدول profiles مرتبط بـ Auth
  getDisplayName: async () => NOT_IMPLEMENTED("getDisplayName"),
  saveDisplayName: async () => NOT_IMPLEMENTED("saveDisplayName"),
  getUserName: async () => NOT_IMPLEMENTED("getUserName"),
  saveUserName: async () => NOT_IMPLEMENTED("saveUserName"),
  // Dev notice — مرشّح للبقاء محليًا حتى بعد الربط (انظر dataLayer.js)
  getDevNoticeAcknowledged: async () => NOT_IMPLEMENTED("getDevNoticeAcknowledged"),
  saveDevNoticeAcknowledged: async () => NOT_IMPLEMENTED("saveDevNoticeAcknowledged"),
};
