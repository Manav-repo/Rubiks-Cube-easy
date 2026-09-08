/* Logic integration harness. DOM/animation are inert substitutes; this does
   not claim browser or visual QA. Exercise the real application state machine. */
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
class Node{constructor(){this.style={setProperty(){}};this.classList={toggle(){}};this.checked=false;this.hidden=false;this.innerHTML='';this.open=false;this.value='';}setAttribute(){}addEventListener(){}showModal(){this.open=true;}close(){this.open=false;}scrollIntoView(){} }
const nodes=new Map(),storage={};
const context=vm.createContext({console,setTimeout,clearTimeout,matchMedia:()=>({matches:false}),document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id);},querySelectorAll:()=>[],body:new Node(),documentElement:new Node()},window:{addEventListener(){},renderSupport(){}},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},CubeTheme:{isDark:()=>false,set(){}},CubeView:class{render(){}reset(){}async turn(c,m){c.move(m);}},Worker:class{postMessage(){}terminate(){}}});
context.window=context;context.renderSupport=()=>{};context.addEventListener=()=>{};
for(const file of ['vendor/cube.js','js/layout.js','js/lessons.js','js/app.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
const run=s=>vm.runInContext(s,context);let checks=0;
function check(s){assert.ok(run(s),s);checks++;}
(async()=>{
check("state.phase==='predict' && state.unlocked===0");
run("state.calibrationSkipped=true;$('calibration').close()");
run("state.phase='explore';pickSticker(22,'F');pickSticker(19,'F');pickSticker(20,'F')");check("state.phase==='explain' && state.completed.length===0");
run("newTask(true);pickSticker(22,'F');pickSticker(19,'F');pickSticker(20,'F')");check("state.phase==='badge' && state.unlocked===1");
for(let s=1;s<7;s++){
 run(`state.stage=${s};state.drill=0;newTask(false)`);
 for(let d=0;d<run('lessons[state.stage].patterns.length');d++){
  run("state.phase='explore'");const moves=run('state.plan.slice()');for(const m of moves)await run(`perform(${JSON.stringify(m)})`);
  check("state.phase==='explain'");check('!state.completed.includes(state.stage)');
  run('newTask(true)');const recall=run('state.plan.slice()');for(const m of recall){await run(`perform(${JSON.stringify(m)})`);if(!run("state.phase==='explore' && state.recall"))break;}
 }
 if(run("state.phase==='review'"))run('finishBadge()');
 check("state.phase==='badge' && state.completed.includes(state.stage)");
}
check('state.completed.length===7');
// Preserve a full puzzle while its completed layer is rehearsed separately.
run("state.whole=true;state.stage=1;cube=new Cube().move('U');startWholeLayer();state.phase='explore';completeTask();$('begin-recall').onclick()");
check('state.wholeRecall && state.recall');const moves=run('state.plan.slice()');for(const m of moves)await run(`perform(${JSON.stringify(m)})`);
check("state.phase==='badge' && !state.wholeRecall && cube.asString()===state.wholeCube");
run("$('next-stage').onclick()");check("state.stage===2 && state.whole && state.phase==='predict'");
// Free-play and return preserve the prior task, including the cube.
run("save();globalThis.before=state.cube;$('scramble').onclick()");check("state.phase==='free'");run("$('return-task').onclick()");check("cube.asString()===before && state.phase==='predict'");
// Painter edits clear a stale solution and previous solver position.
run("state.solution=['R'];state.step=1;invalidateSolution()");check('state.solution.length===0 && state.step===0');
// Follow-along replay repeats the last actual turn, including an undo.
run("state.mode='fix';state.layout='red-right';state.solution=['R', \"U'\", 'B2'];state.step=0;fixCube=new Cube();render()");
check("$('solution-replay').disabled");
await run('solverStep(false)');check("state.step===1 && state.lastPlayback.move==='R'");
run('globalThis.after=fixCube.asString()');await run('replayMove()');check('state.step===1 && state.fixCount===1 && fixCube.asString()===after');
await run('solverStep(true)');check('state.step===0 && fixCube.isSolved()');
check("state.lastPlayback.move===\"R'\"");await run('replayMove()');check('state.step===0 && fixCube.isSolved()');
// A pending turn holds both navigation paths and replay. Extra taps are ignored.
run("view.turn=async(c,m)=>{await new Promise(r=>globalThis.release=r);c.move(m)}");
const pending=run('solverStep(false)');check("animating && $('solution-next').disabled && $('solution-back').disabled && $('solution-replay').disabled && $('objective-action').disabled");
await run('solverStep(false)');await run('solverStep(true)');await run('replayMove()');check('state.step===0');run('release()');await pending;check('state.step===1 && !animating');
run("$('playback-speed').value='slow';$('playback-speed').onchange()");check("JSON.parse(localStorage.getItem('cube-brainiac-v1')).playbackSpeed==='slow'");
run('invalidateSolution()');check('state.lastPlayback===null');
check("JSON.parse(localStorage.getItem('cube-brainiac-v1')).version===1");console.log(`${checks} application state checks passed.`);
})().catch(e=>{console.error(e);process.exitCode=1});
