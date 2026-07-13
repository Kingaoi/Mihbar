/* global Buffer */
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import {
  renderMarkdown,
  applyVoteToggle,
  isSpamQuality,
  emptyVotes,
  db,
  checkIfBanned,
  banDevice,
  canPerformAction,
} from "./index";

// Mock localStorage and window for database/banning/rate-limit tests
beforeAll(() => {
  globalThis.localStorage = {
    store: {},
    getItem(key) {
      return this.store[key] || null;
    },
    setItem(key, value) {
      this.store[key] = String(value);
    },
    removeItem(key) {
      delete this.store[key];
    },
    clear() {
      this.store = {};
    }
  } as unknown as Storage;

  globalThis.window = {
    btoa: (str) => Buffer.from(str, "binary").toString("base64"),
    atob: (b64) => Buffer.from(b64, "base64").toString("binary"),
    dispatchEvent: () => true
  } as unknown as Window & typeof globalThis;
});

beforeEach(async () => {
  globalThis.localStorage.clear();
  // Ensure we have a mock device hash saved
  await db.saveDeviceHash("test-device-123");
});

describe("renderMarkdown", () => {
  it("should render simple markdown to html", () => {
    const md = "# Hello World\nThis is a simple paragraph.";
    const html = renderMarkdown(md);
    expect(html).toContain("Hello World");
    expect(html).toContain("<p");
  });

  it("should flush code blocks even if not closed", () => {
    // لغة "plaintext" غير مسجَّلة في Prism.languages عمدًا هنا (انظر قائمة
    // prism-*.js المستوردة في utils/index.js: js/css/json/python/ts/jsx/tsx
    // فقط) — هذا يبقي الاختبار مركّزًا على السلوك المقصود أصلاً (إغلاق كتلة
    // كود غير مُغلَقة تلقائيًا، والحفاظ على محتواها كنص خام)، دون الاقتران
    // بتفاصيل تنفيذ تلوين Prism الداخلية (بنية span.token) التي قد تتغيّر
    // مستقبلاً بشكل مستقل عن منطق الإغلاق التلقائي نفسه.
    const md = "```plaintext\nconst x = 5;\nconsole.log(x);";
    const html = renderMarkdown(md);
    expect(html).toContain("<pre");
    expect(html).toContain("const x = 5;");
  });

  describe("bidi / dir=auto support (Arabic + English formatting)", () => {
    it("adds dir=auto to paragraphs so each block resolves its own direction", () => {
      const html = renderMarkdown("This is an English paragraph.");
      expect(html).toMatch(/<p[^>]*dir="auto"/);
    });

    it("adds dir=auto to every heading level", () => {
      for (let lvl = 1; lvl <= 6; lvl++) {
        const hashes = "#".repeat(lvl);
        const html = renderMarkdown(`${hashes} عنوان تجريبي`);
        expect(html).toMatch(new RegExp(`<h${lvl}[^>]*dir="auto"`));
      }
    });

    it("adds dir=auto to list items and the list container", () => {
      const html = renderMarkdown("- first item\n- second item");
      expect(html).toMatch(/<ul[^>]*dir="auto"/);
      expect(html).toMatch(/<li[^>]*dir="auto"/);
    });

    it("adds dir=auto to blockquotes", () => {
      const html = renderMarkdown("> اقتباس تجريبي");
      expect(html).toMatch(/<blockquote[^>]*dir="auto"/);
    });

    it("keeps English and Arabic paragraphs independently correct regardless of order", () => {
      const html = renderMarkdown("فقرة عربية\n\nEnglish paragraph");
      const paragraphs = html.match(/<p[^>]*dir="auto"[^>]*>/g);
      expect(paragraphs?.length).toBe(2);
    });
  });

  describe("Arabic-Indic numeral support in ordered lists", () => {
    it("recognizes ASCII-digit ordered lists (baseline) and preserves item text", () => {
      const html = renderMarkdown("1. first\n2. second");
      expect(html).toContain("<ol");
      expect(html).toContain("<li");
      expect(html).toContain("first");
      expect(html).toContain("second");
      // ضمان أن رقم العنصر نفسه لا يظهر بدل النص (البَگ الذي انزلق سابقًا:
      // فهرس مجموعة الالتقاط الخاطئ كان يعرض "1"/"2" بدل "first"/"second").
      expect(html).not.toContain("<li dir=\"auto\" style=\"margin:3px 0;\">1</li>");
    });

    it("recognizes Arabic-Indic digit (٠-٩) ordered lists and preserves item text", () => {
      const html = renderMarkdown("١. أول\n٢. ثاني");
      expect(html).toContain("<ol");
      expect(html).toContain("<li");
      expect(html).toContain("أول");
      expect(html).toContain("ثاني");
      // لو لم تُكتشف كقائمة، ستُعامَل كفقرة عادية (لا <li>) — هذا هو الفرق
      // الحاسم الذي يثبت أن الدعم يعمل فعليًا وليس مجرد احتواء نصي عرضي.
      // ولو انزلق فهرس مجموعة الالتقاط، سيظهر الرقم "١" بدل "أول" فعليًا.
      expect(html).not.toContain("<li dir=\"auto\" style=\"margin:3px 0;\">١</li>");
    });

    it("recognizes Extended Arabic-Indic digit (۰-۹, Persian/Urdu) ordered lists and preserves item text", () => {
      const html = renderMarkdown("۱. اول\n۲. دوم");
      expect(html).toContain("<ol");
      expect(html).toContain("<li");
      expect(html).toContain("اول");
      expect(html).toContain("دوم");
    });

    it("preserves a custom start number for ASCII ordered lists", () => {
      const html = renderMarkdown("5. fifth\n6. sixth");
      expect(html).toMatch(/<ol[^>]*start="5"/);
    });
  });

  describe("intraword emphasis (CommonMark flanking rule)", () => {
    it("does NOT italicize underscores inside a continuous English word", () => {
      const html = renderMarkdown("my_variable_name is a thing");
      expect(html).not.toContain("<em>");
      expect(html).toContain("my_variable_name");
    });

    it("does NOT italicize underscores inside a continuous Arabic word", () => {
      const html = renderMarkdown("شاهد_هذا_الفيديو");
      expect(html).not.toContain("<em>");
    });

    it("still italicizes underscore emphasis with surrounding spaces (English)", () => {
      const html = renderMarkdown("this is _truly_ important");
      expect(html).toContain("<em>truly</em>");
    });

    it("still italicizes underscore emphasis with surrounding spaces (Arabic)", () => {
      const html = renderMarkdown("كلمة _مهمة جدا_ هنا");
      expect(html).toContain("<em>مهمة جدا</em>");
    });

    it("still italicizes asterisk emphasis regardless of the flanking rule", () => {
      const html = renderMarkdown("this is *emphasis* text");
      expect(html).toContain("<em>emphasis</em>");
    });
  });

  describe("heading size scale", () => {
    it("produces a strictly non-increasing font-size from h1 to h6", () => {
      const sizeOf = (lvl: number) => {
        const html = renderMarkdown(`${"#".repeat(lvl)} heading`);
        const m = html.match(/font-size:([\d.]+)em/);
        return m ? parseFloat(m[1]) : -1;
      };
      const sizes = [1, 2, 3, 4, 5, 6].map(sizeOf);
      for (let i = 1; i < sizes.length; i++) {
        expect(sizes[i]).toBeLessThanOrEqual(sizes[i - 1]);
      }
    });
  });

  describe("GFM tables", () => {
    const tableMd = [
      "| Name | Role |",
      "|------|------|",
      "| Sara | Dev  |",
      "| نور  | مصمم |",
    ].join("\n");

    it("renders a table with thead/tbody structure", () => {
      const html = renderMarkdown(tableMd);
      expect(html).toContain("<table");
      expect(html).toContain("<thead");
      expect(html).toContain("<tbody");
      expect(html).toContain("<th");
      expect(html).toContain("<td");
    });

    it("renders every cell's content, including Arabic cells", () => {
      const html = renderMarkdown(tableMd);
      expect(html).toContain("Name");
      expect(html).toContain("Role");
      expect(html).toContain("Sara");
      expect(html).toContain("نور");
      expect(html).toContain("مصمم");
    });

    it("applies inline formatting inside table cells", () => {
      const md = "| A |\n|---|\n| **bold** text |";
      const html = renderMarkdown(md);
      expect(html).toContain("<strong>bold</strong>");
    });

    it("supports column alignment markers", () => {
      const md = "| L | C | R |\n|:--|:-:|--:|\n| a | b | c |";
      const html = renderMarkdown(md);
      expect(html).toMatch(/text-align:\s*center/);
      expect(html).toMatch(/text-align:\s*right/);
    });

    it("does not treat a lone pipe-containing line as a table", () => {
      const html = renderMarkdown("this | is not a table");
      expect(html).not.toContain("<table");
    });
  });

  describe("task list checkboxes", () => {
    it("renders an unchecked task as a disabled unchecked checkbox", () => {
      const html = renderMarkdown("- [ ] pending task");
      expect(html).toContain('type="checkbox"');
      expect(html).not.toMatch(/type="checkbox"[^>]*checked/);
      expect(html).toContain("pending task");
    });

    it("renders a checked task as a disabled checked checkbox", () => {
      const html = renderMarkdown("- [x] done task");
      expect(html).toMatch(/type="checkbox"[^>]*checked/);
    });

    it("renders a checked task with uppercase X too", () => {
      const html = renderMarkdown("- [X] done task");
      expect(html).toMatch(/type="checkbox"[^>]*checked/);
    });

    it("does not break a normal unordered list item that starts with a literal bracket", () => {
      const html = renderMarkdown("- [not a checkbox] just text");
      expect(html).not.toContain('type="checkbox"');
      expect(html).toContain("[not a checkbox] just text");
    });
  });

  describe("malformed link/image graceful degradation", () => {
    it("does not leave a stray trailing paren when a link protocol is rejected", () => {
      const html = renderMarkdown("[click me](javascript:alert(1))");
      expect(html).not.toContain(")</p>");
    });
  });
});

