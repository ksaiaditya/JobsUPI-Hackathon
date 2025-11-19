const mongoose = require('mongoose')

const EmployerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    companyName: { type: String },
    address: { type: String },
    geo: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], default: undefined } },
    preferredRadiusKm: { type: Number, default: 5 },
    pastHires: [{ candidateId: mongoose.Schema.Types.ObjectId, role: String, hiredAt: Date }],
    languages: { type: [String], default: [] },
  },
  { timestamps: true }
)
EmployerSchema.index({ geo: '2dsphere' })

module.exports = mongoose.models.Employer || mongoose.model('Employer', EmployerSchema)
