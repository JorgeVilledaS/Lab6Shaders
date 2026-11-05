(function (root) {
  const c = typeof module !== 'undefined' ? require('./shader-common') : root.ShaderCommon;
  const { clamp, smooth, palette, fbm, noise, lit, dot, LIGHT, diagnostic } = c;
  const PARAMS = { continentScale: 3.6, seaLevel: 0.52, cloudSpeed: 0.21, cloudThreshold: 0.57, iceLatitude: 0.72 };
  function cloudField(p, time) {
    const angle = time * PARAMS.cloudSpeed;
    const x = p[0] * Math.cos(angle) - p[2] * Math.sin(angle);
    const z = p[0] * Math.sin(angle) + p[2] * Math.cos(angle);
    return fbm(x * 7 + 5, p[1] * 7 - 3, z * 7 + 1, 4);
  }
  function rocky(p, n, time = 0, options = {}) {
    const terrain = fbm(p[0] * PARAMS.continentScale + 6, p[1] * PARAMS.continentScale, p[2] * PARAMS.continentScale - 8, 5);
    const detail = fbm(p[0] * 16, p[1] * 16, p[2] * 16, 3);
    const elevation = terrain + (detail - 0.5) * 0.12;
    if (options.grayscale) return diagnostic(elevation);
    const land = smooth(PARAMS.seaLevel - 0.025, PARAMS.seaLevel + 0.025, elevation);
    let ocean = palette([0.015, 0.075, 0.19], [0.04, 0.32, 0.45], smooth(0.33, PARAMS.seaLevel, elevation));
    let ground = palette([0.14, 0.31, 0.21], [0.75, 0.46, 0.22], smooth(0.49, 0.72, elevation));
    const arid = smooth(0.15, 0.7, noise(p[0] * 4 + 18, p[1] * 4, p[2] * 4));
    ground = palette(ground, [0.63, 0.38, 0.2], arid * 0.45);
    let color = palette(ocean, ground, land);
    const coast = (smooth(0.505, 0.525, elevation) - smooth(0.53, 0.55, elevation)) * 0.7;
    color = palette(color, [0.34, 0.74, 0.68], coast);
    const ice = smooth(PARAMS.iceLatitude - 0.12, PARAMS.iceLatitude, Math.abs(p[1]) + (detail - 0.5) * 0.12);
    color = palette(color, [0.78, 0.9, 0.88], ice * 0.95);
    color = lit(color, n, 0.2);
    const clouds = options.clouds === false ? 0 : smooth(PARAMS.cloudThreshold, PARAMS.cloudThreshold + 0.09, cloudField(p, time));
    if (options.clouds !== false && options.shadows !== false) {
      const displaced = [p[0] + 0.035, p[1] - 0.035, p[2] - 0.02];
      const shadow = smooth(PARAMS.cloudThreshold, PARAMS.cloudThreshold + 0.08, cloudField(displaced, time));
      color = color.map(v => v * (1 - shadow * 0.27));
    }
    color = palette(color, [0.88, 0.94, 0.9].map(v => v * (0.48 + 0.52 * Math.max(0, dot(n, LIGHT)))), clouds * 0.78);
    if (land < 0.5 && options.specular !== false) {
      const highlight = Math.pow(Math.max(0, dot(n, [0.26, 0.29, 0.92])), 35) * (1 - land) * (1 - clouds);
      color = color.map((v, i) => clamp(v + highlight * [0.55, 0.72, 0.8][i]));
    }
    return color.map(v => clamp(v));
  }
  const api = { rocky, cloudField, PARAMS };
  if (typeof module !== 'undefined') module.exports = api;
  else root.RockyShader = api;
})(globalThis);
