import { applyVoteToggle } from "./index";
import { localStorageAdapter as adapter } from "./storage/localStorageAdapter";

// ============================================================================
// dataLayer.js — طبقة تجريد البيانات (Data Access Layer)
// ============================================================================
// الهدف: عزل "شكل التخزين الحالي" (localStorage + بيانات متداخلة) عن
// "منطق العرض" في الـ components والـ hooks الأخرى، تحضيرًا لترحيل مستقبلي
// إلى Supabase (Postgres + Auth + RLS + Realtime).
//
// القاعدة الذهبية لهذا الملف: أي دالة هنا يمكن أن يتغيّر جسمها الداخلي بالكامل
// لاحقًا (من قراءة/كتابة localStorage إلى استدعاء Supabase)، لكن توقيعها
// (اسم الدالة، عدد الوسائط، شكل القيمة المُعادة) يجب ألا يتغيّر أبدًا —
// لأن هذا هو العقد (contract) الذي تعتمد عليه كل الـ components والـ hooks.
// ============================================================================

// ----------------------------------------------------------------------------
// 1. التصويتات والتفاعلات (Reactions)
// ----------------------------------------------------------------------------

/**
 * يبدّل حالة تفاعل واحد (helpful/agree/relatable/inspiring/flag) على عنصر واحد
 * (منشور، تعليق، أو رد)، ويُعيد نسخة جديدة من ذلك العنصر بعد التحديث.
 *
 * هذه الدالة نقيّة (pure): لا تلمس localStorage ولا أي حالة خارجية — فقط
 * تستقبل العنصر الحالي وتُعيد نسخة محدَّثة منه. البحث عن العنصر الصحيح
 * داخل شجرة posts/comments/replies يبقى مسؤولية الـ hook المستدعي
 * (usePostsData.js)، تمامًا كما كان الحال مع applyVoteToggle سابقًا.
 *
 * MIGRATION_NOTE: عند الربط بـ Supabase، هذه الدالة بأكملها تُستبدل بجدول
 * `reactions` منفصل (post_id/comment_id/reply_id, device_hash, reaction_type)
 * مع استدعاء supabase.from('reactions').upsert(...) بدل التعديل المباشر
 * على كائن votes المُضمَّن. نقطة الاستدعاء في usePostsData.js (دالة
 * updateVotes) لا تحتاج تعديلاً — فقط جسم toggleReaction الداخلي هنا.
 *
 * ملاحظة تنفيذية: هذه الدالة تُفوّض (delegate) المنطق الفعلي إلى
 * applyVoteToggle الأصلية في utils/index.js — لتفادي تكرار نفس الخوارزمية
 * في مكانين، ولأن applyVoteToggle مُختبرة فعليًا ضمن utils/index.test.js.
 * toggleReaction هنا هي "الاسم الدلالي" الذي تستدعيه بقية الطبقات
 * (usePostsData.js) تحضيرًا للترحيل، بينما التنفيذ الفعلي يبقى موحّدًا
 * في دالة واحدة مُختبرة.
 *
 * @param {object} entity - العنصر الحالي (post/comment/reply) الذي يحتوي votes
 * @param {string} reactionKey - نوع التفاعل: helpful | agree | relatable | inspiring | flag
 * @param {string} deviceHash - معرّف الجهاز الحالي
 * @returns {object} نسخة جديدة من entity بعد تحديث votes
 */
export const toggleReaction = (entity, reactionKey, deviceHash) =>
  applyVoteToggle(entity, reactionKey, deviceHash);

/**
 * يُرجع عدد البلاغات (flags) الحالية على عنصر ما، بدل الوصول المباشر
 * لـ entity.votes.flaggedBy.length من داخل الـ components.
 *
 * MIGRATION_NOTE: عند الربط بجدول reports منفصل (انظر reportEntity أدناه)،
 * هذه الدالة تُستبدل باستعلام count(*) من جدول reports بدل القراءة من
 * votes.flaggedBy المُضمَّن. نقاط الاستدعاء في الـ components لا تتغيّر.
 *
 * @param {object} votes - كائن votes الخاص بالعنصر (post/comment/reply)
 * @returns {number} عدد البلاغات
 */
