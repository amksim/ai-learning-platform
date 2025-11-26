import { NextRequest, NextResponse } from 'next/server';

// Monobank Acquiring API
// Документация: https://api.monobank.ua/docs/acquiring.html

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, amount, courseId, courseName, currency = 'UAH' } = body;

    console.log('🏦 Monobank: створення платежу', { userEmail, amount, courseId, courseName });

    const monoToken = process.env.MONOBANK_TOKEN;
    
    if (!monoToken) {
      console.error('❌ MONOBANK_TOKEN не налаштовано');
      return NextResponse.json(
        { error: 'Платіжна система не налаштована' },
        { status: 500 }
      );
    }

    // Конвертуємо суму в копійки (мінімальні одиниці)
    // Якщо amount в доларах, конвертуємо в гривні (курс ~41)
    const uahAmount = currency === 'USD' ? Math.round(amount * 41) : amount;
    const amountInKopecks = Math.round(uahAmount * 100);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-learning45.netlify.app';

    // Створюємо рахунок через Monobank API
    const response = await fetch('https://api.monobank.ua/api/merchant/invoice/create', {
      method: 'POST',
      headers: {
        'X-Token': monoToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInKopecks,
        ccy: 980, // Код гривні (UAH)
        merchantPaymInfo: {
          reference: `course_${courseId}_${Date.now()}`,
          destination: courseName || 'AI Learning Platform - Курс',
          comment: `Оплата курсу: ${courseName || 'AI Learning'}`,
          customerEmails: userEmail ? [userEmail] : [],
        },
        redirectUrl: `${baseUrl}/payment/success?provider=monobank&courseId=${courseId}&email=${encodeURIComponent(userEmail || '')}`,
        webHookUrl: `${baseUrl}/api/webhooks/monobank`,
        validity: 3600, // 1 година
        paymentType: 'debit',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Monobank помилка:', data);
      return NextResponse.json(
        { error: data.errText || 'Помилка створення платежу' },
        { status: response.status }
      );
    }

    console.log('✅ Monobank рахунок створено:', data.invoiceId);

    // Повертаємо URL для оплати
    return NextResponse.json({
      url: data.pageUrl,
      invoiceId: data.invoiceId,
    });

  } catch (error) {
    console.error('❌ Monobank помилка:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
