import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Lazy-load less frequently visited pages to reduce initial bundle size
const Membership = lazy(() => import("./pages/Membership"));
const Resources = lazy(() => import("./pages/Resources"));
const Topics = lazy(() => import("./pages/Topics"));
const Contact = lazy(() => import("./pages/Contact"));
const Donate = lazy(() => import("./pages/Donate"));
const HireTutor = lazy(() => import("./pages/HireTutor"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const LectureDetail = lazy(() => import("./pages/LectureDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
// Admin pages are heavy - lazy load entire admin router
const AdminRouter = lazy(() => import("./pages/admin/AdminRouter"));

// Memoize QueryClient to prevent recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - reduce unnecessary refetches
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Prevent aggressive refetching
    },
  },
});

// Loading fallback for lazy-loaded components
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
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
                <Route path="/membership" element={<Membership />} />
                <Route path="/resources/:type" element={<Resources />} />
                <Route path="/topics" element={<Topics />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/hire-tutor" element={<HireTutor />} />
                <Route path="/lectures/:slug" element={<LectureDetail />} />
                <Route path="/admin/*" element={<AdminRouter />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
