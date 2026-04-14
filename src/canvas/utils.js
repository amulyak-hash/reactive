/**
 * Shared canvas drawing utilities for story visualizations.
 */

/** Draw ambient floating dust particles */
export function drawDust(ctx, w, h, T, count = 50, color = 'rgba(80,120,160,.05)') {
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(
      (Math.sin(T * .001 + i * 23) * .5 + .5) * w,
      (Math.cos(T * .0008 + i * 37) * .5 + .5) * h,
      .6, 0, Math.PI * 2
    );
    ctx.fillStyle = color;
    ctx.fill();
  }
}

/** Setup canvas with DPR scaling, returns context */
export function setupCanvas(canvas, w, h, dpr = 2) {
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

/** Draw a radial gradient glow (cheaper than ctx.shadowBlur) */
export function drawGlow(ctx, x, y, radius, color, alpha = 0.3) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 0) return;
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, typeof color === 'string' && color.startsWith('rgba')
    ? color : `rgba(${hexToRgbTuple(color)},${alpha})`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw subtle horizontal scanlines for cinematic feel */
export function drawScanline(ctx, w, h, T, alpha = 0.015) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  const offset = (T * 0.5) % 6;
  for (let y = offset; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }
}

/** Draw a vertical crosshair line at x */
export function drawCrosshair(ctx, x, top, bottom, color = 'rgba(241,245,249,0.08)') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bottom);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** Helper: hex color to "r,g,b" tuple string */
function hexToRgbTuple(hex) {
  const h = (hex || '#3B8BF6').replace('#', '');
  return `${parseInt(h.substring(0, 2), 16)},${parseInt(h.substring(2, 4), 16)},${parseInt(h.substring(4, 6), 16)}`;
}
