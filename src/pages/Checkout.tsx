import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { paymentService } from "@/services/paymentService";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, Smartphone, CreditCard, Globe, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  duration: string;
  billing: string;
}

type PaymentMethod = 'mpesa' | 'card' | 'paypal';
type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshMembership } = useAuth();
  
  // Get plan details from location state
  const plan = (location.state as PlanDetails) || {
    id: '12m',
    name: '1 Year',
    price: 149,
    duration: '12 months',
    billing: 'Billed once yearly'
  };

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent('/checkout'));
    }
  }, [isAuthenticated, navigate]);

  const handleMpesaPayment = async () => {
    if (!phoneNumber || !paymentService.validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid M-Pesa phone number');
      return;
    }

    setPaymentStatus('processing');
    setError(null);

    try {
      const response = await paymentService.initiateMpesaPayment({
        phone: paymentService.formatPhoneNumber(phoneNumber),
        amount: plan.price,
        userId: user?.id || '',
        plan: plan.id
      });
      
      if (response.success) {
        setTransactionId(response.transactionId);
        // Poll for payment status
        pollMpesaStatus(response.transactionId);
      } else {
        throw new Error(response.message || 'Failed to initiate M-Pesa payment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setPaymentStatus('failed');
    }
  };

  const pollMpesaStatus = async (transactionId: string) => {
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setError('Payment timeout. Please check your phone and try again.');
        setPaymentStatus('failed');
        return;
      }

      try {
        const status = await paymentService.checkMpesaStatus(transactionId);

        if (status.status === 'completed') {
          await handlePaymentSuccess('mpesa', status.transactionId);
        } else if (status.status === 'failed') {
          setError('Payment failed. Please try again.');
          setPaymentStatus('failed');
        } else {
          // Still pending, continue polling
          attempts++;
          setTimeout(poll, 10000); // Poll every 10 seconds
        }
      } catch (err) {
        attempts++;
        setTimeout(poll, 10000);
      }
    };

    setTimeout(poll, 5000); // Start polling after 5 seconds
  };

  const handlePayPalPayment = async () => {
    setPaymentStatus('processing');
    // PayPal integration would be handled here
    // For now, simulate payment
    setTimeout(() => {
      handlePaymentSuccess('paypal', 'paypal_' + Date.now());
    }, 2000);
  };

  const handleCardPayment = async () => {
    setPaymentStatus('processing');
    // Card payment integration would be handled here
    // For now, simulate payment
    setTimeout(() => {
      handlePaymentSuccess('card', 'card_' + Date.now());
    }, 2000);
  };

  const handlePaymentSuccess = async (method: PaymentMethod, transactionId: string) => {
    try {
      // Update membership status
      await paymentService.confirmPayment({
        userId: user?.id || '',
        plan: plan.id,
        paymentMethod: method,
        transactionId,
        amount: plan.price
      });

      // Refresh auth context
      await refreshMembership();
      
      setPaymentStatus('success');
    } catch (err) {
      setError('Payment successful but failed to update membership. Please contact support.');
      setPaymentStatus('failed');
    }
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setError(null);
    setTransactionId(null);
  };

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  if (paymentStatus === 'success') {
    return (
      <>
        <Helmet>
          <title>Payment Successful - Taichi Nerves</title>
        </Helmet>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Payment Successful!</CardTitle>
                <CardDescription>
                  Your {plan.name} membership is now active
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Plan:</strong> {plan.name}<br />
                    <strong>Amount:</strong> ${plan.price}<br />
                    <strong>Transaction ID:</strong> {transactionId}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link to="/resources/lectures">Go to Dashboard</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/profile">View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <>
        <Helmet>
          <title>Payment Failed - Taichi Nerves</title>
        </Helmet>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Payment Failed</CardTitle>
                <CardDescription>
                  {error || 'Something went wrong with your payment'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    {error || 'Please try again or contact support if the problem persists.'}
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Button onClick={handleRetry} className="w-full">
                    Try Again
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/membership">Back to Plans</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Taichi Nerves</title>
        <meta name="description" content="Complete your subscription payment for Taichi Nerves Academy" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Back Button */}
              <Link to="/membership" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Plans
              </Link>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* Order Summary */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="font-medium">{plan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{plan.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Billing</span>
                        <span className="font-medium">{plan.billing}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${plan.price}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Info */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {user?.name}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        {phoneNumber && <p><strong>Phone:</strong> {phoneNumber}</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Method */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Payment Method</CardTitle>
                      <CardDescription>
                        Choose your preferred payment method
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mpesa" id="mpesa" />
                          <Label htmlFor="mpesa" className="flex items-center gap-2 cursor-pointer">
                            <Smartphone className="h-4 w-4" />
                            M-Pesa
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                            <CreditCard className="h-4 w-4" />
                            Card (Stripe/Flutterwave)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                            <Globe className="h-4 w-4" />
                            PayPal
                          </Label>
                        </div>
                      </RadioGroup>

                      <Separator />

                      {/* Payment Forms */}
                      {selectedMethod === 'mpesa' && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="07XXXXXXXX or 2547XXXXXXXX"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter your M-Pesa registered phone number
                            </p>
                          </div>
                          <Button 
                            onClick={handleMpesaPayment} 
                            disabled={paymentStatus === 'processing'}
                            className="w-full"
                          >
                            {paymentStatus === 'processing' ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Pay with M-Pesa'
                            )}
                          </Button>
                        </div>
                      )}

                      {selectedMethod === 'paypal' && (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            You will be redirected to PayPal to complete your payment.
                          </p>
                          <Button 
                            onClick={handlePayPalPayment} 
                            disabled={paymentStatus === 'processing'}
                            className="w-full"
                          >
                            {paymentStatus === 'processing' ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Pay with PayPal'
                            )}
                          </Button>
                        </div>
                      )}

                      {selectedMethod === 'card' && (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Secure payment powered by Stripe/Flutterwave.
                          </p>
                          <Button 
                            onClick={handleCardPayment} 
                            disabled={paymentStatus === 'processing'}
                            className="w-full"
                          >
                            {paymentStatus === 'processing' ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Pay with Card'
                            )}
                          </Button>
                        </div>
                      )}

                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Checkout;
