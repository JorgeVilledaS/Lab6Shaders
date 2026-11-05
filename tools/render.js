const fs = require('fs');
const path = require('path');
const { parseOBJ } = require('../src/obj');
const { render } = require('../src/renderer');
const { savePNG } = require('./png');
const { saveGIF } = require('./gif');
const mesh = parseOBJ(fs.readFileSync(path.join(__dirname, '../assets/sphere.obj'), 'utf8'));
const [kind = 'star', filename = `render-${kind}.png`, sizeText = '420', timeText = '0', mode = 'normal'] = process.argv.slice(2);
if (!['star', 'rocky', 'gas'].includes(kind)) throw new Error('Uso: node tools/render.js star|rocky|gas [archivo.png|archivo.gif] [tamaño] [tiempo]');
const size = Number(sizeText), time = Number(timeText);
if (!Number.isInteger(size) || size < 64 || size > 1200 || !Number.isFinite(time)) throw new Error('Tamaño: 64–1200; tiempo: número finito');
if (!['normal', 'turn', 'grayscale'].includes(mode)) throw new Error('Modo: normal, turn o grayscale');
if (filename.toLowerCase().endsWith('.gif')) {
  const frames = Array.from({ length: 12 }, (_, i) => render(mesh, { width: size, height: size, kind, time: mode === 'turn' ? time : time + i * 0.6, yaw: mode === 'turn' ? 0.35 + i * Math.PI / 6 : 0.35, options: { grayscale: mode === 'grayscale' } }));
  saveGIF(filename, frames, 18);
} else if (filename.toLowerCase().endsWith('.png')) savePNG(filename, render(mesh, { width: size, height: size, kind, time, options: { grayscale: mode === 'grayscale' } }));
else throw new Error('El archivo de salida debe terminar en .png o .gif');
console.log(`Creado: ${filename}`);
