import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import SupportButton from "@/components/SupportButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReviewsProvider } from "@/contexts/ReviewsContext";
import { Toaster } from "react-hot-toast";

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
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1f2937',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </ReviewsProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
