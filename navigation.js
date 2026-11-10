'use strict';
(() => {
 const header=document.querySelector('.nav'), nav=document.getElementById('primary-nav'), button=document.querySelector('.menu-toggle');
 if(!header||!nav||!button)return;
 const mobile=matchMedia('(max-width:760px)');
 let open=false;

 function getFocusableElements(){
  return [...header.querySelectorAll('a,button')].filter(el=>el.getClientRects().length && !el.closest('[inert]')); 
 }

 function render(){
  button.setAttribute('aria-expanded',String(open));
  header.classList.toggle('menu-open',open);
  nav.inert=mobile.matches&&!open;
  button.setAttribute('aria-label',document.documentElement.lang==='ja'?(open?'メニューを閉じる':'メニューを開く'):(open?'Close menu':'Open menu'));
  if(open && mobile.matches && !header.contains(document.activeElement)){
   const firstLink = nav.querySelector('a');
   firstLink?.focus();
  }
 }

 function close(restore=false){
  if(!open) return;
  open=false;
  render();
  if(restore) button.focus();
 }

 header.classList.add('nav-enhanced');
 render();

 button.addEventListener('click',()=>{
  open=!open;
  render();
  if(open)nav.querySelector('a')?.focus();
  if(!open) button.focus();
 });

 // Keydown handling: Escape to close + Focus trap
 document.addEventListener('keydown', e => {
  if (!open || !mobile.matches) return;

  if (e.key === 'Escape') {
   e.preventDefault();
   close(true);
   return;
  }

  if (e.key === 'Tab') {
   const focusables = getFocusableElements();
   const first = focusables[0];
   const last = focusables[focusables.length - 1];

   if (e.shiftKey) {
    if (document.activeElement === first || !header.contains(document.activeElement)) {
     e.preventDefault();
     last.focus();
    }
   } else {
    if (document.activeElement === last || !header.contains(document.activeElement)) {
     e.preventDefault();
     first.focus();
    }
   }
  }
 });

 document.addEventListener('click',e=>{if(open&&!header.contains(e.target))close(true);});
 document.addEventListener('focusin',e=>{if(open&&mobile.matches&&!header.contains(e.target))close(true);});
 nav.addEventListener('click',e=>{if(e.target.closest('a'))close();});
 mobile.addEventListener('change',()=>{open=false;render();});
 document.addEventListener('wingscraft:language',render);
})();
