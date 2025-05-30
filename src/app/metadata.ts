import type { Metadata } from "next";

const title = "كادوز - هدايا مميزة وتغليف احترافي | Cadoz";
const description =
  "كادوز - متجر متخصص في بيع وتغليف الهدايا بشكل احترافي ومميز. نقدم خدمة اختيار وتغليف الهدايا بعناية فائقة مع توصيل لجميع أنحاء مصر.";

export const metadata: Metadata = {
  title,
  description,
  themeColor: "#4F46E5",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: "/favicon.ico",
  },
};
