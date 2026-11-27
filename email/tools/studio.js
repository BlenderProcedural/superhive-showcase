// GIF studio: decodes the store's own demo GIFs, composes sale overlays on canvas and encodes small email GIFs.
import { GIFEncoder, quantize, applyPalette } from 'https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js';

export const log = (...a) => { const el = document.getElementById('log'); el.textContent += a.join(' ') + '\n'; };
const src = u => '/src?url=' + encodeURIComponent(u);
export const C = { cyan: '#00e5ff', magenta: '#ff2bd6', violet: '#8b5cff', gold: '#ffe14d', ink: '#07060f' };

// ---------- decoding ----------
function gifDelays(buf) {           // frame delays (ms) from the GIF block structure, without decoding pixels
  const b = new Uint8Array(buf); let p = 13; const out = []; let pending = 100;
  if (b[10] & 0x80) p += 3 * (1 << ((b[10] & 7) + 1));
  const skipSub = () => { while (b[p]) p += b[p] + 1; p++; };
  while (p < b.length) {
    const t = b[p++];
    if (t === 0x21) {
      const label = b[p++];
      if (label === 0xF9) { const d = (b[p + 2] | (b[p + 3] << 8)) * 10; pending = d <= 10 ? 100 : d; }
      skipSub();
    } else if (t === 0x2C) {
      const f = b[p + 8]; p += 9; if (f & 0x80) p += 3 * (1 << ((f & 7) + 1));
      p++; skipSub(); out.push(pending); pending = 100;
    } else break;
  }
  return out;
}

export async function loadImage(url) {
  const blob = await (await fetch(src(url))).blob();
  return await createImageBitmap(blob);
}

// Frames of a GIF resampled to `fps`, over [startFrac*total + startMs, +durMs], drawn cover-fit into W x H.
export async function clip(url, W, H, { startFrac = 0, startMs = 0, durMs = 2400, fps = 10, focusY = 0.5, zoom = 1, fx = 0.5 } = {}) {
  const buf = await (await fetch(src(url))).arrayBuffer();
  const delays = gifDelays(buf);
  const total = delays.reduce((a, b) => a + b, 0);
  const starts = []; delays.reduce((t, d) => (starts.push(t), t + d), 0);
  let t0 = Math.min(total * startFrac + startMs, Math.max(0, total - durMs));
  const n = Math.max(1, Math.round(durMs / 1000 * fps));
  const want = [];
  for (let k = 0; k < n; k++) {
    const t = (t0 + k * 1000 / fps) % total;
    let i = starts.findIndex((s, j) => t >= s && t < s + delays[j]); if (i < 0) i = delays.length - 1;
    want.push(i);
  }
  const dec = new ImageDecoder({ data: buf, type: 'image/gif' });
  await dec.tracks.ready;
  const cache = new Map();
  for (const i of [...new Set(want)].sort((a, b) => a - b)) {
    const { image } = await dec.decode({ frameIndex: i });
    const c = new OffscreenCanvas(W, H); const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    cover(g, image, image.displayWidth, image.displayHeight, W, H, focusY, zoom, fx);
    image.close(); cache.set(i, c);
  }
  dec.close();
  return { frames: want.map(i => cache.get(i)), total, count: delays.length, delay: 1000 / fps };
}

export function cover(g, img, iw, ih, W, H, focusY = 0.5, zoom = 1, fx = 0.5) {
  const s = Math.max(W / iw, H / ih) * zoom; const w = iw * s, h = ih * s;
  g.drawImage(img, (W - w) * fx, (H - h) * focusY, w, h);
}

// ---------- encoding ----------
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16 - 0.5);
function dither(d, W, amp) {
  const o = new Uint8ClampedArray(d.length);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const x = p % W, y = (p / W) | 0, v = BAYER[(y & 3) * 4 + (x & 3)] * amp;
    o[i] = d[i] + v; o[i + 1] = d[i + 1] + v; o[i + 2] = d[i + 2] + v; o[i + 3] = 255;
  }
  return o;
}

// frames: canvases; delays: ms per frame (number or array)
export function encode(frames, delays, { colors = 256, amp = 0, thr = 12, sampleStep = 3 } = {}) {
  const W = frames[0].width, H = frames[0].height;
  const datas = frames.map(c => c.getContext('2d').getImageData(0, 0, W, H).data);
  // palette from pixels of all frames (strided sample)
  const per = Math.ceil(datas.length / 12);
  const pick = datas.filter((_, i) => i % per === 0 || i === datas.length - 1);
  const parts = pick.map(d => { const o = new Uint8ClampedArray(Math.ceil(d.length / 4 / sampleStep) * 4); for (let p = 0, q = 0; p < d.length; p += 4 * sampleStep, q += 4) { o[q] = d[p]; o[q + 1] = d[p + 1]; o[q + 2] = d[p + 2]; o[q + 3] = 255; } return o; });
  const all = new Uint8ClampedArray(parts.reduce((a, b) => a + b.length, 0)); let off = 0; for (const p of parts) { all.set(p, off); off += p.length; }
  const pal = quantize(all, colors - 1, { format: 'rgb565' });
  const TI = pal.length; const palette = [...pal, [255, 0, 255]];
  while (palette.length & (palette.length - 1)) palette.push([0, 0, 0]);
  const gif = GIFEncoder();
  let prev = null;
  datas.forEach((d, i) => {
    const idx = applyPalette(amp ? dither(d, W, amp) : d, pal, 'rgb565');
    if (prev) {
      for (let p = 0; p < idx.length; p++) {
        const a = pal[idx[p]], b = pal[prev[p]];
        if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) <= thr) idx[p] = TI; else prev[p] = idx[p];
      }
    } else prev = idx.slice();
    const delay = Array.isArray(delays) ? delays[i] : delays;
    gif.writeFrame(idx, W, H, { palette: i === 0 ? palette : undefined, delay, transparent: i > 0, transparentIndex: TI, dispose: 1 });
  });
  gif.finish();
  return gif.bytes();
}

export async function save(name, bytes) {
  const r = await fetch('/save/' + name, { method: 'POST', body: bytes });
  if (!r.ok) throw new Error('save failed ' + name);
  return bytes.length;
}

export function show(canvases, max = 8) {
  const v = document.getElementById('view'); v.innerHTML = '';
  const step = Math.max(1, Math.floor(canvases.length / max));
  canvases.filter((_, i) => i % step === 0).slice(0, max).forEach(c => {
    const k = document.createElement('canvas'); k.width = c.width; k.height = c.height; k.getContext('2d').drawImage(c, 0, 0); v.appendChild(k);
  });
}

// ---------- drawing helpers ----------
export function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
export function saleBadge(g, x, y, s, text = '-35%', pulse = 0) {   // gradient pill, top-left anchored
  g.save();
  g.font = `900 ${Math.round(15 * s)}px Inter`;
  const tw = g.measureText(text).width, w = tw + 18 * s, h = 26 * s;
  const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, C.magenta); gr.addColorStop(1, C.violet);
  g.shadowColor = 'rgba(255,43,214,' + (0.55 + 0.35 * pulse) + ')'; g.shadowBlur = (8 + 8 * pulse) * s;
  rrect(g, x, y, w, h, h / 2); g.fillStyle = gr; g.fill();
  g.shadowBlur = 0; g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.fillText(text, x + 9 * s, y + h / 2 + 0.5 * s);
  g.restore();
  return w;
}
