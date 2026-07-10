export const SEEDS = [
  {
    id: "seed-1",
    category: "نصيحة",
    text: "لا تقارن بداياتك بمواسم حصاد الآخرين. ركز على رحلتك وتطورك الشخصي اليومي، فالنباتات لا تنمو في نفس التوقيت حتى لو سُقيت بماءٍ واحد.",
    votes: {
      helpful: 4, helpfulBy: ["h1", "h2", "h3", "h4"],
      agree: 2, agreeBy: ["a1", "a2"],
      relatable: 5, relatableBy: ["r1", "r2", "r3", "r4", "r5"],
      inspiring: 3, inspiringBy: ["i1", "i2", "i3"],
      flaggedBy: []
    },
    timestamp: 1783161000000, // تاريخ قريب وثابت
    edited: false,
    note: "تطوير الذات والنمو الشخصي",
    comments: [
      {
        id: "seed-comment-1-1",
        text: "كلام من ذهب، المقارنة السلبية هي أكبر مدمر للطاقة والشغف.",
        votes: {
          helpful: 1, helpfulBy: ["hc1"],
          agree: 1, agreeBy: ["ac1"],
          relatable: 0, relatableBy: [],
          inspiring: 0, inspiringBy: [],
          flaggedBy: []
        },
        timestamp: 1783162800000,
        edited: false,
        replies: [],
        authorHash: "hc_seed_1"
      }
    ],
    mdFile: null,
    authorHash: "seed_author_1"
  },
  {
    id: "seed-2",
    category: "تجربة",
    text: "بعد 5 سنوات من العمل عن بعد، أهم درس تعلمته هو أن الانضباط في ساعات النوم والاستيقاظ هو ما يضمن استمرارية شغفك وإنتاجيتك. الحرية بدون نظام تتحول سريعاً إلى فوضى تشتت طاقتك.",
    votes: {
      helpful: 6, helpfulBy: ["h1", "h2", "h3", "h4", "h5", "h6"],
      agree: 5, agreeBy: ["a1", "a2", "a3", "a4", "a5"],
      relatable: 3, relatableBy: ["r1", "r2", "r3"],
      inspiring: 4, inspiringBy: ["i1", "i2", "i3", "i4"],
      flaggedBy: []
    },
    timestamp: 1783151000000,
    edited: false,
    note: "العمل الحر والإنتاجية الرقمية",
    comments: [],
    mdFile: null,
    authorHash: "seed_author_2"
  },
  {
    id: "seed-3",
    category: "رأي",
    text: "أعتقد أن الذكاء الاصطناعي لن يستبدل المبدعين، بل سيستبدل المبدعين الذين لا يستخدمون الذكاء الاصطناعي في عملهم. الأدوات تتغير وتتطور دائماً، لكن الفكر الإنساني واللمسة الشخصية تظل هي الفارق الحقيقي الذي لا يمكن تزييفه.",
    votes: {
      helpful: 3, helpfulBy: ["h1", "h2", "h3"],
      agree: 4, agreeBy: ["a1", "a2", "a3", "a4"],
      relatable: 2, relatableBy: ["r1", "r2"],
      inspiring: 2, inspiringBy: ["i1", "i2"],
      flaggedBy: []
    },
    timestamp: 1783141000000,
    edited: false,
    note: "التقنية ومستقبل المهن الإبداعية",
    comments: [],
    mdFile: null,
    authorHash: "seed_author_3"
  },
  {
    id: "seed-4",
    category: "سؤال",
    text: "ما هي أفضل نصيحة مهنية أو شخصية تلقيتها في حياتك وغيرت طريقة تفكيرك بالكامل؟ شاركونا تجاربكم لنستفيد من بعضنا البعض.",
    votes: {
      helpful: 2, helpfulBy: ["h1", "h2"],
      agree: 1, agreeBy: ["a1"],
      relatable: 4, relatableBy: ["r1", "r2", "r3", "r4"],
      inspiring: 1, inspiringBy: ["i1"],
      flaggedBy: []
    },
    timestamp: 1783131000000,
    edited: false,
    note: "سؤال تشاركي وتبادل فوائد",
    comments: [
      {
        id: "seed-comment-4-1",
        text: "\"لا تعبد عملك، بل اعبد الله، وعملك جزء من سعيك.\" هذه النصيحة خففت عني الكثير من التوتر المهني وساعدتني في ترتيب أولويات حياتي بالشكل الصحيح.",
        votes: {
          helpful: 3, helpfulBy: ["hc1", "hc2", "hc3"],
          agree: 2, agreeBy: ["ac1", "ac2"],
          relatable: 1, relatableBy: ["rc1"],
          inspiring: 3, inspiringBy: ["ic1", "ic2", "ic3"],
          flaggedBy: []
        },
        timestamp: 1783135000000,
        edited: false,
        replies: [],
        authorHash: "hc_seed_4_1"
      }
    ],
    mdFile: null,
    authorHash: "seed_author_4"
  }
];
