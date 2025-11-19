const { Router } = require('express')
const { ping } = require('../controllers/health.controller')
const roles = require('./roles.routes')
const candidates = require('./candidates.routes')
const feed = require('./feed.routes')
const offer = require('./offer.routes')
const hire = require('./hire.routes')
const dev = require('./dev.routes')
const qr = require('./qr.routes')

const router = Router()

router.get('/health', ping)
router.use('/roles', roles)
router.use('/candidates', candidates)
router.use('/feed', feed)
router.use('/offer', offer)
router.use('/hire', hire)
router.use('/qr', qr)
if (process.env.NODE_ENV !== 'production') {
	router.use('/dev', dev)
}

module.exports = router
