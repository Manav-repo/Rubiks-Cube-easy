'use strict';
/* Learning state machine: predict -> explore -> explain -> recall -> badge.
   Each move is checked against cube state, never just against the expected input.
   Settings and both workspaces are saved independently in one versioned record. */
const $=id=>document.getElementById(id);
const {lessons,goals,inverse,validate,caption}=CubeLessons;
const faces='URFDLB',colorNames=CubeLayout.names(null),faceNames={U:'Top',R:'Right',F:'Front',D:'Bottom',L:'Left',B:'Back'};
let state={version:1,mode:'learn',stage:0,unlocked:0,completed:[],drill:0,phase:'predict',attempted:false,hint:0,history:[],cube:new Cube().asString(),start:new Cube().asString(),plan:[],count:0,seen:[],recall:false,variant:0,paint:CubeLayout.blank(),layout:null,calibrationSkipped:false,symbols:false,accessible:false,solution:[],step:0,fixCube:new Cube().asString(),fixCount:0,playbackSpeed:'normal',playback:false,lastPlayback:null,learned:{}};
let plannerWorker=null,planning=false,pendingSolve=false;
let cube=new Cube(),fixCube=new Cube(),paintColor='U',feedback='',hintPlan=[],worker=null,solving=false,solverTimer=null,animating=false,activePlayback=null;
try{const saved=JSON.parse(localStorage.getItem('cube-brainiac-v1'));if(saved?.version===1 && Number.isInteger(saved.stage)&&saved.stage>=0&&saved.stage<7&&!validate(saved.cube)&&!validate(saved.start)){state={...state,...saved};state.completed=state.completed.filter(n=>Number.isInteger(n)&&n>=0&&n<7);state.unlocked=Math.min(6,Math.max(0,state.unlocked));if(!Array.isArray(state.solution)||state.solution.some(m=>!/^([URFDLB])([2']?)$/.test(m)))state.solution=[];if(validate(state.fixCube))state.fixCube=new Cube().asString();if(typeof state.paint!=='string'||!/^[URFDLB?]{54}$/.test(state.paint))state.paint=CubeLayout.blank();state.playback=state.mode==='fix'&&state.solution.length>0&&saved.playback!==false;}}catch(e){/* Storage may be unavailable or an old save may be incomplete. */}
cube=Cube.fromString(state.cube);fixCube=Cube.fromString(state.fixCube);
const view=new CubeView($('cube'),pickSticker);
function save(){state.cube=cube.asString();state.fixCube=fixCube.asString();try{localStorage.setItem('cube-brainiac-v1',JSON.stringify(state));$('save-status').textContent='Saved on this device';}catch(e){$('save-status').textContent='Progress cannot save in this browser';}}
function activeCube(){return state.mode==='learn'?cube:fixCube;}
function goalHTML(){const s=state.stage;const colors=Array.from({length:9},(_,i)=>s===0?'var(--F)':s<4?(s===1&&![1,3,4,5,7].includes(i)?'#d8dfd0':'var(--D)'):(s===4&&![1,3,4,5,7].includes(i)?'#d8dfd0':'var(--U)'));return `<div class="goal-box"><div class="mini-face" aria-hidden="true">${colors.map(c=>`<i style="background:${c}"></i>`).join('')}</div><p><strong>Your goal</strong>${lessons[s].goal}</p></div>`;}
function render(){
 Object.assign(colorNames,CubeLayout.names(state.layout));const colors=state.accessible?CubeLayout.accessible:CubeLayout.normal;for(const f of faces)document.body.style.setProperty('--'+f,colors[colorNames[f]]);view.names=colorNames;
 $('view-label').textContent=`Yellow on top · Green in front · ${colorNames.R} on right`;$('layout-status').textContent=state.layout?`${colorNames.R} on the right`:'Screen cube: red on right. Match a real cube before solving.';
 syncThemeButton();
 document.body.classList.toggle('fix',state.mode==='fix');document.body.classList.toggle('playback',state.mode==='fix'&&state.solution.length>0&&state.playback);document.body.classList.toggle('paint-ready',state.mode==='fix'&&state.solution.length===0&&!state.paint.includes('?'));document.body.classList.toggle('home',state.mode==='learn'&&state.stage===0&&state.phase==='predict'&&!state.recall&&state.solution.length===0);document.body.classList.toggle('symbols',state.symbols||state.accessible);document.body.classList.toggle('accessible',state.accessible);
 $('painter-title').textContent=state.mode==='fix'&&state.solution.length?'Follow the move.':"Paint your cube’s current colors.";
 $('painter-intro').textContent=state.mode==='fix'&&state.solution.length?'Watch the arrow, then copy the turn on your cube.':'Keep yellow on top and green in front. Pick a color, then tap a square. Centers stay put.';
 $('symbols').checked=state.symbols;$('accessible').checked=state.accessible;
 ['learn','fix'].forEach(m=>{$(m+'-mode').classList.toggle('active',state.mode===m);$(m+'-mode').setAttribute('aria-pressed',state.mode===m);});
 $('painter').hidden=state.mode!=='fix';$('stage-label').textContent=state.mode==='fix'?(state.solution.length?'FIX MY CUBE · FOLLOW ALONG':'FIX MY CUBE · MATCH COLORS'):`STAGE 0${state.stage+1} · ${state.recall?'FROM MEMORY':lessons[state.stage].tag}`;
 $('stage-title').textContent=state.mode==='fix'?'Let’s untangle it.':lessons[state.stage].title;
 $('stage-subtitle').textContent=state.mode==='fix'?(state.solution.length?'Match each turn on your real cube.':'Copy all six faces to find your solution.'):lessons[state.stage].subtitle;
 $('move-count').textContent=state.mode==='learn'?state.count:state.fixCount;
 $('badge-count').textContent=`${state.completed.length} / 7`;$('progress').style.width=`${state.completed.length/7*100}%`;
 $('stages').innerHTML=lessons.map((l,i)=>`<li><button class="stage-button ${i===state.stage?'selected':''}" data-stage="${i}" ${i>state.unlocked?'disabled':''} ${i===state.stage?'aria-current="step"':''}><span class="stage-number">${state.completed.includes(i)?'✓':String(i+1).padStart(2,'0')}</span><span class="stage-text">${l.title}</span>${i>state.unlocked?'<span class="stage-lock" aria-label="Locked">⊙</span>':''}</button></li>`).join('');
 document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{if(animating||planning||Number(b.dataset.stage)===state.stage)return;state.whole=false;state.wholeRecall=false;state.stage=+b.dataset.stage;state.drill=0;newTask(false);});
 const locked=state.mode==='fix'||['explain','badge','review'].includes(state.phase)||state.stage===0&&state.phase==='predict';
 document.querySelectorAll('#face-controls button').forEach(b=>b.disabled=locked||animating);
 $('undo').disabled=locked||!state.history.length||animating;$('restart').disabled=state.mode==='fix'||animating;$('scramble').disabled=state.mode==='fix'||animating;
 view.render(activeCube(),highlight());if(state.mode==='learn')renderCoach();else{renderPalette();renderNet();renderSolution();}
 renderObjective();save();
}
function highlight(){if(state.mode!=='learn'||state.hint<2||state.recall)return [];if(state.stage===0)return [19,22,20];const c=cube.asString(),target=state.stage<4?'D':'U';return [...c].map((v,i)=>v===target&&i%9!==4?i:-1).filter(i=>i>=0);}
function renderCoach(){const l=lessons[state.stage];let body=`<div class="eyebrow">${state.whole&&!state.wholeRecall?'WHOLE CUBE CHALLENGE':state.recall?'RECALL · NO PEEKING':state.stage===0?'LET’S GET CURIOUS':`TASK ${state.drill+1} OF ${l.patterns.length} · ${l.names[state.drill]}`}</div>`;
 if(state.phase==='predict')body+=`<h3>Think before you turn.</h3>${goalHTML()}<p>${l.question}</p>${l.answers.map((a,i)=>`<button class="choice" data-answer="${i}">${a}</button>`).join('')}`;
 else if(state.phase==='explore'&&state.stage===0){const targets=['center','edge','corner'];body+=`<h3>Find a ${targets[state.seen.length]||'piece'}.</h3>${goalHTML()}<p>${state.recall?'Find it again on a mixed cube.':'Tap a sticker on the cube. Drag to peek around the sides.'}</p><p>${state.seen.map(x=>'✓ '+x).join(' &nbsp; ')}</p>`;}
 else if(state.phase==='explore')body+=`<h3>${state.recall?'Your turn to remember.':'What will you try?'}</h3>${goalHTML()}<p>${state.recall?'Use what you remember to reach the goal. The cube starts from a new angle of the same task.':'Try a turn. Look at what moved. You can always undo it.'}</p>${state.recall&&state.variant?`<p>Setup: the top was turned ${state.variant===1?'clockwise':state.variant===2?'halfway':'backward'}. Line up the task, use your trick, then put the top back.</p>`:''}<p>Green stays in front for the move names. Dragging only changes your view.</p>`;
 else if(state.phase==='explain')body+=`<h3>You found it!</h3><p>${l.why}</p><div class="goal-box"><p><strong>Now make it stick.</strong>Try a fresh task from memory before you move on.</p></div><button id="begin-recall" class="primary">I’m ready to remember →</button>`;
 else if(state.phase==='review')body+=`<h3>A tiny memory break.</h3><p>Do you remember the first trick from “${lessons[state.reviewStage].title}”?</p><p>Build it below. Try before asking for a peek.</p><div class="recall-entry"><input id="review-input" aria-label="Remembered moves" placeholder="Example: R U R′" autocomplete="off" spellcheck="false"><button id="review-check" class="primary">Check my memory</button><button id="review-peek" class="hint-button">I need a reminder</button></div>`;
 else if(state.phase==='badge')body+=`<h3>${state.stage===6?'Look what you can do!':'A new skill is yours.'}</h3><div class="badge-display">✦</div><p>${l.why}</p><p>You reached the goal and did it again without clues.</p><button id="next-stage" class="primary">${state.whole&&state.stage<6?'Next layer →':state.stage===6?'Practice again ↺':'Next adventure →'}</button>${state.stage===6?'<button id="whole-challenge" class="hint-button">Solve a whole cube →</button>':''}`;
 else if(state.phase==='free')body+=`<h3>A little free play.</h3><p>This scramble was made with real turns. Try an idea and see what changes.</p><p>Your badges are safe. Return to your task when you’re ready.</p><button id="return-task" class="primary">Back to my task</button>`;
 body=`<div class="coach-task">${body}</div><div class="coach-response">`;
 if(feedback)body+=`<p class="feedback" role="status">${feedback}</p>`;
 if(['predict','explore'].includes(state.phase)&&!state.recall){if(state.hint>=1)body+=`<p class="feedback">${state.hint===1?l.nudge:'The marked stickers are the ones to investigate. What homes do they need?'}</p>`;
 if(state.hint===3&&state.stage>0){const next=hintPlan[0];body+=next?`<p>${caption(next)}</p><button id="hint-move" class="primary" ${animating?'disabled':''}>Try ${next} →</button><p class="tiny">These clues restore your earlier layers if needed, then work toward this task’s goal.</p>`:'<p>Look at the goal and try another turn.</p>';}
 body+=`<button id="hint" class="hint-button" ${!state.attempted||state.hint>=3||planning?'disabled':''}>${['✧ A tiny clue, please','✧ Show me the pieces','✧ Help me make a turn','Three clues explored'][state.hint]}</button>`;
 }else if(state.recall&&state.phase==='explore')body+='<button id="back-practice" class="hint-button">Let’s practice with clues again</button>';
 body+='</div>';
 $('coach').innerHTML=`<div class="coach-top"><span class="coach-avatar" aria-hidden="true">✳</span><div><strong>Your thinking buddy</strong><small>A clue, never a rush.</small></div></div><div class="coach-content">${body}</div><div class="coach-bottom"><span>♧</span>Every guess helps you learn something.</div>`;
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{state.attempted=true;if(+b.dataset.answer===l.correct){state.phase='explore';feedback='Yes! You found it — nice thinking.';if(state.stage>0&&goals[state.stage](cube))completeTask();}else feedback='Not quite — but good guess! What do the colors tell you?';render();});
 if($('hint'))$('hint').onclick=()=>{state.hint++;feedback='';if(state.hint===3&&state.whole&&!state.wholeRecall){requestLayerHint();return;}if(state.hint===3){hintPlan=(inverse(state.history.join(' '))+' '+state.plan.join(' ')).trim().split(/\s+/).filter(Boolean);}render();};
 if($('hint-move'))$('hint-move').onclick=()=>{if(!animating&&!planning)perform(hintPlan.shift(),true);};
 if($('begin-recall'))$('begin-recall').onclick=()=>{if(state.whole&&!state.wholeRecall){state.wholeCube=cube.asString();state.wholeRecall=true;state.drill=0;}newTask(true);};
 if($('back-practice'))$('back-practice').onclick=()=>newTask(false);
 if($('return-task'))$('return-task').onclick=()=>{if(state.suspended){Object.assign(state,state.suspended);delete state.suspended;cube=Cube.fromString(state.cube);hintPlan=[];state.hint=Math.min(state.hint,2);feedback='Back to your task.';render();}else newTask(false);};
 if($('next-stage'))$('next-stage').onclick=()=>{if(state.whole&&state.stage<6){state.stage++;startWholeLayer();}else{state.whole=false;state.wholeRecall=false;state.stage=state.stage===6?0:state.stage+1;state.drill=0;newTask(false);}};
 if($('whole-challenge'))$('whole-challenge').onclick=()=>{state.whole=true;state.wholeRecall=false;state.stage=1;cube=new Cube().move(randomTurns(25));startWholeLayer();};
 if($('review-check'))$('review-check').onclick=()=>{const input=$('review-input').value.trim().toUpperCase().replace(/[′’]/g,"'").replace(/\s+/g,' ');const expected=state.learned[state.reviewStage];if(input===expected){finishBadge();}else{feedback='A good start. Picture the piece you were moving. Try the whole trick again.';renderCoach();}};
 if($('review-peek'))$('review-peek').onclick=()=>{feedback=`The trick was: ${state.learned[state.reviewStage]}. Say it to yourself. Close this reminder, then recall it.`;renderCoach();$('review-check').disabled=true;$('review-peek').textContent='Hide it — I’ll try from memory';$('review-peek').onclick=()=>{feedback='';renderCoach();};};
}
function newTask(recall){const l=lessons[state.stage];state.recall=recall;state.phase=recall?'explore':'predict';state.attempted=recall;state.hint=0;state.history=[];state.count=0;state.seen=[];hintPlan=[];feedback='';state.variant=recall&&state.stage>0?1+Math.floor(Math.random()*3):0;
 if(state.stage===0){cube=new Cube();if(recall)cube.move(randomTurns(12));state.plan=[];}
 else{const u=['','U','U2',"U'"][state.variant];const pattern=l.patterns[state.drill];const p=(u+' '+pattern+' '+inverse(u)).trim();state.plan=p.split(/\s+/);cube=new Cube().move(inverse(p));}
 state.start=cube.asString();view.reset();render();
}
function pickSticker(index,face){if(state.mode==='fix'||animating||$('calibration').open)return;
 if(state.stage===0&&state.phase==='explore'){state.attempted=true;const part=index%9===4?'center':[1,3,5,7].includes(index%9)?'edge':'corner';const expected=['center','edge','corner'][state.seen.length];if(part===expected){state.seen.push(part);feedback=`You found a ${part}! It has ${part==='center'?'one color':part==='edge'?'two colors':'three colors'}.`;if(state.seen.length===3)completeTask();}else feedback=`You found a ${part}. Keep looking for a ${expected}.`;render();}
 else perform(face+($('reverse').checked?"'":''));
}
async function perform(move,fromHint=false){if($('calibration').open||!move||animating||planning||state.mode!=='learn'||!['predict','explore','free'].includes(state.phase))return;animating=true;state.attempted=true;render();await view.turn(cube,move);state.history.push(move);state.count++;if(!fromHint){hintPlan=[];state.hint=Math.min(state.hint,2);}feedback='';$('move-caption').textContent=move+' · '+caption(move);animating=false;if(state.phase==='explore'&&state.stage>0&&goals[state.stage](cube))completeTask();render();}
function completeTask(){if(!state.recall){state.phase='explain';if(state.stage>0)state.learned[state.stage]=lessons[state.stage].patterns[0];}
 else if(state.wholeRecall){cube=Cube.fromString(state.wholeCube);state.wholeRecall=false;finishBadge();}
 else if(state.stage>0&&state.drill+1<lessons[state.stage].patterns.length){state.drill++;newTask(false);feedback='You remembered it! Let’s explore another shape.';}
 else if([3,5].includes(state.stage)&&state.learned[state.stage===3?1:3]){state.reviewStage=state.stage===3?1:3;state.phase='review';feedback='';}
 else finishBadge();}
function finishBadge(){if(!state.completed.includes(state.stage))state.completed.push(state.stage);state.unlocked=Math.max(state.unlocked,Math.min(6,state.stage+1));state.phase='badge';state.recall=false;feedback='';render();}
function randomTurns(n){let prev='',seq=[];for(let i=0;i<n;i++){let f;do{f=faces[Math.floor(Math.random()*6)];}while(f===prev);prev=f;seq.push(f+['',"'",'2'][Math.floor(Math.random()*3)]);}return seq.join(' ');}
$('face-controls').innerHTML=[['U','Top'],['R','Right'],['F','Front'],['D','Bottom'],['L','Left'],['B','Back']].map(([f,n])=>`<button data-move="${f}" aria-label="Turn ${n.toLowerCase()} clockwise">${f}<small>${n}</small></button>`).join('');
document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>perform(b.dataset.move+($('reverse').checked?"'":'')));
$('reverse').onchange=()=>document.querySelectorAll('[data-move]').forEach(b=>b.setAttribute('aria-label',`Turn ${faceNames[b.dataset.move].toLowerCase()} ${$('reverse').checked?'counterclockwise':'clockwise'}`));
$('undo').onclick=async()=>{if(animating||planning||state.mode!=='learn'||!state.history.length)return;animating=true;render();const m=state.history.pop();await view.turn(cube,inverse(m));state.count++;animating=false;state.hint=Math.min(2,state.hint);hintPlan=[];$('move-caption').textContent='Undid '+m+'. A fresh chance to think.';render();};
$('restart').onclick=()=>{if(animating||planning)return;cube=Cube.fromString(state.start);state.history=[];state.count=0;state.hint=0;hintPlan=[];state.phase=state.recall?'explore':'predict';state.attempted=state.recall;state.seen=[];feedback='A fresh start. Your badges are safe.';render();};
$('scramble').onclick=()=>{if(animating||planning)return;if(state.phase!=='free'){save();const {suspended,...copy}=state;state.suspended=JSON.parse(JSON.stringify(copy));}cube=new Cube().move(randomTurns(22));state.start=cube.asString();state.phase='free';state.history=[];state.count=0;feedback='';state.hint=0;render();};
$('reset-view').onclick=()=>view.reset();
['learn','fix'].forEach(m=>$(m+'-mode').onclick=()=>{if(animating||planning)return;if(m==='fix')invalidateSolution();else state.playback=false;state.mode=m;view.reset();$('move-caption').textContent=m==='fix'?'Hold yellow on top and green in front.':'Tap a face to turn it. Drag to change your view.';render();});
$('settings-toggle').onclick=()=>{if(CubePanels.active===$('settings'))CubePanels.close();else CubePanels.open($('settings'));};
['symbols','accessible'].forEach(id=>$(id).onchange=()=>{state[id]=$(id).checked;render();});
function renderPalette(){const counts=Object.fromEntries([...faces].map(f=>[f,[...state.paint].filter(c=>c===f).length]));$('palette').innerHTML=[...faces].map(f=>`<button data-color="${f}" class="${paintColor===f?'selected':''}" aria-pressed="${paintColor===f}" style="--sticker:var(--${f})">${colorNames[f]}<br>${counts[f]}/9</button>`).join('');document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{paintColor=b.dataset.color;renderPalette();});}
function invalidateSolution(){if(worker){worker.terminate();worker=null;}clearTimeout(solverTimer);solving=false;state.solution=[];state.step=0;state.fixCount=0;state.playback=false;state.lastPlayback=null;fixCube=new Cube();$('solver-message').textContent='';$('solve').disabled=false;}
function renderNet(){$('cube-net').innerHTML=[...faces].map((f,j)=>`<div class="net-face" data-face="${f}" role="group" aria-label="${faceNames[f]} face">${Array.from({length:9},(_,i)=>{const c=state.paint[j*9+i];return `<button data-paint="${j*9+i}" style="--sticker:${c==='?'?'var(--unpainted)':`var(--${c})`}" ${i===4?'disabled':''} aria-label="${faceNames[f]}, row ${Math.floor(i/3)+1}, column ${i%3+1}, ${colorNames[c]||'not painted'}">${i===4?f:c==='?'?'·':state.symbols||state.accessible?colorNames[c][0]:''}</button>`;}).join('')}</div>`).join('');document.querySelectorAll('[data-paint]').forEach(b=>b.onclick=()=>{if(animating||planning)return;invalidateSolution();const a=[...state.paint];a[+b.dataset.paint]=paintColor;state.paint=a.join('');render();});}
$('paint-reset').onclick=()=>{if(animating||planning)return;invalidateSolution();state.paint=CubeLayout.blank();render();};
$('paint-demo').onclick=()=>{if(animating||planning)return;invalidateSolution();state.paint=new Cube().move(randomTurns(20)).asString();render();};
$('solve').onclick=()=>{if(solving||animating)return;if(!state.layout){pendingSolve=true;openCalibration();return;}if(state.paint.includes('?')){$('solver-message').textContent='Paint the empty squares first. You’re getting there!';return;}const problem=validate(state.paint);if(problem){$('solver-message').textContent='Hmm, '+problem[0].toLowerCase()+problem.slice(1);return;}invalidateSolution();fixCube=Cube.fromString(state.paint);view.reset();render();if(fixCube.isSolved()){$('solver-message').textContent='Every face matches already. Your cube is solved!';return;}solving=true;renderObjective();$('solve').disabled=true;$('solver-message').textContent='Thinking through your cube… You can still look around.';
 try{worker=new Worker('js/solver-worker.js');worker.onmessage=e=>{if(e.data.status==='preparing'){$('solver-message').textContent='Warming up my puzzle brain. The first solve takes a moment…';return;}clearTimeout(solverTimer);solving=false;renderObjective();$('solve').disabled=false;if(e.data.error){$('solver-message').textContent=e.data.error;return;}state.solution=e.data.solution.split(/\s+/).filter(Boolean);state.step=0;state.playback=true;$('solver-message').textContent=`Found a path in ${state.solution.length} moves. Let’s take them one at a time.`;render();};worker.onerror=()=>{clearTimeout(solverTimer);solving=false;renderObjective();$('solve').disabled=false;$('solver-message').textContent='My puzzle brain could not load. Refresh the page and try again.';};solverTimer=setTimeout(()=>{worker.terminate();solving=false;renderObjective();$('solve').disabled=false;$('solver-message').textContent='That took longer than expected. Try again, or use a newer browser.';},120000);worker.postMessage(state.paint);}catch(e){solving=false;renderObjective();$('solve').disabled=false;$('solver-message').textContent='The solver needs a web server. Open the published game instead of double-clicking the file.';}};
// A replay uses its own cube. The solve position and move count never rewind.
function replayAvailable(){const r=state.lastPlayback;return !!(r&&/^[URFDLB][2']?$/.test(r.move)&&r.after===fixCube.asString()&&!validate(r.before)&&Cube.fromString(r.before).move(r.move).asString()===r.after);}
function renderSolution(){
 const has=state.solution.length>0;$('solution-controls').hidden=!has;if(!has)return;
 $('solution-progress').innerHTML=state.solution.map((m,i)=>`<button type="button" class="solution-token ${i<state.step?'done':i===state.step?'current':''}" data-solution-index="${i}" aria-label="Play move ${i+1}: ${m}" ${animating?'disabled':''}>${m}</button>`).join('');
 document.querySelectorAll('[data-solution-index]').forEach(b=>b.onclick=()=>playListedMove(+b.dataset.solutionIndex));
 const current=activePlayback;
 $('solution-caption').textContent=current?`${current.replay?'Replay':current.back?'Undo':'Watch'} ${current.move} · ${caption(current.move)}`:state.step===state.solution.length?'All six faces match. Nice work!':`Next: move ${state.step+1} of ${state.solution.length} · ${state.solution[state.step]} · ${caption(state.solution[state.step])}`;
 $('solution-back').disabled=state.step===0||animating;
 $('solution-next').disabled=state.step===state.solution.length||animating;
 $('solution-replay').disabled=animating||!replayAvailable();
 $('solution-replay').innerHTML='<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 7a6 6 0 1 1 1 5M2 2v5h5"/></svg><span>Replay</span>';
 $('solution-replay').setAttribute('aria-label',`Replay this move${state.lastPlayback?' · '+state.lastPlayback.move:''}`);
 $('playback-speed').value=state.playbackSpeed==='slow'?'slow':'normal';$('playback-speed').disabled=animating;
 $('reset-view').disabled=animating;
}
async function playTurn(move,{back=false,replay=false}={}){
 if(animating||solving)return;
 if(!state.layout){openCalibration();return;}
 const before=replay?state.lastPlayback.before:fixCube.asString();
 const replayAfter=replay?Cube.fromString(state.lastPlayback.after):null;
 const target=replay?Cube.fromString(before):fixCube;
 animating=true;activePlayback={move,back,replay};renderSolution();renderObjective();
 $('playback-status').textContent=`${replay?'Replaying':'Watch'} ${move}: ${faceNames[move[0]]} face. ${move.endsWith('2')?'Half a turn':move.endsWith("'")?'Counterclockwise':'Clockwise'}, looking at that face.`;
 try{
 if(replay){fixCube=target;view.render(fixCube);}
 if(await view.turn(target,move,{playback:true,slow:state.playbackSpeed==='slow'})===false)return;
 if(replay){fixCube=replayAfter;}
 else{state.step+=back?-1:1;state.fixCount=state.step;state.lastPlayback={before,after:fixCube.asString(),move};}
 $('playback-status').textContent=`${replay?'Replayed':back?'Undid':'Made'} ${move}. ${replay?'Your place is unchanged.':'Copy this on your real cube. Replay if you need another look.'}`;
 }catch(e){$('playback-status').textContent='That turn was interrupted. Try it again.';}
 finally{animating=false;activePlayback=null;view.render(fixCube);render();}
}
async function solverStep(back){if(animating||solving)return;const m=back?state.solution[state.step-1]:state.solution[state.step];if(m)await playTurn(back?inverse(m):m,{back});}
async function playListedMove(index){
 if(animating||solving||index<0||index>=state.solution.length)return;
 if(index!==state.step){
  const base=Cube.fromString(state.paint);if(index)base.move(state.solution.slice(0,index).join(' '));
  fixCube=base;state.step=index;state.fixCount=index;state.lastPlayback=null;view.render(fixCube);render();
 }
 await playTurn(state.solution[index]);
}
async function replayMove(){if(animating||solving||!replayAvailable())return;await playTurn(state.lastPlayback.move,{replay:true});}
$('solution-back').onclick=()=>solverStep(true);$('solution-next').onclick=()=>solverStep(false);
$('solution-replay').onclick=replayMove;
$('playback-speed').onchange=()=>{if(animating)return;state.playbackSpeed=$('playback-speed').value==='slow'?'slow':'normal';save();};
// Keyboard turns are available outside text fields; Shift reverses a turn.
window.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|BUTTON/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;const f=e.key.toUpperCase();if(faces.includes(f)&&f.length===1){e.preventDefault();perform(f+(e.shiftKey?"'":''));}});
// A saved hint never exposes a stale move after reload.
state.hint=Math.min(2,state.hint);render();
setupCalibration();window.renderSupport();if(!state.layout&&!state.calibrationSkipped)openCalibration();

function startWholeLayer(){state.wholeRecall=false;state.recall=false;state.drill=0;state.phase='predict';state.history=[];state.count=0;state.hint=0;state.attempted=false;state.seen=[];state.start=cube.asString();state.plan=[];hintPlan=[];feedback='A whole scramble, one goal at a time. Use what you remember.';view.reset();render();}
function requestLayerHint(){planning=true;feedback='Thinking about this layer…';render();const rewind=!goals[state.stage-1](cube);const input=rewind?state.start:cube.asString();
try{if(!plannerWorker)plannerWorker=new Worker('js/planner-worker.js');plannerWorker.onmessage=e=>{planning=false;if(e.data.error){state.hint=2;feedback=e.data.error;}else{hintPlan=[...(rewind?inverse(state.history.join(' ')).split(/\s+/).filter(Boolean):[]),...e.data.plan];feedback='Take one turn. Look at the pieces before trying the next.';}render();};plannerWorker.onerror=()=>{planning=false;state.hint=2;feedback='The clue could not load. Please try again.';plannerWorker.terminate();plannerWorker=null;render();};plannerWorker.postMessage({cube:input,stage:state.stage});}catch(e){planning=false;state.hint=2;feedback='Open the published game to use layer clues.';render();}}

// One objective source feeds both progress and the contextual primary action.
function renderObjective(){let now,next,progress,action,handler;
 if(state.mode==='fix'){
 const painted=[...state.paint].filter(c=>c!=='?').length;
 $('solve').disabled=painted!==54||solving||animating;
 $('painting-progress').textContent=`${painted} of 54 stickers painted · ${54-painted} left (6 centers included)`;
 if(solving){now='Finding your moves';next='Next: follow one turn at a time';progress='Your colors are ready';action='Thinking…';handler=null;}
 else if(state.solution.length){const done=state.step===state.solution.length;now=done?'Your cube is solved!':`Follow move ${state.step+1}: ${state.solution[state.step]}`;next=done?'Next: paint another cube':'Next: match this turn on your real cube';progress=`${state.step} of ${state.solution.length} moves done`;action=done?'Paint another cube':'Next move';handler=()=>done?$('paint-reset').click():$('solution-next').click();}
 else {const ready=painted===54;now=ready?'Your painting is ready':'Paint your cube';next=ready?'Next: Find my moves':'Next: finish painting, then Find my moves';progress=`${painted}/54 painted · ${54-painted} left`;action=ready?'Find my moves':'Go to painting';handler=()=>ready?$('solve').click():$('painter').scrollIntoView({block:'start'});}
 }else{
 const names={predict:'Make a prediction',explore:state.recall?'Try it from memory':'Try a turn',explain:'Remember the trick',review:'Recall an earlier trick',badge:'Stage complete',free:'Explore freely'};
 now=`${lessons[state.stage].title} · ${names[state.phase]||'Explore'}`;progress=`Stage ${state.stage+1} of 7 · ${state.completed.length}/7 badges`;
 if(state.phase==='badge'){next=state.stage===6?'Next: solve a whole cube':`Next up: ${lessons[state.stage+1].title}`;action=state.stage===6?'Whole cube challenge':'Next adventure';handler=()=>$(state.stage===6?'whole-challenge':'next-stage').click();}
 else if(state.phase==='explain'){next='Next: a fresh task from memory';action='Try from memory';handler=()=>$('begin-recall').click();}
 else {next=state.phase==='predict'?'Next: test your idea on the cube':state.phase==='free'?'Next: return to your saved task':state.recall?'Next: reach the goal without clues':state.phase==='review'?'Next: recall the earlier move pattern':'Next: reach the goal, then try from memory';action=state.phase==='free'?'Back to my task':'See my task';handler=()=>state.phase==='free'?$('return-task').click():$('coach').scrollIntoView({block:'start'});}
 }
 if(activePlayback){now=`${activePlayback.replay?'Replay':activePlayback.back?'Undo':'Watch'} ${activePlayback.move}`;next='Watch the arrow. Then copy the turn.';action='Watching…';}
 $('objective-now').textContent=now;$('objective-next').textContent=next;$('objective-progress').textContent=progress;$('objective-action').textContent=action;$('objective-action').disabled=!handler||animating;$('objective-action').onclick=handler;
}
function syncThemeButton(){const dark=CubeTheme.isDark();$('theme-toggle').textContent=dark?'☀':'☾';$('theme-toggle').setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);$('theme-toggle').title=`Switch to ${dark?'light':'dark'} mode`;}
$('theme-toggle').onclick=()=>{CubeTheme.set(CubeTheme.isDark()?'light':'dark');syncThemeButton();};
$('theme-system').onclick=()=>{CubeTheme.set(null);syncThemeButton();};
function cornerDiagram(right){return `<svg viewBox="0 0 180 170" aria-hidden="true"><g stroke="#263e30" stroke-width="3" stroke-linejoin="round"><path d="M20 48 90 12 160 48 90 86Z" fill="#f6d74a"/><path d="M20 48 90 86 90 160 20 122Z" fill="#6bae76"/><path d="M90 86 160 48 160 122 90 160Z" fill="${right==='Red'?'#ed7159':'#f3a755'}"/></g><g fill="#263e30" font-size="19" text-anchor="middle"><text x="90" y="55">Y</text><text x="52" y="106">G</text><text x="127" y="110">${right[0]}</text></g></svg>`;}
function setupCalibration(){const dialog=$('calibration');$('layout-choices').innerHTML=['Red','Orange'].map(c=>`<button type="button" data-layout="${c.toLowerCase()}-right" aria-label="${c} is on my right">${cornerDiagram(c)}<strong>${c} on my right</strong></button>`).join('');document.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{const changed=state.layout!==b.dataset.layout;if(changed){invalidateSolution();state.paint=CubeLayout.blank();}state.layout=b.dataset.layout;state.calibrationSkipped=false;CubePanels.close(dialog);render();if(pendingSolve){pendingSolve=false;$('solver-message').textContent=changed?'Layout matched. Paint your cube, then find your moves.':'';if(!changed)$('solve').click();}});$('calibrate-settings').onclick=()=>{if(!animating&&!planning)openCalibration();};$('calibration-skip').onclick=()=>{state.calibrationSkipped=true;pendingSolve=false;CubePanels.close(dialog);save();};dialog.addEventListener('cancel',()=>{state.calibrationSkipped=true;pendingSolve=false;save();});}
function openCalibration(){$('calibration-note').textContent='Changing the layout starts a fresh painting. Your lesson badges stay.';CubePanels.open($('calibration'),true);}
