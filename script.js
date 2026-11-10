'use strict';
(() => {
 const root=document.documentElement;
 const translations={
  index:['Home — Wingscraft','Independent software development in Tokyo. Websites, applications and workflow automation.'],
  about:['Studio — Wingscraft','An independent software studio in Tokyo. Founded 9 November 2026 by Sakurai Yusei and Damlanur Dağhan.'],
  services:['Services — Wingscraft','Websites, web applications and automation, from discovery to launch and ongoing improvement.'],
  projects:['Wingscraft Booking — Projects','Explore the concept and development plans for Wingscraft Booking, software for small businesses.'],
  examples:['Work — Wingscraft','Explore independent studies: a small-business website, an inquiry desk and a booking desk.'],
  privacy:['Privacy — Wingscraft','How inquiry information is used and how to contact Wingscraft.'],
  contact:['Contact — Wingscraft','Discuss website development, workflow automation or booking tools with Wingscraft.'],
  journal:['Notes — Wingscraft','Design notes, architectural thoughts and engineering studies from Wingscraft.'],
  404:['404 Not Found — Wingscraft','The page you are looking for could not be found.']
 };
 const original=[document.title,document.querySelector('meta[name=description]')?.content||''];
 const page=document.body.className.replace('page-','');

 // --- Language switcher ---
 const setLanguage=lang=>{
  root.lang=lang;
  document.getElementById('back-to-top')?.setAttribute('aria-label',lang==='ja'?'ページトップへ戻る':'Back to top');
  const nav=document.querySelector('nav');
  if(nav)nav.setAttribute('aria-label',lang==='en'?'Pages':'ページ');
  const meta=lang==='en'?(translations[page]||original):original;
  document.title=meta[0];
  for(const selector of ['meta[name=description]','meta[property="og:description"]']){
   const el=document.querySelector(selector);
   if(el)el.content=meta[1];
  }
  const ogTitle=document.querySelector('meta[property="og:title"]');
  if(ogTitle)ogTitle.content=meta[0];
  const ogLoc=document.querySelector('meta[property="og:locale"]');
  if(ogLoc)ogLoc.content=lang==='en'?'en_US':'ja_JP';
  const ogLocAlt=document.querySelector('meta[property="og:locale:alternate"]');
  if(ogLocAlt)ogLocAlt.content=lang==='en'?'ja_JP':'en_US';
  const langBtn=document.getElementById('lang');
  if(langBtn)langBtn.setAttribute('aria-label',lang==='en'?'Switch to Japanese':'Switch to English');
 };
 setLanguage(root.lang==='ja'?'ja':'en');

 const privacy=document.getElementById('privacy-provider');
 const privacyText=()=>{
  const policy=document.getElementById('provider-policy');
  if(policy)policy.hidden=!window.WINGSCRAFT_CONFIG?.formspreeEndpoint;
  if(privacy)privacy.textContent=window.WINGSCRAFT_CONFIG?.formspreeEndpoint?(root.lang==='ja'?'サイト内送信にはFormspreeを使用します。送信内容は同サービスでも処理・保管されるため、同サービスのプライバシーポリシーもご確認ください。':'Direct submissions use Formspree. The provider also processes and stores submissions; please review its privacy policy.'):(root.lang==='ja'?'現在のお問い合わせは、メールソフトを通じた送信方式です。':'Inquiries currently use your mail app.');
 };
 privacyText();
 document.addEventListener('wingscraft:language',privacyText);

 const langBtn=document.getElementById('lang');
 if(langBtn){
  langBtn.addEventListener('click',()=>{
   setLanguage(root.lang==='ja'?'en':'ja');
   try{localStorage.setItem('wingscraft-language-choice',root.lang)}catch{}
   document.dispatchEvent(new CustomEvent('wingscraft:language'));
  });
 }

 // --- Back to top button ---
 const backToTop=document.getElementById('back-to-top');
 if(backToTop){
  window.addEventListener('scroll',()=>{
   if(window.scrollY>400)backToTop.classList.add('is-visible');
   else backToTop.classList.remove('is-visible');
  },{passive:true});
  backToTop.addEventListener('click',()=>{
   window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  });
 }

 // --- Dynamic Copyright Year ---
 const currentYear = String(new Date().getFullYear());
 document.querySelectorAll('.copyright').forEach(el => {
  el.childNodes.forEach(node => {
   if(node.nodeType === 3 && node.textContent.includes('©')) {
    node.textContent = node.textContent.replace(/©\s*\d{4}/, `© ${currentYear}`);
   } else if (node.nodeType === 1 && node.textContent.includes('©')) {
    node.textContent = node.textContent.replace(/©\s*\d{4}/, `© ${currentYear}`);
   }
  });
 });

 // --- One-click Email Copy ---
 document.querySelectorAll('a[href^="mailto:wingscraft.studio@gmail.com"]').forEach(link => {
  if (link.closest('.email-copy-wrap')) return;
  const wrap = document.createElement('span');
  wrap.className = 'email-copy-wrap';
  link.parentNode.insertBefore(wrap, link);
  wrap.appendChild(link);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'copy-email-btn';
  btn.setAttribute('aria-label', root.lang==='ja'?'メールアドレスをコピー':'Copy email address');
  btn.innerHTML = `<span aria-hidden="true">📋</span><span>${root.lang==='ja'?'コピー':'Copy'}</span>`;

  const toast = document.createElement('span');
  toast.className = 'copy-toast';
  toast.setAttribute('role','status');
  wrap.appendChild(btn);
  wrap.appendChild(toast);

  btn.addEventListener('click', async (e) => {
   e.preventDefault();
   e.stopPropagation();
   try {
    await navigator.clipboard.writeText('wingscraft.studio@gmail.com');
    toast.textContent = root.lang==='ja'?'コピーしました！':'Copied!';
    toast.classList.add('show');
    setTimeout(() => {toast.classList.remove('show');toast.textContent='';}, 1800);
   } catch {
    toast.textContent=root.lang==='ja'?'コピーできませんでした。アドレスを選択してコピーしてください。':'Could not copy. Select and copy the address manually.';
    toast.classList.add('show');
   }
  });

 });

 document.addEventListener('wingscraft:language',()=>{
  document.querySelectorAll('.copy-email-btn').forEach(btn=>{btn.setAttribute('aria-label',root.lang==='ja'?'メールアドレスをコピー':'Copy email address');btn.querySelector('span:last-child').textContent=root.lang==='ja'?'コピー':'Copy';});
 });

 // --- Service Worker Registration (PWA Offline Capability) ---
 if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
   navigator.serviceWorker.register('sw.js', {updateViaCache:'none'}).catch(() => {});
  });
 }

 // --- Privacy-first Analytics beacon injection ---
 const cfToken=window.WINGSCRAFT_CONFIG?.cloudflareAnalyticsToken;
 if(cfToken&&typeof cfToken==='string'&&cfToken.trim()!==''){
  const s=document.createElement('script');
  s.defer=true;
  s.src='https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon',JSON.stringify({token:cfToken.trim()}));
  document.head.appendChild(s);
 }

 if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  root.classList.add('motion-ready');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}
  }),{threshold:.06});
  document.querySelectorAll('.rv').forEach(el=>observer.observe(el));
 }
})();

// Local demonstrations. No network requests, storage or booking submission.
(() => {
 document.querySelectorAll('input[name="demo-slot"]').forEach(input=>input.addEventListener('change',()=>{
  const selected=document.getElementById('selected-slot');
  if(selected)selected.textContent=input.value;
 }));
})();
