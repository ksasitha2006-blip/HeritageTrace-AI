const express = require('express');
const {
  getArtefacts,
  getArtefactById,
  createArtefact,
  updateArtefact,
  deleteArtefact,
} = require('../controllers/artefactController');

const router = express.Router();

router.route('/').get(getArtefacts).post(createArtefact);
router.route('/:id').get(getArtefactById).put(updateArtefact).delete(deleteArtefact);

module.exports = router;
