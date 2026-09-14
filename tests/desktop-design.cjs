const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch(),report=[];fs.mkdirSync('tests/desktop-design-evidence',{recursive:true});
for(const width of [768,1024,1440,1920])for(const colorScheme of ['light','dark']){
 const context=await browser.newContext({viewport:{width,height:1080},colorScheme});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4174');await page.locator('#calibration-skip').click();
 for(const mode of ['learn','paint','playback']){
  if(mode==='paint')await page.locator('#fix-mode').click();
  if(mode==='playback')await page.evaluate(()=>{state.layout='red-right';state.paint=new Cube().move("R'").asString();state.solution=['R'];state.step=0;state.playback=true;fixCube=Cube.fromString(state.paint);render();});
  const result=await page.evaluate(()=>{
   const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width}};
   return {overflow:document.documentElement.scrollWidth>innerWidth,brand:getComputedStyle(document.querySelector('.desktop-brand')).display,marketing:getComputedStyle(document.querySelector('.intro>div')).display,shortcut:getComputedStyle(document.querySelector('#objective-action')).display,modes:document.querySelectorAll('.mode-switch').length,mode:rect('.mode-switch'),panel:rect(document.body.classList.contains('fix')?'#painter':'#coach'),cube:rect('.workspace'),supportParent:document.querySelector('#support-links').parentElement.className};
  });
  assert.equal(result.overflow,false,JSON.stringify({width,colorScheme,mode,...result}));assert.equal(result.brand,'none');assert.equal(result.marketing,'none');assert.equal(result.shortcut,'none');assert.equal(result.modes,1);assert.ok(result.mode.bottom<=result.panel.y+1,JSON.stringify(result));assert.ok(result.cube.right<=result.panel.x,JSON.stringify(result));assert.equal(result.supportParent,'header-right');
  await page.screenshot({path:`tests/desktop-design-evidence/${width}-${colorScheme}-${mode}.png`,fullPage:true});report.push({width,colorScheme,mode,...result});
 }
 await context.close();
}
fs.writeFileSync('tests/desktop-design-evidence/results.json',JSON.stringify(report,null,2));await browser.close();console.log('PASS: desktop branding, unified controls, non-overlap and no overflow in 24 viewport/theme/mode combinations.');
})().catch(e=>{console.error(e);process.exit(1)});
