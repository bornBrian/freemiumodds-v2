/**
 * Test improved team name matching
 */

const testPairs = [
  ['Gyor', 'ETO FC Győr'],
  ['Waregem W', 'SV Zulte Waregem'],
  ['Goztepe', 'Göztepe'],
  ['Karagumruk', 'Fatih Karagümrük'],
  ['Debrecen', 'Debreceni VSC'],
  ['RSC Anderlecht W', 'RSC Anderlecht'],
  ['Bayern Munich', 'FC Bayern München'],
]

function normalizeTeam(name) {
  const lower = name.toLowerCase().trim()
  
  return lower
    .replace(/\s+w$/i, '')
    .replace(/\s+u\d+$/i, '')
    .replace(/\s+ii$/i, '')
    .replace(/\s+b$/i, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ä/g, 'a')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i')
    .replace(/münchen/g, 'munchen')
    .replace(/\s+fc\s*/gi, ' ')
    .replace(/\s+cf\s*/gi, ' ')
    .replace(/\s+sc\s*/gi, ' ')
    .replace(/\s+as\s*/gi, ' ')
    .replace(/\s+bk\s*/gi, ' ')
    .replace(/\s+sv\s*/gi, ' ')
    .replace(/\s+rsc\s*/gi, ' ')
    .replace(/\s+vsc\s*/gi, ' ')
    .replace(/^eto\s+/gi, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function teamsMatch(searchName, resultName) {
  const search = normalizeTeam(searchName)
  const result = normalizeTeam(resultName)
  
  if (search === result) return true
  if (search.includes(result) || result.includes(search)) return true
  
  const searchWords = search.split(' ').filter(w => w.length > 2)
  const resultWords = result.split(' ').filter(w => w.length > 2)
  
  if (searchWords.length === 1 || resultWords.length === 1) {
    for (const sw of searchWords) {
      for (const rw of resultWords) {
        if (sw.includes(rw) || rw.includes(sw)) return true
      }
    }
    return false
  }
  
  let matches = 0
  for (const sw of searchWords) {
    for (const rw of resultWords) {
      if (sw.includes(rw) || rw.includes(sw)) matches++
    }
  }
  return matches >= Math.min(2, searchWords.length)
}

console.log('Testing team name matching:\n')

for (const [search, sofascore] of testPairs) {
  const norm1 = normalizeTeam(search)
  const norm2 = normalizeTeam(sofascore)
  const match = teamsMatch(search, sofascore)
  
  console.log(`${search} → ${sofascore}`)
  console.log(`  Normalized: "${norm1}" vs "${norm2}"`)
  console.log(`  Match: ${match ? '✅' : '❌'}`)
  console.log()
}
