/* Geometry and timing contract: compare rendered sticker destinations with
   cubejs, and hold fake time at each phase to check the input lock. */
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
class Element{
 constructor(){this.children=[];this.parentElement=null;this.style={setProperty(){}};this.dataset={};this.classes=new Set();this.classList={add:c=>this.classes.add(c),remove:c=>this.classes.delete(c),toggle(){}};}
 append(n){n.remove();this.children.push(n);n.parentElement=this;}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);this.parentElement=null;}
 setAttribute(){} addEventListener(){} querySelector(){return {textContent:''};}getBoundingClientRect(){return {};}
}
let timers=[],animations=[],reduced=false;
Element.prototype.animate=function(frames,options){let finish;const a={frames,options,finished:new Promise(r=>finish=r),finish:()=>finish(),cancel(){}};animations.push(a);return a;};
const ctx=vm.createContext({console,document:{createElement:()=>new Element()},window:{addEventListener(){}},matchMedia:()=>({matches:reduced}),setTimeout:(f,ms)=>timers.push({f,ms})});
ctx.window=ctx;ctx.addEventListener=()=>{};
for(const f of ['vendor/cube.js','js/layout.js','js/cube-view.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);ctx.host=new Element();ctx.host.parentElement=new Element();run('var view=new CubeView(host,()=>{});var cube=new Cube().move("R U F2 L D B");');
const flush=async()=>{await Promise.resolve();await Promise.resolve();};
async function tick(ms){const t=timers.shift();assert.equal(t.ms,ms);t.f();await flush();}
const normals={U:[0,-1,0],R:[1,0,0],F:[0,0,1],D:[0,1,0],L:[-1,0,0],B:[0,0,-1]};
function rotate(v,axis,angle){const c=Math.round(Math.cos(angle)),s=Math.round(Math.sin(angle));const [x,y,z]=v;return axis==='X'?[x,y*c-z*s,y*s+z*c]:axis==='Y'?[x*c+z*s,y,-x*s+z*c]:[x*c-y*s,x*s+y*c,z];}
(async()=>{
for(const face of 'URFDLB')for(const suffix of ['',"'",'2']){
 const move=face+suffix,before=run('cube.asString()'),nodes=run('view.nodes');
 const promise=run(`view.turn(cube,${JSON.stringify(move)},{playback:true})`);
 assert.equal(run('view.busy'),true);assert.equal(run('cube.asString()'),before);assert.equal(animations.length,0);
 assert.equal(nodes.filter(n=>n.classes.has('turning')).length,21);
 const arrow=ctx.host.children.find(n=>n.className==='turn-direction');assert.ok(arrow);assert.equal(arrow.innerHTML.includes('scale(-1 1)'),suffix==="'");
 await tick(275);const a=animations.shift();assert.equal(a.options.duration,800);assert.equal(a.options.easing,'ease-in-out');
 const [,axis,degrees]=a.frames[1].transform.match(/rotate([XYZ])\((-?\d+)deg\)/);assert.equal(a.frames[0].transform,`rotate${axis}(0deg)`);
 // Rotate actual source surfaces and look up their destination slots. This
 // independent geometry must match cubejs's move convention on every face.
 const expected=[...before];for(const n of nodes.filter(n=>n.classes.has('turning'))){
 const p=rotate([n.pos[0],-n.pos[1],n.pos[2]],axis,+degrees*Math.PI/180),normal=rotate(normals[n.face],axis,+degrees*Math.PI/180);
 const target=nodes.find(t=>[t.pos[0],-t.pos[1],t.pos[2]].every((v,i)=>v===p[i])&&normals[t.face].every((v,i)=>v===normal[i]));assert.ok(target);expected[target.dataset.index]=before[n.dataset.index];}
 a.finish();await flush();assert.equal(run('view.busy'),true);assert.equal(run('cube.asString()'),before);assert.ok(arrow.parentElement);
 await tick(275);await promise;assert.equal(run('cube.asString()'),expected.join(''));assert.equal(run('cube.asString()'),run(`Cube.fromString(${JSON.stringify(before)}).move(${JSON.stringify(move)}).asString()`));assert.equal(run('view.busy'),false);assert.equal(arrow.parentElement,null);assert.equal(run('view.turnLayer.children.length'),0);
}
let p=run('view.turn(cube,"R",{playback:true,slow:true})');await tick(275);assert.equal(animations[0].options.duration,1600);animations.shift().finish();await flush();await tick(275);await p;
reduced=true;p=run('view.turn(cube,"B2",{playback:true})');await tick(275);assert.equal(animations.length,0);assert.ok(run('view.turnLayer.style.transform').includes('-180deg'));assert.equal(run('view.busy'),true);await tick(275);await p;
reduced=false;p=run('view.turn(cube,"U")');await tick(70);assert.equal(animations[0].options.duration,210);animations.shift().finish();await flush();await tick(0);await p;
console.log('18 moves match cubejs geometry; before/after holds, arrow direction, slow speed, reduced motion and Learn timing passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
