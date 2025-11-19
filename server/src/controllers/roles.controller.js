const mongoose = require('mongoose')
const RoleTemplate = require('../models/RoleTemplate')
const { roleTemplates: seedTemplates } = require('../data/seed')
const { matchCandidates } = require('../services/matching.service')

function toPayload(t) {
  return {
    id: String(t._id),
    name: t.name,
    salaryRange: [t.salaryMin, t.salaryMax],
    workHours: t.workHours,
    defaultRequirements: t.defaultRequirements,
  }
}

async function listTemplates(_req, res) {
  const connected = mongoose.connection.readyState === 1
  if (connected) {
    try {
      const items = await RoleTemplate.find().lean()
      if (items.length) return res.json({ templates: items.map(toPayload) })
    } catch (err) {
      console.warn('List templates DB error, falling back:', err.message)
    }
  }
  const mapped = seedTemplates.map((t, idx) => ({
    id: `seed_${idx}`,
    name: t.name,
    salaryRange: [t.salaryMin, t.salaryMax],
    workHours: t.workHours,
    defaultRequirements: t.defaultRequirements,
  }))
  return res.json({ templates: mapped })
}

async function suggestForRole(req, res) {
  const { role } = req.query
  const q = String(role || '')
  try {
    const t = await RoleTemplate.findOne({ name: new RegExp(`^${q}$`, 'i') }).lean()
    if (t) return res.json({ template: { name: t.name, salaryRange: [t.salaryMin, t.salaryMax], workHours: t.workHours, defaultRequirements: t.defaultRequirements } })
  } catch {}
  const tpl = seedTemplates.find((t) => t.name.toLowerCase() === q.toLowerCase())
  if (!tpl) return res.status(404).json({ message: 'Role template not found' })
  res.json({ template: { name: tpl.name, salaryRange: [tpl.salaryMin, tpl.salaryMax], workHours: tpl.workHours, defaultRequirements: tpl.defaultRequirements } })
}

async function matchForRole(req, res) {
  const { role, lat, lng, limit } = req.query
  if (!role) return res.status(400).json({ message: 'role query parameter required' })
  try {
    const matches = await matchCandidates({ role, lat: Number(lat), lng: Number(lng), limit: Number(limit) || 20 })
    return res.json({ matches })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

async function getTemplate(req, res) {
  const { id } = req.params
  const connected = mongoose.connection.readyState === 1
  if (connected && !id.startsWith('seed_')) {
    try {
      const t = await RoleTemplate.findById(id).lean()
      if (t) return res.json({ template: toPayload(t) })
    } catch (err) {
      return res.status(400).json({ message: 'Invalid template id' })
    }
  }
  // seed fallback if seed id format
  if (id.startsWith('seed_')) {
    const idx = Number(id.replace('seed_', ''))
    const tpl = seedTemplates[idx]
    if (tpl) return res.json({ template: { id, name: tpl.name, salaryRange: [tpl.salaryMin, tpl.salaryMax], workHours: tpl.workHours, defaultRequirements: tpl.defaultRequirements } })
  }
  return res.status(404).json({ message: 'Template not found' })
}

async function createTemplate(req, res) {
  const connected = mongoose.connection.readyState === 1
  if (!connected) return res.status(503).json({ message: 'Database not connected' })
  const { name, salaryMin, salaryMax, workHours, defaultRequirements } = req.body
  if (!name || salaryMin == null || salaryMax == null) {
    return res.status(400).json({ message: 'name, salaryMin, salaryMax required' })
  }
  try {
    const exists = await RoleTemplate.findOne({ name }).lean()
    if (exists) return res.status(409).json({ message: 'Template name already exists' })
    const tpl = await RoleTemplate.create({ name, salaryMin, salaryMax, workHours, defaultRequirements })
    return res.status(201).json({ template: toPayload(tpl) })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

async function updateTemplate(req, res) {
  const connected = mongoose.connection.readyState === 1
  if (!connected) return res.status(503).json({ message: 'Database not connected' })
  const { id } = req.params
  const { name, salaryMin, salaryMax, workHours, defaultRequirements } = req.body
  try {
    const tpl = await RoleTemplate.findById(id)
    if (!tpl) return res.status(404).json({ message: 'Template not found' })
    if (name) tpl.name = name
    if (salaryMin != null) tpl.salaryMin = salaryMin
    if (salaryMax != null) tpl.salaryMax = salaryMax
    if (workHours != null) tpl.workHours = workHours
    if (defaultRequirements != null) tpl.defaultRequirements = defaultRequirements
    await tpl.save()
    return res.json({ template: toPayload(tpl) })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}

async function deleteTemplate(req, res) {
  const connected = mongoose.connection.readyState === 1
  if (!connected) return res.status(503).json({ message: 'Database not connected' })
  const { id } = req.params
  try {
    const tpl = await RoleTemplate.findById(id)
    if (!tpl) return res.status(404).json({ message: 'Template not found' })
    await tpl.deleteOne()
    return res.json({ deleted: true })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}

module.exports = { listTemplates, suggestForRole, matchForRole, getTemplate, createTemplate, updateTemplate, deleteTemplate }
