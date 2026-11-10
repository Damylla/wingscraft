'use strict';
(()=>{
 const select=document.getElementById('workflow-sample'),run=document.getElementById('run-demo');
 if(!select||!run)return;
 const result=document.getElementById('workflow-result'),status=document.getElementById('workflow-status');
 let stage='ready',timer;
 const copy={ja:{choices:['Webサイト制作の相談','予約ツールの相談'],messages:['小さなカフェの紹介サイトを作りたいです。来月の公開を希望しています。','サロンの予約を電話で受けています。Webから受付できるようにしたいです。'],fields:['ご相談の種類','ご希望・課題','次の対応'],values:[['Webサイト制作','来月の公開を希望','ページ数と掲載内容を確認'],['予約ツール','電話予約をWeb受付に変更','メニューと予約枠を確認']],button:'自動で整理する',again:'もう一度試す',busy:'相談内容を整理しています…',done:'3つの項目に整理しました。次に確認することが分かります。',notice:'通知プレビュー：新しい相談が1件、確認待ちです。'},en:{choices:['Website inquiry','Booking tool inquiry'],messages:['I would like a website for my small café, ideally launching next month.','We take salon bookings by phone. I would like customers to book online.'],fields:['Inquiry type','Request or challenge','Next action'],values:[['Website','Launch next month','Confirm pages and content'],['Booking tool','Move phone bookings online','Confirm services and time slots']],button:'Organise automatically',again:'Try again',busy:'Organising the inquiry…',done:'Organised into three fields, with a clear next action.',notice:'Notification preview: One new inquiry is waiting for review.'}};
 const render=()=>{
  const c=copy[document.documentElement.lang==='ja'?'ja':'en'],index=Number(select.value)||0;
  select.replaceChildren(...c.choices.map((text,i)=>new Option(text,String(i),false,i===index)));
  document.getElementById('workflow-input').textContent=c.messages[index];
  run.textContent=stage==='busy'?c.busy:stage==='done'?c.again:c.button;
  run.disabled=select.disabled=stage==='busy';
  status.textContent=stage==='busy'?c.busy:stage==='done'?c.done:'';
  result.hidden=stage!=='done';
  const fields=document.getElementById('workflow-fields');fields.replaceChildren();
  c.fields.forEach((text,i)=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=text;dd.textContent=c.values[index][i];row.append(dt,dd);fields.append(row)});
  document.getElementById('workflow-notification').textContent=c.notice;
 };
 select.addEventListener('change',()=>{clearTimeout(timer);stage='ready';render()});
 run.addEventListener('click',()=>{stage='busy';render();timer=setTimeout(()=>{stage='done';render()},matchMedia('(prefers-reduced-motion: reduce)').matches?0:650)});
 document.addEventListener('wingscraft:language',render);render();
})();
