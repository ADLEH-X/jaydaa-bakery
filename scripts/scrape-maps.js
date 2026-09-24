const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function scrape() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-US'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  console.log('Navigating to maps URL...');
  await page.goto('https://maps.app.goo.gl/72h1bqnrq5V7qKyR7', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  const url = page.url();
  console.log('Resolved URL:', url);

  const title = await page.title();
  console.log('Page Title:', title);

  // Extract heading (business name)
  const placeName = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const subtitle = document.querySelector('h2');
    const addressButton = document.querySelector('button[data-item-id="address"]');
    const phoneButton = document.querySelector('button[data-item-id*="phone"]');
    return {
      h1: h1 ? h1.innerText : null,
      subtitle: subtitle ? subtitle.innerText : null,
      address: addressButton ? addressButton.innerText : null,
      phone: phoneButton ? phoneButton.innerText : null,
    };
  });

  console.log('Extracted Place Info:', JSON.stringify(placeName, null, 2));

  await browser.close();
}

scrape().catch(console.error);
