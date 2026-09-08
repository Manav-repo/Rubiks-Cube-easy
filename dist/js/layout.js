/* Cube mechanics always use face IDs, never pigment names. Mirrored center
   arrangements change only the face-to-pigment map, not turn direction. */
(function(root){
 const standard={U:'Yellow',R:'Red',F:'Green',D:'White',L:'Orange',B:'Blue'};
 const normal={Yellow:'#f6d74a',Red:'#ed7159',Green:'#6bae76',White:'#fffef5',Orange:'#f3a755',Blue:'#659bd9'};
 const accessible={Yellow:'#f0e442',Red:'#cc79a7',Green:'#009e73',White:'#fffef5',Orange:'#e69f00',Blue:'#0072b2'};
 const names=layout=>({...standard,...(layout==='orange-right'?{R:'Orange',L:'Red'}:{})});
 const blank=()=>[...'URFDLB'].map(f=>'????'+f+'????').join('');
 const encode=(colors,layout)=>{const reverse=Object.fromEntries(Object.entries(names(layout)).map(([f,c])=>[c,f]));return colors.map(c=>reverse[c]||'?').join('');};
 const decode=(s,layout)=>[...s].map(f=>names(layout)[f]||null);
 root.CubeLayout={names,normal,accessible,blank,encode,decode};
 if(typeof module!=='undefined')module.exports=root.CubeLayout;
})(typeof window!=='undefined'?window:globalThis);
