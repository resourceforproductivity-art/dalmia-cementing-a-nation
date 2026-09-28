import { test, expect } from '@playwright/test';

test('architectural opening yields to the film and returns on reverse scroll', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.cinematic')).toHaveAttribute('data-ready', 'true');
  const art = page.locator('.opening-art');
  await expect(art).toBeVisible();
  await expect(art).toHaveCSS('pointer-events', 'none');
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.mouse.move(150, 200);
  const before = await page.locator('.opening-parallax').evaluate(e => getComputedStyle(e).transform);
  await page.mouse.move(1300, 600);
  await expect.poll(() => page.locator('.opening-parallax').evaluate(e => getComputedStyle(e).transform)).not.toBe(before);
  await page.evaluate(() => window.scrollTo({ top: innerHeight * 3.5 * .16, behavior: 'instant' }));
  await expect(art).toBeHidden();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(art).toBeVisible();
  await page.getByRole('link', { name: 'SKIP INTRO', exact: true }).click();
  await expect(art).toBeHidden();
  await expect.poll(() => page.locator('#about').evaluate(e => Math.abs(e.getBoundingClientRect().top - 98))).toBeLessThan(4);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(art).toBeHidden();
});
