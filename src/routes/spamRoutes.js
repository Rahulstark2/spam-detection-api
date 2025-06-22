const express = require('express');
const { reportSpam, getSpamStatus } = require('../controllers/spamController');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateSpamReportSchema, validatePhoneSearchSchema } = require('../middleware/validation');

const router = express.Router();

router.post('/report', authenticateToken, validate(validateSpamReportSchema), reportSpam);
router.get('/status', authenticateToken, validate(validatePhoneSearchSchema), getSpamStatus);

module.exports = router;