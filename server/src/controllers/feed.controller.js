const { candidates } = require('../utils/store')

function dailyFeed(req, res) {
  const { location } = req.query
  const now = Date.now()
  const nearby = location
    ? candidates.filter((c) => c.location.toLowerCase().includes(String(location).toLowerCase()))
    : candidates
  const active = candidates.filter((c) => c.activeToday)
  const recent = candidates
    .filter((c) => now - new Date(c.lastActiveAt).getTime() < 1000 * 60 * 60 * 24 * 2)
    .slice(0, 10)
  res.json({ nearby, active, recent })
}

module.exports = { dailyFeed }
