const mongoose = require('mongoose')

const JobTemplateSchema = new mongoose.Schema(
  {
    roleSlug: { type: String, required: true, index: true },
    displayName: { type: String, required: true },
    salaryMin: { type: Number, required: true },
    salaryMax: { type: Number, required: true },
    shifts: { type: [String], default: [] },
    weeklyOffPattern: { type: String },
    requiredEducation: { type: String },
    experienceLevels: { type: [String], default: [] },
    mustHaveSkills: { type: [String], default: [] },
    languageRequirements: { type: [String], default: [] },
  },
  { timestamps: true }
)
JobTemplateSchema.index({ roleSlug: 1 }, { unique: false })

module.exports = mongoose.models.JobTemplate || mongoose.model('JobTemplate', JobTemplateSchema)
