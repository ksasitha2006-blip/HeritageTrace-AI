const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas (or an explicitly configured MongoDB instance).
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn('⚠️  MONGODB_URI is not configured. Using persistent local artefact storage.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 8000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(
      `⚠️  MongoDB unavailable (${error.name || 'connection error'}). ` +
      'The API will use persistent local artefact storage until the database reconnects.'
    );
    return false;
  }
};

module.exports = connectDB;
