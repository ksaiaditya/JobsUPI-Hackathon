const mongoose = require('mongoose')
const Candidate = require('../models/Candidate')
const { candidates: seedCandidates } = require('../data/seed')

// Simple matching heuristic: distance (placeholder), role match, availability, experience approximation
async function matchCandidates({ role, lat, lng, limit = 20 }) {
  const connected = mongoose.connection.readyState === 1
  let source = []
  if (connected) {
    try {
      const query = {}
      if (role) query.role = new RegExp(`^${role}$`, 'i')
      source = await Candidate.find(query).limit(limit * 3).lean()
    } catch (err) {
      console.warn('DB match query failed, falling back to seed:', err.message)
    }
  }
  if (!source.length) {
    source = seedCandidates.filter((c) => (!role ? true : c.role.toLowerCase() === role.toLowerCase()))
  }
  return source
    .map((c) => {
      let score = 0
      if (role && c.role.toLowerCase() === role.toLowerCase()) score += 40
      if (c.activeToday) score += 25
      if (c.appliedToSimilar) score += 10
      if ((c.education || '').includes('10th')) score += 5
      return { ...c, matchScore: score }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
}

module.exports = { matchCandidates }
