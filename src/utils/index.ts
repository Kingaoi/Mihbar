import Prism from "prismjs";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-python.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-tsx.js";

import { RATE_LIMITS } from "../constants/index";
import { localStorageAdapter as adapter } from "./storage/localStorageAdapter";

// ============================================================================
// ملاحظة معمارية: كل منطق التخزين الخام (secureSave/secureLoad/db/safeSave)
// انتقل بالكامل إلى src/utils/storage/localStorageAdapter.js — هذا الملف لم
// يعد يلمس localStorage مباشرة على الإطلاق. ما تبقى هنا هو منطق "أعمال"
// (business logic) يُبنى فوق الـ adapter: قرارات الحظر، تحديد المعدل، وكشف
// السبام — وهذه ليست عمليات تخزين خام، لذلك تبقى في هذا الملف.
// ============================================================================

export const emptyVotes = () => ({
  helpful: 0, helpfulBy: [],
  agree: 0, agreeBy: [],
  relatable: 0, relatableBy: [],
  inspiring: 0, inspiringBy: [],
  flag: 0, flaggedBy: [],
});

export const sumVotes = (v, poll = null) => {
  let total = (v?.helpful || 0) + (v?.agree || 0) + (v?.relatable || 0) + (v?.inspiring || 0);
  if (poll && poll.options) {
    const pollTotal = poll.options.reduce((acc, curr) => acc + (curr.votes || 0), 0);
    total += pollTotal;
  }
  return total;
};

// توليد معرّف فريد لعنصر جديد (منشور/تعليق/رد). Date.now() وحده غير كافٍ:
// نقرة مزدوجة سريعة أو إنشاء عنصرين ضمن نفس المللي ثانية يعطيان نفس القيمة
// ويسبب تصادم معرّفات (نفس المفتاح في map/object يستبدل العنصر السابق).
// إضافة جزء عشوائي قصير يحل المشكلة عمليًا دون حاجة لمكتبة uuid كاملة.
export const generateUniqueId = (prefix: string) => {
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
};

export const generateDeviceHash = () => {
  try {
    const raw = [
      navigator.userAgent,
      `${window.innerWidth}x${window.innerHeight}`,
      new Date().getTimezoneOffset()
    ].join("|");
    return window.btoa(unescape(encodeURIComponent(raw))).substring(0, 12).toLowerCase();
  } catch {
    return Math.random().toString(36).substring(2, 14);
  }
};

// db هنا هو الآن مجرد إعادة تصدير رقيقة (thin re-export) لواجهة
// localStorageAdapter، للحفاظ على التوافق مع أي كود قديم قد يستورد db
// بالاسم نفسه. الاستخدام الجديد المفضّل هو dataLayer.js مباشرة.
export const db = adapter;

// ملاحظة async: الدوال الثلاث أدناه (checkIfBanned/banDevice/canPerformAction)
// تستدعي adapter عبر await الآن، توافقًا مع تحويل localStorageAdapter/
// dataLayer.js بالكامل لـ async (انظر التعليق أعلى adapter import). هذه
// الدوال تبقى في utils/index.js وليس dataLayer.js لأنها منطق أعمال
// (business logic: قرارات حظر، تحديد معدل) وليست عمليات تخزين خام.

export const checkIfBanned = async () => {
  // التحقق من السلامة البنيوية الشاملة للبيانات قبل اتخاذ قرار الحظر
  if (!(await adapter.verifyGlobalIntegrity())) {
    await adapter.handleTamperingDetected();
  }

  const banned = await db.getBannedDevices();
  const hash = await db.getDeviceHash();
  if (!hash || !banned[hash]) return null;
  if (Date.now() > banned[hash]) {
    delete banned[hash];
    await db.saveBannedDevices(banned);
    return null;
  }
  return banned[hash];
};

export const banDevice = async (hash, hours = 24) => {
  const banned = await db.getBannedDevices();
  banned[hash] = Date.now() + hours * 3600000;
  await db.saveBannedDevices(banned);
};

