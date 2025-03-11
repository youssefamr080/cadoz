import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { GiftProvider } from "../context/GiftContext";
import { Analytics } from "@vercel/analytics/react";
import WhatsappHelper from "../components/home/WhatsappHelper";
export const metadata: Metadata = {
  title: "Cadoz | متجر الهدايا الفاخرة",
  description: "أفضل متجر للهدايا الفاخرة بخيارات تخصيص متقدمة",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 text-gray-900">
        <CartProvider>
          <WishlistProvider>
            <GiftProvider>
            <WhatsappHelper phoneNumber="+201026972523" />
              {children}
              <Analytics />
            </GiftProvider>
          </WishlistProvider>
        </CartProvider>
        
      </body>
    </html>
  );
}
