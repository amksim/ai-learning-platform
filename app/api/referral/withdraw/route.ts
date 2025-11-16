import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  // Получаем токен из cookies
  const cookieStore = cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value || 
                      cookieStore.get('supabase-auth-token')?.value;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: accessToken ? {
          Authorization: `Bearer ${accessToken}`
        } : {}
      }
    }
  );

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Получаем данные из запроса
    const { amount, paymentMethod, paymentDetails } = await request.json();

    // Проверяем баланс
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const balance = parseFloat(userData.balance) || 0;

    if (amount > balance) {
      return NextResponse.json({ success: false, error: "Insufficient balance" }, { status: 400 });
    }

    if (amount < 50) {
      return NextResponse.json({ success: false, error: "Minimum withdrawal amount is $50" }, { status: 400 });
    }

    // Создаём заявку на вывод
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawal_requests")
      .insert({
        user_id: user.id,
        amount: amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: "pending",
      })
      .select()
      .single();

    if (withdrawalError) {
      return NextResponse.json({ success: false, error: withdrawalError.message }, { status: 500 });
    }

    // Вычитаем сумму из баланса (резервируем)
    const { error: updateError } = await supabase
      .from("users")
      .update({ balance: balance - amount })
      .eq("id", user.id);

    if (updateError) {
      // Откатываем заявку если не удалось обновить баланс
      await supabase.from("withdrawal_requests").delete().eq("id", withdrawal.id);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: withdrawal,
    });
  } catch (error) {
    console.error("Error in withdrawal API:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
