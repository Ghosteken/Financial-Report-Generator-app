const form = document.getElementById('reportForm');
const chips = Array.from(document.querySelectorAll('.chip'));
const yearInput = document.getElementById('year');
const yrInc = document.getElementById('yrInc');
const yrDec = document.getElementById('yrDec');
const clientInput = document.getElementById('client');
const message = document.getElementById('message');
const previewBtn = document.getElementById('preview');
const recentList = document.getElementById('recentClients');

// Small helper: persist recent clients (bonus feature)
const RECENT_KEY = 'recentClients_v1';
function loadRecent(){
  try{
    const raw = localStorage.getItem(RECENT_KEY);
    return raw?JSON.parse(raw):[];
  }catch(e){return[]}
}
function saveRecent(name){
  if(!name) return;
  const list = loadRecent();
  const normalized = name.trim();
  if(!normalized) return;
  // dedupe and keep latest 5
  const filtered = [normalized,...list.filter(x=>x!==normalized)].slice(0,5);
  localStorage.setItem(RECENT_KEY,JSON.stringify(filtered));
  renderRecent();
}
function renderRecent(){
  recentList.innerHTML='';
  loadRecent().forEach(name=>{
    const li = document.createElement('li');
    li.textContent = name;
    const btn = document.createElement('button');
    btn.textContent = 'Use';
    btn.type='button';
    btn.addEventListener('click',()=>{clientInput.value=name});
    li.appendChild(btn);
    recentList.appendChild(li);
  });
}
renderRecent();

// segmented control logic
let selectedReport = null;
chips.forEach(chip=>{
  chip.addEventListener('click',()=>{
    chips.forEach(c=>c.setAttribute('aria-pressed','false'));
    chip.setAttribute('aria-pressed','true');
    selectedReport = chip.dataset.value;
  })
});

yrInc.addEventListener('click',()=>{ yearInput.value = Number(yearInput.value||2025) + 1 });
yrDec.addEventListener('click',()=>{ yearInput.value = Math.max(2000, Number(yearInput.value||2025) - 1) });

// prepareAgentRequest: collects inputs, validates, returns JSON payload
export function prepareAgentRequest(){
  const year = String(yearInput.value||'').trim();
  const client = String(clientInput.value||'').trim();
  const reportType = selectedReport;

  const errors = [];
  if(!reportType) errors.push('Select a report type');
  if(!year || Number.isNaN(Number(year))) errors.push('Enter a valid reporting year');
  if(!client) errors.push('Enter a client name or ID');

  if(errors.length) return { ok:false, errors };

  const payload = {
    reportType,
    reportingYear: Number(year),
    client,
    requestedAt: new Date().toISOString()
  };

  // save recent
  saveRecent(client);

  return { ok:true, payload };
}

// form submit handler
form.addEventListener('submit',(e)=>{
  e.preventDefault();
  const res = prepareAgentRequest();
  if(!res.ok){
    message.textContent = res.errors.join('; ');
    message.style.color = 'var(--danger)';
    return;
  }

  message.textContent = 'Preparing request...';
  message.style.color = 'var(--muted)';

  // simulate sending to backend
  setTimeout(async ()=>{
    message.textContent = `Payload ready — Report: ${res.payload.reportType} (${res.payload.reportingYear}) for ${res.payload.client}`;
    message.style.color = 'var(--accent)';

    // If a runtime API base is configured on window (injected at deploy time), use it.
    // The deploy process should create a small config.js that sets window.API_BASE.
    // Determine API base:
    // - If window.API_BASE is defined (including empty string), use it.
    // - Otherwise, if running on localhost, use local API at http://localhost:5000 for dev.
    // - Otherwise assume same-origin (empty string) in production.
    const cfg = (typeof window.API_BASE !== 'undefined') ? window.API_BASE : ((typeof window.__API_BASE__ !== 'undefined') ? window.__API_BASE__ : undefined);
    let API_BASE;
    if (typeof cfg !== 'undefined') {
      API_BASE = String(cfg).replace(/\/$/, '');
    } else if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      API_BASE = 'http://localhost:5000';
    } else {
      API_BASE = '';
    }
    const SEND_TO_API = true; // always attempt to send; endpoint chosen by API_BASE
    if(SEND_TO_API){
      message.textContent = `Sending to API: ${API_BASE || '<same-origin>'}...`;
      try{
        const endpoint = (API_BASE === '') ? '/reports' : `${API_BASE}/reports`;
        const r = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(res.payload)
        });

        // Be defensive about response type: server may return HTML (error page) instead of JSON
        const ct = r.headers.get('content-type') || '';
        let body = null;
        if (ct.includes('application/json') || ct.includes('application/problem+json')) {
          try {
            body = await r.json();
          } catch (parseErr) {
            const txt = await r.text();
            console.error('Failed to parse JSON response', parseErr, txt);
            message.textContent = 'Server returned invalid JSON: see console for details';
            message.style.color = 'var(--danger)';
            return;
          }
        } else {
          // fallback: read text (HTML error page or plain text)
          body = await r.text();
        }

        if (r.ok) {
          // body might be text or object
          if (typeof body === 'string') {
            // unlikely for success but handle
            message.textContent = `Report generated (server response): ${body}`;
            message.style.color = 'var(--accent)';
          } else {
            message.textContent = `Report generated: ${body.fileName}`;
            message.style.color = 'var(--accent)';
            const downloadUrl = (body.file && body.file.startsWith('/')) ? ((API_BASE === '') ? body.file : `${API_BASE}${body.file}`) : body.file;
            window.open(downloadUrl || '', '_blank');
          }
        } else {
          // error — body may be JSON object or HTML/text string
          if (typeof body === 'string') {
            message.textContent = `Error from server: ${body.substring(0, 300)}`;
            console.error('Server error (text):', body);
          } else if (body && body.error) {
            message.textContent = body.error;
            console.error('Server error (json):', body);
          } else {
            message.textContent = 'Unknown server error';
            console.error('Server error unknown response:', body);
          }
          message.style.color = 'var(--danger)';
        }
      }catch(err){
        message.textContent = 'Failed to send to API: '+err.message;
        message.style.color = 'var(--danger)';
      }
    }
  },600);
});

previewBtn.addEventListener('click',()=>{
  const res = prepareAgentRequest();
  if(!res.ok){
    message.textContent = res.errors.join('; ');
    message.style.color = 'var(--danger)';
    return;
  }
  // show JSON in a new window (quick preview)
  const w = window.open('','_blank','width=420,height=400');
  w.document.body.style.background='#071021';
  w.document.body.style.color='#cfe9dd';
  const pre = w.document.createElement('pre');
  pre.textContent = JSON.stringify(res.payload,null,2);
  w.document.body.appendChild(pre);
});

// expose for console testing
window.prepareAgentRequest = prepareAgentRequest;