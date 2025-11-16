import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-10-29.clover',
  });

  // Supabase с service role для записи
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Обработка событий
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Находим пользователя по email
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', session.customer_details?.email)
        .single();

      if (profile) {
        // Определяем тип подписки
        const amount = session.amount_total || 0;
        const subscriptionType = amount >= 9999 ? 'yearly' : 'monthly';

        // Записываем платёж
        await supabaseAdmin.from('payments').insert({
          user_id: profile.id,
          stripe_payment_id: session.id,
          amount: amount,
          currency: session.currency || 'usd',
          status: 'succeeded',
          subscription_type: subscriptionType,
        });

        // Обновляем профиль
        const subscriptionEndDate = new Date();
        if (subscriptionType === 'monthly') {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        } else {
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        }

        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'premium',
            subscription_end_date: subscriptionEndDate.toISOString(),
            stripe_customer_id: session.customer as string,
          })
          .eq('id', profile.id);

        console.log('✅ Payment recorded for user:', profile.email);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Находим пользователя по Stripe customer ID
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('stripe_customer_id', subscription.customer as string)
        .single();

      if (profile) {
        // Отменяем подписку
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'free',
            subscription_end_date: null,
          })
          .eq('id', profile.id);

        console.log('❌ Subscription cancelled for user:', profile.email);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      
      // Записываем неудачный платёж
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('stripe_customer_id', invoice.customer as string)
        .single();

      if (profile) {
        await supabaseAdmin.from('payments').insert({
          user_id: profile.id,
          stripe_payment_id: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: 'failed',
        });

        console.log('⚠️ Payment failed for user:', profile.email);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
