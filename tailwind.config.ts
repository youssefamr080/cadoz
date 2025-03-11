import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8B4513", // لون بني داكن (يمكن تغييره حسب التصميم)
        secondary: "#D2B48C", // لون بيج فاتح للهدايا
        accent: "#FFD700", // لون ذهبي فاخر
      },
    },
  },
  plugins: [],
} satisfies Config;
