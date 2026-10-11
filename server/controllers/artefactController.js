const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const Artefact = require('../models/Artefact');
const { filterDemoArtefacts } = require('../data/demoArtefacts');
const localArtefactStore = require('../data/localArtefactStore');
const projectRoot = path.resolve(__dirname, '..', '..');
const useLocalDemoData = () => mongoose.connection.readyState !== 1;
const aiServiceUrl = (process.env.AI_SERVICE_URL || 'http://localhost:8001').replace(/\/$/, '');
const imageMimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
};

const resolvePublicImagePath = (imageUrl) => {
  let pathname;
  const serverPublicUrl = process.env.SERVER_PUBLIC_URL
    || `http://localhost:${process.env.PORT || 5000}`;
  const allowedOrigins = new Set([
    new URL(serverPublicUrl).origin,
    ...(process.env.CLIENT_URL ? [new URL(process.env.CLIENT_URL).origin] : []),
  ]);
  try {
    const parsedUrl = new URL(imageUrl, 'http://local.invalid');
    if (parsedUrl.origin !== 'http://local.invalid' && !allowedOrigins.has(parsedUrl.origin)) {
      throw new Error('Image URL must use the configured server or client origin.');
    }
    pathname = parsedUrl.pathname;
  } catch {
    throw new Error('Image URL must point to a local public image on a configured origin.');
  }

  let baseDirectory;
  let relativePath;
  if (pathname.startsWith('/images/')) {
    baseDirectory = path.join(projectRoot, 'client', 'public', 'images');
    relativePath = pathname.slice('/images/'.length);
  } else if (pathname.startsWith('/uploads/')) {
    baseDirectory = path.join(__dirname, '..', 'public', 'uploads');
    relativePath = pathname.slice('/uploads/'.length);
  } else {
    throw new Error('Image URL must point to a local /images or /uploads image.');
  }

  const resolvedPath = path.resolve(baseDirectory, decodeURIComponent(relativePath));
  if (!resolvedPath.startsWith(`${baseDirectory}${path.sep}`)) {
    throw new Error('Image URL resolves outside its public image directory.');
  }
  if (!imageMimeTypes[path.extname(resolvedPath).toLowerCase()]) {
    throw new Error('Only JPEG, PNG, WebP, and BMP images can be indexed.');
  }
  return resolvedPath;
};

const removeUploadedFile = async (file) => {
  if (!file) return;
  try {
    await fs.unlink(file.path);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Could not remove uploaded artefact image:', error);
    }
  }
};

