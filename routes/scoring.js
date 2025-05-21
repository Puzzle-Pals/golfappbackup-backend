const express = require('express');
const router = express.Router();
const scoringController = require('../controllers/scoringController');
const auth = require('../middleware/auth');

router.get('/', auth, scoringController.getScoringStatus);
router.put('/', auth, scoringController.updateScoringStatus);

module.exports = router;