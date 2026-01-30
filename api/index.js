import express from 'express'
import cors from 'cors'
import matchesRouter from './routes/matches.js'
import schedulerRouter from './routes/scheduler.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/matches', matchesRouter)
app.use('/api/scheduler', schedulerRouter)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server (for local development only)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  // Dynamic imports for dev-only dependencies
  Promise.all([
    import('node-cron'),
    import('../auto-update-oddslot.js')
  ]).then(([{ default: cron }, { default: runAutoUpdate }]) => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      
      // Setup auto-update to run every hour
      console.log('⏰ Setting up auto-update scheduler (every hour)...')
      cron.schedule('0 * * * *', async () => {
        console.log('\n🔄 [CRON] Auto-update triggered at', new Date().toISOString())
        try {
          await runAutoUpdate()
          console.log('✅ [CRON] Auto-update completed successfully')
        } catch (error) {
          console.error('❌ [CRON] Auto-update failed:', error)
        }
      })
      console.log('✅ Auto-update scheduler activated - runs every hour')
      
      // Run immediately on startup
      console.log('\n🚀 Running initial auto-update...')
      runAutoUpdate().catch(error => {
        console.error('❌ Initial auto-update failed:', error)
      })
    })
  })
}

// Export for Vercel serverless (required for serverless functions)
export default app
