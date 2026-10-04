// Dynamic lighting: soft shadows cast away from the light by anything in `occluders`.
//
// Want your thing to cast a shadow? Push it in (live objects update automatically):
//   import { occluders } from "./lighting.js";
//   occluders.push({ x: 300, y: 350, r: 20 });                          // circle
//   occluders.push({ points: [[600,300],[660,300],[660,340],[600,340]] }); // convex polygon

export const occluders = [];

const W = 960, H = 540;
const ROOM = { x: 40, y: 70, w: 880, h: 410 };
const SAMPLES = 10;       // light samples; more = smoother penumbra
const LIGHT_RADIUS = 14;  // size of the bulb as an area light
const REACH = 2000;       // how far shadows are projected

const accum = new OffscreenCanvas(W, H);
const actx = accum.getContext("2d");
const pass = new OffscreenCanvas(W, H);
const pctx = pass.getContext("2d");

// Subtle mains-hum flicker so the light feels alive.
export function flicker(t) {
  return 0.93 + 0.04 * Math.sin(t * 0.011) + 0.03 * Math.sin(t * 0.047 + 1.3) * Math.sin(t * 0.0021);
}

function project(lx, ly, px, py) {
  const dx = px - lx, dy = py - ly, d = Math.hypot(dx, dy) || 1;
  return [px + dx / d * REACH, py + dy / d * REACH];
}

function circleShadow(ctx, lx, ly, o) {
  const dx = o.x - lx, dy = o.y - ly, d = Math.hypot(dx, dy);
  if (d <= o.r) return;
  // Tangent points, measured from the circle's centre back toward the light.
  const toLight = Math.atan2(-dy, -dx), spread = Math.acos(o.r / d);
  const t1 = [o.x + Math.cos(toLight + spread) * o.r, o.y + Math.sin(toLight + spread) * o.r];
  const t2 = [o.x + Math.cos(toLight - spread) * o.r, o.y + Math.sin(toLight - spread) * o.r];
  const f1 = project(lx, ly, ...t1), f2 = project(lx, ly, ...t2);
  ctx.beginPath();
  ctx.moveTo(...t1); ctx.lineTo(...f1); ctx.lineTo(...f2); ctx.lineTo(...t2);
  ctx.closePath();
  ctx.fill();
}

function polyShadow(ctx, lx, ly, o) {
  const pts = o.points;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    ctx.beginPath();
    ctx.moveTo(...a); ctx.lineTo(...b);
    ctx.lineTo(...project(lx, ly, ...b)); ctx.lineTo(...project(lx, ly, ...a));
    ctx.closePath();
    ctx.fill();
  }
}

// Draw soft shadows onto ctx. Call after the room, before the objects themselves.
export function drawShadows(ctx, light, intensity = 1) {
  actx.clearRect(0, 0, W, H);
  actx.globalAlpha = 1 / SAMPLES;

  for (let s = 0; s < SAMPLES; s++) {
    // Sample points spread across the bulb's disc (golden-angle spiral, stable per frame).
    const k = (s + 0.5) / SAMPLES, ang = s * 2.39996;
    const lx = light.x + Math.cos(ang) * Math.sqrt(k) * LIGHT_RADIUS;
    const ly = light.y + Math.sin(ang) * Math.sqrt(k) * LIGHT_RADIUS;

    pctx.clearRect(0, 0, W, H);
    pctx.fillStyle = "#000";
    for (const o of occluders) {
      if (o.points) polyShadow(pctx, lx, ly, o);
      else circleShadow(pctx, lx, ly, o);
    }
    actx.drawImage(pass, 0, 0);
  }
  actx.globalAlpha = 1;

  // Shadows are only as strong as the light that would have been there.
  actx.globalCompositeOperation = "destination-in";
  const fall = actx.createRadialGradient(light.x, light.y, 20, light.x, light.y, 620);
  fall.addColorStop(0, `rgba(0,0,0,${0.85 * intensity})`);
  fall.addColorStop(0.5, `rgba(0,0,0,${0.6 * intensity})`);
  fall.addColorStop(1, `rgba(0,0,0,${0.3 * intensity})`);
  actx.fillStyle = fall;
  actx.fillRect(0, 0, W, H);
  actx.globalCompositeOperation = "source-over";

  ctx.save();
  ctx.beginPath();
  ctx.rect(ROOM.x, ROOM.y, ROOM.w, ROOM.h);
  ctx.clip();
  ctx.drawImage(accum, 0, 0);
  ctx.restore();
}

// Light a round object: bright on the side facing the light, dark on the far side.
export function shadeCircle(ctx, x, y, r, light, intensity = 1) {
  const dx = light.x - x, dy = light.y - y, d = Math.hypot(dx, dy) || 1;
  const hx = x + dx / d * r * 0.55, hy = y + dy / d * r * 0.55;
  const g = ctx.createRadialGradient(hx, hy, 0, x, y, r * 1.05);
  g.addColorStop(0, `rgba(255,245,200,${0.45 * intensity})`);
  g.addColorStop(0.55, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${0.55 * intensity})`);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
}
