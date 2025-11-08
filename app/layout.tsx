import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import SupportButton from "@/components/SupportButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReviewsProvider } from "@/contexts/ReviewsContext";

export const metadata: Metadata = {
  title: "AI Learning Platform - Научись создавать с AI",
  description: "Образовательная платформа для обучения созданию сайтов, приложений и игр с помощью искусственного интеллекта",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="font-sans">
        <AuthProvider>
          <LanguageProvider>
            <ReviewsProvider>
              <Navigation />
              <main className="min-h-screen pb-20 md:pb-0">
                {children}
              </main>
              <SupportButton />
              <MobileBottomNav />
            </ReviewsProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
