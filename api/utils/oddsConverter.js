/**
 * Convert 1X2 decimal odds to Double Chance decimal odds
 * Removes bookmaker margin for fair calculations
 * 
 * @param {Object} odds - 1X2 odds object
 * @param {number} odds.homeOdd - Decimal odds for home win
 * @param {number} odds.drawOdd - Decimal odds for draw
 * @param {number} odds.awayOdd - Decimal odds for away win
 * @returns {Object} Double chance odds (1X, X2, 12)
 */
export function toDoubleChanceOdds({ homeOdd, drawOdd, awayOdd }) {
  // Step 1: Convert odds to implied probabilities
  const pHome = 1 / homeOdd
  const pDraw = 1 / drawOdd
  const pAway = 1 / awayOdd
  
  // Step 2: Remove bookmaker margin (normalize)
  const sum = pHome + pDraw + pAway
  const fHome = pHome / sum
  const fDraw = pDraw / sum
  const fAway = pAway / sum
  
  // Step 3: Calculate double chance probabilities
  const prob1X = fHome + fDraw  // Home or Draw
  const probX2 = fDraw + fAway  // Draw or Away
  const prob12 = fHome + fAway  // Home or Away
  
  // Step 4: Convert back to decimal odds
  return {
    '1X': parseFloat((1 / prob1X).toFixed(3)),
    'X2': parseFloat((1 / probX2).toFixed(3)),
    '12': parseFloat((1 / prob12).toFixed(3)),
    // Return fair probabilities for debugging
    _probs: { fHome, fDraw, fAway }
  }
}

/**
 * Calculate bookmaker margin (overround)
 * @param {Object} odds - 1X2 odds
 * @returns {number} Margin percentage
 */
export function calculateMargin({ homeOdd, drawOdd, awayOdd }) {
  const sum = (1/homeOdd) + (1/drawOdd) + (1/awayOdd)
  return ((sum - 1) * 100).toFixed(2)
}

/**
 * Validate odds values
 * @param {number} odd - Decimal odd to validate
 * @returns {boolean}
 */
export function isValidOdd(odd) {
  return typeof odd === 'number' && odd >= 1.01 && odd <= 1000
}
