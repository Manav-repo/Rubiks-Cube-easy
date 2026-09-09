// Runs in the head to avoid a light-theme flash before the page is painted.
(function(){
const media=matchMedia('(prefers-color-scheme: dark)');
function apply(){document.documentElement.dataset.theme=media.matches?'dark':'light';document.documentElement.style.colorScheme=document.documentElement.dataset.theme;}
apply();media.addEventListener('change',apply);
// Keep the existing API for callers; appearance is exclusively device-controlled.
// Old manual preferences are ignored without touching saved learning/solver data.
window.CubeTheme={set(){apply();},isDark:()=>document.documentElement.dataset.theme==='dark'};
})();
