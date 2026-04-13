#!/usr/bin/env node
/*
 * Etsy shop scraper — Playwright with persistent session.
 *
 * Usage:
 *   npm i -D playwright
 *   npx playwright install chromium
 *   node scripts/scrape_etsy.js                    # scrape default shop
 *   node scripts/scrape_etsy.js --login            # one-time manual login (keeps cookies)
 *   node scripts/scrape_etsy.js --shop=<handle>    # override shop
 *
 * Output: etsy_snapshot.json at repo root.
 *
 * Why Playwright and not fetch: Etsy returns 403 to unauthenticated scrapers.
 * A persistent browser context with real cookies bypasses that cleanly.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SHOP = (process.argv.find(a => a.startsWith('--shop=')) || '--shop=lisascustomkeychainz').split('=')[1];
const LOGIN_MODE = process.argv.includes('--login');
const USER_DATA_DIR = path.resolve(__dirname, '..', '.etsy_session');
const OUTPUT = path.resolve(__dirname, '..', 'etsy_snapshot.json');

async function main() {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: !LOGIN_MODE,
    viewport: { width: 1400, height: 900 },
  });
  const page = await ctx.newPage();

  if (LOGIN_MODE) {
    await page.goto('https://www.etsy.com/signin');
    console.log('→ Log in manually in the opened browser window.');
    console.log('→ Once you see your account page, press ENTER here to save the session.');
    await new Promise(r => process.stdin.once('data', r));
    await ctx.close();
    console.log('Session saved to', USER_DATA_DIR);
    return;
  }

  const shopUrl = `https://www.etsy.com/shop/${SHOP}`;
  console.log('→ Opening', shopUrl);
  await page.goto(shopUrl, { waitUntil: 'domcontentloaded' });

  // Collect listing URLs by walking paginated shop view
  const listingUrls = new Set();
  let pageNum = 1;
  while (pageNum < 20) {
    await page.waitForTimeout(1500);
    const urls = await page.$$eval(
      'a[href*="/listing/"]',
      as => as.map(a => a.href.split('?')[0]).filter(h => /\/listing\/\d+/.test(h))
    );
    urls.forEach(u => listingUrls.add(u));
    const next = await page.$('a[aria-label="Next page"]:not([aria-disabled="true"])');
    if (!next) break;
    await next.click();
    pageNum++;
  }
  console.log(`→ Found ${listingUrls.size} listings across ${pageNum} page(s).`);

  const listings = [];
  let i = 0;
  for (const url of listingUrls) {
    i++;
    console.log(`  [${i}/${listingUrls.size}]`, url);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);

      const data = await page.evaluate(() => {
        const $ = (sel) => document.querySelector(sel);
        const title = $('h1')?.innerText?.trim() || '';
        const price = $('[data-buy-box-region="price"]')?.innerText?.trim()
                   || $('p[class*="wt-text-title"]')?.innerText?.trim()
                   || '';
        const description = $('[data-id="description-text"]')?.innerText?.trim()
                         || $('#product-details-content-toggle')?.innerText?.trim()
                         || '';
        const images = [...document.querySelectorAll('img[src*="/il/"]')]
          .map(img => img.src)
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 10);
        const tags = [...document.querySelectorAll('a[href*="/market/"]')]
          .map(a => a.innerText.trim())
          .filter(Boolean);
        return { title, price, description, images, tags };
      });
      listings.push({ url, ...data });
    } catch (e) {
      console.error('    ERR:', e.message);
      listings.push({ url, error: e.message });
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify({
    shop: SHOP,
    scrapedAt: new Date().toISOString(),
    count: listings.length,
    listings,
  }, null, 2));
  console.log('✓ Wrote', OUTPUT);
  await ctx.close();
}

main().catch(e => { console.error(e); process.exit(1); });
