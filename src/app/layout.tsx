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
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import NextAuthProvider from "@/providers/session-provider";
import { AuthProvider as ContextAuthProvider } from "../context/AuthContext";
import { Suspense, lazy, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "react-error-boundary";

// تحسين تحميل الخطوط مع دعم أفضل للعربية
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
  fallback: [
    "system-ui",
    "-apple-system", 
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Fira Sans",
    "Droid Sans",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol"
  ],
  adjustFontFallback: true,
});

// تحميل ديناميكي للمكونات الثقيلة - مع منع SSR لتجنب hydration mismatch
const DynamicWhatsappHelper = dynamic(
  () => import("../components/home/WhatsappHelper"),
  { 
    ssr: false,
    loading: () => null
  }
);

const DynamicAnalytics = dynamic(
  () => import("@vercel/analytics/react").then(mod => ({ default: mod.Analytics })),
  { ssr: false }
);

const DynamicToastContainer = dynamic(
  () => import("react-toastify").then(mod => ({ default: mod.ToastContainer })),
  { ssr: false }
);

// مكون للتأكد من client-side mounting
function ClientOnlyWrapper({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

// مكون Error Fallback
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">حدث خطأ غير متوقع</h2>
        <p className="text-gray-600 mb-6">نعتذر عن هذا الإزعاج. يرجى المحاولة مرة أخرى.</p>
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

// مكون Loading للصفحة الرئيسية بدون حدود جانبية
function MainLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm border-b">
          <div className="h-20 flex items-center justify-between px-0 max-w-full">
            <div className="h-8 bg-gray-200 rounded w-32 mx-4"></div>
            <div className="flex gap-4 mx-4">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="pt-8 px-0 max-w-full">
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded-none"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 border-r border-b border-gray-300"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="ar" 
      dir="rtl" 
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* تحسين الأداء والـ SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light" />
        
        {/* تحسين الخطوط العربية */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* تحسين الأداء */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Manifest للـ PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      </head>
      
      <body 
        className={`
          ${inter.className} 
          font-sans 
          antialiased 
          bg-gray-50 
          text-gray-900 
          overflow-x-hidden
          selection:bg-blue-100 
          selection:text-blue-900
          m-0
          p-0
        `}
        suppressHydrationWarning={true}
      >
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ReduxProvider store={store}>
            <NextAuthProvider>
              <ContextAuthProvider>
                <Providers>
                  {/* Skip to main content للوصولية */}
                  <a 
                    href="#main-content" 
                    className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 bg-blue-600 text-white px-3 py-2 rounded-md z-50 text-sm mx-2"
                  >
                    الانتقال إلى المحتوى الرئيسي
                  </a>

                  {/* Header مع منع hydration mismatch */}
                  <Header />

                  {/* المحتوى الرئيسي بدون حدود جانبية */}
                  <main 
                    id="main-content"
                    className="
                      min-h-screen
                      pt-20
                      pb-4
                      px-0
                      max-w-full
                      w-full
                      focus:outline-none
                    "
                    tabIndex={-1}
                  >
                    <div className="w-full">
                      {children}
                    </div>
                  </main>

                  {/* Footer */}
                  <Footer />

                  {/* المكونات التفاعلية - client-side only */}
                  <ClientOnlyWrapper>
                    {/* WhatsApp Helper مع تحسين للهواتف */}
                    <DynamicWhatsappHelper 
                      phoneNumber="+201026972523"
                      className="
                        fixed 
                        bottom-4 
                        left-4 
                        sm:bottom-6 
                        sm:left-6 
                        z-40
                        transition-all 
                        duration-300 
                        hover:scale-110
                        focus:scale-110
                        focus:outline-none
                        focus:ring-2
                        focus:ring-green-500
                        focus:ring-offset-2
                        rounded-full
                      "
                    />

                    {/* Toast Container محسن للهواتف */}
                    <DynamicToastContainer
                      position="top-center"
                      autoClose={4000}
                      hideProgressBar={false}
                      newestOnTop
                      closeOnClick
                      rtl={true}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      theme="light"
                      className="!top-24 !z-50"
                      toastClassName="!rounded-lg !shadow-lg !border !text-sm sm:!text-base !p-4 !font-medium"
                      progressClassName="!bg-blue-500"
                      limit={3}
                      stacked
                    />

                    {/* Analytics مع تحميل متأخر */}
                    <DynamicAnalytics />
                  </ClientOnlyWrapper>
                </Providers>
              </ContextAuthProvider>
            </NextAuthProvider>
          </ReduxProvider>
        </ErrorBoundary>

        {/* Service Worker Registration - client-side only */}
        <ClientOnlyWrapper>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `,
            }}
          />
        </ClientOnlyWrapper>
      </body>
    </html>
  );
}