const mongoose = require('mongoose')

const JobPostingSchema = new mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: 'JobTemplate' },
    roleSlug: { type: String, required: true },
    positions: { type: Number, default: 1 },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    workHours: { type: String },
    weeklyOffPattern: { type: String },
    requirements: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    status: { type: String, enum: ['open','filled','closed'], default: 'open' },
    urgency: { type: String, enum: ['normal','urgent','immediate'], default: 'normal' },
  },
  { timestamps: true }
)
JobPostingSchema.index({ roleSlug: 1, status: 1 })

module.exports = mongoose.models.JobPosting || mongoose.model('JobPosting', JobPostingSchema)
