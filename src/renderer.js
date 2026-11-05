(function (root) {
  const { clamp, normalize, rotate } = typeof module !== 'undefined' ? require('./math') : root.SpaceMath;
  const star = typeof module !== 'undefined' ? require('./star').star : root.StarShader.star;
  const rocky = typeof module !== 'undefined' ? require('./rocky').rocky : root.RockyShader.rocky;
  const gas = typeof module !== 'undefined' ? require('./gas').gas : root.GasShader.gas;
  const SHADERS = { star, rocky, gas };
  function render(mesh, opts = {}) {
    const width = opts.width || 360, height = opts.height || 360;
    const kind = opts.kind || 'star', shader = SHADERS[kind];
    if (!shader) throw new Error('Shader desconocido: ' + kind);
    const pixels = new Uint8ClampedArray(width * height * 4);
    const depth = new Float32Array(width * height).fill(-Infinity);
    const size = Math.min(width, height), radius = size * 0.405;
    const cx = width * 0.5, cy = height * 0.51;
    const yaw = opts.yaw ?? 0.35, pitch = opts.pitch ?? -0.12;
    const light = opts.options || {};
    // Fondo y halo solo en espacio de pantalla; el cuerpo usa la malla OBJ.
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4, nx = (x - cx) / size, ny = (y - cy) / size;
      const d = Math.hypot(nx, ny), glow = kind === 'star' ? Math.exp(-Math.max(0, d - 0.39) * 17) * 0.22 : 0;
      const dust = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      const point = dust - Math.floor(dust) > 0.99945 ? 0.65 : 0;
      pixels[i] = (0.025 + glow * 1.0 + point) * 255;
      pixels[i + 1] = (0.035 + glow * 0.31 + point) * 255;
      pixels[i + 2] = (0.083 + glow * 0.08 + point) * 255;
      pixels[i + 3] = 255;
    }
    const projected = mesh.vertices.map(p => {
      const r = rotate(p, yaw, pitch);
      return { x: cx + r[0] * radius, y: cy - r[1] * radius, z: r[2], p };
    });
    for (const face of mesh.faces) {
      const a = projected[face[0]], b = projected[face[1]], c = projected[face[2]];
      const area = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      if (Math.abs(area) < 0.00001) continue;
      const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
      const maxX = Math.min(width - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
      const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
      const maxY = Math.min(height - 1, Math.ceil(Math.max(a.y, b.y, c.y)));
      for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5, py = y + 0.5;
        const u = ((b.x - px) * (c.y - py) - (b.y - py) * (c.x - px)) / area;
        const v = ((c.x - px) * (a.y - py) - (c.y - py) * (a.x - px)) / area;
        const w = 1 - u - v;
        if (u < 0 || v < 0 || w < 0) continue;
        const z = u * a.z + v * b.z + w * c.z, index = y * width + x;
        if (z <= depth[index]) continue;
        depth[index] = z;
        const p = normalize([u * a.p[0] + v * b.p[0] + w * c.p[0], u * a.p[1] + v * b.p[1] + w * c.p[1], u * a.p[2] + v * b.p[2] + w * c.p[2]]);
        const n = rotate(p, yaw, pitch);
        const color = shader(p, n, opts.time || 0, light);
        const j = index * 4;
        pixels[j] = clamp(color[0]) * 255;
        pixels[j + 1] = clamp(color[1]) * 255;
        pixels[j + 2] = clamp(color[2]) * 255;
      }
    }
    return { width, height, pixels };
  }
  const api = { render, SHADERS };
  if (typeof module !== 'undefined') module.exports = api;
  else root.SpaceRenderer = api;
})(globalThis);
