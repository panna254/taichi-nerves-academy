import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { userApi } from "@/services/userApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  const from = (location.state as { from?: Location })?.from?.pathname || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // PERFORMANCE: Memoize logo error handler
  const handleLogoError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallbackIcon) fallbackIcon.style.display = 'flex';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      const session = await userApi.login({ email, password });
      login(session);
      // Redirect to the page user was trying to access, or home
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Taichi Nerves</title>
        <meta name="description" content="Login to your Taichi Nerves account to access health science learning resources." />
      </Helmet>

      <div className="min-h-screen flex">
        {/* Left Side - Form */}
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
              Welcome back
            </h1>
            <p className="mt-2 text-muted-foreground">
              Login to continue your learning journey
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Sign up
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

        {/* Right Side - Visual */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-hero items-center justify-center p-12">
          <div className="max-w-md text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-accent mb-6">
              <BookOpen className="h-10 w-10 text-accent-foreground" />
            </div>
            <h2 className="font-display text-3xl font-bold text-primary-foreground">
              Continue Your Learning
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Access your courses, track your progress, and pick up right where you left off.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
