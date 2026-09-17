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
