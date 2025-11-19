const mongoose = require('mongoose')

const QRSessionSchema = new mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: 'JobTemplate' },
    code: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
    geo: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], default: undefined } },
    stats: {
      scans: { type: Number, default: 0 },
      registrations: { type: Number, default: 0 },
      hires: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
)
QRSessionSchema.index({ code: 1 })
QRSessionSchema.index({ employer: 1, active: 1 })

module.exports = mongoose.models.QRSession || mongoose.model('QRSession', QRSessionSchema)
