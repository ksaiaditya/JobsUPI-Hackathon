const { buildOfferMessage } = require('../utils/offer')

function createOffer(req, res) {
  const { candidateName = 'Candidate', role = 'Role', salary = 'As discussed', workHours = 'Standard shift', employerName = 'MSME Employer' } = req.body || {}
  const message = buildOfferMessage({ candidateName, role, salary, workHours, employerName })
  res.json({ message })
}

function spotHiringQRCode(req, res) {
  const { employerId = 'emp_demo' } = req.query
  const payload = `spot-hire://employer/${employerId}?ts=${Date.now()}`
  res.json({ payload })
}

module.exports = { createOffer, spotHiringQRCode }
