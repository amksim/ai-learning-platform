import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import SupportButton from "@/components/SupportButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReviewsProvider } from "@/contexts/ReviewsContext";
import { Toaster } from "react-hot-toast";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "AI Learning Platform - Научись создавать сайты, игры и приложения с AI",
  description: "🌍 Первая в мире платформа для обучения созданию сайтов, игр и приложений с помощью AI. Без знания кода! Полный курс за $399. Более 100 уроков.",
  keywords: [
    "создать сайт с помощью AI",
    "создать сайт с ИИ",
    "как создать сайт с искусственным интеллектом",
    "AI для создания сайтов",
    "создание сайтов с помощью нейросетей",
    "создать игру с помощью AI",
    "создать приложение с AI",
    "обучение созданию сайтов с AI",
    "курсы по созданию с AI",
    "AI обучение",
    "искусственный интеллект обучение",
    "программирование с AI",
    "разработка с AI",
    "курсы AI",
    "онлайн обучение AI",
    "веб-разработка с AI",
    "без кода создание сайтов",
    "no-code с AI",
    "ChatGPT для создания сайтов",
    "нейросети для создания сайтов"
  ],
  authors: [{ name: "AI Learning Platform" }],
  creator: "AI Learning Platform",
  publisher: "AI Learning Platform",
  metadataBase: new URL('https://ai-learning45.netlify.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "AI Learning Platform - Создавай с AI",
    description: "🌍 Первая в мире платформа для создания сайтов, игр и приложений с AI. Без знания кода!",
    url: 'https://ai-learning45.netlify.app',
    siteName: 'AI Learning Platform',
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Learning Platform - Создавай с AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Learning Platform - Создавай с AI',
    description: '🌍 Первая в мире платформа для создания сайтов, игр и приложений с AI',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '-tSZEEecC5Xxa_4fg537DPAZpgoEf0-duKYE8tmIPmk',
  },
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
              <main className="min-h-screen pb-16 md:pb-0">
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
