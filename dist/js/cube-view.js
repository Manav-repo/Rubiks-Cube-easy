/* CSS 3D stickers use cubejs's URFDLB facelet order. During a turn all
   stickers on the moving layer rotate around the cube's origin together. */
class CubeView {
 constructor(el,onPick){this.el=el;this.onPick=onPick;this.x=-25;this.y=-32;this.busy=false;this.nodes=[];this.drag=null;this.turnLayer=document.createElement('div');this.turnLayer.className='turn-layer';this.el.append(this.turnLayer);
 for(let f=0;f<6;f++)for(let i=0;i<9;i++){
 const face='URFDLB'[f],col=i%3-1,row=Math.floor(i/3)-1;
 const pos={U:[col,1,row],R:[1,-row,-col],F:[col,-row,1],D:[col,-1,-row],L:[-1,-row,col],B:[-col,-row,-1]}[face];
 const rot={U:'rotateX(90deg)',R:'rotateY(90deg)',F:'',D:'rotateX(-90deg)',L:'rotateY(-90deg)',B:'rotateY(180deg)'}[face];
 const n=document.createElement('button');n.className='sticker';n.innerHTML='<span class="symbol"></span>';n.dataset.index=f*9+i;
 n.base=`translate3d(${pos[0]*62}px,${-pos[1]*62}px,${pos[2]*62}px) ${rot} translateZ(31px)`;
 // Each face is 93px from the origin, while its layer coordinates are ±62px.
 n.pos=pos;n.face=face;n.style.transform=n.base;n.onclick=()=>{if(!this.moved&&!this.busy)this.onPick(f*9+i,face)};this.nodes.push(n);el.append(n);
 }
 const scene=el.parentElement;
 scene.addEventListener('pointerdown',e=>{this.drag={x:e.clientX,y:e.clientY};this.moved=false;});
 window.addEventListener('pointermove',e=>{if(!this.drag)return;let dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;if(Math.abs(dx)+Math.abs(dy)>3)this.moved=true;if(this.moved){this.y+=dx*.55;this.x=Math.max(-170,Math.min(170,this.x-dy*.55));this.orient();this.drag={x:e.clientX,y:e.clientY};}});
 window.addEventListener('pointerup',()=>{this.drag=null;});window.addEventListener('pointercancel',()=>{this.drag=null;});
 }
 orient(){this.el.style.transform=`rotateX(${this.x}deg) rotateY(${this.y}deg)`;}
 reset(){this.x=-25;this.y=-32;this.orient();}
 render(c,highlight=[]){const str=c.asString();const names=this.names||CubeLayout.names(null);this.nodes.forEach((n,i)=>{n.style.setProperty('--sticker',`var(--${str[i]})`);n.querySelector('span').textContent=names[str[i]][0];n.setAttribute('aria-label',`${names[str[i]]} sticker, ${n.face} face, row ${Math.floor(i%9/3)+1}, column ${i%3+1}`);n.classList.toggle('highlight',highlight.includes(i));});}
 async turn(c,m){if(this.busy)return false;this.busy=true;const data={U:[1,1,-1],D:[1,-1,1],R:[0,1,-1],L:[0,-1,1],F:[2,1,-1],B:[2,-1,1]}[m[0]];
 const [axis,layer,sign]=data;const amount=m.endsWith("'")?-90:m.endsWith('2')?180:90;const angle=-sign*amount*(axis===1?-1:1);
 const moving=this.nodes.filter(n=>n.pos[axis]===layer);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const axisName=['X','Y','Z'][axis];
 // Highlight the whole layer first, then move those nine stickers together
 // around the cube's origin. The cube model is updated only after the group
 // reaches its exact end angle, so every following move starts from fresh data.
 moving.forEach(n=>n.classList.add('turning'));
 await new Promise(resolve=>setTimeout(resolve,reduced?110:70));
 moving.forEach(n=>this.turnLayer.append(n));
 if(reduced){await new Promise(resolve=>setTimeout(resolve,100));}
 else if(typeof this.turnLayer.animate==='function'){const animation=this.turnLayer.animate([{transform:'rotate3d(0,0,0,0deg)'},{transform:`rotate${axisName}(${angle}deg)`}],{duration:210,easing:'cubic-bezier(.22,.8,.25,1)',fill:'forwards'});await animation.finished.catch(()=>{});animation.cancel();}
 else{this.turnLayer.style.transform=`rotate${axisName}(${angle}deg)`;await new Promise(resolve=>setTimeout(resolve,210));}
 c.move(m);
 moving.forEach(n=>{this.el.append(n);n.classList.remove('turning');});
 this.turnLayer.style.transform='';
 this.render(c);this.busy=false;return true;
 }
}
