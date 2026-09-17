/* Manually maintained camera fund. No balance API or analytics. */
(()=>{
 const raised=448, goal=950; // Owner's latest reference amounts; manually maintained.
 const recipient='manav.uix@gmail.com';
 for(const prefix of ['camera-fund','completion-fund']){
 const amount=document.getElementById(prefix+'-amount');
 const progress=document.getElementById(prefix+'-progress');
 amount.textContent='$'+raised+' of $'+goal+' raised';
 progress.value=raised;
 progress.max=goal;
 progress.setAttribute('aria-valuetext',raised+' of '+goal+' dollars raised');
 }
 const dialog=document.getElementById('feedback-dialog');
 const opener=document.getElementById('feedback-open');
 const form=document.getElementById('feedback-form');
 const message=document.getElementById('feedback-message');
 const mobile=matchMedia('(max-width:680px)');
 const present=card=>CubePanels.open(card,mobile.matches);
 opener.addEventListener('click',()=>present(dialog));
 document.getElementById('feedback-close').addEventListener('click',()=>CubePanels.close(dialog));
 dialog.addEventListener('cancel',event=>event.preventDefault());
 dialog.addEventListener('close',()=>{if(!CubePanels.active)document.getElementById('settings-toggle').focus();});
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
 const formSlot=document.createComment('feedback form position');
 form.before(formSlot);
 const feedbackView=document.createElement('div');
 feedbackView.hidden=true;
 completion.append(feedbackView);
 const feedbackHeading=document.createElement('h2');
 feedbackHeading.id='completion-feedback-title';
 feedbackHeading.textContent='Share your feedback';
 feedbackView.append(feedbackHeading);
 const completionContent=[...completion.children].filter(el=>el.id!=='completion-close'&&el!==feedbackView);
 function restoreCompletion(){
  formSlot.after(form);
  feedbackView.hidden=true;
  completionContent.forEach(el=>el.hidden=false);
  completion.style.height='';
  completion.setAttribute('aria-labelledby','completion-title');
 }
 const key='cube-easy-support-prompt-last-shown';
 const week=7*24*60*60*1000;
 let shown=false, timer=null, returnFocus=null;
 function coolingDown(){try{const stamp=Number(localStorage.getItem(key));return Number.isFinite(stamp)&&stamp>0&&Date.now()-stamp<week;}catch{return shown;}}
 shown=coolingDown();
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
    if(!complete()||document.hidden||CubePanels.active||coolingDown())return;
    shown=true;
    try{localStorage.setItem(key,String(Date.now()));}catch{}
    returnFocus=document.activeElement;
    present(completion);
   },3000);
  }
  wasComplete=now;
 }
 new MutationObserver(observeCompletion).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','disabled']});
 document.addEventListener('visibilitychange',observeCompletion);
 document.getElementById('completion-close').addEventListener('click',()=>CubePanels.close(completion));
 completion.addEventListener('cancel',event=>event.preventDefault());
 completion.addEventListener('panelclosed',restoreCompletion);
 completion.addEventListener('close',()=>{if(!CubePanels.active&&returnFocus?.isConnected&&!returnFocus.disabled)returnFocus.focus();});
 document.getElementById('completion-feedback').addEventListener('click',()=>{
  completion.style.height=completion.getBoundingClientRect().height+'px';
  completionContent.forEach(el=>el.hidden=true);
  feedbackView.append(form);
  feedbackView.hidden=false;
  completion.setAttribute('aria-labelledby','completion-feedback-title');
  message.focus();
 });
 // A viewport change must also remove/add native modality, not just move the box.
 mobile.addEventListener('change',()=>{
  for(const card of [completion,dialog])if(card.open)CubePanels.reflow(card,mobile.matches);
 });
})();
