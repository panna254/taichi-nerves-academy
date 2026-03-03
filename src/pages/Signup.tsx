import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { userApi } from "@/services/userApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, Eye, EyeOff, User, CreditCard, Check, ArrowLeft, Loader2 } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // PERFORMANCE: Memoize logo error handler
  const handleLogoError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallbackIcon) fallbackIcon.style.display = 'flex';
  }, []);

  const membershipBenefits = [
    "Taichi Nerves video content every week",
    "Premium Notes for Each Lecture",
    "Quizzes for each Lecture",
    "New Podcast episodes every week",
  ];

  const planCatalog: Record<string, { name: string; price: number; duration: string }> = {
    "12m": { name: "1 Year", price: 149, duration: "12 months" },
    "6m": { name: "6 Months", price: 87, duration: "6 months" },
    "3m": { name: "3 Months", price: 40, duration: "3 months" },
  };

  const selectedPlanParam = searchParams.get("plan") || "12m";
  const selectedPlan = planCatalog[selectedPlanParam] || planCatalog["12m"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Basic validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!formData.password.trim()) {
      setError("Password is required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const result = await userApi.signup(formData);
      if (result.status === "authenticated") {
        login(result.session);
        navigate("/");
        return;
      }

      setSuccessMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - Taichi Nerves Membership</title>
        <meta name="description" content="Join Taichi Nerves to access comprehensive health science learning resources. Subscribe for full access to video lectures, notes, podcasts, and quizzes." />
      </Helmet>

      <div className="min-h-screen flex">
        {/* Left Side - Membership Info */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-hero items-center justify-center p-12">
          <div className="max-w-md">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mb-6">
              <CreditCard className="h-8 w-8 text-accent-foreground" />
            </div>
            <h2 className="font-display text-3xl font-bold text-primary-foreground">
              Membership Benefits
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Get full access to all our premium learning resources with your subscription.
            </p>

            <ul className="mt-8 space-y-4">
              {membershipBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
                    <Check className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <span className="text-primary-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Back to Home Link */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            {/* Logo + Site Name */}
            <Link to="/" className="flex items-center gap-3 mb-8">
              <img 
                src="/logo.png" 
                alt="Taichi Nerves" 
                className="h-10 w-auto object-contain"
                onError={handleLogoError}
              />
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Taichi<span className="text-primary">Nerves</span>
              </span>
            </Link>

            <h1 className="font-display text-3xl font-bold text-foreground">
              Create your account
            </h1>
            <p className="mt-2 text-muted-foreground">
              Join thousands of students learning health sciences
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="rounded-xl bg-primary/10 border border-primary/30 px-3 py-2 text-sm text-foreground">
                  {successMessage}
                </div>
              )}

              {/* Pricing Info */}
              <div className="rounded-xl bg-muted p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{selectedPlan.name} Subscription</p>
                    <p className="text-sm text-muted-foreground">Full access for {selectedPlan.duration}</p>
                  </div>
                  <p className="font-semibold text-primary">${selectedPlan.price}</p>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account & Subscribe"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By signing up, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Login
              </Link>
            </p>

            <div className="mt-8 pt-6 border-t border-border">
              <Link
                to="/admin/login"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                <Lock className="h-4 w-4" />
                Admin Dashboard Access
              </Link>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                For staff and content administrators
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
