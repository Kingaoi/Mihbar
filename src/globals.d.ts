// تصريح أنواع مخصص لملفات CSS المستوردة كـ side-effect (بلا default export)،
// مثل `import "./globals.css";` في app/layout.tsx. TypeScript لا يتعرف على
// ملفات CSS كوحدات افتراضيًا؛ هذا التصريح يخبره أن أي `.css` هو وحدة صالحة
// دون قيمة مُصدَّرة، وهو النمط الرسمي الموصى به من فريق TypeScript لدعم
// CSS Modules الأساسية أو استيرادات CSS الخام في مشاريع Next.js.
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