export const getFlagCount = (votes) => (votes?.flaggedBy || []).length;

/**
 * يتحقق هل جهاز معيّن قام بالإبلاغ عن عنصر ما، أو التصويت بتفاعل معيّن عليه.
 * بديل موحّد عن votes?.[byKey]?.includes(deviceHash) المتكرر في عدة أماكن.
 *
 * @param {object} votes - كائن votes الخاص بالعنصر
 * @param {string} reactionKey - نوع التفاعل (helpful/agree/relatable/inspiring/flag)
 * @param {string} deviceHash - معرّف الجهاز
 * @returns {boolean}
 */
export const hasDeviceReacted = (votes, reactionKey, deviceHash) => {
  const byKey = reactionKey === "flag" ? "flaggedBy" : `${reactionKey}By`;
  return (votes?.[byKey] || []).includes(deviceHash);
};

/**
 * يتحقق هل عنصر تجاوز حد الإخفاء التلقائي بسبب البلاغات (FLAG_HIDE_LIMIT).
 * بديل موحّد عن (entity.votes?.flaggedBy || []).length < FLAG_HIDE_LIMIT
 * المتكرر حاليًا في CommentItem.jsx وThreadView.jsx.
 *
 * @param {object} votes - كائن votes الخاص بالعنصر
 * @param {number} hideLimit - عتبة الإخفاء (FLAG_HIDE_LIMIT من constants)
 * @returns {boolean} true إذا كان العنصر لا يزال ظاهرًا (لم يتجاوز الحد)
 */
export const isEntityVisible = (votes, hideLimit) => getFlagCount(votes) < hideLimit;

// ----------------------------------------------------------------------------
// 2. الإبلاغات (Reports) — منفصلة عمدًا عن التصويتات العادية
// ----------------------------------------------------------------------------
// السبب: الإبلاغ (flag/report) له دلالة مختلفة جوهريًا عن باقي التفاعلات
// (helpful/agree/relatable/inspiring) — فهو يؤدي لعقوبات (إخفاء، حظر)
// وليس مجرد مؤشر تفاعل اجتماعي. لذلك رغم أنه يُخزَّن حاليًا بنفس بنية
// votes.flaggedBy لأسباب تاريخية، يجب عدم دمج منطقه مع toggleReaction
// في أي تطوير مستقبلي.

/**
 * يسجّل بلاغًا على عنصر (منشور/تعليق/رد) من جهاز معيّن.
 *
 * MIGRATION_NOTE: عند الربط بـ Supabase، هذه الدالة تُستبدل بإدراج صف جديد
 * في جدول `reports` مستقل تمامًا عن جدول `reactions`:
 *
 *   create table reports (
 *     id uuid primary key default gen_random_uuid(),
 *     entity_type text not null check (entity_type in ('post','comment','reply')),
 *     entity_id uuid not null,
 *     reporter_hash text not null,
 *     reason text,
 *     created_at timestamptz default now(),
 *     unique(entity_type, entity_id, reporter_hash)
 *   );
 *
 * مع Edge Function أو trigger يحسب count(*) تلقائيًا ويُحدّث حالة hidden/banned
 * مركزيًا للجميع — بدل الاعتماد على flaggedBy.length محسوب محليًا في كل جهاز
 * كما هو الحال الآن. حاليًا (قبل الربط)، تعتمد هذه الدالة داخليًا على نفس
 * آلية toggleReaction لأن التخزين المحلي لا يدعم جدولاً منفصلاً بعد.
 *
 * @param {object} entity - العنصر المُبلَّغ عنه
 * @param {string} deviceHash - معرّف الجهاز المُبلِّغ
 * @returns {object} نسخة جديدة من entity بعد تسجيل البلاغ
 */
