import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Stats from './components/Stats'
import MatchList from './components/MatchList'
import Footer from './components/Footer'
import { format } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [stats, setStats] = useState({ 
    total: 0, 
    active: 0, 
    completed: 0, 
    won: 0, 
    lost: 0, 
    accuracy: 0, 
    successRate: 0, 
    lastUpdate: null 
  })

  useEffect(() => {
    fetchMatches(selectedDate)
    fetchStats()
  }, [selectedDate])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/matches/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats({
          accuracy: data.winRate || 0,
          successRate: data.successRate || 0,
          total: data.total || 0,
          active: data.active || 0,
          completed: data.completed || 0,
          won: data.won || 0,
          lost: data.lost || 0,
          lastUpdate: data.lastUpdate || new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchMatches = async (date) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/matches?date=${date}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setMatches(data.matches || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <Hero />
      <Stats stats={stats} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <MatchList 
          matches={matches}
          loading={loading}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </main>
      <Footer />
    </div>
  )
}

export default App
