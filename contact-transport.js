'use strict';
// The endpoint is public. Never put a mail-service API key in this file.
window.WingscraftTransport = Object.freeze({
 validEndpoint(value) { return typeof value==='string' && /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(value); },
 async submit(endpoint, data, signal) {
  if (!this.validEndpoint(endpoint)) throw new Error('configuration');
  const response = await fetch(endpoint, {method:'POST', headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify(data),signal,credentials:'omit',referrerPolicy:'strict-origin-when-cross-origin'});
  if (response.status===429) throw new Error('rate-limit');
  if (!response.ok) throw new Error(response.status>=500?'unconfirmed':'rejected');
  let result;
  try { result=await response.json(); } catch { throw new Error('unconfirmed'); }
  if (!result || result.ok!==true) throw new Error('unconfirmed');
  return {accepted:true};
 }
});
