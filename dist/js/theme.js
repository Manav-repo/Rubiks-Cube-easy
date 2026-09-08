// Runs in the head to avoid a light-theme flash before the page is painted.
(function(){let choice=null;try{choice=localStorage.getItem('cube-brainiac-theme');}catch{}
const media=matchMedia('(prefers-color-scheme: dark)');
function apply(value){document.documentElement.dataset.theme=value==='dark'||value!=='light'&&media.matches?'dark':'light';document.documentElement.style.colorScheme=document.documentElement.dataset.theme;}
apply(choice);media.addEventListener('change',()=>{let value=null;try{value=localStorage.getItem('cube-brainiac-theme');}catch{}if(!value)apply(null);});
window.CubeTheme={set(value){try{if(value)localStorage.setItem('cube-brainiac-theme',value);else localStorage.removeItem('cube-brainiac-theme');}catch{}apply(value);},isDark:()=>document.documentElement.dataset.theme==='dark'};
})();
