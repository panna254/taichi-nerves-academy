import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface RequireAuthProps {
  children: JSX.Element;
}

/**
 * Protected route component that requires authentication
 * Redirects to login page if user is not authenticated
 */
export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, saving the attempted location
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
