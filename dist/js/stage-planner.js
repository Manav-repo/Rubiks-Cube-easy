/* Goal-directed beginner planning. Breadth-first search uses only the pieces
   needed at this stage. Macros preserve earlier layers; a returned plan may
   temporarily disturb them within a macro, but restores them at its boundary.
   It never substitutes a whole-cube Kociemba solution for a layer goal. */
(function(root){
const {inverse,lessons}=CubeLessons;
const rotate=(s,n)=>s.replace(/[FRBL]/g,c=>'FRBL'[('FRBL'.indexOf(c)+n)%4]);
const allTurns=[...'URFDLB'].flatMap(f=>[f,f+"'",f+'2']);
function macros(base,withU=true){const out=new Set(withU?['U',"U'",'U2']:[]);for(const p of base)for(let r=0;r<4;r++){const m=rotate(p,r);out.add(m);out.add(inverse(m));}return [...out];}
const definitions={
 1:{kind:'edge',pieces:[4,5,6,7],moves:allTurns},
 2:{kind:'corner',pieces:[4,5,6,7],moves:macros(["R U R'","R U' R'","R U2 R'"])},
 3:{kind:'edge',pieces:[8,9,10,11],moves:macros(lessons[3].patterns)},
 4:{kind:'edge',pieces:[0,1,2,3],moves:macros(lessons[4].patterns),anyPermutation:true},
 5:{kind:'corner',pieces:[0,1,2,3],moves:macros(lessons[5].patterns),ignoreOrientation:true},
 6:{kind:'both',pieces:[0,1,2,3],moves:macros(lessons[6].patterns,false)}
};
const cache={};
function permutations(a){if(!a.length)return [[]];return a.flatMap((x,i)=>permutations(a.filter((_,j)=>j!==i)).map(p=>[x,...p]));}
function key(c,d){const parts=[];for(const kind of d.kind==='both'?['corner','edge']:[d.kind]){const p=kind==='corner'?c.cp:c.ep,o=kind==='corner'?c.co:c.eo,base=kind==='corner'?3:2;for(const piece of d.pieces){const pos=p.indexOf(piece);parts.push(pos*base+(d.ignoreOrientation?0:o[pos]));}}return String.fromCharCode(...parts.map(n=>65+n));}
function prepare(stage){if(cache[stage])return cache[stage];const d=definitions[stage];const transforms=d.moves.map(m=>{const c=new Cube().move(m);const tables=[];for(const kind of d.kind==='both'?['corner','edge']:[d.kind]){const p=kind==='corner'?c.cp:c.ep,o=kind==='corner'?c.co:c.eo,base=kind==='corner'?3:2;const table=[];for(let old=0;old<p.length*base;old++){const pos=p.indexOf(Math.floor(old/base));table[old]=String.fromCharCode(65+pos*base+(d.ignoreOrientation?0:(old%base+o[pos])%base));}tables.push(table);}return tables;});
 const rootKeys=d.anyPermutation?permutations(d.pieces).map(p=>String.fromCharCode(...p.map(n=>65+n*2))):[key(new Cube(),d)];
 const nodes=new Map(rootKeys.map(k=>[k,null])),queue=[...rootKeys];return cache[stage]={d,transforms,nodes,queue,cursor:0};}
function nextKey(k,t){let out='';for(let i=0;i<k.length;i++)out+=t[i<4?0:1][k.charCodeAt(i)-65];return out;}
function plan(cube,stage){const {goals}=CubeLessons;if(goals[stage](cube))return [];if(!goals[stage-1](cube))throw Error('Let’s restore the earlier layer first. Restart this challenge to build it in order.');const db=prepare(stage),target=key(cube,db.d);
 while(!db.nodes.has(target)&&db.cursor<db.queue.length){const k=db.queue[db.cursor++];for(let i=0;i<db.transforms.length;i++){const n=nextKey(k,db.transforms[i]);if(!db.nodes.has(n)){db.nodes.set(n,{parent:k,move:i});db.queue.push(n);}}}
 if(!db.nodes.has(target))throw Error('I could not find a layer path. Restart the challenge and try again.');
 let k=target,path=[];while(db.nodes.get(k)){const item=db.nodes.get(k);path.push(inverse(db.d.moves[item.move]));k=item.parent;}
 const sequence=path.join(' ').split(/\s+/).filter(Boolean);const check=cube.clone().move(sequence.join(' '));if(!goals[stage](check))throw Error('That path needs another look. Try again.');return sequence;
}
root.StagePlanner={plan};if(typeof module!=='undefined')module.exports=root.StagePlanner;
})(typeof window!=='undefined'?window:globalThis);
