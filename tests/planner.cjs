const assert=require('node:assert/strict');global.Cube=require('../dist/vendor/cube');require('../dist/js/lessons');const {plan}=require('../dist/js/stage-planner');
console.time('Layer planner');let checks=0;
for(let trial=0;trial<5;trial++){
 const c=Cube.random();for(let stage=1;stage<7;stage++){const moves=plan(c,stage);c.move(moves.join(' '));assert.ok(CubeLessons.goals[stage](c),`Trial ${trial}, stage ${stage}`);checks++;console.log('Trial',trial+1,'stage',stage+1,'turns',moves.length);}
 assert.ok(c.isSolved());
}
console.timeEnd('Layer planner');console.log(`${checks} random layer goals passed`);
