const { Router } = require('express')
const { seed } = require('../controllers/dev.controller')

const router = Router()

router.post('/seed', seed)

module.exports = router
