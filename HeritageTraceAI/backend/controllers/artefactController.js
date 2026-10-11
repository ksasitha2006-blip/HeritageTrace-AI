const mongoose = require('mongoose');
const Artefact = require('../models/Artefact');

const getArtefacts = async (req, res) => {
  const { status, category, search, limit, sort } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { origin: { $regex: search, $options: 'i' } },
      { temple: { $regex: search, $options: 'i' } },
    ];
  }

  let query = Artefact.find(filter).sort(sort || '-createdAt');
  if (limit) query = query.limit(Number.parseInt(limit, 10));

  const artefacts = await query;
  return res.status(200).json({
    success: true,
    count: artefacts.length,
    data: artefacts,
  });
};

const getArtefactById = async (req, res) => {
  const { id } = req.params;
  const artefact = mongoose.isValidObjectId(id)
    ? await Artefact.findById(id)
    : await Artefact.findOne({ digitalId: id });

  if (!artefact) {
    return res.status(404).json({ success: false, message: 'Artefact not found' });
  }

  return res.status(200).json({ success: true, data: artefact });
};

const createArtefact = async (req, res) => {
  const data = { ...req.body };
  if (!data.temple && data.origin) data.temple = data.origin;
  if (!data.imageUrl && data.images?.length) data.imageUrl = data.images[0];

  const artefact = await Artefact.create(data);
  return res.status(201).json({ success: true, data: artefact });
};

const updateArtefact = async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };
  if (!data.temple && data.origin) data.temple = data.origin;
  if (!data.imageUrl && data.images?.length) data.imageUrl = data.images[0];

  const artefact = mongoose.isValidObjectId(id)
    ? await Artefact.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    : await Artefact.findOneAndUpdate({ digitalId: id }, data, { new: true, runValidators: true });

  if (!artefact) {
    return res.status(404).json({ success: false, message: 'Artefact not found' });
  }

  return res.status(200).json({ success: true, data: artefact });
};

const deleteArtefact = async (req, res) => {
  const { id } = req.params;
  const artefact = mongoose.isValidObjectId(id)
    ? await Artefact.findByIdAndDelete(id)
    : await Artefact.findOneAndDelete({ digitalId: id });

  if (!artefact) {
    return res.status(404).json({ success: false, message: 'Artefact not found' });
  }

  return res.status(200).json({ success: true, message: 'Artefact deleted' });
};

module.exports = {
  getArtefacts,
  getArtefactById,
  createArtefact,
  updateArtefact,
  deleteArtefact,
};