// قفل بسيط بالتسلسل عبر الوعود (promise chaining) لكل مفتاح action على
// حدة — بدون هذا، استدعاءان متزامنان غير متسلسلين لـ canPerformAction
// بنفس الـ action (مثل نقر مزدوج سريع على زر الإرسال قبل أن يعطّله أي
// منطق واجهة) قد يقرآن نفس اللقطة القديمة من البيانات معًا ويتجاوزان حد
// المعدل كلاهما — تأكدنا تجريبيًا: بدون القفل، 10 استدعاءات متزامنة بحد
// أقصى 3 كانت كلها allowed=true؛ بعد القفل، 3 فقط. لا حاجة لأي حذف/تنظيف
// من actionLocks لاحقًا: لا يمكن أن يحوي إلا مفاتيح RATE_LIMITS الثابتة
// والقليلة (post/comment/reply/flag)، فلا خطر نمو غير محدود.
const actionLocks = new Map();

async function withActionLock(key, fn) {
  const previous = actionLocks.get(key) || Promise.resolve();
  // fn كمعالِج نجاح ورفض معًا: تضمن استمرار الطابور للمستدعين اللاحقين
  // حتى لو فشل استدعاء سابق على نفس المفتاح (الخطأ نفسه يبقى يصل للمستدعي
  // الذي تسبب به عبر myTurn، لكنه لا "يسمم" السلسلة لبقية المنتظرين).
  const myTurn = previous.then(fn, fn);
  actionLocks.set(key, myTurn);
  return myTurn;
}

export const canPerformAction = async (action) => {
  return withActionLock(action, async () => {
    const times = await db.getRateLimitTimes(action);
    const now = Date.now(), limit = RATE_LIMITS[action];
    const recent = times.filter((t) => now - t < limit.window);
    if (recent.length >= limit.max) {
      return {
        allowed: false,
        waitSeconds: Math.ceil((limit.window - (now - recent[0])) / 1000)
      };
    }
    recent.push(now);
    await db.saveRateLimitTimes(action, recent);
    return { allowed: true };
  });
};

export const FREE_REPEAT_CHARS = /[هاويأإآءٱ!؟?.,\s]/;

export const isSpamQuality = (text) => {
  if (!text || text.trim().length === 0) return true;
  const repeatMatch = text.match(/(.)\1{9,}/);
  if (repeatMatch && !FREE_REPEAT_CHARS.test(repeatMatch[1])) return true;
  const words = text.trim().split(/\s+/);
  if (new Set(words).size === 1 && words.length > 5) return true;
  const freq: Record<string, number> = {};
  for (const c of text) freq[c] = (freq[c] || 0) + 1;
  const dominantEntries = Object.entries(freq).filter(
    ([c]) => !FREE_REPEAT_CHARS.test(c)
  );
  const dominantMax = dominantEntries.length
    ? Math.max(...dominantEntries.map(([, n]) => n))
    : 0;
  if (text.length > 0 && dominantMax / text.length > 0.7) return true;
  return false;
};

export const applyVoteToggle = (item, reactionKey, hash) => {
  const byKey = reactionKey === "flag" ? "flaggedBy" : `${reactionKey}By`;
  const byList = item.votes?.[byKey] || [];
  const voted = byList.includes(hash);
  return {
    ...item,
    votes: {
      ...item.votes,
      [reactionKey]: voted
        ? Math.max(0, (item.votes?.[reactionKey] || 0) - 1)
        : (item.votes?.[reactionKey] || 0) + 1,
      [byKey]: voted ? byList.filter((h) => h !== hash) : [...byList, hash],
    },
  };
};

export const timeAgo = (ts, s) => {
  const d = Math.floor((Date.now() - ts) / 1000),
    m = Math.floor(d / 60),
    h = Math.floor(m / 60),
    dy = Math.floor(h / 24);
  return s.ago(m, h, dy);
};

export const glow = (v) => {
  const i = Math.min(sumVotes(v) / 20, 1);
  return `0 0 ${8 + i * 16}px rgba(217,119,87,${0.1 + i * 0.3})`;
};

export const readMdFile = (file, cb, onError) => {
  const MAX_SIZE = 21 * 1024; // 21KB limit
  if (file.size > MAX_SIZE) {
    if (onError) onError("too_large");
    return;
  }
  const r = new FileReader();
  r.onload = (e) => {
    const text = e.target.result;
    if (isSpamQuality(text)) {
      if (onError) onError("spam");
      return;
    }
    cb({ name: file.name, content: text });
  };
  r.readAsText(file);
};