export const reportEntity = (entity, deviceHash) => toggleReaction(entity, "flag", deviceHash);

// ----------------------------------------------------------------------------
// 3. تسطيح الوصول للبيانات المتداخلة (Flattening Access Layer)
// ----------------------------------------------------------------------------
// السبب: البيانات الآن مُخزَّنة كمستندات متداخلة (post.comments[i].replies[j]).
// في Postgres، ستكون هذه ثلاثة جداول مسطّحة منفصلة (posts/comments/replies)
// تُربط عبر post_id وcomment_id. الدوال التالية تُحاكي الآن "شكل القراءة"
// الذي ستوفره لاحقًا استعلامات Supabase، حتى لو كان تنفيذها الداخلي حاليًا
// لا يزال يقرأ من البنية المتداخلة القديمة.

/**
 * يبحث عن منشور بمعرّفه ضمن قائمة المنشورات.
 *
 * MIGRATION_NOTE: عند الربط، تُستبدل بـ
 * supabase.from('posts').select('*').eq('id', postId).single()
 *
 * @param {Array} posts - قائمة كل المنشورات
 * @param {string} postId - معرّف المنشور المطلوب
 * @returns {object|undefined}
 */
export const getPostById = (posts, postId) => posts.find((p) => p.id === postId);

/**
 * يُرجع كل تعليقات منشور معيّن.
 *
 * MIGRATION_NOTE: عند الربط، تُستبدل بـ
 * supabase.from('comments').select('*').eq('post_id', postId)
 * بدل قراءة post.comments المُضمَّنة مباشرة.
 *
 * @param {Array} posts - قائمة كل المنشورات
 * @param {string} postId - معرّف المنشور
 * @returns {Array} قائمة التعليقات (مصفوفة فارغة إن لم يوجد المنشور)
 */
export const getCommentsForPost = (posts, postId) => {
  const post = getPostById(posts, postId);
  return post?.comments || [];
};

/**
 * يُرجع كل ردود تعليق معيّن ضمن منشور معيّن.
 *
 * MIGRATION_NOTE: عند الربط، تُستبدل بـ
 * supabase.from('replies').select('*').eq('comment_id', commentId)
 * بدل قراءة comment.replies المُضمَّنة مباشرة.
 *
 * @param {Array} posts - قائمة كل المنشورات
 * @param {string} postId - معرّف المنشور
 * @param {string} commentId - معرّف التعليق
 * @returns {Array} قائمة الردود (مصفوفة فارغة إن لم يوجد التعليق)
 */
export const getRepliesForComment = (posts, postId, commentId) => {
  const comments = getCommentsForPost(posts, postId);
  const comment = comments.find((c) => c.id === commentId);
  return comment?.replies || [];
};

// ----------------------------------------------------------------------------
// 4. المنشورات (Posts) — CRUD الأساسي
// ----------------------------------------------------------------------------
// السبب في إضافة هذا القسم: كان استدعاء db.getPosts/db.savePosts يتم مباشرة
// من usePostsData.js دون المرور بـ dataLayer.js. الآن كل قراءة/كتابة تمر من
// هنا، بحيث توسيع العقد يحصل في مكان واحد فقط.

/**
 * يُرجع كل المنشورات المخزَّنة حاليًا.
 *
 * MIGRATION_NOTE: عند الربط، تُستبدل بـ
 * supabase.from('posts').select('*, comments(*, replies(*))')
 * (أو استعلامات منفصلة مسطّحة حسب تصميم الشاشة). التوقيع (لا معاملات،
 * يُعيد مصفوفة) يبقى كما هو من منظور المستدعي.
 *
 * @returns {Promise<Array>} قائمة كل المنشورات
 */
export const loadAllPosts = async () => await adapter.getPosts();

