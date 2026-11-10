'use strict';
(() => {
 const root=document.documentElement, kind=document.body.dataset.demo;
 const content=document.getElementById('demo-content'), stats=document.getElementById('demo-stats'), feedback=document.getElementById('demo-feedback');
 const resetDialog=document.getElementById('reset-dialog'), dialog=document.getElementById('booking-dialog');
 const t=(ja,en)=>root.lang==='ja'?ja:en;
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const pair=value=>value[root.lang==='ja'?0:1];
 const statuses={new:['未対応','New'],progress:['対応中','In progress'],done:['完了','Done']};
 const owners={unassigned:['未割り当て','Unassigned'],design:['デザイン担当','Design team'],support:['運用担当','Operations']};
 const people={a:['サンプル顧客 A','Sample customer A'],b:['サンプル顧客 B','Sample customer B'],c:['サンプル顧客 C','Sample customer C'],d:['サンプル顧客 D','Sample customer D']};
 const services={consult:{label:['個別相談','Consultation'],duration:30},meeting:{label:['初回ヒアリング','First meeting'],duration:60}};
 const dates=['2026-11-16','2026-11-17','2026-11-18'];
 const dateLabel=date=>new Intl.DateTimeFormat(root.lang==='ja'?'ja-JP':'en-GB',{month:'short',day:'numeric',weekday:'short',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
 const clock=minutes=>String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
 const mobile=matchMedia('(max-width:700px)');
 const detailDialog=document.getElementById('inquiry-dialog');
 let undoBooking=null,changedId=null,previousStats=[],listScroll=0;
 const slots=[600,630,660,690,780,810,840,870,900,930,960,990];
 let inquiries,bookings,active=1,filter='all',query='',day=dates[0],nextId=10,notice=null,openId=null,bookingDraft=null;
 function seed(){
  inquiries=[
   {id:1,company:['コトリ雑貨店','Kotori Goods'],subject:['店舗サイトを新しくしたい','A new website for our shop'],body:['商品と営業時間を見やすく伝えるサイトを考えています。スマートフォンで更新できる構成について相談したいです。','We would like a clear website for our products and opening hours. We are interested in a setup we can update from a phone.'],status:'new',owner:'unassigned',note:'',updates:0},
   {id:2,company:['ミドリ教室','Midori Classes'],subject:['レッスンの予約をまとめたい','Bring lesson bookings together'],body:['メールで受け付けている予約を一覧で確認したいです。時間の重複や変更の確認がしやすい管理画面を検討しています。','We currently accept bookings by email. We would like a single view that makes overlaps and changes easier to manage.'],status:'progress',owner:'support',note:'',updates:0},
   {id:3,company:['ノマ工房','Noma Workshop'],subject:['毎週の集計を自動化したい','Automate a weekly report'],body:['毎週、複数の表から数字を転記しています。集計から確認までの流れを整理できるか相談したいです。','We copy numbers from several spreadsheets every week. Could we simplify how the report is prepared and reviewed?'],status:'new',owner:'unassigned',note:'',updates:0},
   {id:4,company:['ソラスタジオ','Sora Studio'],subject:['既存フォームの改修について','Improve an existing form'],body:['問い合わせの種類によって担当者を分けたいです。今のフォームを活かしながら改修できるか教えてください。','We want to route inquiries to different people by subject. Can we build on our existing form?'],status:'done',owner:'design',note:'',updates:0}
  ];
  bookings=[{id:1,date:dates[0],start:600,service:'consult',person:'a',canceled:false},{id:2,date:dates[0],start:660,service:'meeting',person:'b',canceled:false},{id:3,date:dates[0],start:840,service:'consult',person:'c',canceled:false},{id:4,date:dates[1],start:780,service:'meeting',person:'d',canceled:false}];
  active=1;filter='all';query='';day=dates[0];nextId=10;undoBooking=null;changedId=null;previousStats=[];
 }
 function say(ja,en){notice=[ja,en];feedback.textContent=pair(notice);renderUndo();}
 function renderUndo(){const button=document.getElementById('undo-booking');button.hidden=!undoBooking;button.textContent=t('元に戻す','Undo cancellation');}
 function highlight(){if(changedId!==null){const el=content.querySelector(kind==='inquiries'?`[data-inquiry="${changedId}"]`:`[data-booking="${changedId}"]`);el?.classList.add('just-updated');const id=changedId;setTimeout(()=>{if(changedId===id)changedId=null;},1600);}}
 function statistic(label,value){return `<div class="stat"><span class="stat-label">${label}</span><strong>${value}</strong></div>`;}
 function renderStats(){
  if(kind==='inquiries')stats.innerHTML=statistic(t('未対応','New'),inquiries.filter(x=>x.status==='new').length)+statistic(t('対応中','In progress'),inquiries.filter(x=>x.status==='progress').length);
  else {const rows=bookings.filter(x=>x.date===day&&!x.canceled);stats.innerHTML=statistic(t('この日の予約','Bookings this day'),rows.length)+statistic(t('空き枠（30分単位）','Available 30-min slots'),slots.filter(start=>available(day,start,30)).length);}
  animateStats();
 }
 function animateStats(){const values=[...stats.querySelectorAll('strong')];values.forEach((el,i)=>{if(previousStats[i]!==undefined&&previousStats[i]!==el.textContent)el.classList.add('number-changed');});previousStats=values.map(el=>el.textContent);}
 function options(object,value){return Object.entries(object).map(([key,label])=>`<option value="${key}" ${key===value?'selected':''}>${esc(pair(label))}</option>`).join('');}
 function visibleInquiries(){const needle=query.trim().toLocaleLowerCase();return inquiries.filter(x=>(filter==='all'||x.status===filter)&&(!needle||[...x.subject,...x.company,...x.body].join(' ').toLocaleLowerCase().includes(needle)));}
 function captureInquiry(){const form=document.getElementById('inquiry-form');if(!form)return;const x=inquiries.find(x=>x.id===active);if(x){const draft={status:form.elements.status.value,owner:form.elements.owner.value,note:form.elements.note.value};if(draft.status===x.status&&draft.owner===x.owner&&draft.note===x.note)delete x.draft;else x.draft=draft;}}
 function renderInquiries(){
  if(detailDialog.open)detailDialog.close();detailDialog.replaceChildren();
  content.innerHTML=`<div class="desk"><section class="panel" aria-labelledby="list-title"><div class="panel-head"><h2 id="list-title">${t('受信トレイ','Inbox')}</h2></div><div class="toolbar"><label for="inquiry-search">${t('検索','Search')}<input id="inquiry-search" type="search" maxlength="100" value="${esc(query)}" placeholder="${t('店舗名・内容','Business or subject')}"></label><label for="inquiry-filter">${t('対応状況','Status')}<select id="inquiry-filter"><option value="all">${t('すべて','All statuses')}</option>${options(statuses,filter)}</select></label></div><div id="inquiry-list" class="inquiry-list"></div></section><section id="inquiry-detail" class="panel" aria-label="${t('問い合わせの詳細','Inquiry details')}"></section></div>`;
  document.getElementById('inquiry-filter').value=filter;
  document.getElementById('inquiry-search').addEventListener('input',e=>{captureInquiry();query=e.target.value;renderList();});
  document.getElementById('inquiry-filter').addEventListener('change',e=>{captureInquiry();filter=e.target.value;renderList();});
  document.getElementById('inquiry-list').addEventListener('click',e=>{const button=e.target.closest('[data-inquiry]');if(!button)return;captureInquiry();active=Number(button.dataset.inquiry);renderList();if(mobile.matches){listScroll=scrollY;detailDialog.showModal();}document.getElementById('detail-title').focus({preventScroll:false});});
  renderList();syncDetail();
 }
 function syncDetail(){if(kind!=='inquiries')return;const detail=document.getElementById('inquiry-detail');if(!detail)return;if(mobile.matches){if(!detailDialog.querySelector('.detail-close')){const close=document.createElement('button');close.type='button';close.className='quiet detail-close';close.textContent=t('← 一覧に戻る','← Back to inbox');close.addEventListener('click',()=>detailDialog.close());detailDialog.prepend(close);}detailDialog.append(detail);}else{if(detailDialog.open)detailDialog.close();document.querySelector('.desk').append(detail);}}
 function renderList(){
  const rows=visibleInquiries();if(!rows.some(x=>x.id===active))active=rows[0]?.id||null;
  document.getElementById('inquiry-list').innerHTML=rows.length?rows.map(x=>`<button type="button" class="inquiry-row" data-inquiry="${x.id}" aria-pressed="${x.id===active}"><span class="row-top"><span>${esc(pair(x.company))}</span><span class="status-chip status-${x.status}">${pair(statuses[x.status])}</span></span><strong>${esc(pair(x.subject))}</strong><span class="row-bottom">${t('担当：','Assigned: ')}${pair(owners[x.owner])}${x.draft?` <span class="draft-mark">· ${t('未反映','Unsaved')}</span>`:''}</span></button>`).join(''):`<p class="empty">${t('一致する問い合わせがありません。検索や絞り込みを変更してください。','No inquiries match. Try a different search or status.')}</p>`;
  renderDetail();highlight();
 }
 function renderDetail(){
  const x=inquiries.find(x=>x.id===active),detail=document.getElementById('inquiry-detail');
  if(!x){detail.innerHTML=`<p class="empty">${t('一覧から問い合わせを選ぶと、詳細を確認できます。','Select an inquiry from the list to see its details.')}</p>`;return;}
  const draft=x.draft||x;
  detail.innerHTML=`<div class="panel-head"><div class="detail-meta"><span>#00${x.id} · ${esc(pair(x.company))}</span><span class="status-chip status-${x.status}">${pair(statuses[x.status])}</span></div><h2 id="detail-title" tabindex="-1" style="margin-top:15px">${esc(pair(x.subject))}</h2></div><div class="detail-body"><p class="detail-message">${esc(pair(x.body))}</p><form id="inquiry-form"><div class="form-grid"><label for="detail-status">${t('対応状況','Status')}<select id="detail-status" name="status">${options(statuses,draft.status)}</select></label><label for="detail-owner">${t('担当者','Assigned to')}<select id="detail-owner" name="owner">${options(owners,draft.owner)}</select></label></div><label for="detail-note">${t('対応メモ（任意・300文字まで）','Internal note (optional, up to 300 characters)')}<textarea id="detail-note" name="note" maxlength="300">${esc(draft.note)}</textarea></label><div class="detail-actions"><button class="primary" type="submit">${t('変更を反映する','Apply changes')}</button><small id="draft-state" role="status">${x.draft?t('未反映の変更があります','Unsaved changes'):t('変更はありません','No pending changes')}</small></div></form></div>`;
  const form=document.getElementById('inquiry-form');
  form.addEventListener('input',()=>{captureInquiry();document.getElementById('draft-state').textContent=x.draft?t('未反映の変更があります','Unsaved changes'):t('変更はありません','No pending changes');});
  form.addEventListener('submit',e=>{e.preventDefault();captureInquiry();if(!x.draft){say('変更はありません。','No changes to apply.');return;}Object.assign(x,x.draft);delete x.draft;x.updates++;changedId=x.id;renderStats();renderList();if(detailDialog.open)detailDialog.close();else document.querySelector('#inquiry-form button')?.focus({preventScroll:true});say('変更を反映しました。','Changes applied.');});
 }
 function available(date,start,duration,exclude=null){
  const inHours=(start>=600&&start+duration<=720)||(start>=780&&start+duration<=1020);
  return inHours&&!bookings.some(x=>!x.canceled&&x.id!==exclude&&x.date===date&&start<x.start+services[x.service].duration&&start+duration>x.start);
 }
 function renderBookings(){
  const rows=bookings.filter(x=>x.date===day).sort((a,b)=>a.start-b.start||a.id-b.id);
  content.innerHTML=`<div class="booking-controls"><div class="day-picker" role="group" aria-label="${t('サンプルの日付','Sample dates')}">${dates.map(date=>`<button type="button" data-day="${date}" aria-pressed="${date===day}">${esc(dateLabel(date))}</button>`).join('')}</div><button class="primary" id="add-booking" type="button">${t('予約を追加','Add booking')}</button></div><div class="booking-layout"><section class="panel" aria-labelledby="schedule-title"><div class="panel-head"><h2 id="schedule-title">${esc(dateLabel(day))}</h2></div>${rows.length?rows.map(x=>`<article data-booking="${x.id}" class="appointment ${x.canceled?'canceled':''}"><time>${clock(x.start)}</time><div><h3>${esc(pair(people[x.person]))}</h3><p>${pair(services[x.service].label)} · ${services[x.service].duration}${t('分',' min')}${x.canceled?' · '+t('キャンセル済み','Canceled'):''}</p></div>${x.canceled?`<span class="status-chip">${t('取消','Canceled')}</span>`:`<button type="button" data-edit="${x.id}">${t('変更','Edit')}</button>`}</article>`).join(''):`<p class="empty">${t('この日の予約はありません。空き枠から追加できます。','No bookings for this day. Choose an available time to add one.')}</p>`}</section><aside class="panel availability"><h2>${t('空き枠から追加','Choose an available time')}</h2><p>${t('30分の相談枠','30-minute consultations')}</p><div class="available-slots">${slots.map(start=>`<button type="button" data-slot="${start}" ${available(day,start,30)?'':'disabled'} aria-label="${clock(start)} ${available(day,start,30)?t('空き','available'):t('予約済み','unavailable')}">${clock(start)}</button>`).join('')}</div><p class="sample-legend">${t('表示時刻は日本時間（JST）。12:00–13:00は休憩時間','Times are Japan Standard Time (JST). Lunch: 12:00–13:00')}</p></aside></div>`;
  content.querySelectorAll('[data-day]').forEach(button=>button.addEventListener('click',()=>{day=button.dataset.day;renderStats();renderBookings();content.querySelector(`[data-day="${day}"]`).focus();}));
  document.getElementById('add-booking').addEventListener('click',()=>openBooking());
  content.querySelectorAll('[data-edit]').forEach(button=>button.addEventListener('click',()=>openBooking(Number(button.dataset.edit))));
  content.querySelectorAll('[data-slot]').forEach(button=>button.addEventListener('click',()=>openBooking(null,Number(button.dataset.slot))));highlight();
 }
 function openBooking(id=null,start){
  openId=id;const current=bookings.find(x=>x.id===id);
  bookingDraft=current?{...current}:{date:day,start:start??slots.find(s=>available(day,s,30))??600,service:'consult',person:'a'};
  renderBookingDialog();dialog.showModal();
 }
 
 function downloadIcs(date, startMinutes, durationMinutes, title, desc){
  const stamp=value=>value.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const start=new Date(date+'T'+clock(startMinutes)+':00+09:00');
  const dtStart=stamp(start),dtEnd=stamp(new Date(start.getTime()+durationMinutes*60000));
  const escapeIcs=value=>String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,'\\$&');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wingscraft//Booking Demo//JA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wingscraft-${Date.now()}@wingscraft.dev`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:[DEMO] ${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(desc)}`,
    'LOCATION:Demo only - no real appointment',
    'STATUS:TENTATIVE',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wingscraft-booking-${date}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }

 function renderBookingDialog(){
  const x=bookingDraft;
  dialog.innerHTML=`<h2 id="booking-dialog-title">${openId?t('予約を変更','Edit booking'):t('予約を追加','Add booking')}</h2><p class="required-note">${t('すべてサンプル情報です。実際の予約は作成されません。','Sample details only. No real booking will be made.')}</p><form class="booking-form" id="booking-form"><label for="booking-person">${t('サンプル顧客','Sample customer')}<select name="person" id="booking-person">${options(people,x.person)}</select></label><label for="booking-service">${t('メニュー','Service')}<select name="service" id="booking-service">${Object.entries(services).map(([key,service])=>`<option value="${key}" ${key===x.service?'selected':''}>${pair(service.label)} · ${service.duration}${t('分',' min')}</option>`).join('')}</select></label><div class="form-grid"><label for="booking-date">${t('日付','Date')}<select name="date" id="booking-date">${dates.map(date=>`<option value="${date}" ${date===x.date?'selected':''}>${esc(dateLabel(date))}</option>`).join('')}</select></label><label for="booking-start">${t('開始時刻','Start time')}<select name="start" id="booking-start" aria-describedby="booking-error">${slots.map(start=>`<option value="${start}" ${start===x.start?'selected':''}>${clock(start)}</option>`).join('')}</select></label></div><p class="form-error" id="booking-error" role="status"></p><div class="dialog-actions">${openId?`<button type="button" class="danger" id="request-cancel">${t('予約を取消','Cancel booking')}</button>`:''}<button type="button" class="quiet" id="download-ics">📅 ${t('カレンダーに追加 (.ics)','Add to Calendar (.ics)')}</button><button type="button" class="quiet" id="close-booking">${t('閉じる','Close')}</button><button type="submit" class="primary">${t('反映する','Apply')}</button></div><div id="cancel-confirm" class="cancel-confirm" hidden><p>${t('この予約をキャンセルし、空き枠に戻しますか？','Cancel this booking and release its time slot?')}</p><button type="button" class="danger" id="confirm-cancel">${t('キャンセルを確定','Confirm cancellation')}</button> <button type="button" class="quiet" id="keep-booking">${t('予約を残す','Keep booking')}</button></div></form>`;
  const form=document.getElementById('booking-form');
  function update(){bookingDraft={...bookingDraft,person:form.elements.person.value,service:form.elements.service.value,date:form.elements.date.value,start:Number(form.elements.start.value)};const valid=available(bookingDraft.date,bookingDraft.start,services[bookingDraft.service].duration,openId);document.getElementById('booking-error').textContent=valid?'':t('この時間は他の予約または休憩・営業時間外と重なります。時間・日付・メニューを変更してください。','This time overlaps another booking, lunch or closing time. Change the time, date or service.');form.elements.start.setAttribute('aria-invalid',String(!valid));return valid;}
  form.addEventListener('change',update);
  form.addEventListener('submit',e=>{e.preventDefault();if(!update()){form.elements.start.focus();return;}if(openId){Object.assign(bookings.find(x=>x.id===openId),bookingDraft);changedId=openId;}else {changedId=nextId++;bookings.push({...bookingDraft,id:changedId,canceled:false});}day=bookingDraft.date;dialog.close();renderStats();renderBookings();document.getElementById('add-booking').focus();say('予約を反映しました。','Booking updated.');});
  document.getElementById('close-booking').addEventListener('click',()=>dialog.close());
   document.getElementById('download-ics').addEventListener('click',()=>{
    if(!update()){form.elements.start.focus();return;}
    const sName = pair(services[bookingDraft.service].label);
    const pName = pair(people[bookingDraft.person]);
    downloadIcs(bookingDraft.date, bookingDraft.start, services[bookingDraft.service].duration, `Wingscraft ${sName} (${pName})`, 'Wingscraft Booking Demo Consultation');
    say('デモ用カレンダーファイルのダウンロードを開始しました。','Started downloading a demo calendar file.');
   });
  if(openId){document.getElementById('request-cancel').addEventListener('click',()=>{document.getElementById('cancel-confirm').hidden=false;document.getElementById('confirm-cancel').focus();});document.getElementById('keep-booking').addEventListener('click',()=>{document.getElementById('cancel-confirm').hidden=true;document.getElementById('request-cancel').focus();});document.getElementById('confirm-cancel').addEventListener('click',()=>{const canceled=bookings.find(x=>x.id===openId);undoBooking={...canceled};canceled.canceled=true;changedId=canceled.id;dialog.close();renderStats();renderBookings();document.getElementById('add-booking').focus();say('予約をキャンセルしました。','Booking canceled.');});}
  update();
 }
 function render(){
  document.title=kind==='inquiries'?t('問い合わせ管理デモ — Wingscraft','Inquiry desk demo — Wingscraft'):t('予約管理デモ — Wingscraft','Booking desk demo — Wingscraft');
  document.getElementById('demo-language').setAttribute('aria-label',t('Switch to English','Switch to Japanese'));
  document.getElementById('back-to-top')?.setAttribute('aria-label',t('ページトップへ戻る','Back to top'));
  document.querySelector('nav').setAttribute('aria-label',t('デモ','Demos'));
  renderStats();if(kind==='inquiries')renderInquiries();else renderBookings();
  if(notice)feedback.textContent=pair(notice);renderUndo();
 }
 document.getElementById('demo-language').addEventListener('click',()=>{if(kind==='inquiries')captureInquiry();root.lang=root.lang==='ja'?'en':'ja';try{localStorage.setItem('wingscraft-language-choice',root.lang);}catch{}render();});
 document.getElementById('reset-demo').addEventListener('click',()=>resetDialog.showModal());
 document.getElementById('reset-cancel').addEventListener('click',()=>resetDialog.close());
 document.getElementById('reset-confirm').addEventListener('click',()=>{seed();resetDialog.close();render();say('サンプルの初期状態に戻しました。','Original sample data restored.');document.getElementById('reset-demo').focus();});
document.getElementById('undo-booking').addEventListener('click',()=>{if(!undoBooking)return;const x=undoBooking;if(!available(x.date,x.start,services[x.service].duration,x.id)){say('この枠に別の予約があるため、元に戻せません。','This slot has another booking. Cancellation cannot be undone yet.');return;}Object.assign(bookings.find(b=>b.id===x.id),x);day=x.date;changedId=x.id;undoBooking=null;renderStats();renderBookings();say('予約を元に戻しました。','Booking restored.');document.getElementById('add-booking').focus({preventScroll:true});});
 detailDialog.addEventListener('close',()=>{if(kind!=='inquiries')return;captureInquiry();renderList();const row=content.querySelector(`[data-inquiry="${active}"]`);row?.focus({preventScroll:true});if(mobile.matches)window.scrollTo({top:listScroll,behavior:'instant'});});
 mobile.addEventListener('change',()=>{captureInquiry();syncDetail();});
 const topBtn=document.getElementById('back-to-top');
 if(topBtn){
  window.addEventListener('scroll',()=>topBtn.classList.toggle('is-visible',window.scrollY>400),{passive:true});
  topBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
 }
 seed();render();
})();