export const escapeHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// نطاق الأرقام: نقبل ASCII (٠-٩ اللاتينية) بالإضافة إلى الأرقام العربية-الهندية
// (٠-٩) والأرقام العربية-الهندية الممتدة (۰-۹، فارسي/أردو) — بدون هذا، كتابة
// قائمة مرقّمة بأرقام عربية (شائع جدًا على لوحات المفاتيح العربية على
// الموبايل) لا تُكتشف كقائمة إطلاقًا وتُعرَض كفقرة عادية بلا ترقيم.
const DIGIT_CLASS = "0-9\u0660-\u0669\u06F0-\u06F9";

// تحويل أي رقم عربي (من النطاقين أعلاه) إلى ASCII لاستخدامه في start="n" —
// خاصية start في <ol> تتطلب رقمًا صالحًا بصيغة ASCII في HTML بغض النظر عن
// الأرقام التي كتبها المستخدم فعليًا.
const toAsciiDigits = (s: string) =>
  s.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
   .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));

export const renderInlineMd = (line) => {
  let t = escapeHtml(line);
  t = t.replace(
    /`([^`]+)`/g,
    (_, c) =>
      `<code style="background:var(--md-code-bg);padding:1px 5px;border-radius:4px;font-size:0.9em;">${c}</code>`
  );
  // مجموعة التقاط الرابط تسمح بمستوى واحد من أقواس متوازنة () داخل الرابط
  // نفسه (مثل روابط ويكيبيديا: .../wiki/Bracket_(disambiguation)) — بدون
  // هذا، أول ")" داخل الرابط يُنهي المطابقة قبل الأوان ويترك ")" زائدة
  // ظاهرة في النص المعروض عند رفض الرابط (مثلاً بروتوكول javascript:).
  const urlBody = `(?:[^()\\s]|\\([^()\\s]*\\))+`;
  t = t.replace(new RegExp(`!\\[([^\\]]*)\\]\\((${urlBody})(?:\\s+"([^"]*)")?\\)`, "g"), (_, alt, url) =>
    /^https?:\/\//.test(url)
      ? `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:6px 0;"/>`
      : ""
  );
  t = t.replace(new RegExp(`\\[([^\\]]+)\\]\\((${urlBody})(?:\\s+"([^"]*)")?\\)`, "g"), (_, label, url) =>
    /^https?:\/\//.test(url)
      ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:var(--md-link);text-decoration:underline;">${label}</a>`
      : label
  );
  t = t.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  t = t.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  // قاعدة "intraword emphasis" من CommonMark: شرطة سفلية _ داخل كلمة متصلة
  // (حرف/رقم من أي لغة على الجانبين مباشرة، بلا مسافة) لا تُفعّل مائل —
  // وإلا فإن my_variable_name أو شاهد_هذا_الفيديو يتحوّلان جزئيًا لمائل
  // بالخطأ. \p{L}/\p{N} مع علم u تجعل هذا يعمل بشكل موحّد لأي لغة/سكربت،
  // وليس فقط \w اللاتيني الذي لا يغطي الحروف العربية أصلاً.
  t = t.replace(/(?<![_\p{L}\p{N}])_([^_\n]+)_(?![_\p{L}\p{N}])/gu, "<em>$1</em>");
  t = t.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  return t;
};

// ============================================================================
// دعم جداول GFM (GitHub-Flavored Markdown)
// ============================================================================

// صف الجدول: يُقسَّم على | غير المُهرَّبة (\| يبقى حرف pipe حرفيًا داخل خلية)،
// مع تجاهل | الأولى/الأخيرة إن وُجدتا في بداية/نهاية السطر (الصيغة الشائعة
// | a | b | بدلاً من a | b بدون حدود خارجية).
const splitTableRow = (line: string): string[] => {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  const cells: string[] = [];
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && s[i + 1] === "|") {
      cur += "|";
      i++;
    } else if (s[i] === "|") {
      cells.push(cur);
      cur = "";
    } else {
      cur += s[i];
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
};

// صف الفاصل (---|:--|--:|:-:) هو ما يُثبت فعليًا أن السطر السابق كان رأس
// جدول وليس مجرد فقرة عادية تحتوي على "|" بالصدفة — بدون هذا التحقق
// بسطرين معًا (رأس + فاصل)، أي جملة فيها "|" ستتحول جدولاً بالخطأ.
const isSeparatorRow = (line: string): boolean => {
  const trimmed = line.trim();
  if (!/\|/.test(trimmed)) return false;
  const cells = splitTableRow(trimmed);
  return cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));
};

