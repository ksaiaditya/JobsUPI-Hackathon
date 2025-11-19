const { candidates } = require('../utils/store')

function massHire(req, res) {
  const { role, count = 5 } = req.body || {}
  if (!role) return res.status(400).json({ message: 'role is required' })
  const picks = candidates.filter((c) => c.role.toLowerCase() === String(role).toLowerCase()).slice(0, Number(count))
  res.json({ suggested: picks })
}

module.exports = { massHire }
