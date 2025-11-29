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
      const productId = payment.metadata?.productId;
      const courseId = payment.metadata?.courseId;

      console.log('✅ Payment succeeded for:', userEmail);
      console.log('💰 Amount:', payment.amount.value, payment.amount.currency);
      console.log('📦 Product:', productId, 'Course ID:', courseId);

      if (!userEmail) {
        console.error('❌ No userEmail in payment metadata');
        return NextResponse.json({ error: 'No user email' }, { status: 400 });
      }

      // Находим пользователя в profiles
      const { data: profile, error: findError } = await supabase
        .from('profiles')
        .select('id, paid_courses, subscription_status')
        .eq('email', userEmail)
        .single();

      if (findError || !profile) {
        console.error('❌ Profile not found:', userEmail);
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      // Определяем какие курсы добавить
      let newPaidCourses: number[] = profile.paid_courses || [];
      
      if (courseId === 'all') {
        // Все курсы - добавляем 1, 2, 3, 4
        newPaidCourses = [1, 2, 3, 4];
      } else {
        // Один курс
        const courseIdNum = parseInt(courseId);
        if (!newPaidCourses.includes(courseIdNum)) {
          newPaidCourses = [...newPaidCourses, courseIdNum];
        }
      }

      // Обновляем профиль
      const isPremium = newPaidCourses.length === 4; // Если все 4 курса - premium
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          paid_courses: newPaidCourses,
          subscription_status: isPremium ? 'premium' : 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error('❌ Failed to update profile:', updateError);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }

      console.log('🎉 Access activated:', userEmail, 'Courses:', newPaidCourses);

      // Логируем платеж
      try {
        await supabase.from('payment_logs').insert({
          user_id: profile.id,
          payment_id: payment.id,
          amount: parseFloat(payment.amount.value),
          currency: payment.amount.currency,
          status: 'succeeded',
          payment_method: 'yookassa',
          product_id: productId,
          created_at: new Date().toISOString()
        });
      } catch (logError) {
        console.log('ℹ️ Payment log not saved:', logError);
      }

      return NextResponse.json({ 
        status: 'success',
        message: 'Access activated',
        courses: newPaidCourses
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
