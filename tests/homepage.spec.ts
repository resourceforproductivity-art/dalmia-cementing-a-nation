import { test, expect, type Page } from "@playwright/test";

async function filmReady(page: Page) {
  await page.goto("/");
  await expect(page.locator(".cinematic")).toHaveAttribute("data-ready", "true");
  await expect(page.locator(".cinematic")).toHaveAttribute("data-mode", "scrub");
  await page.evaluate(() => document.fonts.ready);
}
async function filmProgress(page: Page, progress: number) {
  await page.evaluate(p => window.scrollTo({ top: window.innerHeight * 3.5 * p, behavior: "instant" }), progress);
  await expect.poll(() => page.locator(".cinematic-video").evaluate((v: HTMLVideoElement, p) => v.seeking ? Infinity : Math.abs(v.currentTime - Math.min(p / .84, 1) * (v.duration - 1 / 24)), progress)).toBeLessThan(.12);
}

test("film advances, reverses, stays pinned, and holds its final frame", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await filmReady(page);
  await filmProgress(page, .4);
  await expect(page.locator(".chapter-button").nth(1)).toHaveAttribute("aria-current", "true");
  expect(await page.locator(".cinematic").evaluate(e => Math.abs(e.getBoundingClientRect().top))).toBeLessThan(2);
  await page.screenshot({ path: "artifacts/chapter-02.jpg", type: "jpeg", quality: 85 });
  await filmProgress(page, .65);
  await expect(page.locator(".chapter-button").nth(2)).toHaveAttribute("aria-current", "true");
  await page.screenshot({ path: "artifacts/chapter-03.jpg", type: "jpeg", quality: 85 });
  await filmProgress(page, .13);
  await expect(page.locator(".chapter-button").nth(0)).toHaveAttribute("aria-current", "true");
  await filmProgress(page, .9);
  await expect(page.getByRole("link", { name: "EXPLORE DALMIA", exact: true })).toBeVisible();
  const held = await page.locator(".cinematic-video").evaluate((v: HTMLVideoElement) => v.currentTime);
  await filmProgress(page, .98);
  expect(await page.locator(".cinematic-video").evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(held, 1);
  await page.screenshot({ path: "artifacts/finale.jpg", type: "jpeg", quality: 85 });
  await page.getByRole("link", { name: "EXPLORE DALMIA", exact: true }).click();
  await expect.poll(() => page.locator("#about").evaluate(e => Math.abs(e.getBoundingClientRect().top - 98))).toBeLessThan(4);
  await expect(page.locator(".site-header")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".about-heading")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "artifacts/about.jpg", type: "jpeg", quality: 85 });
  expect(errors).toEqual([]);
});

