import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/swiper.css";
import { ReduxProvider } from "../providers/ReduxProvider";
import { Providers } from "../providers/Providers";
import { Analytics } from "@vercel/analytics/react";
import WhatsappHelper from "../components/home/WhatsappHelper";
import { AuthProvider } from "../context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cadoz",
  description: "Cadoz - Your Gift Shopping Destination",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <AuthProvider>
          <ReduxProvider>
            <Providers>
              <WhatsappHelper phoneNumber="+201026972523" />
              {children}
              <Analytics />
              <ToastContainer position="top-center" />
            </Providers>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
