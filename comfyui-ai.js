/* defgodqe — ComfyUI multimodal bridge
 * Chat remains Qwen. ComfyUI handles image/video generation and can host Qwen3-TTS.
 * Configure the ComfyUI URL in the AI Studio panel (default: http://127.0.0.1:8188).
 */
(() => {
  'use strict';
  if (window.__defgodqeComfyUI) return;
  window.__defgodqeComfyUI = true;

  const KEY = 'defgodqe:comfyui';
  const defaults = {
    endpoint: 'http://127.0.0.1:8188',
    clientId: 'defgodqe-web',
    imageWorkflow: '',
    videoWorkflow: '',
    ttsEndpoint: 'http://127.0.0.1:8765'
  };
  let state = load();
  function load(){ try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaults}} }
  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
  function base(){ return String(state.endpoint||defaults.endpoint).replace(/\/$/,''); }
  function esc(v){ return String(v).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  async function health(){
    const r = await fetch(base() + '/system_stats');
    if(!r.ok) throw new Error('ComfyUI HTTP '+r.status);
    return r.json();
  }

  async function queue(workflow){
    if(!workflow || typeof workflow !== 'object') throw new Error('A ComfyUI workflow is not configured.');
    const r = await fetch(base() + '/prompt', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({prompt:workflow, client_id:state.clientId})
    });
    const text = await r.text();
    if(!r.ok) throw new Error('ComfyUI queue failed ('+r.status+'): '+text.slice(0,400));
    return JSON.parse(text);
  }

  async function run(kind, prompt){
    const raw = kind === 'image' ? state.imageWorkflow : state.videoWorkflow;
    if(!raw) throw new Error(kind+' workflow is not configured yet. Import the matching ComfyUI workflow in AI Studio.');
    let workflow;
    try { workflow = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { throw new Error('The '+kind+' workflow JSON is invalid.'); }
    // Replace common prompt placeholders without requiring a particular node layout.
    const json = JSON.stringify(workflow).replaceAll('{{PROMPT}}', String(prompt||''));
    return queue(JSON.parse(json));
  }

  function styles(){
    if(document.getElementById('dg-comfy-style')) return;
    const s=document.createElement('style'); s.id='dg-comfy-style'; s.textContent=`
      #dg-comfy-root{position:fixed;inset:0;z-index:2147482000;display:none;background:rgba(0,0,0,.72);backdrop-filter:blur(10px);padding:18px;box-sizing:border-box;align-items:center;justify-content:center}
      #dg-comfy-panel{width:min(760px,100%);max-height:min(90vh,900px);overflow:auto;border:1px solid rgba(250,204,21,.28);border-radius:22px;background:#0d1017;color:#eee;box-shadow:0 25px 90px rgba(0,0,0,.65);padding:20px}
      #dg-comfy-panel h2{margin:0;color:#facc15;font-size:20px}#dg-comfy-panel .sub{color:#8d95a5;font-size:12px;margin:4px 0 16px}
      .dg-c-row{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.dg-c-row>*{flex:1;min-width:150px}
      .dg-c-input,.dg-c-area{width:100%;box-sizing:border-box;background:#151a23;color:#eee;border:1px solid #2a303c;border-radius:11px;padding:10px;font:inherit}.dg-c-area{min-height:120px;resize:vertical;font:12px ui-monospace,monospace}
      .dg-c-btn{border:1px solid rgba(250,204,21,.38);background:#171a20;color:#facc15;border-radius:11px;padding:9px 12px;cursor:pointer}.dg-c-btn:hover{background:#232730}.dg-c-primary{background:#facc15;color:#111;border-color:#facc15;font-weight:800}
      .dg-c-status{min-height:20px;color:#8d95a5;font-size:12px;margin-top:10px;white-space:pre-wrap}.dg-c-tabs{display:flex;gap:7px;margin:14px 0}.dg-c-tab.active{background:#facc15;color:#111}.dg-c-section{display:none}.dg-c-section.active{display:block}
      #dg-comfy-launch{position:fixed;right:18px;bottom:72px;z-index:2147481000;border:1px solid rgba(250,204,21,.45);background:rgba(13,16,23,.94);color:#facc15;border-radius:13px;padding:9px 12px;box-shadow:0 8px 30px rgba(0,0,0,.35);cursor:pointer;font-weight:700}
    `; document.head.appendChild(s);
  }

  function mount(){
    styles();
    if(document.getElementById('dg-comfy-root')) return;
    const root=document.createElement('div'); root.id='dg-comfy-root';
    root.innerHTML=`<div id="dg-comfy-panel">
      <div style="display:flex;align-items:center;gap:10px"><div style="flex:1"><h2>defgodqe AI Studio</h2><div class="sub">ComfyUI multimodal generation — Qwen image + Qwen3-TTS + Stable Video Infinity 2.0 Pro</div></div><button class="dg-c-btn" id="dg-c-close">Close</button></div>
      <div class="dg-c-tabs"><button class="dg-c-btn dg-c-tab active" data-tab="generate">Generate</button><button class="dg-c-btn dg-c-tab" data-tab="settings">Settings</button></div>
      <section class="dg-c-section active" id="dg-c-generate">
        <div class="dg-c-row"><button class="dg-c-btn" data-action="image">🎨 Generate image</button><button class="dg-c-btn" data-action="video">🎬 Generate video</button><button class="dg-c-btn" data-action="tts">🔊 Speak with Qwen3-TTS</button></div>
        <textarea id="dg-c-prompt" class="dg-c-input" rows="4" placeholder="Describe what you want to create…"></textarea>
        <div class="dg-c-status" id="dg-c-status">Ready.</div>
      </section>
      <section class="dg-c-section" id="dg-c-settings">
        <label style="font-size:12px;color:#9ca3af">ComfyUI endpoint</label><input id="dg-c-endpoint" class="dg-c-input" placeholder="http://127.0.0.1:8188">
        <label style="font-size:12px;color:#9ca3af;display:block;margin-top:10px">Qwen3-TTS bridge endpoint</label><input id="dg-c-tts" class="dg-c-input" placeholder="http://127.0.0.1:8765">
        <label style="font-size:12px;color:#9ca3af;display:block;margin-top:10px">Qwen-Image ComfyUI workflow JSON — use {{PROMPT}} where the prompt should go</label><textarea id="dg-c-image-wf" class="dg-c-area"></textarea>
        <label style="font-size:12px;color:#9ca3af;display:block;margin-top:10px">SVI 2.0 Pro ComfyUI workflow JSON — use {{PROMPT}} where the prompt should go</label><textarea id="dg-c-video-wf" class="dg-c-area"></textarea>
        <div class="dg-c-row"><button class="dg-c-btn dg-c-primary" id="dg-c-save">Save settings</button><button class="dg-c-btn" id="dg-c-test">Test ComfyUI</button></div>
      </section>
    </div>`;
    document.body.appendChild(root);
    const launch=document.createElement('button'); launch.id='dg-comfy-launch'; launch.textContent='✦ AI Studio'; document.body.appendChild(launch);
    const $=id=>root.querySelector('#'+id);
    $('dg-c-endpoint').value=state.endpoint; $('dg-c-tts').value=state.ttsEndpoint; $('dg-c-image-wf').value=state.imageWorkflow; $('dg-c-video-wf').value=state.videoWorkflow;
    launch.onclick=()=>root.style.display='flex'; $('dg-c-close').onclick=()=>root.style.display='none'; root.onclick=e=>{if(e.target===root)root.style.display='none'};
    root.querySelectorAll('.dg-c-tab').forEach(b=>b.onclick=()=>{root.querySelectorAll('.dg-c-tab').forEach(x=>x.classList.remove('active'));root.querySelectorAll('.dg-c-section').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('dg-c-'+b.dataset.tab).classList.add('active')});
    $('dg-c-save').onclick=()=>{state.endpoint=$('dg-c-endpoint').value.trim()||defaults.endpoint;state.ttsEndpoint=$('dg-c-tts').value.trim()||defaults.ttsEndpoint;state.imageWorkflow=$('dg-c-image-wf').value;state.videoWorkflow=$('dg-c-video-wf').value;save();$('dg-c-status').textContent='Settings saved.'};
    $('dg-c-test').onclick=async()=>{ $('dg-c-status').textContent='Testing ComfyUI…'; try{const x=await health();$('dg-c-status').textContent='✓ ComfyUI connected. '+(x?.system?.os||'Ready');}catch(e){$('dg-c-status').textContent='✕ '+e.message+'\nIf this app is hosted remotely, ComfyUI must be reachable over HTTPS and allow CORS.'} };
    root.querySelectorAll('[data-action]').forEach(b=>b.onclick=async()=>{
      const action=b.dataset.action, p=$('dg-c-prompt').value.trim(); if(!p){$('dg-c-status').textContent='Enter a prompt first.';return;}
      b.disabled=true; const old=b.textContent; b.textContent='Working…';
      try{
        if(action==='tts'){
          const r=await fetch(state.ttsEndpoint.replace(/\/$/,'')+'/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:p,model:'1.7B',language:'Auto',speaker:'Ryan'})});
          if(!r.ok) throw new Error('Qwen3-TTS HTTP '+r.status); const blob=await r.blob(); const url=URL.createObjectURL(blob); const a=new Audio(url); await a.play(); $('dg-c-status').textContent='✓ Qwen3-TTS is speaking.';
        } else { const r=await run(action,p); $('dg-c-status').textContent='✓ Queued in ComfyUI. Prompt ID: '+(r.prompt_id||'unknown'); }
      }catch(e){$('dg-c-status').textContent='✕ '+e.message}finally{b.disabled=false;b.textContent=old}
    });
  }

  window.defgodqeComfyUI={get settings(){return {...state}},save(next={}){Object.assign(state,next);save()},health,queue,run,open:()=>{mount();document.getElementById('dg-comfy-root').style.display='flex'}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
