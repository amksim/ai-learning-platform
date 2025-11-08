import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Initialize Stripe only if key is available
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
  });
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('Stripe not configured, using mock mode');
      // Fallback to mock for development
      return NextResponse.json({
        status: 'paid',
        customer_email: 'user@example.com',
        paid: true,
        mock: true
      });
    }

    // Retrieve real Stripe session with timeout
    const stripe = getStripe();
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }
    
    // Add timeout to Stripe API call
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Stripe API timeout')), 10000)
    );
    
    const sessionPromise = stripe.checkout.sessions.retrieve(sessionId);
    
    const session = await Promise.race([sessionPromise, timeoutPromise]) as Stripe.Checkout.Session;

    return NextResponse.json({
      status: session.payment_status,
      customer_email: session.customer_details?.email || session.customer_email,
      paid: session.payment_status === 'paid',
      mock: false
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
