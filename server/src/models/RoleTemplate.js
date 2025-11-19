const mongoose = require('mongoose')

const RoleTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    salaryMin: { type: Number, required: true },
    salaryMax: { type: Number, required: true },
    workHours: { type: String, default: '' },
    defaultRequirements: { type: [String], default: [] },
  },
  { timestamps: true }
)

module.exports = mongoose.models.RoleTemplate || mongoose.model('RoleTemplate', RoleTemplateSchema)
