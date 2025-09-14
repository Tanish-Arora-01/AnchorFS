// models/File.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChunkSchema = new Schema({
  node: String,
  chunkName: String,
  // other per-chunk fields if any
}, { _id: false });

const FileSchema = new Schema({
  fileId: { type: String, required: true, unique: true, index: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  uploadedAt: { type: Date, required: true, index: true },
  sizeBytes: { type: Number, required: true },
  fileHash: { type: String, required: true },
  merkleRoot: { type: String, required: true },
  chunkHashes: { type: [String], required: true },
  chunks: { type: [ChunkSchema], required: true },
  ownerId: { type: String, required: true, index: true }, // NEW
});

FileSchema.index({ ownerId: 1, uploadedAt: -1 });

module.exports = mongoose.model('FileMeta', FileSchema);
