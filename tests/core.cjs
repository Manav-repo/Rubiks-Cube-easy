/* Run with: node tests/core.cjs. No package installation needed. */
const assert=require('node:assert/strict');
global.Cube=require('../dist/vendor/cube');
require('../dist/vendor/solve');
const {lessons,goals,inverse,validate}=require('../dist/js/lessons');
let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
check(!validate(new Cube().asString()),'Solved cube valid');
for(const f of 'URFDLB'){
 check(new Cube().move(`${f} ${f} ${f} ${f}`).isSolved(),f+' four turns');
 check(new Cube().move(`${f} ${f}'`).isSolved(),f+' inverse');
}
for(let stage=1;stage<7;stage++)for(const pattern of lessons[stage].patterns){
 for(const u of ['', 'U', 'U2', "U'"]){
 const plan=[u,pattern,inverse(u)].filter(Boolean).join(' ');
 const c=new Cube().move(inverse(plan));
 check(!validate(c.asString()),'Every drill physically possible');
 check(goals[stage-1](c),'Earlier stage stays solved at drill start');
 check(!goals[stage](c),'Drill requires actual turns');
 c.move(plan);check(goals[stage](c),'Practice plan reaches goal');
 }
}
let bad=new Cube();bad.eo[0]=1;check(!!validate(bad.asString()),'One flipped edge rejected');
bad=new Cube();bad.co[0]=1;check(!!validate(bad.asString()),'One twisted corner rejected');
bad=new Cube();[bad.ep[0],bad.ep[1]]=[bad.ep[1],bad.ep[0]];check(!!validate(bad.asString()),'Parity mismatch rejected');
bad=new Cube();bad.ep[0]=1;check(!!validate(bad.asString()),'Duplicate piece rejected');
check(!!validate('U'.repeat(54)),'Color count rejected');
// A mirrored corner uses the right colors but is not a real piece.
let s=new Cube().asString().split('');[s[9],s[20]]=[s[20],s[9]];check(!!validate(s.join('')),'Mirrored corner rejected');
console.time('Solver tables');Cube.initSolver();console.timeEnd('Solver tables');
for(let i=0;i<8;i++){
 const c=Cube.random();check(!validate(c.asString()),'Random legal state accepted');
 const solution=c.solve();check(c.clone().move(solution).isSolved(),'Solver solves random state');
 const replay=c.clone();for(const m of solution.split(' '))replay.move(m);check(replay.isSolved(),'Step-through solved');replay.move(inverse(solution));check(replay.asString()===c.asString(),'Previous restores input');
}
console.log(`${checks} checks passed.`);
