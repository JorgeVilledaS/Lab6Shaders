const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { parseOBJ } = require('../src/obj');
const { render } = require('../src/renderer');
const { png } = require('../tools/png');
const { encodeGIF } = require('../tools/gif');
const mesh = parseOBJ(fs.readFileSync('assets/sphere.obj', 'utf8'));
const frame = (kind, opts = {}) => render(mesh, { kind, width: 96, height: 96, ...opts });
const checksum = pixels => pixels.reduce((sum, value, i) => (sum + value * ((i % 19) + 1)) >>> 0, 0);
test('se usa la esfera original de 98 vértices y 192 triángulos', () => {
  assert.equal(mesh.vertices.length, 98);
  assert.equal(mesh.faces.length, 192);
  assert.ok(mesh.vertices.every(p => Math.hypot(...p) <= 1.00001));
});
test('los tres shaders generan resultados distintos y opacos', () => {
  const outputs = ['star', 'rocky', 'gas'].map(kind => frame(kind));
  assert.equal(new Set(outputs.map(f => checksum(f.pixels))).size, 3);
  for (const f of outputs) assert.ok(f.pixels.every((value, i) => i % 4 !== 3 || value === 255));
});
test('el diagnóstico muestra el mismo valor en R, G y B', () => {
  for (const kind of ['star', 'rocky', 'gas']) {
    const p = frame(kind, { options: { grayscale: true } }).pixels;
    const center = (48 * 96 + 48) * 4;
    assert.equal(p[center], p[center + 1]);
    assert.equal(p[center + 1], p[center + 2]);
  }
});
test('tiempo, nubes y sombras cambian la imagen del planeta', () => {
  const base = checksum(frame('rocky').pixels);
  assert.notEqual(base, checksum(frame('rocky', { time: 5 }).pixels));
  assert.notEqual(base, checksum(frame('rocky', { options: { clouds: false } }).pixels));
  assert.notEqual(base, checksum(frame('rocky', { options: { shadows: false } }).pixels));
});
test('PNG y GIF contienen firmas y dimensiones válidas', () => {
  const image = frame('gas');
  const a = png(image), b = encodeGIF([image, frame('gas', { time: 2 })]);
  assert.equal(a.subarray(1, 4).toString(), 'PNG');
  assert.equal(a.readUInt32BE(16), 96);
  assert.equal(b.subarray(0, 6).toString(), 'GIF89a');
  assert.equal(b.readUInt16LE(6), 96);
  assert.equal(b[b.length - 1], 0x3b);
});
