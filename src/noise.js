(function (root) {
  const { mix, smooth } = typeof module !== 'undefined' ? require('./math') : root.SpaceMath;
  function hash(x, y, z) {
    let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 2147483647)) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }
  function noise(x, y, z) {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const tx = smooth(0, 1, x - ix), ty = smooth(0, 1, y - iy), tz = smooth(0, 1, z - iz);
    const a = mix(hash(ix, iy, iz), hash(ix + 1, iy, iz), tx);
    const b = mix(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), tx);
    const c = mix(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), tx);
    const d = mix(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), tx);
    return mix(mix(a, b, ty), mix(c, d, ty), tz);
  }
  function fbm(x, y, z, octaves = 4) {
    let sum = 0, weight = 0, amplitude = 0.5, frequency = 1;
    for (let i = 0; i < octaves; i++) {
      sum += noise(x * frequency, y * frequency, z * frequency) * amplitude;
      weight += amplitude; amplitude *= 0.5; frequency *= 2;
    }
    return sum / weight;
  }
  const api = { hash, noise, fbm };
  if (typeof module !== 'undefined') module.exports = api;
  else root.SpaceNoise = api;
})(globalThis);
