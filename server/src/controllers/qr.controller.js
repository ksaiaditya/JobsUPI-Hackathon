const mongoose = require('mongoose')
const QRSession = require('../models/QRSession')
const Candidate = require('../models/Candidate')
const { getIo } = require('../realtime/socket')

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

async function startSession(req, res) {
  const connected = mongoose.connection.readyState === 1
  if (!connected) return res.status(503).json({ message: 'Database not connected' })
  const { employerId, templateId, lat, lng } = req.body || {}
  if (!employerId) return res.status(400).json({ message: 'employerId is required' })
  let code = genCode()
  for (let i = 0; i < 5; i++) {
    const exists = await QRSession.findOne({ code }).lean()
    if (!exists) break
    code = genCode()
  }
  const doc = await QRSession.create({
    employer: employerId,
    template: templateId || undefined,
    code,
    active: true,
    geo: lat && lng ? { type: 'Point', coordinates: [Number(lng), Number(lat)] } : undefined,
  })
  try { getIo().emit('qr:session:created', { id: String(doc._id), code: doc.code }) } catch {}
  return res.status(201).json({ session: { id: String(doc._id), code: doc.code, active: doc.active } })
}

async function listSessions(req, res) {
  const { active, employerId } = req.query
  const query = {}
  if (typeof active !== 'undefined') query.active = String(active) === 'true'
  if (employerId) query.employer = employerId
  try {
    const list = await QRSession.find(query).sort({ createdAt: -1 }).lean()
    return res.json({ sessions: list.map(s => ({ id: String(s._id), code: s.code, active: s.active, createdAt: s.createdAt })) })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

async function stopSession(req, res) {
  const { id } = req.params
  const doc = await QRSession.findByIdAndUpdate(id, { active: false }, { new: true }).lean()
  if (!doc) return res.status(404).json({ message: 'Session not found' })
  try { getIo().emit('qr:session:stopped', { id: String(doc._id) }) } catch {}
  return res.json({ session: { id: String(doc._id), active: doc.active } })
}

async function registerScan(req, res) {
  const { code } = req.body || {}
  if (!code) return res.status(400).json({ message: 'code required' })
  const s = await QRSession.findOneAndUpdate({ code }, { $inc: { 'stats.scans': 1 } }, { new: true }).lean()
  if (!s) return res.status(404).json({ message: 'Session code not found' })
  try { getIo().emit('qr:scan', { code: s.code, scans: s.stats?.scans || 0 }) } catch {}
  return res.json({ ok: true })
}

async function registerCandidate(req, res) {
  const connected = mongoose.connection.readyState === 1
  const { code, name, phone, role, area, education } = req.body || {}
  if (!code || !name) return res.status(400).json({ message: 'code and name required' })
  const s = await QRSession.findOne({ code })
  if (!s) return res.status(404).json({ message: 'Session code not found' })
  let candidate = null
  if (connected) {
    candidate = await Candidate.create({ name, phone, role: role || 'Applicant', area, education, activeToday: true, appliedToSimilar: false })
    await QRSession.updateOne({ _id: s._id }, { $inc: { 'stats.registrations': 1 } })
  }
  const payload = candidate ? { id: String(candidate._id), name, phone, role, area } : { name, phone, role, area }
  try { getIo().emit('qr:registration', { code: s.code, candidate: payload }) } catch {}
  return res.status(201).json({ ok: true, candidate: payload })
}

module.exports = { startSession, listSessions, stopSession, registerScan, registerCandidate }
