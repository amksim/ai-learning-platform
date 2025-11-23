import { NextResponse } from 'next/server';

// YooKassa (ЮMoney) - для России + СБП
export async function POST(request: Request) {
  try {
    const { userEmail, amount = 399 } = await request.json();

    console.log('🇷🇺 Creating YooKassa payment for:', userEmail);

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      console.error('❌ YooKassa credentials not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Создаем платеж в YooKassa
    const paymentData = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB' // Рубли для России
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-learning45.netlify.app'}/payment/success`
      },
      capture: true, // Автоматическое списание
      description: `AI Learning Platform - Full Course Access for ${userEmail}`,
      metadata: {
        userEmail,
        product: 'full_course_access'
      }
    };

    // Авторизация через Basic Auth
    const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': `${userEmail}-${Date.now()}` // Защита от дублей
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ YooKassa API error:', errorData);
      throw new Error(errorData.description || 'Payment creation failed');
    }

    const payment = await response.json();
    console.log('✅ YooKassa payment created:', payment.id);

    // Возвращаем URL для редиректа
    return NextResponse.json({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url,
      status: payment.status
    });

  } catch (error: any) {
    console.error('❌ YooKassa payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
