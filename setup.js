#!/usr/bin/env node

/**
 * FreemiumOdds V2 - Quick Setup Script
 * Run this after cloning: node setup.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

console.log('\n🚀 FreemiumOdds V2 - Quick Setup\n')
console.log('This script will help you set up your environment.\n')

async function setup() {
  try {
    // Check if .env already exists
    if (existsSync('.env')) {
      const overwrite = await question('.env file already exists. Overwrite? (y/n): ')
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.')
        process.exit(0)
      }
    }

    console.log('\n📝 Let\'s configure your environment variables:\n')

    // Supabase
    console.log('1️⃣ SUPABASE SETUP')
    console.log('   Get these from: https://supabase.com/dashboard → Your Project → Settings → API\n')
    
    const supabaseUrl = await question('   Supabase Project URL: ')
    const supabaseKey = await question('   Supabase Anon Key: ')

    // Odds API
    console.log('\n2️⃣ ODDS API SETUP')
    console.log('   Get free API key from: https://the-odds-api.com\n')
    
    const oddsApiKey = await question('   TheOddsAPI Key (or press Enter to skip): ')

    // Create .env file
    const envContent = `# FreemiumOdds V2 Environment Configuration
# Generated: ${new Date().toISOString()}

# Supabase Database (Free tier: https://supabase.com)
SUPABASE_URL=${supabaseUrl || 'your_supabase_project_url'}
SUPABASE_KEY=${supabaseKey || 'your_supabase_anon_key'}

# TheOddsAPI (Free tier: 500 requests/month)
ODDS_API_KEY=${oddsApiKey || 'your_odds_api_key'}

# Server Configuration
PORT=3001
NODE_ENV=development
`

    writeFileSync('.env', envContent)
    console.log('\n✅ .env file created!')

    // Install dependencies
    console.log('\n📦 Installing dependencies...\n')
    
    try {
      console.log('Installing root dependencies...')
      execSync('npm install', { stdio: 'inherit' })
      
      console.log('\nInstalling client dependencies...')
      execSync('cd client && npm install', { stdio: 'inherit', shell: true })
      
      console.log('\n✅ All dependencies installed!')
    } catch (error) {
      console.error('❌ Error installing dependencies:', error.message)
      console.log('\nTry running manually:')
      console.log('  npm install')
      console.log('  cd client && npm install')
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('✨ Setup Complete!')
    console.log('='.repeat(60))
    console.log('\n📋 Next Steps:\n')
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('1. ⚠️  Update .env with your Supabase credentials')
      console.log('   Get them from: https://supabase.com/dashboard\n')
    }
    
    if (!oddsApiKey) {
      console.log('2. ⚠️  Update .env with your TheOddsAPI key (optional for testing)')
      console.log('   Get it from: https://the-odds-api.com\n')
    }
    
    console.log('3. 📊 Setup database schema:')
    console.log('   - Go to Supabase → SQL Editor')
    console.log('   - Run the SQL in: database/schema.sql\n')
    
    console.log('4. 🚀 Start development:')
    console.log('   npm run dev\n')
    
    console.log('5. 📖 Read full deployment guide:')
    console.log('   See DEPLOYMENT.md\n')
    
    console.log('🌐 Your app will run at:')
    console.log('   Frontend: http://localhost:3000')
    console.log('   Backend:  http://localhost:3001\n')

  } catch (error) {
    console.error('\n❌ Setup error:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

setup()
