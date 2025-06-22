const express = require('express');
const { searchByName, searchByPhone } = require('../controllers/searchController');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateNameSearchSchema, validatePhoneSearchSchema } = require('../middleware/validation');

const router = express.Router();

router.get('/name', authenticateToken, validate(validateNameSearchSchema), searchByName);
router.get('/phone', authenticateToken, validate(validatePhoneSearchSchema), searchByPhone);

module.exports = router;