const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const artefactRoutes = require('./routes/artefactRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Initialize Express app
const app = express();

// ========================================
// Middleware
// ========================================

// Enable CORS for frontend
const allowedOrigins = new Set([
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
].filter(Boolean));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve registered artefact images from stable URLs stored in MongoDB.
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// HTTP request logger (dev mode)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ========================================
// Routes
// ========================================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HeritageTrace AI API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/artefacts', artefactRoutes);
app.use('/api/stats', statsRoutes);

// Global error handler (must be after routes)
app.use(errorHandler);

// ========================================
// Start Server
// ========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🏛️  HeritageTrace AI Server`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Port:        ${PORT}`);
    console.log(`   API:         http://localhost:${PORT}/api`);
    console.log(`   Health:      http://localhost:${PORT}/api/health\n`);
  });
};

startServer();
