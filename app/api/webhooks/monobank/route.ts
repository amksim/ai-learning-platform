import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Monobank Webhook для отримання статусу платежу
// Документація: https://api.monobank.ua/docs/acquiring.html

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('🏦 Monobank webhook отримано:', JSON.stringify(body, null, 2));

    const { invoiceId, status, reference, amount, ccy, finalAmount } = body;

    // Статуси Monobank:
    // created - рахунок створено
    // processing - платіж обробляється
    // hold - сума заблокована
    // success - платіж успішний
    // failure - платіж не вдався
    // reversed - платіж повернено
    // expired - рахунок протермінований

    if (status === 'success') {
      console.log('✅ Платіж успішний:', invoiceId);

      // Парсимо reference для отримання courseId
      // Формат: course_1_1234567890
      const parts = reference?.split('_') || [];
      const courseId = parts.length >= 2 ? parseInt(parts[1]) : null;

      // Оновлюємо профіль користувача
      // Потрібно знайти email з metadata або з окремого запиту
      
      // Для тестування: оновлюємо всіх з pending платежами
      // В продакшені потрібно зберігати invoiceId в базі при створенні
      
      console.log('📝 Курс ID:', courseId);
      console.log('💰 Сума:', finalAmount || amount, 'копійок');

      // Тут можна додати логіку оновлення підписки
      // Наприклад, зберегти invoiceId при створенні платежу
      // і потім знайти користувача за invoiceId

    } else if (status === 'failure') {
      console.log('❌ Платіж не вдався:', invoiceId);
    } else if (status === 'processing') {
      console.log('⏳ Платіж обробляється:', invoiceId);
    }

    // Monobank очікує 200 OK
    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('❌ Webhook помилка:', error);
    return NextResponse.json(
      { error: 'Помилка обробки webhook' },
      { status: 500 }
    );
  }
}

// Monobank може надсилати GET для перевірки
export async function GET() {
  return NextResponse.json({ status: 'Monobank webhook is active' });
}
