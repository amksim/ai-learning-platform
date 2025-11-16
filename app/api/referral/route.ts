import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  // Получаем токен из Authorization header
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.replace('Bearer ', '');
  
  if (!accessToken) {
    return NextResponse.json({ success: false, error: "No authorization token" }, { status: 401 });
  }
  
  console.log("🔑 Received token:", accessToken.substring(0, 20) + "...");
  
  // Создаём клиент с токеном пользователя
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );

  try {
    // Получаем текущего пользователя
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Получаем данные пользователя с реферальной информацией
    // Пробуем сначала users, потом profiles
    let userData, userError;
    let tableName = "";
    
    console.log("👤 User ID:", user.id);
    
    // СНАЧАЛА ПРОБУЕМ USERS
    const usersResponse = await supabase
      .from("users")
      .select("referral_code, balance, total_referrals, paid_referrals")
      .eq("id", user.id)
      .single();
    
    console.log("📊 Users table response:", usersResponse);
    
    if (usersResponse.data && !usersResponse.error) {
      userData = usersResponse.data;
      userError = usersResponse.error;
      tableName = "users";
      console.log("✅ Found user in 'users' table");
    } else {
      console.log("❌ User not found in 'users' table, trying 'profiles'...");
      
      // ЕСЛИ НЕ НАШЛИ, ПРОБУЕМ PROFILES
      const profilesResponse = await supabase
        .from("profiles")
        .select("referral_code, balance, total_referrals, paid_referrals")
        .eq("id", user.id)
        .single();
      
      console.log("📊 Profiles table response:", profilesResponse);
      
      userData = profilesResponse.data;
      userError = profilesResponse.error;
      tableName = "profiles";
      
      if (profilesResponse.data) {
        console.log("✅ Found user in 'profiles' table");
      }
    }

    console.log("📌 Final userData:", userData);
    console.log("📌 Table used:", tableName);
    console.log("📌 Referral code:", userData?.referral_code);

    if (userError || !userData) {
      console.error("❌ Error or no data:", userError);
      return NextResponse.json({ 
        success: false, 
        error: userError?.message || "User not found",
        debug: {
          userId: user.id,
          tableName,
          error: userError
        }
      }, { status: 500 });
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

    const responseData = {
      referralCode: userData.referral_code,
      balance: parseFloat(userData.balance) || 0,
      totalReferrals: userData.total_referrals || 0,
      paidReferrals: userData.paid_referrals || 0,
      referrals: referralsWithEmails,
      withdrawals: withdrawals || [],
    };
    
    console.log("📤 Sending response:", responseData);
    console.log("📤 referralCode value:", responseData.referralCode);
    console.log("📤 referralCode type:", typeof responseData.referralCode);
    
    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error in referral API:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
