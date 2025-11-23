import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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
    const formData = await request.formData();
    const data = formData.get('data') as string;
    const signature = formData.get('signature') as string;

    console.log('🔔 LiqPay webhook received');

    if (!data || !signature) {
      console.error('❌ Missing data or signature');
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Проверяем подпись
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ LiqPay private key not configured');
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const signString = privateKey + data + privateKey;
    const expectedSignature = crypto
      .createHash('sha1')
      .update(signString)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error('❌ Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Декодируем данные
    const paymentData = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
    
    console.log('💳 LiqPay payment status:', paymentData.status);
    console.log('📦 Order ID:', paymentData.order_id);

    // Обрабатываем только успешные платежи
    if (paymentData.status === 'success' || paymentData.status === 'sandbox') {
      const info = typeof paymentData.info === 'string' 
        ? JSON.parse(paymentData.info) 
        : paymentData.info;
      
      const userEmail = info?.userEmail || paymentData.customer;

      console.log('✅ Payment succeeded for:', userEmail);
      console.log('💰 Amount:', paymentData.amount, paymentData.currency);

      if (!userEmail) {
        console.error('❌ No userEmail in payment data');
        return NextResponse.json({ error: 'No user email' }, { status: 400 });
      }

      // Находим пользователя
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

      // Активируем доступ
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

      // Логируем платеж
      const { error: logError } = await supabase.from('payment_logs').insert({
        user_id: user.id,
        payment_id: paymentData.payment_id || paymentData.order_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'succeeded',
        payment_method: 'liqpay',
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

    if (paymentData.status === 'failure' || paymentData.status === 'error') {
      console.log('❌ Payment failed:', paymentData.order_id);
      return NextResponse.json({ status: 'failed' });
    }

    // Другие статусы просто подтверждаем
    console.log('ℹ️ Payment status:', paymentData.status);
    return NextResponse.json({ status: 'received' });

  } catch (error: any) {
    console.error('❌ LiqPay webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
