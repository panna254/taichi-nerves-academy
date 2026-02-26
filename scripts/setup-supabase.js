#!/usr/bin/env node

/**
 * Supabase Setup Helper Script
 * 
 * This script helps junior developers set up Supabase integration
 * by checking configuration and providing guidance.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n📍 Step ${step}: ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function ask(question) {
  return new Promise((resolve) => {
    rl.question(`${question} `, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Check if .env file exists
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (fs.existsSync(envPath)) {
    logSuccess('.env file exists');
    return true;
  }
  
  if (fs.existsSync(envExamplePath)) {
    logWarning('.env file not found, but .env.example exists');
    logInfo('Creating .env from .env.example...');
    
    try {
      fs.copyFileSync(envExamplePath, envPath);
      logSuccess('Created .env file from .env.example');
      return true;
    } catch (error) {
      logError('Failed to create .env file');
      return false;
    }
  }
  
  logError('Neither .env nor .env.example found');
  return false;
}

// Check environment variables
function checkEnvironmentVariables() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!envContent.includes(`${varName}=`) || 
        envContent.includes(`${varName}=`) && 
        envContent.split(`${varName}=`)[1].startsWith('your_')) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length === 0) {
    logSuccess('All required environment variables are configured');
    return true;
  }
  
  logWarning('Missing or placeholder environment variables:');
  missingVars.forEach(varName => {
    log(`  - ${varName}`, 'red');
  });
  
  return false;
}

// Check package.json dependencies
function checkDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = ['@supabase/supabase-js'];
    const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
    
    if (missingDeps.length === 0) {
      logSuccess('All required dependencies are installed');
      return true;
    }
    
    logWarning('Missing required dependencies:');
    missingDeps.forEach(dep => {
      log(`  - ${dep}`, 'red');
    });
    
    logInfo('Run: npm install @supabase/supabase-js');
    return false;
  } catch (error) {
    logError('Failed to read package.json');
    return false;
  }
}

// Check if required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    'src/config/supabase.ts',
    'src/lib/supabase.ts',
    'src/services/userApi.ts',
    'src/hooks/useAuth.tsx'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length === 0) {
    logSuccess('All required Supabase files exist');
    return true;
  }
  
  logWarning('Missing required files:');
  missingFiles.forEach(file => {
    log(`  - ${file}`, 'red');
  });
  
  return false;
}

// Provide next steps
function provideNextSteps() {
  log('\n🚀 Next Steps:', 'bright');
  log('1. Set up your Supabase project at https://supabase.com', 'blue');
  log('2. Copy your project URL and anon key from Project Settings → API', 'blue');
  log('3. Update your .env file with the credentials', 'blue');
  log('4. Run the database schema from database/schema.sql in Supabase Dashboard', 'blue');
  log('5. Test your integration with the provided test utilities', 'blue');
  log('6. Check the SUPABASE_INTEGRATION_GUIDE.md for detailed instructions', 'blue');
}

// Main setup function
async function runSetup() {
  log('\n🎯 Supabase Setup Helper', 'bright');
  log('This script will help you set up Supabase integration for Taichi Nerves Academy\n');
  
  let allChecksPassed = true;
  
  // Step 1: Check .env file
  logStep(1, 'Checking environment configuration');
  if (!checkEnvFile()) {
    allChecksPassed = false;
  }
  
  // Step 2: Check environment variables
  logStep(2, 'Checking environment variables');
  if (!checkEnvironmentVariables()) {
    allChecksPassed = false;
  }
  
  // Step 3: Check dependencies
  logStep(3, 'Checking dependencies');
  if (!checkDependencies()) {
    allChecksPassed = false;
  }
  
  // Step 4: Check required files
  logStep(4, 'Checking required files');
  if (!checkRequiredFiles()) {
    allChecksPassed = false;
  }
  
  // Summary
  log('\n📊 Setup Summary:', 'bright');
  if (allChecksPassed) {
    logSuccess('All checks passed! Your Supabase integration is ready.');
    logInfo('You can now start the development server: npm run dev');
  } else {
    logWarning('Some checks failed. Please address the issues above.');
    provideNextSteps();
  }
  
  // Ask if user wants to see the guide
  const showGuide = await ask('\nWould you like to open the integration guide? (y/n)');
  if (showGuide.toLowerCase() === 'y' || showGuide.toLowerCase() === 'yes') {
    log('\n📖 Opening SUPABASE_INTEGRATION_GUIDE.md...', 'blue');
    log('You can find the complete guide at: SUPABASE_INTEGRATION_GUIDE.md', 'cyan');
  }
  
  rl.close();
}

// Handle script execution
if (require.main === module) {
  runSetup().catch(error => {
    logError(`Setup failed: ${error.message}`);
    rl.close();
    process.exit(1);
  });
}

module.exports = { runSetup };
