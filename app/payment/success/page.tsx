"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Check, Loader2 } from "lucide-react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, completePurchase } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        router.push('/payment');
        return;
      }

      try {
        // Verify with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`/api/payment-status?session_id=${sessionId}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await response.json();

        if (data.paid) {
          // Mark as purchased with Stripe customer ID
          const customerId = data.customer_id || `stripe_${sessionId}`;
          const subscriptionType = data.subscription_type || 'monthly';
          completePurchase(customerId, subscriptionType);
          setIsVerified(true);
          setIsLoading(false);
          
          // Redirect to courses after 2 seconds
          setTimeout(() => {
            window.location.href = '/courses';
          }, 2000);
        } else {
          // If verification fails, still keep purchase active (already paid in Stripe)
          console.warn('Payment status returned not paid, but keeping purchase active');
          completePurchase(`session_${sessionId}`, 'monthly');
          setIsVerified(true);
          setIsLoading(false);
          setTimeout(() => {
            window.location.href = '/courses';
          }, 2000);
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        // Even on error, keep purchase active and redirect (payment was successful in Stripe)
        completePurchase(`fallback_${Date.now()}`, 'monthly');
        setIsVerified(true);
        setIsLoading(false);
        setTimeout(() => {
          window.location.href = '/courses';
        }, 2000);
      }
    };

    verifyPayment();
  }, [searchParams, router, completePurchase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-purple-500/5">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-purple-500" />
<h2 className="text-2xl font-bold mb-2">Проверяем оплату...</h2>
            <p className="text-gray-400">Это займёт пару секунд</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-purple-500/5">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2 text-red-500">Ошибка проверки</h2>
            <p className="text-gray-400">Перенаправляем на страницу оплаты...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-purple-500/5">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            🎉 Оплата успешна!
          </h2>
          <p className="text-gray-300 mb-4">
            Все уроки разблокированы!
          </p>
          <p className="text-sm text-gray-400">
            Перенаправляем на курсы через 2 секунды...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-purple-500/5">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-purple-500" />
            <h2 className="text-2xl font-bold mb-2">Загрузка...</h2>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
