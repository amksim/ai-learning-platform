import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(url, key);
}

// POST - отправка промо-видео на проверку
export async function POST(request: Request) {
  try {
    const { userEmail, videoUrl } = await request.json();

    if (!userEmail || !videoUrl) {
      return NextResponse.json(
        { error: 'Email and video URL are required' },
        { status: 400 }
      );
    }

    // Проверяем что URL валидный
    const isValidUrl = videoUrl.includes('youtube.com') || 
                       videoUrl.includes('youtu.be') || 
                       videoUrl.includes('tiktok.com') || 
                       videoUrl.includes('instagram.com');

    if (!isValidUrl) {
      return NextResponse.json(
        { error: 'Please provide a valid YouTube, TikTok or Instagram URL' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    
    // Сохраняем запрос в базу
    const { data, error } = await supabase
      .from('promo_videos')
      .insert({
        user_email: userEmail,
        video_url: videoUrl,
        status: 'pending', // pending, approved, rejected
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving promo video:', error);
      return NextResponse.json(
        { error: 'Failed to submit promo video' },
        { status: 500 }
      );
    }

    console.log('✅ Promo video submitted:', data);

    return NextResponse.json({
      success: true,
      message: 'Video submitted for review',
      id: data.id
    });

  } catch (error: any) {
    console.error('Error in promo-video API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - получение списка промо-видео (для админки)
export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const { data, error } = await supabase
      .from('promo_videos')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching promo videos:', error);
      return NextResponse.json(
        { error: 'Failed to fetch promo videos' },
        { status: 500 }
      );
    }

    return NextResponse.json({ videos: data || [] });

  } catch (error: any) {
    console.error('Error in promo-video API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - одобрение/отклонение промо-видео (админ)
export async function PATCH(request: Request) {
  try {
    const supabase = getSupabase();
    const { id, status, userEmail } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    // Обновляем статус
    const { data, error } = await supabase
      .from('promo_videos')
      .update({ 
        status,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating promo video:', error);
      return NextResponse.json(
        { error: 'Failed to update promo video' },
        { status: 500 }
      );
    }

    // Если одобрено - даём пользователю скидку
    if (status === 'approved' && userEmail) {
      await supabase
        .from('users')
        .update({ has_promo_discount: true })
        .eq('email', userEmail);

      console.log('✅ Promo discount granted to:', userEmail);
    }

    return NextResponse.json({
      success: true,
      message: status === 'approved' ? 'Video approved, discount granted!' : 'Video rejected',
      data
    });

  } catch (error: any) {
    console.error('Error in promo-video API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
