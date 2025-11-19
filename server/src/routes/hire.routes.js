const { Router } = require('express')
const { massHire } = require('../controllers/candidates.controller')

const router = Router()

router.post('/mass', massHire)

module.exports = router
