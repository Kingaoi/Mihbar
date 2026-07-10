/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ملاحظة: خلافًا لتعليق سابق كان يفترض أن eslint/TypeScript يعملان بشكل
  // منفصل عن next build — هذا غير دقيق فعليًا. next build يدمج فحص كليهما
  // ضمن مساره افتراضيًا (typescript.ignoreBuildErrors/eslint.ignoreDuringBuilds
  // غير مفعَّلتين هنا عمدًا). هذا الدمج اكتشف عدة باگات إنتاجية حقيقية أثناء
  // ترحيل المشروع لـ TypeScript (تفصيل كامل في MIGRATION_NOTES.md، القسم 7)
  // — لذلك يُبقى كما هو رغم أنه يُبطئ البناء قليلاً مقارنة بفصله.
};

export default nextConfig;
