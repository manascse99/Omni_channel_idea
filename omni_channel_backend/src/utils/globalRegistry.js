const registry = new Map();

module.exports = {
  set: (key, value) => registry.set(key, value),
  get: (key) => registry.get(key)
};
