import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Получить все заявки на вывод
export async function GET(request: NextRequest) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Проверяем что это админ
    const { data: userData } = await supabase.from("users").select("email").eq("id", user.id).single();

    if (!userData || userData.email?.toLowerCase() !== "kmak4551@gmail.com") {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    // Получаем все заявки на вывод
    const { data: withdrawals, error } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Получаем информацию о пользователях и их рефералах
    const withdrawalsWithDetails = await Promise.all(
      (withdrawals || []).map(async (w: any) => {
        const { data: userInfo } = await supabase.from("users").select("email, full_name").eq("id", w.user_id).single();

        const { data: referrals } = await supabase
          .from("referrals")
          .select("referred_id, status")
          .eq("referrer_id", w.user_id)
          .eq("status", "paid");

        const referredUsers = referrals
          ? await Promise.all(
              referrals.map(async (ref: any) => {
                const { data: refUser } = await supabase
                  .from("users")
                  .select("email")
                  .eq("id", ref.referred_id)
                  .single();
                return refUser?.email || "Unknown";
              })
            )
          : [];

        return {
          ...w,
          userEmail: userInfo?.email || "Unknown",
          userName: userInfo?.full_name || "Unknown",
          referredUsers,
          referralsCount: referrals?.length || 0,
        };
      })
    );

    return NextResponse.json({ success: true, data: withdrawalsWithDetails });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// Одобрить или отклонить заявку
export async function PATCH(request: NextRequest) {
  try {
    const { id, status, adminNotes } = await request.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Проверяем что это админ
    const { data: userData } = await supabase.from("users").select("email").eq("id", user.id).single();

    if (!userData || userData.email?.toLowerCase() !== "kmak4551@gmail.com") {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    // Получаем заявку
    const { data: withdrawal, error: fetchError } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !withdrawal) {
      return NextResponse.json({ success: false, error: "Withdrawal not found" }, { status: 404 });
    }

    // Если отклоняем - возвращаем деньги на баланс
    if (status === "rejected" && withdrawal.status === "pending") {
      const { error: balanceError } = await supabase.rpc("refund_withdrawal", {
        p_user_id: withdrawal.user_id,
        p_amount: withdrawal.amount,
      });

      if (balanceError) {
        console.error("Error refunding:", balanceError);
      }
    }

    // Обновляем статус заявки
    const { error: updateError } = await supabase
      .from("withdrawal_requests")
      .update({
        status,
        admin_notes: adminNotes,
        processed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating withdrawal:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
