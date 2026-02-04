/**
 * Verify Vercel Deployment and Cron Status
 */

import fetch from 'node-fetch'

const VERCEL_URL = 'https://freemiumodds-v2-ss3b.vercel.app'

async function verifyDeployment() {
  console.log('🔍 Verifying Vercel Deployment...\n')
  
  // Test 1: Check if site is live
  console.log('1️⃣ Checking if deployment is live...')
  try {
    const response = await fetch(VERCEL_URL)
    console.log(`   Status: ${response.status}`)
    console.log(`   ✅ Site is ${response.ok ? 'LIVE' : 'DOWN'}`)
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`)
  }
  
  console.log('\n2️⃣ Testing /api/scheduler/update endpoint...')
  try {
    const response = await fetch(`${VERCEL_URL}/api/scheduler/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Response:`, data)
    } else {
      const text = await response.text()
      console.log(`   ⚠️  Response: ${text.substring(0, 200)}`)
    }
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`)
  }
  
  console.log('\n3️⃣ Testing /api/scheduler/update-results endpoint...')
  try {
    const response = await fetch(`${VERCEL_URL}/api/scheduler/update-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Response:`, data)
    } else {
      const text = await response.text()
      console.log(`   ⚠️  Response: ${text.substring(0, 200)}`)
    }
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`)
  }
  
  console.log('\n4️⃣ Testing /api/scheduler/fetch-daily endpoint...')
  try {
    const response = await fetch(`${VERCEL_URL}/api/scheduler/fetch-daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Response:`, data)
    } else {
      const text = await response.text()
      console.log(`   ⚠️  Response: ${text.substring(0, 200)}`)
    }
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`)
  }
  
  console.log('\n\n📋 Next Steps:')
  console.log('1. If all endpoints return success, cron jobs will auto-run')
  console.log('2. Monitor Vercel logs: https://vercel.com/boltanxs-projects/freemiumodds-v2/logs')
  console.log('3. Check cron execution: https://vercel.com/boltanxs-projects/freemiumodds-v2/settings/cron-jobs')
  console.log('4. Run this script again in 30 minutes to verify automation')
}

verifyDeployment()
