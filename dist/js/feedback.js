/* Manually maintained camera fund. No balance API or analytics. */
(()=>{
 const raised=459, goal=1000;
 const recipient='manav.uix@gmail.com';
 const amount=document.getElementById('camera-fund-amount');
 const progress=document.getElementById('camera-fund-progress');
 amount.textContent='$'+raised.toLocaleString('en-US')+' toward my $'+goal.toLocaleString('en-US')+' goal';
 progress.max=goal;
 progress.value=Math.max(0,Math.min(raised,goal));
 progress.setAttribute('aria-valuetext',amount.textContent);
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
  document.getElementById('feedback-status').textContent='Your email app should open. Review the draft and press Send there. If it does not open, copy your message and email manav.uix@gmail.com.';
 });
})();