test("chapter buttons, skip intro, cinematic header and all section links work", async ({ page }) => {
  await filmReady(page);
  await page.getByRole("button", { name: /Chapter 03:/ }).click();
  await expect.poll(() => page.locator(".cinematic-video").evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(8.5);
  await page.getByRole("button", { name: /Chapter 01:/ }).click();
  await expect.poll(() => page.locator(".cinematic-video").evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(1.4);
  await page.getByRole("link", { name: "SKIP INTRO", exact: true }).click();
  await expect(page.locator(".site-header")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link", { name: "Businesses" }).click();
  await expect.poll(() => page.locator("#our-world").evaluate(e => Math.abs(e.getBoundingClientRect().top - 98))).toBeLessThan(4);
  await page.screenshot({ path: "artifacts/our-world.jpg", type: "jpeg", quality: 85 });
  await page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link", { name: "Sustainability" }).click();
  await expect.poll(() => page.locator("#sustainability").evaluate(e => Math.abs(e.getBoundingClientRect().top - 98))).toBeLessThan(4);
  await page.locator("#closing").scrollIntoViewIfNeeded();
  await page.evaluate(() => document.getElementById("closing")?.scrollIntoView({ behavior: "instant" }));
  await expect(page.locator(".site-header")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".closing-main")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "artifacts/closing.jpg", type: "jpeg", quality: 85 });
});

test("menu traps focus, closes with Escape and restores navigation", async ({ page }) => {
  await filmReady(page);
  const opener = page.getByRole("button", { name: "Open menu", exact: true });
  await opener.click();
  await expect(page.getByRole("dialog", { name: "Explore Dalmia Bharat" })).toBeVisible();
  await page.screenshot({ path: "artifacts/menu.jpg", type: "jpeg", quality: 85 });
  for (let i = 0; i < 7; i++) await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.closest("dialog")?.id)).toBe("main-menu");
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await expect(opener).toHaveAttribute("aria-expanded", "false");
  await opener.click();
  await page.getByRole("navigation", { name: "Expanded navigation" }).getByRole("link", { name: /Businesses/ }).click();
  await expect(page.locator("#main-menu")).not.toBeVisible();
  await expect.poll(() => page.locator("#our-world").evaluate(e => Math.abs(e.getBoundingClientRect().top - 98))).toBeLessThan(4);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

for (const viewport of [{ width: 390, height: 844 }, { width: 820, height: 1180 }, { width: 320, height: 740 }]) {
  test(`responsive layout and imagery at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await filmReady(page);
    await page.screenshot({ path: `artifacts/opening-${viewport.width}.jpg`, type: "jpeg", quality: 85 });
    await filmProgress(page, .64);
    for (const id of ["about", "our-world", "sustainability", "closing"]) {
      await page.evaluate(id => document.getElementById(id)?.scrollIntoView({ behavior: "instant" }), id);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await page.getByRole("navigation", { name: "Expanded navigation" }).getByRole("link", { name: /About/ }).click();
    await expect(page.locator("#main-menu")).not.toBeVisible();
    await expect.poll(() => page.locator("#about").evaluate(e => Math.abs(e.getBoundingClientRect().top - 98))).toBeLessThan(4);
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `artifacts/full-${viewport.width}.jpg`, type: "jpeg", quality: 75, fullPage: true });
  });
}

test("mobile film player offers a working non-scrub alternative", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await filmReady(page);
  await page.getByRole("button", { name: "WATCH FILM" }).click();
  await expect(page.getByRole("dialog", { name: "Cementing a Nation film" })).toBeVisible();
  await expect.poll(() => page.locator(".film-dialog video").evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(.1);
  await page.getByRole("button", { name: "Close film", exact: true }).click();
  await expect(page.locator(".film-dialog")).not.toBeVisible();
  expect(await page.locator(".film-dialog video").evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test("reduced motion removes pinning and presents a usable static finale", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".cinematic")).toHaveAttribute("data-mode", "fallback");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "CEMENTING A NATION" })).toBeVisible();
  await page.getByRole("link", { name: "EXPLORE DALMIA", exact: true }).click();
  await expect(page.locator(".site-header")).toHaveAttribute("data-theme", "dark");
  expect(await page.locator(".cinematic-video").evaluate((v: HTMLVideoElement) => v.currentTime)).toBe(0);
});

test("video failure gracefully removes the pin and keeps content accessible", async ({ page }) => {
  await page.route("**/videos/*.mp4", route => route.abort());
  await page.goto("/");
  await expect(page.locator(".cinematic")).toHaveAttribute("data-mode", "fallback");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "EXPLORE DALMIA", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "EXPLORE DALMIA", exact: true }).click();
  await expect(page.locator(".site-header")).toHaveAttribute("data-theme", "dark");
});




for (const width of [1440, 390]) {
  test(`final video frame continues behind all content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await filmReady(page);
    await filmProgress(page, .98);
    const finalTime = await page.locator('.cinematic-video').evaluate((v: HTMLVideoElement) => v.currentTime);
    for (const id of ['about', 'our-world', 'closing']) {
      await page.evaluate(id => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }), id);
      await expect(page.locator('.cinematic-stage')).toHaveCSS('position', 'fixed');
      const stage = await page.locator('.cinematic-stage').boundingBox();
      expect(stage?.y).toBe(0);
      expect(stage?.height).toBe(900);
      expect(await page.locator('.cinematic-video').evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(finalTime, 1);
      await expect(page.locator(`#${id}`)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(page.locator(`#${id} h2`)).toBeVisible();
      await expect.poll(() => page.locator(`#${id} h2`).evaluate(e => Number(getComputedStyle(e.closest("[data-reveal]")!).opacity))).toBe(1);
      await page.screenshot({ path: `artifacts/continuous-${id}-${width}.jpg`, type: 'jpeg', quality: 85 });
    }
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await expect(page.locator('.site-footer')).toBeVisible();
    expect(await page.locator('.cinematic-video').evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(finalTime, 1);
    await page.screenshot({ path: `artifacts/continuous-footer-${width}.jpg`, type: 'jpeg', quality: 85 });
    // Returning from the footer restores the opening's reversible timeline.
    await filmProgress(page, .15);
    await expect(page.locator('.chapter-button').first()).toHaveAttribute('aria-current', 'true');
  });
}
