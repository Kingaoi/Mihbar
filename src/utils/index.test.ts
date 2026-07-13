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
  };

  globalThis.window = {
    btoa: (str) => Buffer.from(str, "binary").toString("base64"),
    atob: (b64) => Buffer.from(b64, "base64").toString("binary"),
    dispatchEvent: () => {}
  };
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
