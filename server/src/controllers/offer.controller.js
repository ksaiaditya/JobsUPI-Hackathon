const { roleTemplates } = require('../utils/store')

function generateOffer(req, res) {
  const { roleTemplateId, candidateName, salary } = req.body || {}
  const tpl = roleTemplates.find((t) => t.id === roleTemplateId)
  if (!tpl) return res.status(400).json({ message: 'Invalid roleTemplateId' })
  const finalSalary = salary || `${tpl.salaryRange[0]} - ${tpl.salaryRange[1]}`
  const jd = `Role: ${tpl.name}\nHours: ${tpl.workHours}\nPay: ${finalSalary}\nDescription: ${tpl.description}`
  const message = `Hi ${candidateName || 'Candidate'},\n\nOffer from MSME: ${tpl.name}\nPay: ${finalSalary}\nHours: ${tpl.workHours}\nLocation: As discussed.\n\nReply YES to confirm.`
  res.json({ message, jd })
}

module.exports = { generateOffer }
