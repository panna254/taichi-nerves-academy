import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, Eye, EyeOff, User, CreditCard, Check } from "lucide-react";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const membershipBenefits = [
    "Unlimited access to all video lectures",
    "Downloadable study notes and guides",
    "Full podcast library access",
    "Interactive quizzes with instant feedback",
    "New content added regularly",
    "Mobile and desktop access",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Signup logic will be implemented with backend
    console.log("Signup attempt:", formData);
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
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
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

              {/* Pricing Info */}
              <div className="rounded-xl bg-muted p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Monthly Subscription</p>
                    <p className="text-sm text-muted-foreground">Full access to all resources</p>
                  </div>
                  <p className="font-display text-2xl font-bold text-primary">
                    Ksh 500<span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Create Account & Subscribe
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
