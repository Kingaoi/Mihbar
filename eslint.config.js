import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

// eslint-config-next يوفر قواعد React + React Hooks + Next.js الرسمية معًا
// (بديل عن التركيب اليدوي السابق لـ @eslint/js + eslint-plugin-react +
// eslint-plugin-react-hooks المنفصلة في vite.config الأصلي).
export default [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // نفس التخصيصات الموجودة في eslint.config.js الأصلي (Vite) — محفوظة
      // هنا حرفيًا لضمان نفس سلوك linting بعد الترحيل.
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "react/prop-types": "off",
      // السماح بـ catch/if الفارغة، شائعة في هذا المشروع كـ fallback آمن
      // عند فشل عمليات localStorage (انظر localStorageAdapter.js).
      "no-empty": "off",
    },
  },
];
