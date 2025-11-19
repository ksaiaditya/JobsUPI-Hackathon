let io = null

function init(server) {
  const { Server } = require('socket.io')
  io = new Server(server, { cors: { origin: '*', methods: ['GET','POST','PATCH'] } })
  io.on('connection', () => {})
  return io
}

function getIo() {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}

module.exports = { init, getIo }
