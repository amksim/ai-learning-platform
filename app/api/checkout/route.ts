import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Initialize Stripe only if key is available
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('⚠️ STRIPE_SECRET_KEY not found in environment');
    return null;
  }
  try {
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia' as any,
    });
  } catch (error: any) {
    console.error('❌ Failed to initialize Stripe:', error.message);
    return null;
  }
};

export async function POST(request: NextRequest) {
  console.log('🔵 API /checkout called');
  
  try {
    // Parse request body
    let priceId, userEmail;
    try {
      const body = await request.json();
      priceId = body.priceId;
      userEmail = body.userEmail;
      console.log('💳 Payment request:', { priceId, userEmail });
    } catch (parseError: any) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate inputs
    if (!priceId || !userEmail) {
      console.error('❌ Missing required fields:', { priceId, userEmail });
      return NextResponse.json(
        { error: 'Missing priceId or userEmail' },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    console.log('🔑 Stripe key present:', !!stripeKey);
    
    if (!stripeKey) {
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
    console.log('✅ Initializing Stripe...');
    const stripe = getStripe();
    
    if (!stripe) {
      console.error('❌ Failed to initialize Stripe');
      return NextResponse.json(
        { error: 'Failed to initialize Stripe' },
        { status: 500 }
      );
    }

    console.log('✅ Creating Stripe checkout session...');
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.NEXTAUTH_URL || 
                    'https://ai-learning45.netlify.app';
    
    console.log('🌐 Base URL:', baseUrl);
    
    const sessionParams: any = {
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment?canceled=true`,
      metadata: {
        userId: userEmail,
      },
    };
    
    console.log('📝 Session params:', JSON.stringify(sessionParams, null, 2));
    
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('✅ Stripe session created:', session.id);
    console.log('🔗 Checkout URL:', session.url);

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
      mock: false
    });
    
  } catch (error: any) {
    console.error('❌ Payment API error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Extract more details from Stripe errors
    if (error.type) {
      console.error('❌ Stripe error type:', error.type);
    }
    if (error.raw) {
      console.error('❌ Stripe raw error:', JSON.stringify(error.raw, null, 2));
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        details: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}
