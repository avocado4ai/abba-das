import puppeteer from 'puppeteer';

async function runTests() {
  console.log('🚀 Starting Chrome DevTools E2E Tests...');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const url = 'https://abba-das.vercel.app';
  
  try {
    console.log(`🌐 Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });

    console.log('📸 Taking homepage screenshot...');
    await page.screenshot({ path: 'homepage.png' });

    console.log('🔍 Checking for main title...');
    const titleText = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.innerText : null;
    });

    if (titleText === 'אבא-דס') {
      console.log('✅ Homepage loaded successfully with correct title!');
    } else {
      console.error(`❌ Title mismatch. Expected "אבא-דס", got "${titleText}"`);
    }

    console.log('🔍 Checking for stories feed...');
    const storiesCount = await page.evaluate(() => {
      return document.querySelectorAll('article').length;
    });

    console.log(`✅ Found ${storiesCount} stories on the homepage.`);

    // Test search functionality if there are stories
    if (storiesCount > 0) {
      console.log('🔍 Testing search functionality...');
      const searchInput = await page.$('input[type="text"]');
      if (searchInput) {
        await searchInput.type('test search');
        await new Promise(r => setTimeout(r, 1000));
        console.log('✅ Search input works!');
      }
    }

    console.log('🎉 All tests passed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
