const http = require('http')
const dotenv = require('dotenv')
const { connectDB } = require('./config/db')
const app = require('./app')
const { init: initSocket } = require('./realtime/socket')

dotenv.config()

const PORT = process.env.PORT || process.env.port || 5000

;(async () => {
  try {
    await connectDB()
    const server = http.createServer(app)
    initSocket(server)
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
})()
