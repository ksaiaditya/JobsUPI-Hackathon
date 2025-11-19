const { Router } = require('express')
const { startSession, listSessions, stopSession, registerScan, registerCandidate } = require('../controllers/qr.controller')

const router = Router()

router.get('/sessions', listSessions)
router.post('/sessions', startSession)
router.patch('/sessions/:id/stop', stopSession)

router.post('/scan', registerScan)
router.post('/register', registerCandidate)

module.exports = router
