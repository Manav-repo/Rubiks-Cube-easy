const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function setup(initial=false,stamp=null){
 const nodes={},timers=new Map();let observer,seq=0,done=initial,hidden=false,open=false;
 for(const id of ['camera-fund-amount','completion-fund-amount','camera-fund-progress','completion-fund-progress','feedback-dialog','feedback-open','feedback-form','feedback-message','feedback-close','completion-dialog','completion-close','completion-feedback','solution-caption','playback-speed']){
  nodes[id]={textContent:'',disabled:false,listeners:{},isConnected:true,addEventListener(k,f){this.listeners[k]=f},setAttribute(){},removeAttribute(k){delete this[k]},focus(){},showModal(){this.opens=(this.opens||0)+1;open=true},close(){open=false;this.listeners.close?.()},setCustomValidity(v){this.error=v},reportValidity(){return !nodes['feedback-message'].error}};
 }
 Object.defineProperty(nodes['solution-caption'],'textContent',{get:()=>done?'All six faces match. Nice work!':'Next move'});
 const window={location:{}};
 const document={body:{classList:{contains:()=>true}},get hidden(){return hidden},getElementById:id=>nodes[id],querySelector:()=>open?{}:null,addEventListener(){},activeElement:nodes['feedback-open']};
 vm.runInNewContext(fs.readFileSync('dist/js/feedback.js','utf8'),{document,window,encodeURIComponent,matchMedia:()=>({matches:true,addEventListener(){}}),localStorage:{getItem:()=>stamp,setItem(k,v){stamp=v}},MutationObserver:class{constructor(f){observer=f}observe(){}},setTimeout(f,ms){assert.equal(ms,3000);timers.set(++seq,f);return seq},clearTimeout(id){timers.delete(id)}});
 return {nodes,window,timers,setDone(v){done=v;observer()},hide(){hidden=true;observer()},tick(){for(const [id,f] of [...timers]){timers.delete(id);f()}}};
}
let a=setup();assert.equal(a.timers.size,0);a.setDone(true);assert.equal(a.timers.size,1);assert.equal(a.nodes['completion-dialog'].opens,undefined);a.tick();assert.equal(a.nodes['completion-dialog'].opens,1);
a.nodes['completion-feedback'].listeners.click();assert.equal(a.nodes['feedback-dialog'].opens,1);
let prevented=0;a.nodes['completion-dialog'].listeners.cancel({preventDefault(){prevented++}});a.nodes['feedback-dialog'].listeners.cancel({preventDefault(){prevented++}});assert.equal(prevented,2);
a.setDone(false);a.setDone(true);assert.equal(a.timers.size,0);
a=setup(true);a.setDone(true);assert.equal(a.timers.size,0);
a=setup();a.setDone(true);a.setDone(false);a.tick();assert.equal(a.nodes['completion-dialog'].opens,undefined);
a=setup();a.setDone(true);a.hide();a.tick();assert.equal(a.nodes['completion-dialog'].opens,undefined);
a=setup();a.nodes['feedback-message'].value='Hello & 雪';a.nodes['feedback-form'].listeners.submit({preventDefault(){}});
const u=new URL(a.window.location.href);assert.equal(u.pathname,'manav.uix@gmail.com');assert.equal(u.searchParams.get('body'),'Hello & 雪');
assert.equal(a.nodes['completion-fund-progress'].value,undefined);assert.equal(a.nodes['camera-fund-progress'].max,undefined);assert.equal(a.nodes['completion-fund-amount'].textContent,'$459 raised · Goal: $— (pending confirmation)');
a=setup(false,String(Date.now()-6*86400000));a.setDone(true);a.tick();assert.equal(a.nodes['completion-dialog'].opens,undefined);
a=setup(false,String(Date.now()-8*86400000));a.setDone(true);a.tick();assert.equal(a.nodes['completion-dialog'].opens,1);
console.log('PASS: 3-second delay, one prompt, restored-game suppression, navigation/hidden cancellation, feedback transition, mailto encoding and shared goal.');
