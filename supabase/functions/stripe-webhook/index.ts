import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get webhook signature
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response('Missing signature', { status: 400 })
    }

    // Get webhook secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      return new Response('Webhook secret not configured', { status: 500 })
    }

    // Get request body
    const body = await req.text()

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Log webhook for audit trail
    await supabaseClient
      .from('payment_webhooks_log')
      .insert({
        provider: 'stripe',
        event_type: event.type,
        payload: JSON.parse(body),
        verified: true,
        processed: false,
      })

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Check if already processed
        const { data: existingLog } = await supabaseClient
          .from('payment_webhooks_log')
          .select('*')
          .eq('payload->>id', paymentIntent.id)
          .eq('processed', true)
          .single()

        if (existingLog) {
          console.log('Payment intent already processed:', paymentIntent.id)
          return new Response('OK')
        }

        // Find matching transaction
        const { data: transaction, error: transactionError } = await supabaseClient
          .from('payment_transactions')
          .select('*')
          .eq('provider_transaction_id', paymentIntent.id)
          .eq('status', 'pending')
          .single()

        if (transactionError || !transaction) {
          console.log('Transaction not found for payment intent:', paymentIntent.id)
          return new Response('OK')
        }

        // Extract plan from metadata
        const plan = paymentIntent.metadata?.plan || 'monthly'
        const amount = paymentIntent.amount / 100 // Convert from cents

        // Update transaction status
        await supabaseClient
          .from('payment_transactions')
          .update({
            status: 'completed',
            provider_response: {
              paymentIntentId: paymentIntent.id,
              chargeId: paymentIntent.charges?.data[0]?.id,
              amount: amount,
              currency: paymentIntent.currency,
              status: paymentIntent.status,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', transaction.id)

        // Activate membership
        const planDays = {
          monthly: 30,
          quarterly: 90,
          annual: 365,
        }

        const days = planDays[plan as keyof typeof planDays] || 30

        const { error: activationError } = await supabaseClient.rpc('activate_membership', {
          p_user_id: transaction.user_id,
          p_plan: plan,
          p_payment_method: 'card',
          p_transaction_id: transaction.id,
          p_days: days,
        })

        if (activationError) {
          console.error('Membership activation error:', activationError)
        }

        // Mark webhook as processed
        await supabaseClient
          .from('payment_webhooks_log')
          .update({ processed: true })
          .eq('payload->>id', paymentIntent.id)

        console.log('Stripe payment processed successfully:', {
          paymentIntentId: paymentIntent.id,
          userId: transaction.user_id,
          plan,
          amount,
        })

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Find matching transaction
        const { data: transaction } = await supabaseClient
          .from('payment_transactions')
          .select('*')
          .eq('provider_transaction_id', paymentIntent.id)
          .eq('status', 'pending')
          .single()

        if (transaction) {
          // Update transaction status
          await supabaseClient
            .from('payment_transactions')
            .update({
              status: 'failed',
              provider_response: {
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                lastPaymentError: paymentIntent.last_payment_error?.message,
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', transaction.id)

          // Mark webhook as processed
          await supabaseClient
            .from('payment_webhooks_log')
            .update({ processed: true })
            .eq('payload->>id', paymentIntent.id)
        }

        break
      }

      default:
        console.log('Unhandled Stripe event type:', event.type)
    }

    return new Response('OK')

  } catch (error) {
    console.error('Stripe webhook error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})
