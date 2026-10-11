const express = require('express');
const router = express.Router();
const imageUpload = require('../middleware/upload');
const {
  getArtefacts,
  getArtefactById,
  createArtefact,
  updateArtefact,
  deleteArtefact,
} = require('../controllers/artefactController');

// GET    /api/artefacts      — Get all artefacts (with filters)
// POST   /api/artefacts      — Create a new artefact
router.route('/').get(getArtefacts).post(imageUpload.single('image'), createArtefact);

// GET    /api/artefacts/:id  — Get single artefact
// PUT    /api/artefacts/:id  — Update artefact
// DELETE /api/artefacts/:id  — Delete artefact
router.route('/:id').get(getArtefactById).put(updateArtefact).delete(deleteArtefact);

module.exports = router;