const getAlignment = (sepCell: string): string | null => {
  const s = sepCell.trim();
  const left = s.startsWith(":"),
    right = s.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  if (left) return "left";
  return null;
};

const renderTable = (headerLine: string, sepLine: string, bodyLines: string[]): string => {
  const headers = splitTableRow(headerLine);
  const aligns = splitTableRow(sepLine).map(getAlignment);
  const rows = bodyLines.map((l) => splitTableRow(l));
  // dir="auto" على كل خلية على حدة (وليس على الجدول كوحدة واحدة) لأن كل
  // خلية قد تكون بلغة مختلفة عن جارتها (رأس عربي، بيانات إنجليزية، مثلاً).
  let html = `<div style="overflow-x:auto;margin:8px 0;"><table dir="auto" style="border-collapse:collapse;width:100%;">`;
  html += `<thead><tr>`;
  headers.forEach((h, i) => {
    const align = aligns[i] ? `text-align:${aligns[i]};` : "";
    html += `<th dir="auto" style="border:1px solid var(--md-border);padding:6px 10px;${align}">${renderInlineMd(h)}</th>`;
  });
  html += `</tr></thead><tbody>`;
  rows.forEach((row) => {
    html += `<tr>`;
    headers.forEach((_, i) => {
      const align = aligns[i] ? `text-align:${aligns[i]};` : "";
      html += `<td dir="auto" style="border:1px solid var(--md-border);padding:6px 10px;${align}">${renderInlineMd(row[i] || "")}</td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody></table></div>`;
  return html;
};

export const renderMarkdown = (src) => {
  if (!src) return "";
  const lines = String(src).replace(/\r\n/g, "\n").split("\n");
  let html = "",
    inCode = false,
    codeLang = "",
    codeBuf = [],
    listType = null,
    listBuf = [],
    listStartNum = null,
    inQuote = false,
    quoteBuf = [];

  const flushList = () => {
    if (!listType) return;
    const tag = listType === "ol" ? "ol" : "ul";
    // dir="auto" على كل <li> يجعل كل عنصر قائمة يحدد اتجاهه بنفسه (عنصر
    // عربي وسط قائمة إنجليزية أو العكس) — منطقي بما أن المستخدم قد يكتب
    // عناصر بلغات مختلفة ضمن نفس القائمة.
    const startAttr = tag === "ol" && listStartNum && listStartNum !== "1" ? ` start="${listStartNum}"` : "";
    html += `<${tag} dir="auto"${startAttr} style="margin:6px 0;padding-inline-start:22px;">${listBuf.join(
      ""
    )}</${tag}>`;
    listType = null;
    listBuf = [];
    listStartNum = null;
  };

  const flushQuote = () => {
    if (!inQuote) return;
    html += `<blockquote dir="auto" style="border-inline-start:3px solid var(--md-quote);margin:8px 0;padding:2px 12px;color:var(--md-quote-text);">${quoteBuf.join(
      "<br/>"
    )}</blockquote>`;
    inQuote = false;
    quoteBuf = [];
  };

  const emitCodeBlock = () => {
    const codeText = codeBuf.join("\n");
    let highlighted = escapeHtml(codeText);
    if (codeLang && Prism.languages[codeLang]) {
      try {
        highlighted = Prism.highlight(codeText, Prism.languages[codeLang], codeLang);
      } catch {
        // fallback
      }
    }
    // لا dir="auto" هنا عمدًا: الكود دائمًا LTR بغض النظر عن لغة التعليقات
    // بداخله (كل لغات البرمجة تُكتب بنيتها الأساسية من اليسار لليمين).
    html += `<pre dir="ltr" style="background:var(--md-code-bg);border-radius:8px;padding:10px 12px;overflow-x:auto;margin:8px 0;" class="language-${codeLang}"><code class="language-${codeLang}">${highlighted}</code></pre>`;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const fence = raw.match(/^```(.*)$/);
    if (fence) {
      if (!inCode) {
        flushList();
        flushQuote();
        inCode = true;
        codeLang = (fence[1] || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "";
        codeBuf = [];
      } else {
        emitCodeBlock();
        inCode = false;
        codeLang = "";
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(raw);
      continue;
    }
    if (/^\s*$/.test(raw)) {
      flushList();
      flushQuote();
      continue;
    }
    const h = raw.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushList();
      flushQuote();
      const lvl = h[1].length,
        // تصاعديًا من h1 (الأكبر) إلى h6 (الأصغر) بلا انقطاع — كانت h5
        // أكبر من h1/h2/h3/h4 بالخطأ (نفس قيمة h1: 1.5em)، فتظهر عناوين
        // فرعية أكبر من العنوان الرئيسي فوقها.
        sizes = {
          1: "1.5em",
          2: "1.3em",
          3: "1.15em",
          4: "1.05em",
          5: "1em",
          6: "0.9em"
        };
      // dir="auto" على كل عنوان: عنوان بالإنجليزي وسط مستند عربي (أو العكس)
      // يحدد اتجاهه من محتواه الفعلي لا من لغة التطبيق.
      html += `<h${lvl} dir="auto" style="margin:14px 0 6px;font-size:${sizes[lvl]};font-weight:700;line-height:1.4;">${renderInlineMd(
        h[2]
      )}</h${lvl}>`;
      continue;
    }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(raw)) {
      flushList();
      flushQuote();
      html += `<hr style="border:none;border-top:1px solid var(--md-border);margin:12px 0;"/>`;
      continue;
    }
    const q = raw.match(/^>\s?(.*)$/);
    if (q) {
      flushList();
      inQuote = true;
      quoteBuf.push(renderInlineMd(q[1]));
      continue;
    }
    // جدول GFM: يتطلب سطر رأس + سطر فاصل (---|---|) متتاليَين معًا — التحقق
    // من السطر التالي (lookahead) هو ما يمنع أي جملة عادية فيها "|" من أن
    // تُعامَل كجدول بالخطأ (isSeparatorRow ترفض أي شيء ليس فاصل جدول حقيقي).
    if (/\|/.test(raw) && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      flushList();
      flushQuote();
      const headerLine = raw;
      const sepLine = lines[i + 1];
      let j = i + 2;
      const bodyLines: string[] = [];
      while (j < lines.length && /\|/.test(lines[j]) && !/^\s*$/.test(lines[j])) {
        bodyLines.push(lines[j]);
        j++;
      }
      html += renderTable(headerLine, sepLine, bodyLines);
      i = j - 1; // متابعة الحلقة من بعد آخر سطر جسم استُهلك
      continue;
    }
    // قائمة مهام: - [ ] / - [x] / - [X] — يجب فحصها قبل قائمة ul العادية،
    // وإلا فستُعامَل كنص عادي "[ ] النص" داخل <li> بدون مربع اختيار فعلي.
    const task = raw.match(/^\s*[-*+]\s+\[([ xX])\]\s+(.*)$/);
    if (task) {
      flushQuote();
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      const checked = task[1] !== " ";
      listBuf.push(
        `<li dir="auto" style="margin:3px 0;list-style:none;margin-inline-start:-22px;display:flex;align-items:baseline;gap:6px;"><input type="checkbox" disabled${checked ? " checked" : ""} style="margin:0;"/><span>${renderInlineMd(task[2])}</span></li>`
      );
      continue;
    }
    const ol = raw.match(new RegExp(`^\\s*([${DIGIT_CLASS}]+)[.)]\\s+(.*)$`));
    const ul = raw.match(/^\s*[-*+]\s+(.*)$/);
    if (ol || ul) {
      flushQuote();
      const kind = ol ? "ol" : "ul";
      if (listType && listType !== kind) flushList();
      // نلتقط رقم البداية الفعلي فقط عند بدء قائمة جديدة (listBuf فارغة) —
      // لو التقطناه من كل سطر لاحق لكسرنا الترقيم التلقائي الطبيعي لبقية
      // العناصر (كل عنصر سيعيد فرض رقمه الحرفي بدل الاستمرار تلقائيًا).
      if (ol && listType !== "ol") {
        listStartNum = toAsciiDigits(ol[1]);
      }
      listType = kind;
      const itemText = ol ? ol[2] : ul[1];
      listBuf.push(`<li dir="auto" style="margin:3px 0;">${renderInlineMd(itemText)}</li>`);
      continue;
    }
    flushList();
    flushQuote();
    html += `<p dir="auto" style="margin:6px 0;line-height:1.75;">${renderInlineMd(raw)}</p>`;
  }
  if (inCode) {
    emitCodeBlock();
  }
  flushList();
  flushQuote();
  return html;
};

