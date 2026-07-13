// تنويه أمني: هذا النظام يعمل بالكامل في بيئة العميل (Client-Side). 
// جميع مفاتيح الحظر والملكية والـ Rate Limiting تم تمويهها وتوقيعها رقمياً (Signed Checksum) لمنع التلاعب السهل عبر Developer Tools.
// تعد هذه الحماية "رادعة" (Deterrent) لمنع المستخدم العادي من التجاوز، وليست نظاماً أمنياً مطلقاً (والذي يتطلب خادماً وقاعدة بيانات موثوقة).
export const POSTS_KEY          = "mihbar-posts-v5";
export const LANG_KEY           = "_mh_sys_lang_v5";
export const THEME_KEY          = "_mh_sys_thm_v5";

// مفاتيح مشفرة وموقعة لحماية الملكية والحظر ومعدل الطلبات
export const OWNER_KEY          = "_mh_sec_own_v5";
export const OWNED_REPLIES_KEY  = "_mh_sec_re_v5";
export const OWNED_COMMENTS_KEY = "_mh_sec_co_v5";
export const DEVICE_HASH_KEY    = "_mh_sec_dev_v5";
export const BANNED_KEY         = "_mh_sec_ban_v5";
export const RATE_KEY           = "_mh_sec_rat_v5";
export const INTEGRITY_KEY      = "_mh_sec_sig_v5";

export const CL_DARK = {
  bg:           "#141312",
  surface:      "#1d1b19",
  accent:       "#e08a6e",
  accentDim:    "rgba(224,138,110,0.11)",
  accentBorder: "rgba(224,138,110,0.27)",
  text:         "#f1ece4",
  textSub:      "#9a9184",
  textMuted:    "#7d7367",
  border:       "#2e2a27",
  borderFaint:  "#1a1816",
  ok:           "#6BAE8A",
  okDim:        "rgba(107,174,138,0.09)",
  okBorder:     "rgba(107,174,138,0.2)",
  danger:       "#C0554A",
  dangerDim:    "rgba(192,85,74,0.12)",
  dangerBorder: "rgba(192,85,74,0.28)",
  edit:         "#7B9CD4",
  editDim:      "rgba(123,156,212,0.12)",
  editBorder:   "rgba(123,156,212,0.28)",
  flag:         "#E8B341",
  flagDim:      "rgba(232,179,65,0.12)",
  flagBorder:   "rgba(232,179,65,0.28)",
  reply:        "#A78BCC",
  replyDim:     "rgba(167,139,204,0.10)",
  replyBorder:  "rgba(167,139,204,0.25)",
};

export const CL_LIGHT = {
  bg:           "#fbf9f5",
  surface:      "#ffffff",
  accent:       "#cc6a4c",
  accentDim:    "rgba(204,106,76,0.10)",
  accentBorder: "rgba(204,106,76,0.30)",
  text:         "#1d1916",
  textSub:      "#7a7267",
  textMuted:    "#a69c8e",
  border:       "#e3ded5",
  borderFaint:  "#f5f1ea",
  ok:           "#3F8462",
  okDim:        "rgba(63,132,98,0.10)",
  okBorder:     "rgba(63,132,98,0.25)",
  danger:       "#A8392F",
  dangerDim:    "rgba(168,57,47,0.10)",
  dangerBorder: "rgba(168,57,47,0.28)",
  edit:         "#43619A",
  editDim:      "rgba(67,97,154,0.10)",
  editBorder:   "rgba(67,97,154,0.28)",
  flag:         "#A87B1E",
  flagDim:      "rgba(168,123,30,0.12)",
  flagBorder:   "rgba(168,123,30,0.28)",
  reply:        "#7C5FA0",
  replyDim:     "rgba(124,95,160,0.10)",
  replyBorder:  "rgba(124,95,160,0.25)",
};

export const ANIM = {
  fast:   "0.12s cubic-bezier(0.22,1,0.36,1)",
  normal: "0.2s cubic-bezier(0.22,1,0.36,1)",
  sheet:  "0.3s cubic-bezier(0.32,0.72,0,1)",
  press:  "0.1s cubic-bezier(0.4,0,0.2,1)",
  pressMs: 100,
  viewMs:  220,
  keyframes: {
    spin: "mihbarSpin",
    floatUp: "mihbar-float-up",
    threadIn: "threadEnter",
    threadOut: "threadExit",
    premiumSpin: "mihbar-premium-spin",
    pulse: "mihbar-pulse",
  }
};

