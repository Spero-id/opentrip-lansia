import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
await p.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });
const input = p.locator('input[type="email"]');
const textarea = p.locator('textarea');
console.log('Input radius:', await input.evaluate(e => getComputedStyle(e).borderRadius));
console.log('Textarea radius:', await textarea.evaluate(e => getComputedStyle(e).borderRadius));
await b.close();
