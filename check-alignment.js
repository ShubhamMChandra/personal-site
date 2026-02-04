import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

// Navigate directly to references with hash
await page.goto('file:///Users/shubhamchandra/personal-site/index.html#references');
await page.waitForTimeout(1000);

// Screenshot page 1
await page.screenshot({ path: '/tmp/refs-page1.png', fullPage: false });
console.log('Page 1 captured');

// Use keyboard to go to next page
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/refs-page2.png', fullPage: false });
console.log('Page 2 captured');

// Page 3
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/refs-page3.png', fullPage: false });
console.log('Page 3 captured');

await browser.close();
console.log('Done! Screenshots saved to /tmp/refs-page*.png');
