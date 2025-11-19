const mongoose = require('mongoose')

const CandidateCallLogSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
    callStartedAt: { type: Date, required: true },
    callEndedAt: { type: Date },
    durationSeconds: { type: Number },
    outcome: { type: String, enum: ['not_available','salary_mismatch','no_answer','hired','next_round','other'], required: true },
    note: { type: String },
    autoSuggested: { type: Boolean, default: false },
    nextActionAt: { type: Date },
  },
  { timestamps: true }
)
CandidateCallLogSchema.index({ candidate: 1, employer: 1, createdAt: -1 })

module.exports = mongoose.models.CandidateCallLog || mongoose.model('CandidateCallLog', CandidateCallLogSchema)
