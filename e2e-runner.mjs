import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http';

const CHROMIUM_ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];
const BASE = 'http://127.0.0.1:3000';

function waitForServer(url, maxMs = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http.get(url, (res) => { resolve(res.statusCode); }).on('error', () => {
        if (Date.now() - start > maxMs) reject(new Error('Server not ready'));
        else setTimeout(check, 500);
      });
    };
    check();
  });
}

async function main() {
  // Start Next.js
  console.log('Starting Next.js dev server...');
  const nextProc = spawn('npx', ['next', 'dev', '-p', '3000'], {
    cwd: '/home/z/my-project',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env }
  });
  nextProc.stdout.on('data', d => process.stderr.write(d));
  nextProc.stderr.on('data', d => process.stderr.write(d));

  const cleanup = () => { try { nextProc.kill('SIGKILL'); } catch(e) {} };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  await waitForServer(BASE);
  console.log('Server ready!');
  await new Promise(r => setTimeout(r, 2000)); // extra settle

  const browser = await chromium.launch({ args: CHROMIUM_ARGS });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push('PAGE_ERROR:' + err.message));

  const results = { test1: {}, test2: {}, test3: {} };

  // ==================== TEST 1: LANDING PAGE ====================
  console.log('\n=== TEST 1: Landing Page ===');
  try {
    const resp = await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
    results.test1.status = resp ? resp.status() : 'null';
    console.log(`  Page status: ${results.test1.status}`);

    const bodyText = await page.evaluate(() => document.body.innerText);
    results.test1.notBlank = bodyText && bodyText.trim().length > 20;
    console.log(`  Not blank: ${results.test1.notBlank} (len: ${bodyText?.length || 0})`);

    const html = await page.evaluate(() => document.body.innerHTML);
    const hasSeghro = html.includes('Seghro') || html.includes('SENTINEL') || html.includes('sentinel');
    results.test1.hasBranding = hasSeghro;
    console.log(`  Seghro branding: ${hasSeghro}`);

    const footerInfo = await page.evaluate(() => {
      const f = document.querySelector('footer');
      return f ? { exists: true, text: f.innerText.substring(0, 150) } : { exists: false };
    });
    results.test1.footer = footerInfo;
    console.log(`  Footer: ${footerInfo.exists ? 'YES - ' + footerInfo.text.substring(0, 80) : 'NO'} `);

    results.test1.consoleErrors = consoleErrors.length;
    console.log(`  Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) console.log(`  First errors: ${consoleErrors.slice(0, 3).join(' | ')}`);

    await page.screenshot({ path: '/home/z/my-project/e2e-test1-landing.png', fullPage: true });
    console.log('  Screenshot: e2e-test1-landing.png');

    results.test1.pass = results.test1.status === 200 && results.test1.notBlank && results.test1.hasBranding && results.test1.footer.exists && consoleErrors.length === 0;
  } catch (e) {
    results.test1.error = e.message;
    results.test1.pass = false;
    console.log(`  ERROR: ${e.message.substring(0, 300)}`);
  }

  // ==================== TEST 2: LOGIN FLOW ====================
  console.log('\n=== TEST 2: Login Flow ===');
  consoleErrors.length = 0;
  try {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    results.test2.loginPageStatus = 200;
    console.log('  Login page loaded');

    await page.screenshot({ path: '/home/z/my-project/e2e-test2a-login.png' });

    // nativeInputValueSetter trick
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]') || document.querySelector('input[type="email"]');
      if (emailInput) {
        emailInput.focus();
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(emailInput, 'demo@seghro.dev');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const passInput = document.querySelector('input[name="password"]') || document.querySelector('input[type="password"]');
      if (passInput) {
        passInput.focus();
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(passInput, 'demo1234');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
        passInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

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
    console.log(`  Email filled: ${results.test2.emailFilled} (${emailVal})`);
    console.log(`  Password filled: ${results.test2.passwordFilled}`);

    await page.screenshot({ path: '/home/z/my-project/e2e-test2b-filled.png' });

    // Click submit
    await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]') ||
                 [...document.querySelectorAll('button')].find(b => b.innerText.match(/sign\s*in|log\s*in|login/i));
      if (btn) btn.click();
    });

    // Wait for redirect
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);

    const url = page.url();
    results.test2.redirectedToDashboard = url.includes('/dashboard');
    results.test2.finalUrl = url;
    console.log(`  Redirected to dashboard: ${results.test2.redirectedToDashboard} (${url})`);

    await page.screenshot({ path: '/home/z/my-project/e2e-test2c-dashboard.png' });

    if (results.test2.redirectedToDashboard) {
      const dashText = await page.evaluate(() => document.body.innerText);
      results.test2.dashboardTextLen = dashText.length;
      results.test2.hasMetrics = /requests|success rate|latency|uptime|agents/i.test(dashText);
      console.log(`  Dashboard text length: ${dashText.length}`);
      console.log(`  Has metrics/agents: ${results.test2.hasMetrics}`);
    }

    results.test2.consoleErrors = consoleErrors.length;
    console.log(`  Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) console.log(`  Errors: ${consoleErrors.slice(0, 3).join(' | ')}`);

    results.test2.pass = results.test2.emailFilled && results.test2.passwordFilled && results.test2.redirectedToDashboard && results.test2.hasMetrics;
  } catch (e) {
    results.test2.error = e.message;
    results.test2.pass = false;
    console.log(`  ERROR: ${e.message.substring(0, 300)}`);
  }

  // ==================== TEST 3: DASHBOARD INTERACTIVITY ====================
  console.log('\n=== TEST 3: Dashboard Interactivity ===');
  consoleErrors.length = 0;
  try {
    if (!page.url().includes('/dashboard')) {
      await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    }
    await page.waitForTimeout(2000);

    // Metric cards
    const cardCount = await page.evaluate(() => {
      return document.querySelectorAll('[class*="metric"], [class*="stat"], [class*="card"]').length;
    });
    results.test3.metricCards = cardCount;
    console.log(`  Metric/card elements: ${cardCount}`);

    // Find tabs
    const tabNames = ['Agents', 'Traces', 'Issues', 'Alerts', 'API Health'];
    const tabResults = {};
    for (const tabName of tabNames) {
      consoleErrors.length = 0;
      try {
        const clicked = await page.evaluate((name) => {
          const els = [...document.querySelectorAll('button, [role="tab"], a, div')];
          const tab = els.find(el => {
            const t = (el.innerText || '').trim();
            return t === name || t.startsWith(name) && el.offsetParent !== null;
          });
          if (tab) { tab.click(); return true; }
          return false;
        }, tabName);
        await page.waitForTimeout(2000);
        const textLen = await page.evaluate(() => document.body.innerText.length);
        tabResults[tabName] = { clicked, textLen, errors: consoleErrors.length };
        console.log(`  Tab '${tabName}': clicked=${clicked}, textLen=${textLen}, errors=${consoleErrors.length}`);
      } catch (e) {
        tabResults[tabName] = { error: e.message };
        console.log(`  Tab '${tabName}': ERROR - ${e.message.substring(0, 100)}`);
      }
    }
    results.test3.tabResults = tabResults;

    await page.screenshot({ path: '/home/z/my-project/e2e-test3-dashboard.png', fullPage: true });
    console.log('  Screenshot: e2e-test3-dashboard.png');

    const tabsClicked = Object.values(tabResults).filter(t => t.clicked).length;
    const tabsWithData = Object.values(tabResults).filter(t => t.textLen > 100).length;
    results.test3.pass = cardCount > 0 && tabsClicked >= 3 && tabsWithData >= 3;
    console.log(`  Tabs clicked: ${tabsClicked}/${tabNames.length}, with data: ${tabsWithData}/${tabNames.length}`);

  } catch (e) {
    results.test3.error = e.message;
    results.test3.pass = false;
    console.log(`  ERROR: ${e.message.substring(0, 300)}`);
  }

  await browser.close();
  cleanup();

  console.log('\n=== FINAL SUMMARY ===');
  console.log(`Test 1 (Landing): ${results.test1.pass ? 'PASS' : 'FAIL'}`);
  console.log(`Test 2 (Login): ${results.test2.pass ? 'PASS' : 'FAIL'}`);
  console.log(`Test 3 (Dashboard): ${results.test3.pass ? 'PASS' : 'FAIL'}`);
  console.log(`Overall: ${results.test1.pass && results.test2.pass && results.test3.pass ? 'PASS' : 'FAIL'}`);

  const fs = await import('fs');
  fs.writeFileSync('/home/z/my-project/e2e-results.json', JSON.stringify(results, null, 2));
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
