/* Keep Kociemba's table generation and search off the UI thread. */
importScripts('../vendor/cube.js','../vendor/solve.js','lessons.js');
let ready=false;
onmessage=e=>{try{const problem=CubeLessons.validate(e.data);if(problem)throw Error(problem);if(!ready){postMessage({status:'preparing'});Cube.initSolver();ready=true;}const cube=Cube.fromString(e.data);const solution=cube.isSolved()?'':cube.solve();const check=cube.clone().move(solution);if(!check.isSolved())throw Error('Let’s check those colors once more.');postMessage({solution});}catch(err){postMessage({error:err.message||'I could not find the moves. Check the colors and try again.'});}};
