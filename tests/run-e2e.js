const { chromium } = require('playwright');

(async () => {
  const port = process.env.PORT || '8001';
  const serverUrl = `http://localhost:${port}`;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    console.log('Visiting', serverUrl);
    await page.goto(serverUrl, { waitUntil: 'load', timeout: 30000 });

    // Open Countries view
    await page.click('.nav-tab[data-view="countries"]');
    await page.waitForSelector('#countriesGrid .country-card', { timeout: 10000 });

    // Click Afghanistan card (select by data-country-id to avoid sidebar duplicates)
    const afCard = page.locator('.country-card[data-country-id="country-af"]');
    await afCard.waitFor({ state: 'visible', timeout: 10000 });
    await afCard.scrollIntoViewIfNeeded();
    await afCard.click();
    await page.waitForSelector('#countryModal.active, .country-modal.active', { timeout: 10000 });

    // Click the event 'Invasion soviétique de l'Afghanistan' inside the modal
    const evtLocator = page.locator('.country-modal .country-event').filter({ hasText: "Invasion soviétique de l'Afghanistan" }).first();
    await evtLocator.waitFor({ state: 'visible', timeout: 10000 });
    await evtLocator.scrollIntoViewIfNeeded();
    await evtLocator.click();

    // Wait for detail page to appear
    await page.waitForSelector('#detailPage.active', { timeout: 10000 });

    // Check press link visibility
    const pressVisible = await page.isVisible('#detailPressLink');
    console.log('Press link visible:', pressVisible);

    if (!pressVisible) {
      throw new Error('Press link not visible in detail view');
    }

    console.log('E2E test succeeded');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E test failed:', err);
    await browser.close();
    process.exit(2);
  }
})();
