const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
const browser=await chromium.launch(),results=[];fs.mkdirSync('tests/panel-evidence',{recursive:true});
for(const width of [375,390,360,1280])for(const colorScheme of ['light','dark']){
 const context=await browser.newContext({viewport:{width,height:width===375?667:900},colorScheme});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4174');
 const only=async id=>assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('dialog[open],#settings:not([hidden])')].map(e=>e.id)),id?[id]:[]);
 await only('calibration');await page.locator('#calibration-skip').click();await only(null);
 await page.locator('#settings-toggle').click();await only('settings');
 await page.locator('#feedback-open').click();await only('feedback-dialog');
 if(width>680){await page.locator('#settings-toggle').click();await only('settings');await page.locator('#feedback-open').click();await only('feedback-dialog');}
 await page.locator('#feedback-close').click();await only(null);
 await page.locator('#settings-toggle').click();await page.locator('#calibrate-settings').click();await only('calibration');
 await page.locator('[data-layout="red-right"]').click();await only(null);
 await page.evaluate(()=>{state.mode='fix';state.layout='red-right';state.paint=new Cube().move("R'").asString();state.solution=['R'];state.playback=true;state.step=0;fixCube=Cube.fromString(state.paint);render();});
 await page.locator('#solution-next').click();await page.locator('#completion-dialog').waitFor({state:'visible',timeout:15000});await only('completion-dialog');
 await page.locator('#completion-feedback').click();await only('completion-dialog');assert.ok(await page.locator('#completion-dialog #feedback-form').isVisible());
 if(width>680){await page.locator('#settings-toggle').click();await only('settings');await page.locator('#feedback-open').click();await only('feedback-dialog');assert.ok(await page.locator('#feedback-dialog #feedback-form').isVisible());await page.locator('#feedback-close').click();}
 else await page.locator('#completion-close').click();
 await only(null);
 // Exercise every ordered controller pair, including combinations with no UI link.
 const ids=['settings','feedback-dialog','completion-dialog','calibration'];
 for(const from of ids)for(const to of ids){
  await page.evaluate(([from,to])=>{CubePanels.open(document.getElementById(from),from==='calibration');CubePanels.open(document.getElementById(to),to==='calibration');},[from,to]);await only(to);
 }
 await page.evaluate(()=>CubePanels.close());await only(null);
 await page.locator('#settings-toggle').click();await page.locator('#feedback-open').click();
 await page.screenshot({path:`tests/panel-evidence/${width}-${colorScheme}.png`});
 assert.deepEqual(errors,[]);results.push({width,colorScheme,clickedFlows:true,controllerPairs:16,passed:true});await context.close();
}
await browser.close();fs.writeFileSync('tests/panel-evidence/results.json',JSON.stringify(results,null,2));console.log('PASS: click flows and all 16 panel pairs across eight viewport/theme cases.');
})().catch(e=>{console.error(e);process.exit(1)});
