import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||"chrome"});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
page.setDefaultTimeout(15000);
const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
const checks:string[]=[];
const log=checks.push.bind(checks);checks.push=(...items:string[])=>{console.log(items.join('\n'));return log(...items)};
try{
 await page.goto(process.env.DEMO_URL||'http://127.0.0.1:5173');await page.getByRole('heading',{name:'Voice operations. All in view.'}).waitFor();
 await page.getByRole('button',{name:'Select HV-2049',exact:true}).click();await page.getByRole('textbox',{name:'Find a shipment'}).fill('Meridian');assert.equal(await page.locator('tbody tr').count(),1);await page.getByRole('textbox',{name:'Find a shipment'}).fill('');checks.push('Terminal map selection and shipment search');
 mkdirSync('docs/screenshots',{recursive:true});await page.screenshot({path:'docs/screenshots/overview.png',fullPage:true});
 await page.getByRole('button',{name:'Voice agents',exact:true}).click();await page.getByRole('textbox',{name:'Message Nora'}).fill('Where is HV-2048?');await page.getByRole('button',{name:'Send message',exact:true}).click();await page.getByText('HV-2048 is customs hold at').waitFor();checks.push('Grounded shipment conversation');
 await page.getByRole('combobox',{name:'Conversation language'}).selectOption('nl');await page.getByRole('textbox',{name:'Message Nora'}).fill('Waar is HV-2049?');await page.getByRole('button',{name:'Send message',exact:true}).click();await page.getByText('De geregistreerde verwachte aankomst',{exact:false}).waitFor();checks.push('Dutch conversation');
 await page.getByRole('textbox',{name:'Message Nora'}).fill('Escalate HV-2048 to an operator');await page.getByRole('button',{name:'Send message',exact:true}).click();await page.getByText('Ik heb een escalatie',{exact:false}).waitFor();
 await page.getByRole('button',{name:/^Workflows/}).click();await page.getByRole('button',{name:'Approve escalation'}).click();await page.getByText('Escalation approved. Shipment status is unchanged.').waitFor();checks.push('Escalation proposal, operator review and unchanged shipment');
 await page.getByRole('button',{name:'Evaluations',exact:true}).click();await page.getByRole('button',{name:'Run demo checks'}).click();await page.getByRole('heading',{name:'6 / 6 checks passed'}).waitFor();const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export evidence'}).click();const download=await downloadPromise;assert.match(download.suggestedFilename(),/evaluation.json/);checks.push('Evaluation suite and JSON evidence export');
 await page.getByRole('button',{name:'Conversations',exact:true}).click();await page.getByRole('heading',{name:'Transcript',exact:true}).waitFor();assert.ok(await page.getByText('Where is HV-2048?',{exact:true}).count());checks.push('Persisted session transcript');
 for(const tab of ['Audio studio','Knowledge base','Settings']){await page.getByRole('button',{name:tab,exact:true}).click();await page.getByRole('heading',{name:tab,exact:true}).waitFor();}checks.push('All workspace pages render');
 await page.getByRole('button',{name:'Overview',exact:true}).click();await page.setViewportSize({width:390,height:844});await page.getByRole('status').waitFor({state:'hidden'});await page.screenshot({path:'docs/screenshots/mobile.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks.push('Mobile layout has no page-level horizontal overflow');
 assert.deepEqual(errors,[]);checks.push('No browser runtime errors');writeFileSync('docs/browser-verification.json',JSON.stringify({at:new Date().toISOString(),url:process.env.DEMO_URL||'http://127.0.0.1:5173',checks,errors,liveElevenLabsTested:false},null,2));console.log(JSON.stringify({checks,errors},null,2));
}catch(e){console.log(await page.locator('body').innerText());await page.screenshot({path:'var/browser-failure.png',fullPage:true});throw e;}finally{await browser.close();}
