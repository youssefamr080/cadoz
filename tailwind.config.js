/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}", // جميع صفحات Next.js
    "./src/components/**/*.{js,ts,jsx,tsx}", // جميع المكونات
    "./src/**/*.{js,ts,jsx,tsx}", // إذا كنت تريد التأكد من تضمين كل الملفات
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF", // خلفية بيضاء
        primary: "#8B4513", // لون أساسي بني
        secondary: "#D2B48C", // لون فاتح للتمييز
        accent: "#FFD700", // لون ذهبي للعناصر الفاخرة
        foreground: "#4A3228", // لون الخطوط الغامق
      },
    },
  },
  plugins: [],
};
