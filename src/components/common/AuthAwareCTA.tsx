import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";

interface AuthAwareCTAProps {
  variant?: "default" | "secondary" | "outline" | "cta" | "hero" | "heroOutline";
  size?: "sm" | "lg" | "xl" | "icon" | "default";
  className?: string;
  children: React.ReactNode;
  redirectTo?: string;
  icon?: React.ReactNode;
  requireAuth?: boolean;
  requireMembership?: boolean;
}

const AuthAwareCTA = ({ 
  variant = "cta", 
  size = "lg", 
  className = "", 
  children, 
  redirectTo = "/membership",
  icon,
  requireAuth = true,
  requireMembership = true
}: AuthAwareCTAProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, membershipStatus, isInitializing } = useAuth();

  const handleClick = () => {
    // Don't navigate if still initializing
    if (isInitializing) return;

    // If user is not authenticated, redirect to login with return URL
    if (!isAuthenticated && requireAuth) {
      const returnUrl = encodeURIComponent(redirectTo);
      navigate(`/login?redirect=${returnUrl}`);
      return;
    }

    // If user is authenticated but not a member and membership is required
    if (isAuthenticated && requireMembership && membershipStatus !== 'premium') {
      navigate(redirectTo);
      return;
    }

    // If user is already a member and membership is required, don't show payment
    if (isAuthenticated && requireMembership && membershipStatus === 'premium') {
      navigate('/resources/lectures'); // Or dashboard
      return;
    }

    // Default navigation
    navigate(redirectTo);
  };

  // Hide CTA for premium members if requireMembership is true
  if (isAuthenticated && requireMembership && membershipStatus === 'premium') {
    return null;
  }

  // Show loading state
  if (isInitializing) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={handleClick}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
};

export default AuthAwareCTA;
