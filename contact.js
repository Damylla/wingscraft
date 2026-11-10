'use strict';
(() => {
 const form=document.getElementById('contact-form'); if(!form)return;
 const service=document.getElementById('service'), message=document.getElementById('message');
 const status=document.getElementById('form-status'), submit=document.getElementById('send-inquiry');
 const endpoint=window.WINGSCRAFT_CONFIG?.formspreeEndpoint || '';
 const direct=window.WingscraftTransport.validEndpoint(endpoint);
 const labels={general:['まずは相談したい','Not sure yet'],web:['Webサイト制作','Website development'],automation:['業務の自動化','Workflow automation'],booking:['予約ツール開発','Booking tool development']};
 const params=new URLSearchParams(location.search);
 if(Object.hasOwn(labels,params.get('service'))) service.value=params.get('service');
 const references={sumi:'Sumi Coffee',inquiries:'Inquiry desk',booking:'Booking desk'};
 const example=Object.hasOwn(references,params.get('example'))?references[params.get('example')]:'';
 let state='',busy=false;
 const t=(ja,en)=>document.documentElement.lang==='ja'?ja:en;
 const notices={
  sending:['送信しています。このままお待ちください。','Sending your inquiry. Please wait.'],
  success:['送信サービスがご相談を受け付けました。内容を確認してご連絡します。','The delivery service has accepted your inquiry. We will review it and get back to you.'],
  rejected:['送信できませんでした。入力内容は残っています。内容を確認して再度お試しいただくか、メールでご連絡ください。','The inquiry could not be submitted. Your entries are still here. Review them and try again, or email us directly.'],
  uncertain:['送信結果を確認できませんでした。入力内容は残っています。重複送信を避けるため、再送の前に時間をおくか、メールでお問い合わせください。','We could not confirm the result. Your entries are still here. To avoid duplicates, wait before trying again or contact us by email.'],
  limited:['送信回数の制限に達しました。少し時間をおいてお試しいただくか、メールでご連絡ください。','The submission limit was reached. Please wait before trying again, or email us directly.'],
  mail:['メールソフトへの引き渡しを試みました。まだ送信されていません。開いた画面で確認して送信してください。開かない場合は、内容をコピーしてメールに貼り付けられます。','We attempted to open your mail app. Nothing has been sent. Review and send the email there. If no app opens, copy the message and paste it into an email.'],
  copied:['内容をコピーしました。メールに貼り付けて送信できます。','Copied. Paste the message into an email to send it.'],
  copyFailed:['自動コピーできませんでした。入力内容を手動でコピーしてください。','Automatic copying was unavailable. Please copy the entries manually.'],
  blocked:['送信を開始できませんでした。ページを再読み込みするか、メールでご連絡ください。','The submission could not start. Reload the page or contact us by email.']
 };

 // --- Draft Auto-save ---
 const DRAFT_KEY = 'wingscraft-contact-draft';
 try{localStorage.removeItem(DRAFT_KEY)}catch{}
 function saveDraft(){
  try {
   const data = {
    service: service.value,
    name: form.elements.name.value,
    email: form.elements.email.value,
    company: form.elements.company.value,
    message: form.elements.message.value
   };
   if (data.name || data.email || data.company || data.message) {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
   } else {
    sessionStorage.removeItem(DRAFT_KEY);
   }
  } catch {}
 }

 function clearDraft(){
  try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
  const banner = document.getElementById('draft-banner');
  if (banner) banner.remove();
 }

 function restoreDraft(){
  try {
   const raw = sessionStorage.getItem(DRAFT_KEY);
   if (!raw) return;
   const data = JSON.parse(raw);
   if (!data) return;
   if (!params.get('service') && data.service && Object.hasOwn(labels, data.service)) service.value = data.service;
   if (data.name) form.elements.name.value = data.name;
   if (data.email) form.elements.email.value = data.email;
   if (data.company) form.elements.company.value = data.company;
   if (data.message) form.elements.message.value = data.message;

   if (data.name || data.email || data.company || data.message) {
    showDraftBanner();
   }
  } catch {}
 }

 function showDraftBanner(){
  if (document.getElementById('draft-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'draft-banner';
  banner.className = 'draft-banner';
  banner.setAttribute('role', 'status');
  updateDraftBannerText(banner);
  form.insertBefore(banner, form.firstElementChild.nextElementSibling);
 }

 function updateDraftBannerText(banner){
  if (!banner) banner = document.getElementById('draft-banner');
  if (!banner) return;
  const ja = document.documentElement.lang === 'ja';
  banner.innerHTML = `<span>${ja ? 'このタブでの入力内容を復元しました。' : 'Restored the draft from this tab.'}</span><button type="button" id="clear-draft-btn">${ja ? '下書きを消去' : 'Clear draft'}</button>`;
  banner.querySelector('#clear-draft-btn')?.addEventListener('click', () => {
   form.elements.name.value = '';
   form.elements.email.value = '';
   form.elements.company.value = '';
   form.elements.message.value = '';
   clearDraft();
   updateCharCount();
   message.focus();
  });
 }

 form.addEventListener('input', saveDraft);
 service.addEventListener('change', saveDraft);

 // --- Character Counter & Template Insertion ---
 const charCountEl = document.getElementById('char-count');
 const templateBtn = document.getElementById('insert-template-btn');
 const MAX_CHARS = 3000;

 function updateCharCount(){
  if (!charCountEl) return;
  const currentLen = message.value.length;
  const remaining = Math.max(0, MAX_CHARS - currentLen);
  const ja = document.documentElement.lang === 'ja';
  charCountEl.textContent = ja ? `残り ${remaining.toLocaleString()} 文字` : `${remaining.toLocaleString()} characters left`;
  charCountEl.classList.toggle('warning', remaining <= 200);
 }

 message.addEventListener('input', updateCharCount);

 const templates = {
  ja: `【ご相談の背景・実現したいこと】\n（例：現在、予約受付や問い合わせの管理を手作業で行っており、改善したいと考えています。）\n\n【希望する時期・ご予算の目安】\n・希望時期：\n・予算感：\n\n【現在の状況・参考サイトなど】\n（現在のサイトやツールのURLなどがあればご記入ください）`,
  en: `[Background & Goals]\n(e.g., We currently handle bookings/inquiries manually and would like to build a clearer system.)\n\n[Target Timing & Budget]\n- Target timeline:\n- Estimated budget:\n\n[Current Setup or Reference Links]\n(Please share any current websites or tools if available)`
 };

 if (templateBtn) {
  templateBtn.addEventListener('click', () => {
   const ja = document.documentElement.lang === 'ja';
   const template = ja ? templates.ja : templates.en;
   if (message.value.trim() !== '') {
    if (!confirm(ja ? '現在の入力内容をテンプレートで上書きしますか？' : 'Overwrite current message with the template?')) return;
   }
   message.value = template;
   updateCharCount();
   saveDraft();
   message.focus();
  });
 }

 // --- Thank You Card View ---
 let successCard = null;
 function showSuccessCard(){
  form.style.display = 'none';
  if(!successCard){
   successCard = document.createElement('div');
   successCard.className = 'form-success-card';
   successCard.tabIndex=-1;
   successCard.setAttribute('role','status');
   form.parentNode.insertBefore(successCard, form);
  }
  const ja = document.documentElement.lang === 'ja';
  successCard.innerHTML = `
   <div class="success-icon" aria-hidden="true">✓</div>
   <h3>${ja ? 'ご相談を受け付けました' : 'Thank You for Reaching Out'}</h3>
   <p>${ja ? '送信サービスがご相談を受け付けました。内容を確認してご連絡します。' : 'The delivery service has accepted your inquiry. We will review it and get back to you.'}</p>
   <button class="btn small" type="button" id="reset-form-btn">${ja ? '新しい相談を送る' : 'Send another inquiry'}</button>
  `;
  successCard.style.display = 'block';
  document.getElementById('reset-form-btn')?.addEventListener('click', () => {
   successCard.style.display = 'none';
   form.style.display = 'block';
   state = '';
   render();
   form.elements.name.focus();
  });
 }

 function render(){
  const ja=document.documentElement.lang==='ja';
  for(const option of service.options)option.textContent=option.dataset[ja?'ja':'en'];
  submit.textContent=busy?t('送信中…','Sending…'):direct?t('相談内容を送信する','Send your inquiry'):t('メールソフトで確認する','Review in mail app');
  document.getElementById('form-help').textContent=direct?t('入力内容を確認して送信してください。Wingscraft宛てにご相談をお送りします。','Review your details and submit your inquiry to Wingscraft.'):t('内容をまとめて、メールソフトで確認・送信できます。このページから直接送信はされません。','Prepare your inquiry here, then review and send it in your mail app. This page does not send the message itself.');
  message.placeholder=t('3,000文字以内。希望する時期や予算があれば、あわせてご記入ください。','Up to 3,000 characters. Include preferred timing or budget if you have them.');
  status.textContent=state?notices[state][ja?0:1]:'';
  status.dataset.state=state;
  updateDraftBannerText();
  updateCharCount();
  if(state === 'success') showSuccessCard();
 }
 function setState(value){state=value;render();}
 function bodyText(){const data=new FormData(form);return [t('ご相談の種類: ','Service: ')+labels[service.value][document.documentElement.lang==='ja'?0:1],t('お名前: ','Name: ')+data.get('name'),t('返信先: ','Reply email: ')+data.get('email'),t('事業名: ','Business: ')+data.get('company'),...(example?[t('参考の制作例: ','Reference concept: ')+example]:[]),'',data.get('message')].join('\r\n');}
 function lock(value){busy=value;for(const field of form.querySelectorAll('input,textarea,select,button'))field.disabled=value;form.setAttribute('aria-busy',String(value));render();}
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;for(const field of ['name','email','message'])form.elements[field].value=form.elements[field].value.trim();if(!form.reportValidity())return;
  if(form.elements._gotcha.value){setState('blocked');return;}
  if(!direct){const url='mailto:wingscraft.studio@gmail.com?subject='+encodeURIComponent(t('Wingscraftへのお問い合わせ','Project inquiry — Wingscraft'))+'&body='+encodeURIComponent(bodyText());setState('mail');location.href=url;return;}
  const data=Object.fromEntries(new FormData(form));data._subject='Wingscraft — '+labels[service.value][1];data.language=document.documentElement.lang;if(example)data.reference=example;
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
  lock(true);setState('sending');
  try{await window.WingscraftTransport.submit(endpoint,data,controller.signal);form.reset();clearDraft();setState('success');}
  catch(error){setState(error.message==='rate-limit'?'limited':error.message==='rejected'?'rejected':'uncertain');}
  finally{clearTimeout(timeout);lock(false);(state==='success'?successCard:status).focus({preventScroll:true});}
 });
 document.getElementById('copy-message').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('To: wingscraft.studio@gmail.com\r\n\r\n'+bodyText());setState('copied')}catch{setState('copyFailed')}});
 document.addEventListener('wingscraft:language',render);
 if(example){const note=document.createElement('p');note.className='field-help reference-note';note.textContent=t('参考の制作例: ','Reference concept: ')+example;service.after(note);document.addEventListener('wingscraft:language',()=>note.textContent=t('参考の制作例: ','Reference concept: ')+example);}
 restoreDraft();
 render();
})();
