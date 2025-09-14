// src/files.routes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const crypto = require('crypto');

const { merkleRoot } = require('./hash.utils');
const FileMeta = require('./files.model');
const upload = require('./upload.middleware');
const { chunkFile } = require('./chunk.service');

const router = express.Router();

function nodePath(node) {
  return path.join(process.cwd(), node);
}

function fileHashSha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (d) => hash.update(d));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

// POST /upload
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ownerId = req.user.id; // from auth middleware

    const originalName = req.file.originalname;
    const detectedType =
      req.file.mimetype || mime.lookup(originalName) || 'application/octet-stream';
    const fileId = path.parse(req.file.filename).name;

    // Split into chunks and compute per-chunk hashes
    const { chunks, chunkHashes, sizeBytes } = await chunkFile({
      fileId,
      srcPath: req.file.path,
    });

    // Compute whole-file hash and Merkle root
    const fileHash = await fileHashSha256(req.file.path);
    const root = merkleRoot(chunkHashes);

    const meta = {
      fileId,
      fileName: originalName,
      fileType: detectedType,
      chunks: chunks.map(({ node, chunkName }) => ({ node, chunkName })),
      uploadedAt: new Date(),
      sizeBytes,
      fileHash,
      merkleRoot: root,
      chunkHashes,
      ownerId, // enforce ownership server-side
    };

    // Persist
    const doc = await FileMeta.create(meta);

    // Respond (shape as needed; avoid leaking internal fields)
    res.status(201).json({
      fileId: doc.fileId,
      fileName: doc.fileName,
      fileType: doc.fileType,
      uploadedAt: doc.uploadedAt,
      sizeBytes: doc.sizeBytes,
      totalChunks: doc.chunks.length,
    });

    // Cleanup temp file
    fs.unlink(req.file.path, () => {});
  } catch (e) {
    next(e);
  }
});


// GET /files
router.get('/files', async (req, res, next) => {
  try {
    const ownerId = req.user.id; // from auth middleware

    const list = await FileMeta.find(
      { ownerId }, // scope to current user
      { fileId: 1, fileName: 1, fileType: 1, uploadedAt: 1, sizeBytes: 1, chunks: 1, _id: 0 }
    ).lean();

    const shaped = list.map((f) => ({
      fileId: f.fileId,
      fileName: f.fileName,
      fileType: f.fileType,
      uploadedAt: f.uploadedAt,
      sizeBytes: f.sizeBytes,
      totalChunks: f.chunks?.length ?? 0,
    }));

    res.json(shaped);
  } catch (e) {
    next(e);
  }
});



// GET /download/:fileId
router.get('/download/:fileId', async (req, res, next) => {
  try {
    const ownerId = req.user.id; // ensure middleware mounted
    const meta = await FileMeta.findOne({ fileId: req.params.fileId, ownerId }).lean();
    if (!meta) return res.status(404).json({ error: 'File not found' });

    res.setHeader('Content-Type', meta.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${meta.fileName || meta.fileId}"`);

    // If chunk order matters, ensure deterministic order:
    const chunks = meta.chunks; // adjust if you store an index
    let i = 0;
    const pipeNext = () => {
      if (i >= chunks.length) return res.end();
      const { node, chunkName } = chunks[i];
      const chunkPath = path.join(nodePath(node), chunkName);

      const stream = fs.createReadStream(chunkPath);
      stream.on('error', (err) => {
        console.error('Chunk read error:', err);
        if (!res.headersSent) res.status(500).end();
        else res.end();
      });
      stream.on('end', () => { i += 1; pipeNext(); });
      stream.pipe(res, { end: false });
    };

    pipeNext();
  } catch (e) { next(e); }
});


router.get('/storage/usage', async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const [{ used = 0 } = {}] = await FileMeta.aggregate([
      { $match: { ownerId } },
      { $group: { _id: null, used: { $sum: '$sizeBytes' } } }
    ]);

    const GB = 1024 ** 3;
    const MB = 1024 ** 2;
    const limitBytes = 5 * GB; // 5 GB plan

    const usedMB = used / MB;
    const usedGB = used / GB;
    const limitGB = limitBytes / GB;

    // helper to format used in MB until 1 GB, else GB
    const usedLabel = used < GB
      ? `${usedMB.toFixed(2).replace(/\.00$/, '')} MB`
      : `${usedGB.toFixed(2).replace(/\.00$/, '')} GB`;

    res.json({
      usedBytes: used,
      limitBytes,
      usedLabel,
      limitLabel: `${limitGB.toFixed(2).replace(/\.00$/, '')} GB`,
      percent: Math.min(100, Math.round((used / limitBytes) * 100)),
    });
  } catch (e) { next(e); }
});



// GET /verify/:fileId
router.get('/verify/:fileId', async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const meta = await FileMeta.findOne({ fileId: req.params.fileId, ownerId }).lean();
    if (!meta) return res.status(404).json({ error: 'File not found' });

    const recomputed = [];
    for (let i = 0; i < meta.chunks.length; i++) {
      const { node, chunkName } = meta.chunks[i];
      const p = path.join(nodePath(node), chunkName);
      const buf = fs.readFileSync(p);
      const h = crypto.createHash('sha256').update(buf).digest('hex');
      recomputed.push(h);
    }

    const rootNow = merkleRoot(recomputed);

    const whole = crypto.createHash('sha256');
    for (let i = 0; i < meta.chunks.length; i++) {
      const { node, chunkName } = meta.chunks[i];
      const p = path.join(nodePath(node), chunkName);
      const data = fs.readFileSync(p);
      whole.update(data);
    }
    const fileNow = whole.digest('hex');





    res.json({
      fileId: meta.fileId,
      merkleRootMatches: rootNow === meta.merkleRoot,
      fileHashMatches: fileNow === meta.fileHash,
      merkleRootExpected: meta.merkleRoot,
      merkleRootActual: rootNow,
      fileHashExpected: meta.fileHash,
      fileHashActual: fileNow,
    });
  } catch (e) { next(e); }
});



module.exports = router;
