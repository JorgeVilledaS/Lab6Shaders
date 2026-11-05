const fs = require('fs');
const zlib = require('zlib');
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) { crc ^= byte; for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]), out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0); body.copy(out, 4); out.writeUInt32BE(crc32(body), body.length + 4);
  return out;
}
function png(frame) {
  const { width, height, pixels } = frame;
  const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  const rows = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) Buffer.from(pixels.buffer, pixels.byteOffset + y * width * 4, width * 4).copy(rows, y * (width * 4 + 1) + 1);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}
module.exports = { png, savePNG: (path, frame) => fs.writeFileSync(path, png(frame)) };
