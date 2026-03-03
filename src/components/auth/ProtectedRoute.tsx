import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Lock, AlertTriangle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredMembership?: 'free' | 'premium' | 'admin';
  fallback?: string;
}

/**
 * Enhanced protected route component with membership validation
 */
export const ProtectedRoute = ({ 
  children, 
  requiredMembership = 'free',
  fallback = '/login'
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, membershipStatus, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-6">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h1>
              <p className="text-muted-foreground mb-6">
                Please sign in to access this content
              </p>
              <Button 
                onClick={() => window.location.href = `/login?from=${encodeURIComponent(location.pathname)}`}
                className="w-full"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check membership requirements
  if (requiredMembership && membershipStatus !== requiredMembership) {
    const getMembershipMessage = () => {
      switch (requiredMembership) {
        case 'premium':
          return 'This content requires a premium membership';
        case 'admin':
          return 'Admin access required';
        default:
          return 'This content requires membership access';
      }
    };

    const getUpgradeMessage = () => {
      switch (membershipStatus) {
        case 'expired':
          return 'Your membership has expired. Please renew to continue.';
        case 'inactive':
          return 'Your membership is inactive. Please contact support.';
        default:
          return 'Please upgrade your membership to access this content.';
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-6">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Membership Required</h1>
              <p className="text-muted-foreground mb-4">
                {getMembershipMessage()}
              </p>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Current status: <span className="font-semibold">{membershipStatus || 'Unknown'}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {getUpgradeMessage()}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => window.location.href = '/membership'}
                  className="w-full"
                  variant="default"
                >
                  Upgrade Membership
                </Button>
                <Button 
                  onClick={() => window.location.href = `/login?from=${encodeURIComponent(location.pathname)}`}
                  className="w-full"
                  variant="outline"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has required membership - show content
  if (isAuthenticated && (!requiredMembership || membershipStatus === requiredMembership)) {
    return <>{children}</>;
  }

  // Fallback redirect
  return <Navigate to={fallback} replace state={{ from: location }} />;
};
