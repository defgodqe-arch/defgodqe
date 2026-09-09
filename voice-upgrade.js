/* defgodqe — premium Aura-2 voice experience */
(() => {
  const TTS = 'https://defgodqe-ai.defgodqe.workers.dev/tts';
  const VOICE_KEY = 'defgodqe:voice-settings:v2';
  const CLIENT_KEY = 'defgodqe:client-id:v1';

  const voices = [
    ['thalia','Thalia','Female • American','Clear, confident, energetic'],
    ['andromeda','Andromeda','Female • American','Casual, expressive, comfortable'],
    ['helena','Helena','Female • American','Caring, natural, friendly'],
    ['athena','Athena','Female • American','Calm, smooth, professional'],
    ['cora','Cora','Female • American','Smooth, melodic, caring'],
    ['aurora','Aurora','Female • American','Cheerful, expressive, energetic'],
    ['harmonia','Harmonia','Female • American','Empathetic, clear, calm'],
    ['hera','Hera','Female • American','Warm, smooth, professional'],
    ['juno','Juno','Female • American','Natural, engaging, melodic'],
    ['luna','Luna','Female • American','Friendly, natural, engaging'],
    ['minerva','Minerva','Female • American','Positive, friendly, natural'],
    ['ophelia','Ophelia','Female • American','Expressive, enthusiastic, cheerful'],
    ['callista','Callista','Female • American','Clear, energetic, professional'],
    ['electra','Electra','Female • American','Professional, engaging, knowledgeable'],
    ['asteria','Asteria','Female • American','Clear, confident, knowledgeable'],
    ['iris','Iris','Female • American','Cheerful, positive, approachable'],
    ['cordelia','Cordelia','Female • American','Warm, approachable, polite'],
    ['delia','Delia','Female • American','Friendly, cheerful, breathy'],
    ['janus','Janus','Female • American','Southern, smooth, trustworthy'],
    ['pandora','Pandora','Female • American','Expressive, conversational'],
    ['phoebe','Phoebe','Female • American','Bright, natural, friendly'],
    ['theia','Theia','Female • American','Warm, clear, confident'],
    ['apollo','Apollo','Male • American','Confident, comfortable, casual'],
    ['arcas','Arcas','Male • American','Natural, smooth, clear'],
    ['aries','Aries','Male • American','Warm, energetic, caring'],
    ['atlas','Atlas','Male • American','Enthusiastic, confident, friendly'],
    ['hermes','Hermes','Male • American','Expressive, engaging, professional'],
    ['jupiter','Jupiter','Male • American','Expressive, knowledgeable, baritone'],
    ['mars','Mars','Male • American','Smooth, patient, trustworthy'],
    ['neptune','Neptune','Male • American','Professional, patient, polite'],
    ['odysseus','Odysseus','Male • American','Calm, smooth, professional'],
    ['orion','Orion','Male • American','Approachable, calm, polite'],
    ['orpheus','Orpheus','Male • American','Deep, expressive, cinematic'],
    ['hyperion','Hyperion','Male • Australian','Warm, caring, empathetic'],
    ['draco','Draco','Male • British','Warm, trustworthy, baritone'],
    ['zeus','Zeus','Male • American','Strong, confident, commanding']
  ];

  const read = () => { try { return JSON.parse(localStorage.getItem(VOICE_KEY) || '{}'); } catch { return {}; } };
  const write = v => { try { localStorage.setItem(VOICE_KEY, JSON.stringify({...read(), ...v})); } catch {} };
  const client = () => localStorage.getItem(CLIENT_KEY) || 'anonymous';

  function style() {
    if (document.getElementById('df-premium-voice-style')) return;
    const s = document.createElement('style');
    s.id = 'df-premium-voice-style';
    s.textContent = `
      #dfPremiumVoice{margin-top:10px;padding:12px;border:1px solid rgba(250,204,21,.16);border-radius:14px;background:rgba(250,204,21,.035)}
      .df-vtitle{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#facc15;margin-bottom:8px}
      .df-vgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;max-height:330px;overflow:auto;padding-right:2px}
      .df-vvoice{padding:9px 10px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#151b26;color:#dbe4ef;text-align:left;cursor:pointer}
      .df-vvoice:hover{border-color:rgba(250,204,21,.4);background:rgba(250,204,21,.07)}
      .df-vvoice.active{border-color:#facc15;background:rgba(250,204,21,.11)}
      .df-vvoice b{display:block;font-size:12px}.df-vvoice span{display:block;font-size:10px;color:#94a3b8;margin-top:2px}.df-vvoice em{display:block;font-size:9px;color:#64748b;margin-top:3px;font-style:normal}
      .df-vactions{display:flex;gap:7px;margin-top:9px}.df-vactions button{flex:1}
      @media(max-width:640px){.df-vgrid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  async function preview(speaker) {
    const text = 'Hi, I\'m defgodqe. This is my new voice. How does this sound?';
    try {
      const r = await fetch(TTS, {method:'POST', headers:{'Content-Type':'application/json','X-Defgodqe-Client':client()}, body:JSON.stringify({text,speaker})});
      if (!r.ok) throw new Error('Voice preview failed');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = Number(read().volume ?? 1);
      audio.playbackRate = Number(read().rate ?? .98);
      audio.onended = () => URL.revokeObjectURL(url);
      window.__defgodqeVoicePreview?.pause?.();
      window.__defgodqeVoicePreview = audio;
      await audio.play();
    } catch { /* keep the main chat usable if preview fails */ }
  }

  function enhance() {
    const select = document.getElementById('dfCloudVoice');
    if (!select || document.getElementById('dfPremiumVoice')) return;
    style();
    const current = read().speaker || select.value || 'luna';
    select.innerHTML = voices.map(v => `<option value="${v[0]}">${v[1]} — ${v[2]}</option>`).join('');
    select.value = voices.some(v => v[0] === current) ? current : 'luna';
    select.onchange = () => write({speaker:select.value});

    const box = document.createElement('div');
    box.id = 'dfPremiumVoice';
    box.innerHTML = `<div class="df-vtitle">Premium voice library</div><div class="df-small" style="margin-bottom:8px">Choose a voice and preview it before using it for replies.</div><div class="df-vgrid"></div><div class="df-vactions"><button class="df-btn" id="dfVoicePreview">🔊 Preview selected</button><button class="df-btn" id="dfVoiceRandom">✨ Surprise me</button></div>`;
    select.parentElement?.parentElement?.appendChild(box);
    const grid = box.querySelector('.df-vgrid');
    const render = () => {
      const chosen = read().speaker || select.value || 'luna';
      grid.innerHTML = voices.map(v => `<button class="df-vvoice ${v[0]===chosen?'active':''}" data-v="${v[0]}"><b>${v[1]}</b><span>${v[2]}</span><em>${v[3]}</em></button>`).join('');
      grid.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { const speaker=b.dataset.v; select.value=speaker; write({speaker}); render(); });
    };
    render();
    box.querySelector('#dfVoicePreview').onclick = () => preview(select.value);
    box.querySelector('#dfVoiceRandom').onclick = () => { const speaker=voices[Math.floor(Math.random()*voices.length)][0]; select.value=speaker; write({speaker}); render(); preview(speaker); };
  }

  const observer = new MutationObserver(enhance);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(enhance,500);
  setTimeout(enhance,1500);
})();