const removeAiIndex = async (artefactId) => {
  try {
    const response = await fetch(`${aiServiceUrl}/api/similarity/index/${artefactId}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 404) {
      console.error(`AI feature-index cleanup failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('AI feature-index cleanup failed:', error);
  }
};

/**
 * @desc    Get all artefacts (with optional filters)
 * @route   GET /api/artefacts
 * @query   status, category, search, limit, sort
 */
const getArtefacts = async (req, res) => {
  try {
    const { status, category, search, limit, sort } = req.query;

    if (useLocalDemoData()) {
      const demoArtefacts = filterDemoArtefacts(await localArtefactStore.list(), {
        status, category, search, limit, sort,
      });
      return res.status(200).json({
        success: true,
        count: demoArtefacts.length,
        data: demoArtefacts,
      });
    }

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
      ];
    }

    let query = Artefact.find(filter);

    if (sort) {
      query = query.sort(sort);
    } else {
      query = query.sort('-createdAt');
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const artefacts = await query;

    res.status(200).json({
      success: true,
      count: artefacts.length,
      data: artefacts,
    });
  } catch (error) {
    console.error('Error fetching artefacts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get a single artefact by ID
 * @route   GET /api/artefacts/:id
 */
const getArtefactById = async (req, res) => {
  try {
    if (useLocalDemoData()) {
      const artefact = await localArtefactStore.findById(req.params.id);

      if (!artefact) {
        return res.status(404).json({ success: false, message: 'Artefact not found' });
      }

      return res.status(200).json({ success: true, data: artefact });
    }

    const artefact = await Artefact.findById(req.params.id);

    if (!artefact) {
      return res.status(404).json({ success: false, message: 'Artefact not found' });
    }

    res.status(200).json({ success: true, data: artefact });
  } catch (error) {
    console.error('Error fetching artefact:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create a new artefact
 * @route   POST /api/artefacts
 */
const createArtefact = async (req, res) => {
  let artefact;
  let useFallbackStorage = false;
  try {
    if (typeof req.body.name !== 'string' || !req.body.name.trim()) {
      return res.status(400).json({ success: false, message: 'Artefact name is required.' });
    }
    if (!req.file && !(typeof req.body.imageUrl === 'string' && req.body.imageUrl.trim())) {
      return res.status(400).json({
        success: false,
        message: 'An artefact image or image URL is required.',
      });
    }
    if (!req.file) {
      try {
        resolvePublicImagePath(req.body.imageUrl);
      } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
    }

    const imageUrl = req.file
      ? `${(process.env.SERVER_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '')}/uploads/${req.file.filename}`
      : req.body.imageUrl;
    const imagePath = req.file ? req.file.path : resolvePublicImagePath(imageUrl);
    const imageBytes = await fs.readFile(imagePath);
    const contentType = req.file
      ? req.file.mimetype
      : imageMimeTypes[path.extname(imagePath).toLowerCase()];
    useFallbackStorage = useLocalDemoData();
    artefact = useFallbackStorage
      ? await localArtefactStore.create({ ...req.body, imageUrl })
      : await Artefact.create({ ...req.body, imageUrl });

    const formData = new FormData();
    try {
      formData.append('artefact_id', String(artefact.digitalId || artefact._id));
      formData.append('name', artefact.name);
      formData.append('image_url', imageUrl);
      formData.append(
        'image',
        new Blob([imageBytes], { type: contentType }),
        req.file ? path.basename(req.file.originalname) : path.basename(imagePath)
      );

      const indexResponse = await fetch(`${aiServiceUrl}/api/similarity/index`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(300000),
      });
      if (!indexResponse.ok) {
        const detail = await indexResponse.text();
        throw new Error(`AI feature indexing failed (${indexResponse.status}): ${detail}`);
      }
    } catch (error) {
      if (!useFallbackStorage) throw error;
      console.warn(`Artefact saved locally, but AI indexing is pending: ${error.message}`);
      return res.status(201).json({
        success: true,
        data: artefact,
        storage: 'local-fallback',
        aiIndexed: false,
        message: 'Artefact saved locally. AI visual indexing will be available when the AI service reconnects.',
      });
    }

    res.status(201).json({
      success: true,
      data: artefact,
      ...(useFallbackStorage && { storage: 'local-fallback' }),
      aiIndexed: true,
    });
  } catch (error) {
    console.error('Error creating artefact:', error);

    if (artefact?._id && !useFallbackStorage) {
      await removeAiIndex(artefact.digitalId || artefact._id);
      try {
        await Artefact.findByIdAndDelete(artefact._id);
      } catch (cleanupError) {
        console.error('Could not roll back artefact after image-index failure:', cleanupError);
      }
    }
    if (req.file) {
      await removeUploadedFile(req.file);
    }
    if (artefact?._id && useFallbackStorage) {
      return res.status(error.status || 500).json({
        success: false,
        message: 'Could not save the artefact to persistent local storage.',
      });
    }
    if (req.file || artefact?._id) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((item) => item.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
      }
      return res.status(502).json({
        success: false,
        message: 'Image registration failed because AI feature indexing could not be completed.',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update an artefact
 * @route   PUT /api/artefacts/:id
 */
const updateArtefact = async (req, res) => {
  try {
    if (useLocalDemoData()) {
      const updated = await localArtefactStore.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Artefact not found' });
      }
      return res.status(200).json({ success: true, data: updated });
    }

    const artefact = await Artefact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!artefact) {
      return res.status(404).json({ success: false, message: 'Artefact not found' });
    }

    res.status(200).json({ success: true, data: artefact });
  } catch (error) {
    console.error('Error updating artefact:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete an artefact
 * @route   DELETE /api/artefacts/:id
 */
const deleteArtefact = async (req, res) => {
  try {
    if (useLocalDemoData()) {
      const deleted = await localArtefactStore.remove(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Artefact not found' });
      }
      await removeAiIndex(deleted.digitalId || deleted._id);
      return res.status(200).json({ success: true, message: 'Artefact deleted' });
    }

    const idQuery = [
      { artefactId: req.params.id },
      { digitalId: req.params.id },
    ];
    if (mongoose.isValidObjectId(req.params.id)) {
      idQuery.push({ _id: req.params.id });
    }
    const artefact = await Artefact.findOneAndDelete({ $or: idQuery });

    if (!artefact) {
      return res.status(404).json({ success: false, message: 'Artefact not found' });
    }

    await removeAiIndex(artefact.digitalId || artefact._id);
    res.status(200).json({ success: true, message: 'Artefact deleted' });
  } catch (error) {
    console.error('Error deleting artefact:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getArtefacts,
  getArtefactById,
  createArtefact,
  updateArtefact,
  deleteArtefact,
};
