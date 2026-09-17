import { test, expect } from '@playwright/test';

for (const setting of [{ label: 'desktop', width: 1440, height: 900, quality: '720p' }, { label: 'mobile', width: 390, height: 844, quality: '480p' }]) {
  test(`${setting.label} downloads only its selected encode and keeps it after resize`, async ({ page }) => {
    await page.setViewportSize({ width: setting.width, height: setting.height });
    const videoPaths = new Set<string>();
    page.on('request', request => { if (request.url().includes('.mp4')) videoPaths.add(new URL(request.url()).pathname); });
    const started = Date.now();
    await page.goto('/');
    await expect(page.locator('.cinematic')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('.cinematic')).toHaveAttribute('data-quality', setting.quality);
    await expect(page.locator('.cinematic')).toHaveAttribute('data-mode', 'scrub');
    console.log(`${setting.label} first frame ready: ${Date.now() - started} ms`);
    const film = page.locator('.cinematic-video');
    expect(await film.evaluate((v: HTMLVideoElement) => v.videoHeight)).toBe(Number.parseInt(setting.quality));
    for (const p of [.7, .12, .94]) {
      await page.evaluate(p => window.scrollTo({ top: innerHeight * 3.5 * p, behavior: 'instant' }), p);
      await expect.poll(() => film.evaluate((v: HTMLVideoElement, p) => v.seeking ? Infinity : Math.abs(v.currentTime - Math.min(p / .84, 1) * (v.duration - 1 / 24)), p)).toBeLessThan(.12);
    }
    await page.setViewportSize({ width: setting.width === 390 ? 1440 : 390, height: 844 });
    await expect(page.locator('.cinematic')).toHaveAttribute('data-quality', setting.quality);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'WATCH FILM' }).click();
    await expect.poll(() => page.locator('.film-dialog video').evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(.1);
    await page.getByRole('button', { name: 'Close film', exact: true }).click();
    expect([...videoPaths]).toEqual([`/videos/cementing-a-nation-${setting.quality}.mp4`]);
  });
}

test('mobile loading and reverse scrubbing under a throttled connection', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 100, downloadThroughput: 3_000_000 / 8, uploadThroughput: 1_000_000 / 8, connectionType: 'cellular4g' });
  const started = Date.now();
  await page.goto('/');
  await expect(page.locator('.cinematic')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.cinematic')).toHaveAttribute('data-mode', 'scrub');
  console.log(`Mobile first frame on 3 Mbps / 100 ms network: ${Date.now() - started} ms`);
  const film = page.locator('.cinematic-video');
  for (const p of [.65, .15]) {
    await page.evaluate(p => window.scrollTo({ top: innerHeight * 3.5 * p, behavior: 'instant' }), p);
    await expect.poll(() => film.evaluate((v: HTMLVideoElement, p) => v.seeking ? Infinity : Math.abs(v.currentTime - (p / .84) * (v.duration - 1 / 24)), p)).toBeLessThan(.12);
  }
  await expect(page.locator('.cinematic')).toHaveAttribute('data-mode', 'scrub');
});

test('reduced motion does not automatically download either video', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const videos: string[] = [];
  page.on('request', request => { if (request.url().includes('.mp4')) videos.push(request.url()); });
  await page.goto('/');
  await expect(page.locator('.cinematic')).toHaveAttribute('data-mode', 'fallback');
  await page.getByRole('link', { name: 'EXPLORE DALMIA', exact: true }).click();
  expect(videos).toEqual([]);
});

