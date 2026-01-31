import fetch from 'node-fetch'

const url = `https://www.sofascore.com/api/v1/event/14293487`

const response = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json'
  }
})

const data = await response.json()
console.log(JSON.stringify(data.event, null, 2))
process.exit(0)
