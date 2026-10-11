const { randomUUID } = require('crypto');
const mongoose = require('mongoose');

const artefactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: { type: String, trim: true, maxlength: 2000 },
    origin: { type: String, trim: true },
    period: { type: String, trim: true },
    material: { type: String, trim: true },
    category: {
      type: String,
      enum: ['sculpture', 'painting', 'manuscript', 'coin', 'jewellery', 'textile', 'pottery', 'other'],
      default: 'other',
    },
    dimensions: { type: String, trim: true },
    temple: { type: String, trim: true },
    currentLocation: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    images: {
      type: [String],
      default: [],
    },
    digitalId: {
      type: String,
      unique: true,
      default: () => `HT-${randomUUID()}`,
    },
    status: {
      type: String,
      enum: ['safe', 'missing', 'endangered', 'recovered'],
      default: 'safe',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Artefact', artefactSchema);