const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/db');

dotenv.config();

const startServer = async () => {
	if (!process.env.JWT_SECRET) {
		throw new Error('JWT_SECRET must be set in the environment.');
	}

	await connectDB();
	const port = process.env.PORT || 5000;
	app.listen(port, () => {
		console.log(`HeritageTrace API listening on port ${port}`);
	});
};

if (require.main === module) {
	startServer().catch((error) => {
		console.error(`Failed to start server: ${error.message}`);
		process.exitCode = 1;
	});
}

module.exports = app;
