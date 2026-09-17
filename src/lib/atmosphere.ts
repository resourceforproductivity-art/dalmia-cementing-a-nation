/** Small projected particle scene. Cloud textures are generated once, not per frame. */
const clamp = (n: number, low = 0, high = 1) => Math.min(high, Math.max(low, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
const wrap = (n: number, span: number) => ((n % span) + span) % span;
const randomGenerator = (seed: number) => () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
  return (seed >>> 0) / 4294967296;
};

function cloudTexture(seed: number, warm: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const random = randomGenerator(seed);
  const grid = Float32Array.from({ length: 64 * 64 }, random);
  const noise = (x: number, y: number) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const tx = smooth(x - ix), ty = smooth(y - iy);
    const at = (a: number, b: number) => grid[(a & 63) + (b & 63) * 64];
    return (at(ix, iy) * (1 - tx) + at(ix + 1, iy) * tx) * (1 - ty)
      + (at(ix, iy + 1) * (1 - tx) + at(ix + 1, iy + 1) * tx) * ty;
  };
  const pixels = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const u = x / canvas.width, v = y / canvas.height;
      const warp = noise(u * 5 + 8, v * 4 + 7);
      const n = noise(u * 4 + warp * 1.7, v * 3 + warp) * .54
        + noise(u * 10 + 4, v * 7 + 12) * .27
        + noise(u * 23, v * 15) * .13 + noise(u * 47, v * 31) * .06;
      const envelope = Math.pow(clamp(1 - (u * 2 - 1) ** 2 - (v * 2 - 1) ** 2), 1.8);
      const density = smooth((n - .23) / .53) * envelope;
      const offset = (y * canvas.width + x) * 4;
      const light = n * 45;
      pixels.data[offset] = (warm ? 191 : 151) + light;
      pixels.data[offset + 1] = (warm ? 181 : 172) + light;
      pixels.data[offset + 2] = (warm ? 157 : 177) + light;
      pixels.data[offset + 3] = Math.round(density * 255);
    }
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

function moteTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  glow.addColorStop(0, "rgba(242,226,192,.8)");
  glow.addColorStop(.18, "rgba(222,209,184,.55)");
  glow.addColorStop(.5, "rgba(218,204,177,.16)");
  glow.addColorStop(1, "rgba(218,204,177,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 32, 32);
  return canvas;
}

const clouds = [
  { x: -.85, y: .02, z: 1100, width: 1.85, height: .76, opacity: .46, speed: .17, warm: false, near: false },
  { x: .94, y: -.02, z: 820, width: 1.58, height: .72, opacity: .39, speed: -.13, warm: true, near: false },
  { x: -.6, y: .82, z: 560, width: 2.25, height: .8, opacity: .57, speed: .14, warm: true, near: false },
  { x: .8, y: .63, z: 720, width: 1.75, height: .67, opacity: .44, speed: -.18, warm: false, near: false },
  { x: -1.12, y: .97, z: 140, width: 1.7, height: .82, opacity: .22, speed: .1, warm: true, near: true },
  { x: 1.12, y: .85, z: 220, width: 1.7, height: .76, opacity: .17, speed: -.11, warm: false, near: true },
];

