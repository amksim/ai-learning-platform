"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { signup, sendMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Send magic link for passwordless login
      await sendMagicLink(email);
      setCodeSent(true);
      alert("Проверьте email! Мы отправили ссылку для входа.");
    } catch (error: any) {
      console.error("Error sending magic link:", error);
      alert(error.message || "Ошибка отправки письма");
    }
    
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // For demo: create account with temporary password
      const demoPassword = `demo-${code}-${Date.now()}`;
      await signup(email, demoPassword, email.split('@')[0]);
      router.push("/courses");
    } catch (error: any) {
      console.error("Demo login error:", error);
      // If user already exists, just redirect
      if (error.message?.includes('already registered')) {
        alert("Этот email уже зарегистрирован. Используйте magic link для входа!");
        setCodeSent(false);
      } else {
        alert("Ошибка входа. Попробуйте ещё раз.");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-accent/10 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-center text-2xl">
                {t.auth.login_title}
              </CardTitle>
              <CardDescription className="text-center">
                {codeSent
                  ? `${t.auth.code_sent} ${email}`
                  : "Введите email для входа"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!codeSent ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.auth.email_placeholder}
                      required
                      className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      "Отправка..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t.auth.send_code}
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="code" className="text-sm font-medium">
                      Код подтверждения
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder={t.auth.code_placeholder}
                      maxLength={6}
                      required
                      className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-center text-2xl font-mono tracking-widest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Для демо: используйте любой 6-значный код
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Проверка..." : t.auth.verify}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setCodeSent(false);
                      setCode("");
                    }}
                  >
                    Изменить email
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
