const canvas = document.querySelector("#screen");
const ctx = canvas.getContext("2d");
const status = document.querySelector("#status");

const player = { x: 140, y: 420, r: 13, speed: 210 };
const bulb = { x: 480, y: 180, on: false };
const keys = new Set();
let nearBulb = false;
let last = performance.now();

addEventListener("keydown", e => {
  const key = e.key.toLowerCase();
  keys.add(key);
  if (key === "e" && nearBulb) {
    bulb.on = !bulb.on;
    status.textContent = bulb.on ? "The light is on." : "The light is off.";
  }
});
addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));

function update(dt) {
  let dx = 0, dy = 0;
  if (keys.has("a") || keys.has("arrowleft")) dx--;
  if (keys.has("d") || keys.has("arrowright")) dx++;
  if (keys.has("w") || keys.has("arrowup")) dy--;
  if (keys.has("s") || keys.has("arrowdown")) dy++;

  const len = Math.hypot(dx,dy) || 1;
  player.x += dx/len * player.speed * dt;
  player.y += dy/len * player.speed * dt;

  player.x = Math.max(45, Math.min(915, player.x));
  player.y = Math.max(80, Math.min(485, player.y));

  nearBulb = Math.hypot(player.x - bulb.x, player.y - 285) < 85;

  if (nearBulb) status.textContent = bulb.on ? "Press E to turn the light off." : "Press E to turn the light on.";
}

function drawRoom() {
  ctx.fillStyle = bulb.on ? "#26231b" : "#050505";
  ctx.fillRect(0,0,960,540);

  ctx.fillStyle = bulb.on ? "#3a3529" : "#0a0a0a";
  ctx.fillRect(40,70,880,410);

  ctx.strokeStyle = bulb.on ? "#77705d" : "#181818";
  ctx.lineWidth = 3;
  ctx.strokeRect(40,70,880,410);

  ctx.fillStyle = bulb.on ? "#201e19" : "#070707";
  ctx.fillRect(40,420,880,60);

  if (bulb.on) {
    const glow = ctx.createRadialGradient(bulb.x, bulb.y+18, 10, bulb.x, bulb.y+90, 310);
    glow.addColorStop(0,"rgba(255,244,190,.55)");
    glow.addColorStop(.35,"rgba(255,235,165,.20)");
    glow.addColorStop(1,"rgba(255,235,165,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(70,90,820,360);
  }
}

function drawBulb() {
  ctx.strokeStyle = bulb.on ? "#9a9585" : "#242424";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bulb.x,70);
  ctx.lineTo(bulb.x,150);
  ctx.stroke();

  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(bulb.x-9,145,18,18);

  ctx.beginPath();
  ctx.arc(bulb.x,180,18,0,Math.PI*2);
  ctx.fillStyle = bulb.on ? "#fff0a8" : "#4a4a42";
  ctx.fill();

  if (bulb.on) {
    ctx.beginPath();
    ctx.arc(bulb.x,180,7,0,Math.PI*2);
    ctx.fillStyle = "#fff9d0";
    ctx.fill();
  }
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x,player.y,player.r,0,Math.PI*2);
  ctx.fillStyle = bulb.on ? "#d8d3c4" : "#3c3c3c";
  ctx.fill();

  if (nearBulb) {
    ctx.font = "16px monospace";
    ctx.fillStyle = bulb.on ? "#fff3bd" : "#888";
    ctx.fillText("[E] switch", bulb.x-40,300);
  }
}

function frame(now) {
  const dt = Math.min((now-last)/1000,.05);
  last = now;
  update(dt);
  drawRoom();
  drawBulb();
  drawPlayer();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);