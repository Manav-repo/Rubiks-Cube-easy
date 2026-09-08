importScripts('../vendor/cube.js','lessons.js','stage-planner.js');
onmessage=e=>{try{const error=CubeLessons.validate(e.data.cube);if(error)throw Error(error);postMessage({plan:StagePlanner.plan(Cube.fromString(e.data.cube),e.data.stage)});}catch(err){postMessage({error:err.message});}};
