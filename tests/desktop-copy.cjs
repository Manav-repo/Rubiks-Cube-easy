const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch(),results=[];
 fs.mkdirSync('tests/desktop-evidence',{recursive:true});
 for(const colorScheme of ['light','dark']){
  const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.APP_URL||'http://127.0.0.1:4174');await page.locator('#calibration-skip').click();
  for(let stage=0;stage<7;stage++)for(const phase of ['predict','explore','explain','review','badge','free']){
   await page.evaluate(({stage,phase})=>{state.mode='learn';state.stage=stage;state.phase=phase;state.reviewStage=0;state.drill=0;state.seen=[];state.recall=false;render();},{stage,phase});
   const pair=await page.locator('.coach-task').evaluate(e=>({heading:e.querySelector('h3')?.textContent,body:[...e.querySelectorAll('p')].map(p=>p.textContent).filter(Boolean)}));
   assert.ok(pair.heading&&pair.body.length);assert.ok(!pair.body.includes(pair.heading));assert.ok(!/undefined|null|lorem ipsum/i.test(JSON.stringify(pair)));
   results.push({colorScheme,stage,phase,...pair});
  }
  await page.locator('#fix-mode').click();
  assert.equal(await page.locator('#painter-title').textContent(),'Paint your cube’s current colors.');
  assert.equal(await page.locator('#stage-subtitle').textContent(),'Copy all six faces to find your solution.');
  await page.screenshot({path:`tests/desktop-evidence/painter-${colorScheme}.png`});
  await page.evaluate(()=>{state.layout='red-right';state.paint=new Cube().move("R'").asString();state.solution=['R'];state.step=0;state.playback=true;fixCube=Cube.fromString(state.paint);render();});
  assert.equal(await page.locator('#painter-title').textContent(),'Follow the move.');
  assert.equal(await page.locator('#painter-intro').textContent(),'Watch the arrow, then copy the turn on your cube.');
  await page.screenshot({path:`tests/desktop-evidence/playback-${colorScheme}.png`});
  await page.locator('#solution-next').click();await page.locator('#completion-dialog').waitFor({state:'visible',timeout:15000});
  assert.equal(await page.locator('#completion-fund-amount').textContent(),'$448 of $950 raised');
  assert.equal(await page.locator('#completion-support').getAttribute('href'),'https://buymeacoffee.com/manavbuilds');
  await page.locator('#completion-feedback').click();assert.ok(await page.locator('#feedback-message').isVisible());
  assert.deepEqual(errors,[]);await context.close();
 }
 fs.writeFileSync('tests/desktop-evidence/copy-sweep.json',JSON.stringify(results,null,2));
 await browser.close();console.log('PASS: 84 desktop Learn screen/theme states, painter, playback, completion funding link and feedback.');
})().catch(e=>{console.error(e);process.exit(1)});
