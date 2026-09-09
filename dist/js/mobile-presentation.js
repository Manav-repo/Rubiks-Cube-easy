/* Presentation only: relocate existing nodes, keeping their IDs and handlers. */
(()=>{
 const mobile=matchMedia('(max-width:680px)');
 const objective=document.querySelector('.objective');
 const support=document.getElementById('support-links');
 const objectiveSlot=document.createComment('Objective desktop / Learn position');
 const supportSlot=document.createComment('Support desktop footer position');
 objective.before(objectiveSlot);support.before(supportSlot);
 const workspace=document.querySelector('.workspace');
 const header=document.querySelector('.header-right');
 const settings=document.getElementById('settings-toggle');
 function sync(){
  const playback=mobile.matches&&document.body.classList.contains('playback');
  if(playback&&objective.parentElement!==workspace)workspace.prepend(objective);
  else if(!playback&&objective.parentNode!==objectiveSlot.parentNode)objectiveSlot.after(objective);
  if(mobile.matches&&support.parentElement!==header)header.insertBefore(support,settings);
  else if(!mobile.matches&&support.parentNode!==supportSlot.parentNode)supportSlot.after(support);
 }
 mobile.addEventListener('change',sync);
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
 sync();
})();
