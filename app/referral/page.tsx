"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DollarSign, Copy, Users, TrendingUp, CreditCard, CheckCircle2, Clock, AlertCircle, UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";

interface ReferralData {
  referralCode: string;
  balance: number;
  totalReferrals: number;
  paidReferrals: number;
  referrals: Array<{
    email: string;
    status: string;
    createdAt: string;
    paidAt: string | null;
  }>;
  withdrawals: Array<{
    id: number;
    amount: number;
    status: string;
    createdAt: string;
    paymentMethod: string;
  }>;
}

export default function ReferralPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card_ua" | "card_ru" | "bank_uk">("card_ua");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    bankAccount: "",
    sortCode: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadReferralData();
  }, [user]);

  const loadReferralData = async () => {
    try {
      const response = await fetch("/api/referral");
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error loading referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!data) return;
    const link = `${window.location.origin}?ref=${data.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Реферальная ссылка скопирована!");
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Введите корректную сумму");
      return;
    }

    if (parseFloat(withdrawAmount) > (data?.balance || 0)) {
      toast.error("Недостаточно средств");
      return;
    }

    // Валидация платёжных данных
    if (paymentMethod === "card_ua" || paymentMethod === "card_ru") {
      if (!paymentDetails.cardNumber || paymentDetails.cardNumber.length < 16) {
        toast.error("Введите корректный номер карты");
        return;
      }
    } else if (paymentMethod === "bank_uk") {
      if (!paymentDetails.bankAccount || !paymentDetails.sortCode) {
        toast.error("Введите все банковские данные");
        return;
      }
    }

    try {
      const response = await fetch("/api/referral/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          paymentMethod,
          paymentDetails:
            paymentMethod === "bank_uk"
              ? { bankAccount: paymentDetails.bankAccount, sortCode: paymentDetails.sortCode }
              : { cardNumber: paymentDetails.cardNumber },
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Заявка на вывод отправлена!");
        setShowWithdrawForm(false);
        setWithdrawAmount("");
        setPaymentDetails({ cardNumber: "", bankAccount: "", sortCode: "" });
        loadReferralData();
      } else {
        toast.error(result.error || "Ошибка при отправке заявки");
      }
    } catch (error) {
      toast.error("Ошибка сервера");
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  const referralLink = data ? `${window.location.origin}?ref=${data.referralCode}` : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            💰 Реферальная программа
          </h1>
          <p className="text-gray-300 text-lg">
            Зарабатывай <strong className="text-green-400">$50</strong> за каждого приглашённого друга!
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-900/20 to-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Ваш баланс</p>
                  <p className="text-3xl font-bold text-green-400">${data?.balance.toFixed(2) || "0.00"}</p>
                </div>
                <DollarSign className="h-12 w-12 text-green-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-cyan-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Всего рефералов</p>
                  <p className="text-3xl font-bold text-blue-400">{data?.totalReferrals || 0}</p>
                </div>
                <Users className="h-12 w-12 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Оплативших</p>
                  <p className="text-3xl font-bold text-purple-400">{data?.paidReferrals || 0}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-yellow-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Заработано</p>
                  <p className="text-3xl font-bold text-orange-400">${((data?.paidReferrals || 0) * 50).toFixed(2)}</p>
                </div>
                <CreditCard className="h-12 w-12 text-orange-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Реферальная ссылка */}
        <Card className="mb-8 border-2 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400">Ваша реферальная ссылка</CardTitle>
            <CardDescription>Поделитесь этой ссылкой и зарабатывайте $50 за каждого друга, который оплатит курс</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-green-500/30 rounded-lg text-white"
              />
              <Button onClick={copyReferralLink} className="bg-green-500 hover:bg-green-600">
                <Copy className="h-4 w-4 mr-2" />
                Скопировать
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Вывод средств */}
          <Card className="border-2 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-400">Вывод средств</CardTitle>
              <CardDescription>Минимальная сумма вывода: $50</CardDescription>
            </CardHeader>
            <CardContent>
              {!showWithdrawForm ? (
                <Button
                  onClick={() => setShowWithdrawForm(true)}
                  disabled={(data?.balance || 0) < 50}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Заказать выплату
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Сумма вывода ($)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={data?.balance || 0}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-blue-500/30 rounded-lg text-white"
                      placeholder="50.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Способ оплаты</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-blue-500/30 rounded-lg text-white"
                    >
                      <option value="card_ua">Карта (Украина)</option>
                      <option value="card_ru">Карта (Россия)</option>
                      <option value="bank_uk">Банк (UK)</option>
                    </select>
                  </div>

                  {paymentMethod === "card_ua" || paymentMethod === "card_ru" ? (
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-300">Номер карты</label>
                      <input
                        type="text"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-blue-500/30 rounded-lg text-white"
                        placeholder="1111 2222 3333 4444"
                        maxLength={19}
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-bold mb-2 text-gray-300">Account Number</label>
                        <input
                          type="text"
                          value={paymentDetails.bankAccount}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, bankAccount: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-blue-500/30 rounded-lg text-white"
                          placeholder="12345678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 text-gray-300">Sort Code</label>
                        <input
                          type="text"
                          value={paymentDetails.sortCode}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, sortCode: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-blue-500/30 rounded-lg text-white"
                          placeholder="12-34-56"
                          maxLength={8}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleWithdraw} className="flex-1 bg-green-500 hover:bg-green-600">
                      Отправить заявку
                    </Button>
                    <Button onClick={() => setShowWithdrawForm(false)} variant="outline" className="flex-1">
                      Отмена
                    </Button>
                  </div>
                </div>
              )}

              {/* История выводов */}
              {data && data.withdrawals && data.withdrawals.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-gray-300 mb-3">История выводов</h3>
                  <div className="space-y-2">
                    {data.withdrawals.map((w) => (
                      <div key={w.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                        <div>
                          <p className="text-white font-medium">${w.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {w.status === "pending" && <Clock className="h-4 w-4 text-yellow-400" />}
                          {w.status === "approved" && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                          {w.status === "rejected" && <AlertCircle className="h-4 w-4 text-red-400" />}
                          <span className="text-sm text-gray-300 capitalize">{w.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Список рефералов */}
          <Card className="border-2 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-400">Ваши рефералы</CardTitle>
              <CardDescription>Список приглашённых пользователей</CardDescription>
            </CardHeader>
            <CardContent>
              {data && data.referrals && data.referrals.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {data.referrals.map((ref, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border transition-all ${
                        ref.status === "paid" 
                          ? "bg-green-900/20 border-green-500/30 hover:border-green-500/50" 
                          : "bg-yellow-900/20 border-yellow-500/30 hover:border-yellow-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {ref.status === "paid" ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                              <UserCheck className="h-5 w-5 text-green-400" />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                              <Clock className="h-5 w-5 text-yellow-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{ref.email}</p>
                            <p className="text-xs text-gray-400">
                              Регистрация: {new Date(ref.createdAt).toLocaleDateString()}
                            </p>
                            {ref.status === "paid" && ref.paidAt && (
                              <p className="text-xs text-green-400">
                                Оплата: {new Date(ref.paidAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {ref.status === "paid" ? (
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1 text-green-400">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="text-lg font-bold">+$50</span>
                              </div>
                              <span className="text-xs text-green-300">Засчитан</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Clock className="h-5 w-5" />
                                <span className="text-sm font-medium">$0</span>
                              </div>
                              <span className="text-xs text-yellow-300">Ждём оплаты</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Пока нет рефералов. Поделитесь своей ссылкой!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
