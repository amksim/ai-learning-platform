import { NextResponse } from 'next/server';
import crypto from 'crypto';

// LiqPay - для Украины
export async function POST(request: Request) {
  try {
    const { userEmail, amount = 399 } = await request.json();

    console.log('🇺🇦 Creating LiqPay payment for:', userEmail);

    const publicKey = process.env.LIQPAY_PUBLIC_KEY;
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      console.error('❌ LiqPay credentials not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Создаем параметры платежа
    const orderId = `order_${Date.now()}_${userEmail.split('@')[0]}`;
    
    const paymentData = {
      version: 3,
      public_key: publicKey,
      action: 'pay',
      amount: amount,
      currency: 'USD', // USD для международных платежей
      description: `AI Learning Platform - Full Course Access for ${userEmail}`,
      order_id: orderId,
      result_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-learning45.netlify.app'}/payment/success`,
      server_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-learning45.netlify.app'}/api/webhooks/liqpay`,
      language: 'uk', // Украинский язык
      customer: userEmail,
      info: JSON.stringify({
        userEmail,
        product: 'full_course_access'
      })
    };

    // Кодируем данные в base64
    const dataString = JSON.stringify(paymentData);
    const data = Buffer.from(dataString).toString('base64');

    // Создаем подпись
    const signString = privateKey + data + privateKey;
    const signature = crypto
      .createHash('sha1')
      .update(signString)
      .digest('base64');

    console.log('✅ LiqPay payment data prepared:', orderId);

    // Возвращаем данные для формы
    return NextResponse.json({
      data,
      signature,
      publicKey,
      orderId,
      // URL для отправки формы
      checkoutUrl: 'https://www.liqpay.ua/api/3/checkout'
    });

  } catch (error: any) {
    console.error('❌ LiqPay payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
