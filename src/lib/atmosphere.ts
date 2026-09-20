/** Procedural cloud banks with depth parallax and a diffusing cursor displacement field. */
const clamp = (n: number, low = 0, high = 1) => Math.min(high, Math.max(low, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

const vertexSource = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * .5 + .5;
  gl_Position = vec4(position, 0., 1.);
}`;

// Original cloud shader: large drifting billows, internal detail and soft density edges.
// The cursor distorts the density field itself; there are no point sprites or light shafts.
const fragmentSource = `
precision mediump float;
varying vec2 uv;
uniform sampler2D noiseMap;
uniform sampler2D flowMap;
uniform vec2 camera;
uniform float aspect, time, layer, strength, travel;

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return texture2D(noiseMap, (i + f + .5) / 128.).r;
}
float billows(vec2 p) {
  float n = noise(p) * .52;
  p = mat2(1.64, 1.12, -1.12, 1.64) * p + 7.3;
  n += noise(p) * .27;
  p = mat2(1.72, -1.08, 1.08, 1.72) * p + 3.7;
  n += noise(p) * .14;
  return n + noise(p * 2.03) * .07;
}
void main() {
  // Near banks move further than the distant veil as the virtual camera turns.
  float depth = mix(.018, .058, layer * .5);
  vec2 view = uv + camera * vec2(depth, depth * .7);
  view = (view - .5) / (1. + travel * (.018 + layer * .022)) + .5;
  vec2 p = vec2(view.x * aspect, view.y);
  p.y += travel * (.015 + layer * .009);
  p += vec2(time * (.004 + layer * .002), time * .0015);
  p += vec2(layer * 9.7, layer * 3.1);

  vec2 curl = vec2(noise(p * 2.1 + time * .003), noise(p * 2.4 + 11.3)) - .5;
  // Sample a diffusing cursor field, warped to avoid a circular brush mark.
  float wake = texture2D(flowMap, uv + curl * .045).r;
  p += curl * .19;
  p += vec2(.115, -.065) * wake * (1. + layer * .28);
  p = (p - .5) * (1. + wake * .025) + .5;

  float broad = billows(p * (2.1 + layer * .35));
  float detail = billows(p * 6.4 + broad * .8);
  float density = broad * .77 + detail * .23;
  float side = pow(abs(view.x - .5) * 2., 1.7);
  float lower = 1. - smoothstep(.05, .65, view.y);
  float upper = smoothstep(.77, 1.2, view.y);
  float bank = clamp(side * .64 + lower * .67 + upper * .24, 0., 1.);
  // Most of the volume lives around the frame, leaving the film and type readable.
  float threshold = .63 - bank * .24;
  float alpha = smoothstep(threshold - .075, threshold + .17, density);
  alpha *= mix(.2, .7, bank);
  if (layer > 1.5) {
    alpha *= smoothstep(.3, .94, side + lower * .65) * .48;
  }
  // Density shading belongs to the cloud material, with no added lighting overlay.
  float shade = clamp((density - .32) * 1.7, 0., 1.);
  vec3 color = mix(vec3(.36, .41, .43), vec3(.82, .85, .85), shade);
  color += (detail - .5) * .055;
  alpha *= strength;
  gl_FragColor = vec4(color * alpha, alpha);
}`;

function createCloudRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", {
    alpha: true, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: true, powerPreference: "low-power",
  });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };
  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const noiseTexture = gl.createTexture();
  const flowTexture = gl.createTexture();
  const dispose = () => {
    shaders.forEach(shader => gl.deleteShader(shader));
    gl.deleteProgram(program); gl.deleteBuffer(buffer);
    gl.deleteTexture(noiseTexture); gl.deleteTexture(flowTexture);
  };
  if (!vertex || !fragment || !program || !buffer || !noiseTexture || !flowTexture) {
    dispose(); return null;
  }
  gl.attachShader(program, vertex); gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { dispose(); return null; }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const locations = Object.fromEntries(["camera", "aspect", "time", "layer", "strength", "travel"].map(name => [name, uniform(name)]));
  let seed = 1939;
  const noise = Uint8Array.from({ length: 128 * 128 }, () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 24) & 255;
  });
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 128, 128, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, noise);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.uniform1i(uniform("noiseMap"), 0);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, flowTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 96, 64, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(uniform("flowMap"), 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  return {
    upload: (flow: Uint8Array) => gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 96, 64, gl.LUMINANCE, gl.UNSIGNED_BYTE, flow),
    draw: (target: CanvasRenderingContext2D, width: number, height: number, x: number, y: number, time: number, travel: number, strength: number, near: boolean, mobile: boolean) => {
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(locations.camera, x, y);
      gl.uniform1f(locations.aspect, width / height);
      gl.uniform1f(locations.time, time);
      gl.uniform1f(locations.travel, travel);
      gl.uniform1f(locations.strength, strength);
      const layers = near ? [2] : mobile ? [0] : [0, 1];
      for (const layer of layers) { gl.uniform1f(locations.layer, layer); gl.drawArrays(gl.TRIANGLES, 0, 3); }
      // Two presentation canvases put clouds on both sides of the editorial content.
      // Copy immediately, before WebGL discards its drawing buffer.
      target.clearRect(0, 0, width, height);
      target.drawImage(canvas, 0, 0);
    },
    dispose,
  };
}

export function createAtmosphere(back: HTMLCanvasElement, front: HTMLCanvasElement): () => void {
  const distant = back.getContext("2d", { alpha: true });
  const close = front.getContext("2d", { alpha: true });
  if (!distant || !close) return () => {};
  const surface = document.createElement("canvas");
  const renderer = createCloudRenderer(surface);
  // The underlying film remains the complete visual fallback if WebGL is unavailable.
  if (!renderer) return () => {};
  let width = 1, height = 1, mobile = false, resizePending = true;
  let frame = 0, lastFrame = 0, elapsed = 0, disposed = false, contextLost = false;
  let targetScroll = window.scrollY, scroll = targetScroll;
  const pointer = { x: .5, y: .5, targetX: .5, targetY: .5, active: false };
  const camera = { x: 0, y: 0 };
  let flow = new Float32Array(96 * 64), nextFlow = new Float32Array(96 * 64);
  const flowPixels = new Uint8Array(96 * 64);
  const dialogs = Array.from(document.querySelectorAll("dialog"));
  const readingAreas = Array.from(document.querySelectorAll(".cinematic-finale h1, .chapter, .about-heading h2, .about-copy, .world-heading, .world-panel > p, .closing-main, .site-footer"));
  let readingRects: DOMRect[] = [], lastReadingScroll = -1;
  const resize = () => { resizePending = true; };
  const onScroll = () => { targetScroll = window.scrollY; };
  const onPointer = (event: PointerEvent) => {
    if (mobile || event.pointerType !== "mouse") return;
    pointer.active = true;
    pointer.targetX = clamp(event.clientX / width);
    pointer.targetY = 1 - clamp(event.clientY / height);
  };
  const resetPointer = () => { pointer.targetX = pointer.targetY = .5; pointer.active = false; };
  const size = () => {
    width = document.documentElement.clientWidth;
    height = window.innerHeight;
    mobile = width < 768 || window.matchMedia("(pointer: coarse)").matches;
    const ratio = Math.min(mobile ? .6 : .75, 1152 / width);
    for (const canvas of [back, front]) {
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      canvas.dataset.quality = mobile ? "light" : "full";
    }
    if (mobile) { resetPointer(); flow.fill(0); nextFlow.fill(0); }
    lastReadingScroll = -1;
    resizePending = false;
  };
  const updateFlow = (dt: number) => {
    const response = 1 - Math.exp(-dt * 3);
    pointer.x += (pointer.targetX - pointer.x) * response;
    pointer.y += (pointer.targetY - pointer.y) * response;
    // Camera drift settles much more slowly than the cursor deformation.
    const cameraResponse = 1 - Math.exp(-dt * .5);
    camera.x += ((pointer.targetX - .5) * 2 - camera.x) * cameraResponse;
    camera.y += ((pointer.targetY - .5) * 2 - camera.y) * cameraResponse;
    const decay = Math.exp(-dt * .72), diffusion = Math.min(dt * 6, .3);
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 96; x++) {
        const i = y * 96 + x;
        const neighbours = (flow[y * 96 + Math.max(0, x - 1)] + flow[y * 96 + Math.min(95, x + 1)]
          + flow[Math.max(0, y - 1) * 96 + x] + flow[Math.min(63, y + 1) * 96 + x]) * .25;
        const distance = Math.hypot(x / 95 - pointer.x, y / 63 - pointer.y);
        const brush = pointer.active ? smooth(1 - distance / .12) : 0;
        nextFlow[i] = Math.min(1, (flow[i] + (neighbours - flow[i]) * diffusion) * decay + brush * dt * 2.7);
        flowPixels[i] = Math.round(nextFlow[i] * 255);
      }
    }
    [flow, nextFlow] = [nextFlow, flow];
    renderer.upload(flowPixels);
  };
  const featherType = (context: CanvasRenderingContext2D, opacity: number) => {
    context.save();
    context.scale(back.width / width, back.height / height);
    context.globalCompositeOperation = "destination-out";
    for (const rect of readingRects) {
      context.save();
      context.translate(rect.left + rect.width / 2, rect.top + rect.height / 2);
      context.scale(Math.max(1, rect.width * .72), Math.max(1, rect.height * .75 + 40));
      const clearAir = context.createRadialGradient(0, 0, 0, 0, 0, 1);
      clearAir.addColorStop(0, `rgba(0,0,0,${opacity})`);
      clearAir.addColorStop(.55, `rgba(0,0,0,${opacity * .65})`);
      clearAir.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = clearAir; context.fillRect(-1, -1, 2, 2);
      context.restore();
    }
    context.restore();
  };
  const render = (now: number) => {
    if (disposed || contextLost) return;
    frame = requestAnimationFrame(render);
    const interval = 1000 / (mobile ? 24 : 60);
    if (lastFrame && now - lastFrame < interval - 1) return;
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .06) : 1 / 60;
    lastFrame = now; elapsed += dt;
    if (resizePending) size();
    scroll += (targetScroll - scroll) * (1 - Math.exp(-dt * 6));
    updateFlow(dt);
    const travel = Math.min(scroll / height * .18, 1.8);
    const strength = (.55 + smooth((scroll / height - 2.3) / 1.2) * .35) * (mobile ? .75 : 1);
    if (lastReadingScroll < 0 || Math.abs(targetScroll - lastReadingScroll) > 3) {
      readingRects = readingAreas.map(element => element.getBoundingClientRect()).filter(rect => rect.bottom > 0 && rect.top < height);
      lastReadingScroll = targetScroll;
    }
    renderer.draw(distant, back.width, back.height, camera.x, camera.y, elapsed, travel, strength, false, mobile);
    renderer.draw(close, front.width, front.height, camera.x, camera.y, elapsed, travel, strength, true, mobile);
    featherType(distant, .78);
    featherType(close, .94);
  };
  const visibility = () => {
    cancelAnimationFrame(frame); lastFrame = 0;
    const paused = document.hidden || dialogs.some(dialog => dialog.open);
    back.dataset.state = front.dataset.state = contextLost ? "off" : paused ? "paused" : "running";
    if (!paused && !disposed && !contextLost) frame = requestAnimationFrame(render);
  };
  const lost = () => { contextLost = true; visibility(); };
  surface.addEventListener("webglcontextlost", lost);
  const observer = new MutationObserver(visibility);
  dialogs.forEach(dialog => observer.observe(dialog, { attributes: true, attributeFilter: ["open"] }));
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", resetPointer);
  document.addEventListener("visibilitychange", visibility);
  visibility();
  return () => {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect();
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onPointer);
    document.documentElement.removeEventListener("pointerleave", resetPointer);
    document.removeEventListener("visibilitychange", visibility);
    surface.removeEventListener("webglcontextlost", lost);
    renderer.dispose();
    back.width = back.height = front.width = front.height = surface.width = surface.height = 1;
    back.dataset.state = front.dataset.state = "off";
  };
}
