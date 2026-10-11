const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { getDemoArtefacts } = require('./demoArtefacts');

const storePath = path.join(__dirname, 'artefacts.local.json');
let pendingWrite = Promise.resolve();

const matchesId = (record, id) =>
  [record.id, record._id, record.artefactId, record.digitalId]
    .some((value) => value !== undefined && value !== null && String(value) === String(id));

const readRecords = async () => {
  try {
    const content = await fs.readFile(storePath, 'utf8');
    const records = JSON.parse(content);
    if (!Array.isArray(records)) {
      throw new Error('Local artefact store must contain a JSON array.');
    }
    return records;
  } catch (error) {
    if (error.code === 'ENOENT') return getDemoArtefacts();
    throw error;
  }
};

const writeRecords = async (records) => {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  const temporaryPath = `${storePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporaryPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
    await fs.rename(temporaryPath, storePath);
  } catch (error) {
    try {
      await fs.unlink(temporaryPath);
    } catch (cleanupError) {
      if (cleanupError.code !== 'ENOENT') {
        console.error('Could not clean temporary local artefact store file:', cleanupError);
      }
    }
    throw error;
  }
};

const mutateRecords = (mutator) => {
  const operation = pendingWrite.then(async () => {
    const records = await readRecords();
    const result = await mutator(records);
    await writeRecords(records);
    return result;
  });
  pendingWrite = operation.catch(() => {});
  return operation;
};

const list = async () => {
  await pendingWrite;
  return readRecords();
};

const findById = async (id) => {
  const records = await list();
  return records.find((record) => matchesId(record, id)) || null;
};

const create = async (fields) => mutateRecords((records) => {
  if (typeof fields.name !== 'string' || !fields.name.trim()) {
    const error = new Error('Artefact name is required.');
    error.status = 400;
    throw error;
  }
  if (typeof fields.imageUrl !== 'string' || !fields.imageUrl.trim()) {
    const error = new Error('Artefact image URL is required.');
    error.status = 400;
    throw error;
  }
  if (fields.digitalId && records.some((record) => record.digitalId === fields.digitalId)) {
    const error = new Error('An artefact with this digital ID is already registered.');
    error.status = 409;
    throw error;
  }
  const today = new Date().toISOString();
  const digitalId = fields.digitalId || `HT-${crypto.randomInt(10000, 100000)}`;
  if (records.some((record) => record.digitalId === digitalId)) {
    const error = new Error('Generated artefact ID already exists; please retry registration.');
    error.status = 409;
    throw error;
  }
  const created = {
    ...fields,
    id: digitalId,
    _id: digitalId,
    digitalId,
    createdAt: today,
    updatedAt: today,
  };
  records.unshift(created);
  return created;
});

const update = async (id, fields) => mutateRecords((records) => {
  const index = records.findIndex((record) => matchesId(record, id));
  if (index === -1) return null;
  const current = records[index];
  records[index] = {
    ...current,
    ...fields,
    id: current.id,
    _id: current._id,
    digitalId: current.digitalId,
    updatedAt: new Date().toISOString(),
  };
  return records[index];
});

const remove = async (id) => mutateRecords((records) => {
  const index = records.findIndex((record) => matchesId(record, id));
  if (index === -1) return null;
  return records.splice(index, 1)[0];
});

module.exports = { list, findById, create, update, remove };
