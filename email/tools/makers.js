// The three kinds of email GIF: the Cyber Sale banner, the bundle montage and one demo card per product.
import * as S from './studio.js';
const { C } = S;
const canvas = (W, H) => { const c = new OffscreenCanvas(W, H); return [c, c.getContext('2d')]; };
const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);

// ---------------- banner ----------------
export function bannerFrame(W, H, f, N) {
  const [c, g] = canvas(W, H); const s = W / 600, ph = f / N;
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0b0620'); bg.addColorStop(0.62, '#1c0a3a'); bg.addColorStop(1, '#06040f');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const hz = H * 0.70;
  // horizon glow
  let rg = g.createRadialGradient(W / 2, hz, 0, W / 2, hz, W * 0.55); rg.addColorStop(0, 'rgba(255,43,214,.55)'); rg.addColorStop(0.35, 'rgba(139,92,255,.22)'); rg.addColorStop(1, 'rgba(139,92,255,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // perspective grid floor, scrolling toward the viewer (one line spacing per loop, so it loops seamlessly)
  g.save(); g.beginPath(); g.rect(0, hz, W, H - hz); g.clip();
  g.fillStyle = 'rgba(6,4,15,.55)'; g.fillRect(0, hz, W, H - hz);
  g.lineWidth = 1.3 * s; g.shadowColor = C.cyan; g.shadowBlur = 6 * s;
  for (let i = -14; i <= 14; i++) {
    g.strokeStyle = `rgba(0,229,255,${0.55 - Math.abs(i) * 0.02})`;
    g.beginPath(); g.moveTo(W / 2 + i * 14 * s, hz); g.lineTo(W / 2 + i * 120 * s, H + 4); g.stroke();
  }
  const K = 7;
  for (let k = 0; k < K; k++) {
    const d = (k + ph) / K, y = hz + (H - hz) * Math.pow(d, 2.1);
    g.strokeStyle = `rgba(0,229,255,${0.15 + 0.6 * d})`; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
  }
  g.restore();
  g.fillStyle = 'rgba(255,43,214,.9)'; g.fillRect(0, hz - 1 * s, W, 1.6 * s);   // horizon line
  // eyebrow
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = `700 ${11 * s}px Orbitron`; g.letterSpacing = `${5 * s}px`; g.fillStyle = C.cyan;
  g.fillText('BLENDER PROCEDURAL  ·  SUPERHIVE', W / 2 + 2.5 * s, 40 * s);
  // CYBER SALE (glow, gradient, a glitch on two frames and a flicker on one)
  const [tc, tg] = canvas(W, H);
  tg.textAlign = 'center'; tg.font = `900 ${74 * s}px Orbitron`; tg.letterSpacing = `${2 * s}px`;
  const gr = tg.createLinearGradient(W * 0.18, 0, W * 0.82, 0); gr.addColorStop(0, C.cyan); gr.addColorStop(0.5, '#b9a4ff'); gr.addColorStop(1, C.magenta);
  tg.shadowColor = 'rgba(255,43,214,.85)'; tg.shadowBlur = 26 * s; tg.fillStyle = gr; tg.fillText('CYBER SALE', W / 2, 122 * s);
  tg.shadowBlur = 0; tg.fillText('CYBER SALE', W / 2, 122 * s);
  const glitch = f === Math.round(N * 0.35) || f === Math.round(N * 0.35) + 1;
  const flicker = f === Math.round(N * 0.75);
  g.globalAlpha = flicker ? 0.45 : 1;
  if (glitch) {
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.7; g.drawImage(tc, -5 * s, 0); g.globalAlpha = 1;
    for (let y = 50 * s; y < 135 * s; y += 9 * s) { const dx = ((y * 7919) % 13 - 6) * s * (f % 2 ? 1.6 : -1.2); g.drawImage(tc, 0, y, W, 9 * s, dx, y, W, 9 * s); }
    g.globalCompositeOperation = 'source-over';
  } else g.drawImage(tc, 0, 0);
  g.globalAlpha = 1;
  // 35% OFF EVERYTHING with a shine sweep
  const [oc, og] = canvas(W, H);
  og.textBaseline = 'alphabetic'; og.font = `900 ${40 * s}px Inter`; og.letterSpacing = `${0.5 * s}px`;
  const a = '35% OFF', b = ' EVERYTHING', wa = og.measureText(a).width, wb = og.measureText(b).width, x0 = (W - wa - wb) / 2;
  og.fillStyle = C.gold; og.shadowColor = 'rgba(255,225,77,.55)'; og.shadowBlur = 16 * s; og.fillText(a, x0, 180 * s);
  og.fillStyle = '#ffffff'; og.shadowColor = 'rgba(255,255,255,.25)'; og.shadowBlur = 10 * s; og.fillText(b, x0 + wa, 180 * s);
  const sw = ease((ph - 0.05) / 0.45);
  if (sw > 0 && sw < 1) {
    og.globalCompositeOperation = 'source-atop'; og.shadowBlur = 0;
    const sx = -0.2 * W + sw * 1.4 * W, sh = og.createLinearGradient(sx - 60 * s, 0, sx + 60 * s, 0);
    sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,.95)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
    og.fillStyle = sh; og.fillRect(0, 130 * s, W, 70 * s);
  }
  g.drawImage(oc, 0, 0);
  // date pill on the floor
  g.font = `800 ${12.5 * s}px Inter`; g.letterSpacing = `${2.5 * s}px`;
  const pt = '27 NOV – 02 DEC  ·  136 TOOLS', pw = g.measureText(pt).width + 34 * s, phh = 30 * s, px = (W - pw) / 2, py = 222 * s;
  S.rrect(g, px, py, pw, phh, phh / 2); g.fillStyle = 'rgba(11,6,32,.88)'; g.fill();
  g.lineWidth = 1.5 * s; g.strokeStyle = C.cyan; g.shadowColor = C.cyan; g.shadowBlur = (6 + 6 * Math.sin(ph * Math.PI * 2) ** 2) * s; g.stroke(); g.shadowBlur = 0;
  g.fillStyle = '#e8fbff'; g.textBaseline = 'middle'; g.fillText(pt, W / 2 + 1.25 * s, py + phh / 2 + 0.5 * s);
  g.letterSpacing = '0px';
  return c;
}

