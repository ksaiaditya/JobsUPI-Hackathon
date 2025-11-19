const mongoose = require('mongoose')

const CandidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true, index: true },
    area: { type: String, index: true },
    education: { type: String, default: '' },
    phone: { type: String, default: '' },
    activeToday: { type: Boolean, default: false, index: true },
    appliedToSimilar: { type: Boolean, default: false },
    status: { type: String, default: 'new' },
    note: { type: String },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema)
