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
    // Respect an injected API_BASE variable even if it's an empty string (meaning same-origin)
    const cfg = (typeof window.API_BASE !== 'undefined') ? window.API_BASE : ((typeof window.__API_BASE__ !== 'undefined') ? window.__API_BASE__ : null);
    const API_BASE = (cfg !== null) ? String(cfg).replace(/\/$/, '') : 'http://localhost:5000';
    const SEND_TO_API = (API_BASE !== null);
    if(SEND_TO_API){
      message.textContent = `Sending to API: ${API_BASE || '<same-origin>'}...`;
      try{
        const endpoint = (API_BASE === '') ? '/reports' : `${API_BASE}/reports`;
        const r = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(res.payload)
        });
        const body = await r.json();
        if(r.ok){
          message.textContent = `Report generated: ${body.fileName}`;
          message.style.color = 'var(--accent)';
          // open download link in new tab
          const downloadUrl = (body.file && body.file.startsWith('/')) ? ((API_BASE === '') ? body.file : `${API_BASE}${body.file}`) : body.file;
          window.open(downloadUrl || '', '_blank');
        } else {
          message.textContent = body.error || JSON.stringify(body);
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