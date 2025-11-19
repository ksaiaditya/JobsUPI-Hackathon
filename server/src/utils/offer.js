function buildOfferMessage({ candidateName, role, salary, workHours, employerName }) {
  const lines = [
    `Hi ${candidateName},`,
    `We'd like to offer you the role of ${role}.`,
    `Salary: ${salary}`,
    `Work hours: ${workHours}`,
    `Reply YES to accept or call us.`,
    employerName ? `- ${employerName}` : undefined,
  ].filter(Boolean)
  return lines.join('\n')
}

module.exports = { buildOfferMessage }
