// Run against a dev server: PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/check-audio-guide.mjs
import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const base = process.env.BASE_URL || 'http://localhost:3000'
try {
  for (const locale of ['', '/en']) {
    for (const stop of ['', '/01', '/02', '/03', '/04', '/05']) {
      const response = await page.goto(`${base}${locale}/guides/audio${stop}`)
      assert.equal(response.status(), 200)
      assert.equal(await page.locator('.route a').count(), 5)
      assert.equal(
        await page.locator('.audio-guide').getAttribute('lang'),
        'uk'
      )
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        ),
        true
      )
      if (stop) {
        await page.waitForFunction(
          () => document.querySelector('audio')?.duration > 0
        )
        assert.equal(await page.locator('.play').isDisabled(), false)
        assert.equal(await page.locator('.sample').count(), 1)
        assert.equal(
          (
            await page.locator('[aria-current="page"]').getAttribute('href')
          ).replace(/\/$/, ''),
          `${locale}/guides/audio${stop}`
        )
        assert.equal(
          await page
            .locator('.status')
            .textContent()
            .then(s => s.trim()),
          'Натисніть Play, щоб слухати'
        )
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight)
        )
        const footer = await page.locator('footer').boundingBox()
        const player = await page.locator('.player').boundingBox()
        assert.ok(
          footer.y + footer.height <= player.y,
          'Player must not obscure the footer'
        )
      }
    }
  }
  await page.goto(`${base}/guides/audio/04`)
  if (process.env.SCREENSHOT_DIR)
    await page.screenshot({
      path: `${process.env.SCREENSHOT_DIR}/audio-stop-mobile.png`,
      fullPage: true
    })
  await page.goto(`${base}/guides/audio`)
  if (process.env.SCREENSHOT_DIR)
    await page.screenshot({
      path: `${process.env.SCREENSHOT_DIR}/audio-overview-mobile.png`,
      fullPage: true
    })
  await page.setViewportSize({ width: 1440, height: 1000 })
  if (process.env.SCREENSHOT_DIR)
    await page.screenshot({
      path: `${process.env.SCREENSHOT_DIR}/audio-overview-desktop.png`,
      fullPage: true
    })

  await page.goto(`${base}/guides/audio/01`)
  await page.waitForFunction(
    () => document.querySelector('audio')?.duration > 50
  )
  assert.equal(
    await page.locator('audio').evaluate(a => a.paused),
    true,
    'Never autoplay'
  )
  await page.locator('.play').click()
  await page.waitForFunction(() => !document.querySelector('audio').paused)
  await page.locator('.play').click()
  await page.locator('[data-skip="10"]').click()
  assert.ok(await page.locator('audio').evaluate(a => a.currentTime >= 10))
  await page.locator('[data-skip="-10"]').click()
  assert.ok(await page.locator('audio').evaluate(a => a.currentTime < 1))
  await page
    .locator('select[aria-label="Швидкість відтворення"]')
    .selectOption('1.5')
  assert.equal(await page.locator('audio').evaluate(a => a.playbackRate), 1.5)
  await page.locator('.seek').evaluate(input => {
    input.value = String(Number(input.max) - 1)
    input.dispatchEvent(new Event('input'))
  })
  await page.locator('.play').click()
  await page.waitForFunction(() => document.querySelector('audio').ended)
  assert.equal(
    page.url(),
    `${base}/guides/audio/01`,
    'Finishing must not navigate'
  )
  assert.equal(await page.locator('audio').evaluate(a => a.paused), true)
  assert.equal(await page.locator('.status').textContent(), 'Аудіо завершено')
  console.log(
    'Passed: 12 routes, Ukrainian fallback, mobile layout, sample audio, playback, seeking, speed, and no automatic next track.'
  )
} finally {
  await browser.close()
}
