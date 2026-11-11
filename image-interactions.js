'use strict';
(() => {
 const images='img,svg,picture';
 const imageLink=target=>target.closest?.('a')?.querySelector(images);
 const isImage=target=>Boolean(target.closest?.(images)||imageLink(target));
 document.addEventListener('contextmenu',event=>{
  if(isImage(event.target))event.preventDefault();
 });
 document.addEventListener('dragstart',event=>{
  if(isImage(event.target))event.preventDefault();
 });
 document.querySelectorAll(images).forEach(image=>{
  image.setAttribute('draggable','false');
  const link=image.closest('a');
  if(link){link.setAttribute('draggable','false');link.classList.add('image-link');}
 });
})();
