(function (root) {
  const c = typeof module !== 'undefined' ? require('./shader-common') : root.ShaderCommon;
  const { clamp, smooth, palette, fbm, noise, lit, diagnostic } = c;
  const PARAMS = { bandFrequency: 18, warpStrength: 0.24, stormLongitude: 1.9, stormLatitude: -0.13, stormSize: 0.25 };
  function gas(p, n, time = 0, options = {}) {
    const lon = Math.atan2(p[2], p[0]);
    const wind = fbm(p[0] * 4 + time * 0.1, p[1] * 5, p[2] * 4, 4) - 0.5;
    const fine = noise(p[0] * 12, p[1] * 12, p[2] * 12) - 0.5;
    const latitude = p[1] + wind * PARAMS.warpStrength + fine * 0.04;
    const band = Math.sin(latitude * PARAMS.bandFrequency + Math.sin(lon * 3 + time * 0.06) * 0.3);
    const eddy = fbm(p[0] * 9 + 4, p[1] * 14 + time * 0.1, p[2] * 9, 3);
    const pattern = clamp(0.5 + band * 0.34 + (eddy - 0.5) * 0.3);
    if (options.grayscale) return diagnostic(pattern);
    let color = palette([0.28, 0.13, 0.17], [0.73, 0.39, 0.3], smooth(0.13, 0.55, pattern));
    color = palette(color, [0.94, 0.75, 0.55], smooth(0.54, 0.9, pattern));
    // Gran tormenta elíptica con remolino interno, anclada a una latitud.
    const wrapped = Math.atan2(Math.sin(lon - PARAMS.stormLongitude), Math.cos(lon - PARAMS.stormLongitude));
    const dx = wrapped * Math.max(0.3, Math.cos(p[1]));
    const dy = p[1] - PARAMS.stormLatitude;
    const radius = Math.hypot(dx / 1.7, dy);
    const storm = 1 - smooth(PARAMS.stormSize - 0.04, PARAMS.stormSize + 0.035, radius);
    const rings = Math.sin(radius * 75 - Math.atan2(dy, dx) * 2 + time * 0.3);
    color = palette(color, palette([0.62, 0.24, 0.18], [1, 0.79, 0.6], 0.5 + rings * 0.5), storm * 0.92);
    return lit(color, n, 0.27).map(v => clamp(v));
  }
  const api = { gas, PARAMS };
  if (typeof module !== 'undefined') module.exports = api;
  else root.GasShader = api;
})(globalThis);
