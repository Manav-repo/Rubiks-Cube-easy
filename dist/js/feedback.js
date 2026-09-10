/* Manually maintained camera fund. No balance API or analytics. */
(()=>{
 const raised=459, goal=1000;
 const recipient='manav.uix@gmail.com';
 for(const prefix of ['camera-fund','completion-fund']){
 const amount=document.getElementById(prefix+'-amount');
 const progress=document.getElementById(prefix+'-progress');
 amount.textContent='$'+raised+' of $'+goal+' raised';
 progress.max=goal;
 progress.value=Math.max(0,Math.min(raised,goal));
 progress.setAttribute('aria-valuetext',amount.textContent);
 }
 const dialog=document.getElementById('feedback-dialog');
 const opener=document.getElementById('feedback-open');
 const form=document.getElementById('feedback-form');
 const message=document.getElementById('feedback-message');
 opener.addEventListener('click',()=>dialog.showModal());
 document.getElementById('feedback-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>opener.focus());
 message.addEventListener('input',()=>message.setCustomValidity(''));
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const body=message.value.trim();
  message.setCustomValidity(body?'':'Please write a short message.');
  if(!form.reportValidity())return;
  const draft='mailto:'+recipient+'?subject='+encodeURIComponent('Cube Easy feedback')+'&body='+encodeURIComponent(body);
  window.location.href=draft;
 });
 // Observe completion without modifying any game model, math or handler.
 const completion=document.getElementById('completion-dialog');
 const key='cube-easy-support-prompt-shown';
 let shown=false, timer=null, returnFocus=null;
 try{shown=sessionStorage.getItem(key)==='1';}catch{}
 const complete=()=>document.body.classList.contains('playback') &&
  document.getElementById('solution-caption').textContent==='All six faces match. Nice work!' &&
  !document.getElementById('playback-speed').disabled;
 let wasComplete=complete(); // Restored finished games do not trigger a request.
 function observeCompletion(){
  const now=complete();
  if(!now||document.hidden){clearTimeout(timer);timer=null;}
  if(now&&!wasComplete&&!shown&&!document.hidden){
   clearTimeout(timer);
   timer=setTimeout(()=>{
    timer=null;
    if(!complete()||document.hidden||document.querySelector('dialog[open]'))return;
    shown=true;
    try{sessionStorage.setItem(key,'1');}catch{}
    returnFocus=document.activeElement;
    completion.showModal();
   },3000);
  }
  wasComplete=now;
 }
 new MutationObserver(observeCompletion).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','disabled']});
 document.addEventListener('visibilitychange',observeCompletion);
 document.getElementById('completion-close').addEventListener('click',()=>completion.close());
 completion.addEventListener('close',()=>{if(returnFocus?.isConnected&&!returnFocus.disabled)returnFocus.focus();});
 document.getElementById('completion-feedback').addEventListener('click',()=>{
  completion.close();
  dialog.showModal();
 });
})();
