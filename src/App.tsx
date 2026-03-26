import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SetupRequired } from "@/components/SetupRequired";
import { isSupabaseConfigured } from "@/config/supabase";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

// Debug utility for development
import "./utils/debugApp";

// Lazy-load less frequently visited pages to reduce initial bundle size
const Membership = lazy(() => import("./pages/Membership"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Resources = lazy(() => import("./pages/Resources"));
const Topics = lazy(() => import("./pages/Topics"));
const Contact = lazy(() => import("./pages/Contact"));
const Donate = lazy(() => import("./pages/Donate"));
const HireTutor = lazy(() => import("./pages/HireTutor"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const LectureDetail = lazy(() => import("./pages/LectureDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
// Admin pages are heavy - lazy load entire admin router
const AdminRouter = lazy(() => import("./pages/admin/AdminRouter"));

// Memoize QueryClient to prevent recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - reduce unnecessary refetches
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      refetchOnWindowFocus: false, // Prevent aggressive refetching
    },
  },
});

// Enhanced loading fallback with error boundary for lazy-loaded components
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Error boundary for lazy-loaded components
const LazyErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary
    fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page Load Error</h1>
          <p className="text-muted-foreground mb-4">
            This page failed to load. Please try refreshing or contact support.
          </p>
          <a href="/" className="text-primary hover:underline">
            Back to Home
          </a>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

const App = () => {
  // Show setup required screen if Supabase is not configured
  if (!isSupabaseConfigured) {
    return (
      <ErrorBoundary>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <SetupRequired />
            </TooltipProvider>
          </QueryClientProvider>
        </HelmetProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                {/* Suspense boundary for lazy-loaded routes */}
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/membership" element={
                      <LazyErrorBoundary>
                        <Membership />
                      </LazyErrorBoundary>
                    } />
                    <Route path="/checkout" element={
                      <LazyErrorBoundary>
                        <Checkout />
                      </LazyErrorBoundary>
                    } />
                    <Route path="/resources/:type" element={
                      <LazyErrorBoundary>
                        <Resources />
                      </LazyErrorBoundary>
                    } />
                    <Route path="/topics" element={
                      <LazyErrorBoundary>
                        <Topics />
                      </LazyErrorBoundary>
                    } />
                    <Route path="/contact" element={
                      <LazyErrorBoundary>
                        <Contact />
                      </LazyErrorBoundary>
                    } />
                    <Route path="/donate" element={
                      <LazyErrorBoundary>
                        <Donate />
                      </LazyErrorBoundary>
                    } />
                    <Route path="/hire-tutor" element={
                      <LazyErrorBoundary>
                        <HireTutor />
                      </LazyErrorBoundary>
                    } />
                    <Route path="/lectures/:slug" element={
                      <LazyErrorBoundary>
                        <LectureDetail />
                      </LazyErrorBoundary>
                    } />
                    <Route path="/admin/*" element={
                      <LazyErrorBoundary>
                        <AdminRouter />
                      </LazyErrorBoundary>
                    } />
                    <Route path="/privacy" element={
                      <LazyErrorBoundary>
                        <Privacy />
                      </LazyErrorBoundary>
                    } />
                    <Route path="/terms" element={
                      <LazyErrorBoundary>
                        <Terms />
                      </LazyErrorBoundary>
                    } />
                    <Route path="/profile" element={
                      <LazyErrorBoundary>
                        <Profile />
                      </LazyErrorBoundary>
                    } />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={
                      <LazyErrorBoundary>
                        <NotFound />
                      </LazyErrorBoundary>
                    } />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
