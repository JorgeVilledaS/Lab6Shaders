(function (root) {
  const m = typeof module !== 'undefined' ? require('./math') : root.SpaceMath;
  const { fbm, noise } = typeof module !== 'undefined' ? require('./noise') : root.SpaceNoise;
  const { clamp, smooth, palette, dot, normalize } = m;
  const LIGHT = normalize([-0.62, 0.72, 0.88]);
  function lit(color, n, ambient = 0.25) {
    const diffuse = Math.max(0, dot(n, LIGHT));
    return color.map(v => clamp(v * (ambient + (1 - ambient) * diffuse)));
  }
  function diagnostic(value) { const v = clamp(value); return [v, v, v]; }
  const api = { ...m, fbm, noise, LIGHT, lit, diagnostic };
  if (typeof module !== 'undefined') module.exports = api;
  else root.ShaderCommon = api;
})(globalThis);