export function createAtmosphere(back: HTMLCanvasElement, front: HTMLCanvasElement): () => void {
  const distant = back.getContext("2d", { alpha: true });
  const close = front.getContext("2d", { alpha: true });
  if (!distant || !close) return () => {};
  const warmCloud = cloudTexture(739, true);
  const coolCloud = cloudTexture(162, false);
  const mote = moteTexture();
  const random = randomGenerator(1939);
  const particles = Array.from({ length: 82 }, (_, index) => ({
    x: (random() - .5) * 2.6, y: (random() - .5) * 2.2, z: random() * 1500,
    radius: .65 + random() * 1.2, alpha: .2 + random() * .36,
    phase: random() * Math.PI * 2, speed: .5 + random() * .9, near: index < 12,
  }));
  let width = 1, height = 1, backRatio = 1, frontRatio = 1, mobile = false;
  let resizePending = true, frame = 0, lastFrame = 0, elapsed = 0, disposed = false;
  let targetScroll = window.scrollY, scroll = targetScroll;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const dialogs = Array.from(document.querySelectorAll("dialog"));
  const readingAreas = Array.from(document.querySelectorAll(".cinematic-finale h1, .chapter, .about-heading h2, .about-copy, .world-heading, .world-panel > p, .closing-main, .site-footer"));
  let readingRects: DOMRect[] = [], lastReadingScroll = -1;
  const resize = () => { resizePending = true; };
  const onScroll = () => { targetScroll = window.scrollY; };
  const onPointer = (event: PointerEvent) => {
    if (mobile || event.pointerType !== "mouse") return;
    pointer.targetX = event.clientX / width - .5;
    pointer.targetY = event.clientY / height - .5;
  };
  const resetPointer = () => { pointer.targetX = pointer.targetY = 0; };
  const size = () => {
    width = document.documentElement.clientWidth;
    height = window.innerHeight;
    mobile = width < 768 || window.matchMedia("(pointer: coarse)").matches;
    // Haze is intentionally soft. Limit its pixel budget independently of crisp dust.
    backRatio = Math.min(mobile ? .6 : .85, 1300 / width);
    frontRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25, 1800 / width);
    for (const [canvas, ratio] of [[back, backRatio], [front, frontRatio]] as const) {
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      canvas.dataset.quality = mobile ? "light" : "full";
    }
    lastReadingScroll = -1;
    resizePending = false;
  };
  const render = (now: number) => {
    if (disposed) return;
    frame = requestAnimationFrame(render);
    const interval = mobile ? 1000 / 24 : 1000 / 30;
    if (lastFrame && now - lastFrame < interval - 1) return;
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .06) : 1 / 30;
    lastFrame = now;
    elapsed += dt;
    if (resizePending) size();
    scroll += (targetScroll - scroll) * (1 - Math.exp(-dt * 6));
    pointer.x += (pointer.targetX - pointer.x) * (1 - Math.exp(-dt * 3));
    pointer.y += (pointer.targetY - pointer.y) * (1 - Math.exp(-dt * 3));
    distant.setTransform(backRatio, 0, 0, backRatio, 0, 0);
    close.setTransform(frontRatio, 0, 0, frontRatio, 0, 0);
    distant.clearRect(0, 0, width, height);
    close.clearRect(0, 0, width, height);
    const camera = Math.min(scroll / height * 27, 280);
    const strength = .68 + smooth((scroll / height - 2.3) / 1.2) * .32;
    if (lastReadingScroll < 0 || Math.abs(targetScroll - lastReadingScroll) > 3) {
      readingRects = readingAreas.map(element => element.getBoundingClientRect()).filter(rect => rect.bottom > 0 && rect.top < height);
      lastReadingScroll = targetScroll;
    }

    // A quiet shaft of warm light makes the suspended dust feel illuminated.
    distant.save();
    distant.translate(width * .14 - pointer.x * 8, -height * .1);
    distant.rotate(-.3);
    const shaft = distant.createLinearGradient(0, 0, width * .54, 0);
    shaft.addColorStop(0, "rgba(219,195,148,0)");
    shaft.addColorStop(.32, "rgba(219,195,148,.014)");
    shaft.addColorStop(.44, "rgba(227,205,163,.045)");
    shaft.addColorStop(.58, "rgba(219,195,148,.013)");
    shaft.addColorStop(1, "rgba(219,195,148,0)");
    distant.fillStyle = shaft;
    distant.fillRect(0, 0, width * .54, height * 1.4);
    distant.restore();

    for (const cloud of clouds) {
      if (mobile && cloud.near) continue;
      const context = cloud.near ? close : distant;
      const perspective = (700 + cloud.z) / (700 + cloud.z - camera);
      const drift = Math.sin(elapsed * .027 + cloud.z) * .12 + elapsed * cloud.speed * .013;
      const x = width * (.5 + (cloud.x * .5 + Math.sin(drift) * .34) * perspective)
        - pointer.x * (cloud.near ? 75 : 26) * perspective;
      const y = height * (.5 + cloud.y * .5 * perspective)
        + Math.sin(elapsed * .045 + cloud.z) * 14 - pointer.y * (cloud.near ? 45 : 14)
        - scroll * (cloud.near ? .011 : .003);
      const w = width * cloud.width * perspective;
      const h = height * cloud.height * perspective;
      context.globalAlpha = cloud.opacity * strength * (mobile ? .74 : 1);
      context.drawImage(cloud.warm ? warmCloud : coolCloud, x - w / 2, y - h / 2, w, h);
    }

    // Feather the haze around reading areas without cutting rectangular holes.
    distant.save();
    distant.globalCompositeOperation = "destination-out";
    distant.globalAlpha = 1;
    for (const rect of readingRects) {
      distant.save();
      distant.translate(rect.left + rect.width / 2, rect.top + rect.height / 2);
      distant.scale(Math.max(1, rect.width * .72), Math.max(1, rect.height * .75 + 40));
      const clearAir = distant.createRadialGradient(0, 0, 0, 0, 0, 1);
      clearAir.addColorStop(0, "rgba(0,0,0,.72)");
      clearAir.addColorStop(.55, "rgba(0,0,0,.5)");
      clearAir.addColorStop(1, "rgba(0,0,0,0)");
      distant.fillStyle = clearAir;
      distant.fillRect(-1, -1, 2, 2);
      distant.restore();
    }
    distant.restore();

    const count = mobile ? 30 : particles.length;
    for (let i = 0; i < count; i++) {
      const particle = particles[i];
      // Move through a perspective volume; fade depth boundaries before recycling.
      const z = wrap(particle.z - camera * (particle.near ? 2.2 : 1) - elapsed * particle.speed * 2.8, 1500);
      const perspective = 780 / (420 + z);
      const fade = smooth(z / 160) * smooth((1500 - z) / 170);
      const x = width * .5 + (particle.x * width * .68 + Math.sin(elapsed * .13 + particle.phase) * 18
        - pointer.x * (particle.near ? 64 : 28)) * perspective;
      const worldY = wrap(particle.y * height + height - elapsed * particle.speed * 4 - scroll * .037, height * 2) - height;
      const y = height * .5 + (worldY - pointer.y * 24) * perspective;
      if (x < -20 || x > width + 20 || y < -20 || y > height + 20) continue;
      const context = particle.near ? close : distant;
      const edge = .4 + .6 * smooth(Math.abs(x / width - .5) * 2);
      context.globalAlpha = particle.alpha * fade * strength * (particle.near ? edge * .76 : .8);
      const radius = particle.radius * perspective * (particle.near ? 3.4 : 1.4);
      context.drawImage(mote, x - radius, y - radius, radius * 2, radius * 2);
    }
    distant.globalAlpha = close.globalAlpha = 1;
  };
  const visibility = () => {
    cancelAnimationFrame(frame);
    lastFrame = 0;
    const paused = document.hidden || dialogs.some(dialog => dialog.open);
    back.dataset.state = front.dataset.state = paused ? "paused" : "running";
    if (!paused && !disposed) frame = requestAnimationFrame(render);
  };
  const observer = new MutationObserver(visibility);
  dialogs.forEach(dialog => observer.observe(dialog, { attributes: true, attributeFilter: ["open"] }));
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", resetPointer);
  document.addEventListener("visibilitychange", visibility);
  visibility();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onPointer);
    document.documentElement.removeEventListener("pointerleave", resetPointer);
    document.removeEventListener("visibilitychange", visibility);
    back.width = back.height = front.width = front.height = 1;
    warmCloud.width = warmCloud.height = coolCloud.width = coolCloud.height = mote.width = mote.height = 1;
    back.dataset.state = front.dataset.state = "off";
  };
}
