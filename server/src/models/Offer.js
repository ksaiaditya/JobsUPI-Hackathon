const mongoose = require('mongoose')

const OfferSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
    jobPosting: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting' },
    message: { type: String, required: true },
    language: { type: String, default: 'en' },
    joiningDate: { type: Date },
    status: { type: String, enum: ['sent','accepted','declined','expired','pending'], default: 'sent' },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
)
OfferSchema.index({ candidate: 1, employer: 1 })

module.exports = mongoose.models.Offer || mongoose.model('Offer', OfferSchema)
