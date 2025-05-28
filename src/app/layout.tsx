"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import "../Styles/swiper.css";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/lib/redux/store";
import { Providers } from "../providers/Providers";
import { Analytics } from "@vercel/analytics/react";
import WhatsappHelper from "../components/home/WhatsappHelper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer";
import NextAuthProvider from "@/providers/session-provider";
import { AuthProvider as ContextAuthProvider } from "../context/AuthContext";
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Arial", "sans-serif"],
  adjustFontFallback: true
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <ReduxProvider store={store}>
          <NextAuthProvider>
            <ContextAuthProvider>
              <Providers>
                <WhatsappHelper phoneNumber="+201026972523" />
                <Header />
                <main className="pt-[calc(5rem+1.75rem)]">{children}</main>
                <Footer />
                <Analytics />
                <ToastContainer 
                  position="top-center" 
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={true}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
              </Providers>
            </ContextAuthProvider>
          </NextAuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}