describe("isSpamQuality", () => {
  it("should return true for empty or whitespace-only text", () => {
    expect(isSpamQuality("")).toBe(true);
    expect(isSpamQuality("   ")).toBe(true);
  });

  it("should return true for excessive repeated non-free characters", () => {
    expect(isSpamQuality("bbbbbbbbbbbb")).toBe(true);
  });

  it("should return false for natural Arabic text with repeated free characters like 'هاوي'", () => {
    expect(isSpamQuality("هههههههههههه")).toBe(false);
  });
});

describe("applyVoteToggle", () => {
  it("should add a reaction when not voted yet", () => {
    const item = {
      votes: emptyVotes(),
    };
    const updated = applyVoteToggle(item, "helpful", "hash123");
    expect(updated.votes.helpful).toBe(1);
    expect(updated.votes.helpfulBy).toContain("hash123");
  });

  it("should remove a reaction when already voted", () => {
    const item = {
      votes: {
        ...emptyVotes(),
        helpful: 1,
        helpfulBy: ["hash123"],
      },
    };
    const updated = applyVoteToggle(item, "helpful", "hash123");
    expect(updated.votes.helpful).toBe(0);
    expect(updated.votes.helpfulBy).not.toContain("hash123");
  });
});

describe("Inkore Security, Banning, and Rate Limiting", () => {
  describe("Banning Logic", () => {
    it("should initially not be banned", async () => {
      expect(await checkIfBanned()).toBeNull();
    });

    it("should ban device and recognize it as banned", async () => {
      await banDevice("test-device-123", 2); // ban for 2 hours
      const banExpires = await checkIfBanned();
      expect(banExpires).not.toBeNull();
      expect(banExpires).toBeGreaterThan(Date.now());
    });

    it("should auto-expire ban if time passed", async () => {
      await banDevice("test-device-123", -1); // expired 1 hour ago
      expect(await checkIfBanned()).toBeNull();
    });
  });

  describe("Rate Limiting Logic", () => {
    it("should allow single post perform action", async () => {
      const res = await canPerformAction("post");
      expect(res.allowed).toBe(true);
    });

    it("should block posts after exceeding limit max of 1", async () => {
      // First one is allowed
      expect((await canPerformAction("post")).allowed).toBe(true);
      // Second one should be blocked
      const res = await canPerformAction("post");
      expect(res.allowed).toBe(false);
      expect(res.waitSeconds).toBeGreaterThan(0);
    });

    it("should allow up to 3 comments", async () => {
      expect((await canPerformAction("comment")).allowed).toBe(true);
      expect((await canPerformAction("comment")).allowed).toBe(true);
      expect((await canPerformAction("comment")).allowed).toBe(true);
      // 4th comment should be rate-limited
      expect((await canPerformAction("comment")).allowed).toBe(false);
    });

    it("should not let concurrent unsequenced calls all bypass the limit (race condition regression)", async () => {
      // نظير النقر المزدوج السريع على زر الإرسال قبل أن يعطّله أي منطق
      // واجهة — عدة استدعاءات متزامنة غير متسلسلة لنفس الـ action. بدون
      // القفل في canPerformAction، كل استدعاء كان يقرأ نفس اللقطة القديمة
      // من البيانات ويتجاوز الحد بشكل مستقل (تأكدنا تجريبيًا: 10 استدعاءات
      // متزامنة بحد أقصى 3 كانت كلها allowed=true دون القفل).
      const results = await Promise.all(
        Array.from({ length: 10 }, () => canPerformAction("comment"))
      );
      const allowedCount = results.filter((r) => r.allowed).length;
      expect(allowedCount).toBe(3);
    });

    it("should let different action keys proceed independently under concurrency", async () => {
      const [postRes, commentRes, replyRes] = await Promise.all([
        canPerformAction("post"),
        canPerformAction("comment"),
        canPerformAction("reply"),
      ]);
      expect(postRes.allowed).toBe(true);
      expect(commentRes.allowed).toBe(true);
      expect(replyRes.allowed).toBe(true);
    });
  });

  describe("Ownership Logic", () => {
    it("should correctly save and load owned posts secure structure", async () => {
      const initialOwned = { "post-1": true, "post-2": true };
      await db.saveOwnedPosts(initialOwned);
      const loaded = await db.getOwnedPosts();
      expect(loaded).toEqual(initialOwned);
    });

    it("should return empty object fallback if no owned posts exist", async () => {
      const loaded = await db.getOwnedPosts();
      expect(loaded).toEqual({});
    });
  });
});
