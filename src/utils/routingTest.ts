/**
 * Routing Test Utility
 * 
 * This utility helps test and verify that all routes are properly configured
 * and can be loaded without causing white screens.
 */

import { lazy } from "react";

// Test imports for all routes to catch compilation errors early
export const testRouteImports = {
  // Immediate load routes
  index: () => import("../pages/Index"),
  login: () => import("../pages/Login"),
  signup: () => import("../pages/Signup"),
  
  // Lazy loaded routes
  membership: () => import("../pages/Membership"),
  resources: () => import("../pages/Resources"),
  topics: () => import("../pages/Topics"),
  contact: () => import("../pages/Contact"),
  donate: () => import("../pages/Donate"),
  hireTutor: () => import("../pages/HireTutor"),
  privacy: () => import("../pages/Privacy"),
  terms: () => import("../pages/Terms"),
  lectureDetail: () => import("../pages/LectureDetail"),
  notFound: () => import("../pages/NotFound"),
  forgotPassword: () => import("../pages/ForgotPassword"),
  
  // Admin routes
  adminRouter: () => import("../pages/admin/AdminRouter"),
};

// Route configuration for testing
export const routeConfig = [
  { path: "/", component: "Index", lazy: false },
  { path: "/login", component: "Login", lazy: false },
  { path: "/signup", component: "Signup", lazy: false },
  { path: "/forgot-password", component: "ForgotPassword", lazy: true },
  { path: "/membership", component: "Membership", lazy: true },
  { path: "/resources/:type", component: "Resources", lazy: true },
  { path: "/topics", component: "Topics", lazy: true },
  { path: "/contact", component: "Contact", lazy: true },
  { path: "/donate", component: "Donate", lazy: true },
  { path: "/hire-tutor", component: "HireTutor", lazy: true },
  { path: "/lectures/:slug", component: "LectureDetail", lazy: true },
  { path: "/privacy", component: "Privacy", lazy: true },
  { path: "/terms", component: "Terms", lazy: true },
  { path: "/admin/*", component: "AdminRouter", lazy: true },
  { path: "*", component: "NotFound", lazy: true },
];

/**
 * Test all route imports to catch errors early
 * Call this function during development to verify routing setup
 */
export const testAllRoutes = async () => {
  console.log("🧪 Testing all route imports...");
  
  const results = await Promise.allSettled(
    Object.entries(testRouteImports).map(async ([name, importFn]) => {
      try {
        const module = await importFn();
        return { name, status: "success", module };
      } catch (error) {
        console.error(`❌ Failed to import route: ${name}`, error);
        return { name, status: "error", error };
      }
    })
  );

  const successful = results.filter(r => r.status === "fulfilled").length;
  const failed = results.filter(r => r.status === "rejected").length;

  console.log(`✅ Successfully imported ${successful} routes`);
  if (failed > 0) {
    console.error(`❌ Failed to import ${failed} routes`);
  }

  return { successful, failed, results };
};

/**
 * Validate route structure
 */
export const validateRoutes = () => {
  console.log("🔍 Validating route configuration...");
  
  const issues = [];
  
  // Check for duplicate paths
  const paths = routeConfig.map(r => r.path);
  const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
  if (duplicates.length > 0) {
    issues.push(`Duplicate route paths found: ${duplicates.join(", ")}`);
  }

  // Check for required routes
  const requiredRoutes = ["/", "/login", "/signup", "*"];
  const missingRequired = requiredRoutes.filter(path => !paths.includes(path));
  if (missingRequired.length > 0) {
    issues.push(`Missing required routes: ${missingRequired.join(", ")}`);
  }

  // Check admin routes
  const adminRoutes = paths.filter(path => path.startsWith("/admin"));
  if (adminRoutes.length === 0) {
    issues.push("No admin routes found");
  }

  if (issues.length > 0) {
    console.error("❌ Route validation issues:", issues);
  } else {
    console.log("✅ Route validation passed");
  }

  return issues;
};

// Export for use in development
if (process.env.NODE_ENV === "development") {
  // Auto-test routes in development mode
  testAllRoutes();
  validateRoutes();
}
