import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  // Используем SERVICE ROLE KEY для обхода RLS в админских операциях
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// GET - получить все курсы
export async function GET() {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Фильтруем курсы - только полные с обязательными полями
    const filteredCourses = (data || []).filter(course => {
      // Проверяем обязательные поля
      if (!course.title || !course.description || !course.difficulty) {
        console.log('🚫 Фильтрую курс без обязательных полей:', course.id, course.title);
        return false;
      }
      
      // Проверяем что есть хотя бы изображения или видео
      const hasImages = Array.isArray(course.images) && course.images.length > 0;
      const hasVideos = Array.isArray(course.videos) && course.videos.length > 0;
      
      if (!hasImages && !hasVideos) {
        console.log('🚫 Фильтрую курс без контента:', course.id, course.title);
        return false;
      }
      
      // Проверяем что title не пустая строка и не просто пробелы
      if (course.title.trim().length === 0) {
        console.log('🚫 Фильтрую курс с пустым title:', course.id);
        return false;
      }
      
      return true;
    });

    console.log(`✅ Отфильтровано курсов: ${filteredCourses.length} из ${data?.length || 0}`);
    
    return NextResponse.json({ courses: filteredCourses });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - создать новый курс
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const body = await request.json();
    
    console.log('➕ Creating new course');
    console.log('📦 Data keys:', Object.keys(body));
    console.log('🎬 Videos count:', body.videos?.length || 0);
    console.log('📸 Images count:', body.images?.length || 0);
    
    const { data, error } = await supabase
      .from('courses')
      .insert([body])
      .select();

    if (error) {
      console.error('❌ Error creating course:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Course created successfully');
    return NextResponse.json({ course: data?.[0] || data });
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - обновить курс
export async function PUT(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    console.log('📝 Updating course:', id);
    console.log('📦 Updates keys:', Object.keys(updates));
    console.log('🎬 Videos count:', updates.videos?.length || 0);
    console.log('📸 Images count:', updates.images?.length || 0);
    console.log('📸 Images data:', JSON.stringify(updates.images));

    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error updating course:', error);
      console.error('❌ Error details:', JSON.stringify(error));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Course updated successfully');
    console.log('✅ Updated data images:', data?.[0]?.images);
    return NextResponse.json({ course: data?.[0] || data });
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - удалить курс
export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting course:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
