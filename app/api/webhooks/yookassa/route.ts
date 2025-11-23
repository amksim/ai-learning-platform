import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request: Request) {
  const supabase = getSupabaseClient();
  try {
    const event = await request.json();
    
    console.log('🔔 YooKassa webhook received:', event.event);

    // Проверяем тип события
    if (event.event === 'payment.succeeded') {
      const payment = event.object;
      const userEmail = payment.metadata?.userEmail;

      console.log('✅ Payment succeeded for:', userEmail);
      console.log('💰 Amount:', payment.amount.value, payment.amount.currency);

      if (!userEmail) {
        console.error('❌ No userEmail in payment metadata');
        return NextResponse.json({ error: 'No user email' }, { status: 400 });
      }

      // Активируем доступ пользователю
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('id, has_paid')
        .eq('email', userEmail)
        .single();

      if (findError || !user) {
        console.error('❌ User not found:', userEmail);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Если уже оплачено - пропускаем
      if (user.has_paid) {
        console.log('ℹ️ User already has access');
        return NextResponse.json({ status: 'already_paid' });
      }

      // Обновляем статус пользователя
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          has_paid: true,
          subscription_status: 'active',
          payment_date: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Failed to update user:', updateError);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }

      console.log('🎉 User access activated:', userEmail);

      // Логируем платеж (опционально - создайте таблицу payments если нужно)
      const { error: logError } = await supabase.from('payment_logs').insert({
        user_id: user.id,
        payment_id: payment.id,
        amount: payment.amount.value,
        currency: payment.amount.currency,
        status: 'succeeded',
        payment_method: 'yookassa',
        created_at: new Date().toISOString()
      });
      
      if (logError) {
        console.log('ℹ️ Payment log not saved (table might not exist):', logError.message);
      }

      return NextResponse.json({ 
        status: 'success',
        message: 'User access activated'
      });
    }

    if (event.event === 'payment.canceled') {
      console.log('❌ Payment canceled:', event.object.id);
      return NextResponse.json({ status: 'canceled' });
    }

    // Другие события просто подтверждаем
    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    console.error('❌ YooKassa webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