/**
 * نسخة متزامنة (sync) من loadAllPosts، للاستخدام حصريًا في تهيئة الحالة
 * الأولية على العميل (useState(() => ...)) لتفادي وميض/فراغ لحظي عند أول
 * render — وليست جزءًا من العقد الرسمي لطبقة البيانات. localStorage نفسه
 * متزامن، فهذا لا يضيف أي عملية I/O جديدة، فقط يتفادى لفة async غير لازمة.
 *
 * MIGRATION_NOTE: عند الربط بـ Supabase، هذه الدالة تصبح غير قابلة للتنفيذ
 * (لا يوجد قراءة شبكة متزامنة) ويجب حذفها والاعتماد فقط على loadAllPosts
 * + حالة تحميل حقيقية (skeleton/loading state) بدل التهيئة الفورية.
 */
export const loadAllPostsSync = () => adapter.getPostsSync();

/**
 * يحفظ القائمة الكاملة للمنشورات.
 *
 * MIGRATION_NOTE: عند الربط، تُستبدل هذه بعمليات upsert فردية لكل منشور
 * تغيّر فعليًا (بدل إعادة كتابة القائمة كاملة كما يحدث الآن محليًا) —
 * نقطة الاستدعاء في usePostsData.js لا تحتاج تعديلاً جوهريًا لأن معظم
 * التغييرات هناك أصلاً محسوبة كمنشور واحد أو منشورات معدودة.
 *
 * @param {Array} posts - القائمة الكاملة للمنشورات بعد التعديل
 * @returns {Promise<void>}
 */
export const saveAllPosts = async (posts) => await adapter.savePosts(posts);

// ----------------------------------------------------------------------------
// 5. الأمان (Security) — device hash, ملكية المحتوى, الحظر, تحديد المعدل
// ----------------------------------------------------------------------------
// MIGRATION_NOTE عام لهذا القسم بأكمله: عند الربط بـ Supabase، معظم هذا
// المنطق (ownedPosts/ownedComments/ownedReplies المحلي القائم على device_hash)
// يُستبدل جوهريًا بـ Supabase Auth (جلسة مستخدم حقيقية) + RLS policies على
// مستوى الصف، بدل تتبّع "ملكية" عبر بصمة جهاز محلية. النقاط التالية توفّر
// نفس الشكل الوظيفي مؤقتًا حتى يحين ذلك الانتقال الأعمق.

export const getDeviceHash = async () => await adapter.getDeviceHash();
export const saveDeviceHash = async (hash) => await adapter.saveDeviceHash(hash);

export const getOwnedPosts = async () => await adapter.getOwnedPosts();
export const saveOwnedPosts = async (v) => await adapter.saveOwnedPosts(v);

export const getOwnedComments = async () => await adapter.getOwnedComments();
export const saveOwnedComments = async (v) => await adapter.saveOwnedComments(v);

export const getOwnedReplies = async () => await adapter.getOwnedReplies();
export const saveOwnedReplies = async (v) => await adapter.saveOwnedReplies(v);

export const getBannedDevices = async () => await adapter.getBannedDevices();
export const saveBannedDevices = async (v) => await adapter.saveBannedDevices(v);

export const getRateLimitTimes = async (action) => await adapter.getRateLimitTimes(action);
export const saveRateLimitTimes = async (action, times) => await adapter.saveRateLimitTimes(action, times);

/**
 * يتحقق من سلامة الحالة الأمنية المحلية (لم يُتلاعب بها يدويًا).
 *
 * MIGRATION_NOTE: مع Supabase + RLS، هذا التحقق يصبح غير ضروري من جهة
 * العميل (الخادم هو من يفرض الصلاحيات)، لذلك في supabaseAdapter هذه الدالة
 * تُعيد true دائمًا بدل أي فحص فعلي.
 *
 * @returns {Promise<boolean>}
 */
export const verifySecurityIntegrity = async () => await adapter.verifyGlobalIntegrity();

// ----------------------------------------------------------------------------
// 6. التفضيلات (Preferences) — اللغة والثيم
// ----------------------------------------------------------------------------

