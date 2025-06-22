const express = require('express');
const { register, login } = require('../controllers/authController');
const { validate, validateRegistrationSchema, validateLoginSchema } = require('../middleware/validation');

const router = express.Router();

router.post('/register', validate(validateRegistrationSchema), register);
router.post('/login', validate(validateLoginSchema), login);

module.exports = router;