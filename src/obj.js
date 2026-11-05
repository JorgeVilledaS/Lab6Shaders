(function (root) {
  function parseOBJ(text) {
    const vertices = [], faces = [];
    for (const line of text.split(/\r?\n/)) {
      const parts = line.trim().split(/\s+/);
      if (parts[0] === 'v') vertices.push(parts.slice(1, 4).map(Number));
      if (parts[0] === 'f') {
        const indices = parts.slice(1).map(v => Number(v.split('/')[0]) - 1);
        for (let i = 1; i < indices.length - 1; i++) faces.push([indices[0], indices[i], indices[i + 1]]);
      }
    }
    if (!vertices.length || !faces.length || faces.some(f => f.some(i => i < 0 || i >= vertices.length))) {
      throw new Error('OBJ inválido: se necesitan vértices y caras válidas');
    }
    const center = [0, 1, 2].map(k => (Math.min(...vertices.map(v => v[k])) + Math.max(...vertices.map(v => v[k]))) / 2);
    const radius = Math.max(...vertices.map(v => Math.hypot(v[0] - center[0], v[1] - center[1], v[2] - center[2])));
    return { vertices: vertices.map(v => v.map((x, k) => (x - center[k]) / radius)), faces };
  }
  if (typeof module !== 'undefined') module.exports = { parseOBJ };
  else root.SpaceOBJ = { parseOBJ };
})(globalThis);
