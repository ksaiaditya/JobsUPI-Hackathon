const { Router } = require('express')
const { createOffer } = require('../controllers/offers.controller')

const router = Router()

router.post('/', createOffer)

module.exports = router