export const ANIMATIONS = {
  spinner: `${ANIM.keyframes.premiumSpin} 1.3s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
  spinBtn: `${ANIM.keyframes.spin} 0.6s linear infinite`,
  reactionFloat: `${ANIM.keyframes.floatUp} 1s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  threadEnter: (closing) => closing 
    ? `${ANIM.keyframes.threadOut} ${ANIM.viewMs}ms cubic-bezier(0.32,0.72,0,1) forwards` 
    : `${ANIM.keyframes.threadIn} ${ANIM.viewMs}ms cubic-bezier(0.32,0.72,0,1)`,
  pulse: `${ANIM.keyframes.pulse} 2.2s infinite`,
  toastSlideUp: "toastSlideUp 0.35s cubic-bezier(0.19, 1, 0.22, 1) forwards"
};

export const TRANSITIONS = {
  colorChange: `background-color ${ANIM.normal}, border-color ${ANIM.normal}, color ${ANIM.normal}`,
  colorChangeExtended: `background ${ANIM.normal}, border-color ${ANIM.normal}, color ${ANIM.normal}, opacity ${ANIM.normal}, box-shadow ${ANIM.normal}`,
  press: `transform ${ANIM.press}`,
  pressShadow: `transform ${ANIM.press}, box-shadow ${ANIM.normal}, opacity ${ANIM.normal}`,
};

export const RADIUS = {
  xs:   4,
  sm:   8,
  md:   10,
  lg:   12,
  pill: 20,
  pillLg: 30,
  circle: "50%",
  sheetTop: "20px 20px 0 0",
};

export const FONT = {
  micro:    9,
  badge:    10,
  caption:  11,
  label:    12,
  body:     13,
  bodyLg:   14,
  subhead:  15,
  heading:  16,
  title:    18,
  display:  28,
  displayLg:32,
  displayXl:44,
};

export const SHADOWS = {
  modal:    "0 10px 40px rgba(0,0,0,0.4)",
  danger:   "0 10px 50px rgba(192,85,74,0.25)",
  postBtn:  "0 3px 16px rgba(217,119,87,0.28)",
  lg:       "0 8px 24px rgba(0,0,0,0.28)",
};

export const OUTLINE_NONE = "none";

export const CATS = {
  "رأي":   { en:"Opinion",    color:"#D97757", bg:"rgba(217,119,87,0.12)"  },
  "نصيحة": { en:"Advice",     color:"#6BAE8A", bg:"rgba(107,174,138,0.12)" },
  "تجربة": { en:"Experience", color:"#B87BAA", bg:"rgba(184,123,170,0.12)" },
  "سؤال":  { en:"Question",   color:"#C9A84C", bg:"rgba(201,168,76,0.12)"  },
  "أفكار": { en:"Ideas",      color:"#7B9CD4", bg:"rgba(123,156,212,0.12)" },
  "مواقف": { en:"Situations", color:"#C97B5B", bg:"rgba(201,123,91,0.12)"  },
  "توصية": { en:"Tip",        color:"#5BAF8C", bg:"rgba(91,175,140,0.12)"  },
  "عام":   { en:"General",    color:"#8A7260", bg:"rgba(138,114,96,0.12)"  },
};

export const REACTIONS = [
  { key:"helpful",   labelKey:"rHelpful"   },
  { key:"agree",     labelKey:"rAgree"     },
  { key:"relatable", labelKey:"rRelatable" },
  { key:"inspiring", labelKey:"rInspiring" },
  { key:"flag",      labelKey:"rFlag",     isModeration:true },
];

export const RATE_LIMITS = {
  post:    { max:1, window:3*60*1000  },
  comment: { max:3, window:30*1000    },
  reply:   { max:5, window:60*1000    },
  flag:    { max:5, window:60*60*1000 },
};

export const FLAG_HIDE_LIMIT = 6;
export const FLAG_BAN_LIMIT = 10;
