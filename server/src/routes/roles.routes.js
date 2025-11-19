const { Router } = require('express')
const { listTemplates, suggestForRole, matchForRole, getTemplate, createTemplate, updateTemplate, deleteTemplate } = require('../controllers/roles.controller')

const router = Router()

router.get('/templates', listTemplates)
router.post('/templates', createTemplate)
router.get('/templates/:id', getTemplate)
router.put('/templates/:id', updateTemplate)
router.delete('/templates/:id', deleteTemplate)
router.get('/suggest', suggestForRole)
router.get('/match', matchForRole)

module.exports = router
