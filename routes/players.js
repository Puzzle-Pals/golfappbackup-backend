const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const auth = require('../middleware/auth');

router.get('/', auth, playerController.getPlayers);
router.post('/', auth, playerController.addPlayer);
router.put('/:id', auth, playerController.updatePlayer);
router.delete('/:id', auth, playerController.deletePlayer);
router.post('/bulk', auth, playerController.bulkUploadPlayers);

module.exports = router;