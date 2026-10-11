const mongoose = require('mongoose');

/**
 * Artefact Schema
 * Represents a single heritage artefact with its metadata.
 */
const artefactSchema = new mongoose.Schema(
  {
    // Basic info
    name: {
      type: String,
      required: [true, 'Artefact name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // Historical context
    origin: {
      type: String,
      trim: true,
    },
    period: {
      type: String,
      trim: true,
    },

    // Classification
    category: {
      type: String,
      enum: ['sculpture', 'painting', 'manuscript', 'coin', 'jewellery', 'textile', 'pottery', 'other'],
      default: 'other',
    },

    // Current status
    status: {
      type: String,
      enum: ['safe', 'missing', 'endangered', 'recovered'],
      default: 'safe',
    },

    // Physical attributes
    material: {
      type: String,
      trim: true,
    },
    dimensions: {
      type: String,
      trim: true,
    },

    // Location
    currentLocation: {
      type: String,
      trim: true,
    },
    digitalId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    // Media
    imageUrl: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: String,
        caption: String,
      },
    ],
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Text index for search functionality
artefactSchema.index({ name: 'text', description: 'text', origin: 'text' });

module.exports = mongoose.model('Artefact', artefactSchema);
