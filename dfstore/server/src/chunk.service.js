// src/chunk.service.js
const fs = require('fs');
const path = require('path');
const { sha256Hex } = require('./hash.utils');

const NODES = ['node1','node2','node3'];
const CHUNK_SIZE = 1024 * 1024;

function nodePath(node) { return path.join(process.cwd(), node); }

async function chunkFile({ fileId, srcPath }) {
  const stat = fs.statSync(srcPath);
  const totalChunks = Math.ceil(stat.size / CHUNK_SIZE);
  const chunks = [];
  const chunkHashes = [];

  const fd = fs.openSync(srcPath, 'r');
  try {
    for (let i = 0; i < totalChunks; i++) {
      const node = NODES[i % NODES.length];
      const chunkName = `${fileId}_${i}.chunk`;
      const dest = path.join(nodePath(node), chunkName);

      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, stat.size);
      const size = end - start;

      const buffer = Buffer.alloc(size);
      fs.readSync(fd, buffer, 0, size, start);

      // hash before writing
      const hash = sha256Hex(buffer);
      chunkHashes.push(hash);

      fs.writeFileSync(dest, buffer);
      chunks.push({ node, chunkName, index: i });
    }
  } finally {
    fs.closeSync(fd);
  }
  return { chunks, chunkHashes, sizeBytes: stat.size };
}

module.exports = { chunkFile, CHUNK_SIZE };
