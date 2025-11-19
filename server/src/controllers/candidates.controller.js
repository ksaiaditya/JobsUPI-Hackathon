const mongoose = require('mongoose')
const Candidate = require('../models/Candidate')
const { candidates: seedCandidates, roleTemplates: seedTemplates } = require('../data/seed')

function normalize(s) { return String(s || '').trim().toLowerCase() }

async function search(req, res) {
  const { role, area, education } = req.query
  try {
    const query = {}
    if (role) query.role = new RegExp(`^${normalize(role)}$`, 'i')
    if (area) query.area = new RegExp(`^${normalize(area)}$`, 'i')
    if (education) query.education = new RegExp(`^${normalize(education)}$`, 'i')
    const results = await Candidate.find(query).lean()
    return res.json({ results })
  } catch {}
  let results = seedCandidates
  if (role) results = results.filter((c) => normalize(c.role) === normalize(role))
  if (area) results = results.filter((c) => normalize(c.area) === normalize(area))
  if (education) results = results.filter((c) => normalize(c.education) === normalize(education))
  res.json({ results: results.map((c, idx) => ({ id: `seed_${idx}`, ...c })) })
}

async function feed(_req, res) {
  try {
    const [nearby, activeToday, recentApplicants] = await Promise.all([
      Candidate.find({ area: 'JP Nagar' }).lean(),
      Candidate.find({ activeToday: true }).lean(),
      Candidate.find({ appliedToSimilar: true }).lean(),
    ])
    return res.json({ nearby, activeToday, recentApplicants })
  } catch {}
  const nearby = seedCandidates
    .map((c, i) => ({ id: `seed_n_${i}`, ...c }))
    .filter((c) => c.area === 'JP Nagar')
  const activeToday = seedCandidates
    .map((c, i) => ({ id: `seed_a_${i}`, ...c }))
    .filter((c) => c.activeToday)
  const recentApplicants = seedCandidates
    .map((c, i) => ({ id: `seed_r_${i}`, ...c }))
    .filter((c) => c.appliedToSimilar)
  res.json({ nearby, activeToday, recentApplicants })
}

async function updateStatus(req, res) {
  const { id } = req.params
  const { status, note } = req.body || {}
  const valid = ['not_available', 'salary_mismatch', 'no_answer', 'hired', 'next_round']
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' })
  try {
    const updated = await Candidate.findByIdAndUpdate(id, { status, note }, { new: true }).lean()
    if (!updated) return res.status(404).json({ message: 'Candidate not found' })
    return res.json({ candidate: updated })
  } catch {}
  return res.status(501).json({ message: 'Status update requires DB in this build' })
}

async function massHire(req, res) {
  const { role, count = 1 } = req.body || {}
  try {
    const results = await Candidate.find({ role: new RegExp(`^${normalize(role)}$`, 'i') })
      .limit(Number(count))
      .lean()
    return res.json({ role, suggested: results })
  } catch {}
  const results = seedCandidates.filter((c) => normalize(c.role) === normalize(role)).slice(0, Number(count))
  const tpl = seedTemplates.find((t) => normalize(t.name) === normalize(role))
  res.json({ role, suggested: results, template: tpl && { name: tpl.name, salaryRange: [tpl.salaryMin, tpl.salaryMax], workHours: tpl.workHours } })
}

module.exports = { search, feed, updateStatus, massHire }
async function createCandidate(req, res) {
  const connected = mongoose.connection.readyState === 1
  if (!connected) return res.status(503).json({ message: 'Database not connected' })
  const { name, role, area, education, phone, activeToday, appliedToSimilar } = req.body || {}
  if (!name || !role) return res.status(400).json({ message: 'name and role required' })
  try {
    const doc = await Candidate.create({ name, role, area, education, phone, activeToday, appliedToSimilar })
    return res.status(201).json({ candidate: doc })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

module.exports.createCandidate = createCandidate

// Convenience variant: PATCH /api/candidates/status with body { id, status, note }
async function updateStatusByBody(req, res) {
  const { id, status, note } = req.body || {}
  if (!id) return res.status(400).json({ message: 'id is required in body' })
  const valid = ['not_available', 'salary_mismatch', 'no_answer', 'hired', 'next_round']
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' })
  try {
    const updated = await Candidate.findByIdAndUpdate(id, { status, note }, { new: true }).lean()
    if (!updated) return res.status(404).json({ message: 'Candidate not found' })
    return res.json({ candidate: updated })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}

module.exports.updateStatusByBody = updateStatusByBody
