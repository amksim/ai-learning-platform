import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {

  try {
    // Получаем текущего пользователя
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Получаем данные пользователя с реферальной информацией
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("referral_code, balance, total_referrals, paid_referrals")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json({ success: false, error: userError.message }, { status: 500 });
    }

    // Получаем список рефералов
    const { data: referrals, error: referralsError } = await supabase
      .from("referrals")
      .select(
        `
        referred_id,
        status,
        created_at,
        paid_at
      `
      )
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });

    if (referralsError) {
      console.error("Error fetching referrals:", referralsError);
    }

    // Получаем email рефералов
    const referralsWithEmails = referrals
      ? await Promise.all(
          referrals.map(async (ref) => {
            const { data: refUser } = await supabase.from("users").select("email").eq("id", ref.referred_id).single();

            return {
              email: refUser?.email || "Unknown",
              status: ref.status,
              createdAt: ref.created_at,
              paidAt: ref.paid_at,
            };
          })
        )
      : [];

    // Получаем историю выводов
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from("withdrawal_requests")
      .select("id, amount, status, created_at, payment_method")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (withdrawalsError) {
      console.error("Error fetching withdrawals:", withdrawalsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        referralCode: userData.referral_code,
        balance: parseFloat(userData.balance) || 0,
        totalReferrals: userData.total_referrals || 0,
        paidReferrals: userData.paid_referrals || 0,
        referrals: referralsWithEmails,
        withdrawals: withdrawals || [],
      },
    });
  } catch (error) {
    console.error("Error in referral API:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
