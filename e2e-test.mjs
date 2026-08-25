import { chromium } from 'playwright';

const CHROMIUM_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
];

const BASE = 'http://127.0.0.1:3000';
const results = { test1: {}, test2: {}, test3: {} };

async function run() {
  const browser = await chromium.launch({ args: CHROMIUM_ARGS });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push('PAGE_ERROR:' + err.message));

  // ==================== TEST 1: LANDING PAGE ====================
  console.log('\n=== TEST 1: Landing Page ===');
  try {
    const resp = await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
    results.test1.status = resp ? resp.status() : 'null';
    console.log(`  Page status: ${results.test1.status}`);

    // Check not blank
    const bodyText = await page.evaluate(() => document.body.innerText);
    const isBlank = !bodyText || bodyText.trim().length < 20;
    results.test1.notBlank = !isBlank;
    console.log(`  Not blank: ${!isBlank} (text length: ${bodyText ? bodyText.length : 0})`);

    // Check Seghro branding
    const hasSeghro = bodyText.includes('Seghro') || bodyText.includes('SENTINEL') || bodyText.includes('sentinel');
    results.test1.hasBranding = hasSeghro;
    console.log(`  Seghro branding visible: ${hasSeghro}`);

    // Check footer
    const footerText = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      return footer ? footer.innerText : null;
    });
    results.test1.hasFooter = !!footerText;
    results.test1.footerText = footerText ? footerText.substring(0, 100) : 'NOT FOUND';
    console.log(`  Footer visible: ${!!footerText}`);
    if (footerText) console.log(`  Footer text: ${footerText.substring(0, 100)}`);

    // Console errors
    results.test1.consoleErrors = consoleErrors.length;
    console.log(`  Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log(`  Errors: ${consoleErrors.slice(0, 5).join(' | ')}`);
    }

    // Screenshot
    await page.screenshot({ path: '/home/z/my-project/e2e-test1-landing.png', fullPage: true });
    console.log('  Screenshot saved: e2e-test1-landing.png');

  } catch (e) {
    results.test1.error = e.message;
    console.log(`  ERROR: ${e.message}`);
  }

  // ==================== TEST 2: LOGIN FLOW ====================
  console.log('\n=== TEST 2: Login Flow ===');
  consoleErrors.length = 0;
  try {
    const resp = await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    results.test2.loginPageStatus = resp ? resp.status() : 'null';
    console.log(`  Login page status: ${results.test2.loginPageStatus}`);

    await page.screenshot({ path: '/home/z/my-project/e2e-test2a-login-page.png' });
    console.log('  Login page screenshot saved');

    // Use nativeInputValueSetter trick as required
    await page.evaluate(() => {
      // Email
      const emailInput = document.querySelector('input[name="email"]') || document.querySelector('input[type="email"]');
      if (emailInput) {
        emailInput.focus();
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(emailInput, 'demo@seghro.dev');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      // Password
      const passInput = document.querySelector('input[name="password"]') || document.querySelector('input[type="password"]');
      if (passInput) {
        passInput.focus();
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(passInput, 'demo1234');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
        passInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Verify fields were filled
    const emailVal = await page.evaluate(() => {
      const el = document.querySelector('input[name="email"]') || document.querySelector('input[type="email"]');
      return el ? el.value : 'NOT FOUND';
    });
    const passVal = await page.evaluate(() => {
      const el = document.querySelector('input[name="password"]') || document.querySelector('input[type="password"]');
      return el ? el.value : 'NOT FOUND';
    });
    results.test2.emailFilled = emailVal === 'demo@seghro.dev';
    results.test2.passwordFilled = passVal === 'demo1234';
    console.log(`  Email filled: ${results.test2.emailFilled} (value: ${emailVal})`);
    console.log(`  Password filled: ${results.test2.passwordFilled} (value length: ${passVal.length})`);

    await page.screenshot({ path: '/home/z/my-project/e2e-test2b-login-filled.png' });

    // Find and click submit button
    const submitClicked = await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]') || 
                 [...document.querySelectorAll('button')].find(b => b.innerText.match(/sign\s*in|log\s*in|login/i));
      if (btn) { btn.click(); return true; }
      return false;
    });
    results.test2.submitClicked = submitClicked;
    console.log(`  Submit clicked: ${submitClicked}`);

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    results.test2.redirectedToDashboard = currentUrl.includes('/dashboard');
    results.test2.finalUrl = currentUrl;
    console.log(`  Redirected to dashboard: ${currentUrl.includes('/dashboard')} (${currentUrl})`);

    await page.screenshot({ path: '/home/z/my-project/e2e-test2c-after-login.png' });

    // Check if dashboard rendered with data
    const dashboardText = await page.evaluate(() => document.body.innerText);
    const hasMetrics = dashboardText.includes('Requests') || dashboardText.includes('Success Rate') || dashboardText.includes('Latency') || dashboardText.includes('Uptime');
    const hasAgentGrid = dashboardText.includes('Agent') || dashboardText.includes('agent');
    results.test2.dashboardRendered = dashboardText.length > 100;
    results.test2.hasMetrics = hasMetrics;
    results.test2.hasAgentGrid = hasAgentGrid;
    console.log(`  Dashboard rendered: ${dashboardText.length > 100} (text length: ${dashboardText.length})`);
    console.log(`  Has metrics: ${hasMetrics}`);
    console.log(`  Has agent grid: ${hasAgentGrid}`);

    results.test2.consoleErrors = consoleErrors.length;
    console.log(`  Console errors: ${consoleErrors.length}`);

  } catch (e) {
    results.test2.error = e.message;
    console.log(`  ERROR: ${e.message}`);
  }

  // ==================== TEST 3: DASHBOARD INTERACTIVITY ====================
  console.log('\n=== TEST 3: Dashboard Interactivity ===');
  consoleErrors.length = 0;
  try {
    // Make sure we're on dashboard
    if (!page.url().includes('/dashboard')) {
      await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    }
    await page.waitForTimeout(2000);

    // Check metric cards
    const metricCards = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="metric"], [class*="stat"], [class*="card"]');
      return cards.length;
    });
    results.test3.metricCardsCount = metricCards;
    console.log(`  Metric/card elements: ${metricCards}`);

    // Check for tab elements
    const tabs = await page.evaluate(() => {
      const tabElements = [
        ...document.querySelectorAll('[role="tab"]'),
        ...document.querySelectorAll('button'),
        ...document.querySelectorAll('a')
      ].filter(el => {
        const text = el.innerText || '';
        return ['Agents', 'Traces', 'Issues', 'Alerts', 'API Health', 'Self-Healing', 'Activity']
          .some(tab => text.trim().includes(tab));
      });
      return tabElements.map(el => ({ tag: el.tagName, text: el.innerText.trim().substring(0, 50) }));
    });
    results.test3.tabsFound = tabs;
    console.log(`  Tabs found: ${tabs.length}`);
    tabs.forEach(t => console.log(`    - ${t.tag}: ${t.text}`));

    // Click each tab and verify data loads
    const tabResults = {};
    const targetTabs = ['Agents', 'Traces', 'Issues', 'Alerts', 'API Health'];
    for (const tabName of targetTabs) {
      consoleErrors.length = 0;
      try {
        const clicked = await page.evaluate((name) => {
          const els = [...document.querySelectorAll('button, [role="tab"], a')];
          const tab = els.find(el => el.innerText.trim().includes(name) && el.offsetParent !== null);
          if (tab) { tab.click(); return true; }
          return false;
        }, tabName);
        
        await page.waitForTimeout(1500);
        
        const tabText = await page.evaluate(() => document.body.innerText);
        const hasData = tabText.length > 100;
        tabResults[tabName] = { clicked, hasData, textLength: tabText.length, errors: consoleErrors.length };
        console.log(`  Tab '${tabName}': clicked=${clicked}, hasData=${hasData}, textLen=${tabText.length}, errors=${consoleErrors.length}`);
      } catch (e) {
        tabResults[tabName] = { error: e.message };
        console.log(`  Tab '${tabName}': ERROR - ${e.message}`);
      }
    }
    results.test3.tabResults = tabResults;

    await page.screenshot({ path: '/home/z/my-project/e2e-test3-dashboard.png', fullPage: true });
    console.log('  Dashboard screenshot saved');

    results.test3.consoleErrors = consoleErrors.length;

  } catch (e) {
    results.test3.error = e.message;
    console.log(`  ERROR: ${e.message}`);
  }

  await browser.close();

  // Print final summary
  console.log('\n=== FINAL RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  
  // Write results to file
  const fs = await import('fs');
  fs.writeFileSync('/home/z/my-project/e2e-results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to e2e-results.json');
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
