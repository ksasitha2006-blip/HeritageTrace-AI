const path = require('path');
const fs = require('fs/promises');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Artefact = require('../models/Artefact');
const { DEMO_ARTEFACTS } = require('../data/demoArtefacts');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || 'http://localhost:8001').replace(/\/$/, '');
const RECONCILED_IDS = new Set(['HT-49281', 'HT-39266', 'HT-11767', 'HT-37049']);

const getLocalImagePath = (imageUrl) => {
  const pathname = new URL(imageUrl, 'http://local.invalid').pathname;
  const decodedPath = decodeURIComponent(pathname);
  let baseDirectory;
  let relativePath;

  if (decodedPath.startsWith('/images/')) {
    baseDirectory = path.join(PROJECT_ROOT, 'client', 'public', 'images');
    relativePath = decodedPath.slice('/images/'.length);
  } else if (decodedPath.startsWith('/uploads/')) {
    baseDirectory = path.join(__dirname, '..', 'public', 'uploads');
    relativePath = decodedPath.slice('/uploads/'.length);
  } else {
    throw new Error(`Image URL is not a recognized local asset: ${imageUrl}`);
  }

  const resolvedPath = path.resolve(baseDirectory, relativePath);
  if (!resolvedPath.startsWith(`${baseDirectory}${path.sep}`)) {
    throw new Error(`Image URL resolves outside its public directory: ${imageUrl}`);
  }
  return resolvedPath;
};

const getMimeType = (filePath) => ({
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
})[path.extname(filePath).toLowerCase()];

const indexArtefact = async (artefact) => {
  const identifier = String(artefact.digitalId || artefact._id);
  const imagePath = getLocalImagePath(artefact.imageUrl);
  const imageBytes = await fs.readFile(imagePath);
  const mimeType = getMimeType(imagePath);
  if (!mimeType) {
    throw new Error(`Unsupported image format for ${identifier}: ${imagePath}`);
  }

  const formData = new FormData();
  formData.append('artefact_id', identifier);
  formData.append('name', artefact.name);
  formData.append('image_url', artefact.imageUrl);
  formData.append('image', new Blob([imageBytes], { type: mimeType }), path.basename(imagePath));

  const response = await fetch(`${AI_SERVICE_URL}/api/similarity/index`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(300000),
  });
  if (!response.ok) {
    throw new Error(`AI indexing failed for ${identifier} with status ${response.status}`);
  }
};

const reconcile = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI must be configured before reconciling MongoDB artefacts.');
  }
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

  const canonicalRecords = DEMO_ARTEFACTS.filter((artefact) => RECONCILED_IDS.has(artefact.digitalId));
  for (const record of canonicalRecords) {
    const { id, createdAt, updatedAt, ...fields } = record;
    await Artefact.updateOne(
      { digitalId: record.digitalId },
      { $set: fields },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
  }

  const removal = await Artefact.deleteMany({ digitalId: { $in: ['HT-57788', 'HT-37849'] } });
  const artefacts = await Artefact.find({}).lean();
  const ids = artefacts.map((artefact) => String(artefact.digitalId || artefact._id));
  if (new Set(ids).size !== ids.length) {
    throw new Error('MongoDB contains duplicate artefact identifiers; AI re-indexing was stopped.');
  }

  for (const staleId of ['HT-57788', 'HT-37849']) {
    const staleIndexResponse = await fetch(`${AI_SERVICE_URL}/api/similarity/index/${staleId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(10000),
    });
    if (!staleIndexResponse.ok && staleIndexResponse.status !== 404) {
      throw new Error(`Could not remove stale AI index entry ${staleId} (status ${staleIndexResponse.status}).`);
    }
  }

  for (const artefact of artefacts) {
    if (!artefact.name || !artefact.imageUrl) {
      throw new Error(`Artefact ${artefact.digitalId || artefact._id} is missing a name or image URL.`);
    }
    await indexArtefact(artefact);
  }

  console.log(`Reconciled canonical artefacts; removed ${removal.deletedCount} stale Ganesh/Nataraja record(s).`);
  console.log(`Re-indexed ${artefacts.length} MongoDB artefact image(s) in the AI service.`);
};

reconcile()
  .catch((error) => {
    console.error(`Artefact reconciliation failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
