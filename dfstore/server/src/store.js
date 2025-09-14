// super-simple in-memory store
const _map = new Map();
module.exports = {
  set: (id, meta) => _map.set(id, meta),
  get: (id) => _map.get(id),
  list: () => Array.from(_map.values()),
};
