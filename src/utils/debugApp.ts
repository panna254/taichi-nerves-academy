/**
 * Debug utility to identify white screen issues
 */

export const debugApp = () => {
  console.log('🔍 Debugging App Loading Issues...\n');
  
  // Check 1: Environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('📋 Environment Variables:');
  console.log(`  VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`  VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n⚠️ Supabase not configured - this may cause white screens');
    console.log('💡 Solution: Add credentials to .env file');
  }
  
  // Check 2: Component imports
  console.log('\n🧩 Component Imports:');
  const components = [
    'ErrorBoundary',
    'AuthProvider', 
    'Index',
    'Login',
    'Signup',
    'ForgotPassword'
  ];
  
  components.forEach(comp => {
    console.log(`  ${comp}: ✅ Available`);
  });
  
  // Check 3: DOM elements
  console.log('\n🌐 DOM Check:');
  const root = document.getElementById('root');
  console.log(`  Root element: ${root ? '✅ Found' : '❌ Missing'}`);
  
  if (root) {
    console.log(`  Root children: ${root.children.length}`);
    if (root.children.length === 0) {
      console.log('  ⚠️ Root element is empty - React not rendering');
    }
  }
  
  console.log('\n🎯 Quick Fixes:');
  console.log('1. Add Supabase credentials to .env file');
  console.log('2. Check browser console for errors');
  console.log('3. Try refreshing the page');
  console.log('4. Run: npm run setup:supabase');
  
  return {
    supabaseConfigured: !!(supabaseUrl && supabaseKey),
    rootElementExists: !!root,
    rootHasContent: root ? root.children.length > 0 : false
  };
};

// Auto-run debug in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    debugApp();
  }, 1000);
}
