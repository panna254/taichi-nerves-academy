# Supabase Secrets Setup Guide

## Required Secrets for Payment Processing

Before deploying the Edge Functions, you must set up the following secrets in your Supabase project.

### **M-Pesa Configuration**
```bash
supabase secrets set MPESA_CONSUMER_KEY=your_mpesa_consumer_key
supabase secrets set MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
supabase secrets set MPESA_PASSKEY=your_mpesa_passkey
supabase secrets set MPESA_SHORTCODE=your_mpesa_shortcode
supabase secrets set MPESA_CALLBACK_URL=https://your-project.supabase.co/functions/v1/mpesa-callback
supabase secrets set MPESA_ENVIRONMENT=sandbox
```

### **PayPal Configuration**
```bash
supabase secrets set PAYPAL_CLIENT_ID=your_paypal_client_id
supabase secrets set PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

### **Stripe Configuration**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

### **Flutterwave Configuration**
```bash
supabase secrets set FLW_SECRET_KEY=your_flutterwave_secret_key
supabase secrets set FLW_SECRET_HASH=your_flutterwave_hash_secret
```

### **Application Configuration**
```bash
supabase secrets set CORS_ORIGIN=https://your-production-domain.com
```

## **Setup Commands**

### **1. Install Supabase CLI**
```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

### **2. Link to Your Project**
```bash
supabase link --project-ref your-project-ref
```

### **3. Set All Secrets**
```bash
# M-Pesa
supabase secrets set MPESA_CONSUMER_KEY=your_mpesa_consumer_key
supabase secrets set MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
supabase secrets set MPESA_PASSKEY=your_mpesa_passkey
supabase secrets set MPESA_SHORTCODE=174379
supabase secrets set MPESA_CALLBACK_URL=https://your-project.supabase.co/functions/v1/mpesa-callback
supabase secrets set MPESA_ENVIRONMENT=sandbox

# PayPal
supabase secrets set PAYPAL_CLIENT_ID=your_paypal_client_id
supabase secrets set PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Flutterwave
supabase secrets set FLW_SECRET_KEY=FLWSECK_TEST_your_flutterwave_secret_key
supabase secrets set FLW_SECRET_HASH=your_flutterwave_hash_secret

# CORS
supabase secrets set CORS_ORIGIN=https://your-production-domain.com
```

### **4. Verify Secrets**
```bash
supabase secrets list
```

## **Environment-Specific Values**

### **Development (Sandbox)**
- **M-Pesa**: Use Safaricom sandbox credentials
- **PayPal**: Use sandbox client ID and secret
- **Stripe**: Use test keys (sk_test_*)
- **Flutterwave**: Use test keys (FLWSECK_TEST_*)

### **Production**
- **M-Pesa**: Use production credentials
- **PayPal**: Use live client ID and secret
- **Stripe**: Use live keys (sk_live_*)
- **Flutterwave**: Use live keys (FLWSECK_LIVE_*)

## **Security Notes**

1. **Never commit secrets to version control**
2. **Use different secrets for development and production**
3. **Rotate secrets regularly**
4. **Monitor for unauthorized access**
5. **Use principle of least privilege**

## **Testing Secrets**

### **Test M-Pesa Integration**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/initiate-payment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "monthly",
    "paymentMethod": "mpesa",
    "phone": "254712345678"
  }'
```

### **Test PayPal Integration**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/initiate-payment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "monthly",
    "paymentMethod": "paypal"
  }'
```

### **Test Stripe Integration**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/initiate-payment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "monthly",
    "paymentMethod": "card"
  }'
```

## **Troubleshooting**

### **Common Issues**

1. **Secret not found**: Ensure secrets are set correctly
2. **Invalid credentials**: Verify API keys and secrets
3. **CORS errors**: Check CORS_ORIGIN setting
4. **Webhook failures**: Verify webhook URLs and secrets

### **Debug Commands**
```bash
# Check function logs
supabase functions logs mpesa-callback

# Test function locally
supabase functions serve --env-file .env.local

# Deploy functions
supabase functions deploy
```

## **Webhook Configuration**

### **M-Pesa Callback URL**
Set in Safaricom Daraja dashboard:
```
https://your-project.supabase.co/functions/v1/mpesa-callback
```

### **PayPal Webhook URL**
Set in PayPal Developer dashboard:
```
https://your-project.supabase.co/functions/v1/paypal-webhook
```

### **Stripe Webhook URL**
Set in Stripe Dashboard:
```
https://your-project.supabase.co/functions/v1/stripe-webhook
```

### **Flutterwave Webhook URL**
Set in Flutterwave dashboard:
```
https://your-project.supabase.co/functions/v1/flutterwave-webhook
```
