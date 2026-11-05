(function (root) {
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const palette = (a, b, t) => a.map((v, i) => mix(v, b[i], clamp(t)));
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const normalize = v => { const l = Math.hypot(...v) || 1; return v.map(x => x / l); };
  const rotate = (p, yaw, pitch) => {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
    const x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy;
    return [x, p[1] * cx - z * sx, p[1] * sx + z * cx];
  };
  const api = { clamp, mix, smooth, palette, dot, normalize, rotate };
  if (typeof module !== 'undefined') module.exports = api;
  else root.SpaceMath = api;
})(globalThis);
