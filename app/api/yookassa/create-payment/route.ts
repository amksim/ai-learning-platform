import { NextResponse } from 'next/server';

// Продукты и цены в рублях
const PRODUCTS: Record<string, { price: number; discountPrice: number; name: string; courseId: number | 'all' }> = {
  'websites': { price: 25000, discountPrice: 17500, name: 'Курс "Сайты"', courseId: 1 },
  'apps': { price: 25000, discountPrice: 17500, name: 'Курс "Приложения"', courseId: 2 },
  'games': { price: 25000, discountPrice: 17500, name: 'Курс "Игры"', courseId: 3 },
  'payments': { price: 5000, discountPrice: 3500, name: 'Курс "Платёжные системы"', courseId: 4 },
  'all': { price: 37000, discountPrice: 37000, name: 'Все курсы', courseId: 'all' },
};

// YooKassa (ЮMoney) - для России + СБП
export async function POST(request: Request) {
  try {
    const { userEmail, productId, hasDiscount } = await request.json();

    console.log('🇷🇺 Creating YooKassa payment for:', userEmail, 'Product:', productId);

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      console.error('❌ YooKassa credentials not configured');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Получаем продукт
    const product = PRODUCTS[productId];
    if (!product) {
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      );
    }

    // Цена со скидкой или без
    const amountRUB = hasDiscount ? product.discountPrice : product.price;

    // Создаем платеж в YooKassa
    const paymentData = {
      amount: {
        value: amountRUB.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-learning45.netlify.app'}/payment/success?product=${productId}`
      },
      capture: true, // Автоматическое списание
      description: `AI Learning Platform - ${product.name} for ${userEmail}`,
      metadata: {
        userEmail,
        productId,
        courseId: String(product.courseId),
        hasDiscount: String(hasDiscount)
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
