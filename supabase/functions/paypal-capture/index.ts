import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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

    // Parse request body
    const body = await req.json()
    const { orderID, plan } = body

    if (!orderID) {
      return new Response('Missing orderID', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Get PayPal access token
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

    // Verify order details server-side
    const orderResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!orderResponse.ok) {
      throw new Error('Failed to verify PayPal order')
    }

    const orderData = await orderResponse.json()

    // Validate order status
    if (orderData.status !== 'APPROVED') {
      return new Response('Order not approved', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Validate custom_id matches authenticated user
    if (orderData.purchase_units[0]?.custom_id !== user.id) {
      return new Response('Order user mismatch', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Validate amount against plan pricing
    const planAmounts = {
      monthly: 1500,
      quarterly: 4000,
      annual: 14000,
    }

    const expectedAmount = planAmounts[plan as keyof typeof planAmounts]
    const actualAmount = parseFloat(orderData.purchase_units[0]?.amount?.value)

    if (!expectedAmount || actualAmount !== expectedAmount) {
      return new Response('Amount validation failed', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Find matching transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('provider_transaction_id', orderID)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (transactionError || !transaction) {
      return new Response('Transaction not found', { 
        status: 404, 
        headers: corsHeaders 
      })
    }

    // Capture the payment
    const captureResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!captureResponse.ok) {
      throw new Error('Failed to capture PayPal payment')
    }

    const captureData = await captureResponse.json()

    // Check capture status
    if (captureData.status !== 'COMPLETED') {
      return new Response('Payment capture failed', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Update transaction status
    await supabaseClient
      .from('payment_transactions')
      .update({
        status: 'completed',
        provider_response: {
          orderID,
          captureID: captureData.purchase_units[0]?.payments?.captures[0]?.id,
          status: captureData.status,
          amount: actualAmount,
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

    // Use service role for activation
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error: activationError } = await serviceClient.rpc('activate_membership', {
      p_user_id: user.id,
      p_plan: plan,
      p_payment_method: 'paypal',
      p_transaction_id: transaction.id,
      p_days: days,
    })

    if (activationError) {
      console.error('Membership activation error:', activationError)
      return new Response('Payment successful but membership activation failed', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    return new Response(JSON.stringify({
      success: true,
      orderID,
      status: 'completed',
      plan,
      amount: actualAmount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('PayPal capture error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})
