const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const auth = require('../middleware/auth');

router.get('/', auth, resultController.getResults);
router.post('/', auth, resultController.addResult);

module.exports = router;