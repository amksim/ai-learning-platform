import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Проверяем что это админ
    if (email.toLowerCase() !== 'kmak4551@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    console.log('🔄 Сброс подписки для:', email);
    
    // Обновляем has_paid на false в Supabase
    const { data, error } = await supabase
      .from('profiles')
      .update({ has_paid: false })
      .eq('email', email)
      .select();
    
    if (error) {
      console.error('❌ Ошибка обновления Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ Подписка сброшена в Supabase:', data);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription reset successfully',
      data 
    });
    
  } catch (error: any) {
    console.error('❌ Ошибка сброса подписки:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
