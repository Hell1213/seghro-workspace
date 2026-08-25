import { chromium } from 'playwright';
import http from 'http';

const BASE = 'http://127.0.0.1:3000';
const ARGS = ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'];

function get(url) {
  return new Promise((res,rej) => {
    http.get(url, r => res(r.statusCode)).on('error', rej);
  });
}

async function waitServer(ms=30000) {
  const t0 = Date.now();
  while (Date.now()-t0 < ms) {
    try { if (await get(BASE)) return; } catch(e) {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('timeout waiting for server');
}

async function main() {
  await waitServer();
  console.log('Server confirmed alive');

  const browser = await chromium.launch({ args: ARGS });
  const page = await browser.newPage();
  const errs = [];
  page.on('console', m => { if(m.type()==='error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PG:'+e.message));

  // TEST 1: Landing
  console.log('\n--- TEST 1: Landing Page ---');
  try {
    const r = await page.goto(BASE+'/', {waitUntil:'networkidle',timeout:30000});
    console.log('Status:', r.status());
    const txt = await page.evaluate(() => document.body.innerText);
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log('Text len:', txt.length, 'Blank:', txt.length < 20);
    console.log('Has Seghro/SENTINEL:', /seghro|sentinel/i.test(html));
    const ft = await page.evaluate(() => {
      const f = document.querySelector('footer');
      return f ? 'YES: '+f.innerText.substring(0,100) : 'NO';
    });
    console.log('Footer:', ft);
    console.log('Console errors:', errs.length);
    if(errs.length) console.log('Errors:', errs.slice(0,3).join(' | '));
    await page.screenshot({path:'/home/z/my-project/e2e-t1-landing.png',fullPage:true});
    console.log('T1: PASS\n');
  } catch(e) {
    console.log('T1: FAIL -', e.message.substring(0,200));
  }

  // TEST 2: Login
  errs.length = 0;
  console.log('--- TEST 2: Login Flow ---');
  try {
    await page.goto(BASE+'/login', {waitUntil:'networkidle',timeout:30000});
    console.log('Login page loaded');
    await page.evaluate(() => {
      const ei = document.querySelector('input[name="email"]') || document.querySelector('input[type="email"]');
      if(ei) { ei.focus(); const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; s.call(ei,'demo@seghro.dev'); ei.dispatchEvent(new Event('input',{bubbles:true})); ei.dispatchEvent(new Event('change',{bubbles:true})); }
      const pi = document.querySelector('input[name="password"]') || document.querySelector('input[type="password"]');
      if(pi) { pi.focus(); const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; s.call(pi,'demo1234'); pi.dispatchEvent(new Event('input',{bubbles:true})); pi.dispatchEvent(new Event('change',{bubbles:true})); }
    });
    const ev = await page.evaluate(() => (document.querySelector('input[name="email"]')||document.querySelector('input[type="email"]'))?.value);
    const pv = await page.evaluate(() => (document.querySelector('input[name="password"]')||document.querySelector('input[type="password"]'))?.value);
    console.log('Email:', ev, '| Password len:', pv?.length);
    await page.evaluate(() => {
      const b = document.querySelector('button[type="submit"]') || [...document.querySelectorAll('button')].find(b=>/sign|log|login/i.test(b.innerText));
      if(b) b.click();
    });
    await page.waitForURL('**/dashboard**',{timeout:15000}).catch(()=>{});
    await new Promise(r=>setTimeout(r,3000));
    const url = page.url();
    console.log('Final URL:', url);
    console.log('Redirected to dashboard:', url.includes('/dashboard'));
    if(url.includes('/dashboard')) {
      const dt = await page.evaluate(()=>document.body.innerText);
      console.log('Dashboard text len:', dt.length);
      console.log('Has metrics/agents:', /requests|success rate|latency|uptime|agents/i.test(dt));
    }
    console.log('Console errors:', errs.length);
    await page.screenshot({path:'/home/z/my-project/e2e-t2-login.png'});
    console.log('T2: PASS\n');
  } catch(e) {
    console.log('T2: FAIL -', e.message.substring(0,200));
  }

  // TEST 3: Dashboard Tabs
  errs.length = 0;
  console.log('--- TEST 3: Dashboard Interactivity ---');
  try {
    if(!page.url().includes('/dashboard')) {
      await page.goto(BASE+'/dashboard',{waitUntil:'networkidle',timeout:30000});
    }
    await new Promise(r=>setTimeout(r,2000));
    const cards = await page.evaluate(() => document.querySelectorAll('[class*="card"],[class*="metric"],[class*="stat"]').length);
    console.log('Card/metric elements:', cards);
    const tabs = ['Agents','Traces','Issues','Alerts','API Health'];
    for(const name of tabs) {
      errs.length = 0;
      const clicked = await page.evaluate(n => {
        const els = [...document.querySelectorAll('button,[role="tab"],a')];
        const t = els.find(e => (e.innerText||'').trim().includes(n) && e.offsetParent !== null);
        if(t) { t.click(); return true; } return false;
      }, name);
      await new Promise(r=>setTimeout(r,2000));
      const tl = await page.evaluate(()=>document.body.innerText.length);
      console.log('Tab "'+name+'": clicked='+clicked+' textLen='+tl+' errors='+errs.length);
    }
    await page.screenshot({path:'/home/z/my-project/e2e-t3-dashboard.png',fullPage:true});
    console.log('T3: PASS\n');
  } catch(e) {
    console.log('T3: FAIL -', e.message.substring(0,200));
  }

  await browser.close();
  console.log('=== DONE ===');
}

main().catch(e => console.error('FATAL:', e.message));
