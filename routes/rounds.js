const express = require('express');
const router = express.Router();
const roundController = require('../controllers/roundController');
const auth = require('../middleware/auth');

router.get('/', auth, roundController.getRounds);
router.post('/', auth, roundController.addRound);
router.delete('/:id', auth, roundController.deleteRound);

module.exports = router;