export async function banner({ W = 780, H = 390, N = 20, delay = 90, name = 'banner.gif', amp = 0 } = {}) {
  const frames = []; for (let f = 0; f < N; f++) frames.push(bannerFrame(W, H, f, N));
  S.show(frames, 4);
  const bytes = S.encode(frames, delay, { amp, thr: 14 });
  return { name, kb: Math.round(await S.save(name, bytes) / 1024), frames: N };
}

// ---------------- shared overlays ----------------
function badge(g, W, s, k, n, text = '-35%') {      // top-right, where demos rarely have captions
  g.font = `900 ${Math.round(15 * s)}px Inter`; const w = g.measureText(text).width + 18 * s;
  S.saleBadge(g, W - w - 8 * s, 8 * s, s, text, Math.sin(k / n * Math.PI * 2) ** 2);
}

async function endCard(url, W, H) {
  const img = await S.loadImage(url); const [c, g] = canvas(W, H);
  g.imageSmoothingQuality = 'high'; S.cover(g, img, img.width, img.height, W, H); return c;
}
function mix(a, b, t) { const [c, g] = canvas(a.width, a.height); g.drawImage(a, 0, 0); g.globalAlpha = t; g.drawImage(b, 0, 0); return c; }

// ---------------- product card ----------------
// p: {slug, cover, gif?, start?, zoom?, focusY?, fx?, gallery?}
// Tries lighter settings (fewer frames per second, fewer colours) until the GIF fits `maxKB`.
// Shorter clips before choppier ones: a 1.3 s clip at 8 fps looks better than 2 s at 5 fps.
const PRESETS = [{ fps: 10, colors: 256, dur: 1 }, { fps: 8, colors: 256, dur: 1 }, { fps: 8, colors: 192, dur: 0.8 }, { fps: 8, colors: 160, dur: 0.65 }, { fps: 7, colors: 128, dur: 0.6 }, { fps: 6, colors: 128, dur: 0.55 }];
export async function card(p, { W = 320, H = 160, durMs = 2000, hold = 1500, maxKB = 300, name } = {}) {
  name = name || `card-${p.short || p.slug}.gif`;
  const s = W / 360; const end = await endCard(p.cover, W, H);
  let bytes, frames, used;
  for (const pre of PRESETS) {
    const fps = p.gallery ? Math.min(pre.fps, 8) : pre.fps; let demo = [];
    if (p.gif) {
      const r = await S.clip(p.gif, W, H, { startFrac: p.start ?? 0.15, durMs: (p.durMs || durMs) * pre.dur, fps, focusY: p.focusY ?? 0.5, zoom: p.zoom ?? 1, fx: p.fx ?? 0.5 });
      demo = r.frames;
    } else {
      for (const [i, u] of (p.gallery || []).entries()) {        // slow push-in over each still
        const img = await S.loadImage(u); const n = Math.max(3, Math.round(fps * 0.8 * pre.dur));
        for (let k = 0; k < n; k++) { const [c, g] = canvas(W, H); g.imageSmoothingQuality = 'high'; S.cover(g, img, img.width, img.height, W, H, 0.5, 1.04 + 0.08 * k / n, i % 2 ? 0.35 : 0.65); demo.push(c); }
      }
    }
    const out = demo.map((d, k) => { const [c, g] = canvas(W, H); g.drawImage(d, 0, 0); badge(g, W, s, k, demo.length); return c; });
    frames = [...out, mix(out[out.length - 1], end, 0.5), end];
    const delays = [...out.map(() => 1000 / fps), 70, hold];
    bytes = S.encode(frames, delays, { thr: 14, colors: pre.colors }); used = { fps, colors: pre.colors, dur: pre.dur };
    if (bytes.length / 1024 <= maxKB) break;
  }
  S.show(frames, 6);
  return { name, kb: Math.round(await S.save(name, bytes) / 1024), frames: frames.length, ...used };
}

