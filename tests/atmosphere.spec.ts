import { test, expect } from '@playwright/test';

const canvasImage = (canvas: HTMLCanvasElement) => canvas.toDataURL();

test('atmosphere moves behind content and pauses while the menu is open', async ({ page }) => {
  await page.goto('/');
  const back = page.locator('.atmosphere-distant');
  const front = page.locator('.atmosphere-near');
  await expect(back).toHaveAttribute('data-state', 'running');
  await expect(front).toHaveCSS('pointer-events', 'none');
  const initial = await back.evaluate(canvasImage);
  await expect.poll(() => back.evaluate(canvasImage)).not.toBe(initial);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await expect(back).toHaveAttribute('data-state', 'paused');
  const paused = await back.evaluate(canvasImage);
  await page.mouse.move(900, 500);
  expect(await back.evaluate(canvasImage)).toBe(paused);
  await page.getByRole('button', { name: 'Close menu', exact: true }).click();
  await expect(back).toHaveAttribute('data-state', 'running');
  await expect.poll(() => back.evaluate(canvasImage)).not.toBe(paused);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(back).toHaveAttribute('data-state', 'off');
  await expect(back).toBeHidden();
  expect(await back.evaluate((canvas: HTMLCanvasElement) => canvas.width)).toBe(1);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(back).toHaveAttribute('data-state', 'running');
  await expect.poll(() => back.evaluate((canvas: HTMLCanvasElement) => canvas.width)).toBeGreaterThan(1);
});

test('mobile atmosphere uses a smaller render budget and leaves navigation accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const back = page.locator('.atmosphere-distant');
  await expect(back).toHaveAttribute('data-quality', 'light');
  expect(await back.evaluate((canvas: HTMLCanvasElement) => canvas.width)).toBeLessThan(300);
  await page.getByRole('link', { name: 'SKIP INTRO', exact: true }).click();
  await expect.poll(() => page.locator('#about').evaluate(e => Math.abs(e.getBoundingClientRect().top - 98))).toBeLessThan(4);
  await expect(page.locator('.cinematic-video')).toHaveAttribute('src', /720p\.mp4$/);
});

test('cloud deformation responds to mouse movement more strongly than ambient drift', async ({ page }) => {
  await page.goto('/');
  const back = page.locator('.atmosphere-distant');
  await expect(back).toHaveAttribute('data-state', 'running');
  await page.getByRole('link', { name: 'SKIP INTRO', exact: true }).click();
  await expect.poll(() => page.locator('.cinematic-video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(11.9);
  const sample = () => back.evaluate((source: HTMLCanvasElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 96; canvas.height = 60;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(source, 0, 0, 96, 60);
    return Array.from(ctx.getImageData(0, 0, 96, 60).data);
  });
  const difference = (a: number[], b: number[]) => a.reduce((sum, value, i) => sum + Math.abs(value - b[i]), 0) / a.length;
  await page.mouse.move(180, 300);
  // Let the deliberately slow camera response settle before measuring idle drift.
  await page.waitForTimeout(5500);
  const before = await sample();
  await page.waitForTimeout(650);
  const idle = await sample();
  await page.mouse.move(1270, 660, { steps: 12 });
  await page.waitForTimeout(650);
  const moved = await sample();
  expect(difference(idle, moved)).toBeGreaterThan(Math.max(1, difference(before, idle) * 1.5));
});

test('the film and navigation remain usable without WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === 'webgl' || type === 'webgl2') return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('.cinematic')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.atmosphere-distant')).toHaveAttribute('data-state', 'off');
  await page.getByRole('link', { name: 'SKIP INTRO', exact: true }).click();
  await expect.poll(() => page.locator('#about').evaluate(e => Math.abs(e.getBoundingClientRect().top - 98))).toBeLessThan(4);
  await expect.poll(() => page.locator('.cinematic-video').evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(11.9);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Close menu', exact: true })).toBeVisible();
});
