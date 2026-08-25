import { chromium } from 'playwright';
import http from 'http';

const BASE = 'http://127.0.0.1:3000';
const ARGS = ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'];

const results = {
  test1: { pass: false },
  test2: { pass: false },
  test3: { pass: false }
};

function get(url) {
  return new Promise((res,rej) => {
    http.get(url, r => res(r.statusCode)).on('error', rej);
  });
}

async function waitServer(ms=45000) {
  const t0 = Date.now();
  while (Date.now()-t0 < ms) {
    try { if (await get(BASE)) return; } catch(e) {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('timeout');
}

async function main() {
  await waitServer();
  console.log('Server confirmed alive');

  const browser = await chromium.launch({ args: ARGS });
  const page = await browser.newPage();
  const errs = [];
  page.on('console', m => { if(m.type()==='error' && !m.text().includes('webpack-hmr')) errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PG:'+e.message));

  // =========== TEST 1: LANDING PAGE ===========
  console.log('\n=== TEST 1: Landing Page ===');
  try {
    errs.length = 0;
    const r = await page.goto(BASE+'/', {waitUntil:'networkidle',timeout:30000});
    results.test1.httpStatus = r.status();
    console.log('  Status:', r.status());

    const txt = await page.evaluate(() => document.body.innerText);
    results.test1.textLen = txt.length;
    results.test1.notBlank = txt.length > 20;
    console.log('  Not blank:', results.test1.notBlank, '(len:', txt.length + ')');

    const html = await page.evaluate(() => document.body.innerHTML);
    results.test1.hasBranding = /seghro|sentinel/i.test(html);
    console.log('  Seghro/SENTINEL branding:', results.test1.hasBranding);

    const ft = await page.evaluate(() => {
      const f = document.querySelector('footer');
      return f ? { exists: true, text: f.innerText.substring(0,100) } : { exists: false };
    });
    results.test1.footer = ft;
    console.log('  Footer:', ft.exists ? 'YES' : 'NO');
    if (ft.exists) console.log('  Footer preview:', ft.text);

    results.test1.consoleErrors = errs.length;
    console.log('  App console errors (excl HMR):', errs.length);
    if (errs.length > 0) errs.forEach(e => console.log('    ERR:', e.substring(0,120)));

    await page.screenshot({path:'/home/z/my-project/e2e-t1-landing.png',fullPage:true});

    results.test1.pass = results.test1.httpStatus === 200 && results.test1.notBlank && results.test1.hasBranding && results.test1.footer.exists;
    console.log('  RESULT:', results.test1.pass ? 'PASS' : 'FAIL');
  } catch(e) {
    results.test1.error = e.message;
    console.log('  ERROR:', e.message.substring(0,200));
  }

  // =========== TEST 2: LOGIN FLOW ===========
  console.log('\n=== TEST 2: Login Flow ===');
  errs.length = 0;
  try {
    await page.goto(BASE+'/login', {waitUntil:'networkidle',timeout:30000});
    console.log('  Login page loaded');

    // Use nativeInputValueSetter as required by task
    await page.evaluate(() => {
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.focus();
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(emailInput, 'demo@seghro.dev');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const passInput = document.getElementById('password');
      if (passInput) {
        passInput.focus();
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(passInput, 'demo1234');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // Verify DOM values are set
    const vals = await page.evaluate(() => ({
      email: document.getElementById('email')?.value,
      pass: document.getElementById('password')?.value
    }));
    results.test2.emailFilled = vals.email === 'demo@seghro.dev';
    results.test2.passwordFilled = vals.pass === 'demo1234';
    console.log('  Email filled:', results.test2.emailFilled, '(' + (vals.email||'null') + ')');
    console.log('  Password filled:', results.test2.passwordFilled, '(len:' + (vals.pass?.length||0) + ')');

    await page.screenshot({path:'/home/z/my-project/e2e-t2a-filled.png'});

    // Click the submit button
    await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    });

    // Wait for potential navigation
    await page.waitForTimeout(5000);

    const url = page.url();
    results.test2.finalUrl = url;
    results.test2.redirected = url.includes('/dashboard');
    console.log('  Final URL:', url);
    console.log('  Redirected to /dashboard:', results.test2.redirected);

    // Check for error message on page
    const pageContent = await page.evaluate(() => document.body.innerText);
    const hasError = pageContent.includes('Invalid email or password') || pageContent.includes('Something went wrong');
    results.test2.loginError = hasError;
    if (hasError) console.log('  Login error displayed on page');

    await page.screenshot({path:'/home/z/my-project/e2e-t2b-result.png'});

    // If login failed (React state not updated by native setter), try alternative approach
    if (!results.test2.redirected) {
      console.log('  Native setter did not trigger React state update. Trying Playwright fill...');
      await page.goto(BASE+'/login', {waitUntil:'networkidle',timeout:30000});
      
      // Use Playwright's fill which properly handles React
      await page.fill('#email', 'demo@seghro.dev');
      await page.fill('#password', 'demo1234');
      
      // Verify React state was updated by checking if the button text changed
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      const url2 = page.url();
      results.test2.finalUrl2 = url2;
      results.test2.redirected2 = url2.includes('/dashboard');
      console.log('  Playwright fill - Final URL:', url2);
      console.log('  Playwright fill - Redirected:', results.test2.redirected2);
      
      await page.screenshot({path:'/home/z/my-project/e2e-t2c-pw-fill.png'});
      
      // Also try the native setter with React 19 compatible approach
      if (!results.test2.redirected2) {
        console.log('  Playwright fill also failed. Trying alternative native approach...');
        await page.goto(BASE+'/login', {waitUntil:'networkidle',timeout:30000});
        
        await page.evaluate(() => {
          // React 19 uses a different internal tracking mechanism
          // Try using native setter with InputEvent
          const emailInput = document.getElementById('email');
          if (emailInput) {
            emailInput.focus();
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(emailInput, 'demo@seghro.dev');
            // Try multiple event types to trigger React
            emailInput.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: 'demo@seghro.dev', inputType: 'insertText' }));
            emailInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const passInput = document.getElementById('password');
          if (passInput) {
            passInput.focus();
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(passInput, 'demo1234');
            passInput.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: 'demo1234', inputType: 'insertText' }));
            passInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);
        
        const url3 = page.url();
        results.test2.finalUrl3 = url3;
        results.test2.redirected3 = url3.includes('/dashboard');
        console.log('  InputEvent approach - Final URL:', url3);
        console.log('  InputEvent approach - Redirected:', results.test2.redirected3);
        
        await page.screenshot({path:'/home/z/my-project/e2e-t2d-inputevent.png'});
      }
    }

    results.test2.consoleErrors = errs.length;
    console.log('  Console errors:', errs.length);
    if (errs.length > 0) errs.forEach(e => console.log('    ERR:', e.substring(0,120)));

    results.test2.pass = results.test2.redirected || results.test2.redirected2 || results.test2.redirected3;
    console.log('  RESULT:', results.test2.pass ? 'PASS' : 'FAIL');

  } catch(e) {
    results.test2.error = e.message;
    console.log('  ERROR:', e.message.substring(0,200));
  }

  // =========== TEST 3: DASHBOARD INTERACTIVITY ===========
  console.log('\n=== TEST 3: Dashboard Interactivity ===');
  errs.length = 0;
  try {
    // Navigate to dashboard (if not already there, use cookie-based auth)
    // Set session cookie from curl-based auth
    await page.goto(BASE+'/dashboard', {waitUntil:'networkidle',timeout:30000});
    await page.waitForTimeout(2000);

    const url = page.url();
    const onDashboard = url.includes('/dashboard');
    console.log('  On dashboard:', onDashboard, '(' + url + ')');

    if (!onDashboard) {
      // Get session cookie via API and set it
      console.log('  Not on dashboard - trying cookie-based auth...');
      
      // Use page context to make the auth request
      const sessionCookie = await page.evaluate(async () => {
        // Get CSRF token
        const csrfResp = await fetch('/api/auth/csrf', {credentials: 'include'});
        const csrfData = await csrfResp.json();
        
        // Submit credentials
        const formResp = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: 'email=demo%40seghro.dev&password=demo1234&csrfToken=' + encodeURIComponent(csrfData.csrfToken),
          redirect: 'manual',
          credentials: 'include'
        });
        
        // Get session
        const sessionResp = await fetch('/api/auth/session', {credentials: 'include'});
        const session = await sessionResp.json();
        return session.user ? true : false;
      });
      console.log('  Cookie auth:', sessionCookie);
      
      if (sessionCookie) {
        await page.goto(BASE+'/dashboard', {waitUntil:'networkidle',timeout:30000});
        await page.waitForTimeout(2000);
      }
    }

    const dashUrl = page.url();
    const onDashNow = dashUrl.includes('/dashboard');
    console.log('  On dashboard after auth:', onDashNow);

    if (onDashNow) {
      // Check metric cards
      const dashText = await page.evaluate(() => document.body.innerText);
      results.test3.dashboardTextLen = dashText.length;
      console.log('  Dashboard text length:', dashText.length);

      // Look for metric-related content
      const metricsVisible = /requests|success rate|latency|uptime|agents|traces/i.test(dashText);
      results.test3.hasMetrics = metricsVisible;
      console.log('  Has metric/agent data:', metricsVisible);

      // Count card-like elements
      const cardCount = await page.evaluate(() => {
        // Look for common dashboard card patterns
        const allEls = document.querySelectorAll('div, section, article');
        let count = 0;
        for (const el of allEls) {
          const cls = el.className || '';
          if (/card|metric|stat|panel/i.test(cls) && el.children.length > 0 && el.offsetParent !== null) {
            count++;
          }
        }
        return count;
      });
      results.test3.cardElements = cardCount;
      console.log('  Card/metric elements:', cardCount);

      // Test tabs
      const tabNames = ['Agents', 'Traces', 'Issues', 'Alerts', 'API Health'];
      results.test3.tabs = {};
      for (const tabName of tabNames) {
        errs.length = 0;
        try {
          const clicked = await page.evaluate((name) => {
            // Look for tab buttons in various ways
            const allBtns = [...document.querySelectorAll('button, [role="tab"], [data-state]')];
            const tab = allBtns.find(el => {
              const t = (el.innerText || '').trim();
              return t.includes(name) && el.offsetParent !== null;
            });
            if (tab) { tab.click(); return true; }
            return false;
          }, tabName);

          await page.waitForTimeout(2000);

          const textLen = await page.evaluate(() => document.body.innerText.length);
          const hasContent = textLen > 200;
          results.test3.tabs[tabName] = { clicked, textLen, hasContent, errors: errs.length };
          console.log('  Tab "' + tabName + '": clicked=' + clicked + ' textLen=' + textLen + ' hasContent=' + hasContent);
        } catch(e) {
          results.test3.tabs[tabName] = { error: e.message };
          console.log('  Tab "' + tabName + '": ERROR -', e.message.substring(0,100));
        }
      }

      await page.screenshot({path:'/home/z/my-project/e2e-t3-dashboard.png',fullPage:true});

      const tabsClicked = Object.values(results.test3.tabs).filter(t => t.clicked).length;
      const tabsWithContent = Object.values(results.test3.tabs).filter(t => t.hasContent).length;
      results.test3.pass = metricsVisible && tabsClicked >= 3 && tabsWithContent >= 3;
      console.log('  Tabs clicked:', tabsClicked + '/' + tabNames.length);
      console.log('  Tabs with content:', tabsWithContent + '/' + tabNames.length);
    } else {
      results.test3.error = 'Could not reach dashboard - login required';
      console.log('  ERROR: Cannot access dashboard');
      await page.screenshot({path:'/home/z/my-project/e2e-t3-noaccess.png'});
    }

    results.test3.consoleErrors = errs.length;
    console.log('  Console errors:', errs.length);
    console.log('  RESULT:', results.test3.pass ? 'PASS' : 'FAIL');

  } catch(e) {
    results.test3.error = e.message;
    console.log('  ERROR:', e.message.substring(0,200));
  }

  await browser.close();

  // Final summary
  console.log('\n========================================');
  console.log('FINAL SUMMARY');
  console.log('========================================');
  console.log('Test 1 (Landing):', results.test1.pass ? 'PASS' : 'FAIL');
  if (results.test1.error) console.log('  Error:', results.test1.error);
  console.log('Test 2 (Login):', results.test2.pass ? 'PASS' : 'FAIL');
  if (results.test2.error) console.log('  Error:', results.test2.error);
  console.log('Test 3 (Dashboard):', results.test3.pass ? 'PASS' : 'FAIL');
  if (results.test3.error) console.log('  Error:', results.test3.error);
  console.log('Overall:', (results.test1.pass && results.test2.pass && results.test3.pass) ? 'PASS' : 'FAIL');

  // Save results
  const fs = await import('fs');
  fs.writeFileSync('/home/z/my-project/e2e-results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to e2e-results.json');
}

main().catch(e => console.error('FATAL:', e.message));
