const { Router } = require('express')
const { search, updateStatus, createCandidate, updateStatusByBody } = require('../controllers/candidates.controller')

const router = Router()

router.get('/search', search)
router.post('/', createCandidate)
router.patch('/status', updateStatusByBody)
router.patch('/:id/status', updateStatus)

module.exports = router
