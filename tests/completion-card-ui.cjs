const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto');
const out='tests/completion-evidence';fs.mkdirSync(out,{recursive:true});
const files=['dist/index.html','dist/desktop-design.css','dist/js/mobile-presentation.js','dist/feedback.css','dist/mobile-design.css','dist/js/feedback.js','dist/js/support.js'];
const fingerprint=()=>crypto.createHash('sha256').update(files.map(f=>fs.readFileSync(f)).join('')).digest('hex');
const sourceHash=fingerprint();
// The desktop copy release changes only these four presentation assignments.
const withoutCopy=s=>s.split('\n').filter(l=>!['painter-title','painter-intro','stage-label','stage-subtitle'].some(id=>l.includes("$('"+id+"').textContent="))).join('\n');
assert.equal(withoutCopy(fs.readFileSync('dist/js/app.js','utf8')),withoutCopy(cp.execFileSync('git',['show','a076727:dist/js/app.js'],{encoding:'utf8'})),'non-copy application code unchanged');
for(const f of ['dist/js/cube-view.js','dist/js/layout.js','dist/js/lessons.js','dist/js/stage-planner.js','dist/js/solver-worker.js','dist/vendor/cube.js','dist/js/theme.js'])assert.equal(fs.readFileSync(f,'utf8'),cp.execFileSync('git',['show',`a076727:${f}`],{encoding:'utf8'}),f+' unchanged');
assert.deepEqual(fs.readFileSync('dist/assets/cube-easy/coffee.svg'),fs.readFileSync('Assests/Buy me coffee.svg'));
assert.deepEqual(fs.readFileSync('dist/assets/cube-easy/close.svg'),fs.readFileSync('Assests/x close.svg'));
assert.deepEqual(fs.readFileSync('dist/assets/cube-easy/mail.svg'),fs.readFileSync('Assests/Mail.svg'));
assert.deepEqual(fs.readFileSync('dist/assets/cube-easy/pocket-4p-dji.png'),fs.readFileSync('Assests/Pocket 4p DJI.png'));
(async()=>{
 const browser=await chromium.launch();const result=[];
 for(const [width,height] of [[375,667],[390,844],[360,800],[1280,900]])for(const colorScheme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<681,hasTouch:width<681,colorScheme});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4174');await page.locator('#calibration-skip').click();
  await page.evaluate(()=>{state.mode='fix';state.layout='red-right';state.paint=new Cube().move("R'").asString();state.solution=['R'];state.playback=true;state.step=0;fixCube=Cube.fromString(state.paint);render();});
  await page.locator('#solution-next').click();await page.locator('#completion-dialog').waitFor({state:'visible',timeout:15000});
  await page.locator('#completion-support img').evaluate(e=>e.decode());
  await page.locator('.completion-camera').evaluate(e=>e.decode());
  const m=await page.evaluate(()=>{
   const card=document.querySelector('#completion-dialog'),btn=document.querySelector('#completion-support'),img=btn.querySelector('img'),feedback=document.querySelector('#completion-feedback');
   const r=e=>{const v=e.getBoundingClientRect();return {x:v.x,y:v.y,width:v.width,height:v.height,right:v.right,bottom:v.bottom}};
   return {card:r(card),support:r(btn),feedback:r(feedback),img:r(img),lineHeight:parseFloat(getComputedStyle(btn).lineHeight),gap:getComputedStyle(btn).gap,modal:card.matches(':modal'),overflow:card.scrollHeight>card.clientHeight,amount:document.querySelector('#completion-fund-amount').textContent,body:getComputedStyle(document.body).backgroundColor,background:getComputedStyle(card).backgroundColor,ink:getComputedStyle(card).color,button:getComputedStyle(btn).backgroundColor,secondary:getComputedStyle(feedback).backgroundColor,border:getComputedStyle(feedback).borderTopColor,copy:card.textContent,blackSurfaces:[card,...card.querySelectorAll('*')].filter(e=>getComputedStyle(e).backgroundColor==='rgb(0, 0, 0)').map(e=>e.id||e.tagName)};
  });
  assert.equal(m.modal,width<681);assert.equal(m.overflow,false);assert.ok(m.card.x>=0&&m.card.y>=0&&m.card.right<=width&&m.card.bottom<=height);assert.ok(m.support.height>=44&&m.feedback.height>=44);assert.equal(m.img.height,m.lineHeight);assert.equal(m.gap,'4px');assert.ok(m.copy.includes('DJI pocket 4P'));assert.ok(m.copy.includes('What goes around comes around!'));assert.ok(!m.copy.includes('Sony'));assert.equal(m.amount,'$448 of $950 raised');
  const mail=await page.locator('.mail-icon').evaluate(e=>({height:e.getBoundingClientRect().height,line:parseFloat(getComputedStyle(e.parentElement).lineHeight),mask:getComputedStyle(e).maskImage,gap:getComputedStyle(e.parentElement).gap}));
  assert.equal(mail.height,mail.line);assert.equal(mail.gap,'4px');assert.ok(mail.mask.includes('mail.svg'));
  if(width<681){assert.ok(Math.abs(m.card.x+m.card.width/2-width/2)<1);assert.ok(Math.abs(m.card.y+m.card.height/2-height/2)<1);}else assert.ok(m.card.x>width/2);
  if(colorScheme==='dark')assert.equal(m.body,width<681?'rgb(18, 18, 18)':'rgb(26, 26, 26)');
  assert.equal(m.background,'rgb(255, 255, 255)');assert.equal(m.ink,'rgb(0, 0, 0)');assert.equal(m.button,'rgb(36, 36, 36)');assert.equal(m.secondary,'rgb(255, 255, 255)');assert.equal(m.border,'rgb(204, 204, 204)');
  await page.screenshot({path:`${out}/${width}-${colorScheme}.png`});
  // A feedback form is optional, opened only by the explicit action.
  assert.equal(await page.locator('#feedback-dialog').isVisible(),false);
  await page.locator('#completion-feedback').click();assert.equal(await page.locator('#feedback-dialog').isVisible(),true);
  await page.locator('#feedback-close').click();assert.equal(await page.locator('#completion-dialog').isVisible(),true);
  await page.locator('#completion-close').click();assert.equal(await page.locator('#feedback-dialog').isVisible(),false);
  await page.evaluate(()=>render());assert.equal(await page.locator('#completion-dialog').isVisible(),false);
  assert.deepEqual(errors,[]);result.push({width,height,colorScheme,sourceHash,measurements:m,passed:true});await context.close();
 }
 await browser.close();assert.equal(fingerprint(),sourceHash);fs.writeFileSync(`${out}/results.json`,JSON.stringify(result,null,2));console.log('PASS: real completion, one shared card, optional feedback, mobile modality, desktop side panel, asset identity/decoding, icon line height, 4px gap, dark palette and no overflow at 8 viewport/theme combinations.');
})().catch(e=>{console.error(e);process.exit(1)});
