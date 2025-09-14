const crypto = require('crypto');

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// Build parent from bytes of child hashes; return a single hex string root
function merkleRoot(hashes) {
  if (!hashes || hashes.length === 0) return null;
  let level = hashes.slice(); // array of hex strings

  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] || left; // duplicate last if odd
      const parent = sha256Hex(
        Buffer.concat([
          Buffer.from(left, 'hex'),
          Buffer.from(right, 'hex'),
        ])
      );
      next.push(parent);
    }
    level = next;
  }

  return level[0]; // return single hex string
}


module.exports = { sha256Hex, merkleRoot };
