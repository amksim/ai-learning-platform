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
    console.log('🔑 Stripe key length:', stripeKey ? stripeKey.length : 0);
    console.log('🔑 Stripe key starts with:', stripeKey ? stripeKey.substring(0, 7) : 'none');
    
    if (!stripeKey || stripeKey.trim() === '') {
      console.warn('⚠️ STRIPE_SECRET_KEY not configured - using MOCK mode');
      console.log('ℹ️ Set STRIPE_SECRET_KEY in Netlify environment variables');
      console.log('ℹ️ Go to: Site settings → Environment variables → Add variable');
      console.log('ℹ️ Name: STRIPE_SECRET_KEY');
      console.log('ℹ️ Value: sk_test_... or sk_live_...');
      
      // Fallback to mock for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/success?session_id=${mockSessionId}`;
      console.log('🎭 Returning mock session:', mockSessionId);
      
      return NextResponse.json({ 
        sessionId: mockSessionId,
        url: mockUrl,
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
    let errorMessage = error.message || 'Failed to create checkout session';
    let errorType = error.type || 'unknown_error';
    let userFriendlyMessage = errorMessage;
    
    if (error.type) {
      console.error('❌ Stripe error type:', error.type);
      
      // Provide user-friendly messages for common Stripe errors
      if (error.type === 'StripeInvalidRequestError') {
        if (error.message.includes('No such price')) {
          userFriendlyMessage = '❌ Неправильный Price ID в настройках Stripe. Проверьте NEXT_PUBLIC_STRIPE_PRICE_ID в переменных окружения.';
        } else if (error.message.includes('No such customer')) {
          userFriendlyMessage = '❌ Проблема с данными клиента в Stripe.';
        } else {
          userFriendlyMessage = `❌ Ошибка Stripe: ${error.message}`;
        }
      } else if (error.type === 'StripeAuthenticationError') {
        userFriendlyMessage = '❌ Неправильный Stripe API ключ. Проверьте STRIPE_SECRET_KEY в переменных окружения.';
      } else if (error.type === 'StripeAPIError') {
        userFriendlyMessage = '❌ Проблема с Stripe API. Попробуйте позже.';
      }
    }
    
    if (error.raw) {
      console.error('❌ Stripe raw error:', JSON.stringify(error.raw, null, 2));
    }
    
    console.error('📝 User-friendly message:', userFriendlyMessage);
    
    return NextResponse.json(
      { 
        error: userFriendlyMessage,
        details: errorType,
        originalError: errorMessage
      },
      { status: 500 }
    );
  }
}
