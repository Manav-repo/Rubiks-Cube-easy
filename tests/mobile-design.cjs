// Presentation and device-theme checks against the local app, with isolated storage.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/private/tmp/cube-brainiac-qa/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process');
const out='tests/design-evidence';fs.mkdirSync(out,{recursive:true});
for(const file of ['dist/js/cube-view.js','dist/js/layout.js','dist/js/lessons.js','dist/js/stage-planner.js','dist/js/solver-worker.js','dist/js/planner-worker.js','dist/js/support.js','dist/vendor/cube.js'])assert.equal(fs.readFileSync(file,'utf8'),cp.execFileSync('git',['show',`d14e01d:${file}`],{encoding:'utf8'}),`Protected source ${file}`);
(async()=>{
 const browser=await chromium.launch();const results=[];
 for(const [width,height] of [[393,852],[375,667],[390,844],[360,800]])for(const colorScheme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true,colorScheme});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('cube-brainiac-theme','dark'));
  await page.goto('http://127.0.0.1:4174');await page.locator('#calibration-skip').tap();
  assert.equal(await page.locator('html').getAttribute('data-theme'),colorScheme,'System wins over stale manual theme');
  assert.equal(await page.locator('#theme-toggle').isVisible(),false);
  await page.evaluate(()=>{
   const moves="R L D2 L U B' U2 D2 L D2 L U B' U2 D2 L D2 L U B' U2".split(' ');
   state.layout='red-right';state.mode='fix';state.paint=new Cube().move(inverse(moves.join(' '))).asString();
   state.solution=moves;state.playback=true;state.step=0;fixCube=Cube.fromString(state.paint);render();
  });
  await page.waitForFunction(()=>document.querySelector('.workspace>.objective'));
  await page.locator('.mobile-wordmark:visible').evaluate(img=>img.decode());
  const measure=await page.evaluate(()=>{
   const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();
   const target=s=>[...document.querySelectorAll(s)].map(e=>({id:e.id,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}));
   return {width:innerWidth,height:innerHeight,touch:navigator.maxTouchPoints,pageWidth:document.documentElement.scrollWidth,pageHeight:document.documentElement.scrollHeight,header:rect('header'),modes:rect('.intro'),card:rect('.workspace'),footer:rect('.view-tools'),controls:rect('.playback-actions'),details:rect('.playback-details'),tokens:target('.solution-token'),headerTargets:target('header a,header #settings-toggle'),gap:getComputedStyle(document.querySelector('#solution-progress')).gap,ids:[...document.querySelectorAll('[id]')].map(e=>e.id)};
  });
  assert.equal(measure.width,width);assert.equal(measure.height,height);assert.ok(measure.touch>0);assert.equal(measure.pageWidth,width);assert.equal(measure.pageHeight,height);
  assert.equal(measure.header.height,81);assert.equal(measure.modes.height,80);assert.equal(measure.card.height,height<=700?320:360);assert.equal(measure.footer.height,44);assert.equal(measure.controls.height,75);
  assert.equal(measure.modes.top,measure.header.bottom);assert.equal(measure.card.top,measure.modes.bottom);assert.equal(measure.controls.top,measure.card.bottom);assert.equal(measure.details.top-measure.controls.bottom,16);
  assert.equal(measure.footer.bottom,measure.card.bottom);assert.equal(measure.gap,'12px');assert.equal(new Set(measure.ids).size,measure.ids.length);
  assert.ok([...measure.tokens,...measure.headerTargets].every(t=>t.w>=44&&t.h>=44),'44px hit areas');
  const cubeColors=await page.locator('.sticker').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundColor));
  await page.screenshot({path:`${out}/${width}-${colorScheme}.png`});
  for(const fraction of [0,.5,1]){
   await page.locator('.playback-details').evaluate((e,f)=>e.scrollTop=(e.scrollHeight-e.clientHeight)*f,fraction);
   assert.ok(await page.evaluate(()=>['.workspace>.objective','.cube-space','#solution-back','#solution-replay','#solution-next'].every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})));
  }
  await page.locator('#settings-toggle').tap();await page.locator('#calibrate-settings').tap();await page.locator('#calibration-skip').tap();
  await page.emulateMedia({colorScheme:colorScheme==='light'?'dark':'light'});
  await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,colorScheme==='light'?'dark':'light');
  assert.equal(await page.locator('html').getAttribute('data-theme'),colorScheme==='light'?'dark':'light');
  assert.deepEqual(await page.locator('.sticker').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundColor)),cubeColors,'Theme does not recolor stickers');
  await page.locator('#learn-mode').tap();await page.waitForFunction(()=>document.querySelector('main>.objective'));
  await page.setViewportSize({width:1363,height:936});await page.waitForFunction(()=>document.querySelector('footer>#support-links'));
  assert.ok(await page.locator('.coach').evaluate(e=>e.getBoundingClientRect().left>document.querySelector('.workspace').getBoundingClientRect().right));
  assert.deepEqual(errors,[]);results.push({width,height,colorScheme,measure,passed:true});await context.close();
 }
 await browser.close();fs.writeFileSync(`${out}/measurements.json`,JSON.stringify(results,null,2));console.log('PASS: reference + 3 mobile viewports, both system themes, layout measurements, scroll shell, settings, stable colors, unique IDs and desktop restoration.');
})().catch(e=>{console.error(e);process.exit(1)});
