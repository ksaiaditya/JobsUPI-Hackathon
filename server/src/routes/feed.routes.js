const { Router } = require('express')
const { feed } = require('../controllers/candidates.controller')

const router = Router()

router.get('/', feed)

module.exports = router
