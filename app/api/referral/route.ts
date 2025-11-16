import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
    // Пробуем сначала profiles, потом users
    let userData, userError;
    
    const profilesResponse = await supabase
      .from("profiles")
      .select("referral_code, balance, total_referrals, paid_referrals")
      .eq("id", user.id)
      .single();
    
    if (profilesResponse.data) {
      userData = profilesResponse.data;
      userError = profilesResponse.error;
    } else {
      const usersResponse = await supabase
        .from("users")
        .select("referral_code, balance, total_referrals, paid_referrals")
        .eq("id", user.id)
        .single();
      userData = usersResponse.data;
      userError = usersResponse.error;
    }

    if (userError || !userData) {
      return NextResponse.json({ success: false, error: userError?.message || "User not found" }, { status: 500 });
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

    // Получаем email рефералов (проверяем profiles и users)
    const referralsWithEmails = referrals
      ? await Promise.all(
          referrals.map(async (ref) => {
            // Пробуем profiles
            let refUser = await supabase.from("profiles").select("email").eq("id", ref.referred_id).single();
            
            // Если нет в profiles, пробуем users
            if (!refUser.data) {
              refUser = await supabase.from("users").select("email").eq("id", ref.referred_id).single();
            }

            return {
              email: refUser.data?.email || "Unknown",
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
