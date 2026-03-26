import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Safaricom IP ranges for verification (sandbox ranges)
const SAFARICOM_IPS = [
  '196.201.214.136',
  '196.201.214.137',
  '196.201.214.138',
  '196.201.214.139',
  '196.201.214.140',
  '196.201.214.141',
  '196.201.214.142',
  '196.201.214.143',
  '196.201.214.144',
  '196.201.214.145',
  '196.201.214.146',
  '196.201.214.147',
  '196.201.214.148',
  '196.201.214.149',
  '196.201.214.150',
]

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify request originates from Safaricom
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    if (!clientIP || !SAFARICOM_IPS.includes(clientIP.split(',')[0].trim())) {
      console.error('Unauthorized IP:', clientIP)
      return new Response('Unauthorized', { status: 401 })
    }

    // Get request body
    const body = await req.json()
    
    // Log webhook immediately for audit trail
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabaseClient
      .from('payment_webhooks_log')
      .insert({
        provider: 'mpesa',
        event_type: body.Body?.stkCallback?.ResultCode === '0' ? 'payment_success' : 'payment_failed',
        payload: body,
        verified: true, // IP verified
        processed: false,
      })

    // Extract callback data
    const { Body } = body
    if (!Body?.stkCallback) {
      console.error('Invalid M-Pesa callback format')
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { stkCallback } = Body
    const { ResultCode, CheckoutRequestID, MerchantRequestID } = stkCallback

    // Find matching transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('provider_transaction_id', CheckoutRequestID)
      .eq('status', 'pending')
      .single()

    if (transactionError || !transaction) {
      console.error('Transaction not found:', CheckoutRequestID, transactionError)
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Process payment result
    if (ResultCode === '0') {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.CallbackMetadataItem || []
      const mpesaReceipt = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value
      const phoneNumber = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value
      const transactionDate = callbackMetadata.find((item: any) => item.Name === 'TransactionDate')?.Value

      // Update transaction status
      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'completed',
          provider_response: {
            ResultCode,
            CheckoutRequestID,
            MerchantRequestID,
            MpesaReceiptNumber: mpesaReceipt,
            PhoneNumber: phoneNumber,
            TransactionDate: transactionDate,
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

      const plan = transaction.metadata?.plan || 'monthly'
      const days = planDays[plan as keyof typeof planDays] || 30

      // Call the activation function
      const { error: activationError } = await supabaseClient.rpc('activate_membership', {
        p_user_id: transaction.user_id,
        p_plan: plan,
        p_payment_method: 'mpesa',
        p_transaction_id: transaction.id,
        p_days: days,
      })

      if (activationError) {
        console.error('Membership activation error:', activationError)
        // Don't fail the webhook response, but log the error
      }

      // Mark webhook as processed
      await supabaseClient
        .from('payment_webhooks_log')
        .update({ processed: true })
        .eq('payload', body)

      console.log('M-Pesa payment processed successfully:', {
        transactionId: transaction.id,
        checkoutRequestID: CheckoutRequestID,
        mpesaReceipt,
        userId: transaction.user_id,
      })

    } else {
      // Payment failed
      const errorMessage = stkCallback.ResultDesc || 'Payment failed'

      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'failed',
          provider_response: {
            ResultCode,
            CheckoutRequestID,
            MerchantRequestID,
            ResultDesc: errorMessage,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id)

      // Mark webhook as processed
      await supabaseClient
        .from('payment_webhooks_log')
        .update({ processed: true })
        .eq('payload', body)

      console.log('M-Pesa payment failed:', {
        transactionId: transaction.id,
        checkoutRequestID: CheckoutRequestID,
        resultCode: ResultCode,
        errorMessage,
      })
    }

    // Always return success to Safaricom to acknowledge receipt
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('M-Pesa callback error:', error)
    
    // Still return success to Safaricom to avoid retries
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
