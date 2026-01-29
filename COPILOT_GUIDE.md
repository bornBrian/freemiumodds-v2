# 🎯 COPILOT WORKFLOW GUIDE

How to use GitHub Copilot effectively for this project in VS Code.

---

## 🚀 Quick Tips

### 1. **Component Generation**

Write a comment, let Copilot generate:

```jsx
// Create a modern stats card component with icon, value, and label
// Props: icon (emoji), value (number/string), label (string)
// Use Tailwind CSS with gradient effects
```

Then press `Enter` and `Tab` to accept suggestions.

### 2. **API Integration**

```javascript
// Fetch matches from backend API for a specific date
// Handle loading state, errors, and empty results
// Return formatted match objects
async function fetchMatches(date) {
  // Copilot will suggest the implementation
}
```

### 3. **Odds Conversion**

```javascript
// Convert 1X2 decimal odds to double chance odds
// Remove bookmaker margin using fair probability method
// Input: {homeOdd, drawOdd, awayOdd}
// Output: {1X, X2, 12}
function toDoubleChanceOdds(odds) {
  // Copilot knows the math!
}
```

### 4. **Responsive Design**

```jsx
// Mobile-first match card
// Show: teams, kickoff time, league, odds, status badge
// Use Tailwind: rounded corners, shadows, hover effects
// Grid layout on desktop, stack on mobile
```

---

## 💡 Effective Prompts

### Frontend Components

```javascript
// Match card with glassmorphism effect
// Animated hover state with transform
// Display: home team, away team, vs text, confidence badge
```

```javascript
// Date picker with today button
// Styled with Tailwind, primary color theme
// onChange handler to update parent state
```

```javascript
// Loading spinner component
// Centered, animated rotation
// Uses primary brand color
```

### Backend Logic

```javascript
// Express route to get matches by date
// Query Supabase with date filter
// Return JSON with matches array and count
```

```javascript
// Scheduled job to fetch daily matches
// Call odds API, convert to double chance
// Save to database with error handling
```

```javascript
// Middleware to validate date format YYYY-MM-DD
// Return 400 error if invalid
```

### Database Queries

```sql
-- Create matches table with UUID primary key
-- Columns: home, away, league, kickoff, status, confidence
-- JSON column for double_chance odds
-- Indexes on kickoff and status
```

### Testing

```javascript
// Jest test for odds converter
// Test cases: favorite, underdog, balanced match
// Expect all odds >= 1.01 and probabilities sum to 1
```

---

## 🎨 UI Patterns with Copilot

### Pattern 1: Card Grid

```jsx
// Responsive card grid
// 1 column mobile, 2 tablet, 3 desktop
// Gap 4, padding 4
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  {/* Copilot suggests mapping over data */}
</div>
```

### Pattern 2: Gradient Text

```jsx
// Gradient text effect
// Primary to secondary color
<h1 className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
  {/* Title */}
</h1>
```

### Pattern 3: Status Badge

```jsx
// Dynamic status badge with colors
// Pending: yellow, Won: green, Lost: red
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800'
}
```

---

## 🔧 Debugging with Copilot

### Find Bugs

```javascript
// This function has a bug, Copilot can suggest fixes:
function calculateOdds(home, draw, away) {
  const sum = home + draw + away // Should be 1/home + 1/draw + 1/away
  return sum
}

// Add comment: "Fix: convert to implied probabilities first"
// Copilot suggests correct implementation
```

### Optimize Code

```javascript
// Optimize this API call
// Add: caching, error retry, timeout handling
async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}
// Copilot suggests improvements
```

---

## 📚 Learning Pattern

**Best workflow:**

1. **Write intent as comment** (what you want to achieve)
2. **Let Copilot suggest** (press Tab to accept)
3. **Review and adjust** (don't blindly accept!)
4. **Test the code** (Copilot can be wrong!)
5. **Iterate** (refine comments for better suggestions)

---

## ⚠️ What Copilot is NOT Good At

- **Business logic** - Always review carefully
- **Security** - Validate all inputs manually
- **API keys** - Never commit, use env vars
- **Complex state management** - Guide it step-by-step
- **Undocumented APIs** - May hallucinate endpoints

---

## 🎯 Project-Specific Copilot Tasks

### Task 1: Add New Betting Market

```javascript
// Add "Total Goals" market type
// Create converter function from 1X2 to total goals odds
// Update UI to display new market option
// Add database column for total_goals odds
```

### Task 2: Implement Caching

```javascript
// Add in-memory cache for API responses
// Cache key: date string
// TTL: 1 hour
// Invalidate on manual fetch
```

### Task 3: Add Live Scores

```javascript
// Integrate live score API
// Update match status in real-time
// Show live indicator badge
// Auto-refresh every 30 seconds
```

### Task 4: User Preferences

```javascript
// Add localStorage for user preferences
// Save: favorite leagues, default date range
// Restore on page load
// Create settings component
```

---

## 🚀 Advanced Copilot Features

### Multi-line Edits

Select multiple lines, open Copilot Chat, ask:
- "Refactor this to use async/await"
- "Add error handling"
- "Make this more efficient"

### Generate Tests

```javascript
// Write this function first:
function toDoubleChanceOdds(odds) { ... }

// Then write comment:
// Generate Jest tests for toDoubleChanceOdds
// Test cases: normal odds, extreme odds, invalid input

// Copilot generates full test suite!
```

### Documentation

```javascript
// Add JSDoc comments to this function
function fetchMatches(date, filters) {
  // Copilot generates:
  /**
   * Fetch matches for a specific date with optional filters
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {Object} filters - Optional filter criteria
   * @returns {Promise<Array>} Array of match objects
   */
}
```

---

## 💪 Pro Tip: Copilot Labs

Enable **Copilot Labs** extension for extra features:
- **Explain** - Understand complex code
- **Language translation** - Convert between languages
- **Test generation** - Auto-create test cases

---

**Remember**: Copilot is a tool, not a replacement for understanding!

Always review, test, and validate suggestions. 🧠
