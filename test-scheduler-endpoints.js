/**
 * Test Scheduler Endpoints
 * This will manually trigger your Vercel cron job endpoints
 */

const YOUR_VERCEL_URL = 'https://your-app.vercel.app' // CHANGE THIS!

async function testEndpoints() {
  console.log('🧪 Testing Scheduler Endpoints...\n')
  
  // Test 1: Update Results
  console.log('1️⃣ Testing /api/scheduler/update-results...')
  try {
    const res1 = await fetch(`${YOUR_VERCEL_URL}/api/scheduler/update-results`, {
      method: 'POST'
    })
    const data1 = await res1.json()
    console.log('✅ Results:', data1)
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
  
  console.log('\n---\n')
  
  // Test 2: Update Oddslot
  console.log('2️⃣ Testing /api/scheduler/update...')
  try {
    const res2 = await fetch(`${YOUR_VERCEL_URL}/api/scheduler/update`, {
      method: 'POST'
    })
    const data2 = await res2.json()
    console.log('✅ Results:', data2)
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
  
  console.log('\n---\n')
  
  // Test 3: Fetch Daily
  console.log('3️⃣ Testing /api/scheduler/fetch-daily...')
  try {
    const res3 = await fetch(`${YOUR_VERCEL_URL}/api/scheduler/fetch-daily`, {
      method: 'POST'
    })
    const data3 = await res3.json()
    console.log('✅ Results:', data3)
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

testEndpoints()
