import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Pricing configuration - source of truth, never trust client amounts
const PLANS = {
  monthly: { amount: 1500, currency: 'KES', days: 30 },
  quarterly: { amount: 4000, currency: 'KES', days: 90 },
  annual: { amount: 14000, currency: 'KES', days: 365 },
}

// Payment provider configurations
const PROVIDERS = {
  mpesa: {
    name: 'M-Pesa',
    requiresPhone: true,
  },
  paypal: {
    name: 'PayPal',
    requiresPhone: false,
  },
  card: {
    name: 'Card',
    requiresPhone: false,
  },
}

interface PaymentRequest {
  plan: keyof typeof PLANS
  paymentMethod: 'mpesa' | 'paypal' | 'card'
  phone?: string
  currency?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      })
    }

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Missing authorization header', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response('Invalid authentication token', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // Parse and validate request body
    const body: PaymentRequest = await req.json()
    
    // Validate required fields
    if (!body.plan || !body.paymentMethod) {
      return new Response('Missing required fields: plan and paymentMethod', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Validate plan
    if (!PLANS[body.plan as keyof typeof PLANS]) {
      return new Response('Invalid plan', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Validate payment method
    if (!PROVIDERS[body.paymentMethod]) {
      return new Response('Invalid payment method', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Validate phone for M-Pesa
    if (body.paymentMethod === 'mpesa' && !body.phone) {
      return new Response('Phone number required for M-Pesa', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Validate phone format for M-Pesa (Kenya)
    if (body.paymentMethod === 'mpesa' && body.phone) {
      const phoneRegex = /^2547\d{8}$/
      if (!phoneRegex.test(body.phone)) {
        return new Response('Invalid phone number format. Must be 2547XXXXXXXX', { 
          status: 400, 
          headers: corsHeaders 
        })
      }
    }

    // Rate limiting: check if user has made more than 5 payment attempts in 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { count: recentAttempts } = await supabaseClient
      .from('payment_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', tenMinutesAgo)

    if (recentAttempts && recentAttempts >= 5) {
      return new Response('Too many payment attempts. Please try again later.', { 
        status: 429, 
        headers: corsHeaders 
      })
    }

    // Get plan details
    const planDetails = PLANS[body.plan as keyof typeof PLANS]
    const amount = planDetails.amount
    const currency = body.currency || planDetails.currency

    // Create pending transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        payment_method: body.paymentMethod,
        amount,
        currency,
        status: 'pending',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      })
      .select()
      .single()

    if (transactionError || !transaction) {
      console.error('Transaction creation error:', transactionError)
      return new Response('Failed to create transaction', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    // Route to appropriate payment provider
    let providerResponse = {}

    switch (body.paymentMethod) {
      case 'mpesa':
        providerResponse = await handleMpesaPayment(user.id, transaction.id, amount, body.phone!)
        break
      case 'paypal':
        providerResponse = await handlePaypalPayment(user.id, transaction.id, amount, currency)
        break
      case 'card':
        providerResponse = await handleCardPayment(user.id, transaction.id, amount, currency)
        break
    }

    // Update transaction with provider response
    await supabaseClient
      .from('payment_transactions')
      .update({
        provider_transaction_id: providerResponse.transactionId,
        provider_response: providerResponse.sanitizedResponse,
      })
      .eq('id', transaction.id)

    return new Response(JSON.stringify({
      success: true,
      transactionId: transaction.id,
      paymentMethod: body.paymentMethod,
      amount,
      currency,
      ...providerResponse.clientData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Payment initiation error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})

// M-Pesa STK Push handler
async function handleMpesaPayment(userId: string, transactionId: string, amount: number, phone: string) {
  const mpesaUrl = 'https://sandbox.safaricom.co.ke/oauth/v1/generate'
  
  // Get access token
  const authResponse = await fetch(mpesaUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${btoa(`${Deno.env.get('MPESA_CONSUMER_KEY')}:${Deno.env.get('MPESA_CONSUMER_SECRET')}`)}`,
    },
  })

  if (!authResponse.ok) {
    throw new Error('Failed to get M-Pesa access token')
  }

  const { access_token } = await authResponse.json()

  // Initiate STK Push
  const stkUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, -3)
  const password = btoa(`${Deno.env.get('MPESA_SHORTCODE')}${Deno.env.get('MPESA_PASSKEY')}${timestamp}`)

  const stkResponse = await fetch(stkUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: Deno.env.get('MPESA_SHORTCODE'),
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: Deno.env.get('MPESA_SHORTCODE'),
      PhoneNumber: phone,
      CallBackURL: `${Deno.env.get('MPESA_CALLBACK_URL')}`,
      AccountReference: `TN${transactionId}`,
      TransactionDesc: `Taichi Nerves Membership`,
    }),
  })

  if (!stkResponse.ok) {
    throw new Error('Failed to initiate M-Pesa STK Push')
  }

  const stkData = await stkResponse.json()
  
  return {
    transactionId: stkData.CheckoutRequestID,
    clientData: {
      checkoutRequestID: stkData.CheckoutRequestID,
      merchantRequestID: stkData.MerchantRequestID,
      customerMessage: stkData.CustomerMessage,
    },
    sanitizedResponse: {
      merchantRequestID: stkData.MerchantRequestID,
      checkoutRequestID: stkData.CheckoutRequestID,
      responseCode: stkData.ResponseCode,
      responseDescription: stkData.ResponseDescription,
    }
  }
}

// PayPal order creation handler
async function handlePaypalPayment(userId: string, transactionId: string, amount: number, currency: string) {
  const paypalUrl = `https://api-m.sandbox.paypal.com/v2/checkout/orders`
  
  // Get access token
  const authResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${Deno.env.get('PAYPAL_CLIENT_ID')}:${Deno.env.get('PAYPAL_CLIENT_SECRET')}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!authResponse.ok) {
    throw new Error('Failed to get PayPal access token')
  }

  const { access_token } = await authResponse.json()

  // Create order
  const orderResponse = await fetch(paypalUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: transactionId,
        description: 'Taichi Nerves Academy Membership',
        amount: {
          currency_code: currency,
          value: amount.toString(),
        },
        custom_id: userId,
      }],
    }),
  })

  if (!orderResponse.ok) {
    throw new Error('Failed to create PayPal order')
  }

  const orderData = await orderResponse.json()

  return {
    transactionId: orderData.id,
    clientData: {
      orderID: orderData.id,
      approvalUrl: orderData.links.find((link: any) => link.rel === 'approve')?.href,
    },
    sanitizedResponse: {
      orderID: orderData.id,
      status: orderData.status,
      createTime: orderData.create_time,
    }
  }
}

// Card payment handler (Stripe/Flutterwave)
async function handleCardPayment(userId: string, transactionId: string, amount: number, currency: string) {
  // For now, return a mock response - integrate with Stripe or Flutterwave as needed
  const mockTransactionId = `card_${transactionId}_${Date.now()}`
  
  return {
    transactionId: mockTransactionId,
    clientData: {
      clientSecret: `pi_${transactionId}_secret_${Date.now()}`,
      publishableKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY'),
    },
    sanitizedResponse: {
      paymentIntentId: `pi_${transactionId}`,
      status: 'requires_payment_method',
    }
  }
}
