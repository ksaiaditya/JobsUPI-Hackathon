const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const { notFound, errorHandler } = require('./middleware/errorHandler')

const app = express()

app.use(cors())
app.use(express.json())

// Normalize multiple consecutive slashes in request URL to avoid 404 on //api//... patterns
app.use((req, _res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next()
})

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'jobs_upi', time: new Date().toISOString() })
})

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