/**
 * MIGRATION_NOTE: عند الربط، تُستبدل بقراءة من جدول user_preferences
 * (مرتبط بالمستخدم عبر Auth) بدل تخزين محلي عام لكل الأجهزة.
 */
export const getLangPreference = async () => await adapter.getLang();
export const saveLangPreference = async (lang) => await adapter.saveLang(lang);

export const getThemePreference = async () => await adapter.getThemePref();
export const saveThemePreference = async (theme) => await adapter.saveThemePref(theme);

// ----------------------------------------------------------------------------
// 7. المنشورات المحفوظة (Saved Posts)
// ----------------------------------------------------------------------------

/**
 * MIGRATION_NOTE: عند الربط، تُستبدل بجدول saved_posts (user_id, post_id)
 * مرتبط بالمستخدم الحقيقي بدل جهاز محلي — يسمح هذا لاحقًا بمزامنة المحفوظات
 * عبر أجهزة متعددة لنفس المستخدم، وهو تحسين وظيفي حقيقي غير متاح حاليًا.
 *
 * @returns {Promise<object>} خريطة { [postId]: true }
 */
export const getSavedPostsMap = async () => await adapter.getSavedPosts();
export const saveSavedPostsMap = async (v) => await adapter.saveSavedPosts(v);

// ----------------------------------------------------------------------------
// 8. المسودات (Drafts) — منشور جديد وتعليق قيد الكتابة
// ----------------------------------------------------------------------------
// MIGRATION_NOTE عام: المسودات مرشّحة قوية للبقاء محلية (localStorage) حتى
// بعد الربط بـ Supabase — لا حاجة فعلية لحفظ مسودة غير منشورة على الخادم.
// لذلك دوال هذا القسم قد تبقى تستدعي localStorageAdapter مباشرة حتى في
// النسخة النهائية المرتبطة بـ Supabase، وهذا اختيار معماري مقصود وليس نقصًا.

export const getPostDraft = async () => await adapter.getPostDraft();
export const savePostDraft = async (draft) => await adapter.savePostDraft(draft);
export const clearPostDraft = async () => await adapter.clearPostDraft();

export const getCommentDraft = async () => await adapter.getCommentDraft();
export const saveCommentDraft = async (text) => await adapter.saveCommentDraft(text);
export const clearCommentDraft = async () => await adapter.clearCommentDraft();

// ----------------------------------------------------------------------------
// 9. الملف الشخصي (Profile) — اسم العرض واسم المستخدم
// ----------------------------------------------------------------------------
// منقولة من ProfilePage.jsx (كانت تستدعي localStorage مباشرة من component).
//
// MIGRATION_NOTE: عند الربط، تُستبدل بحقول في جدول profiles (مرتبط بالمستخدم
// عبر Auth) بدل تخزين محلي عام لكل الأجهزة — يسمح هذا بمزامنة الملف الشخصي
// عبر أجهزة متعددة لنفس المستخدم.

export const getDisplayName = async () => await adapter.getDisplayName();
export const saveDisplayName = async (name) => await adapter.saveDisplayName(name);

export const getUserName = async () => await adapter.getUserName();
export const saveUserName = async (name) => await adapter.saveUserName(name);

// ----------------------------------------------------------------------------
// 10. إشعار المطوّر (Dev Notice) — إقرار المستخدم برسالة تنبيه لمرة واحدة
// ----------------------------------------------------------------------------
// منقولة من DevNoticeModal.jsx (كانت تستدعي localStorage مباشرة من component).
// MIGRATION_NOTE: مرشّح للبقاء محليًا حتى بعد الربط بـ Supabase — مجرد إشعار
// UI محلي لا يحتاج مزامنة عبر أجهزة.

export const getDevNoticeAcknowledged = async () => await adapter.getDevNoticeAcknowledged();
export const saveDevNoticeAcknowledged = async () => await adapter.saveDevNoticeAcknowledged();
