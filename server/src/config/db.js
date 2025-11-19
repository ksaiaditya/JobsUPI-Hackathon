const mongoose = require('mongoose')

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.DB_URL || process.env.db_url
  if (!uri) {
    console.warn('No MongoDB URL found (MONGO_URI/DB_URL/db_url). Running with in-memory store only.')
    return false
  }
  mongoose.set('strictQuery', true)
  console.log('Connecting to MongoDB...')
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    console.log('MongoDB connected')
    return true
  } catch (err) {
    console.warn('MongoDB connection failed, continuing without DB:', err.message)
    return false
  }
}

module.exports = { connectDB }
