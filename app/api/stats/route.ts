import { NextResponse } from "next/server";

// Простое хранилище для статистики (в production лучше использовать базу данных)
let stats = {
  totalUsers: 147,
  activeStudents: 89,
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json(stats);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.totalUsers !== undefined) {
      stats.totalUsers = Number(body.totalUsers);
    }
    
    if (body.activeStudents !== undefined) {
      stats.activeStudents = Number(body.activeStudents);
    }
    
    stats.lastUpdated = new Date().toISOString();
    
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}