// ---------------- bundle montage ----------------
export async function bundle(clips, cover, { W = 600, H = 300, fps = 10, per = 700, hold = 1800, name = 'bundle.gif', price = '$77.35', was = '$119', colors = 256, save = true } = {}) {
  const s = W / 600; const frames = [], delays = [];
  for (const [ci, cl] of clips.entries()) {
    const r = await S.clip(cl.gif, W, H, { startFrac: cl.start ?? 0.2, durMs: per, fps, zoom: cl.zoom ?? 1, focusY: cl.focusY ?? 0.5, fx: cl.fx ?? 0.5 });
    r.frames.forEach((fr, k) => {
      const [c, g] = canvas(W, H); g.drawImage(fr, 0, 0);
      if (k === 0 && ci > 0) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, 0, W, H); }
      // bottom band
      const band = g.createLinearGradient(0, H - 70 * s, 0, H); band.addColorStop(0, 'rgba(7,6,15,0)'); band.addColorStop(1, 'rgba(7,6,15,.92)');
      g.fillStyle = band; g.fillRect(0, H - 70 * s, W, 70 * s);
      // chip
      g.font = `800 ${10.5 * s}px Orbitron`; g.letterSpacing = `${1.5 * s}px`;
      const ct = 'ULTIMATE BUNDLE · 106 PRODUCTS', cw = g.measureText(ct).width + 22 * s;
      const cg = g.createLinearGradient(12 * s, 0, 12 * s + cw, 0); cg.addColorStop(0, C.violet); cg.addColorStop(1, C.magenta);
      S.rrect(g, 12 * s, 12 * s, cw, 24 * s, 12 * s); g.fillStyle = cg; g.shadowColor = 'rgba(255,43,214,.6)'; g.shadowBlur = 10 * s; g.fill(); g.shadowBlur = 0;
      g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.fillText(ct, 23 * s, 24.5 * s);
      g.letterSpacing = '0px';
      // add-on name, sliding in
      const t = ease(k / 3);
      g.globalAlpha = t; g.font = `800 ${17 * s}px Inter`; g.fillStyle = '#fff'; g.textBaseline = 'alphabetic';
      g.fillText(cl.label, 16 * s - (1 - t) * 14 * s, H - 30 * s);
      g.font = `600 ${11 * s}px Inter`; g.fillStyle = C.cyan; g.fillText("INCLUDED IN THE BUNDLE", 16 * s - (1 - t) * 14 * s, H - 13 * s);
      g.globalAlpha = 1;
      // price block
      g.textAlign = 'right'; g.font = `900 ${28 * s}px Inter`; g.fillStyle = '#fff'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 6 * s;
      g.fillText(price, W - 16 * s, H - 16 * s); const pw = g.measureText(price).width; g.shadowBlur = 0;
      g.font = `700 ${15 * s}px Inter`; g.fillStyle = '#a9a3c4'; const wx = W - 26 * s - pw; g.fillText(was, wx, H - 18 * s);
      const ww = g.measureText(was).width; g.strokeStyle = '#ff2bd6'; g.lineWidth = 2 * s; g.beginPath(); g.moveTo(wx - ww - 2 * s, H - 23 * s); g.lineTo(wx + 2 * s, H - 23 * s); g.stroke();
      g.textAlign = 'left';
      S.saleBadge(g, W - 70 * s, 12 * s, s * 1.05, '-35%', Math.sin((frames.length) / 4) ** 2);
      frames.push(c); delays.push(1000 / fps);
    });
  }
  const end = await endCard(cover, W, H);
  frames.push(mix(frames[frames.length - 1], end, 0.5), end); delays.push(70, hold);
  S.show(frames, 8);
  const bytes = S.encode(frames, delays, { thr: 14, colors });
  return { name, kb: Math.round((save ? await S.save(name, bytes) : bytes.length) / 1024), frames: frames.length };
}
