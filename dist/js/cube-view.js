/*
   CSS 3D cube view. The visible stickers live inside 27 rigid cubie groups.
   A turn temporarily reparents the nine cubies in one outer slice to
   `turnLayer`, whose origin is the cube's centre. The pivot rotates the
   complete slice; after the motion, position, face orientation, and facelet
   index are baked back into the cubie model. No sticker is resized, faded, or
   swapped during a turn.
*/
class CubeView {
 constructor(el,onPick){
  this.el=el;this.onPick=onPick;this.x=-25;this.y=-32;this.busy=false;this.nodes=[];this.cubies=[];this.drag=null;
  this.turnLayer=document.createElement('div');this.turnLayer.className='turn-layer';this.el.append(this.turnLayer);
  const faces='URFDLB';
  const faceNormals={U:[0,1,0],R:[1,0,0],F:[0,0,1],D:[0,-1,0],L:[-1,0,0],B:[0,0,-1]};
  const faceRotation={U:'rotateX(90deg)',R:'rotateY(90deg)',F:'',D:'rotateX(-90deg)',L:'rotateY(-90deg)',B:'rotateY(180deg)'};
  const cubieAt=new Map();const key=p=>p.join(',');
  for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
   const cubie=document.createElement('div');cubie.className='cubie';cubie.pos=[x,y,z];cubie.style.transform=`translate3d(${x*62}px,${-y*62}px,${z*62}px)`;this.el.append(cubie);this.cubies.push(cubie);cubieAt.set(key(cubie.pos),cubie);
  }
  for(let f=0;f<6;f++)for(let i=0;i<9;i++){
   const face=faces[f],col=i%3-1,row=Math.floor(i/3)-1;
   const pos={U:[col,1,row],R:[1,-row,-col],F:[col,-row,1],D:[col,-1,-row],L:[-1,-row,col],B:[-col,-row,-1]}[face];
   const normal=faceNormals[face],cubie=cubieAt.get(key(pos));
   const n=document.createElement('button');n.className='sticker';n.innerHTML='<span class="symbol"></span>';n.dataset.index=f*9+i;n.index=f*9+i;n.pos=[...pos];n.face=face;n.normal=[...normal];
   n.base=`${faceRotation[face]} translateZ(31px)`;n.style.transform=n.base;n.onclick=()=>{if(!this.moved&&!this.busy)this.onPick(n.index,n.face)};this.nodes.push(n);cubie.append(n);
  }
  const scene=el.parentElement;
  scene.addEventListener('pointerdown',e=>{if(this.busy)return;this.drag={x:e.clientX,y:e.clientY};this.moved=false;});
  window.addEventListener('pointermove',e=>{if(!this.drag||this.busy)return;let dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;if(Math.abs(dx)+Math.abs(dy)>3)this.moved=true;if(this.moved){this.y+=dx*.55;this.x=Math.max(-170,Math.min(170,this.x-dy*.55));this.orient();this.drag={x:e.clientX,y:e.clientY};}});
  window.addEventListener('pointerup',()=>{this.drag=null;});window.addEventListener('pointercancel',()=>{this.drag=null;});
 }
 orient(){this.el.style.transform=`rotateX(${this.x}deg) rotateY(${this.y}deg)`;}
 reset(){if(this.busy)return;this.x=-25;this.y=-32;this.orient();}
 render(c,highlight=[]){const str=c.asString();const names=this.names||CubeLayout.names(null);this.nodes.forEach(n=>{n.style.setProperty('--sticker',`var(--${str[n.index]})`);n.querySelector('span').textContent=names[str[n.index]][0];n.setAttribute('aria-label',`${names[str[n.index]]} sticker, ${n.face} face`);n.classList.toggle('highlight',highlight.includes(n.index));});}
 faceForNormal(n){return {"0,1,0":'U',"1,0,0":'R',"0,0,1":'F',"0,-1,0":'D',"-1,0,0":'L',"0,0,-1":'B'}[n.join(',')];}
 rotate(v,axis,angle){const c=Math.round(Math.cos(angle*Math.PI/180)),s=Math.round(Math.sin(angle*Math.PI/180));const [x,y,z]=v;return axis==='X'?[x,y*c-z*s,y*s+z*c]:axis==='Y'?[x*c+z*s,y,-x*s+z*c]:[x*c-y*s,x*s+y*c,z];}
 showDirection(m){
  const normals={U:[0,1,0],D:[0,-1,0],R:[1,0,0],L:[-1,0,0],F:[0,0,1],B:[0,0,-1]},normal=normals[m[0]],x=this.x*Math.PI/180,y=this.y*Math.PI/180;
  const facing=normal[1]*Math.sin(x)+(-normal[0]*Math.sin(y)+normal[2]*Math.cos(y))*Math.cos(x);
  if(facing<.45){[this.x,this.y]={U:[-65,-25],D:[65,-25],R:[-20,-65],L:[-20,65],F:[-25,-25],B:[-25,155]}[m[0]];this.orient();}
  const rotation={U:'rotateX(90deg)',D:'rotateX(-90deg)',R:'rotateY(90deg)',L:'rotateY(-90deg)',F:'rotateY(0deg)',B:'rotateY(180deg)'}[m[0]];
  const arrow=document.createElement('div');arrow.className='turn-direction';arrow.setAttribute('aria-hidden','true');arrow.style.transform=`${rotation} translateZ(99px)`;
  // Keep a separate counterclockwise path instead of mirroring with CSS
  // scale; the playback contains rotation only, never a scale animation.
  const path=m.endsWith("'")?'M 91 76 A 33 33 0 1 0 35 50 M 46 41 L 35 50 L 26 38':'M 29 76 A 33 33 0 1 1 85 50 M 74 41 L 85 50 L 94 38';arrow.innerHTML=`<svg viewBox="0 0 120 120"><path class="arrow-border" d="${path}"/><path class="arrow-line" d="${path}"/><text x="60" y="66">${m.endsWith('2')?'180°':'90°'}</text></svg>`;this.el.append(arrow);return arrow;
 }
 async turn(c,m,{playback=false,slow=false}={}){
  if(this.busy)return false;this.busy=true;this.drag=null;
  const data={U:['Y',1,-1],D:['Y',-1,1],R:['X',1,-1],L:['X',-1,1],F:['Z',1,-1],B:['Z',-1,1]}[m[0]],axis=data[0],layer=data[1],sign=data[2];
  const amount=m.endsWith("'")?-90:m.endsWith('2')?180:90,angle=-sign*amount*(axis==='Y'?-1:1),axisNumber={X:0,Y:1,Z:2}[axis];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,duration=playback?(slow?1600:800):210,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const turningCubies=this.cubies.filter(g=>g.pos[axisNumber]===layer),turningNodes=turningCubies.flatMap(g=>[...g.children]);const arrow=playback?this.showDirection(m):null;let animation;
  try{
   turningNodes.forEach(n=>n.classList.add('turning'));await wait(playback?275:reduced?110:70);turningCubies.forEach(g=>this.turnLayer.append(g));
   if(!reduced){const from=`rotate${axis}(0deg)`,to=`rotate${axis}(${angle}deg)`,easing=playback?'ease-in-out':'cubic-bezier(.22,.8,.25,1)';
    if(typeof this.turnLayer.animate==='function'){animation=this.turnLayer.animate([{transform:from},{transform:to}],{duration,easing,fill:'forwards'});await animation.finished;}
    else{this.turnLayer.style.transform=from;this.turnLayer.getBoundingClientRect();this.turnLayer.style.transition=`transform ${duration}ms ${easing}`;this.turnLayer.style.transform=to;await wait(duration);}
   } else this.turnLayer.style.transform=`rotate${axis}(${angle}deg)`;
   await wait(playback?275:0);
   const faceletAt=new Map(this.nodes.map(n=>[`${n.pos.join(',')}|${n.normal.join(',')}`,n.index]));
   for(const g of turningCubies){const next=this.rotate(g.pos,axis,angle);g.pos=next;g.style.transform=`translate3d(${next[0]*62}px,${-next[1]*62}px,${next[2]*62}px)`;for(const n of [...g.children]){n.pos=[...next];n.normal=this.rotate(n.normal,axis,angle);n.face=this.faceForNormal(n.normal);n.index=faceletAt.get(`${n.pos.join(',')}|${n.normal.join(',')}`);n.dataset.index=n.index;n.base=`${{U:'rotateX(90deg)',R:'rotateY(90deg)',F:'',D:'rotateX(-90deg)',L:'rotateY(-90deg)',B:'rotateY(180deg)'}[n.face]} translateZ(31px)`;n.style.transform=n.base;}}
   c.move(m);return true;
  }finally{
   if(animation)animation.cancel();turningCubies.forEach(g=>this.el.append(g));this.turnLayer.style.transition='';this.turnLayer.style.transform='';if(arrow)arrow.remove();turningNodes.forEach(n=>n.classList.remove('turning'));this.render(c);this.busy=false;
  }
 }
}
