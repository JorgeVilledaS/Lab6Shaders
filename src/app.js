(function () {
  const mesh = SpaceOBJ.parseOBJ(SPHERE_OBJ);
  const canvas = document.getElementById('scene'), ctx = canvas.getContext('2d');
  const timeInput = document.getElementById('time');
  const bodies = {
    star: { name: 'Planeta 1', type: 'ESTRELLA ACTIVA', description: 'Una fotosfera turbulenta: gránulos de calor, zonas oscuras y un pulso sutil que sugiere energía interna.', pattern: 'Ruido fractal + ondas', motion: 'Pulso y flujo térmico', lighting: 'Emisión propia' },
    rocky: { name: 'Planeta 2', type: 'MUNDO OCEÁNICO', description: 'Continentes minerales rodeados por mares profundos. Casquetes polares y nubes móviles proyectan sombra sobre la superficie.', pattern: 'Umbrales + máscara polar', motion: 'Nubes a otra velocidad', lighting: 'Difusa + brillo del mar' },
    gas: { name: 'Planeta 3', type: 'GIGANTE GASEOSO', description: 'Ríos de color se doblan con turbulencia. Una tormenta ovalada rompe las bandas de la atmósfera.', pattern: 'Bandas deformadas + remolino', motion: 'Corrientes lentas', lighting: 'Difusa ambiental' }
  };
  let kind = 'star', time = 0, playing = true, yaw = 0.35, pitch = -0.12, rendering = false;
  function draw() {
    if (rendering) return;
    rendering = true;
    const started = performance.now();
    const options = { grayscale: document.getElementById('grayscale').checked, clouds: document.getElementById('clouds').checked, shadows: document.getElementById('shadows').checked };
    const result = SpaceRenderer.render(mesh, { width: canvas.width, height: canvas.height, kind, time, yaw, pitch, options });
    ctx.putImageData(new ImageData(result.pixels, result.width, result.height), 0, 0);
    document.getElementById('render-status').textContent = `CPU · ${Math.round(performance.now() - started)} ms`;
    rendering = false;
  }
  function select(value) {
    kind = value;
    document.querySelectorAll('.planet-choice').forEach(b => { const active = b.dataset.kind === kind; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    const data = bodies[kind];
    for (const [id, value] of Object.entries({ 'planet-name': data.name, 'planet-type': data.type, description: data.description, pattern: data.pattern, motion: data.motion, lighting: data.lighting })) document.getElementById(id).textContent = value;
    for (const id of ['clouds-row', 'shadows-row']) document.getElementById(id).classList.toggle('disabled', kind !== 'rocky');
    draw();
  }
  document.querySelectorAll('.planet-choice').forEach(b => b.addEventListener('click', () => select(b.dataset.kind)));
  for (const id of ['grayscale', 'clouds', 'shadows']) document.getElementById(id).addEventListener('change', draw);
  timeInput.addEventListener('input', () => { time = Number(timeInput.value); document.getElementById('time-value').textContent = time.toFixed(1) + ' s'; draw(); });
  function setPlaying(value) { playing = value; document.getElementById('play').innerHTML = value ? 'Ⅱ &nbsp; Pausar' : '▶ &nbsp; Reproducir'; }
  document.getElementById('play').addEventListener('click', () => setPlaying(!playing));
  document.getElementById('save').addEventListener('click', () => { const a = document.createElement('a'); a.download = `${bodies[kind].name.toLowerCase().replace(' ', '-')}-${time.toFixed(1)}.png`; a.href = canvas.toDataURL('image/png'); a.click(); });
  document.addEventListener('keydown', e => { if (e.target.tagName === 'INPUT') return; if ('123'.includes(e.key) && e.key.length === 1) select(['star', 'rocky', 'gas'][Number(e.key) - 1]); if (e.code === 'Space') { e.preventDefault(); setPlaying(!playing); } });
  let drag = null;
  canvas.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY]; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; yaw += (e.clientX - drag[0]) * 0.012; pitch = Math.max(-1.3, Math.min(1.3, pitch + (e.clientY - drag[1]) * 0.012)); drag = [e.clientX, e.clientY]; draw(); });
  canvas.addEventListener('pointerup', () => { drag = null; });
  let last = performance.now();
  function tick(now) { if (playing && now - last > 100) { time = (time + Math.min(0.15, (now - last) / 1000)) % 12; timeInput.value = time; document.getElementById('time-value').textContent = time.toFixed(1) + ' s'; draw(); last = performance.now(); } requestAnimationFrame(tick); }
  select('star'); requestAnimationFrame(tick);
})();
