import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  try {
    const { to, subject, html, type } = await request.json();

    // Check if Resend is configured
    if (!resend) {
      console.log('Resend not configured, skipping email send');
      return NextResponse.json({ 
        success: true, 
        message: 'Email sending is not configured yet' 
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'AI Learning Platform <onboarding@resend.dev>', // Замени на свой домен
      to,
      subject,
      html,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
