"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, Clock, DollarSign, Users, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Withdrawal {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  payment_details: any;
  userEmail: string;
  userName: string;
  referredUsers: string[];
  referralsCount: number;
  admin_notes?: string;
}

export default function WithdrawalsManager() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      const response = await fetch("/api/admin/withdrawals");
      const result = await response.json();
      if (result.success) {
        setWithdrawals(result.data);
      }
    } catch (error) {
      console.error("Error loading withdrawals:", error);
      toast.error("Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: "approved" | "rejected", notes: string = "") => {
    setProcessing(id);
    try {
      const response = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, adminNotes: notes }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(status === "approved" ? "Заявка одобрена!" : "Заявка отклонена");
        loadWithdrawals();
      } else {
        toast.error(result.error || "Ошибка обновления");
      }
    } catch (error) {
      toast.error("Ошибка сервера");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
            <Clock className="h-4 w-4" />
            Ожидает
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Одобрено
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
            <XCircle className="h-4 w-4" />
            Отклонено
          </span>
        );
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "card_ua":
        return "🇺🇦 Карта Украина";
      case "card_ru":
        return "🇷🇺 Карта Россия";
      case "bank_uk":
        return "🇬🇧 Банк UK";
      default:
        return method;
    }
  };

  if (loading) {
    return <div className="text-white text-center py-8">Загрузка...</div>;
  }

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const processedWithdrawals = withdrawals.filter((w) => w.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-500/30 bg-yellow-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ожидают</p>
                <p className="text-3xl font-bold text-yellow-400">{pendingWithdrawals.length}</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Одобрено</p>
                <p className="text-3xl font-bold text-green-400">
                  {processedWithdrawals.filter((w) => w.status === "approved").length}
                </p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Сумма ожидания</p>
                <p className="text-3xl font-bold text-blue-400">
                  ${pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ожидающие заявки */}
      {pendingWithdrawals.length > 0 && (
        <Card className="border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-yellow-400">Ожидают обработки ({pendingWithdrawals.length})</CardTitle>
            <CardDescription>Новые заявки на вывод средств</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingWithdrawals.map((w) => (
                <div key={w.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-purple-400" />
                        <span className="text-white font-bold">{w.userName}</span>
                        <span className="text-gray-400 text-sm">({w.userEmail})</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Сумма вывода</p>
                          <p className="text-2xl font-bold text-green-400">${w.amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Рефералов оплатило</p>
                          <p className="text-2xl font-bold text-blue-400">{w.referralsCount}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Способ оплаты</p>
                        <p className="text-white">{getPaymentMethodLabel(w.payment_method)}</p>
                        <div className="mt-1 p-2 bg-gray-900/50 rounded text-sm text-gray-300">
                          {w.payment_method === "bank_uk" ? (
                            <>
                              <p>Account: {w.payment_details.bankAccount}</p>
                              <p>Sort Code: {w.payment_details.sortCode}</p>
                            </>
                          ) : (
                            <p>Карта: {w.payment_details.cardNumber}</p>
                          )}
                        </div>
                      </div>

                      {w.referredUsers.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Приглашённые пользователи:</p>
                          <div className="flex flex-wrap gap-1">
                            {w.referredUsers.map((email, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                                {email}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        Создано: {new Date(w.created_at).toLocaleString("ru-RU")}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 md:min-w-[150px]">
                      <Button
                        onClick={() => handleStatusUpdate(w.id, "approved")}
                        disabled={processing === w.id}
                        className="bg-green-500 hover:bg-green-600 w-full"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Одобрить
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(w.id, "rejected", "Отклонено администратором")}
                        disabled={processing === w.id}
                        variant="outline"
                        className="border-red-500/30 hover:bg-red-500/10 w-full"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Отклонить
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Обработанные заявки */}
      {processedWithdrawals.length > 0 && (
        <Card className="border-gray-500/30">
          <CardHeader>
            <CardTitle className="text-gray-300">История ({processedWithdrawals.length})</CardTitle>
            <CardDescription>Обработанные заявки</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {processedWithdrawals.map((w) => (
                <div key={w.id} className="p-3 bg-gray-800/20 rounded-lg border border-gray-700/50 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-white font-medium">{w.userName}</span>
                      <span className="text-gray-500 ml-2">{w.userEmail}</span>
                    </div>
                    {getStatusBadge(w.status)}
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>${w.amount.toFixed(2)}</span>
                    <span>{new Date(w.created_at).toLocaleDateString("ru-RU")}</span>
                  </div>
                  {w.admin_notes && (
                    <div className="mt-2 p-2 bg-gray-900/50 rounded text-xs text-gray-400">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      {w.admin_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {withdrawals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Пока нет заявок на вывод средств</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
