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

export const canPerformAction = async (action) => {
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


export const renderInlineMd = (line) => {
  let t = escapeHtml(line);
  t = t.replace(
    /`([^`]+)`/g,
    (_, c) =>
      `<code style="background:var(--md-code-bg);padding:1px 5px;border-radius:4px;font-size:0.9em;">${c}</code>`
  );
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, url) =>
    /^https?:\/\//.test(url)
      ? `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:6px 0;"/>`
      : ""
  );
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, label, url) =>
    /^https?:\/\//.test(url)
      ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:var(--md-link);text-decoration:underline;">${label}</a>`
      : label
  );
  t = t.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  t = t.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  t = t.replace(/(?<!_)_([^_\n]+)_(?!_)/g, "<em>$1</em>");
  t = t.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  return t;
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
    inQuote = false,
    quoteBuf = [];

  const flushList = () => {
    if (!listType) return;
    const tag = listType === "ol" ? "ol" : "ul";
    html += `<${tag} style="margin:6px 0;padding-inline-start:22px;">${listBuf.join(
      ""
    )}</${tag}>`;
    listType = null;
    listBuf = [];
  };

  const flushQuote = () => {
    if (!inQuote) return;
    html += `<blockquote style="border-inline-start:3px solid var(--md-quote);margin:8px 0;padding:2px 12px;color:var(--md-quote-text);">${quoteBuf.join(
      "<br/>"
    )}</blockquote>`;
    inQuote = false;
    quoteBuf = [];
  };

  for (let raw of lines) {
    const fence = raw.match(/^```(.*)$/);
    if (fence) {
      if (!inCode) {
        flushList();
        flushQuote();
        inCode = true;
        codeLang = (fence[1] || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "";
        codeBuf = [];
      } else {
        const codeText = codeBuf.join("\n");
        let highlighted = escapeHtml(codeText);
        if (codeLang && Prism.languages[codeLang]) {
          try {
            highlighted = Prism.highlight(codeText, Prism.languages[codeLang], codeLang);
          } catch {
            // fallback
          }
        }
        html += `<pre style="background:var(--md-code-bg);border-radius:8px;padding:10px 12px;overflow-x:auto;margin:8px 0;" class="language-${codeLang}"><code class="language-${codeLang}">${highlighted}</code></pre>`;
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
        sizes = {
          1: "1.5em",
          2: "1.3em",
          3: "1.15em",
          4: "1.05em",
          5: "1.5em",
          6: "0.95em"
        };
      html += `<h${lvl} style="margin:14px 0 6px;font-size:${sizes[lvl]};font-weight:700;line-height:1.4;">${renderInlineMd(
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
    const ol = raw.match(/^\s*\d+[.)]\s+(.*)$/);
    const ul = raw.match(/^\s*[-*+]\s+(.*)$/);
    if (ol || ul) {
      flushQuote();
      const kind = ol ? "ol" : "ul";
      if (listType && listType !== kind) flushList();
      listType = kind;
      listBuf.push(`<li style="margin:3px 0;">${renderInlineMd((ol || ul)[1])}</li>`);
      continue;
    }
    flushList();
    flushQuote();
    html += `<p style="margin:6px 0;line-height:1.75;">${renderInlineMd(raw)}</p>`;
  }
  if (inCode) {
    const codeText = codeBuf.join("\n");
    let highlighted = escapeHtml(codeText);
    if (codeLang && Prism.languages[codeLang]) {
      try {
        highlighted = Prism.highlight(codeText, Prism.languages[codeLang], codeLang);
      } catch {
        // fallback
      }
    }
    html += `<pre style="background:var(--md-code-bg);border-radius:8px;padding:10px 12px;overflow-x:auto;margin:8px 0;" class="language-${codeLang}"><code class="language-${codeLang}">${highlighted}</code></pre>`;
  }
  flushList();
  flushQuote();
  return html;
};
