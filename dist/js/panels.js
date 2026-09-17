/* One owner for all transient app panels; game state is independent. */
(()=>{
 let active=null;
 const settings=document.getElementById('settings');
 const toggle=document.getElementById('settings-toggle');
 function close(panel=active){
  if(!panel)return;
  if(active===panel)active=null;
  if(panel instanceof HTMLDialogElement)panel.close();else panel.hidden=true;
  if(panel===settings)toggle.setAttribute('aria-expanded','false');
  panel.dispatchEvent(new Event('panelclosed'));
 }
 function open(panel,modal=false){
  if(active===panel)return;
  close();
  active=panel;
  if(panel instanceof HTMLDialogElement){if(modal)panel.showModal();else panel.show();}
  else panel.hidden=false;
  if(panel===settings)toggle.setAttribute('aria-expanded','true');
 }
 function reflow(panel,modal){
  if(active!==panel)return;
  panel.close();
  if(modal)panel.showModal();else panel.show();
 }
 document.querySelectorAll('dialog').forEach(panel=>panel.addEventListener('close',()=>{
  if(!panel.open&&active===panel){active=null;panel.dispatchEvent(new Event('panelclosed'));}
 }));
 window.CubePanels={open,close,reflow,get active(){return active;}};
})();
