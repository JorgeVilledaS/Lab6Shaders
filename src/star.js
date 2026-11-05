(function (root) {
  const c = typeof module !== 'undefined' ? require('./shader-common') : root.ShaderCommon;
  const { clamp, smooth, palette, fbm, noise, diagnostic } = c;
  const PARAMS = { granulation: 7.5, turbulence: 2.9, spotThreshold: 0.69, pulseSpeed: 1.4 };
  function star(p, n, time = 0, options = {}) {
    const q = [p[0] * PARAMS.granulation, p[1] * PARAMS.granulation, p[2] * PARAMS.granulation];
    const flow = fbm(p[0] * 3 + time * 0.28, p[1] * 3, p[2] * 3, 4);
    const waves = Math.sin(p[1] * 20 + PARAMS.turbulence * flow + time * 1.1);
    const grain = fbm(q[0] + time * 0.33, q[1] + waves * 0.45, q[2], 4);
    const heat = clamp(0.22 + grain * 0.75 + waves * 0.13);
    const spots = smooth(PARAMS.spotThreshold, PARAMS.spotThreshold + 0.08,
      fbm(p[0] * 5 + 8, p[1] * 5 - 2, p[2] * 5 + time * 0.15, 3));
    if (options.grayscale) return diagnostic(heat * (1 - spots * 0.7));
    let color = palette([0.55, 0.055, 0.025], [1, 0.36, 0.045], smooth(0.2, 0.65, heat));
    color = palette(color, [1, 0.92, 0.42], smooth(0.62, 0.92, heat));
    color = palette(color, [0.25, 0.045, 0.025], spots * 0.8);
    const pulse = 0.96 + 0.04 * Math.sin(time * PARAMS.pulseSpeed + noise(...q) * 5);
    return color.map(v => clamp(v * pulse)); // luz propia: no depende de LIGHT
  }
  const api = { star, PARAMS };
  if (typeof module !== 'undefined') module.exports = api;
  else root.StarShader = api;
})(globalThis);
