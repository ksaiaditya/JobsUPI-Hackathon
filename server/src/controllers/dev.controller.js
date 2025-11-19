const RoleTemplate = require('../models/RoleTemplate')
const Candidate = require('../models/Candidate')
const { roleTemplates, candidates } = require('../data/seed')

async function seed(req, res) {
  try {
    const rtCount = await RoleTemplate.countDocuments()
    if (rtCount === 0) {
      await RoleTemplate.insertMany(roleTemplates)
    }
    const cCount = await Candidate.countDocuments()
    if (cCount === 0) {
      await Candidate.insertMany(candidates)
    }
    const totals = {
      roleTemplates: await RoleTemplate.countDocuments(),
      candidates: await Candidate.countDocuments(),
    }
    res.json({ ok: true, totals })
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

module.exports = { seed }
