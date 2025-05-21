const express = require('express');
const router = express.Router();
const prizeController = require('../controllers/prizeController');
const auth = require('../middleware/auth');

router.get('/', auth, prizeController.getPrizes);
router.post('/', auth, prizeController.addPrize);

module.exports = router;