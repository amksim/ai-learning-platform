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

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('Stripe not configured, using mock mode');
      // Fallback to mock for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return NextResponse.json({ 
        sessionId: mockSessionId,
        mock: true
      });
    }

    // Create real Stripe checkout session
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

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url, // URL for redirect to Stripe Checkout
      mock: false
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
