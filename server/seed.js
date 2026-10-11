const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Artefact = require('./models/Artefact');
const { DEMO_ARTEFACTS } = require('./data/demoArtefacts');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI must be configured before seeding MongoDB.');
    }
    console.log('Connecting to the configured MongoDB database...');
    await mongoose.connect(mongoUri);

    console.log('Clearing existing artefacts...');
    await Artefact.deleteMany();

    console.log('Seeding curated Indian heritage artefacts...');
    const inserted = await Artefact.insertMany(DEMO_ARTEFACTS);

    console.log(`✅ Successfully seeded ${inserted.length} artefacts into database.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { seedDB, DEMO_ARTEFACTS };
