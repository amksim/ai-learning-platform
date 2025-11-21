import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
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

// GET - получить все категории курсов
export async function GET() {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('course_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching course categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: data || [] });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - обновить статистику категории
export async function PUT(request: Request) {
  const supabase = getSupabaseClient();
  try {
    const body = await request.json();
    const { id, video_minutes, text_pages, practice_tasks } = body;

    console.log('📝 Updating course category stats:', { id, video_minutes, text_pages, practice_tasks });

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Создаём объект только с теми полями, которые были переданы
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (video_minutes !== undefined) updateData.video_minutes = video_minutes;
    if (text_pages !== undefined) updateData.text_pages = text_pages;
    if (practice_tasks !== undefined) updateData.practice_tasks = practice_tasks;

    console.log('📦 Update data:', updateData);

    const { data, error } = await supabase
      .from('course_categories')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error updating category:', error);
      console.error('❌ Error details:', JSON.stringify(error));
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    console.log('✅ Category updated successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
