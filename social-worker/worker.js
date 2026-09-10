const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', ...extra }
});

const text = (body, status = 200, extra = {}) => new Response(body, {
  status,
  headers: { 'access-control-allow-origin': '*', ...extra }
});

const id = () => crypto.randomUUID();
const now = () => Date.now();
const usernameRe = /^[a-z0-9_]{3,24}$/;

function cors() {
  return { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS', 'access-control-allow-headers': 'content-type,x-user-id' };
}

function userId(req) {
  return req.headers.get('x-user-id') || '';
}

async function bodyJson(req) {
  try { return await req.json(); } catch { return null; }
}

async function ensureUser(env, uid, username = null) {
  if (!uid) return null;
  let row = await env.DB.prepare('SELECT * FROM users WHERE id=?1').bind(uid).first();
  if (row) return row;
  if (!username || !usernameRe.test(username)) return null;
  try {
    await env.DB.prepare('INSERT INTO users(id,username,display_name,created_at) VALUES(?1,?2,?2,?3)').bind(uid, username.toLowerCase(), now()).run();
  } catch (_) {}
  return await env.DB.prepare('SELECT * FROM users WHERE id=?1').bind(uid).first();
}

function publicUser(u) {
  return u ? { id:u.id, username:u.username, display_name:u.display_name, bio:u.bio, avatar_url:u.avatar_url } : null;
}

async function handle(req, env) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const uid = userId(req);

  if (req.method === 'OPTIONS') return new Response(null, { status:204, headers:cors() });
  if (path === '/health') return json({ ok:true, service:'defgodqe social' },200,cors());

  if (!env.DB || !env.MEDIA) return json({ error:'Social backend is not configured. Add D1 binding DB and R2 binding MEDIA.' },503,cors());

  if (req.method === 'POST' && path === '/api/users') {
    const b = await bodyJson(req);
    const username = String(b?.username || '').trim().toLowerCase();
    if (!uid || !usernameRe.test(username)) return json({error:'Use x-user-id and a username with 3-24 lowercase letters, numbers or underscores.'},400,cors());
    const existing = await env.DB.prepare('SELECT * FROM users WHERE username=?1').bind(username).first();
    if (existing && existing.id !== uid) return json({error:'Username already taken.'},409,cors());
    const u = await ensureUser(env,uid,username);
    return json(publicUser(u),201,cors());
  }

  if (req.method === 'GET' && path === '/api/feed') {
    const result = await env.DB.prepare(`SELECT v.*,u.username,u.display_name,
      (SELECT COUNT(*) FROM likes l WHERE l.video_id=v.id) AS likes,
      EXISTS(SELECT 1 FROM likes ml WHERE ml.video_id=v.id AND ml.user_id=?1) AS liked,
      EXISTS(SELECT 1 FROM follows f WHERE f.following_id=v.user_id AND f.follower_id=?1) AS following
      FROM videos v JOIN users u ON u.id=v.user_id ORDER BY v.created_at DESC LIMIT 100`).bind(uid).all();
    return json({ videos:(result.results||[]).map(v=>({ id:v.id,user:v.username,userId:v.user_id,title:v.title,tags:v.tags,likes:Number(v.likes||0),liked:Boolean(v.liked),following:Boolean(v.following),url:`${url.origin}/media/${encodeURIComponent(v.object_key)}`,at:v.created_at })) },200,cors());
  }

  if (req.method === 'GET' && path.startsWith('/media/')) {
    const key = decodeURIComponent(path.slice('/media/'.length));
    const object = await env.MEDIA.get(key);
    if (!object) return text('Not found',404,cors());
    const headers = new Headers(cors());
    headers.set('content-type', object.httpMetadata?.contentType || 'video/mp4');
    headers.set('cache-control','public, max-age=31536000, immutable');
    if (object.size != null) headers.set('content-length',String(object.size));
    return new Response(object.body,{headers});
  }

  if (req.method === 'POST' && path === '/api/videos') {
    const u = await ensureUser(env,uid);
    if (!u) return json({error:'Create a profile first.'},401,cors());
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return json({error:'Missing video file.'},400,cors());
    if (!['video/mp4','video/webm','video/quicktime'].includes(file.type)) return json({error:'Only MP4, WebM or MOV videos are supported.'},400,cors());
    const max = 50 * 1024 * 1024;
    if (file.size > max) return json({error:'Video is too large. Maximum is 50 MB.'},413,cors());
    const videoId=id();
    const key=`videos/${u.id}/${videoId}.${file.type==='video/webm'?'webm':file.type==='video/quicktime'?'mov':'mp4'}`;
    await env.MEDIA.put(key,file.stream(),{httpMetadata:{contentType:file.type}});
    await env.DB.prepare('INSERT INTO videos(id,user_id,title,tags,object_key,created_at) VALUES(?1,?2,?3,?4,?5,?6)')
      .bind(videoId,u.id,String(form.get('title')||'New short').slice(0,100),String(form.get('tags')||'').slice(0,200),key,now()).run();
    return json({ok:true,id:videoId},201,cors());
  }

  const likeMatch=path.match(/^\/api\/videos\/([^/]+)\/like$/);
  if (req.method==='POST' && likeMatch) {
    if (!uid) return json({error:'Missing x-user-id.'},401,cors());
    const vid=likeMatch[1];
    const existing=await env.DB.prepare('SELECT 1 FROM likes WHERE video_id=?1 AND user_id=?2').bind(vid,uid).first();
    if(existing) await env.DB.prepare('DELETE FROM likes WHERE video_id=?1 AND user_id=?2').bind(vid,uid).run();
    else await env.DB.prepare('INSERT INTO likes(video_id,user_id,created_at) VALUES(?1,?2,?3)').bind(vid,uid,now()).run();
    return json({liked:!existing},200,cors());
  }

  const followMatch=path.match(/^\/api\/users\/([^/]+)\/follow$/);
  if (req.method==='POST' && followMatch) {
    if(!uid) return json({error:'Missing x-user-id.'},401,cors());
    const target=followMatch[1]; if(target===uid) return json({error:'You cannot follow yourself.'},400,cors());
    const exists=await env.DB.prepare('SELECT 1 FROM follows WHERE follower_id=?1 AND following_id=?2').bind(uid,target).first();
    if(exists) await env.DB.prepare('DELETE FROM follows WHERE follower_id=?1 AND following_id=?2').bind(uid,target).run();
    else await env.DB.prepare('INSERT INTO follows(follower_id,following_id,created_at) VALUES(?1,?2,?3)').bind(uid,target,now()).run();
    return json({following:!exists},200,cors());
  }

  if (req.method==='GET' && path==='/api/users') {
    const q=String(url.searchParams.get('q')||'').trim().toLowerCase();
    const r=await env.DB.prepare('SELECT * FROM users WHERE username LIKE ?1 ORDER BY username LIMIT 30').bind(`%${q}%`).all();
    return json({users:(r.results||[]).map(publicUser)},200,cors());
  }

  if (req.method==='GET' && path==='/api/messages') {
    if(!uid) return json({error:'Missing x-user-id.'},401,cors());
    const r=await env.DB.prepare(`SELECT m.*,s.username sender_username,r.username receiver_username FROM messages m JOIN users s ON s.id=m.sender_id JOIN users r ON r.id=m.receiver_id WHERE m.sender_id=?1 OR m.receiver_id=?1 ORDER BY m.created_at ASC LIMIT 500`).bind(uid).all();
    return json({messages:r.results||[]},200,cors());
  }

  if (req.method==='POST' && path==='/api/messages') {
    if(!uid) return json({error:'Missing x-user-id.'},401,cors());
    const b=await bodyJson(req); const receiver=String(b?.receiver_id||''); const message=String(b?.body||'').trim();
    if(!receiver || !message || message.length>2000) return json({error:'receiver_id and a 1-2000 character message are required.'},400,cors());
    const blocked=await env.DB.prepare('SELECT 1 FROM blocks WHERE (blocker_id=?1 AND blocked_id=?2) OR (blocker_id=?2 AND blocked_id=?1)').bind(uid,receiver).first();
    if(blocked) return json({error:'Messaging is unavailable for this user.'},403,cors());
    const mid=id(); await env.DB.prepare('INSERT INTO messages(id,sender_id,receiver_id,body,created_at) VALUES(?1,?2,?3,?4,?5)').bind(mid,uid,receiver,message,now()).run();
    return json({ok:true,id:mid},201,cors());
  }

  const delMatch=path.match(/^\/api\/videos\/([^/]+)$/);
  if(req.method==='DELETE' && delMatch){
    if(!uid)return json({error:'Missing x-user-id.'},401,cors());
    const v=await env.DB.prepare('SELECT * FROM videos WHERE id=?1 AND user_id=?2').bind(delMatch[1],uid).first();
    if(!v)return json({error:'Video not found.'},404,cors());
    await env.DB.prepare('DELETE FROM videos WHERE id=?1').bind(v.id).run(); await env.MEDIA.delete(v.object_key);
    return json({ok:true},200,cors());
  }

  const reportMatch=path.match(/^\/api\/videos\/([^/]+)\/report$/);
  if(req.method==='POST' && reportMatch){
    if(!uid)return json({error:'Missing x-user-id.'},401,cors()); const b=await bodyJson(req); const reason=String(b?.reason||'other').slice(0,200);
    await env.DB.prepare('INSERT INTO reports(id,reporter_id,video_id,reason,created_at) VALUES(?1,?2,?3,?4,?5)').bind(id(),uid,reportMatch[1],reason,now()).run();
    return json({ok:true},201,cors());
  }

  const blockMatch=path.match(/^\/api\/users\/([^/]+)\/block$/);
  if(req.method==='POST' && blockMatch){
    if(!uid)return json({error:'Missing x-user-id.'},401,cors()); const target=blockMatch[1];
    const exists=await env.DB.prepare('SELECT 1 FROM blocks WHERE blocker_id=?1 AND blocked_id=?2').bind(uid,target).first();
    if(exists) await env.DB.prepare('DELETE FROM blocks WHERE blocker_id=?1 AND blocked_id=?2').bind(uid,target).run(); else await env.DB.prepare('INSERT INTO blocks(blocker_id,blocked_id,created_at) VALUES(?1,?2,?3)').bind(uid,target,now()).run();
    return json({blocked:!exists},200,cors());
  }

  return json({error:'Not found'},404,cors());
}

export default { async fetch(req,env){ try{return await handle(req,env);}catch(err){console.error(err);return json({error:'Internal server error'},500,cors());} } };
