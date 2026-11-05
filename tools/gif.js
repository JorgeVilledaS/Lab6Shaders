const fs = require('fs');
// GIF89a con paleta RGB 3-3-2. Sin paquetes externos.
function lzw(indices) {
  const clear = 256, end = 257, parts = [];
  let dictionary, next, bits, current, acc = 0, used = 0;
  function reset() { dictionary = new Map(); next = 258; bits = 9; }
  function emit(code) { acc |= code << used; used += bits; while (used >= 8) { parts.push(acc & 255); acc >>>= 8; used -= 8; } }
  reset(); emit(clear); current = String.fromCharCode(indices[0]);
  for (let i = 1; i < indices.length; i++) {
    const symbol = String.fromCharCode(indices[i]), pair = current + symbol;
    if (dictionary.has(pair)) current = pair;
    else {
      emit(current.length === 1 ? current.charCodeAt(0) : dictionary.get(current));
      if (next < 4096) dictionary.set(pair, next++);
      else { emit(clear); reset(); }
      // El decodificador añade cada entrada un código después del codificador.
      if (next > (1 << bits) && bits < 12) bits++;
      current = symbol;
    }
  }
  emit(current.length === 1 ? current.charCodeAt(0) : dictionary.get(current)); emit(end);
  if (used) parts.push(acc & 255);
  return Buffer.from(parts);
}
function encodeGIF(frames, delay = 12) {
  const { width, height } = frames[0], chunks = [], word = n => Buffer.from([n & 255, n >> 8]);
  chunks.push(Buffer.from('GIF89a'), word(width), word(height), Buffer.from([0xf7, 0, 0]));
  const palette = Buffer.alloc(768);
  for (let i = 0; i < 256; i++) { palette[i * 3] = Math.round((i >> 5) / 7 * 255); palette[i * 3 + 1] = Math.round(((i >> 2) & 7) / 7 * 255); palette[i * 3 + 2] = Math.round((i & 3) / 3 * 255); }
  chunks.push(palette, Buffer.from([0x21,0xff,0x0b]), Buffer.from('NETSCAPE2.0'), Buffer.from([3,1,0,0,0]));
  for (const frame of frames) {
    if (frame.width !== width || frame.height !== height) throw new Error('Dimensiones de GIF inconsistentes');
    const indices = new Uint8Array(width * height);
    for (let i = 0; i < indices.length; i++) indices[i] = (frame.pixels[i * 4] & 0xe0) | ((frame.pixels[i * 4 + 1] & 0xe0) >> 3) | (frame.pixels[i * 4 + 2] >> 6);
    chunks.push(Buffer.from([0x21,0xf9,4,0]), word(delay), Buffer.from([0,0,0x2c]), word(0), word(0), word(width), word(height), Buffer.from([0,8]));
    const data = lzw(indices);
    for (let offset = 0; offset < data.length; offset += 255) { const block = data.subarray(offset, offset + 255); chunks.push(Buffer.from([block.length]), block); }
    chunks.push(Buffer.from([0]));
  }
  chunks.push(Buffer.from([0x3b]));
  return Buffer.concat(chunks);
}
module.exports = { encodeGIF, saveGIF: (path, frames, delay) => fs.writeFileSync(path, encodeGIF(frames, delay)) };
