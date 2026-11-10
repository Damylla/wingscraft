'use strict';
(() => {
 const root=document.documentElement;
 const status=document.getElementById('menu-status');
 let filter='all';
 function update(){
  document.title=root.lang==='ja'?'Sumi Coffee — 自主制作 | Wingscraft':'Sumi Coffee — Independent concept | Wingscraft';
  document.querySelector('nav').setAttribute('aria-label',root.lang==='ja'?'ページ内メニュー':'Page navigation');
  document.querySelector('.menu-filters').setAttribute('aria-label',root.lang==='ja'?'メニューの絞り込み':'Filter the menu');
  document.getElementById('sample-language').setAttribute('aria-label',root.lang==='ja'?'Switch to English':'Switch to Japanese');
  const count=[...document.querySelectorAll('[data-category]')].filter(el=>!el.hidden).length;
  status.textContent=root.lang==='ja'?`${count}件のメニューを表示しています。`:`Showing ${count} menu items.`;
 }
 document.getElementById('sample-language').addEventListener('click',()=>{root.lang=root.lang==='ja'?'en':'ja';try{localStorage.setItem('wingscraft-language-choice',root.lang)}catch{}update()});
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  filter=button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
  document.querySelectorAll('[data-category]').forEach(el=>el.hidden=filter!=='all'&&el.dataset.category!==filter);
  update();
 }));update();
})();
