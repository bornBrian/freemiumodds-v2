#!/usr/bin/env node

/**
 * ✅ FINAL VERIFICATION SCRIPT
 * Checks that everything is properly set up
 */

import { existsSync, readFileSync } from 'fs'
import { execSync } from 'child_process'

console.log('\n' + '='.repeat(60))
console.log('🔍 FreemiumOdds V2 - System Verification')
console.log('='.repeat(60) + '\n')

let allGood = true
const warnings = []
const errors = []

// Check Node.js version
console.log('1️⃣  Checking Node.js version...')
try {
  const nodeVersion = process.version.replace('v', '')
  const [major] = nodeVersion.split('.')
  if (parseInt(major) >= 18) {
    console.log(`   ✅ Node.js ${process.version} (Good!)`)
  } else {
    console.log(`   ⚠️  Node.js ${process.version} (Upgrade to 18+ recommended)`)
    warnings.push('Node.js version is below 18')
  }
} catch (error) {
  console.log('   ❌ Could not detect Node.js version')
  errors.push('Node.js version check failed')
  allGood = false
}

// Check if dependencies are installed
console.log('\n2️⃣  Checking dependencies...')
if (existsSync('node_modules')) {
  console.log('   ✅ Root dependencies installed')
} else {
  console.log('   ❌ Root dependencies NOT installed')
  console.log('      Run: npm install')
  errors.push('Root dependencies missing')
  allGood = false
}

if (existsSync('client/node_modules')) {
  console.log('   ✅ Client dependencies installed')
} else {
  console.log('   ❌ Client dependencies NOT installed')
  console.log('      Run: cd client && npm install')
  errors.push('Client dependencies missing')
  allGood = false
}

// Check for .env file
console.log('\n3️⃣  Checking environment configuration...')
if (existsSync('.env')) {
  console.log('   ✅ .env file exists')
  
  const envContent = readFileSync('.env', 'utf8')
  
  // Check for required variables
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_KEY']
  const optionalVars = ['ODDS_API_KEY']
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
      console.log(`   ✅ ${varName} is configured`)
    } else {
      console.log(`   ⚠️  ${varName} needs configuration`)
      warnings.push(`${varName} not configured`)
    }
  })
  
  optionalVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
      console.log(`   ✅ ${varName} is configured`)
    } else {
      console.log(`   ℹ️  ${varName} not configured (optional for testing)`)
    }
  })
} else {
  console.log('   ⚠️  .env file not found')
  console.log('      Run: node setup.js')
  warnings.push('.env file missing - run setup.js')
}

// Check key files exist
console.log('\n4️⃣  Checking project structure...')
const requiredFiles = [
  'package.json',
  'vercel.json',
  'client/package.json',
  'client/vite.config.js',
  'api/index.js',
  'database/schema.sql'
]

let missingFiles = 0
requiredFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ❌ ${file} missing`)
    missingFiles++
  }
})

if (missingFiles > 0) {
  errors.push(`${missingFiles} required files missing`)
  allGood = false
}

// Check documentation
console.log('\n5️⃣  Checking documentation...')
const docs = ['README.md', 'DEPLOYMENT.md', 'CHEATSHEET.md']
docs.forEach(doc => {
  if (existsSync(doc)) {
    console.log(`   ✅ ${doc}`)
  } else {
    console.log(`   ⚠️  ${doc} missing`)
  }
})

// Summary
console.log('\n' + '='.repeat(60))
console.log('📊 VERIFICATION SUMMARY')
console.log('='.repeat(60))

if (allGood && warnings.length === 0) {
  console.log('\n🎉 All checks passed! Your system is ready.')
  console.log('\n📝 Next steps:')
  console.log('   1. If you haven\'t: node setup.js')
  console.log('   2. Start development: npm run dev')
  console.log('   3. Deploy: Read DEPLOYMENT.md')
} else {
  if (errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:')
    errors.forEach(err => console.log(`   • ${err}`))
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:')
    warnings.forEach(warn => console.log(`   • ${warn}`))
  }
  
  console.log('\n🔧 Recommended actions:')
  if (errors.some(e => e.includes('dependencies'))) {
    console.log('   1. Run: npm run install:all')
  }
  if (warnings.some(w => w.includes('.env'))) {
    console.log('   2. Run: node setup.js')
  }
  console.log('   3. Re-run: node verify.js')
}

console.log('\n' + '='.repeat(60))
console.log('📞 Need help? Email: bonbrian2@gmail.com')
console.log('='.repeat(60) + '\n')

// Exit with appropriate code
process.exit(allGood && warnings.length === 0 ? 0 : 1)
