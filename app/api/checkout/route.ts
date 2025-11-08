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

export async function POST(request: NextRequest) {
  try {
    const { priceId, userEmail } = await request.json();
    console.log('💳 Payment request:', { priceId, userEmail });

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('⚠️ STRIPE_SECRET_KEY not configured - using MOCK mode');
      console.log('ℹ️ Set STRIPE_SECRET_KEY in Netlify environment variables');
      // Fallback to mock for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🎭 Returning mock session:', mockSessionId);
      return NextResponse.json({ 
        sessionId: mockSessionId,
        mock: true
      });
    }

    // Create real Stripe checkout session
    console.log('✅ Creating real Stripe session...');
    const stripe = getStripe();
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }
    
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment?canceled=true`,
      metadata: {
        userId: userEmail,
      },
    });

    console.log('✅ Stripe session created:', session.id);
    console.log('🔗 Checkout URL:', session.url);

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
      mock: false
    });
  } catch (error: any) {
    console.error('❌ Payment API error:', error);
    console.error('Error details:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
